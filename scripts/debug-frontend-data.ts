import { courses } from '../data/courses';
import { categories } from '../data/categories';

function debugFrontendData() {
  console.log('🔍 调试前端数据加载...');
  
  // 检查课程数据
  console.log('\n📚 课程数据:');
  console.log(`总课程数: ${courses.length}`);
  
  courses.forEach((course, index) => {
    console.log(`${index + 1}. ${typeof course.title === 'string' ? course.title : course.title.zh}`);
    console.log(`   ID: ${course.id}`);
    console.log(`   分类: ${course.category}`);
    console.log(`   讲师: ${course.instructor}`);
    console.log('');
  });
  
  // 检查分类数据
  console.log('\n📂 分类数据:');
  categories.forEach(category => {
    console.log(`- ${category.id}: ${category.title}`);
  });
  
  // 模拟前端过滤逻辑
  console.log('\n🧪 模拟前端过滤逻辑:');
  const testCategories = ['all', 'striking', 'taiji', 'weapons', 'health', 'combat', 'mixed'];
  
  testCategories.forEach(category => {
    const filteredCourses = category === 'all' 
      ? courses 
      : courses.filter(course => course.category === category);
    
    console.log(`\n分类 "${category}": ${filteredCourses.length} 门课程`);
    
    if (filteredCourses.length > 0) {
      filteredCourses.forEach(course => {
        console.log(`  ✅ ${typeof course.title === 'string' ? course.title : course.title.zh}`);
      });
    } else {
      console.log('  ❌ 无课程');
    }
  });
  
  // 特别检查综合类
  console.log('\n🎯 特别检查综合类:');
  const mixedCourses = courses.filter(course => course.category === 'mixed');
  console.log(`综合类课程数量: ${mixedCourses.length}`);
  
  if (mixedCourses.length > 0) {
    mixedCourses.forEach(course => {
      console.log(`✅ 找到: ${typeof course.title === 'string' ? course.title : course.title.zh}`);
      console.log(`   分类: ${course.category}`);
      console.log(`   是否匹配 'mixed': ${course.category === 'mixed'}`);
    });
  } else {
    console.log('❌ 未找到综合类课程');
    
    // 检查是否有其他分类的课程
    console.log('\n🔍 检查所有课程的分类:');
    const categoryCount: { [key: string]: number } = {};
    courses.forEach(course => {
      categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 门课程`);
    });
  }
}

debugFrontendData();
