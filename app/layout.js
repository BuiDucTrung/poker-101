import './globals.css';

export const metadata = {
  title: 'Poker Dealer Trainer – Chọn 5 lá mạnh nhất',
  description: 'Luyện tập dealer Texas Hold\'em: chọn 2 lá bỏ đi để giữ 5 lá mạnh nhất từ 7 lá.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b120e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
