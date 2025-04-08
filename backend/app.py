from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

CLOVA_API_KEY = os.getenv("CLOVA_API_KEY")
CLOVA_API_URL = os.getenv("CLOVA_API_URL")
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

# ✅ ClovaX 프롬프트 튜닝: 자연스러운 설명 + 키워드 추출
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get("message")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {CLOVA_API_KEY}"
    }

    prompt = (
        "당신은 똑똑한 AI 쇼핑 도우미입니다.\n"
        "사용자의 요청을 이해하고, 그에 맞는 쇼핑 키워드를 추출해주세요.\n"
        "키워드는 네이버 쇼핑에서 검색 가능한 형태로 작성해야 합니다.\n\n"
        "응답은 아래 JSON 형식을 꼭 지켜주세요:\n"
        "{\n"
        "  \"explanation\": \"사용자 요청에 맞는 쇼핑 키워드를 설명하는 문장\",\n"
        "  \"keywords\": [\"키워드1\", \"키워드2\", \"키워드3\", \"키워드4\"]\n"
        "}\n\n"
        "예시:\n"
        "{\n"
        "  \"explanation\": \"겨울철 따뜻한 패딩을 찾고 계시네요! 보온성과 브랜드 중심으로 추천드립니다.\",\n"
        "  \"keywords\": [\"노스페이스 롱패딩\", \"경량 패딩\", \"구스다운 패딩\", \"숏패딩\"]\n"
        "}\n\n"
        "※ 설명 외의 문장은 절대 추가하지 마세요."
    )

    payload = {
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": message}
        ],
        "topP": 0.8,
        "topK": 0,
        "temperature": 0.7,
        "maxTokens": 500,
        "repeatPenalty": 5.0,
        "includeAiFilters": False
    }

    try:
        response = requests.post(CLOVA_API_URL, headers=headers, json=payload)
        result = response.json()
        reply = result["result"]["message"]["content"]

        # 문자열 JSON 파싱
        import json
        parsed = json.loads(reply)
        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ 네이버 쇼핑 API
@app.route('/api/search', methods=['GET'])
def search_product():
    query = request.args.get('query')
    url = f"https://openapi.naver.com/v1/search/shop.json?query={query}&display=4"

    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }

    try:
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
