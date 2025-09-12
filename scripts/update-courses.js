const fs = require('fs');
const path = require('path');

// 课程模板函数
function createChapterTemplate(chapterId, title, description, totalDuration, topics, lessons) {
  return `    {
      id: ${chapterId},
      title: "${title}",
      description: "${description}",
      totalDuration: ${totalDuration}, // ${lessons.length}节课 × 40分钟
      topics: ${JSON.stringify(topics)},
      lessons: [
${lessons.map((lesson, index) => `        {
          id: ${lesson.id},
          title: "${lesson.title}",
          duration: ${lesson.duration},
          description: "${lesson.description}",
          isPreview: ${lesson.isPreview},
          resources: ${JSON.stringify(lesson.resources)}
        }`).join(',\n')}
      ]
    }`;
}

// 更新课程文件的函数
function updateCourseFile(filePath, courseData) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 更新课程数据
    let updatedContent = content;
    
    // 更新chapters部分
    const chaptersMatch = content.match(/chapters:\s*\[([\s\S]*?)\],/);
    if (chaptersMatch) {
      const newChapters = courseData.chapters.map(chapter => 
        createChapterTemplate(
          chapter.id, 
          chapter.title, 
          chapter.description, 
          chapter.totalDuration, 
          chapter.topics, 
          chapter.lessons
        )
      ).join(',\n');
      
      updatedContent = content.replace(
        /chapters:\s*\[([\s\S]*?)\],/,
        `chapters: [\n${newChapters}\n  ],`
      );
    }
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ 已更新: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ 更新失败: ${path.basename(filePath)}`, error.message);
  }
}

// 课程数据模板
const courseTemplates = {
  'shaolin-legacy': {
    chapters: [
      {
        id: 1,
        title: "少林基础理论",
        description: "了解少林功夫的历史渊源、文化内涵和理论基础",
        totalDuration: 320,
        topics: ["少林历史", "文化内涵", "理论基础", "基本功"],
        lessons: Array.from({length: 8}, (_, i) => ({
          id: i + 1,
          title: `少林基础理论第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `少林功夫基础理论学习的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["理论资料", "练习指导"]
        }))
      },
      {
        id: 2,
        title: "少林基本功训练",
        description: "系统学习少林功夫的基本功训练方法",
        totalDuration: 480,
        topics: ["站桩", "马步", "基本功", "力量训练"],
        lessons: Array.from({length: 12}, (_, i) => ({
          id: i + 9,
          title: `少林基本功第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `少林功夫基本功训练的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["训练图解", "练习指导"]
        }))
      },
      {
        id: 3,
        title: "少林拳法学习",
        description: "学习少林拳法的基本套路和技巧",
        totalDuration: 400,
        topics: ["基本拳法", "套路学习", "技巧掌握", "实战应用"],
        lessons: Array.from({length: 10}, (_, i) => ({
          id: i + 21,
          title: `少林拳法第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `少林拳法学习的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["拳法图解", "练习指导"]
        }))
      },
      {
        id: 4,
        title: "少林器械训练",
        description: "学习少林功夫的器械使用技巧",
        totalDuration: 320,
        topics: ["器械基础", "器械套路", "器械技巧", "器械应用"],
        lessons: Array.from({length: 8}, (_, i) => ({
          id: i + 31,
          title: `少林器械第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `少林器械训练的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["器械图解", "练习指导"]
        }))
      }
    ]
  },
  'wing-chun-combat': {
    chapters: [
      {
        id: 1,
        title: "咏春拳基础理论",
        description: "了解咏春拳的历史渊源、理论体系和实战原理",
        totalDuration: 320,
        topics: ["咏春历史", "理论体系", "实战原理", "基本功"],
        lessons: Array.from({length: 8}, (_, i) => ({
          id: i + 1,
          title: `咏春基础理论第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `咏春拳基础理论学习的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["理论资料", "练习指导"]
        }))
      },
      {
        id: 2,
        title: "咏春基本功训练",
        description: "系统学习咏春拳的基本功训练方法",
        totalDuration: 480,
        topics: ["站桩", "马步", "基本功", "力量训练"],
        lessons: Array.from({length: 12}, (_, i) => ({
          id: i + 9,
          title: `咏春基本功第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `咏春拳基本功训练的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["训练图解", "练习指导"]
        }))
      },
      {
        id: 3,
        title: "咏春拳法学习",
        description: "学习咏春拳的基本套路和技巧",
        totalDuration: 400,
        topics: ["基本拳法", "套路学习", "技巧掌握", "实战应用"],
        lessons: Array.from({length: 10}, (_, i) => ({
          id: i + 21,
          title: `咏春拳法第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `咏春拳法学习的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["拳法图解", "练习指导"]
        }))
      },
      {
        id: 4,
        title: "咏春实战技巧",
        description: "学习咏春拳的实战应用技巧",
        totalDuration: 320,
        topics: ["实战技巧", "实战应用", "实战训练", "实战评估"],
        lessons: Array.from({length: 8}, (_, i) => ({
          id: i + 31,
          title: `咏春实战第${i + 1}课`,
          duration: 35 + Math.floor(Math.random() * 10),
          description: `咏春拳实战技巧的第${i + 1}课`,
          isPreview: i === 0,
          resources: ["实战图解", "练习指导"]
        }))
      }
    ]
  }
};

// 更新所有课程文件
console.log('🚀 开始更新课程文件...\n');

Object.entries(courseTemplates).forEach(([courseId, template]) => {
  const filePath = path.join(__dirname, '..', 'data', 'courses', `${courseId}.ts`);
  if (fs.existsSync(filePath)) {
    updateCourseFile(filePath, template);
  } else {
    console.log(`⚠️  文件不存在: ${courseId}.ts`);
  }
});

console.log('\n✨ 课程文件更新完成！');
