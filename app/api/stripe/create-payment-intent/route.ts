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

    const { courseId } = await request.json();
    
    if (!courseId) {
      return NextResponse.json(
        { error: '缺少课程ID' },
        { status: 400 }
      );
    }

    // 检查环境变量
    if (!process.env.STRIPE_PRICE_ONECE) {
      console.error('STRIPE_PRICE_ONECE 环境变量未设置');
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

    console.log('创建支付意图，价格ID:', process.env.STRIPE_PRICE_ONECE);
    console.log('课程ID:', courseId);
    console.log('用户ID:', session.user.id);
    
    // 创建Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      customer: stripeCustomerId,
      amount: 9900, // 99.00 USD in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: session.user.id,
        planType: 'ONE_TIME',
        courseId: courseId,
        projectId: process.env.PROJECT_ID,
        purchaseType: 'course_access',
        accessDuration: '1_year',
      },
    });

    console.log('支付意图创建成功:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: '支付意图创建成功'
    });

  } catch (error) {
    console.error('API error:', error);
    
    // 提供更详细的错误信息
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `处理请求失败: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '处理请求失败' },
      { status: 500 }
    );
  }
}
