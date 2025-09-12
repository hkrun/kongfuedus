import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: '缺少 Stripe 签名' },
      { status: 400 }
    );
  }

  // 检查项目ID环境变量
  if (!process.env.PROJECT_ID) {
    console.error('PROJECT_ID 环境变量未设置');
    return NextResponse.json(
      { error: '项目配置错误' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook 签名验证失败' },
      { status: 400 }
    );
  }

  try {
    // 记录收到的事件类型
    console.log('🎉 收到Stripe webhook事件:', event.type);
    console.log('📅 事件时间:', new Date().toLocaleString('zh-CN'));
    console.log('🔍 项目ID:', process.env.PROJECT_ID);
    
    // 项目过滤函数 - 临时放宽限制以便调试
    const isProjectEvent = (eventData: any) => {
      console.log('🔍 开始项目事件过滤检查...');
      
      // 检查各种可能的metadata位置
      const metadata = eventData.metadata || {};
      const subscriptionMetadata = eventData.subscription?.metadata || {};
      const customerMetadata = eventData.customer?.metadata || {};
      
      console.log('📋 元数据检查:');
      console.log('  - 主元数据:', JSON.stringify(metadata, null, 2));
      console.log('  - 订阅元数据:', JSON.stringify(subscriptionMetadata, null, 2));
      console.log('  - 客户元数据:', JSON.stringify(customerMetadata, null, 2));
      
      const projectId = metadata.projectId || subscriptionMetadata.projectId || customerMetadata.projectId;
      const envProjectId = process.env.PROJECT_ID;
      
      console.log('🔍 项目ID检查:');
      console.log('  - 事件中的项目ID:', projectId);
      console.log('  - 环境变量中的项目ID:', envProjectId);
      
      // 临时放宽项目ID检查，以便调试
      if (!projectId) {
        console.log('⚠️ 事件缺少项目ID，但继续处理以便调试');
        return true;
      }
      
      if (projectId !== envProjectId) {
        console.log(`⚠️ 事件项目ID不匹配: ${projectId} vs ${envProjectId}，但继续处理以便调试`);
        return true;
      }
      
      console.log(`✅ 事件项目ID匹配: ${projectId}，继续处理`);
      return true;
    };

    switch (event.type) {
      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('=== 订阅创建事件 ===');
        console.log('🎯 收到订阅创建事件，开始处理...');
        console.log('订阅ID:', subscription.id);
        console.log('客户ID:', subscription.customer);
        console.log('状态:', subscription.status);
        console.log('当前期间开始:', new Date((subscription as any).current_period_start * 1000).toLocaleString('zh-CN'));
        console.log('当前期间结束:', new Date((subscription as any).current_period_end * 1000).toLocaleString('zh-CN'));
        console.log('试用期结束:', (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toLocaleString('zh-CN') : '无试用期');
        console.log('价格ID:', subscription.items?.data[0]?.price?.id);
        console.log('📋 订阅元数据:', JSON.stringify(subscription.metadata, null, 2));
        console.log('📋 客户元数据:', JSON.stringify((subscription as any).customer?.metadata, null, 2));
        
        if (!isProjectEvent(subscription)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 创建或更新订阅记录
        try {
          const subscriptionData = {
            userId: subscription.metadata?.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            status: subscription.status,
            planType: subscription.metadata?.planType || 'MONTHLY', // 从元数据获取或使用默认值
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
            cancelAtPeriodEnd: false,
            projectId: subscription.metadata?.projectId,
          };
          
          await prisma.platformSubscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            update: subscriptionData,
            create: subscriptionData,
          });
          
          console.log('✅ 订阅记录创建/更新成功');
          
          // 注意：免费试用记录现在在 checkout.session.completed 事件中创建
          // 这里只处理订阅记录的创建
        } catch (error) {
          console.error('❌ 创建/更新订阅记录失败:', error);
        }
        
        console.log('=== 订阅创建事件处理完成 ===');
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('=== 订阅更新事件 ===');
        console.log('订阅ID:', updatedSubscription.id);
        console.log('客户ID:', updatedSubscription.customer);
        console.log('状态:', updatedSubscription.status);
        console.log('当前期间开始:', new Date((updatedSubscription as any).current_period_start * 1000).toLocaleString('zh-CN'));
        console.log('当前期间结束:', new Date((updatedSubscription as any).current_period_end * 1000).toLocaleString('zh-CN'));
        console.log('试用期结束:', (updatedSubscription as any).trial_end ? new Date((updatedSubscription as any).trial_end * 1000).toLocaleString('zh-CN') : '无试用期');
        console.log('价格ID:', updatedSubscription.items?.data[0]?.price?.id);
        console.log('元数据:', updatedSubscription.metadata);
        
        if (!isProjectEvent(updatedSubscription)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 更新订阅记录
        try {
          await prisma.platformSubscription.update({
            where: { stripeSubscriptionId: updatedSubscription.id },
            data: {
              status: updatedSubscription.status,
              currentPeriodStart: new Date((updatedSubscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000),
              trialEnd: (updatedSubscription as any).trial_end ? new Date((updatedSubscription as any).trial_end * 1000) : null,
              cancelAtPeriodEnd: (updatedSubscription as any).cancel_at_period_end || false,
            },
          });
          
          console.log('✅ 订阅记录更新成功');
        } catch (error) {
          console.error('❌ 更新订阅记录失败:', error);
        }
        
        console.log('=== 订阅更新事件处理完成 ===');
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('=== 订阅删除事件 ===');
        console.log('订阅ID:', deletedSubscription.id);
        console.log('客户ID:', deletedSubscription.customer);
        console.log('状态:', deletedSubscription.status);
        console.log('取消时间:', new Date((deletedSubscription as any).canceled_at * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', deletedSubscription.metadata);
        
        if (!isProjectEvent(deletedSubscription)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 更新订阅状态为已取消，但保持当前期间有效
        try {
          await prisma.platformSubscription.update({
            where: { stripeSubscriptionId: deletedSubscription.id },
            data: {
              status: 'canceled',
              cancelAtPeriodEnd: true, // 标记在当前期间结束后取消
            },
          });
          
          console.log('✅ 订阅标记为期间结束后取消，用户仍可享受会员权益');
        } catch (error) {
          console.error('❌ 更新订阅状态失败:', error);
        }
        
        console.log('=== 订阅删除事件处理完成 ===');
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('=== 付款成功事件 ===');
        console.log('发票ID:', invoice.id);
        console.log('客户ID:', invoice.customer);
        console.log('订阅ID:', (invoice as any).subscription);
        console.log('金额:', (invoice.amount_paid / 100).toFixed(2), 'USD');
        console.log('状态:', invoice.status);
        console.log('付款时间:', new Date(invoice.created * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', invoice.metadata);
        
        if (!isProjectEvent(invoice)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 处理成功付款
        console.log('✅ 处理付款成功事件，订阅ID:', (invoice as any).subscription);
        
        // 如果是试用期后的首次付款，更新平台订阅状态
        if (invoice.metadata?.planType === 'FREE_TRIAL') {
          console.log('🎯 检测到试用期后的首次付款');
          try {
            // 更新平台订阅状态为活跃
            await prisma.platformSubscription.updateMany({
              where: {
                userId: invoice.metadata.userId,
                status: 'trialing'
              },
              data: {
                status: 'active',
                updatedAt: new Date(),
              }
            });
            console.log('✅ 平台订阅状态已更新为活跃');
          } catch (error) {
            console.error('❌ 更新平台订阅状态失败:', error);
          }
        }
        
        console.log('=== 付款成功事件处理完成 ===');
        break;

      case 'customer.subscription.trial_will_end':
        const trialWillEnd = event.data.object;
        console.log('=== 试用即将结束事件 ===');
        console.log('订阅ID:', trialWillEnd.id);
        console.log('客户ID:', trialWillEnd.customer);
        console.log('试用期结束时间:', new Date((trialWillEnd as any).trial_end * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', trialWillEnd.metadata);
        
        if (!isProjectEvent(trialWillEnd)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 处理试用即将结束事件
        console.log('⚠️ 试用即将结束，准备自动订阅');
        console.log('=== 试用即将结束事件处理完成 ===');
        break;

      case 'customer.subscription.trial_ended' as any:
        const trialEnded = event.data.object as any;
        console.log('=== 试用已结束事件 ===');
        console.log('订阅ID:', trialEnded.id);
        console.log('客户ID:', trialEnded.customer);
        console.log('试用期结束时间:', new Date((trialEnded as any).trial_end * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', trialEnded.metadata);
        
        if (!isProjectEvent(trialEnded)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 处理试用已结束事件 - 更新为新架构
        if (trialEnded.metadata?.planType === 'FREE_TRIAL') {
          console.log('🎯 检测到免费试用已结束');
          try {
            // 更新平台订阅状态
            await prisma.platformSubscription.updateMany({
              where: {
                stripeSubscriptionId: trialEnded.id,
                status: 'trialing'
              },
              data: {
                status: 'past_due',
                updatedAt: new Date(),
              }
            });
            console.log('✅ 平台订阅状态已更新为过期');
            
            // 移除用户的平台访问权限
            await removePlatformAccess(trialEnded.metadata?.userId);
            console.log('✅ 用户平台访问权限已移除');
            
            // 这里可以添加其他业务逻辑，比如发送邮件通知用户
            console.log('📧 可以发送试用到期通知邮件');
          } catch (error) {
            console.error('❌ 处理试用结束事件失败:', error);
          }
        }
        
        console.log('=== 试用已结束事件处理完成 ===');
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('=== 付款失败事件 ===');
        console.log('发票ID:', failedInvoice.id);
        console.log('客户ID:', failedInvoice.customer);
        console.log('订阅ID:', (failedInvoice as any).subscription);
        console.log('金额:', (failedInvoice.amount_due / 100).toFixed(2), 'USD');
        console.log('状态:', failedInvoice.status);
        console.log('失败时间:', new Date(failedInvoice.created * 1000).toLocaleString('zh-CN'));
        console.log('失败原因:', (failedInvoice as any).last_payment_error?.message || '未知原因');
        console.log('元数据:', failedInvoice.metadata);
        
        if (!isProjectEvent(failedInvoice)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 处理付款失败
        console.log('✅ 处理付款失败事件，订阅ID:', (failedInvoice as any).subscription);
        console.log('=== 付款失败事件处理完成 ===');
        break;

      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        console.log('=== Checkout Session 完成事件 ===');
        console.log('Session ID:', checkoutSession.id);
        console.log('客户ID:', checkoutSession.customer);
        console.log('模式:', checkoutSession.mode);
        console.log('状态:', checkoutSession.status);
        console.log('成功URL:', checkoutSession.success_url);
        console.log('取消URL:', checkoutSession.cancel_url);
        console.log('完成时间:', new Date(checkoutSession.created * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', JSON.stringify(checkoutSession.metadata, null, 2));
        console.log('金额:', checkoutSession.amount_total, '货币:', checkoutSession.currency);
        
        // 详细检查元数据
        console.log('🔍 元数据详细分析:');
        console.log('- userId:', checkoutSession.metadata?.userId);
        console.log('- courseId:', checkoutSession.metadata?.courseId);
        console.log('- planType:', checkoutSession.metadata?.planType);
        console.log('- projectId:', checkoutSession.metadata?.projectId);
        console.log('- purchaseType:', checkoutSession.metadata?.purchaseType);
        console.log('- accessDuration:', checkoutSession.metadata?.accessDuration);
        
        if (!isProjectEvent(checkoutSession)) {
          console.log('⚠️ 跳过非本项目事件');
          break;
        }
        
        // 处理checkout完成事件
        console.log('✅ 处理checkout完成事件，用户ID:', checkoutSession.metadata?.userId);
        console.log('✅ 计划类型:', checkoutSession.metadata?.planType);
        console.log('✅ 课程ID:', checkoutSession.metadata?.courseId);
        
        // 处理一次性购买
        if (checkoutSession.metadata?.planType === 'ONE_TIME') {
          console.log('🎯 检测到一次性购买事件');
          console.log('📋 购买详情:');
          console.log('  - 购买类型:', checkoutSession.metadata?.purchaseType);
          console.log('  - 访问期限:', checkoutSession.metadata?.accessDuration);
          console.log('  - 金额:', checkoutSession.amount_total, '分');
          console.log('  - 货币:', checkoutSession.currency);
          
          // 验证必要数据
          if (!checkoutSession.metadata?.userId) {
            console.error('❌ 缺少用户ID，无法创建购买记录');
            break;
          }
          
          if (!checkoutSession.metadata?.courseId) {
            console.error('❌ 缺少课程ID，无法创建购买记录');
            break;
          }
          
          if (!checkoutSession.metadata?.projectId) {
            console.error('❌ 缺少项目ID，无法创建购买记录');
            break;
          }
          
          console.log('✅ 必要数据验证通过，开始创建购买记录...');
          
          // 创建课程购买记录
          try {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1年后过期
            
            const purchaseData = {
                userId: checkoutSession.metadata.userId,
                courseId: checkoutSession.metadata.courseId,
                stripeSessionId: checkoutSession.id,
                purchaseDate: new Date(),
                expiresAt: expiresAt,
                status: 'active',
                amount: checkoutSession.amount_total || 0,
                currency: checkoutSession.currency || 'usd',
                projectId: checkoutSession.metadata.projectId,
            };
            
            console.log('📋 准备创建的购买记录数据:', JSON.stringify(purchaseData, null, 2));
            
            const result = await prisma.coursePurchase.create({
              data: purchaseData
            });
            
            console.log('✅ 课程购买记录创建成功!');
            console.log('📊 创建结果:', JSON.stringify(result, null, 2));
            
            // 验证记录是否真的创建了
            const verifyRecord = await prisma.coursePurchase.findUnique({
              where: { id: result.id }
            });
            
            if (verifyRecord) {
              console.log('✅ 数据库验证成功，记录确实存在');
            } else {
              console.error('❌ 数据库验证失败，记录不存在');
            }
            
          } catch (error) {
            console.error('❌ 创建课程购买记录失败:');
            console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('错误消息:', error instanceof Error ? error.message : String(error));
            console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
            
            // 如果是 Prisma 错误，提供更详细的信息
            if (error && typeof error === 'object' && 'code' in error) {
              console.error('Prisma 错误代码:', (error as any).code);
            }
            if (error && typeof error === 'object' && 'meta' in error) {
              console.error('Prisma 错误元数据:', (error as any).meta);
            }
          }
        } else {
          console.log('⚠️ 不是一次性购买事件，计划类型:', checkoutSession.metadata?.planType);
        }
        
        // 处理免费试用
        if (checkoutSession.metadata?.planType === 'FREE_TRIAL') {
          console.log('🎯 检测到免费试用事件');
          console.log('课程ID:', checkoutSession.metadata?.courseId);
          console.log('用户ID:', checkoutSession.metadata?.userId);
          console.log('项目ID:', checkoutSession.metadata?.projectId);
          
          // 创建试用记录
          try {
            // 先验证用户和课程是否存在
            const user = await prisma.user.findUnique({
              where: { id: checkoutSession.metadata.userId }
            });
            
            if (!user) {
              console.error('❌ 用户不存在:', checkoutSession.metadata.userId);
              break;
            }
            
            const course = await prisma.course.findUnique({
              where: { id: checkoutSession.metadata.courseId }
            });
            
            if (!course) {
              console.error('❌ 课程不存在:', checkoutSession.metadata.courseId);
              break;
            }
            
            console.log('✅ 用户和课程验证通过');
            
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 3); // 3天后过期
            
            const trialData = {
              userId: checkoutSession.metadata.userId,
              courseId: checkoutSession.metadata.courseId,
              startDate: new Date(),
              expiresAt: expiresAt,
              status: 'active',
              projectId: checkoutSession.metadata.projectId,
            };
            
            console.log('📋 试用记录数据:', JSON.stringify(trialData, null, 2));
            
            // 创建平台订阅记录（免费试用）
            const subscriptionData = {
              userId: checkoutSession.metadata.userId,
              stripeSubscriptionId: `trial_${Date.now()}`, // 临时ID
              stripeCustomerId: checkoutSession.customer as string,
              status: 'trialing',
              planType: 'FREE_TRIAL',
              currentPeriodStart: new Date(),
              currentPeriodEnd: expiresAt,
              trialEnd: expiresAt,
              cancelAtPeriodEnd: false,
              projectId: checkoutSession.metadata.projectId,
            };
            
            await prisma.platformSubscription.create({
              data: subscriptionData
            });
            
            console.log('✅ 免费试用订阅记录创建成功');
          } catch (error) {
            console.error('❌ 创建试用记录失败:', error);
            console.error('错误详情:', JSON.stringify(error, null, 2));
          }
        }
        
        console.log('=== Checkout Session 完成事件处理完成 ===');
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('=== 一次性支付成功事件 ===');
        console.log('支付意图ID:', paymentIntent.id);
        console.log('客户ID:', paymentIntent.customer);
        console.log('金额:', (paymentIntent.amount / 100).toFixed(2), 'USD');
        console.log('状态:', paymentIntent.status);
        console.log('支付时间:', new Date(paymentIntent.created * 1000).toLocaleString('zh-CN'));
        console.log('元数据:', paymentIntent.metadata);
        
        if (!isProjectEvent(paymentIntent)) {
          console.log('跳过非本项目事件');
          break;
        }
        
        // 处理一次性支付成功事件
        if (paymentIntent.metadata?.planType === 'ONE_TIME') {
          console.log('✅ 处理一次性支付成功事件');
          console.log('课程ID:', paymentIntent.metadata?.courseId);
          console.log('用户ID:', paymentIntent.metadata?.userId);
          
          // 这里可以添加数据库操作，记录用户购买课程的信息
          // 例如：设置1年有效期，记录购买时间等
        }
        
        console.log('=== 一次性支付成功事件处理完成 ===');
        break;

      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook 处理失败' },
      { status: 500 }
    );
  }
}

// 辅助函数：为用户授予全平台课程访问权限
async function grantPlatformAccess(userId: string) {
  try {
    // 获取所有课程
    const courses = await prisma.course.findMany();
    
    // 为用户授予所有课程的订阅访问权限
    const accessRecords = courses.map((course: any) => ({
      userId,
      courseId: course.id,
      accessType: 'SUBSCRIPTION',
      projectId: process.env.PROJECT_ID || 'kongfu',
    }));
    
    // 批量创建或更新访问记录
    for (const access of accessRecords) {
      await prisma.courseAccess.upsert({
        where: {
          userId_courseId: {
            userId: access.userId,
            courseId: access.courseId,
          }
        },
        update: {
          accessType: 'SUBSCRIPTION',
          updatedAt: new Date(),
        },
        create: access,
      });
    }
    
    console.log(`✅ 已为用户 ${userId} 授予 ${courses.length} 门课程的访问权限`);
  } catch (error) {
    console.error('❌ 授予平台访问权限失败:', error);
  }
}

// 辅助函数：移除用户的平台访问权限
async function removePlatformAccess(userId: string) {
  try {
    // 移除所有订阅类型的课程访问权限
    await prisma.courseAccess.deleteMany({
      where: {
        userId,
        accessType: 'SUBSCRIPTION',
      },
    });
    
    console.log(`✅ 已移除用户 ${userId} 的平台访问权限`);
  } catch (error) {
    console.error('❌ 移除平台访问权限失败:', error);
  }
}

// 辅助函数：处理单门课程购买
async function handleCoursePurchase(session: any) {
  try {
    const { userId, courseId } = session.metadata;
    
    // 创建课程购买记录
    await prisma.coursePurchase.create({
      data: {
        userId,
        courseId,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        purchaseDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
        status: 'active',
        amount: session.amount_total,
        currency: session.currency,
        projectId: process.env.PROJECT_ID || 'kongfunew',
      },
    });
    
    // 创建课程访问记录
    await prisma.courseAccess.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        }
      },
      update: {
        accessType: 'PURCHASE',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        accessType: 'PURCHASE',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        projectId: process.env.PROJECT_ID || 'kongfu',
      },
    });
    
    console.log(`✅ 课程购买处理完成: 用户 ${userId}, 课程 ${courseId}`);
  } catch (error) {
    console.error('❌ 处理课程购买失败:', error);
  }
}
