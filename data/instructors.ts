import { Instructor } from "./types";

export const instructors: Instructor[] = [
  {
    id: "master-chen",
    name: {
      zh: "陈大师",
      en: "Master Chen",
      ja: "陳大師",
      ko: "천 대사",
      de: "Meister Chen",
      fr: "Maître Chen",
      ar: "المعلم تشن"
    },
    title: {
      zh: "陈式太极拳第18代传人",
      en: "18th Generation Chen Style Tai Chi Inheritor",
      ja: "陳式太極拳第18代継承者",
      ko: "진식 태극권 18대 전승자",
      de: "18. Generation Chen-Stil Tai Chi Erbe",
      fr: "18ème génération héritier du Tai Chi style Chen",
      ar: "وريث الجيل الثامن عشر لتاي تشي نمط تشن"
    },
    experience: {
      zh: "40年教学经验",
      en: "40 years of teaching experience",
      ja: "40年の教育経験",
      ko: "40년 교육 경험",
      de: "40 Jahre Unterrichtserfahrung",
      fr: "40 ans d'expérience d'enseignement",
      ar: "40 عاماً من الخبرة في التدريس"
    },
    bio: {
      zh: "陈大师自幼习武，深得陈式太极拳真传，在太极拳教学领域享有盛誉。",
      en: "Master Chen has practiced martial arts since childhood and has inherited the authentic Chen Style Tai Chi, enjoying great reputation in the field of Tai Chi teaching.",
      ja: "陳大師は幼少期から武術を習い、陳式太極拳の真伝を深く受け継ぎ、太極拳教育分野で高い評価を得ています。",
      ko: "천 대사는 어린 시절부터 무술을 연습했으며 진식 태극권의 진전을 깊이 받아들여 태극권 교육 분야에서 높은 명성을 누리고 있습니다.",
      de: "Meister Chen praktiziert seit seiner Kindheit Kampfkunst und hat das authentische Chen-Stil Tai Chi geerbt, genießt großes Ansehen im Bereich des Tai Chi Unterrichts.",
      fr: "Maître Chen pratique les arts martiaux depuis l'enfance et a hérité du Tai Chi authentique du style Chen, jouissant d'une grande réputation dans le domaine de l'enseignement du Tai Chi.",
      ar: "المعلم تشن يمارس الفنون القتالية منذ الطفولة وقد ورث تاي تشي الأصيل من نمط تشن، ويتمتع بسمعة طيبة في مجال تدريس تاي تشي."
    },
    image: "https://picsum.photos/id/325/200/200", // 修复：avatar -> image
    specialties: [
      {
        zh: "陈式太极拳",
        en: "Chen Style Tai Chi",
        ja: "陳式太極拳",
        ko: "진식 태극권",
        de: "Chen-Stil Tai Chi",
        fr: "Tai Chi style Chen",
        ar: "تاي تشي نمط تشن"
      },
      {
        zh: "内功心法",
        en: "Internal Power Methods",
        ja: "内功心法",
        ko: "내공 심법",
        de: "Innere Kraft Methoden",
        fr: "Méthodes de pouvoir interne",
        ar: "طرق القوة الداخلية"
      },
      {
        zh: "养生功法",
        en: "Health Preservation Techniques",
        ja: "養生功法",
        ko: "양생 공법",
        de: "Gesundheitserhaltungstechniken",
        fr: "Techniques de préservation de la santé",
        ar: "تقنيات الحفاظ على الصحة"
      }
    ],
    achievements: [
      {
        zh: "国家级武术教练",
        en: "National Level Martial Arts Coach",
        ja: "国家レベル武術コーチ",
        ko: "국가급 무술 코치",
        de: "Nationaler Kampfkunst-Trainer",
        fr: "Entraîneur d'arts martiaux de niveau national",
        ar: "مدرب فنون قتالية على المستوى الوطني"
      },
      {
        zh: "太极拳比赛冠军",
        en: "Tai Chi Competition Champion",
        ja: "太極拳大会チャンピオン",
        ko: "태극권 대회 챔피언",
        de: "Tai Chi Wettkampf-Champion",
        fr: "Champion de compétition Tai Chi",
        ar: "بطل مسابقة تاي تشي"
      },
      {
        zh: "武术文化传播奖",
        en: "Martial Arts Culture Promotion Award",
        ja: "武術文化普及賞",
        ko: "무술 문화 보급상",
        de: "Kampfkunst-Kultur-Förderpreis",
        fr: "Prix de promotion de la culture des arts martiaux",
        ar: "جائزة تعزيز ثقافة الفنون القتالية"
      }
    ]
  },
  {
    id: "master-li",
    name: "李大师",
    title: "少林寺武僧",
    experience: "25年少林功夫传承",
    bio: "李大师自幼在少林寺出家习武，精通少林七十二绝技，是少林功夫的重要传承人。",
    image: "https://picsum.photos/id/328/200/200", // 修复：avatar -> image
    specialties: ["少林拳法", "少林腿法", "少林器械", "少林内功"],
    achievements: ["少林寺武僧", "少林功夫传承人", "武术大师"]
  },
  {
    id: "master-wong",
    name: "王师傅",
    title: "叶问咏春拳第三代传人",
    experience: "30年实战格斗经验",
    bio: "王师傅是叶问咏春拳的嫡传弟子，在实战格斗和咏春拳教学方面有着丰富的经验。",
    image: "https://picsum.photos/id/329/200/200", // 修复：avatar -> image
    specialties: ["咏春拳", "实战格斗", "自卫技巧"],
    achievements: ["咏春拳传承人", "格斗比赛冠军", "自卫术专家"]
  }
];

export const getInstructorById = (id: string): Instructor | undefined => {
  return instructors.find(instructor => instructor.id === id);
};
