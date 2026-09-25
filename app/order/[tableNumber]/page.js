'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function OrderPage({ params }) {
  const tableNumber = params?.tableNumber;
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const { data: catData } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: itemData } = await supabase
        .from('menu_items')
        .select('*');

      setCategories(catData || []);
      setItems(itemData || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCart((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  // แยกคำนวณไอศกรีม vs ภาชนะ/ท็อปปิ้ง
  const getCartSummary = () => {
    let gelatoScoops = 0;
    let otherItemsCount = 0;

    Object.entries(cart).forEach(([itemId, qty]) => {
      const itemObj = items.find((i) => i.id === parseInt(itemId));
      if (!itemObj) return;

      const categoryObj = categories.find((c) => c.id === itemObj.category_id);
      const categoryName = categoryObj ? categoryObj.name.toLowerCase() : '';

      if (
        categoryName.includes('signatures') ||
        categoryName.includes('milk') ||
        categoryName.includes('sorbetto') ||
        categoryName.includes('gelato') ||
        categoryName.includes('เจลาโต้') ||
        categoryName.includes('ไอศกรีม')
      ) {
        gelatoScoops += qty;
      } else {
        otherItemsCount += qty;
      }
    });

    return { gelatoScoops, otherItemsCount, totalCount: gelatoScoops + otherItemsCount };
  };

  const handleSubmitOrder = async () => {
    const { totalCount } = getCartSummary();
    if (totalCount === 0) return;

    setSubmitting(true);
    try {
      const orderItems = Object.entries(cart).map(([itemId, qty]) => {
        const itemObj = items.find((i) => i.id === parseInt(itemId));
        return {
          id: parseInt(itemId),
          name: itemObj ? itemObj.name : 'Unknown',
          quantity: qty,
        };
      });

      const { error } = await supabase.from('orders').insert([
        {
          session_id: sessionId ? parseInt(sessionId) : null,
          table_number: parseInt(tableNumber),
          items: orderItems,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setCart({});
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งออเดอร์: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const { gelatoScoops, otherItemsCount, totalCount } = getCartSummary();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif', color: '#D53F8C' }}>
        <h2>🍨 กำลังโหลดเมนูเจลาโต้...</h2>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFF5F5',
      padding: '16px',
      paddingBottom: '100px',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, color: '#D53F8C', fontSize: '1.8rem' }}>🍨 Para-Melter Gelato</h1>
        <p style={{ margin: '6px 0 0 0', color: '#4A5568', fontWeight: 'bold' }}>
          โต๊ะที่ {tableNumber}
        </p>
      </div>

      {/* แจ้งเตือนเมื่อสั่งสำเร็จ */}
      {orderSuccess && (
        <div style={{
          backgroundColor: '#C6F6D5',
          color: '#22543D',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ✅ ส่งออเดอร์ไปที่บาร์ตักเรียบร้อยแล้วครับ!
        </div>
      )}

      {/* รายการเมนูแบ่งตามหมวดหมู่ */}
      {categories.map((cat) => {
        const categoryItems = items.filter((item) => item.category_id === cat.id);
        if (categoryItems.length === 0) return null;

        return (
          <div key={cat.id} style={{ marginBottom: '24px' }}>
            <h2 style={{
              color: '#319795',
              fontSize: '1.2rem',
              borderBottom: '2px solid #E2E8F0',
              paddingBottom: '6px',
              marginBottom: '12px'
            }}>
              {cat.name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryItems.map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2D3748' }}>
                      {item.name}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: 'none',
                              backgroundColor: '#E2E8F0',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                            {qty}
                          </span>
                        </>
                      )}
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#ED64A6',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* แถบกดส่งออเดอร์ด้านล่างสุด */}
      {totalCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div>
            <span style={{ color: '#718096', fontSize: '14px' }}>รวมรายการ: </span>
            <strong style={{ color: '#D53F8C', fontSize: '16px', display: 'block' }}>
              {gelatoScoops > 0 && <span>🍨 {gelatoScoops} สกู๊ป </span>}
              {otherItemsCount > 0 && (
                <span style={{ color: '#319795', fontSize: '14px' }}>
                  {gelatoScoops > 0 ? '| ' : ''}➕ {otherItemsCount} รายการ
                </span>
              )}
            </strong>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            style={{
              padding: '12px 24px',
              backgroundColor: submitting ? '#A0AEC0' : '#ED64A6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'กำลังส่ง...' : 'ส่งออเดอร์ 🍨'}
          </button>
        </div>
      )}
    </div>
  );
}
