// App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  // 장바구니 담기 기능
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.name === item.name);
      if (existing) {
        return prevCart.map((p) =>
          p.name === item.name ? { ...p, count: p.count + 1 } : p
        );
      } else {
        return [...prevCart, { name: item.name, count: 1 }];
      }
    });
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      // Step 1: ClovaX로 설명 및 키워드 받기
      const res = await axios.post('/api/chat', { message: userMessage });
      const { explanation, keywords } = res.data;

      setMessages((prev) => [...prev, { sender: 'bot', text: explanation }]);

      // Step 2: 키워드를 이용해 네이버 쇼핑 검색
      const allResults = [];

      for (const keyword of keywords) {
        const r = await axios.get(`/api/search?query=${encodeURIComponent(keyword)}`);
        const item = r.data.items?.[0];
        if (item && item.image?.match(/\.(jpg|jpeg|png)$/i)) {
          allResults.push({
            name: item.title,
            price: `${item.lprice}원`,
            image: item.image,
          });
        }
      }

      setProducts(allResults);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '❗ 에러 발생: ' + error.message }]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
      <h1>🛍️ 쇼핑 챗봇</h1>

      {/* 채팅 UI */}
      <div style={{
        border: '1px solid #ccc', height: '300px', overflowY: 'scroll',
        padding: '10px', background: '#f9f9f9', marginBottom: '16px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            margin: '6px 0'
          }}>
            <div style={{
              display: 'inline-block',
              background: msg.sender === 'user' ? '#d0f0ff' : '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              maxWidth: '75%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="원하는 상품을 입력하세요"
        style={{ width: '75%', padding: '8px' }}
      />
      <button onClick={handleSend} style={{ marginLeft: '10px', padding: '8px 16px' }}>
        보내기
      </button>

      {/* 추천 상품 카드 UI */}
      {products.length > 0 && (
        <>
          <h2 style={{ marginTop: '30px' }}>🛍️ 추천 상품</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {products.map((item, idx) => (
              <div key={idx} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                background: '#fff'
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />
                <p dangerouslySetInnerHTML={{ __html: item.name }} />
                <p style={{ color: '#555' }}>{item.price}</p>
                <button onClick={() => addToCart(item)}>장바구니 담기</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 장바구니 */}
      <h2 style={{ marginTop: '30px' }}>🛒 장바구니</h2>
      <ul>
        {cart.map((item, idx) => (
          <li key={idx}>{item.name} (x{item.count})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
