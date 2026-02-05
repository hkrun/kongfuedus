"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Header from "@/components/Header";
import ContactModal from "@/components/ContactModal";
import FAQModal from "@/components/FAQModal";
import {
  getMultiLangContent,
  getLocaleFromPath,
  SupportedLocale,
} from "@/utils/i18n";

type HomePageClientProps = {
  initialPopularCourses: any[];
  initialLocaleKey: SupportedLocale;
  initialFullLocale: string;
};

export default function HomePageClient({
  initialPopularCourses,
  initialLocaleKey,
  initialFullLocale,
}: HomePageClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] =
    useState<SupportedLocale>(initialLocaleKey);
  const [fullLocale, setFullLocale] = useState<string>(initialFullLocale);
  const [popularCourses, setPopularCourses] = useState<any[]>(
    initialPopularCourses
  );
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

  const textTruncateStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "1.4em",
    maxHeight: "2.8em",
  };

  useEffect(() => {
    setCurrentLocale(getLocaleFromPath(window.location.pathname));
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    setFullLocale(pathSegments[0] || "zh-CN");
    const mobileMenuButton = document.querySelector(".fa-bars")?.parentElement;
    const mobileMenu = document.querySelector(".md\\:hidden:not(.hidden)");
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("hidden");
      });
    }
    const handleScroll = () => {
      const header = document.querySelector("header");
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add("shadow-md", "bg-white/95", "backdrop-blur-sm");
        } else {
          header.classList.remove(
            "shadow-md",
            "bg-white/95",
            "backdrop-blur-sm"
          );
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      <Header />
      <section
        className="relative text-white overflow-hidden"
        style={{
          backgroundColor: "rgb(26 54 93 / var(--tw-bg-opacity, 1))",
        }}
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/id/176/1920/1080"
            alt="Martial arts training"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20">
          <div className="max-w-3xl">
            <h1
              className="font-bold text-[clamp(2.5rem,5vw,4rem)] leading-tight mb-6 drop-shadow-lg"
              style={{ fontFamily: "Montserrat, sans-serif" }}
              dangerouslySetInnerHTML={{ __html: t("home.hero.title") }}
            />
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-gray-100 mb-8 max-w-2xl">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/courses`}
                className="px-8 py-3 text-white font-semibold rounded-md hover:bg-orange-600 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{
                  backgroundColor: "rgb(237 137 54 / var(--tw-bg-opacity, 1))",
                }}
              >
                {t("home.hero.exploreCourses")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4"
              style={{
                color: "rgb(26 54 93 / var(--tw-text-opacity, 1))",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {t("home.features.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t("home.features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgb(26 54 93 / 0.1)" }}
              >
                <i
                  className="fa fa-video-camera text-blue-900"
                  style={{ fontSize: "1.5rem !important" }}
                ></i>
              </div>
              <h3 className="font-semibold text-xl text-gray-800 mb-3">
                {t("home.features.highQuality")}
              </h3>
              <p className="text-gray-600">
                {t("home.features.highQualityDesc")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgb(26 54 93 / 0.1)" }}
              >
                <i
                  className="fa fa-users text-blue-900"
                  style={{ fontSize: "1.5rem !important" }}
                ></i>
              </div>
              <h3 className="font-semibold text-xl text-gray-800 mb-3">
                {t("home.features.expertInstructors")}
              </h3>
              <p className="text-gray-600">
                {t("home.features.expertInstructorsDesc")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgb(26 54 93 / 0.1)" }}
              >
                <i
                  className="fa fa-comments text-blue-900"
                  style={{ fontSize: "1.5rem !important" }}
                ></i>
              </div>
              <h3 className="font-semibold text-xl text-gray-800 mb-3">
                {t("home.features.flexibleLearning")}
              </h3>
              <p className="text-gray-600">
                {t("home.features.flexibleLearningDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2
                className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-3"
                style={{
                  color: "rgb(26 54 93 / var(--tw-text-opacity, 1))",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                {t("home.courses.title")}
              </h2>
              <p className="text-gray-600 max-w-2xl">
                {t("home.courses.subtitle")}
              </p>
            </div>
            <Link
              href={`/${locale}/courses`}
              className="hidden sm:flex items-center font-medium transition-all duration-300"
              style={{
                color: "rgb(237 137 54 / var(--tw-text-opacity, 1))",
              }}
            >
              {t("home.courses.viewAll")} <i className="fa fa-arrow-right ml-2"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularCourses && popularCourses.length > 0 ? (
              popularCourses.map((course: any, index: number) => (
                <div
                  key={course.id}
                  className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="relative">
                    <Image
                      src={course.image}
                      alt={getMultiLangContent(course.title, currentLocale) || course.id}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    {index === 0 && (
                      <div
                        className="absolute top-3 right-3 text-white text-sm font-semibold px-3 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            "rgb(237 137 54 / var(--tw-bg-opacity, 1))",
                        }}
                      >
                        {t("home.courses.mostPopular")}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        <i className="fa fa-clock-o mr-1"></i> {course.duration}
                      </span>
                      <span className="mx-3">•</span>
                      <span className="flex items-center">
                        <i className="fa fa-signal mr-1"></i>{" "}
                        {getMultiLangContent(course.difficulty, currentLocale)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 transition-all duration-300 group-hover:text-[#ed8936]">
                      {getMultiLangContent(course.title, currentLocale)}
                    </h3>
                    <p
                      className="text-gray-600 text-sm mb-4 flex-1"
                      style={textTruncateStyle}
                    >
                      {getMultiLangContent(
                        course.shortDescription || course.description,
                        currentLocale
                      )}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Image
                          src="https://picsum.photos/id/64/100/100"
                          alt={course.instructor}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600 ml-2">
                          {course.instructor}
                        </span>
                      </div>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            "rgb(26 54 93 / var(--tw-text-opacity, 1))",
                        }}
                      >
                        {course.price}
                      </span>
                    </div>
                    <Link
                      href={`/${fullLocale}/courses/${course.id}`}
                      className="block w-full py-2 text-white text-center rounded-md hover:bg-blue-800 transition-all duration-300"
                      style={{
                        backgroundColor:
                          "rgb(26 54 93 / var(--tw-bg-opacity, 1))",
                      }}
                    >
                      {t("home.courses.viewCourse")}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  {t("home.courses.loadingCourses")}
                </p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center font-medium transition-all duration-300"
              style={{
                color: "rgb(237 137 54 / var(--tw-text-opacity, 1))",
              }}
            >
              {t("home.courses.viewAll")} <i className="fa fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      <section
        className="py-16 text-white"
        style={{
          backgroundColor: "rgb(26 54 93 / var(--tw-bg-opacity, 1))",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("home.membership.title")}
            </h2>
            <p className="text-gray-200 max-w-2xl mx-auto text-lg">
              {t("home.membership.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                  style={{
                    backgroundColor:
                      "rgb(237 137 54 / var(--tw-bg-opacity, 1))",
                  }}
                >
                  <i
                    className="fa fa-unlock-alt text-white"
                    style={{ fontSize: "1.25rem !important" }}
                  ></i>
                </div>
                <h3 className="font-bold text-2xl">
                  {t("home.membership.monthlyMembership")}
                </h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {t("home.membership.price")}
                </span>
                <span className="text-gray-300">
                  {" "}
                  {t("home.membership.perMonth")}
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "unlimitedAccess",
                  "downloadVideos",
                  "whatsappAccess",
                  "liveQA",
                  "exclusiveContent",
                ].map((key) => (
                  <li key={key} className="flex items-start">
                    <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                    <span>
                      {t(`home.membership.features.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/courses`}
                className="block w-full py-3 text-white text-center font-semibold rounded-md hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor:
                    "rgb(237 137 54 / var(--tw-bg-opacity, 1))",
                }}
              >
                {t("home.membership.freeTrial")}
              </Link>
            </div>
            <div className="relative h-full">
              <Image
                src="https://picsum.photos/id/305/600/400"
                alt="Membership benefits"
                width={600}
                height={400}
                className="rounded-xl shadow-xl w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16"
        style={{ backgroundColor: "#F8F9FB" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4"
              style={{
                fontFamily: "Montserrat, sans-serif",
                color: "rgb(26 54 93)",
              }}
            >
              {t("home.testimonials.mainTitle")}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {t("home.testimonials.mainSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(["michael", "sophia", "david"] as const).map((key) => {
              const name = t(`home.testimonials.${key}.name`);
              const initial = name.trim().charAt(0);
              return (
                <div
                  key={key}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-amber-400 text-lg" aria-hidden>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed flex-1">
                    &ldquo;{t(`home.testimonials.${key}.comment`)}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white text-lg"
                      style={{
                        backgroundColor: "rgb(26 54 93)",
                      }}
                    >
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t(`home.testimonials.${key}.title`)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="py-16 text-white"
        style={{
          backgroundColor: "rgb(237 137 54 / var(--tw-bg-opacity, 1))",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t("home.cta.title")}
            </h2>
            <p className="text-gray-100 max-w-2xl mx-auto text-lg mb-8">
              {t("home.cta.subtitle")}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-block px-8 py-3 bg-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ color: "rgb(237 137 54 / var(--tw-text-opacity, 1))" }}
            >
              {t("home.cta.getStarted")}
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-white pt-16 pb-8 mt-20" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <i className="fa fa-shield mr-2" style={{ fontSize: '1.875rem', color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                <span className="font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.brandName')}</span>
              </div>
              <p className="text-gray-300 mb-6">{t('home.footer.brandDescription')}</p>
              <div className="flex space-x-4">
                <Link href="https://www.facebook.com/kongfumaster" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300"><i className="fa fa-facebook"></i></Link>
                <Link href="https://twitter.com/kongfumaster" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300"><i className="fa fa-twitter"></i></Link>
                <Link href="https://www.instagram.com/kongfumaster" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300"><i className="fa fa-instagram"></i></Link>
                <Link href="https://www.youtube.com/@kongfumaster" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300"><i className="fa fa-youtube-play"></i></Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.quickLinks')}</h3>
              <ul className="space-y-3">
                <li><Link href={`/${locale}`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('common.home')}</Link></li>
                <li><Link href={`/${locale}/courses`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.allCourses')}</Link></li>
                <li><Link href={`/${locale}/courses`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.instructors')}</Link></li>
                <li><Link href={`/${locale}/my`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.membership')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.blog')}</Link></li>
                <li><button onClick={() => setIsContactModalOpen(true)} className="text-gray-300 hover:text-orange-500 transition-all duration-300 text-left">{t('home.footer.contactUs')}</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('courses.categories.title')}</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.striking')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.taiji')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.weapons')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.health')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.combat')}</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('courses.categories.mixed')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.contactUs')}</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <i className="fa fa-envelope mr-3" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                  <span className="text-gray-300">{t('home.footer.email')}</span>
                </li>
              </ul>
              <div className="mt-6">
                <h4 className="font-medium mb-3">{t('home.footer.newsletter')}</h4>
                <form className="flex">
                  <input type="email" placeholder={t('home.footer.emailPlaceholder')} className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800" />
                  <button type="submit" className="px-4 py-2 rounded-r-md transition-all duration-300" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                    <i className="fa fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <p className="text-gray-400 text-sm">{t('home.footer.copyright')}</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
                <Link href={`/${locale}/legal/privacy`} className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">{t('home.footer.privacyPolicy')}</Link>
                <Link href={`/${locale}/legal/terms`} className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">{t('home.footer.termsOfService')}</Link>
                <Link href={`/${locale}/legal/refund`} className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">{t('home.footer.refundPolicy')}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />
    </main>
  );
}
