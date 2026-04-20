import { createContext, useContext, useState, ReactNode } from "react";
import { BUNDLE_BOOK_ID } from "@/components/BundleUpsellModal";

export interface Book {
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
  badge?: "bestseller" | "recommended" | "new" | "hot";
  detailPage?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderConfirmationOpen: boolean;
  orderData: unknown;
  isUpsellOpen: boolean;
  isBundleUpsellOpen: boolean;
  bundleUpsellBook: Book | null;
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  removeItem: (bookId: number) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  setIsOrderConfirmationOpen: (open: boolean) => void;
  setOrderData: (data: unknown) => void;
  setIsUpsellOpen: (open: boolean) => void;
  setIsBundleUpsellOpen: (open: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [orderData, setOrderData] = useState<unknown>(null);

  // Tier nudge popup state
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [upsellShownThisSession, setUpsellShownThisSession] = useState(false);

  // Bundle upsell popup state
  const [isBundleUpsellOpen, setIsBundleUpsellOpen] = useState(false);
  const [bundleUpsellBook, setBundleUpsellBook] = useState<Book | null>(null);
  const [bundleUpsellShownThisSession, setBundleUpsellShownThisSession] = useState(false);

  const addToCart = (book: Book) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.book.id === book.id);
      if (existingItem) {
        return prev.map(item =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        const isFirstItem = prev.length === 0;
        const newItems = [...prev, { book, quantity: 1 }];

        // Show tier nudge popup only on first item added, once per session
        if (isFirstItem && !upsellShownThisSession) {
          setIsUpsellOpen(true);
          setUpsellShownThisSession(true);
        }

        // Show bundle upsell if adding a non-bundle book and bundle not already in cart
        const bundleAlreadyInCart = prev.some(item => item.book.id === BUNDLE_BOOK_ID);
        const isAddingBundle = book.id === BUNDLE_BOOK_ID;
        if (!isAddingBundle && !bundleAlreadyInCart && !bundleUpsellShownThisSession) {
          setBundleUpsellBook(book);
          setIsBundleUpsellOpen(true);
          setBundleUpsellShownThisSession(true);
        }

        return newItems;
      }
    });
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity === 0) {
      removeItem(bookId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.book.id === bookId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (bookId: number) => {
    setCartItems(prev => prev.filter(item => item.book.id !== bookId));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        isCheckoutOpen,
        isOrderConfirmationOpen,
        orderData,
        isUpsellOpen,
        isBundleUpsellOpen,
        bundleUpsellBook,
        addToCart,
        updateQuantity,
        removeItem,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout: () => setIsCheckoutOpen(true),
        closeCheckout: () => setIsCheckoutOpen(false),
        setIsOrderConfirmationOpen,
        setOrderData,
        setIsUpsellOpen,
        setIsBundleUpsellOpen,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
