import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCategoryMismatch() {
  console.log('🔧 修复分类ID不匹配问题...');
  
  try {
    // 查找儿童武术课程
    const childrenMartialArts = await prisma.course.findUnique({
      where: { id: 'children-martial-arts' }
    });
    
    if (!childrenMartialArts) {
      console.log('❌ 未找到儿童武术课程');
      return;
    }
    
    console.log(`📋 当前儿童武术课程信息:`);
    console.log(`   ID: ${childrenMartialArts.id}`);
    console.log(`   标题: ${childrenMartialArts.title}`);
    console.log(`   当前分类: ${childrenMartialArts.category}`);
    
    // 更新分类从 comprehensive 改为 mixed
    const updatedCourse = await prisma.course.update({
      where: { id: 'children-martial-arts' },
      data: { category: 'mixed' }
    });
    
    console.log(`✅ 成功更新儿童武术课程分类:`);
    console.log(`   新分类: ${updatedCourse.category}`);
    
    // 验证更新结果
    const verifyCourse = await prisma.course.findUnique({
      where: { id: 'children-martial-arts' }
    });
    
    if (verifyCourse?.category === 'mixed') {
      console.log('🎉 分类更新成功！现在儿童武术课程属于"综合类"分类');
    } else {
      console.log('❌ 分类更新失败');
    }
    
  } catch (error) {
    console.error('❌ 修复分类失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixCategoryMismatch()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { fixCategoryMismatch };
