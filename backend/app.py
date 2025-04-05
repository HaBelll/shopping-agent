import traceback
import requests
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv



load_dotenv()

app = Flask(__name__)
CORS(app)

# 클로바X 테스트 API 키

API_KEY = os.getenv("CLOVA_API_KEY")
API_URL = os.getenv("CLOVA_API_URL")


headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}



@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '')

        # 클로바x로 보내는 요청 데이터 구성
        payload = {
            "messages": [
                {"role": "user", "content": user_input}
            ],
            "topP": 0.8,
            "topK": 0,
            "temperature": 0.7,
            "maxTokens": 1000
        }

        # 클로바x로 post 요청 전송
        response = requests.post(API_URL, headers=headers, json=payload)
        result = response.json()
        print("📦 클로바X 응답 내용:", result)

        # 응답 내용이 정상인지 확인하고 추출
        if "result" in result:   
            reply = result["result"]["message"]["content"]
            return jsonify({"response": reply})
        else:
            return jsonify({"error": "클로바x 응답에 'result' 항목이 없습니다.","raw": result}), 500

    except Exception as e:
        print("예외 발생 : ")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# 기존 echo API도 함께 존재할 수 있음
@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.json
    message = data.get('message', '')
    return jsonify({'response': f'You said: {message}'})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
