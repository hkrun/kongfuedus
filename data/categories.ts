export const categories = [
  {
    id: "all",
    title: "All Courses",
    description: "Browse all our martial arts courses",
    icon: "fa fa-th",
    color: "rgb(59 130 246 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "striking",
    title: "拳术类",
    description: "Courses focusing on punches, strikes, and stand-up techniques",
    icon: "fa fa-fist-raised",
    color: "rgb(237 137 54 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "taiji",
    title: "太极类",
    description: "Courses featuring Tai Chi and related internal martial arts",
    icon: "fa fa-yin-yang",
    color: "rgb(34 197 94 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "weapons",
    title: "器械类",
    description: "Training with traditional and modern martial arts weapons",
    icon: "fa fa-sword",
    color: "rgb(139 92 246 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "health",
    title: "养生类",
    description: "Martial arts practices for health, wellness, and longevity",
    icon: "fa fa-heart",
    color: "rgb(239 68 68 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "combat",
    title: "实战类",
    description: "Practical self-defense and real-world combat applications",
    icon: "fa fa-shield-alt",
    color: "rgb(16 185 129 / var(--tw-bg-opacity, 1))"
  },
  {
    id: "mixed",
    title: "综合类",
    description: "Combined disciplines and martial arts knowledge",
    icon: "fa fa-star",
    color: "rgb(245 158 11 / var(--tw-bg-opacity, 1))"
  }
];

export const getCategoryById = (id: string) => categories.find(category => category.id === id);
