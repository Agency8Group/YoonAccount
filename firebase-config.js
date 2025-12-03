// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyA9fNWUBzuhvurZM6sa0WA8Xoy_4K8LE6I",
    authDomain: "yoonaccount.firebaseapp.com",
    projectId: "yoonaccount",
    storageBucket: "yoonaccount.firebasestorage.app",
    messagingSenderId: "708767085930",
    appId: "1:708767085930:web:0c9418df304f1c5bb4e113",
    databaseURL: "https://yoonaccount-default-rtdb.asia-southeast1.firebasedatabase.app" // Realtime Database URL
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스
const auth = firebase.auth();
const db = firebase.database(); // Realtime Database

// 인증 상태를 세션 기반으로 설정 (브라우저 탭을 닫으면 로그아웃)
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
        console.log('인증 상태가 세션 기반으로 설정되었습니다.');
    })
    .catch((error) => {
        console.error('인증 상태 설정 오류:', error);
    });

