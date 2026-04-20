import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { Streamdown } from "streamdown";

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
