import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCourses() {
  console.log('🔍 检查数据库中的课程数据...');
  
  try {
    // 获取所有课程
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📊 数据库中共有 ${courses.length} 门课程`);
    
    if (courses.length === 0) {
      console.log('❌ 数据库中没有找到任何课程');
      return;
    }
    
    // 显示课程详情
    console.log('\n📋 课程列表:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   分类: ${course.category}`);
      console.log(`   讲师: ${course.instructor}`);
      console.log(`   评分: ${course.rating}`);
      console.log(`   学生数: ${course.students}`);
      console.log(`   创建时间: ${course.createdAt.toLocaleString()}`);
      console.log('');
    });
    
    // 按分类统计
    const categoryStats = courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 按分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 门课程`);
    });
    
  } catch (error) {
    console.error('❌ 检查课程数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkCourses()
    .then(() => {
      console.log('✅ 检查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 检查失败:', error);
      process.exit(1);
    });
}

export { checkCourses };
