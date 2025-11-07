### 🤖 AI 이미지 판별기 (Gemini Image Analyzer)

이미지가 AI로 생성됐을 확률을 알려주는 웹 애플리케이션입니다.

사용자가 이미지를 업로드하면 Google Gemini AI 모델이 이미지를 분석하여 AI 생성 가능성을 퍼센트(%)와 근거로 제시합니다.
모든 분석 내역은 Firebase와 연동되어 실시간으로 히스토리에 저장됩니다.

<br>

### 데모 스크린샷
<img width="1861" height="868" alt="스크린샷 2025-11-04 101303" src="https://github.com/user-attachments/assets/dc6467d1-a0fc-4fe1-be54-5903222a0b61" />


<br>

---

## ✨ 주요 기능

* **AI 이미지 분석:** Google 'Gemini 2.5 Flash' 모델을 통해 이미지를 분석합니다.
* **정교한 분석 근거 제시:** 상세한 분석 프롬프트에 따라 구체적인 분석 근거를 제공합니다.
* **실시간 히스토리:** Firebase Firestore의 onSnapshot 기능을 사용하여 분석 내역이 실시간으로 자동 저장 및 업데이트됩니다.
* **사용자별 데이터 관리:** Firebase Authentication(익명 로그인)을 통해 사용자별로 고유 ID를 부여하고 본인만의 분석 히스토리를 확인할 수 있습니다.
* **효율적인 파일 저장:** 용량이 큰 이미지는 Firebase Storage에, 텍스트(분석 결과, 이미지 URL)는 Firestore에 분리 저장하여 DB 효율성을 확보했습니다.

<br>

---

## 🛠️ 기술 스택

* **Frontend:** React.js, Vite
* **AI:** Google Gemini API
* **Backend & DB:** Firebase
    * Authentication (익명 인증)
    * Firestore (실시간 데이터베이스)
    * Cloud Storage (이미지 파일 저장소)
* **Environment:** Node.js

<br>

---

## 🚀 프로젝트 실행 방법

### 1. 저장소 클론

```bash
git clone [https://github.com/gityhb/gemini-image-analyzer.git](https://github.com/gityhb/gemini-image-analyzer.git)
cd gemini-image-analyzer
```

### 2. 의존성 패키지 설치
```bash
npm install
```

### 3. .env 파일 생성 후 설정 (env.example을 활용해주세요!)

```
# 1. Google Gemini API 키 (Google AI Studio에서 발급)
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# 2. Firebase 프로젝트 설정값 (Firebase 콘솔에서 확인)
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
```

### 4. 개발 서버 실행
```bash
npm run dev
```

<br>

---

## 🧠 핵심 문제 해결
* **문제**: 이미지 파일(고용량)을 Firestore(저용량 텍스트 DB)에 효율적으로 저장해야 했습니다.

* **해결**: 이미지는 Firebase Storage에 업로드하고, Storage가 반환해 준 downloadURL(텍스트 주소)만 Firestore에 저장하는 방식으로 데이터를 이원화하여 문제를 해결했습니다.
