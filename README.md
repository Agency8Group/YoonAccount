# Account Manager - 계정 관리 웹사이트

Firebase 기반의 모던하고 안전한 계정 및 보험정보 관리 웹사이트입니다.

## 주요 기능

- 🔐 Firebase 인증을 통한 안전한 로그인/회원가입
- 📝 계정 정보 관리 (서비스명, 아이디, 비밀번호, 메모)
- 🛡️ 보험정보 관리 (보험사명, 보험번호, 계정정보)
- 🎨 모던 블랙 애플 스타일의 고급스러운 디자인
- 📱 반응형 디자인 지원

## 설정 방법

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성
3. Authentication 활성화 (이메일/비밀번호 방식)
4. Firestore Database 생성 (테스트 모드로 시작 가능)

### 2. Firebase 설정 정보 입력

`firebase-config.js` 파일을 열고 Firebase 프로젝트 설정 정보를 입력하세요:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Firebase Console > 프로젝트 설정 > 일반 탭에서 웹 앱 추가 후 설정 정보를 복사하세요.

### 3. Firestore 보안 규칙 설정

Firestore Database > 규칙 탭에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. 실행

웹 서버를 통해 실행하세요. 로컬 개발 서버 예시:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# VS Code Live Server 확장 사용
```

브라우저에서 `http://localhost:8000` 접속

## 사용 방법

1. 회원가입 또는 로그인
2. "새 계정 추가" 버튼으로 계정 정보 추가
3. 탭을 전환하여 계정/보험정보 관리
4. 카드의 수정/삭제 버튼으로 정보 관리

## 보안 주의사항

- 이 프로젝트는 교육/개인용 목적으로 제작되었습니다
- 실제 중요한 정보를 저장하기 전에 추가 보안 조치를 고려하세요
- Firebase 보안 규칙을 반드시 설정하세요
- HTTPS를 통해서만 사용하는 것을 권장합니다

