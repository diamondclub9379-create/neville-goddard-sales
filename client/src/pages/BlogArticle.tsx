import { Link, useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { blogArticles } from "@/data/blogArticles";
import { books } from "@/data/books";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, ShoppingCart, Star, BookOpen, Share2, Copy, Check, Facebook } from "lucide-react";
import { toast } from "sonner";

// Simple markdown-to-HTML renderer for blog content
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-amber-400 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-amber-300">$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-amber-400 pl-4 py-2 my-4 bg-amber-400/5 rounded-r-lg text-amber-200 italic">$1</blockquote>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-amber-400 mt-1 flex-shrink-0">•</span><span>$1</span></li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="my-4 space-y-1">${match}</ul>`)
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="text-amber-400 font-bold mt-0.5 flex-shrink-0 w-5">→</span><span>$1</span></li>')
    // Paragraphs (double newline)
    .replace(/\n\n(?!<[hbuol])/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
    // Wrap in initial paragraph
    .replace(/^(?!<[hbuol])/, '<p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/$(?!<\/[hbuol])/, '</p>');
}

// LINE share icon component
function LineIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find((a) => a.slug === slug);
  const [cartCount, setCartCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Update document meta tags for SEO
  useEffect(() => {
    if (!article) return;

    const siteUrl = window.location.href;
    const siteTitle = `${article.title} | ไดมอนด์คลับ หนังสือ Neville Goddard ภาษาไทย`;
    const siteDescription = article.intro;

    // Update title
    document.title = siteTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (property) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMeta("description", siteDescription);
    updateMeta("keywords", `Neville Goddard, ${article.title}, Law of Assumption, Manifestation, หนังสือ Neville Goddard, ภาษาไทย`);

    // Open Graph
    updateMeta("og:title", siteTitle, true);
    updateMeta("og:description", siteDescription, true);
    updateMeta("og:url", siteUrl, true);
    updateMeta("og:type", "article", true);
    updateMeta("og:image", article.thumbnail, true);
    updateMeta("og:site_name", "ไดมอนด์คลับ", true);
    updateMeta("og:locale", "th_TH", true);

    // Twitter Card
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", siteTitle);
    updateMeta("twitter:description", siteDescription);
    updateMeta("twitter:image", article.thumbnail);

    return () => {
      // Reset title on unmount
      document.title = "หนังสือ Neville Goddard ฉบับแปลไทย - ไดมอนด์คลับ";
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">ไม่พบบทความ</h1>
          <Link href="/blog">
            <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300">
              กลับไปหน้าบทความ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedBooks = article.relatedBookIds
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean) as typeof books;

  const handleAddToCart = (bookTitle: string) => {
    setCartCount((c) => c + 1);
    toast.success(`เพิ่ม "${bookTitle}" ลงตะกร้าแล้ว`, {
      description: "ไปที่หน้าหลักเพื่อดูตะกร้าและชำระเงิน",
      action: {
        label: "ไปหน้าหลัก",
        onClick: () => (window.location.href = "/"),
      },
    });
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=400");
  };

  const handleShareLine = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${article.title}\n\n${article.intro}`);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, "_blank", "width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("คัดลอกลิงก์แล้ว!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  // Other articles (excluding current)
  const otherArticles = blogArticles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30">
            {article.emoji} {article.category}
          </Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
          {article.title}
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed mb-6">
          {article.intro}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-400" />
              บทความ Neville Goddard
            </span>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Share2 size={12} />
              แชร์:
            </span>
            <button
              onClick={handleShareFacebook}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 transition-all text-xs font-medium border border-blue-600/30"
              title="แชร์บน Facebook"
            >
              <Facebook size={14} />
              Facebook
            </button>
            <button
              onClick={handleShareLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 transition-all text-xs font-medium border border-green-600/30"
              title="แชร์บน LINE"
            >
              <LineIcon size={14} />
              LINE
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-gray-200 transition-all text-xs font-medium border border-slate-600/50"
              title="คัดลอกลิงก์"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
            </button>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div
          className="prose-custom text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
      </div>

      {/* Share Section at Bottom of Article */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-4 text-sm">ถ้าบทความนี้มีประโยชน์ แชร์ให้เพื่อนได้เลย 🙏</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleShareFacebook}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 transition-all text-sm font-medium border border-blue-600/30"
            >
              <Facebook size={16} />
              แชร์บน Facebook
            </button>
            <button
              onClick={handleShareLine}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 transition-all text-sm font-medium border border-green-600/30"
            >
              <LineIcon size={16} />
              แชร์บน LINE
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-gray-400 hover:text-gray-200 transition-all text-sm font-medium border border-slate-600/50"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์บทความ"}
            </button>
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      <div className="bg-gradient-to-r from-amber-900/20 via-slate-900 to-amber-900/20 border-t border-amber-400/20 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-amber-400" size={24} />
            <h2 className="text-2xl font-bold text-white">หนังสือที่เกี่ยวข้อง</h2>
          </div>
          <p className="text-gray-400 mb-8">
            หนังสือ Neville Goddard ฉบับแปลไทยที่เกี่ยวข้องกับบทความนี้ — เริ่มต้นการเดินทางของคุณวันนี้
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {relatedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col"
              >
                {/* Book Image */}
                <div className="relative h-48 bg-slate-800 overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.titleTh}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {book.isNew && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-400 text-slate-900 text-xs font-bold">ใหม่</Badge>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-base leading-snug mb-1">
                    {book.titleTh}
                  </h3>
                  <p className="text-amber-400/70 text-xs italic mb-2">{book.titleEn}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
                    {book.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(book.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                      />
                    ))}
                    <span className="text-gray-400 text-xs ml-1">({book.sold} ชิ้น)</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-amber-400">฿{book.price}</span>
                    <div className="flex gap-2">
                      <Link href="/">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 text-xs"
                        >
                          ดูรายละเอียด
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-amber-400 text-slate-900 hover:bg-amber-300 text-xs"
                        onClick={() => handleAddToCart(book.titleTh)}
                      >
                        <ShoppingCart size={12} className="mr-1" />
                        ซื้อเลย
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shop CTA */}
          <div className="mt-10 text-center">
            <Link href="/">
              <Button className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold px-8 py-3 text-base">
                ดูหนังสือทั้งหมด 16 เล่ม →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* More Articles */}
      {otherArticles.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">บทความอื่นที่น่าสนใจ</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {otherArticles.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`}>
                <div className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-amber-400/40 transition-all cursor-pointer">
                  <div className="text-3xl mb-3">{a.emoji}</div>
                  <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs mb-2">
                    {a.category}
                  </Badge>
                  <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-2">{a.readTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
