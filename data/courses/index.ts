import { taiChiMasterCourse } from "./tai-chi-master";
import { shaolinLegacyCourse } from "./shaolin-legacy";
import { wingChunCombatCourse } from "./wing-chun-combat";
import { kungFuBasicsCourse } from "./kung-fu-basics";
import { taijiHealthCourse } from "./taiji-health";
import { swordMasteryCourse } from "./sword-mastery";
import { selfDefenseMasterCourse } from "./self-defense-master";
import { martialArtsFusionCourse } from "./martial-arts-fusion";
import { selfDefenseCourse } from "./self-defense";
import { strangleEscapeCourse } from "./strangle-escape";
import { childrenMartialArtsCourse } from "./children-martial-arts";

export const courses = [
  taiChiMasterCourse,
  shaolinLegacyCourse,
  wingChunCombatCourse,
  kungFuBasicsCourse,
  taijiHealthCourse,
  swordMasteryCourse,
  selfDefenseMasterCourse,
  martialArtsFusionCourse,
  selfDefenseCourse,
  strangleEscapeCourse,
  childrenMartialArtsCourse
];

export const courseDetails = [
  taiChiMasterCourse,
  shaolinLegacyCourse,
  wingChunCombatCourse,
  kungFuBasicsCourse,
  taijiHealthCourse,
  swordMasteryCourse,
  selfDefenseMasterCourse,
  martialArtsFusionCourse,
  selfDefenseCourse,
  strangleEscapeCourse,
  childrenMartialArtsCourse
];

export const getCourseById = (id: string) => courses.find(course => course.id === id);

export const getCourseDetailById = (id: string) => courseDetails.find(course => course.id === id);

export const getCoursesByCategory = (categoryId: string) => {
  if (categoryId === "all") {
    return courses;
  }
  return courses.filter(course => course.category === categoryId);
};

export const getPopularCourses = (limit = 6) => {
  // 首先将"儿童武术"课程放在第一位，"绞杀技逃脱"课程放在第二位
  const childrenMartialArtsCourse = courses.find(course => course.id === 'children-martial-arts');
  const strangleEscapeCourse = courses.find(course => course.id === 'strangle-escape');
  const otherCourses = courses.filter(course => course.id !== 'children-martial-arts' && course.id !== 'strangle-escape');
  
  // 对其他课程按学生数量排序
  const sortedOtherCourses = otherCourses.sort((a, b) => b.students - a.students);
  
  // 将"儿童武术"放在第一位，"绞杀技逃脱"放在第二位，然后添加其他课程
  const result = [];
  if (childrenMartialArtsCourse) result.push(childrenMartialArtsCourse);
  if (strangleEscapeCourse) result.push(strangleEscapeCourse);
  result.push(...sortedOtherCourses);
  
  return result.slice(0, limit);
};

export const getRecommendedCourses = (limit = 6) => {
  return [...courses].sort((a, b) => b.rating - a.rating).slice(0, limit);
};

export const searchCourses = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return courses.filter(course => {
    // 处理多语言内容
    const title = typeof course.title === 'string' ? course.title : course.title.zh;
    const description = typeof course.description === 'string' ? course.description : course.description.zh;
    
    return title.toLowerCase().includes(lowercaseQuery) ||
           description.toLowerCase().includes(lowercaseQuery) ||
           course.instructor.toLowerCase().includes(lowercaseQuery);
  });
};
