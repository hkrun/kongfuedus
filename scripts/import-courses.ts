import { PrismaClient } from '@prisma/client';
import { courses } from '../data/courses';

const prisma = new PrismaClient();

async function importCourses() {
  console.log('🚀 开始导入课程数据...');
  
  try {
    // 清空现有课程数据（可选）
    console.log('🗑️ 清空现有课程数据...');
    await prisma.course.deleteMany({});
    
    // 导入所有课程
    console.log('📚 导入课程数据...');
    const importedCourses = [];
    
    for (const courseData of courses) {
      console.log(`📖 导入课程: ${courseData.title}`);
      
      const course = await prisma.course.create({
        data: {
          id: courseData.id,
          title: typeof courseData.title === 'string' ? courseData.title : courseData.title.zh,
          category: courseData.category,
          instructor: courseData.instructor,
          rating: courseData.rating || 0,
          students: courseData.students || 0,
        },
      });
      
      importedCourses.push(course);
      console.log(`✅ 成功导入: ${course.title} (ID: ${course.id})`);
    }
    
    console.log(`🎉 课程导入完成！共导入 ${importedCourses.length} 门课程`);
    
    // 显示导入的课程列表
    console.log('\n📋 导入的课程列表:');
    importedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ${course.instructor} (${course.category})`);
    });
    
  } catch (error) {
    console.error('❌ 课程导入失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  importCourses()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { importCourses };
