const fs = require('fs');

// 读取文件
let content = fs.readFileSync('data/courses/strangle-escape.ts', 'utf8');

// 统计需要修复的对象数量
const matches = content.match(/\{\s*zh:\s*"[^"]+",\s*en:\s*"[^"]+",\s*ja:\s*"[^"]+",\s*ko:\s*"[^"]+"\s*\}/g);
console.log(`Found ${matches ? matches.length : 0} objects that need language fields added`);

// 为所有只有4种语言的对象添加缺失的3种语言字段
content = content.replace(/\{\s*zh:\s*"([^"]+)",\s*en:\s*"([^"]+)",\s*ja:\s*"([^"]+)",\s*ko:\s*"([^"]+)"\s*\}/g, (match, zh, en, ja, ko) => {
  return `{
    zh: "${zh}",
    en: "${en}",
    ja: "${ja}",
    ko: "${ko}",
    de: "${en}",
    fr: "${en}",
    ar: "${en}"
  }`;
});

// 写回文件
fs.writeFileSync('data/courses/strangle-escape.ts', content);
console.log('Successfully added missing language fields (de, fr, ar) to all objects');

