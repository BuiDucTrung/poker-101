// Địa chỉ website. Khi deploy trên Vercel sẽ tự lấy domain production;
// nếu dùng domain riêng, đặt biến môi trường NEXT_PUBLIC_SITE_URL (vd: https://poker101.vn).
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : null;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || fromVercel || 'https://poker-101.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'Dealer Trainer';
export const SITE_TITLE = "Dealer Trainer – Luyện chọn 5 lá mạnh nhất Texas Hold'em";
export const SITE_DESCRIPTION =
  "Luyện tập miễn phí cho dealer poker: từ 2 lá của nhà cái và 5 lá bài chung, chọn 2 lá bỏ đi để giữ 5 lá mạnh nhất. Học thứ tự tay bài Texas Hold'em qua từng câu hỏi, có gợi ý khi làm sai.";
