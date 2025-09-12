import { PrismaClient } from '@prisma/client';
import { courses } from '../data/courses';

const prisma = new PrismaClient();

async function addMissingCourses() {
  console.log('🚀 开始添加缺失的课程...');
  
  try {
    // 获取数据库中现有的课程ID
    const existingCourses = await prisma.course.findMany({
      select: { id: true }
    });
    
    const existingIds = new Set(existingCourses.map(course => course.id));
    console.log(`📊 数据库中现有课程: ${existingIds.size} 门`);
    
    // 找出缺失的课程
    const missingCourses = courses.filter(course => !existingIds.has(course.id));
    
    if (missingCourses.length === 0) {
      console.log('✅ 所有课程都已存在于数据库中！');
      return;
    }
    
    console.log(`📚 发现 ${missingCourses.length} 门缺失的课程:`);
    missingCourses.forEach(course => {
      console.log(`   - ${typeof course.title === 'string' ? course.title : course.title.zh} (${course.id})`);
    });
    
    // 添加缺失的课程
    console.log('\n📖 开始添加缺失的课程...');
    const addedCourses = [];
    
    for (const courseData of missingCourses) {
      try {
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
        
        addedCourses.push(course);
        console.log(`✅ 成功添加: ${course.title} (ID: ${course.id})`);
      } catch (error) {
        console.error(`❌ 添加课程失败 ${courseData.id}:`, error);
      }
    }
    
    console.log(`\n🎉 课程添加完成！共添加 ${addedCourses.length} 门课程`);
    
    // 特别检查儿童武术课程
    const childrenMartialArts = await prisma.course.findUnique({
      where: { id: 'children-martial-arts' }
    });
    
    if (childrenMartialArts) {
      console.log('\n✅ 儿童武术课程现在已存在于数据库中！');
      console.log(`   标题: ${childrenMartialArts.title}`);
      console.log(`   分类: ${childrenMartialArts.category}`);
      console.log(`   讲师: ${childrenMartialArts.instructor}`);
      console.log(`   评分: ${childrenMartialArts.rating}`);
      console.log(`   学生数: ${childrenMartialArts.students}`);
    } else {
      console.log('\n❌ 儿童武术课程仍未在数据库中找到！');
    }
    
  } catch (error) {
    console.error('❌ 添加课程失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addMissingCourses()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { addMissingCourses };
