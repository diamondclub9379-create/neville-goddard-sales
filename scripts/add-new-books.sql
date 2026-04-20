-- ─────────────────────────────────────────────────────────────────────────────
-- Add 3 new Neville Goddard books scraped from Shopee shop (coachwanchai)
-- Run against TiDB production. Safe to re-run: uses ON DUPLICATE KEY UPDATE
-- on the unique `slug` column so it becomes an upsert.
--
-- Run via:
--   1) TiDB Cloud Console → SQL Editor → paste + execute, OR
--   2) node scripts/import-dump.mjs scripts/add-new-books.sql "<PROD_DATABASE_URL>"
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'starting add-new-books' AS status;

INSERT INTO `products`
  (`titleTh`, `titleEn`, `slug`, `description`, `descriptionTh`, `price`, `discountPrice`, `imageUrl`, `purchaseLink`, `category`, `isActive`)
VALUES
  (
    'หัวใจแห่งการเสก',
    'The Heart of Manifestation',
    'heart-of-manifestation',
    'Dive into the core of Neville Goddard''s teaching: imagination is the true heart of every manifestation. Learn how to feel the wish fulfilled and let the inner state reshape your outer world.',
    'เจาะลึกหัวใจของคำสอนเนวิลล์ ก็อดดาร์ด — จินตนาการคือหัวใจที่แท้จริงของการเสกทุกสิ่ง เรียนรู้วิธีรู้สึกว่าได้รับแล้ว และปล่อยให้สภาวะภายในเปลี่ยนแปลงโลกภายนอกของคุณ',
    '490.00',
    NULL,
    'https://down-th.img.susercontent.com/file/th-11134207-81ztd-mml85zka4wlgfb',
    NULL,
    'manifestation',
    1
  ),
  (
    'ออกไปสู่โลกมิติที่ใหญ่กว่า',
    'Out of This World',
    'out-of-this-world',
    'Step beyond ordinary perception. Neville reveals how to travel in consciousness, experience higher dimensions, and bring back the state that reshapes your reality.',
    'ก้าวข้ามการรับรู้ธรรมดา เนวิลล์เปิดเผยวิธีเดินทางด้วยจิตสำนึก สัมผัสมิติที่สูงกว่า และนำสภาวะที่เปลี่ยนแปลงความเป็นจริงของคุณกลับมา',
    '590.00',
    NULL,
    'https://down-th.img.susercontent.com/file/th-11134207-81zth-mlzvs6o3k7wh91',
    NULL,
    'spiritual',
    1
  ),
  (
    '5 บทเรียนจากเนวิลล์ ก็อดดาร์ด',
    '5 Lessons from Neville Goddard',
    '5-lessons-from-neville',
    'The five foundational lessons Neville taught his inner circle. A condensed masterclass on consciousness, assumption, imagination, revision, and the law — everything you need in one volume.',
    'ห้าบทเรียนพื้นฐานที่เนวิลล์สอนลูกศิษย์วงใน คอร์สมาสเตอร์แคลสในเล่มเดียว — จิตสำนึก การสมมติ จินตนาการ การรีวิชัน และกฎแห่งการเสก ครบจบในเล่มเดียว',
    '990.00',
    NULL,
    'https://down-th.img.susercontent.com/file/th-11134207-81ztg-mjqymagwvnd2b7',
    NULL,
    'teaching',
    1
  )
ON DUPLICATE KEY UPDATE
  `titleTh`       = VALUES(`titleTh`),
  `titleEn`       = VALUES(`titleEn`),
  `description`   = VALUES(`description`),
  `descriptionTh` = VALUES(`descriptionTh`),
  `price`         = VALUES(`price`),
  `discountPrice` = VALUES(`discountPrice`),
  `imageUrl`      = VALUES(`imageUrl`),
  `purchaseLink`  = VALUES(`purchaseLink`),
  `category`      = VALUES(`category`),
  `isActive`      = VALUES(`isActive`);

SELECT id, slug, titleTh, titleEn, price, category
FROM products
WHERE slug IN ('heart-of-manifestation', 'out-of-this-world', '5-lessons-from-neville');
