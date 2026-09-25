'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function GenerateQR() {
  const [tableNumber, setTableNumber] = useState('');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!tableNumber) {
      alert('กรุณากรอกหมายเลขโต๊ะ');
      return;
    }

    setLoading(true);
    try {
      // บันทึก session ลง Supabase
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            table_number: parseInt(tableNumber),
            adult_count: parseInt(adultCount),
            child_count: parseInt(childCount),
            status: 'open',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // สร้าง URL สำหรับสั่งอาหาร
      const orderUrl = `${window.location.origin}/order/${tableNumber}?session_id=${data.id}`;
      setSessionData({ ...data, orderUrl });
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const qrImageUrl = sessionData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(sessionData.orderUrl)}`
    : '';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFF5F5',
      padding: '20px',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '15px' }}>
        <Link href="/" style={{ color: '#D53F8C', textDecoration: 'none', fontWeight: 'bold' }}>
          ← กลับหน้าหลัก
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ color: '#D53F8C', marginTop: 0, textAlign: 'center' }}>
          📱 เปิดโต๊ะ & สร้าง QR Code
        </h2>

        {!sessionData ? (
          <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A5568' }}>
                หมายเลขโต๊ะ *
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="เช่น 1, 2, 3"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E0',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A5568' }}>
                  ผู้ใหญ่ (คน)
                </label>
                <input
                  type="number"
                  min="1"
                  value={adultCount}
                  onChange={(e) => setAdultCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E0',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#4A5568' }}>
                  เด็ก (คน)
                </label>
                <input
                  type="number"
                  min="0"
                  value={childCount}
                  onChange={(e) => setChildCount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E0',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '14px',
                backgroundColor: loading ? '#A0AEC0' : '#ED64A6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'กำลังสร้าง...' : 'เปิดโต๊ะและสร้าง QR Code'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#EDF2F7',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontWeight: 'bold',
              color: '#2D3748'
            }}>
              โต๊ะที่ {sessionData.table_number} (ผู้ใหญ่ {sessionData.adult_count} | เด็ก {sessionData.child_count})
            </div>

            <div style={{ margin: '20px 0' }}>
              <img src={qrImageUrl} alt="QR Code" style={{ borderRadius: '8px', width: '220px', height: '220px' }} />
            </div>

            <p style={{ fontSize: '13px', color: '#718096', wordBreak: 'break-all', marginBottom: '20px' }}>
              {sessionData.orderUrl}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigator.clipboard.writeText(sessionData.orderUrl)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#4A5568',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📋 คัดลอกลิงก์
              </button>

              <button
                onClick={() => setSessionData(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#319795',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ➕ เปิดโต๊ะใหม่
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
