import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function BlogListing() {
  const [page, setPage] = useState(1);
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.blog.list.useQuery({ page, limit: 10 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-12">บทความและเรียนรู้</h1>

        <div className="grid gap-6">
          {data?.posts.map((post) => (
            <Card key={post.id} className="bg-slate-800 border-amber-400/20 hover:border-amber-400/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                    <p className="text-sm text-gray-400 mb-3">
                      โดย {post.author || "ไม่ระบุ"} • {new Date(post.createdAt).toLocaleDateString("th-TH")}
                    </p>
                    <p className="text-gray-300 mb-4">{post.excerpt}</p>
                    <div className="flex gap-2 items-center">
                      {post.category && (
                        <span className="text-xs bg-amber-400/20 text-amber-400 px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                      )}
                      <Button
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        variant="outline"
                        className="text-amber-400 border-amber-400/50 hover:bg-amber-400/10"
                      >
                        อ่านต่อ →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {data && data.total > 10 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
            >
              ← ก่อนหน้า
            </Button>
            <span className="text-white flex items-center px-4">
              หน้า {page} จาก {Math.ceil(data.total / 10)}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / 10)}
              variant="outline"
            >
              ถัดไป →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
