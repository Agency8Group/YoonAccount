// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyA9fNWUBzuhvurZM6sa0WA8Xoy_4K8LE6I",
    authDomain: "yoonaccount.firebaseapp.com",
    projectId: "yoonaccount",
    storageBucket: "yoonaccount.firebasestorage.app",
    messagingSenderId: "708767085930",
    appId: "1:708767085930:web:0c9418df304f1c5bb4e113",
    databaseURL: "https://yoonaccount-default-rtdb.firebaseio.com/" // Realtime Database URL
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스
const auth = firebase.auth();
const db = firebase.database(); // Realtime Database

