import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // input: 사용자 입력 저장
  // response: 서버 응답 저장
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      // 클로바X 연동 API로 변경
      const res = await axios.post('/api/chat', {
        message: input,
      });
  
      setResponse(res.data.response); // AI 응답 저장
    } catch (error) {
      setResponse('에러 발생: ' + error.message);
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h1>🛍️ 쇼핑 챗봇 테스트</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="메시지를 입력하세요"
      />
      <button onClick={handleSend}>보내기</button>
      <p>응답: {response}</p>
    </div>
  );
}

export default App;
