export const metadata = {
  title: 'Para-Melter Gelato',
  description: 'ระบบสั่งไอศกรีมเจลาโต้',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
