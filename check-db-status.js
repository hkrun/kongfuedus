const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabaseStatus() {
  try {
    console.log('🔍 检查数据库连接状态...');
    
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 检查数据库中的表
    console.log('\n📊 检查数据库表...');
    
    // 检查用户表
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 用户表 (users): ${userCount} 条记录`);
      
      if (userCount > 0) {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          },
          take: 5
        });
        console.log('📋 前5个用户:', users);
      }
    } catch (error) {
      console.error('❌ 检查用户表失败:', error.message);
    }
    
    // 检查课程表
    try {
      const courseCount = await prisma.course.count();
      console.log(`📚 课程表 (courses): ${courseCount} 条记录`);
    } catch (error) {
      console.error('❌ 检查课程表失败:', error.message);
    }
    
    // 检查购买记录表
    try {
      const purchaseCount = await prisma.coursePurchase.count();
      console.log(`💰 购买记录表 (course_purchases): ${purchaseCount} 条记录`);
    } catch (error) {
      console.error('❌ 检查购买记录表失败:', error.message);
    }
    
    // 检查订阅表
    try {
      const subscriptionCount = await prisma.platformSubscription.count();
      console.log(`🔄 订阅表 (platform_subscriptions): ${subscriptionCount} 条记录`);
    } catch (error) {
      console.error('❌ 检查订阅表失败:', error.message);
    }
    
    // 检查环境变量
    console.log('\n🔧 环境变量检查:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
    console.log('PROJECT_ID:', process.env.PROJECT_ID || '未设置');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '已设置' : '未设置');
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();
