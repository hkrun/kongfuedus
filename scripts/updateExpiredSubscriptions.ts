import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExpiredSubscriptions() {
  try {
    console.log('开始更新过期的订阅状态...');
    
    // 查找所有已过期但状态仍为active或canceled的平台订阅
    const expiredSubscriptions = await prisma.platformSubscription.findMany({
      where: {
        currentPeriodEnd: { lt: new Date() },
        status: { in: ['active', 'canceled'] }
      }
    });
    
    console.log(`找到 ${expiredSubscriptions.length} 个过期平台订阅`);
    
    // 批量更新状态为expired
    if (expiredSubscriptions.length > 0) {
      const updateResult = await prisma.platformSubscription.updateMany({
        where: {
          currentPeriodEnd: { lt: new Date() },
          status: { in: ['active', 'canceled'] }
        },
        data: {
          status: 'expired'
        }
      });
      
      console.log(`成功更新 ${updateResult.count} 个平台订阅状态为expired`);
    }
    
    // 查找所有已过期的课程购买记录
    const expiredPurchases = await prisma.coursePurchase.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'active'
      }
    });
    
    console.log(`找到 ${expiredPurchases.length} 个过期课程购买记录`);
    
    // 批量更新状态为expired
    if (expiredPurchases.length > 0) {
      const updateResult = await prisma.coursePurchase.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: 'active'
        },
        data: {
          status: 'expired'
        }
      });
      
      console.log(`成功更新 ${updateResult.count} 个课程购买记录状态为expired`);
    }
    
    // 注意：试用记录现在使用平台订阅模型，状态更新已在上面的平台订阅处理中完成
    
    console.log('过期状态更新完成！');
    
  } catch (error) {
    console.error('更新过期状态时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateExpiredSubscriptions();
}

export { updateExpiredSubscriptions };
