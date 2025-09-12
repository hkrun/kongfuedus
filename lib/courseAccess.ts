import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface CourseAccessStatus {
  hasAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'trial' | 'none';
  expiresAt?: Date;
  isExpired: boolean;
}

export async function checkCourseAccess(courseId: string): Promise<CourseAccessStatus> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        hasAccess: false,
        accessType: 'none',
        isExpired: false
      };
    }

         // 检查是否有平台订阅（包括已取消但仍在有效期内的）
     const subscription = await prisma.platformSubscription.findFirst({
       where: {
         userId: session.user.id,
         OR: [
           { status: 'active' },
           { 
             status: 'canceled', 
             cancelAtPeriodEnd: true,
             currentPeriodEnd: { gt: new Date() }
           }
         ],
         currentPeriodEnd: { gt: new Date() }
       }
     });
     
     if (subscription) {
       return {
         hasAccess: true,
         accessType: 'subscription',
         expiresAt: subscription.currentPeriodEnd,
         isExpired: false
       };
     }
     
     // 检查是否购买过该课程且在有效期内
     const coursePurchase = await prisma.coursePurchase.findFirst({
       where: {
         userId: session.user.id,
         courseId: courseId,
         status: 'active',
         expiresAt: { gt: new Date() }
       }
     });
     
     if (coursePurchase) {
       return {
         hasAccess: true,
         accessType: 'one_time',
         expiresAt: coursePurchase.expiresAt,
         isExpired: false
       };
     }
     
     // 检查是否在试用期内
     const trial = await prisma.platformSubscription.findFirst({
       where: {
         userId: session.user.id,
         planType: 'FREE_TRIAL',
         status: 'trialing',
         trialEnd: { gt: new Date() }
       }
     });
     
     if (trial) {
       return {
         hasAccess: true,
         accessType: 'trial',
         expiresAt: trial.trialEnd || undefined,
         isExpired: false
       };
     }
     
     // 默认返回无访问权限
     return {
       hasAccess: false,
       accessType: 'none',
       isExpired: false
     };
    
  } catch (error) {
    console.error('检查课程访问权限失败:', error);
    return {
      hasAccess: false,
      accessType: 'none',
      isExpired: false
    };
  }
}
