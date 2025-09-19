export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// 页面浏览跟踪
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 事件跟踪
export const event = ({ 
  action, 
  category, 
  label, 
  value 
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 购买事件跟踪
export const purchase = ({
  transaction_id,
  value,
  currency = 'USD',
  items
}: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id,
      value,
      currency,
      items,
    });
  }
};

// 用户注册事件跟踪
export const signUp = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method,
    });
  }
};

// 登录事件跟踪
export const login = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method,
    });
  }
};

// 课程浏览事件跟踪
export const viewCourse = (courseId: string, courseName: string, category: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: 0,
      items: [{
        item_id: courseId,
        item_name: courseName,
        category: category,
        quantity: 1,
        price: 0,
      }],
    });
  }
};

// 课程购买事件跟踪
export const purchaseCourse = (courseId: string, courseName: string, category: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `course_${courseId}_${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [{
        item_id: courseId,
        item_name: courseName,
        category: category,
        quantity: 1,
        price: price,
      }],
    });
  }
};

// 视频播放事件跟踪
export const playVideo = (videoId: string, courseId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'video_play', {
      video_id: videoId,
      course_id: courseId,
    });
  }
};

// 视频完成事件跟踪
export const completeVideo = (videoId: string, courseId: string, progress: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'video_complete', {
      video_id: videoId,
      course_id: courseId,
      progress: progress,
    });
  }
};
