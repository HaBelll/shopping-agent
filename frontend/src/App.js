import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // 대화 메시지 기록
  const [cart, setCart] = useState([]); // 장바구니 상태
  const [products, setProducts] = useState([]); // 추천 상품 목록
  
  // 장바구니 담기 함수 (수량 추가 포함)
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

  // 추천 상품 텍스트에서 추출
  const parseProducts = (text) => {
    const productRegex = /\d+\.\s(.+?)\s*\|\s*(.+?)\s*\|\s*(https?:\/\/[^\s]+)/g;
    let match;
    const items = [];
  
    while ((match = productRegex.exec(text)) !== null) {
      items.push({
        name: match[1].trim(),
        price: match[2].trim(),
        image: match[3].trim(),
      });
    }
  
    setProducts(items);
  };
  

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      // 장바구니 채팅 처리
      if (
        userMessage.includes('담아줘') ||
        userMessage.includes('담아') ||
        userMessage.includes('넣어줘')
      ) {
        const keyword = userMessage.replace(/.*?(담아줘|담아|넣어줘)/, '').trim();
        const found = products.find((item) => item.name.includes(keyword));

        if (found) {
          addToCart(found);
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: `"${found.name}" 장바구니에 담았어요!` },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: '❗ 해당 상품을 추천 목록에서 찾을 수 없어요.' },
          ]);
        }
        return;
      }

      // 일반 메시지 → 클로바 API 호출
      const res = await axios.post('/api/chat', { message: userMessage });
      const reply = res.data.response;

      console.log("클로바 응답:", reply);
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      parseProducts(reply);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '에러 발생: ' + error.message },
      ]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>🛍️ 쇼핑 챗봇 테스트</h1>

      <div
        style={{
          border: '1px solid #ccc',
          height: '400px',
          overflowY: 'scroll',
          padding: '10px',
          marginBottom: '10px',
          background: '#f9f9f9',
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '5px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                background: msg.sender === 'user' ? '#d0f0ff' : '#fff',
                borderRadius: '12px',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="메시지를 입력하세요"
        style={{ width: '80%', padding: '8px' }}
      />
      <button onClick={handleSend} style={{ marginLeft: '10px' }}>
        보내기
      </button>

      {products.length > 0 && (
        <>
          <h2 style={{ marginTop: '30px' }}>🛍️ 추천 상품 목록</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {products.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  background: '#fff',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <p style={{ fontWeight: 'bold', margin: '10px 0 4px' }}>{item.name}</p>
                <p style={{ color: '#555', marginBottom: '8px' }}>{item.price}</p>
                <button onClick={() => addToCart(item)}>장바구니 담기</button>
            </div>
          ))}
        </div>
        </>
      )}

      <h2 style={{ marginTop: '30px' }}>🛒 장바구니</h2>
      <ul>
        {cart.map((item, idx) => (
          <li key={idx}>
            {item.name} (x{item.count})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
