import { Link } from "wouter";
import { blogArticles } from "@/data/blogArticles";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";

export default function Blog() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <Badge className="mb-4 bg-amber-400/20 text-amber-300 border-amber-400/30 text-sm px-4 py-1">
            บทความ & ความรู้
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            ศาสตร์แห่ง{" "}
            <span className="text-amber-400">Neville Goddard</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            เรียนรู้หลักการ Law of Assumption, SATS, Revision และคำสอนที่ทรงพลังที่สุดจากปรมาจารย์แห่งการสร้างสรรค์ความเป็นจริง
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogArticles.map((article, index) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <article className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/5 cursor-pointer h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30 select-none">{article.emoji}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 to-slate-900/60" />
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {article.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-amber-400 group-hover:gap-2 transition-all">
                      อ่านต่อ <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/20 border border-amber-400/20 rounded-2xl p-10">
          <BookOpen className="mx-auto mb-4 text-amber-400" size={40} />
          <h2 className="text-2xl font-bold text-white mb-2">
            พร้อมเริ่มต้นการเดินทางแล้วหรือยัง?
          </h2>
          <p className="text-gray-400 mb-6">
            เลือกหนังสือของ Neville Goddard ฉบับแปลไทย เริ่มต้นเปลี่ยนชีวิตวันนี้
          </p>
          <Link href="/">
            <button className="bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors">
              ดูหนังสือทั้งหมด →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
