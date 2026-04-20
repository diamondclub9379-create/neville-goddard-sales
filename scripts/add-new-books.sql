-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add 3 new Neville books + reset 17 existing books to LIST prices
--
-- Background:
--   Existing 17 books in DB have Shopee DISCOUNTED prices, which makes it
--   impossible to run further promos without double-discounting. This script
--   resets all books to their LIST price (ราคาปก) and nulls discountPrice so
--   the owner has a clean slate for future promotions.
--
-- List prices computed from Shopee current price (all items flat -26%) and
-- rounded to nearest 10 THB. 3 new books captured directly from Shopee.
--
-- Run via:
--   1) TiDB Cloud Console → SQL Editor → paste + execute, OR
--   2) node scripts/import-dump.mjs scripts/add-new-books.sql "<PROD_DATABASE_URL>"
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'starting migration' AS status;

-- ══════════════════════════════════════════════════════════════════════════════
-- PART A — INSERT 3 new books (upsert by slug)
-- ══════════════════════════════════════════════════════════════════════════════

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

-- ══════════════════════════════════════════════════════════════════════════════
-- PART B — RESET 17 existing books to LIST price (clears discountPrice → NULL)
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE `products` SET `price` = '400.00', `discountPrice` = NULL WHERE `slug` = 'feeling-is-the-secret';
UPDATE `products` SET `price` = '550.00', `discountPrice` = NULL WHERE `slug` = 'money-manifestation';
UPDATE `products` SET `price` = '750.00', `discountPrice` = NULL WHERE `slug` = 'faster-manifestation';
UPDATE `products` SET `price` = '950.00', `discountPrice` = NULL WHERE `slug` = 'law-of-assumption';
UPDATE `products` SET `price` = '400.00', `discountPrice` = NULL WHERE `slug` = 'secret-teachings';
UPDATE `products` SET `price` = '500.00', `discountPrice` = NULL WHERE `slug` = 'at-your-command';
UPDATE `products` SET `price` = '590.00', `discountPrice` = NULL WHERE `slug` = 'faith-is-fortune';
UPDATE `products` SET `price` = '390.00', `discountPrice` = NULL WHERE `slug` = 'freedom-for-all';
UPDATE `products` SET `price` = '500.00', `discountPrice` = NULL WHERE `slug` = 'prayer-art-of-believing';
UPDATE `products` SET `price` = '950.00', `discountPrice` = NULL WHERE `slug` = 'world-shaking-manifestor';
UPDATE `products` SET `price` = '650.00', `discountPrice` = NULL WHERE `slug` = 'imagination-release-power';
UPDATE `products` SET `price` = '490.00', `discountPrice` = NULL WHERE `slug` = 'law-and-promise';
UPDATE `products` SET `price` = '390.00', `discountPrice` = NULL WHERE `slug` = 'seedtime-and-harvest';
UPDATE `products` SET `price` = '390.00', `discountPrice` = NULL WHERE `slug` = 'be-your-wish';
UPDATE `products` SET `price` = '590.00', `discountPrice` = NULL WHERE `slug` = 'power-of-awareness';
UPDATE `products` SET `price` = '650.00', `discountPrice` = NULL WHERE `slug` = 'i-know-my-father';
UPDATE `products` SET `price` = '590.00', `discountPrice` = NULL WHERE `slug` = 'how-to-attract-love';

-- ══════════════════════════════════════════════════════════════════════════════
-- PART C — Verify (should show all 20 books with clean list prices)
-- ══════════════════════════════════════════════════════════════════════════════

SELECT id, slug, titleEn, price, discountPrice, category, isActive
FROM products
ORDER BY id;
