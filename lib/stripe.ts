import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

type StripePlan = {
  name: string;
  price: number;
  interval: string;
  priceId?: string;
  trialDays?: number;
};

export const STRIPE_PLANS: Record<string, StripePlan> = {
  FREE_TRIAL: {
    name: '3天免费试用',
    price: 0,
    interval: 'trial',
    trialDays: 3,
  },
  MONTHLY: {
    name: '月度会员',
    price: 39.99,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_MONTH,
  }
};

// 创建平台订阅（免费试用或付费订阅）
export const createPlatformSubscription = async (
  userId: string, 
  customerId: string,
  planType: 'FREE_TRIAL' | 'MONTHLY'
) => {
  const plan = STRIPE_PLANS[planType];
  
  if (planType === 'FREE_TRIAL') {
    // 创建免费试用的订阅，试用期结束后自动转为月度订阅
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: STRIPE_PLANS.MONTHLY.priceId }], // 试用期结束后转为月度订阅
      trial_period_days: plan.trialDays,
      metadata: {
        userId,
        planType: 'FREE_TRIAL',
        projectId: process.env.PROJECT_ID || 'kongfu',
      },
    });
  } else {
    // 创建付费订阅
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      metadata: {
        userId,
        planType,
        projectId: process.env.PROJECT_ID || 'kongfu',
      },
    });
  }
};

// 创建单门课程购买会话
export const createCoursePurchaseSession = async (
  userId: string,
  customerId: string,
  courseId: string,
  amount: number,
  currency: string = 'usd'
) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `课程购买 - ${courseId}`,
            description: '单门课程访问权限',
          },
          unit_amount: amount, // 以分为单位
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&type=course_purchase`,
    cancel_url: `${process.env.NEXTAUTH_URL}/courses?canceled=true`,
               metadata: {
        userId,
        courseId,
        purchaseType: 'COURSE_PURCHASE',
        projectId: process.env.PROJECT_ID || 'kongfu',
      },
  });
};

// 获取客户信息或创建新客户
export const getOrCreateCustomer = async (userId: string, email: string, name?: string) => {
  // 先查找现有客户
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // 创建新客户
  return await stripe.customers.create({
    email,
    name,
                   metadata: {
        userId,
        projectId: process.env.PROJECT_ID || 'kongfu',
      },
  });
};

// 检查用户是否有活跃的平台订阅
export const hasActiveSubscription = async (customerId: string) => {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data.length > 0;
};

// 取消订阅
export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = true) => {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
};
