"use client";
import React from "react";

type ImageItem = { src: string; alt: string };

type Props = {
  images?: ImageItem[];
  speedMs?: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: "/chapter10.jpg", alt: "创意课程章节10" },
  { src: "/chapter11.jpg", alt: "创意课程章节11" },
  { src: "/chapter12.jpg", alt: "创意课程章节12" },
  { src: "/chapter13.jpg", alt: "创意课程章节13" },
  { src: "/chapter14.jpg", alt: "创意课程章节14" },
  { src: "/chapter15.jpg", alt: "创意课程章节15" },
  { src: "/chapter16.jpg", alt: "创意课程章节16" },
  { src: "/chapter17.jpg", alt: "创意课程章节17" },
  { src: "/chapter18.jpg", alt: "创意课程章节18" },
  { src: "/beginner-drawing-bg.jpg", alt: "创意课程背景1" },
  { src: "/watercolor-landscape-bg.jpg", alt: "创意课程背景2" },
  { src: "/procreate-creativity-bg.jpg", alt: "创意课程背景3" },
  { src: "/figma-ui-design-bg.jpg", alt: "创意课程背景4" },
  { src: "/canva-social-media-bg.jpg", alt: "创意课程背景5" },
  { src: "/premiere-pro-video-bg.jpg", alt: "创意课程背景6" },
  { src: "/iphone-photography-bg.jpg", alt: "创意课程背景7" },
  { src: "/chatgpt-creative-bg.jpg", alt: "创意课程背景8" },
  { src: "/ttt.jpg", alt: "创意课程展示" },
];

export default function ImageMarquee({ images = DEFAULT_IMAGES, speedMs = 45000 }: Props) {
  const trackStyle: React.CSSProperties = {
    animationDuration: `${speedMs}ms`,
  };

  // 为实现无缝滚动，复制一份内容
  const content = (
    <div className="flex items-center gap-6 pr-6">
      {images.map((item, idx) => (
        <div key={`${item.src}-${idx}`} className="shrink-0">
          <img
            src={item.src}
            alt={item.alt}
            className="h-56 w-96 object-cover rounded-lg border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
            loading="lazy"
            onError={(e) => {
              // 图片加载失败时的处理
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="marquee select-none" aria-label="图片滚动区域">
      <div className="marquee-track" style={trackStyle}>
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}

