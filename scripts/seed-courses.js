const { PrismaClient } = require('@prisma/client');

// 直接导入课程数据，避免TypeScript语法问题
const courses = [
  {
    id: "tai-chi-master",
    title: "太极大师",
    category: "internal",
    instructor: "master-chen",
    rating: 4.9,
    students: 2156
  },
  {
    id: "shaolin-legacy",
    title: "少林传承",
    category: "external",
    instructor: "master-li",
    rating: 4.8,
    students: 1890
  },
  {
    id: "wing-chun-combat",
    title: "咏春实战",
    category: "combat",
    instructor: "master-wong",
    rating: 4.7,
    students: 1654
  },
  {
    id: "kung-fu-basics",
    title: "功夫基础",
    category: "basics",
    instructor: "master-zhang",
    rating: 4.6,
    students: 3245
  },
  {
    id: "taiji-health",
    title: "太极养生",
    category: "health",
    instructor: "master-wang",
    rating: 4.8,
    students: 2789
  },
  {
    id: "sword-mastery",
    title: "剑术精通",
    category: "weapons",
    instructor: "master-liu",
    rating: 4.9,
    students: 1234
  },
  {
    id: "self-defense-master",
    title: "防身术大师",
    category: "combat",
    instructor: "master-security",
    rating: 4.8,
    students: 3456
  },
  {
    id: "martial-arts-fusion",
    title: "武术融合",
    category: "advanced",
    instructor: "master-fusion",
    rating: 4.7,
    students: 987
  },
  {
    id: "self-defense",
    title: "防身术",
    category: "combat",
    instructor: "master-wang",
    rating: 4.8,
    students: 1256
  },
  {
    id: "strangle-escape",
    title: "绞杀技逃脱",
    category: "combat",
    instructor: "master-security",
    rating: 4.6,
    students: 2156
  }
];

const prisma = new PrismaClient();

async function seedCourses() {
  try {
    console.log('🌱 开始同步课程数据到数据库...');

    for (const course of courses) {
      // 检查课程是否已存在
      const existingCourse = await prisma.course.findUnique({
        where: { id: course.id }
      });

      if (existingCourse) {
        console.log(`✅ 课程 ${course.title} 已存在，跳过`);
        continue;
      }

      // 创建新课程
      await prisma.course.create({
        data: {
          id: course.id,
          title: course.title,
          category: course.category,
          instructor: course.instructor,
          rating: course.rating,
          students: course.students
        }
      });

      console.log(`✅ 已创建课程: ${course.title}`);
    }

    console.log('🎉 所有课程数据同步完成！');
  } catch (error) {
    console.error('❌ 同步课程数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCourses();
