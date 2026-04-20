import { Share2, Facebook, MessageCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReviewShareButtonsProps {
  reviewerName: string;
  reviewContent: string;
  bookTitle: string;
  rating: number;
}

export default function ReviewShareButtons({
  reviewerName,
  reviewContent,
  bookTitle,
  rating,
}: ReviewShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Generate share text
  const shareText = `⭐ ${rating}/5 stars - "${reviewContent.substring(0, 100)}..." - ${reviewerName} reviewing "${bookTitle}"`;
  const bookUrl = typeof window !== "undefined" ? window.location.href : "";

  // Facebook Share
  const handleFacebookShare = () => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookShareUrl, "facebook-share", "width=600,height=400");
    toast.success("เปิดหน้า Facebook แชร์แล้ว");
  };

  // LINE Share
  const handleLineShare = () => {
    const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + " " + bookUrl)}`;
    window.open(lineShareUrl, "line-share");
    toast.success("เปิด LINE แชร์แล้ว");
  };

  // Copy to Clipboard
  const handleCopyLink = async () => {
    try {
      const textToCopy = `${shareText}\n\n${bookUrl}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("คัดลอกรีวิวแล้ว!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("ไม่สามารถคัดลอกได้");
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">แชร์:</span>
      
      {/* Facebook Share Button */}
      <button
        onClick={handleFacebookShare}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-colors"
        title="แชร์ไปยัง Facebook"
      >
        <Facebook size={14} />
        <span className="hidden sm:inline">Facebook</span>
      </button>

      {/* LINE Share Button */}
      <button
        onClick={handleLineShare}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 transition-colors"
        title="แชร์ไปยัง LINE"
      >
        <MessageCircle size={14} />
        <span className="hidden sm:inline">LINE</span>
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 transition-colors"
        title="คัดลอกลิงก์"
      >
        {copied ? (
          <>
            <Check size={14} />
            <span className="hidden sm:inline">คัดลอกแล้ว</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span className="hidden sm:inline">คัดลอก</span>
          </>
        )}
      </button>
    </div>
  );
}
