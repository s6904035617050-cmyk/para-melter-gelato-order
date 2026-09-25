import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF5F5',
      fontFamily: 'sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#D53F8C', marginBottom: '10px' }}>
        🍨 Para-Melter Gelato
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#4A5568', marginBottom: '30px' }}>
        ระบบสั่งอาหารและบาร์ตักเจลาโต้เรียลไทม์
      </p>

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/generate-qr" style={{
          padding: '12px 24px',
          backgroundColor: '#ED64A6',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          📱 หน้าสร้าง QR (พนักงาน)
        </Link>

        <Link href="/kitchen" style={{
          padding: '12px 24px',
          backgroundColor: '#319795',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          🍦 จอบาร์ตักเจลาโต้ (ห้องครัว)
        </Link>
      </div>
    </main>
  );
}
