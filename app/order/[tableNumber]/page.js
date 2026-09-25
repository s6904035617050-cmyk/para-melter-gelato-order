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

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmitOrder = async () => {
    if (getTotalItems() === 0) return;

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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EBE6 100%)',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        color: '#4A3E3D'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'bounce 1s infinite alternate' }}>🍨</div>
        <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', opacity: 0.7 }}>
          Crafting Menu...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, #FFFDF9 0%, #F6EFE9 100%)',
      padding: '20px 16px',
      paddingBottom: '120px',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#2D2424',
      position: 'relative'
    }}>
      {/* Decorative Minimal Background Blobs */}
      <div style={{
        position: 'fixed',
        top: '-100px',
        right: '-100px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(235, 185, 179, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header Container */}
      <header style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '24px 20px',
        marginBottom: '28px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(180, 150, 140, 0.08)'
      }}>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#A87C74',
          marginBottom: '6px'
        }}>
          Artisanal Creamery
        </span>
        <h1 style={{
          margin: 0,
          fontSize: '26px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #3A2E2B 0%, #6E534E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Para-Melter
        </h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          padding: '4px 14px',
          background: '#2D2424',
          color: '#FAF7F2',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#88D49E' }}></span>
          TABLE {tableNumber}
        </div>
      </header>

      {/* Success Notification */}
      {orderSuccess && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'rgba(235, 247, 238, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(136, 212, 158, 0.3)',
          color: '#275232',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(136, 212, 158, 0.15)'
        }}>
          ✨ ส่งรายการตักเจลาโต้เรียบร้อยแล้วครับ!
        </div>
      )}

      {/* Menu Categories */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {categories.map((cat) => {
          const categoryItems = items.filter((item) => item.category_id === cat.id);
          if (categoryItems.length === 0) return null;

          return (
            <section key={cat.id} style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  color: '#5C4A47',
                  textTransform: 'uppercase'
                }}>
                  {cat.name}
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #E2D7CF 0%, rgba(226, 215, 207, 0) 100%)' }} />
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {categoryItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '18px',
                        background: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                        backdropFilter: 'blur(10px)',
                        border: isSelected ? '1px solid #C9A99B' : '1px solid rgba(255, 255, 255, 0.7)',
                        boxShadow: isSelected 
                          ? '0 8px 24px rgba(168, 124, 116, 0.12)' 
                          : '0 2px 8px rgba(0, 0, 0, 0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#2D2424',
                          letterSpacing: '-0.2px'
                        }}>
                          {item.name}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#F0E8E1',
                                color: '#5C4A47',
                                fontSize: '18px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              -
                            </button>
                            <span style={{
                              minWidth: '24px',
                              textAlign: 'center',
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#2D2424'
                            }}>
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '12px',
                            border: 'none',
                            background: isSelected ? '#2D2424' : '#E8DDD5',
                            color: isSelected ? '#FAF7F2' : '#5C4A47',
                            fontSize: '18px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>

      {/* Floating Bottom Action Bar */}
      {getTotalItems() > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '16px',
          right: '16px',
          zIndex: 10,
          background: 'rgba(45, 36, 36, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '12px 16px 12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 32px rgba(45, 36, 36, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#A89F91' }}>
              Selected Items
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#FAF7F2' }}>
              {getTotalItems()} <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.8 }}>สกู๊ป / ชิ้น</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            style={{
              padding: '12px 24px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #E8A89C 0%, #C97D6F 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(201, 125, 111, 0.3)',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'กำลังส่ง...' : 'สั่งไอศกรีม 🍨'}
          </button>
        </div>
      )}
    </div>
  );
}
