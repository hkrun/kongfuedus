import React from 'react';
import { getMultiLangContent, getLocaleFromPath, SupportedLocale } from '../utils/i18n';

interface Chapter {
  id: number;
  title: any; // 支持多语言对象
  description: any; // 支持多语言对象
  lessons: any[];
  order?: number;
  learningBenefits?: any; // 支持多语言对象
}

interface MilestoneTimelineProps {
  chapters: Chapter[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ chapters }) => {
  // 获取当前语言
  const currentLocale = getLocaleFromPath(typeof window !== 'undefined' ? window.location.pathname : '/');

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="w-2 h-6 bg-gradient-to-b from-orange-400 to-red-500 rounded-full mr-3"></span>
          学习里程碑
        </h3>
        <p className="text-gray-600 text-sm">完成每个章节，解锁新的武术技能</p>
      </div>

      <div className="space-y-6">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="relative">
            {index < chapters.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
            )}
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-400">
                  <div className="mb-3">
                                         <h4 className="font-semibold text-gray-900 text-sm mb-1">
                       第{chapter.id}章：{getMultiLangContent(chapter.title, currentLocale)}
                     </h4>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                      {getMultiLangContent(chapter.description, currentLocale)}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      {chapter.lessons.length} 课时
                    </div>
                  </div>

                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs font-medium text-gray-700">学习收益</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {chapter.learningBenefits ? getMultiLangContent(chapter.learningBenefits, currentLocale) : "掌握该章节的核心技能和知识"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">总进度</span>
          <span className="font-semibold text-gray-900">{chapters.length} 个里程碑</span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: '75%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneTimeline;
