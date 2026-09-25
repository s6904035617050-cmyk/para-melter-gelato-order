'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // ตั้งค่า Realtime Subscription รับออเดอร์ใหม่ทันที
    const subscription = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ: ' + err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#E6FFFA',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: '#234E52', margin: 0 }}>
          🍦 จอบาร์ตักเจลาโต้ (Realtime)
        </h1>
        <Link href="/" style={{ color: '#319795', textDecoration: 'none', fontWeight: 'bold' }}>
          ← กลับหน้าหลัก
        </Link>
      </div>

      {loading && orders.length === 0 ? (
        <p style={{ color: '#2C7A7B' }}>กำลังโหลดออเดอร์...</p>
      ) : orders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#718096',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h2>🎉 ยังไม่มีออเดอร์ค้างในขณะนี้</h2>
          <p>เมื่อลูกค้าสั่งอาหาร รายการจะเด้งขึ้นมาตรงนี้อัตโนมัติครับ</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {orders.map((order) => (
            <div key={order.id} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              borderTop: '6px solid #319795',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #E2E8F0',
                  paddingBottom: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2D3748' }}>
                    โต๊ะที่ {order.table_number}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#A0AEC0' }}>
                    {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <ul style={{ paddingLeft: '20px', margin: '0 0 16px 0', color: '#4A5568' }}>
                  {order.items && order.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', fontSize: '16px' }}>
                      <strong>{item.name}</strong> x <span style={{ color: '#D53F8C', fontWeight: 'bold' }}>{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleCompleteOrder(order.id)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#319795',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                ✅ ตักเสร็จแล้ว
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
