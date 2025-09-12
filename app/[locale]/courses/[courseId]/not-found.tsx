import Link from "next/link";
import Nav from "@/components/Nav";

export default function CourseNotFound() {
  return (
    <main>
      <Nav />
      
      <section className="bg-black text-white min-h-screen flex items-center">
        <div className="container-page text-center">
          <div className="max-w-2xl mx-auto">
            {/* 404 图标 */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-[rgba(0,255,132,1)] mb-4">
                404
              </div>
              <div className="w-24 h-1 bg-[rgba(0,255,132,1)] mx-auto"></div>
            </div>
            
            {/* 错误信息 */}
            <h1 className="text-4xl sm:text-5xl font-semibold mb-6">
              课程未找到
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              抱歉，您要查找的功夫课程不存在或已被移除。
              <br />
              可能是课程链接有误，或者该课程暂时下架。
            </p>
            
            {/* 建议操作 */}
            <div className="space-y-4 mb-10">
              <p className="text-lg text-gray-400">
                您可以尝试以下操作：
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• 检查课程链接是否正确</li>
                <li>• 返回首页浏览其他功夫课程</li>
                <li>• 使用搜索功能查找相关课程</li>
                <li>• 联系客服获取帮助</li>
              </ul>
            </div>
            
            {/* 行动按钮 */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/" 
                className="bg-[rgba(0,255,132,1)] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[rgba(0,255,132,0.8)] transition-colors"
              >
                返回首页
              </Link>
              <Link 
                href="/#experts" 
                className="border border-white/20 text-white px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                浏览课程
              </Link>
            </div>
            
            {/* 热门课程推荐 */}
            <div className="mt-16">
              <h2 className="text-2xl font-semibold mb-6">推荐功夫课程</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {[
                  { title: "太极拳大师课", href: "/courses/tai-chi-master" },
                  { title: "少林功夫传承", href: "/courses/shaolin-legacy" },
                  { title: "咏春拳实战", href: "/courses/wing-chun-combat" }
                ].map((course, index) => (
                  <Link 
                    key={index} 
                    href={course.href as any}
                    className="bg-[rgb(35,36,36)] p-4 rounded-lg hover:bg-[rgb(45,46,46)] transition-colors border border-white/10"
                  >
                    <div className="text-[rgba(0,255,132,1)] font-medium">
                      {course.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      点击查看详情 →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
