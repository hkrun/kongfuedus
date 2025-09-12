const fs = require('fs');
const path = require('path');

// 课程模板数据
const courseTemplates = {
  'taiji-health': {
    title: "太极养生课程",
    subtitle: "身心平衡的健康之道",
    description: "通过太极运动调节身心，改善健康状况，提升生活质量。",
    category: "taiji",
    instructor: "master-wang",
    level: "beginner",
    difficulty: "初级",
    duration: "8 weeks",
    lessons: 24,
    price: "$179",
    originalPrice: "$249",
    rating: 4.5,
    students: 1890,
    chapters: [
      {
        title: "太极养生理论",
        description: "了解太极养生的基本原理和健康理念",
        totalDuration: 240,
        topics: ["养生理论", "健康理念", "身心平衡", "生活调节"],
        lessonCount: 6
      },
      {
        title: "基础太极动作",
        description: "学习基础的太极养生动作",
        totalDuration: 320,
        topics: ["基础动作", "动作要领", "呼吸配合", "动作练习"],
        lessonCount: 8
      },
      {
        title: "养生套路学习",
        description: "学习完整的太极养生套路",
        totalDuration: 400,
        topics: ["养生套路", "动作连贯", "节奏控制", "养生效果"],
        lessonCount: 10
      }
    ]
  },
  'sword-mastery': {
    title: "剑术大师课程",
    subtitle: "传统剑术的精髓与技巧",
    description: "深入学习传统剑术，掌握剑法的精髓和实战技巧。",
    category: "weapons",
    instructor: "master-chen",
    level: "advanced",
    difficulty: "高级",
    duration: "16 weeks",
    lessons: 48,
    price: "$449",
    originalPrice: "$549",
    rating: 4.8,
    students: 756,
    chapters: [
      {
        title: "剑术基础理论",
        description: "了解剑术的历史渊源和理论基础",
        totalDuration: 320,
        topics: ["剑术历史", "理论基础", "剑法原理", "文化内涵"],
        lessonCount: 8
      },
      {
        title: "基本剑法训练",
        description: "系统训练基本剑法技巧",
        totalDuration: 480,
        topics: ["基本剑法", "剑法要领", "力量控制", "技巧掌握"],
        lessonCount: 12
      },
      {
        title: "剑术套路学习",
        description: "学习完整的剑术套路",
        totalDuration: 640,
        topics: ["剑术套路", "动作连贯", "表演技巧", "实战应用"],
        lessonCount: 16
      },
      {
        title: "高级剑术技巧",
        description: "掌握高级剑术技巧和实战应用",
        totalDuration: 480,
        topics: ["高级技巧", "实战应用", "技巧创新", "综合评估"],
        lessonCount: 12
      }
    ]
  },
  'self-defense-master': {
    title: "自卫大师课程",
    subtitle: "实用有效的自卫技巧",
    description: "学习实用的自卫技巧，提升自我保护能力，增强自信心。",
    category: "self-defense",
    instructor: "master-liu",
    level: "intermediate",
    difficulty: "中级",
    duration: "12 weeks",
    lessons: 36,
    price: "$299",
    originalPrice: "$399",
    rating: 4.6,
    students: 2340,
    chapters: [
      {
        title: "自卫基础理论",
        description: "了解自卫的基本原理和策略",
        totalDuration: 240,
        topics: ["自卫理论", "安全意识", "风险评估", "预防策略"],
        lessonCount: 6
      },
      {
        title: "基本自卫技巧",
        description: "学习基本的自卫技巧和动作",
        totalDuration: 400,
        topics: ["基本技巧", "动作要领", "力量运用", "技巧练习"],
        lessonCount: 10
      },
      {
        title: "实战自卫训练",
        description: "进行实战自卫训练和模拟",
        totalDuration: 480,
        topics: ["实战训练", "模拟场景", "技巧应用", "心理训练"],
        lessonCount: 12
      },
      {
        title: "高级自卫技巧",
        description: "掌握高级自卫技巧和策略",
        totalDuration: 320,
        topics: ["高级技巧", "策略分析", "技巧创新", "综合评估"],
        lessonCount: 8
      }
    ]
  },
  'martial-arts-fusion': {
    title: "武术融合课程",
    subtitle: "多流派武术的融合与创新",
    description: "学习多种武术流派的精华，创造独特的武术风格。",
    category: "fusion",
    instructor: "master-zhang",
    level: "advanced",
    difficulty: "高级",
    duration: "20 weeks",
    lessons: 60,
    price: "$499",
    originalPrice: "$599",
    rating: 4.9,
    students: 623,
    chapters: [
      {
        title: "武术流派分析",
        description: "分析不同武术流派的特点和优势",
        totalDuration: 320,
        topics: ["流派特点", "技术分析", "优势对比", "融合可能性"],
        lessonCount: 8
      },
      {
        title: "基础技术融合",
        description: "学习基础技术的融合方法",
        totalDuration: 480,
        topics: ["技术融合", "融合方法", "创新技巧", "实践练习"],
        lessonCount: 12
      },
      {
        title: "高级融合技巧",
        description: "掌握高级的武术融合技巧",
        totalDuration: 560,
        topics: ["高级融合", "技巧创新", "风格创造", "实战应用"],
        lessonCount: 14
      },
      {
        title: "融合风格创造",
        description: "创造独特的武术融合风格",
        totalDuration: 480,
        topics: ["风格创造", "个人特色", "表演技巧", "教学应用"],
        lessonCount: 12
      },
      {
        title: "综合能力评估",
        description: "综合评估武术融合的学习成果",
        totalDuration: 320,
        topics: ["能力评估", "成果展示", "技巧总结", "未来发展"],
        lessonCount: 8
      }
    ]
  }
};

// 生成课程文件的函数
function generateCourseFile(courseId, template) {
  const courseContent = `import { CourseDetail } from "../types";

export const ${courseId.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Course: CourseDetail = {
  id: "${courseId}",
  title: "${template.title}",
  subtitle: "${template.subtitle}",
  description: "${template.description}",
  shortDescription: "${template.description}",
  category: "${template.category}",
  instructor: "${template.instructor}",
  level: "${template.level}",
  difficulty: "${template.difficulty}",
  duration: "${template.duration}",
  lessons: ${template.lessons},
  price: "${template.price}",
  originalPrice: "${template.originalPrice}",
  rating: ${template.rating},
  students: ${template.students},
  language: "Chinese",
  certificate: true,
  image: "/images/${courseId}.jpg",
  tagColor: "#${Math.floor(Math.random()*16777215).toString(16)}",
  featured: false,
  learningGoals: [
    "掌握${template.title}的基本原理",
    "学会${template.title}的核心技巧",
    "理解${template.title}的文化内涵",
    "提升${template.title}的实战应用能力",
    "培养${template.title}的专业素养"
  ],
  suitableFor: [
    "对${template.title}感兴趣的学习者",
    "希望提升武术技能的人",
    "想要学习传统武术的人",
    "武术爱好者和练习者"
  ],
  prerequisites: [
    "基本的身体协调能力",
    "愿意投入时间练习",
    "对武术有基本了解",
    "具备基本的身体素质"
  ],
  chapters: [
${template.chapters.map((chapter, index) => `    {
      id: ${index + 1},
      title: "${chapter.title}",
      description: "${chapter.description}",
      totalDuration: ${chapter.totalDuration}, // ${chapter.lessonCount}节课 × 40分钟
      topics: ${JSON.stringify(chapter.topics)},
      lessons: [
${Array.from({length: chapter.lessonCount}, (_, i) => `        {
          id: ${i + 1 + template.chapters.slice(0, index).reduce((sum, ch) => sum + ch.lessonCount, 0)},
          title: "${chapter.title}第${i + 1}课",
          duration: ${35 + Math.floor(Math.random() * 10)},
          description: "${chapter.title}学习的第${i + 1}课",
          isPreview: ${i === 0},
          resources: ["学习资料", "练习指导"]
        }`).join(',\n')}
      ]
    }`).join(',\n')}
  ],
  materials: [
    "高清视频教程",
    "动作分解图解",
    "学习指导手册",
    "练习工具和器材",
    "在线答疑支持"
  ]
};
`;

  const filePath = path.join(__dirname, '..', 'data', 'courses', `${courseId}.ts`);
  fs.writeFileSync(filePath, courseContent, 'utf8');
  console.log(`✅ 已生成: ${courseId}.ts`);
}

// 生成所有课程文件
console.log('🚀 开始生成课程文件...\n');

Object.entries(courseTemplates).forEach(([courseId, template]) => {
  generateCourseFile(courseId, template);
});

console.log('\n✨ 课程文件生成完成！');
