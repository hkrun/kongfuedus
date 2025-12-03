import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { planType, courseId, locale } = await request.json();
    
    // 映射语言代码到 Stripe 支持的语言（支持完整格式和简化格式）
    const getStripeLocale = (locale: string): 'auto' | 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr' => {
      // 处理完整格式 (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, ar-SA)
      if (locale.startsWith('zh')) return 'zh';
      if (locale.startsWith('en')) return 'en';
      if (locale.startsWith('ja')) return 'ja';
      if (locale.startsWith('ko')) return 'ko';
      if (locale.startsWith('de')) return 'de';
      if (locale.startsWith('fr')) return 'fr';
      if (locale.startsWith('ar')) return 'auto'; // Stripe 不支持阿拉伯语，使用自动检测
      
      // 处理简化格式
      const localeMap: { [key: string]: 'auto' | 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr' } = {
        'zh': 'zh',
        'en': 'en',
        'ja': 'ja',
        'ko': 'ko',
        'de': 'de',
        'fr': 'fr',
        'ar': 'auto',
      };
      
      return localeMap[locale] || 'auto';
    };
    
    const stripeLocale = getStripeLocale(locale || 'en');
    
    if (!planType || !['FREE_TRIAL', 'MONTHLY'].includes(planType)) {
      return NextResponse.json(
        { error: '无效的订阅类型' },
        { status: 400 }
      );
    }

    // 检查环境变量
    if (!process.env.STRIPE_PRICE_MONTH) {
      console.error('STRIPE_PRICE_MONTH 环境变量未设置');
      return NextResponse.json(
        { error: 'Stripe配置错误' },
        { status: 500 }
      );
    }

    if (!process.env.PROJECT_ID) {
      console.error('PROJECT_ID 环境变量未设置');
      return NextResponse.json(
        { error: '项目配置错误' },
        { status: 500 }
      );
    }

    // 获取或创建Stripe客户
    const { getOrCreateCustomer } = await import('@/lib/stripe');
    const customer = await getOrCreateCustomer(
      session.user.id,
      session.user.email!,
      session.user.name || undefined
    );
    
    const stripeCustomerId = customer.id;
    console.log('获取或创建Stripe客户:', customer.id);

    if (planType === 'FREE_TRIAL') {
      console.log('创建免费试用checkout session，价格ID:', process.env.STRIPE_PRICE_MONTH);
      
      // 创建免费试用的checkout session（Embedded模式）
      const checkoutSession = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_MONTH,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        redirect_on_completion: 'never',
        locale: stripeLocale,
        subscription_data: {
          trial_period_days: 3,
          metadata: {
            userId: session.user.id,
            planType: 'FREE_TRIAL',
            courseId: courseId || '',
            projectId: process.env.PROJECT_ID,
          },
        },
        metadata: {
          userId: session.user.id,
          planType: 'FREE_TRIAL',
          courseId: courseId || '',
          projectId: process.env.PROJECT_ID,
        },
      });

      console.log('免费试用checkout session创建成功:', checkoutSession.id);
      console.log('Client Secret:', checkoutSession.client_secret);

      const response = NextResponse.json({
        clientSecret: checkoutSession.client_secret,
        sessionId: checkoutSession.id,
        message: 'Checkout Session创建成功'
      });
      
      // 添加性能优化头
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;

    } else {
      // 创建月度订阅的checkout session（Embedded模式）
      const checkoutSession = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_MONTH,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        redirect_on_completion: 'never',
        locale: stripeLocale,
        metadata: {
          userId: session.user.id,
          planType: 'MONTHLY',
          courseId: courseId || '',
          projectId: process.env.PROJECT_ID,
        },
      });

      const response = NextResponse.json({
        clientSecret: checkoutSession.client_secret,
        sessionId: checkoutSession.id,
        message: 'Checkout Session创建成功'
      });
      
      // 添加性能优化头
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      
      return response;
    }
  } catch (error) {
    console.error('API error:', error);
    
    // 提供更详细的错误信息
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `处理请求失败: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '处理请求失败' },
      { status: 500 }
    );
  }
}
