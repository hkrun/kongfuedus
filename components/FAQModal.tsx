'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!isOpen) return null;

  // FAQ 数据
  const faqs = [
    {
      category: t('faq.categories.courseAccess'),
      items: [
        { q: t('faq.courseAccess.q1'), a: t('faq.courseAccess.a1') },
        { q: t('faq.courseAccess.q2'), a: t('faq.courseAccess.a2') },
        { q: t('faq.courseAccess.q3'), a: t('faq.courseAccess.a3') },
        { q: t('faq.courseAccess.q4'), a: t('faq.courseAccess.a4') },
      ]
    },
    {
      category: t('faq.categories.membership'),
      items: [
        { q: t('faq.membership.q1'), a: t('faq.membership.a1') },
        { q: t('faq.membership.q2'), a: t('faq.membership.a2') },
        { q: t('faq.membership.q3'), a: t('faq.membership.a3') },
        { q: t('faq.membership.q4'), a: t('faq.membership.a4') },
      ]
    },
    {
      category: t('faq.categories.payment'),
      items: [
        { q: t('faq.payment.q1'), a: t('faq.payment.a1') },
        { q: t('faq.payment.q2'), a: t('faq.payment.a2') },
        { q: t('faq.payment.q3'), a: t('faq.payment.a3') },
        { q: t('faq.payment.q4'), a: t('faq.payment.a4') },
      ]
    },
    {
      category: t('faq.categories.learning'),
      items: [
        { q: t('faq.learning.q1'), a: t('faq.learning.a1') },
        { q: t('faq.learning.q2'), a: t('faq.learning.a2') },
        { q: t('faq.learning.q3'), a: t('faq.learning.a3') },
        { q: t('faq.learning.q4'), a: t('faq.learning.a4') },
      ]
    },
    {
      category: t('faq.categories.account'),
      items: [
        { q: t('faq.account.q1'), a: t('faq.account.a1') },
        { q: t('faq.account.q2'), a: t('faq.account.a2') },
        { q: t('faq.account.q3'), a: t('faq.account.a3') },
      ]
    },
    {
      category: t('faq.categories.technical'),
      items: [
        { q: t('faq.technical.q1'), a: t('faq.technical.a1') },
        { q: t('faq.technical.q2'), a: t('faq.technical.a2') },
        { q: t('faq.technical.q3'), a: t('faq.technical.a3') },
      ]
    }
  ];

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('faq.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa fa-times text-2xl"></i>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">{t('faq.description')}</p>

          {/* FAQ 列表 */}
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-orange-500 mr-3"></span>
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const currentIndex = globalIndex++;
                    return (
                      <div
                        key={currentIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleFAQ(currentIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-800 pr-4">{item.q}</span>
                          <i className={`fa fa-chevron-${openIndex === currentIndex ? 'up' : 'down'} text-orange-500 flex-shrink-0`}></i>
                        </button>
                        {openIndex === currentIndex && (
                          <div className="px-4 pb-4 pt-2 text-gray-600 bg-gray-50 border-t border-gray-200">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 底部联系信息 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-gray-700 text-sm">
              <i className="fa fa-info-circle text-blue-500 mr-2"></i>
              {t('faq.stillNeedHelp')} 
              <a href="mailto:zjhkrun@gmail.com" className="text-orange-500 hover:text-orange-600 font-medium ml-1">
                zjhkrun@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

