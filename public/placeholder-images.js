// 占位图片说明文件
// 这些是首页 VIDEO 卡片区域的背景图片
// 您可以根据需要替换为实际的图片文件

const placeholderImages = [
  {
    filename: "procreate-creativity-bg.jpg",
    description: "Procreate 创意绘画背景图 - 建议使用绘画、创意相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "canva-social-media-bg.jpg", 
    description: "Canva 社交媒体背景图 - 建议使用社交媒体设计相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "watercolor-landscape-bg.jpg",
    description: "水彩风景背景图 - 建议使用水彩画风景图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "figma-ui-design-bg.jpg",
    description: "Figma UI 设计背景图 - 建议使用 UI/UX 设计相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "chatgpt-creative-bg.jpg",
    description: "ChatGPT 创意背景图 - 建议使用 AI、创意相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "beginner-drawing-bg.jpg",
    description: "初学者绘画背景图 - 建议使用绘画教程相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "premiere-pro-video-bg.jpg",
    description: "Premiere Pro 视频剪辑背景图 - 建议使用视频制作相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  },
  {
    filename: "iphone-photography-bg.jpg",
    description: "iPhone 摄影背景图 - 建议使用手机摄影相关的图片",
    size: "建议尺寸: 400x225px (16:9 比例)"
  }
];

console.log("需要创建的占位图片:");
placeholderImages.forEach(img => {
  console.log(`- ${img.filename}: ${img.description} (${img.size})`);
});

export default placeholderImages;
