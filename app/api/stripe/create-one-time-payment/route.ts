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

    const { courseId, userId, customerEmail, locale } = await request.json();
    
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

    // 获取或创建Stripe客户 - 优化版本
    const { getOrCreateCustomer } = await import('@/lib/stripe');
    
    // 并行处理客户创建和会话创建
    const customerPromise = getOrCreateCustomer(
      session.user.id,
      session.user.email!,
      session.user.name || undefined
    );
    
    const customer = await customerPromise;
    console.log('获取或创建Stripe客户:', customer.id);
    
    // 创建Stripe Checkout Session（用于Embedded Checkout）
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ONECE,
          quantity: 1,
        },
      ],
      mode: 'payment',
      redirect_on_completion: 'never',
      automatic_tax: { enabled: true },
      client_reference_id: session.user.id,
      customer_email: session.user.email,
      locale: stripeLocale,
      custom_text: {
        submit: {
          message: '邮箱已自动填充并锁定，以确保支付与您的账户关联',
        },
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

    console.log('Checkout Session创建成功:', checkoutSession.id);

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
