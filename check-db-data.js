// 检查数据库中的用户和课程数据
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 检查数据库数据...');
    
    // 检查用户表
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log('👥 用户数据:');
    console.log(`总数: ${users.length}`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 邮箱: ${user.email}, 姓名: ${user.name}, 创建时间: ${user.createdAt}`);
    });
    
    // 检查课程表
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });
    
    console.log('\n📚 课程数据:');
    console.log(`总数: ${courses.length}`);
    courses.forEach(course => {
      console.log(`- ID: ${course.id}, 标题: ${course.title}, 创建时间: ${course.createdAt}`);
    });
    
    // 检查试用表
    const trials = await prisma.trial.findMany({
      select: {
        id: true,
        userId: true,
        courseId: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\n🧪 试用记录:');
    console.log(`总数: ${trials.length}`);
    trials.forEach(trial => {
      console.log(`- ID: ${trial.id}, 用户ID: ${trial.userId}, 课程ID: ${trial.courseId}, 状态: ${trial.status}, 创建时间: ${trial.createdAt}`);
    });
    
    // 检查订阅表
    const subscriptions = await prisma.subscription.findMany({
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\n💳 订阅记录:');
    console.log(`总数: ${subscriptions.length}`);
    subscriptions.forEach(sub => {
      console.log(`- ID: ${sub.id}, 用户ID: ${sub.userId}, 状态: ${sub.status}, 创建时间: ${sub.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ 检查数据库数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseData();
