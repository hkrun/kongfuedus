# 通用组件说明

## Header 组件

### 功能描述
`Header` 组件是一个通用的页面顶部导航组件，包含：
- Logo 和品牌名称
- 登录/注册按钮
- 移动端菜单按钮

### 使用方法

#### 1. 导入组件
```tsx
import Header from "../components/Header";
```

#### 2. 在页面中使用
```tsx
export default function YourPage() {
  return (
    <main>
      <Header />
      {/* 其他页面内容 */}
    </main>
  );
}
```

### 已使用该组件的页面
- `/` - 首页
- `/courses` - 课程列表页
- `/courses/[courseId]` - 课程详情页

### 优势
1. **代码复用** - 避免在每个页面重复编写相同的header代码
2. **统一维护** - 修改header时只需要改一个地方
3. **保持一致性** - 确保所有页面的header完全一致
4. **提高开发效率** - 新页面直接引用组件即可

### 注意事项
- 组件使用 `"use client"` 指令，支持客户端交互
- 包含响应式设计，支持移动端和桌面端
- 使用 Tailwind CSS 进行样式设计
- 支持滚动时的阴影效果
