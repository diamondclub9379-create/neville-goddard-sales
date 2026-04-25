import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Users, BookOpen } from "lucide-react";
import { Streamdown } from "streamdown";
import { COMMUNITY_PATH } from "@/const";

export default function BlogArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">ไม่พบบทความ</h1>
        <Button onClick={() => navigate("/blog")} variant="outline">
          <ArrowLeft className="mr-2" size={20} /> กลับไปหน้าบทความ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          onClick={() => navigate("/blog")}
          variant="ghost"
          className="text-amber-400 hover:text-amber-300 mb-8"
        >
          <ArrowLeft className="mr-2" size={20} /> กลับไปหน้าบทความ
        </Button>

        {/* Featured Image */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8 shadow-2xl"
          />
        )}

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          <div className="flex gap-4 text-gray-400 text-sm">
            <span>โดย {post.author || "ไม่ระบุ"}</span>
            <span>•</span>
            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("th-TH")}</span>
            {post.category && (
              <>
                <span>•</span>
                <span className="text-amber-400">{post.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none mb-12">
          <Streamdown>{post.content}</Streamdown>
        </div>

        {/* End-of-article CTA: Community + Books */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <a
            href={COMMUNITY_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-400/40 rounded-xl p-6 hover:border-emerald-400/70 hover:from-emerald-600/30 hover:to-teal-600/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Users className="text-emerald-300" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-emerald-300 font-bold text-lg mb-1 group-hover:text-emerald-200">
                  เข้าร่วมชุมชนฟรี
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  มาเจอเพื่อนที่ฝึก Manifest เหมือนกัน แชร์ประสบการณ์ และรับเทคนิคพิเศษทุกสัปดาห์
                </p>
                <span className="text-emerald-300 font-semibold text-sm group-hover:underline">
                  เข้าร่วมเลย →
                </span>
              </div>
            </div>
          </a>
          <a
            href="/#books"
            className="group bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-xl p-6 hover:border-amber-400/70 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <BookOpen className="text-amber-300" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-amber-300 font-bold text-lg mb-1 group-hover:text-amber-200">
                  อ่านหนังสือ Neville Goddard
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  เจาะลึกหลักการ Manifest กับฉบับแปลไทย อ่านง่าย เข้าใจลึก
                </p>
                <span className="text-amber-300 font-semibold text-sm group-hover:underline">
                  ดูหนังสือทั้งหมด →
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => navigate("/blog")}
          variant="outline"
          className="text-amber-400 border-amber-400/50 hover:bg-amber-400/10"
        >
          <ArrowLeft className="mr-2" size={20} /> กลับไปหน้าบทความ
        </Button>
      </div>
    </div>
  );
}
