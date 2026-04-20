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
}

export const books: Book[] = [
  {
    id: 1,
    titleTh: "ความรู้สึกคือความลับ",
    titleEn: "Feeling is the Secret",
    price: 265,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasb-m2833kzs46g41c.webp",
    description: "ค้นพบความลับที่นักสำเร็จการณ์ทั่วโลกใช้ เปลี่ยนความรู้สึกของคุณ ชีวิตจะเปลี่ยนไปตามนั้น",
    benefits: [
      "🎯 เข้าใจพลังของความรู้สึกในการสร้างสรรค์ชีวิต",
      "💫 เรียนรู้วิธีปลุกจิตใต้สำนึกของคุณ",
      "✨ เปลี่ยนแปลงชีวิตจากภายในสู่ภายนอก"
    ],
    rating: 4.9,
    sold: 299,
    isNew: true,
  },
  {
    id: 2,
    titleTh: "รวมชุดหนังสือ เนวิลล์ ก็อดดาร์ด",
    titleEn: "Neville Goddard Collection",
    price: 297,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasd-m3nojyvnuo6358.webp",
    description: "รวมผลงานแปลไทยของเนวิลล์ ก็อดดาร์ด ในชุดเดียว คุ้มค่าที่สุดสำหรับผู้ที่ต้องการเรียนรู้คำสอนอย่างครบถ้วน",
    benefits: [
      "📚 ชุดสมบูรณ์ของคำสอนที่ทรงพลัง",
      "💰 ราคาพิเศษสำหรับการซื้อชุด",
      "🎁 ประหยัดเงินเมื่อซื้อรวมกัน"
    ],
    rating: 5.0,
    sold: 197,
  },
  {
    id: 3,
    titleTh: "เสกเงินแบบเนวิลล์",
    titleEn: "Money Manifestation Like Neville",
    price: 433,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasa-m20zudv05e5288.webp",
    description: "ปลดล็อกความมั่งคั่งที่ไม่มีที่สิ้นสุด เรียนรู้เทคนิคการดึงดูดเงินตามแนวทางของเนวิลล์",
    benefits: [
      "💵 เทคนิคเสกเงินที่ได้ผลจริง",
      "🧠 เปลี่ยนความคิดเรื่องเงินและความมั่งคั่ง",
      "🌟 สร้างรายได้แบบไม่มีขีดจำกัด"
    ],
    rating: 4.9,
    sold: 54,
  },
  {
    id: 4,
    titleTh: "เสกเร็วขึ้น 10 เท่า",
    titleEn: "10x Faster Manifestation",
    price: 603,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rase-m95pvzbm1nnta2.webp",
    description: "เร่งความเร็วในการสร้างสรรค์ความเป็นจริง ด้วยแบบฝึกหัดและเทคนิคที่พิสูจน์แล้ว",
    benefits: [
      "⚡ เร่งกระบวนการ Manifestation",
      "📋 แบบฝึกหัดภาคปฏิบัติพร้อมใช้",
      "🎯 ผลลัพธ์ที่เห็นได้ชัดเจนและเร็ว"
    ],
    rating: 5.0,
    sold: 35,
  },
  {
    id: 5,
    titleTh: "กฎแห่งการสมมติ",
    titleEn: "The Law of Assumption",
    price: 574,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasd-m1ya63c476xib5.webp",
    description: "หลักการสุดทรงพลังที่เปลี่ยนแปลงความเป็นจริง เมื่อคุณสมมติให้เป็นจริง มันก็จะเป็นจริง",
    benefits: [
      "🔮 ค้นพบกฎแห่งจักรวาล",
      "🧬 เปลี่ยนแปลงเนื้อหาของจิตใจ",
      "✨ สร้างชีวิตตามที่คุณต้องการ"
    ],
    rating: 4.9,
    sold: 116,
  },
  {
    id: 6,
    titleTh: "คำสอนลับปลดล็อกชีวิต",
    titleEn: "Secret Teachings Unlock Life",
    price: 305,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7r98p-lt5ik2itbe5qc8.webp",
    description: "รวบรวมคำสอนลับที่ไม่เคยเปิดเผยมาก่อน ปลดล็อกศักยภาพที่ซ่อนอยู่ในตัวคุณ",
    benefits: [
      "🔑 ปลดล็อกศักยภาพที่ซ่อนอยู่",
      "💎 คำสอนลับที่หายากและมีค่า",
      "🚀 เปลี่ยนชีวิตไปในทิศทางใหม่"
    ],
    rating: 5.0,
    sold: 202,
  },
  {
    id: 7,
    titleTh: "เสกทุกสิ่งตามคำสั่งของคุณ",
    titleEn: "At Your Command",
    price: 390,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasg-m283v90ik6w11e.webp",
    description: "หนังสือเล่มแรกของเนวิลล์ สอนพื้นฐานการใช้จิตเพื่อควบคุมชีวิต จักรวาลพร้อมตอบรับ",
    benefits: [
      "🎪 หนังสือเล่มแรกที่ต้องอ่าน",
      "🧠 พื้นฐานของการสร้างสรรค์",
      "⚙️ วิธีการใช้จิตเพื่อควบคุมชีวิต"
    ],
    rating: 4.8,
    sold: 83,
  },
  {
    id: 8,
    titleTh: "ความเชื่อ คือโชคชะตา",
    titleEn: "Your Faith is Your Fortune",
    price: 467,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rash-m73ktkr1hpv3a4.webp",
    description: "เปิดเผยความลับว่าความเชื่อของคุณกำหนดโชคชะตา เมื่อเปลี่ยนความเชื่อ ชีวิตจะเปลี่ยน",
    benefits: [
      "🌟 เข้าใจพลังของความเชื่อ",
      "🎯 เปลี่ยนความเชื่อเพื่อเปลี่ยนชีวิต",
      "💪 สร้างโชคชะตาตามต้องการ"
    ],
    rating: 4.9,
    sold: 21,
  },
  {
    id: 9,
    titleTh: "เป็นทุกสิ่งได้ดั่งใจปรารถนา",
    titleEn: "Freedom for All",
    price: 297,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasi-m7ajficv8d43b3.webp",
    description: "อิสรภาพที่แท้จริงคือการเป็นได้ทุกสิ่งที่ปรารถนา ไม่มีข้อจำกัดใดนอกจากสิ่งที่คุณเชื่อ",
    benefits: [
      "🦅 ปลดปล่อยตัวเองจากข้อจำกัด",
      "🎨 เป็นได้ทุกสิ่งที่ปรารถนา",
      "🌈 สร้างชีวิตที่เต็มไปด้วยอิสรภาพ"
    ],
    rating: 4.8,
    sold: 18,
  },
  {
    id: 10,
    titleTh: "อธิษฐาน ศิลปะแห่งการศรัทธา",
    titleEn: "Prayer: The Art of Believing",
    price: 390,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasi-m2t7te0swp7774.webp",
    description: "ศิลปะแห่งการอธิษฐานที่ได้ผลจริง ไม่ใช่การขอร้อง แต่คือการรู้สึกว่าได้รับแล้ว",
    benefits: [
      "🙏 เรียนรู้อธิษฐานที่ได้ผล",
      "💫 ความรู้สึกว่าได้รับแล้ว",
      "✨ ปรับเปลี่ยนความสัมพันธ์กับจักรวาล"
    ],
    rating: 4.9,
    sold: 47,
  },
  {
    id: 11,
    titleTh: "นักเสกสะท้านโลก",
    titleEn: "World-Shaking Manifestor",
    price: 773,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasd-m2ta1y40z9ia96.webp",
    description: "ประวัติชีวิตและคำสอนที่ครบถ้วนที่สุดของเนวิลล์ ก็อดดาร์ด จากเด็กหนุ่มสู่ปรมาจารย์",
    benefits: [
      "📖 ประวัติชีวิตที่แรงบันดาลใจ",
      "🎓 คำสอนที่ครบถ้วนที่สุด",
      "👑 ศึกษาชีวิตของปรมาจารย์"
    ],
    rating: 4.9,
    sold: 49,
  },
  {
    id: 12,
    titleTh: "จินตนาการ วิธีปลดปล่อยพลังจิต",
    titleEn: "Imagination: Release Mental Power",
    price: 518,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasg-m2tasf1q5lz536.webp",
    description: "จินตนาการคือพลังสร้างสรรค์สูงสุด เรียนรู้วิธีใช้จินตนาการเพื่อเปลี่ยนแปลงชีวิต",
    benefits: [
      "🎨 ปลดปล่อยพลังจินตนาการ",
      "🧠 ใช้จิตใจเพื่อสร้างสรรค์",
      "🌟 เปลี่ยนแปลงทุกด้านของชีวิต"
    ],
    rating: 5.0,
    sold: 110,
  },
  {
    id: 13,
    titleTh: "กฎและคำสัญญา",
    titleEn: "Law and the Promise",
    price: 382,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasi-m2taqlbwkj3n20.webp",
    description: "รวมเรื่องจริงของผู้คนที่ใช้กฎแห่งจินตนาการแล้วประสบความสำเร็จ พิสูจน์ว่าคำสัญญาเป็นจริง",
    benefits: [
      "📚 เรื่องจริงจากผู้ประสบความสำเร็จ",
      "💪 พิสูจน์ว่าระบบทำงาน",
      "🎯 แรงบันดาลใจจากเรื่องจริง"
    ],
    rating: 4.8,
    sold: 21,
  },
  {
    id: 14,
    titleTh: "4 อัศจรรย์ใหญ่แห่งการเสก",
    titleEn: "Seedtime and Harvest",
    price: 297,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rash-m2tb09bm77mt7e.webp",
    description: "4 หลักการอัศจรรย์ที่จะเปลี่ยนวิธีคิดของคุณไปตลอดกาล เมล็ดพันธุ์ที่หว่านจะให้ผล",
    benefits: [
      "🌱 เข้าใจกฎแห่งเมล็ดพันธุ์และการเก็บเกี่ยว",
      "🔄 วัฏจักรของการสร้างสรรค์",
      "🌾 ให้ผลที่ยั่งยืนและแท้จริง"
    ],
    rating: 4.9,
    sold: 15,
  },
  {
    id: 15,
    titleTh: "ได้ทุกความปรารถนา",
    titleEn: "Be Your Wish",
    price: 297,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rash-m2tavm3zz4bpb2.webp",
    description: "เทคนิคการเป็นความปรารถนาของตัวเอง ไม่ใช่แค่อยากได้ แต่คือการ 'เป็น' ตั้งแต่ตอนนี้",
    benefits: [
      "🎭 เป็นสิ่งที่คุณปรารถนา",
      "⏰ ทำให้มันเป็นจริงตั้งแต่ตอนนี้",
      "💎 ความปรารถนากลายเป็นความเป็นจริง"
    ],
    rating: 4.8,
    sold: 40,
  },
  {
    id: 16,
    titleTh: "อำนาจแห่งการตระหนักรู้",
    titleEn: "The Power of Awareness",
    price: 467,
    image: "https://down-th.img.susercontent.com/file/th-11134207-7rasg-m6rjnx2sfrp7d8.webp",
    description: "หนึ่งในผลงานที่ดีที่สุดของเนวิลล์ เปิดเผยอำนาจแห่งการตระหนักรู้ สิ่งที่คุณตระหนักรู้คือสิ่งที่คุณเป็น",
    benefits: [
      "👁️ ตระหนักรู้ถึงพลังของจิตใจ",
      "🧘 เปลี่ยนการตระหนักรู้เพื่อเปลี่ยนชีวิต",
      "🌟 เป็นสิ่งที่คุณตระหนักรู้"
    ],
    rating: 4.9,
    sold: 213,
  },
];
