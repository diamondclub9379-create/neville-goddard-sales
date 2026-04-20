import { describe, it, expect } from "vitest";

// ---- Replicated logic from BundleUpsellPopup for server-side testing ----

interface Book {
  id: number;
  titleTh: string;
  titleEn: string;
  price: number;
  image: string;
  description: string;
  benefits: string[];
  rating: number;
  sold: number;
  isNew?: boolean;
}

interface CartItem {
  book: Book;
  quantity: number;
  discountedPrice?: number;
}

interface BundleDeal {
  id: string;
  name: string;
  description: string;
  bookIds: number[];
  discountPercent: number;
  minBooks: number;
}

const BUNDLE_DEALS: BundleDeal[] = [
  {
    id: "starter-3",
    name: "ชุดเริ่มต้น 3 เล่ม",
    description: "เริ่มต้นการเดินทางด้วยคำสอนที่ทรงพลังที่สุด",
    bookIds: [1, 5, 16],
    discountPercent: 20,
    minBooks: 3,
  },
  {
    id: "wealth-3",
    name: "ชุดดึงดูดความมั่งคั่ง 3 เล่ม",
    description: "เปลี่ยนความคิดเรื่องเงินและสร้างความมั่งคั่ง",
    bookIds: [3, 4, 8],
    discountPercent: 20,
    minBooks: 3,
  },
  {
    id: "complete-5",
    name: "ชุดครบเซ็ต 5 เล่ม",
    description: "เรียนรู้คำสอนของเนวิลล์อย่างครบถ้วน",
    bookIds: [1, 5, 7, 12, 16],
    discountPercent: 25,
    minBooks: 5,
  },
];

function pickBestBundle(
  triggerBook: Book,
  cartItems: CartItem[],
  allBooks: Book[]
): {
  deal: BundleDeal;
  booksToAdd: Book[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
} | null {
  const cartBookIds = new Set(cartItems.map((item) => item.book.id));

  for (const deal of BUNDLE_DEALS) {
    const booksInDeal = deal.bookIds
      .map((id) => allBooks.find((b) => b.id === id))
      .filter(Boolean) as Book[];
    const booksToAdd = booksInDeal.filter(
      (b) => !cartBookIds.has(b.id) && b.id !== triggerBook.id
    );

    if (deal.bookIds.includes(triggerBook.id) && booksToAdd.length > 0) {
      const originalPrice = booksInDeal.reduce((sum, b) => sum + b.price, 0);
      const discountedPrice = Math.round(
        originalPrice * (1 - deal.discountPercent / 100)
      );
      const savings = originalPrice - discountedPrice;
      return { deal, booksToAdd, originalPrice, discountedPrice, savings };
    }
  }

  // Fallback: suggest 2 most popular books not in cart
  const popularBooks = allBooks
    .filter((b) => b.id !== triggerBook.id && !cartBookIds.has(b.id))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 2);

  if (popularBooks.length >= 2) {
    const allBundleBooks = [triggerBook, ...popularBooks];
    const originalPrice = allBundleBooks.reduce((sum, b) => sum + b.price, 0);
    const discountPercent = 20;
    const discountedPrice = Math.round(
      originalPrice * (1 - discountPercent / 100)
    );
    const savings = originalPrice - discountedPrice;
    return {
      deal: {
        id: "dynamic-3",
        name: "ชุดแนะนำพิเศษ 3 เล่ม",
        description: "คัดสรรพิเศษสำหรับคุณ",
        bookIds: allBundleBooks.map((b) => b.id),
        discountPercent,
        minBooks: 3,
      },
      booksToAdd: popularBooks,
      originalPrice,
      discountedPrice,
      savings,
    };
  }

  return null;
}

// Sample books for tests
const sampleBooks: Book[] = [
  { id: 1, titleTh: "ความรู้สึกคือความลับ", titleEn: "Feeling is the Secret", price: 265, image: "", description: "", benefits: [], rating: 4.9, sold: 299 },
  { id: 3, titleTh: "เสกเงินแบบเนวิลล์", titleEn: "Money", price: 433, image: "", description: "", benefits: [], rating: 4.9, sold: 54 },
  { id: 4, titleTh: "เสกเร็วขึ้น 10 เท่า", titleEn: "10x Faster", price: 603, image: "", description: "", benefits: [], rating: 5.0, sold: 35 },
  { id: 5, titleTh: "กฎแห่งการสมมติ", titleEn: "Law of Assumption", price: 574, image: "", description: "", benefits: [], rating: 4.9, sold: 116 },
  { id: 7, titleTh: "เสกทุกสิ่ง", titleEn: "At Your Command", price: 390, image: "", description: "", benefits: [], rating: 4.8, sold: 83 },
  { id: 8, titleTh: "ความเชื่อ คือโชคชะตา", titleEn: "Faith is Fortune", price: 467, image: "", description: "", benefits: [], rating: 4.9, sold: 21 },
  { id: 12, titleTh: "จินตนาการ", titleEn: "Imagination", price: 518, image: "", description: "", benefits: [], rating: 5.0, sold: 110 },
  { id: 16, titleTh: "อำนาจแห่งการตระหนักรู้", titleEn: "Power of Awareness", price: 467, image: "", description: "", benefits: [], rating: 4.9, sold: 213 },
];

describe("Bundle Upsell - pickBestBundle", () => {
  it("should return a bundle deal when trigger book is in a predefined bundle", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    const result = pickBestBundle(triggerBook, [], sampleBooks);
    expect(result).not.toBeNull();
    expect(result!.deal.bookIds).toContain(1);
    expect(result!.booksToAdd.length).toBeGreaterThan(0);
  });

  it("should not include trigger book in booksToAdd", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    const result = pickBestBundle(triggerBook, [], sampleBooks);
    expect(result!.booksToAdd.every((b) => b.id !== 1)).toBe(true);
  });

  it("should not include books already in cart in booksToAdd", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    const book5 = sampleBooks.find((b) => b.id === 5)!;
    const cartItems: CartItem[] = [{ book: book5, quantity: 1 }];
    const result = pickBestBundle(triggerBook, cartItems, sampleBooks);
    expect(result!.booksToAdd.every((b) => b.id !== 5)).toBe(true);
  });

  it("should calculate correct discount (20%) for starter bundle", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    const result = pickBestBundle(triggerBook, [], sampleBooks);
    expect(result!.deal.discountPercent).toBe(20);
    const expectedDiscounted = Math.round(result!.originalPrice * 0.8);
    expect(result!.discountedPrice).toBe(expectedDiscounted);
  });

  it("should calculate savings correctly", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    const result = pickBestBundle(triggerBook, [], sampleBooks);
    expect(result!.savings).toBe(result!.originalPrice - result!.discountedPrice);
    expect(result!.savings).toBeGreaterThan(0);
  });

  it("should return null when no books are available to add", () => {
    const triggerBook = sampleBooks.find((b) => b.id === 1)!;
    // Put all other bundle books in cart
    const cartItems: CartItem[] = sampleBooks
      .filter((b) => b.id !== 1)
      .map((b) => ({ book: b, quantity: 1 }));
    const result = pickBestBundle(triggerBook, cartItems, sampleBooks);
    // All books are in cart, so no bundle can be formed
    expect(result).toBeNull();
  });

  it("should use fallback dynamic bundle when trigger book not in predefined bundle", () => {
    // Book id 99 is not in any predefined bundle
    const unknownBook: Book = { id: 99, titleTh: "Unknown", titleEn: "Unknown", price: 300, image: "", description: "", benefits: [], rating: 4.5, sold: 10 };
    const result = pickBestBundle(unknownBook, [], sampleBooks);
    expect(result).not.toBeNull();
    expect(result!.deal.id).toBe("dynamic-3");
    expect(result!.booksToAdd.length).toBe(2);
  });
});

describe("Bundle Upsell - discount price calculation", () => {
  it("should apply 20% discount correctly", () => {
    const price = 265;
    const discountPercent = 20;
    const discounted = Math.round(price * (1 - discountPercent / 100));
    expect(discounted).toBe(212);
  });

  it("should apply 25% discount correctly", () => {
    const price = 400;
    const discountPercent = 25;
    const discounted = Math.round(price * (1 - discountPercent / 100));
    expect(discounted).toBe(300);
  });

  it("cart total should use discounted price when available", () => {
    const book1 = sampleBooks.find((b) => b.id === 1)!;
    const book5 = sampleBooks.find((b) => b.id === 5)!;
    const cartItems: CartItem[] = [
      { book: book1, quantity: 1, discountedPrice: 212 },
      { book: book5, quantity: 1, discountedPrice: 459 },
    ];
    const total = cartItems.reduce(
      (sum, item) => sum + ((item.discountedPrice ?? item.book.price) * item.quantity),
      0
    );
    expect(total).toBe(212 + 459);
  });
});

describe("Countdown timer logic", () => {
  it("should format timer correctly for 10 minutes", () => {
    const TIMER_SECONDS = 10 * 60;
    const minutes = Math.floor(TIMER_SECONDS / 60);
    const seconds = TIMER_SECONDS % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    expect(display).toBe("10:00");
  });

  it("should format timer correctly for 1 minute 30 seconds", () => {
    const secondsLeft = 90;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    expect(display).toBe("01:30");
  });

  it("should format timer correctly for 0 seconds", () => {
    const secondsLeft = 0;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    expect(display).toBe("00:00");
  });
});
