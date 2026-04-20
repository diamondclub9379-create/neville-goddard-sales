import { X, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

// New books that can be added alongside the current book
const NEW_BOOKS = [
  {
    id: 17,
    titleTh: "ฉันรู้จักบิดาของฉัน",
    titleEn: "I Know My Father",
    price: 450,
    originalPrice: 650,
    image: "/images/books/ikmf-cover-hero.webp",
    discount: 31,
  },
  {
    id: 18,
    titleTh: "วิธีดึงดูดความรัก",
    titleEn: "How to Attract Love",
    price: 450,
    originalPrice: 550,
    image: "/images/books/htal-cover-3d.webp",
    discount: 18,
  },
];

interface BundleUpsellModalProps {
  isOpen: boolean;
  /** Price of the single book the customer just added */
  singleBookPrice: number;
  /** Title of the single book the customer just added */
  singleBookTitle: string;
  /** ID of the book just added (to skip showing it as a suggestion) */
  singleBookId?: number;
  /** No longer used — kept for API compatibility */
  onUpgrade: () => void;
  /** Add a new book alongside current cart */
  onAddNewBook?: (bookId: number) => void;
  /** Keep the single book and close */
  onDecline: () => void;
}

export default function BundleUpsellModal({
  isOpen,
  singleBookTitle,
  singleBookId,
  onAddNewBook,
  onDecline,
}: BundleUpsellModalProps) {
  if (!isOpen) return null;

  // New books to suggest (exclude the one just added)
  const suggestedNewBooks = NEW_BOOKS.filter((b) => b.id !== singleBookId);

  // If no suggestions to show, just close silently
  if (suggestedNewBooks.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDecline();
      }}
    >
      <div
        className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-400/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

        {/* Close button */}
        <button
          onClick={onDecline}
          aria-label="ปิด"
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400/15 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">ข้อเสนอพิเศษ</p>
            <h2 className="text-lg font-bold text-white leading-tight">
              หนังสือที่คุณอาจชอบ!
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">
          {/* Context: what they added */}
          <p className="text-gray-400 text-sm">
            คุณเพิ่ม <span className="text-white font-medium">"{singleBookTitle}"</span> ลงตะกร้าแล้ว
            {" "}— ลองเพิ่มเล่มนี้ไปด้วยเลย!
          </p>

          {/* New books section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gift size={14} className="text-pink-400" />
              <p className="text-pink-400 text-xs font-semibold uppercase tracking-wider">หนังสือใหม่ที่คุณอาจชอบ</p>
            </div>

            {suggestedNewBooks.map((newBook) => (
              <div
                key={newBook.id}
                className="flex gap-3 bg-slate-800/60 border border-pink-400/20 rounded-xl p-3 items-center"
              >
                <img
                  src={newBook.image}
                  alt={newBook.titleTh}
                  className="w-14 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-white font-semibold text-sm leading-tight">{newBook.titleTh}</p>
                  <p className="text-gray-400 text-xs italic">{newBook.titleEn}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">฿{newBook.price}</span>
                    <span className="text-gray-500 line-through text-xs">฿{newBook.originalPrice}</span>
                    <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded font-semibold">
                      ลด {newBook.discount}%
                    </span>
                  </div>
                </div>
                {onAddNewBook && (
                  <Button
                    onClick={() => {
                      onAddNewBook(newBook.id);
                      onDecline();
                    }}
                    size="sm"
                    className="flex-shrink-0 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 text-xs font-semibold px-3"
                    variant="outline"
                  >
                    + เพิ่ม
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Decline */}
          <button
            onClick={onDecline}
            className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors"
          >
            ไม่ขอบคุณ เก็บเล่มเดียวไว้ก่อน
          </button>
        </div>
      </div>
    </div>
  );
}

// Export a placeholder BUNDLE_BOOK_ID (no longer used for upgrade, kept for CartContext compatibility)
export const BUNDLE_BOOK_ID = -1;
