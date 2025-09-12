const fs = require('fs');
const path = require('path');

// 课程配置
const courses = [
  'tai-chi-master',
  'shaolin-legacy', 
  'wing-chun-combat',
  'kung-fu-basics',
  'taiji-health',
  'sword-mastery',
  'self-defense-master',
  'martial-arts-fusion'
];

// 为每个课程创建目录和示例字幕文件
courses.forEach(courseId => {
  const courseDir = path.join(__dirname, '..', 'public', 'subtitles', courseId);
  const zhDir = path.join(courseDir, 'zh');
  const enDir = path.join(courseDir, 'en');
  
  // 创建目录
  if (!fs.existsSync(courseDir)) {
    fs.mkdirSync(courseDir, { recursive: true });
  }
  if (!fs.existsSync(zhDir)) {
    fs.mkdirSync(zhDir, { recursive: true });
  }
  if (!fs.existsSync(enDir)) {
    fs.mkdirSync(enDir, { recursive: true });
  }
  
  // 创建示例字幕文件（前3课）
  for (let i = 1; i <= 3; i++) {
    const zhSubtitle = `WEBVTT

00:00:00.000 --> 00:00:05.000
欢迎来到${courseId}课程
我是您的武术导师

00:00:05.000 --> 00:00:10.000
今天我们将学习第${i}课的内容
这是课程的重要组成部分

00:00:10.000 --> 00:00:15.000
首先，让我们了解基本概念
这是学习的基础

00:00:15.000 --> 00:00:20.000
接下来，我们将学习具体技巧
请仔细观察每个动作

00:00:20.000 --> 00:00:25.000
记住，练习是掌握技能的关键
需要反复练习才能熟练

00:00:25.000 --> 00:00:30.000
现在让我们开始练习
确保动作的准确性

00:00:30.000 --> 00:00:35.000
这节课就到这里
下节课我们将学习更多内容`;

    const enSubtitle = `WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome to the ${courseId} course
I am your martial arts instructor

00:00:05.000 --> 00:00:10.000
Today we will learn lesson ${i}
This is an important part of the course

00:00:10.000 --> 00:00:15.000
First, let's understand the basic concepts
This is the foundation of learning

00:00:15.000 --> 00:00:20.000
Next, we will learn specific techniques
Please observe each movement carefully

00:00:20.000 --> 00:00:25.000
Remember, practice is the key to mastering skills
You need to practice repeatedly to become proficient

00:00:25.000 --> 00:00:30.000
Now let's start practicing
Ensure the accuracy of movements

00:00:30.000 --> 00:00:35.000
That's all for this lesson
Next lesson we will learn more content`;

    // 写入中文字幕文件
    fs.writeFileSync(path.join(zhDir, `lesson-${i}.vtt`), zhSubtitle, 'utf8');
    
    // 写入英文字幕文件
    fs.writeFileSync(path.join(enDir, `lesson-${i}.vtt`), enSubtitle, 'utf8');
  }
  
  console.log(`✅ 已为课程 ${courseId} 创建字幕文件`);
});

console.log('🎉 所有课程的字幕文件创建完成！');
