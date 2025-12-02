// (기존) 매트릭스 배경 관련 코드는 성능 이슈로 제거되었습니다.

// Firebase 연결 상태 확인
function checkFirebaseConnection() {
    const loginStatusDot = document.getElementById('loginStatusDot');
    const loginStatusText = document.getElementById('loginStatusText');
    const mainStatusDot = document.getElementById('mainStatusDot');
    const mainStatusText = document.getElementById('mainStatusText');
    
    function updateStatus(dot, text, isConnected, errorMessage = '') {
        if (dot) {
            dot.classList.remove('checking', 'connected', 'disconnected', 'warning');
            if (isConnected) {
                dot.classList.add('connected');
            } else if (errorMessage.includes('permission-denied') || errorMessage.includes('API')) {
                dot.classList.add('warning');
            } else {
                dot.classList.add('disconnected');
            }
        }
        
        if (text) {
            text.classList.remove('connected', 'disconnected', 'warning');
            if (isConnected) {
                text.textContent = 'Server connection: OK';
                text.classList.add('connected');
            } else if (errorMessage.includes('permission-denied') || errorMessage.includes('API')) {
                text.textContent = 'Server connection: Limited';
                text.classList.add('warning');
                // 툴팁 추가
                text.title = 'Some features may be limited.';
            } else {
                text.textContent = 'Unable to check server connection';
                text.classList.add('disconnected');
            }
        }
    }
    
    // Firebase 앱이 초기화되었는지 확인
    try {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            // Firebase 앱이 초기화되었으므로 기본적으로 연결됨으로 표시
            updateStatus(loginStatusDot, loginStatusText, true);
            updateStatus(mainStatusDot, mainStatusText, true);
            
            // Realtime Database 연결 테스트
            db.ref('.info/connected').once('value')
                .then((snapshot) => {
                    if (snapshot.val() === true) {
                        updateStatus(loginStatusDot, loginStatusText, true);
                        updateStatus(mainStatusDot, mainStatusText, true);
                    } else {
                        updateStatus(loginStatusDot, loginStatusText, false);
                        updateStatus(mainStatusDot, mainStatusText, false);
                    }
                })
                .catch((error) => {
                    // 오류 코드 확인
                    const errorCode = error.code || '';
                    const errorMessage = error.message || '';
                    
                    // permission-denied 오류 감지
                    if (errorCode === 'PERMISSION_DENIED' || 
                        errorMessage.includes('permission-denied')) {
                        updateStatus(loginStatusDot, loginStatusText, false, 'permission-denied');
                        updateStatus(mainStatusDot, mainStatusText, false, 'permission-denied');
                    } else {
                        updateStatus(loginStatusDot, loginStatusText, false);
                        updateStatus(mainStatusDot, mainStatusText, false);
                    }
                });
        } else {
            // Firebase 초기화 안됨
            updateStatus(loginStatusDot, loginStatusText, false);
            updateStatus(mainStatusDot, mainStatusText, false);
        }
    } catch (error) {
        console.error('Firebase 연결 확인 오류:', error);
        updateStatus(loginStatusDot, loginStatusText, false, error.message);
        updateStatus(mainStatusDot, mainStatusText, false, error.message);
    }
}

// Firestore 오류는 각 작업에서 catch하여 처리합니다

// 콘솔 오류 감지 (Firestore API 비활성화 감지) - 한 번만 실행되도록 플래그 사용
let apiErrorDetected = false;
const originalConsoleError = console.error;
console.error = function(...args) {
    const message = args.join(' ');
    // Firestore API 비활성화 오류 감지 (한 번만 실행)
    if (!apiErrorDetected && 
        (message.includes('API has not been used') || 
         (message.includes('API') && message.includes('disabled')) ||
         (message.includes('permission-denied') && message.includes('Firestore')))) {
        apiErrorDetected = true;
        setTimeout(() => {
            checkFirebaseConnection();
        }, 2000);
    }
    // 원래 console.error 호출
    originalConsoleError.apply(console, args);
};

// 연결 상태 클릭 이벤트 (API 비활성화 안내)
document.addEventListener('DOMContentLoaded', () => {
    const loginStatusText = document.getElementById('loginStatusText');
    const mainStatusText = document.getElementById('mainStatusText');
    
    if (loginStatusText) {
        loginStatusText.addEventListener('click', () => {
            const statusText = loginStatusText.textContent;
            if (statusText.includes('제한됨')) {
                const message = `서버 연결 상태가 제한되어 있습니다.\n\n` +
                    `다음 단계를 따라주세요:\n` +
                    `1. 아래 링크를 클릭하여 설정 페이지로 이동\n` +
                    `2. "사용 설정" 버튼을 클릭하여 활성화\n` +
                    `3. 몇 분 후 페이지를 새로고침\n\n` +
                    `링크: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=yoonaccount`;
                
                if (confirm(message + '\n\n링크를 열까요?')) {
                    window.open('https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=yoonaccount', '_blank');
                }
            }
        });
    }
    
    if (mainStatusText) {
        mainStatusText.addEventListener('click', () => {
            const statusText = mainStatusText.textContent;
            if (statusText.includes('제한됨')) {
                const message = `서버 연결 상태가 제한되어 있습니다.\n\n` +
                    `다음 단계를 따라주세요:\n` +
                    `1. 아래 링크를 클릭하여 설정 페이지로 이동\n` +
                    `2. "사용 설정" 버튼을 클릭하여 활성화\n` +
                    `3. 몇 분 후 페이지를 새로고침\n\n` +
                    `링크: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=yoonaccount`;
                
                if (confirm(message + '\n\n링크를 열까요?')) {
                    window.open('https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=yoonaccount', '_blank');
                }
            }
        });
    }
});

// 페이지 로드 시 연결 상태 확인
window.addEventListener('load', () => {
    setTimeout(() => {
        checkFirebaseConnection();
    }, 1000);
    
    // 주기적으로 연결 상태 확인 (30초마다)
    setInterval(checkFirebaseConnection, 30000);
});

// 전역 검색 인풋 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        let searchTimeout = null;
        searchInput.addEventListener('input', () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            // 타이핑 중 성능 보호용 디바운스
            searchTimeout = setTimeout(() => {
                applySearchFilter();
            }, 150);
        });
    }
});

// 인증 상태 확인
auth.onAuthStateChanged((user) => {
    if (user) {
        // 로그인 상태
        showMainScreen(user);
        // 메인 화면으로 전환 시 연결 상태 다시 확인
        setTimeout(checkFirebaseConnection, 500);
    } else {
        // 로그아웃 상태
        showLoginScreen();
        // 로그인 화면으로 전환 시 연결 상태 다시 확인
        setTimeout(checkFirebaseConnection, 500);
    }
});

// 화면 전환
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('mainScreen').style.display = 'none';
}

function showMainScreen(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
    document.getElementById('userEmail').textContent = user.email;
    loadData();
}

// 회원가입 기능 비활성화됨

// 로그인 폼 이벤트 (DOMContentLoaded에서 처리)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('authError');
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '로그인';
            
            // 입력값 검증
            if (!email || !password) {
                errorDiv.textContent = '이메일과 비밀번호를 입력해주세요.';
                return;
            }
            
            // 로딩 상태 표시
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '로그인 중...';
            }
            errorDiv.textContent = '';
            
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                errorDiv.textContent = '';
                // 로그인 성공 시 화면 전환은 onAuthStateChanged에서 처리됨
            } catch (error) {
                console.error('로그인 오류 상세:', {
                    code: error.code,
                    message: error.message,
                    email: email,
                    fullError: error
                });
                
                const errorMessage = getErrorMessage(error.code, error.message);
                
                // too-many-requests 오류인 경우 특별 처리
                if (error.code === 'auth/too-many-requests') {
                    errorDiv.innerHTML = errorMessage.replace(/\n/g, '<br>');
                } else {
                    errorDiv.textContent = errorMessage;
                }
                
                // 400 Bad Request 오류인 경우 추가 안내
                if (error.code === 'auth/invalid-credential' || 
                    error.code === 'auth/user-disabled' ||
                    error.message.includes('400') ||
                    error.message.includes('Bad Request') ||
                    !error.code) {
                    
                    // Firebase Authentication 설정 확인 안내
                    if (error.message.includes('400') || !error.code) {
                        errorDiv.innerHTML = '로그인 요청이 실패했습니다.<br><br>' +
                            'Firebase Console에서 다음을 확인해주세요:<br>' +
                            '1. Authentication > Sign-in method에서 이메일/비밀번호 활성화<br>' +
                            '2. Authorized domains에 현재 도메인 추가<br>' +
                            '3. API 키가 올바르게 설정되어 있는지 확인';
                    }
                }
            } finally {
                // 버튼 상태 복원
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
});

// 회원가입 기능 비활성화됨

// 로그아웃 버튼 이벤트 (DOMContentLoaded에서 처리)
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
            } catch (error) {
                console.error('로그아웃 오류:', error);
            }
        });
    }
});

// 에러 메시지 변환
function getErrorMessage(errorCode, errorMessage = '') {
    const messages = {
        'auth/user-not-found': '등록되지 않은 이메일입니다.',
        'auth/wrong-password': '비밀번호가 잘못되었습니다.',
        'auth/invalid-credential': '이메일 또는 비밀번호가 잘못되었습니다.',
        'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
        'auth/user-disabled': '비활성화된 계정입니다.',
        'auth/too-many-requests': '보안상의 이유로 이 기기에서의 로그인 시도가 일시적으로 차단되었습니다.\n\n너무 많은 실패한 로그인 시도가 감지되었습니다.\n15-30분 후에 다시 시도해주세요.',
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
        'auth/network-request-failed': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        'auth/operation-not-allowed': '이 로그인 방법이 활성화되지 않았습니다.\n\nFirebase Console > Authentication > Sign-in method에서 이메일/비밀번호를 활성화해주세요.',
        'auth/requires-recent-login': '보안을 위해 다시 로그인해주세요.',
    };
    
    // 에러 코드로 메시지 찾기
    if (messages[errorCode]) {
        return messages[errorCode];
    }
    
    // 400 Bad Request 오류 처리
    if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        return '로그인 요청이 실패했습니다.\n\nFirebase Console에서 다음을 확인해주세요:\n1. Authentication > Sign-in method에서 이메일/비밀번호 활성화\n2. Authorized domains에 현재 도메인 추가';
    }
    
    // 기본 메시지
    return errorMessage || '오류가 발생했습니다. 다시 시도해주세요.';
}

// 탭 전환 (DOMContentLoaded에서 처리)
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // 탭 활성화
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 컨텐츠 표시
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            if (tabName === 'accounts') {
                const accountsTab = document.getElementById('accountsTab');
                if (accountsTab) accountsTab.classList.add('active');
            } else if (tabName === 'banks') {
                const banksTab = document.getElementById('banksTab');
                if (banksTab) banksTab.classList.add('active');
            } else if (tabName === 'insurance') {
                const insuranceTab = document.getElementById('insuranceTab');
                if (insuranceTab) insuranceTab.classList.add('active');
            } else if (tabName === 'extras') {
                const extrasTab = document.getElementById('extrasTab');
                if (extrasTab) extrasTab.classList.add('active');
            } else if (tabName === 'wifi') {
                const wifiTab = document.getElementById('wifiTab');
                if (wifiTab) wifiTab.classList.add('active');
            }
        });
    });
});

// 모달 관리
let currentItemType = 'account';
let editingItemId = null;

// DOM이 로드된 후 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    const addAccountBtn = document.getElementById('addAccountBtn');
    if (addAccountBtn) {
        addAccountBtn.addEventListener('click', () => {
            const activeTab = document.querySelector('.tab.active')?.dataset.tab;
            if (activeTab === 'accounts') {
                openModal('account');
            } else if (activeTab === 'banks') {
                openModal('bank');
            } else if (activeTab === 'insurance') {
                openModal('insurance');
            } else if (activeTab === 'extras') {
                openModal('extra');
            } else if (activeTab === 'wifi') {
                openModal('wifi');
            }
        });
    }

    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.getElementById('togglePassword');
            
            if (passwordInput && toggleBtn) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleBtn.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    toggleBtn.textContent = '👁️';
                }
            }
        });
    }

    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', handleFormSubmit);
    }

    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                closeModal();
            }
        });
    }

    const downloadExcelBtn = document.getElementById('downloadExcelBtn');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => {
            openConfirmModal(
                'Download Excel',
                'Save all accounts, banks, insurance, and other information to an Excel file?',
                () => {
                    downloadExcel();
                }
            );
        });
    }
});

function openModal(type, itemId = null) {
    currentItemType = type;
    editingItemId = itemId;
    const modal = document.getElementById('modal');
    const form = document.getElementById('accountForm');
    const insuranceFields = document.getElementById('insuranceFields');
    const insuranceFields2 = document.getElementById('insuranceFields2');
    const accountSiteUrlField = document.getElementById('accountSiteUrlField');
    const usernameField = document.getElementById('usernameField');
    const passwordField = document.getElementById('passwordField');
    const serviceNameLabel = document.getElementById('serviceNameLabel');
    const notesLabel = document.getElementById('notesLabel');
    const usernameLabel = document.getElementById('usernameLabel');
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const serviceNameInput = document.getElementById('serviceName');
    
    if (type === 'insurance') {
        // 보험정보: 엑셀 컬럼 순서 (보험사명 → 보험서비스 → 보험번호 → 아이디 → 비밀번호 → 메모)
        document.getElementById('modalTitle').textContent = itemId ? 'Edit Insurance' : 'Add Insurance';
        insuranceFields.style.display = 'block';
        insuranceFields2.style.display = 'block';
        accountSiteUrlField.style.display = 'none';
        usernameField.style.display = 'block';
        passwordField.style.display = 'block';
        serviceNameLabel.textContent = '보험서비스';
        notesLabel.textContent = '메모';
        if (usernameLabel) usernameLabel.textContent = '아이디(이메일)';
        // 보험정보: 아이디는 필수, 비밀번호는 선택
        usernameInput.required = true;
        passwordInput.required = false;
        serviceNameInput.required = true;
    } else if (type === 'bank') {
        document.getElementById('modalTitle').textContent = itemId ? 'Edit Bank' : 'Add Bank';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
        accountSiteUrlField.style.display = 'none';
        usernameField.style.display = 'block';
        passwordField.style.display = 'block';
        serviceNameLabel.textContent = '은행명';
        notesLabel.textContent = '메모';
        if (usernameLabel) usernameLabel.textContent = '계좌번호';
        usernameInput.required = true;
        passwordInput.required = true;
        serviceNameInput.required = true;
    } else if (type === 'extra') {
        // 기타정보: 엑셀 컬럼 순서 (항목명 → 내용)
        document.getElementById('modalTitle').textContent = itemId ? 'Edit Extra' : 'Add Extra';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
        accountSiteUrlField.style.display = 'none';
        usernameField.style.display = 'none';
        passwordField.style.display = 'none';
        serviceNameLabel.textContent = '항목명';
        notesLabel.textContent = '내용';
        if (usernameLabel) usernameLabel.textContent = '아이디 (이메일)';
        // 기타정보: 아이디와 비밀번호는 필요 없음, 항목명 또는 내용만 있으면 됨
        usernameInput.required = false;
        passwordInput.required = false;
        serviceNameInput.required = false;
    } else if (type === 'wifi') {
        // 와이파이정보: 와이파이 이름 → 비밀번호 → 메모
        document.getElementById('modalTitle').textContent = itemId ? 'Edit WiFi' : 'Add WiFi';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
        accountSiteUrlField.style.display = 'none';
        usernameField.style.display = 'none';
        passwordField.style.display = 'block';
        serviceNameLabel.textContent = '와이파이 이름 (SSID)';
        notesLabel.textContent = '메모';
        if (usernameLabel) usernameLabel.textContent = '아이디 (이메일)';
        // 와이파이정보: 와이파이 이름과 비밀번호는 필수
        usernameInput.required = false;
        passwordInput.required = true;
        serviceNameInput.required = true;
    } else {
        document.getElementById('modalTitle').textContent = itemId ? 'Edit Account' : 'Add Account';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
        accountSiteUrlField.style.display = 'block';
        usernameField.style.display = 'block';
        passwordField.style.display = 'block';
        serviceNameLabel.textContent = '서비스 명';
        notesLabel.textContent = '메모';
        if (usernameLabel) usernameLabel.textContent = '아이디 (이메일)';
        usernameInput.required = true;
        passwordInput.required = true;
        serviceNameInput.required = true;
    }
    
    if (itemId) {
        // 수정 모드: 데이터 로드
        loadItemForEdit(type, itemId);
    } else {
        // 추가 모드: 폼 초기화
        form.reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemType').value = type;
    }
    
    // 모달 열기
    modal.classList.add('active');
    // 배경 스크롤 잠금
    document.body.style.overflow = 'hidden';
    
    // 모바일에서 키보드가 올라올 때 뷰포트 조정
    setTimeout(() => {
        const firstInput = form.querySelector('input, textarea');
        if (firstInput && window.innerWidth <= 768) {
            firstInput.focus();
        }
    }, 300);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.getElementById('accountForm').reset();
    editingItemId = null;
    // 배경 스크롤 복원
    document.body.style.overflow = '';
}

// 폼 제출 핸들러
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    // 저장 버튼 비활성화 및 로딩 표시
    const submitBtn = document.querySelector('#accountForm button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '저장';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '저장 중...';
    }
    
    let itemData = {};
    const serviceName = document.getElementById('serviceName').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (currentItemType === 'account') {
        // 계정: 서비스 명, 아이디, 비밀번호 필수
        if (!serviceName || !username || !password) {
            alert('서비스 명, 아이디, 비밀번호는 필수 입력 항목입니다.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            return;
        }

        itemData = {
            serviceName,
            username,
            password,
            notes,
            type: currentItemType,
            userId: user.uid,
            updatedAt: Date.now()
        };

        const siteUrl = document.getElementById('siteUrl').value.trim();
        if (siteUrl) {
            itemData.siteUrl = siteUrl;
        }
    } else if (currentItemType === 'insurance') {
        // 보험: 서비스/사이트명, 아이디/이메일은 필수 (비밀번호 선택)
        if (!serviceName || !username) {
            alert('서비스/사이트명과 아이디(이메일)는 필수 입력 항목입니다.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            return;
        }

        itemData = {
            serviceName,
            username,
            password,
            notes,
            type: currentItemType,
            userId: user.uid,
            updatedAt: Date.now(),
            insuranceCompany: document.getElementById('insuranceCompany').value.trim(),
            insuranceNumber: document.getElementById('insuranceNumber').value.trim()
        };
    } else if (currentItemType === 'bank') {
        // 은행정보: 은행명, 계좌번호, 비밀번호 필수
        if (!serviceName || !username || !password) {
            alert('은행명, 계좌번호, 비밀번호는 필수 입력 항목입니다.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            return;
        }

        itemData = {
            serviceName,            // 은행명
            username,               // 계좌번호
            password,               // 비밀번호
            notes,                  // 메모
            type: currentItemType,
            userId: user.uid,
            updatedAt: Date.now()
        };
    } else if (currentItemType === 'extra') {
        // 기타정보: 항목명 또는 내용 둘 중 하나만 있어도 저장
        if (!serviceName && !notes) {
            alert('항목명 또는 내용을 입력해주세요.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            return;
        }

        itemData = {
            serviceName,
            notes,
            type: currentItemType,
            userId: user.uid,
            updatedAt: Date.now()
        };
    } else if (currentItemType === 'wifi') {
        // 와이파이정보: 와이파이 이름과 비밀번호 필수
        if (!serviceName || !password) {
            alert('와이파이 이름과 비밀번호는 필수 입력 항목입니다.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
            return;
        }

        itemData = {
            serviceName,            // 와이파이 이름 (SSID)
            password,               // 비밀번호
            notes,                  // 메모
            type: currentItemType,
            userId: user.uid,
            updatedAt: Date.now()
        };
    }
    
    console.log('저장할 데이터:', itemData);
    
    try {
        let savedRef;
        if (editingItemId) {
            // 수정
            itemData.updatedAt = Date.now();
            console.log('수정 모드 - ID:', editingItemId);
            savedRef = db.ref('items').child(editingItemId);
            await savedRef.update(itemData);
            console.log('수정 완료');
        } else {
            // 추가
            itemData.createdAt = Date.now();
            console.log('추가 모드');
            savedRef = await db.ref('items').push(itemData);
            console.log('추가 완료 - 생성된 키:', savedRef.key);
        }
        
        // 저장 성공 확인
        const verifySnapshot = await savedRef.once('value');
        if (verifySnapshot.exists()) {
            console.log('저장 확인됨:', verifySnapshot.val());
            closeModal();
            // 약간의 지연 후 데이터 로드 (데이터베이스 동기화 대기)
            setTimeout(() => {
                loadData();
            }, 300);
        } else {
            throw new Error('저장은 되었지만 데이터를 확인할 수 없습니다.');
        }
    } catch (error) {
        console.error('저장 오류 상세:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
            fullError: error
        });
        
        // 권한 오류 감지
        if (error.code === 'PERMISSION_DENIED' || 
            error.message.includes('permission-denied') ||
            error.message.includes('PERMISSION_DENIED')) {
            checkFirebaseConnection();
            alert(`데이터베이스 권한이 없습니다.

Firebase Console > Realtime Database > 규칙 탭에서 다음 규칙 중 하나를 설정해주세요:

[옵션 1: 인증된 사용자만 접근 (권장)]
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}

[옵션 2: 완전히 열어두기 (개발/테스트용만)]
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

주의: 옵션 2는 모든 사람이 접근할 수 있으므로 개발 중에만 사용하세요!`);
        } else {
            alert('저장 중 오류가 발생했습니다.\n\n' +
                  '오류 코드: ' + (error.code || '없음') + '\n' +
                  '오류 메시지: ' + (error.message || '알 수 없는 오류') + '\n\n' +
                  '브라우저 콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.');
        }
    } finally {
        // 버튼 상태 복원
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }
}

// 데이터 로드
async function loadData() {
    const user = auth.currentUser;
    if (!user) {
        console.log('사용자 로그인 정보 없음');
        return;
    }
    
    console.log('데이터 로드 시작 - 사용자 ID:', user.uid);
    
    try {
        const snapshot = await db.ref('items')
            .orderByChild('userId')
            .equalTo(user.uid)
            .once('value');
        
        console.log('데이터 스냅샷:', snapshot.exists() ? '존재함' : '없음');
        
        window.__allAccounts = [];
        window.__allBanks = [];
        window.__allInsurance = [];
        window.__allExtras = [];
        window.__allWifi = [];
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = { id: childSnapshot.key, ...childSnapshot.val() };
                console.log('데이터 항목:', data);
                if (data.type === 'account') {
                    window.__allAccounts.push(data);
                } else if (data.type === 'bank') {
                    window.__allBanks.push(data);
                } else if (data.type === 'insurance') {
                    window.__allInsurance.push(data);
                } else if (data.type === 'extra') {
                    window.__allExtras.push(data);
                } else if (data.type === 'wifi') {
                    window.__allWifi.push(data);
                }
            });
        }
        
        console.log('로드된 계정 수:', window.__allAccounts.length);
        console.log('로드된 보험정보 수:', window.__allInsurance.length);
        
        // updatedAt 기준으로 정렬
        window.__allAccounts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        window.__allBanks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        window.__allInsurance.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        window.__allExtras.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        window.__allWifi.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        applySearchFilter(); // 검색어 반영해서 렌더링
    } catch (error) {
        console.error('데이터 로드 오류 상세:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
            fullError: error
        });
        
        // 권한 오류 감지 시 연결 상태 업데이트
        if (error.code === 'PERMISSION_DENIED' || 
            error.message.includes('permission-denied') ||
            error.message.includes('PERMISSION_DENIED')) {
            checkFirebaseConnection();
            alert('데이터를 불러올 수 없습니다.\n\nRealtime Database 보안 규칙을 확인해주세요.');
        } else {
            alert('데이터를 불러오는 중 오류가 발생했습니다.\n\n브라우저 콘솔(F12)에서 자세한 오류를 확인할 수 있습니다.');
        }
    }
}

// URL에서 도메인 추출
function getDomainFromUrl(url) {
    if (!url) return '기타';
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return url;
    }
}

// 검색 하이라이트 적용
function highlightMatches(text, query) {
    if (!query) return escapeHtml(text || '');
    const safeText = text || '';
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    return escapeHtml(safeText).replace(regex, (match) => `<span class="highlight">${match}</span>`);
}

// 검색 필터 적용 (계정 + 은행 + 보험 + 기타 + 와이파이)
function applySearchFilter() {
    const queryInput = document.getElementById('globalSearchInput');
    const keyword = (queryInput ? queryInput.value : '').trim().toLowerCase();

    const accounts = (window.__allAccounts || []).filter(item => {
        if (!keyword) return true;
        const target =
            (item.siteUrl || '') +
            (item.serviceName || '') +
            (item.username || '') +
            (item.password || '') +
            (item.notes || '');
        return target.toLowerCase().includes(keyword);
    });

    const insurance = (window.__allInsurance || []).filter(item => {
        if (!keyword) return true;
        const target =
            (item.serviceName || '') +
            (item.insuranceCompany || '') +
            (item.insuranceNumber || '') +
            (item.username || '') +
            (item.password || '') +
            (item.notes || '');
        return target.toLowerCase().includes(keyword);
    });

    const banks = (window.__allBanks || []).filter(item => {
        if (!keyword) return true;
        const target =
            (item.serviceName || '') +   // 은행명
            (item.username || '') +      // 계좌번호
            (item.password || '') +
            (item.notes || '');
        return target.toLowerCase().includes(keyword);
    });

    const extras = (window.__allExtras || []).filter(item => {
        if (!keyword) return true;
        const target =
            (item.serviceName || '') +
            (item.notes || '');
        return target.toLowerCase().includes(keyword);
    });

    const wifi = (window.__allWifi || []).filter(item => {
        if (!keyword) return true;
        const target =
            (item.serviceName || '') +   // 와이파이 이름
            (item.password || '') +      // 비밀번호
            (item.notes || '');
        return target.toLowerCase().includes(keyword);
    });
    
    renderAccounts(accounts, keyword);
    renderBanks(banks, keyword);
    renderInsurance(insurance, keyword);
    renderExtras(extras, keyword);
    renderWifi(wifi, keyword);
}

// 계정 렌더링 (아코디언 형태)
function renderAccounts(accounts, keyword = '') {
    const container = document.getElementById('accountsList');
    
    if (accounts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 계정이 없습니다.</p>';
        return;
    }
    
    // 저장된 그룹 이름 불러오기
    const groupNames = JSON.parse(localStorage.getItem('accountGroupNames') || '{}');
    
    // URL 기반으로 그룹화
    const groups = {};
    accounts.forEach(account => {
        const url = account.siteUrl || '';
        const domain = getDomainFromUrl(url);
        const originalKey = domain || '기타';
        const groupKey = groupNames[originalKey] || originalKey;
        
        if (!groups[groupKey]) {
            groups[groupKey] = {
                name: groupKey,
                originalKey: originalKey,
                url: url,
                accounts: [],
                order: account.order || 0
            };
        }
        groups[groupKey].accounts.push(account);
    });
    
    // 그룹 정렬 (order 기준, 없으면 이름 기준)
    const sortedGroups = Object.values(groups).sort((a, b) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
        return a.name.localeCompare(b.name);
    });
    
    // 아코디언 HTML 생성 (최초에는 모두 접힌 상태로 렌더링)
    container.innerHTML = sortedGroups.map((group, groupIndex) => {
        const groupId = `group-${groupIndex}`;
        const isOpen = false; // 기본적으로 모두 접힌 상태
        
        return `
            <div class="accordion-group" data-group-key="${escapeHtml(group.originalKey || group.name)}" draggable="false" data-group-index="${groupIndex}">
                <div class="accordion-header" onclick="toggleAccordion('${groupId}', this)">
                    <div class="accordion-header-content">
                        <input type="text" 
                               class="group-name-input" 
                               value="${escapeHtml(group.name)}" 
                               readonly
                               disabled
                               onclick="event.stopPropagation()"
                               data-group-id="${groupId}"
                               title="${escapeHtml(group.name)}">
                        <span class="group-count">(${group.accounts.length})</span>
                        ${group.url ? `<a href="${escapeHtml(group.url)}" target="_blank" rel="noopener noreferrer" class="group-url" onclick="event.stopPropagation()" title="${escapeHtml(group.url)}">${escapeHtml(group.url.length > 30 ? group.url.substring(0, 30) + '...' : group.url)}</a>` : ''}
                    </div>
                    <div class="accordion-actions">
                    </div>
                </div>
                <div class="accordion-content" id="${groupId}" style="display: ${isOpen ? 'block' : 'none'}">
                    ${group.accounts.map(account => `
                        <div class="account-item" draggable="false" data-account-id="${account.id}">
                            <div class="account-item-content">
                                <span class="drag-handle-small" onclick="event.stopPropagation()" title="드래그하여 순서 변경">☰</span>
                                <div class="account-item-info" onclick="event.stopPropagation()">
                                    <div class="account-item-title">${highlightMatches(account.serviceName || '', keyword)}</div>
                                    <div class="account-item-credentials">
                                        <div class="credential-row">
                                            <span class="credential-label">아이디:</span>
                                            <span class="credential-value" id="username-${account.id}">${highlightMatches(account.username || '', keyword)}</span>
                                            <button class="btn-copy" data-copy-text="${escapeHtml(account.username || '')}" data-target-id="username-${account.id}" title="Copy ID">⧉</button>
                                        </div>
                                        <div class="credential-row">
                                            <span class="credential-label">비밀번호:</span>
                                            <span class="credential-value" id="password-${account.id}">${highlightMatches(account.password || '', keyword)}</span>
                                            <button class="btn-copy" data-copy-text="${escapeHtml(account.password || '')}" data-target-id="password-${account.id}" title="Copy Password">⧉</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="account-item-actions" onclick="event.stopPropagation()">
                                    <button class="btn-icon-small" onclick="editItem('account', '${account.id}')" title="Edit">✎</button>
                                    <button class="btn-icon-small" onclick="deleteItem('${account.id}')" title="Delete">✕</button>
                                </div>
                            </div>
                            ${account.notes ? `
                            <div class="account-item-details" style="display: block;">
                                <div class="card-notes"><strong>메모:</strong> ${highlightMatches(account.notes, keyword)}</div>
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // 드래그 앤 드롭 이벤트 초기화 (1계정 탭 대분류 순서 변경 기능 제거: 그룹 드래그는 막고, 개별 계정 항목만 유지)
    initializeDragAndDrop();
    
    // 복사 버튼 이벤트 초기화
    initializeCopyButtons();
}

// 복사 버튼 이벤트 초기화
function initializeCopyButtons() {
    const copyButtons = document.querySelectorAll('.btn-copy');
    copyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const text = this.getAttribute('data-copy-text');
            const targetId = this.getAttribute('data-target-id');
            copyToClipboard(text, targetId);
        });
    });
}

// 보험정보 렌더링 (아코디언 형태)
function renderInsurance(insuranceList, keyword = '') {
    const container = document.getElementById('insuranceList');
    
    if (insuranceList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 보험정보가 없습니다.</p>';
        return;
    }

    const groupId = 'insurance-group';

    container.innerHTML = `
        <div class="accordion-group" data-group-key="보험정보" draggable="false">
            <div class="accordion-header" onclick="toggleAccordion('${groupId}', this)">
                <div class="accordion-header-content">
                    <span class="group-name-input" style="border: none; padding-left: 0; cursor: default;" readonly>보험정보 (${insuranceList.length})</span>
                </div>
                <div class="accordion-actions"></div>
            </div>
            <div class="accordion-content" id="${groupId}" style="display: none">
                ${insuranceList.map(insurance => `
                    <div class="account-item" draggable="false" data-account-id="${insurance.id}">
                        <div class="account-item-content">
                            <div class="account-item-info">
                                <div class="account-item-title">
                                    ${highlightMatches(insurance.insuranceCompany || '', keyword)}
                                </div>
                                <div class="account-item-credentials">
                                    <div class="credential-row">
                                        <span class="credential-label">보험서비스:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(insurance.serviceName || '', keyword)}
                                        </span>
                                    </div>
                                    <div class="credential-row">
                                        <span class="credential-label">보험번호:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(insurance.insuranceNumber || '', keyword)}
                                        </span>
                                    </div>
                                    <div class="credential-row">
                                        <span class="credential-label">아이디:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(insurance.username || '', keyword)}
                                        </span>
                                    </div>
                                    ${insurance.password ? `
                                    <div class="credential-row">
                                        <span class="credential-label">비밀번호:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(insurance.password || '', keyword)}
                                        </span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="account-item-actions">
                                <button class="btn-icon-small" onclick="editItem('insurance', '${insurance.id}')" title="Edit">✎</button>
                                <button class="btn-icon-small" onclick="deleteItem('${insurance.id}')" title="Delete">✕</button>
                            </div>
                        </div>
                        ${insurance.notes ? `
                        <div class="account-item-details" style="display: block;">
                            <div class="card-notes"><strong>메모:</strong> ${highlightMatches(insurance.notes, keyword)}</div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 은행정보 렌더링 (아코디언 형태)
function renderBanks(bankList, keyword = '') {
    const container = document.getElementById('banksList');
    
    if (bankList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 은행정보가 없습니다.</p>';
        return;
    }

    const groupId = 'banks-group';

    container.innerHTML = `
        <div class="accordion-group" data-group-key="은행정보" draggable="false">
            <div class="accordion-header" onclick="toggleAccordion('${groupId}', this)">
                <div class="accordion-header-content">
                    <span class="group-name-input" style="border: none; padding-left: 0; cursor: default;" readonly>은행정보 (${bankList.length})</span>
                </div>
                <div class="accordion-actions"></div>
            </div>
            <div class="accordion-content" id="${groupId}" style="display: none">
                ${bankList.map(bank => `
                    <div class="account-item" draggable="false" data-account-id="${bank.id}">
                        <div class="account-item-content">
                            <div class="account-item-info">
                                <div class="account-item-title">
                                    ${highlightMatches(bank.serviceName || '', keyword)}
                                </div>
                                <div class="account-item-credentials">
                                    <div class="credential-row">
                                        <span class="credential-label">계좌번호:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(bank.username || '', keyword)}
                                        </span>
                                    </div>
                                    ${bank.password ? `
                                    <div class="credential-row">
                                        <span class="credential-label">비밀번호:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(bank.password || '', keyword)}
                                        </span>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="account-item-actions">
                                <button class="btn-icon-small" onclick="editItem('bank', '${bank.id}')" title="Edit">✎</button>
                                <button class="btn-icon-small" onclick="deleteItem('${bank.id}')" title="Delete">✕</button>
                            </div>
                        </div>
                        ${bank.notes ? `
                        <div class="account-item-details" style="display: block;">
                            <div class="card-notes"><strong>메모:</strong> ${highlightMatches(bank.notes, keyword)}</div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 기타정보 렌더링 (아코디언 형태)
function renderExtras(extrasList, keyword = '') {
    const container = document.getElementById('extrasList');
    
    if (extrasList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 기타 정보가 없습니다.</p>';
        return;
    }

    const groupId = 'extras-group';

    container.innerHTML = `
        <div class="accordion-group" data-group-key="기타정보" draggable="false">
            <div class="accordion-header" onclick="toggleAccordion('${groupId}', this)">
                <div class="accordion-header-content">
                    <span class="group-name-input" style="border: none; padding-left: 0; cursor: default;" readonly>기타정보 (${extrasList.length})</span>
                </div>
                <div class="accordion-actions"></div>
            </div>
            <div class="accordion-content" id="${groupId}" style="display: none">
                ${extrasList.map(extra => `
                    <div class="account-item" draggable="false" data-account-id="${extra.id}">
                        <div class="account-item-content">
                            <div class="account-item-info">
                                <div class="account-item-title">
                                    ${highlightMatches(extra.serviceName || '', keyword)}
                                </div>
                                ${extra.notes ? `
                                <div class="account-item-credentials">
                                    <div class="credential-row">
                                        <span class="credential-label">내용:</span>
                                        <span class="credential-value">
                                            ${highlightMatches(extra.notes || '', keyword)}
                                        </span>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                            <div class="account-item-actions">
                                <button class="btn-icon-small" onclick="editItem('extra', '${extra.id}')" title="Edit">✎</button>
                                <button class="btn-icon-small" onclick="deleteItem('${extra.id}')" title="Delete">✕</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 와이파이정보 렌더링 (아코디언 형태)
function renderWifi(wifiList, keyword = '') {
    const container = document.getElementById('wifiList');
    
    if (wifiList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 와이파이 정보가 없습니다.</p>';
        return;
    }

    const groupId = 'wifi-group';

    container.innerHTML = `
        <div class="accordion-group" data-group-key="와이파이정보" draggable="false">
            <div class="accordion-header" onclick="toggleAccordion('${groupId}', this)">
                <div class="accordion-header-content">
                    <span class="group-name-input" style="border: none; padding-left: 0; cursor: default;" readonly>와이파이정보 (${wifiList.length})</span>
                </div>
                <div class="accordion-actions"></div>
            </div>
            <div class="accordion-content" id="${groupId}" style="display: none">
                ${wifiList.map(wifi => `
                    <div class="account-item" draggable="false" data-account-id="${wifi.id}">
                        <div class="account-item-content">
                            <div class="account-item-info">
                                <div class="account-item-title">
                                    ${highlightMatches(wifi.serviceName || '', keyword)}
                                </div>
                                <div class="account-item-credentials">
                                    <div class="credential-row">
                                        <span class="credential-label">비밀번호:</span>
                                        <span class="credential-value" id="password-${wifi.id}">${highlightMatches(wifi.password || '', keyword)}</span>
                                        <button class="btn-copy" data-copy-text="${escapeHtml(wifi.password || '')}" data-target-id="password-${wifi.id}" title="Copy Password">⧉</button>
                                    </div>
                                </div>
                            </div>
                            <div class="account-item-actions">
                                <button class="btn-icon-small" onclick="editItem('wifi', '${wifi.id}')" title="Edit">✎</button>
                                <button class="btn-icon-small" onclick="deleteItem('${wifi.id}')" title="Delete">✕</button>
                            </div>
                        </div>
                        ${wifi.notes ? `
                        <div class="account-item-details" style="display: block;">
                            <div class="card-notes"><strong>메모:</strong> ${highlightMatches(wifi.notes, keyword)}</div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 복사 버튼 이벤트 초기화
    initializeCopyButtons();
}

// 수정 모드로 데이터 로드
async function loadItemForEdit(type, itemId) {
    try {
        const snapshot = await db.ref('items').child(itemId).once('value');
        if (!snapshot.exists()) return;
        
        const data = snapshot.val();
        document.getElementById('itemId').value = itemId;
        document.getElementById('itemType').value = type;
        document.getElementById('serviceName').value = data.serviceName || '';
        document.getElementById('username').value = data.username || '';
        document.getElementById('password').value = data.password || '';
        document.getElementById('notes').value = data.notes || '';
        
        if (type === 'account') {
            // 계정인 경우 사이트 주소 로드
            document.getElementById('siteUrl').value = data.siteUrl || '';
        } else if (type === 'insurance') {
            // 보험정보인 경우
            document.getElementById('insuranceCompany').value = data.insuranceCompany || '';
            document.getElementById('insuranceNumber').value = data.insuranceNumber || '';
        } else if (type === 'extra') {
            // 기타정보는 serviceName, notes만 사용
            document.getElementById('siteUrl').value = '';
            document.getElementById('insuranceCompany').value = '';
            document.getElementById('insuranceNumber').value = '';
        } else if (type === 'wifi') {
            // 와이파이정보는 serviceName, password, notes만 사용
            document.getElementById('siteUrl').value = '';
            document.getElementById('insuranceCompany').value = '';
            document.getElementById('insuranceNumber').value = '';
        }
    } catch (error) {
        console.error('데이터 로드 오류:', error);
    }
}

// 아코디언 토글 (헤더 한 번 클릭 → 바로 열기/닫기, 추가 애니메이션 최소화)
window.toggleAccordion = function(groupId, headerEl) {
    const content = document.getElementById(groupId);
    if (!content) return;

    // 단순히 display만 토글해서 "숨김→보임"의 미세한 중간 상태가 없도록 처리
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        content.style.maxHeight = '';
        content.style.overflowY = '';
    } else {
        content.style.display = 'none';
        content.style.maxHeight = '';
        content.style.overflowY = '';
    }
};

// 그룹 이름 업데이트
window.updateGroupName = async function(groupId, newName, originalKey) {
    const groupElement = document.querySelector(`[data-group-id="${groupId}"]`).closest('.accordion-group');
    if (!groupElement) return;
    
    const groupKey = originalKey || groupElement.getAttribute('data-group-key');
    const newGroupKey = newName.trim() || '기타';
    
    if (newGroupKey === groupKey) return;
    
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // 그룹 이름을 로컬 스토리지에 저장 (표시용)
        const groupNames = JSON.parse(localStorage.getItem('accountGroupNames') || '{}');
        groupNames[groupKey] = newGroupKey;
        localStorage.setItem('accountGroupNames', JSON.stringify(groupNames));
        
        // 데이터 다시 로드하여 반영
        setTimeout(() => {
            loadData();
        }, 300);
    } catch (error) {
        console.error('그룹 이름 업데이트 오류:', error);
    }
};

// 드래그 앤 드롭 초기화
function initializeDragAndDrop() {
    const accountItems = document.querySelectorAll('.account-item');
    
    // 계정 항목 드래그 앤 드롭만 유지 (대분류 그룹 순서 변경 기능 제거)
    accountItems.forEach(item => {
        const dragHandle = item.querySelector('.drag-handle-small');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                item.draggable = true;
            });
            dragHandle.addEventListener('mouseup', () => {
                item.draggable = false;
            });
        }
        item.addEventListener('dragstart', handleAccountDragStart);
        item.addEventListener('dragover', handleAccountDragOver);
        item.addEventListener('drop', handleAccountDrop);
        item.addEventListener('dragend', handleAccountDragEnd);
    });
}

let draggedGroup = null;
let draggedAccount = null;

// 그룹 드래그 핸들러
function handleGroupDragStart(e) {
    draggedGroup = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleGroupDragOver(e) {
    if (!draggedGroup || draggedGroup === this) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const container = this.parentNode;
    const afterElement = getDragAfterElement(container, e.clientY, '.accordion-group');
    
    if (afterElement == null) {
        container.appendChild(draggedGroup);
    } else {
        container.insertBefore(draggedGroup, afterElement);
    }
}

function handleGroupDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function handleGroupDragEnd(e) {
    this.classList.remove('dragging');
    draggedGroup = null;
    
    // 순서 저장
    saveGroupOrder();
}

// 계정 항목 드래그 핸들러
function handleAccountDragStart(e) {
    // 버튼 클릭 시 드래그 방지
    if (e.target.classList.contains('btn-icon-small') || e.target.closest('.btn-icon-small')) {
        e.preventDefault();
        return;
    }
    draggedAccount = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleAccountDragOver(e) {
    if (!draggedAccount || draggedAccount === this) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const container = this.parentNode;
    const afterElement = getDragAfterElement(container, e.clientY, '.account-item');
    
    if (afterElement == null) {
        container.appendChild(draggedAccount);
    } else {
        container.insertBefore(draggedAccount, afterElement);
    }
}

function handleAccountDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function handleAccountDragEnd(e) {
    this.classList.remove('dragging');
    draggedAccount = null;
}

// 드래그 후 위치 계산
function getDragAfterElement(container, y, selector) {
    const draggableElements = [...container.querySelectorAll(`${selector}:not(.dragging)`)];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 그룹 순서 저장
async function saveGroupOrder() {
    const groups = document.querySelectorAll('.accordion-group');
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        // 그룹 순서를 데이터베이스에 저장 (선택적)
        // 여기서는 로컬 스토리지에 저장하거나 데이터베이스에 order 필드 추가 가능
        const order = Array.from(groups).map((group, index) => ({
            key: group.getAttribute('data-group-key'),
            order: index
        }));
        
        localStorage.setItem('accountGroupOrder', JSON.stringify(order));
    } catch (error) {
        console.error('순서 저장 오류:', error);
    }
}

// 클립보드에 복사
window.copyToClipboard = async function(text, elementId) {
    if (!text) return;
    
    // HTML 엔티티 디코딩
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    const decodedText = textarea.value;
    
    try {
        await navigator.clipboard.writeText(decodedText);
        
        // 복사 성공 피드백
        const element = document.getElementById(elementId);
        if (element) {
            const originalText = element.textContent;
            element.textContent = '복사됨!';
            element.classList.add('copied');
            
            setTimeout(() => {
                element.textContent = originalText;
                element.classList.remove('copied');
            }, 1500);
        }
        
        // 토스트 메시지 표시
        showToast('클립보드에 복사되었습니다');
    } catch (error) {
        console.error('복사 실패:', error);
        // 폴백: 구식 방법
        const textArea = document.createElement('textarea');
        textArea.value = decodedText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('클립보드에 복사되었습니다');
            
            // 복사 성공 피드백
            const element = document.getElementById(elementId);
            if (element) {
                const originalText = element.textContent;
                element.textContent = '복사됨!';
                element.classList.add('copied');
                
                setTimeout(() => {
                    element.textContent = originalText;
                    element.classList.remove('copied');
                }, 1500);
            }
        } catch (err) {
            showToast('복사에 실패했습니다', 'error');
        }
        document.body.removeChild(textArea);
    }
};

// 토스트 메시지 표시
function showToast(message, type = 'success') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// 계정 항목 상세 정보 토글
window.toggleAccountDetails = function(element) {
    element.classList.toggle('expanded');
};

// 전역 함수들
window.editItem = function(type, itemId) {
    openModal(type, itemId);
};

window.deleteItem = async function(itemId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
        await db.ref('items').child(itemId).remove();
        loadData();
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

window.togglePassword = function(itemId) {
    const pwdElement = document.getElementById(`pwd-${itemId}`);
    if (!pwdElement) return;
    
    // 실제 비밀번호를 가져오기 위해 데이터 다시 로드
    db.ref('items').child(itemId).once('value').then(snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (pwdElement.textContent === '••••••••') {
                pwdElement.textContent = data.password;
            } else {
                pwdElement.textContent = '••••••••';
            }
        }
    });
};

// XSS 방지
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모달 외부 클릭 시 닫기는 DOMContentLoaded에서 처리됨

// 공통 확인 모달
let currentConfirmCallback = null;

function openConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');

    if (!modal || !titleEl || !msgEl) return;

    titleEl.textContent = title || '확인';
    msgEl.textContent = message || '이 작업을 진행하시겠습니까?';
    currentConfirmCallback = typeof onConfirm === 'function' ? onConfirm : null;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
    currentConfirmCallback = null;
}

const confirmModalEl = document.getElementById('confirmModal');
if (confirmModalEl) {
    confirmModalEl.addEventListener('click', (e) => {
        if (e.target.id === 'confirmModal') {
            closeConfirmModal();
        }
    });
}

const confirmCloseBtn = document.getElementById('confirmModalClose');
const confirmCancelBtn = document.getElementById('confirmModalCancel');
const confirmOkBtn = document.getElementById('confirmModalOk');

if (confirmCloseBtn) {
    confirmCloseBtn.addEventListener('click', closeConfirmModal);
}
if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', closeConfirmModal);
}
if (confirmOkBtn) {
    confirmOkBtn.addEventListener('click', () => {
        const cb = currentConfirmCallback;
        closeConfirmModal();
        if (cb) cb();
    });
}

// 엑셀 다운로드
// 시트 구조:
//  - 1시트: '계정'  → 계정 데이터
//  - 2시트: '보험정보' → 보험 데이터
async function downloadExcel() {
    const user = auth.currentUser;
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    try {
        // 모든 데이터 가져오기
        const snapshot = await db.ref('items')
            .orderByChild('userId')
            .equalTo(user.uid)
            .once('value');

        const accounts = [];
        const banks = [];
        const insurance = [];
        const extras = [];
        const wifi = [];

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = { id: childSnapshot.key, ...childSnapshot.val() };
                if (data.type === 'account') {
                    accounts.push(data);
                } else if (data.type === 'bank') {
                    banks.push(data);
                } else if (data.type === 'insurance') {
                    insurance.push(data);
                } else if (data.type === 'extra') {
                    extras.push(data);
                } else if (data.type === 'wifi') {
                    wifi.push(data);
                }
            });
        }
        
        // 엑셀 워크북 생성
        const wb = XLSX.utils.book_new();
        
        // 계정 시트 생성 (기초 컬럼 고정)
        const accountBaseRow = {
            '사이트 주소': '',
            '서비스 명': '',
            '아이디 (이메일)': '',
            '비밀번호': '',
            '메모': '',
            '등록일': '',
            '수정일': ''
        };
        const accountData = accounts.map(item => ({
            '사이트 주소': item.siteUrl || '',
            '서비스 명': item.serviceName || '',
            '아이디 (이메일)': item.username || '',
            '비밀번호': item.password || '',
            '메모': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));
        const accountWs = XLSX.utils.json_to_sheet(
            accountData.length > 0 ? accountData : [accountBaseRow]
        );
        XLSX.utils.book_append_sheet(wb, accountWs, '계정');

        // 은행 시트 생성 (2번째 시트, 기초 컬럼 고정)
        const bankBaseRow = {
            '은행명': '',
            '계좌번호': '',
            '비밀번호': '',
            '메모': '',
            '등록일': '',
            '수정일': ''
        };
        const bankData = banks.map(item => ({
            '은행명': item.serviceName || '',
            '계좌번호': item.username || '',
            '비밀번호': item.password || '',
            '메모': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));

        const bankWs = XLSX.utils.json_to_sheet(
            bankData.length > 0 ? bankData : [bankBaseRow]
        );
        XLSX.utils.book_append_sheet(wb, bankWs, '은행정보');

        // 보험 시트 생성 (3번째 시트, 기초 컬럼 고정)
        const insuranceBaseRow = {
            '보험사명': '',
            '보험서비스': '',
            '보험번호': '',
            '아이디(이메일)': '',
            '비밀번호': '',
            '메모': '',
            '등록일': '',
            '수정일': ''
        };
        const insuranceData = insurance.map(item => ({
            '보험사명': item.insuranceCompany || '',
            '보험서비스': item.serviceName || '',
            '보험번호': item.insuranceNumber || '',
            '아이디(이메일)': item.username || '',
            '비밀번호': item.password || '',
            '메모': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));

        const insuranceWs = XLSX.utils.json_to_sheet(
            insuranceData.length > 0 ? insuranceData : [insuranceBaseRow]
        );
        XLSX.utils.book_append_sheet(wb, insuranceWs, '보험정보');

        // 3시트: 기타정보 (통관번호, 와이파이 등 자유 입력, 기초 컬럼 고정)
        const extraBaseRow = {
            '항목명': '',
            '내용': '',
            '등록일': '',
            '수정일': ''
        };
        const extraData = extras.map(item => ({
            '항목명': item.serviceName || '',
            '내용': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));

        const extraWs = XLSX.utils.json_to_sheet(
            extraData.length > 0 ? extraData : [extraBaseRow]
        );
        XLSX.utils.book_append_sheet(wb, extraWs, '기타정보');

        // 5시트: 와이파이정보
        const wifiBaseRow = {
            '와이파이 이름 (SSID)': '',
            '비밀번호': '',
            '메모': '',
            '등록일': '',
            '수정일': ''
        };
        const wifiData = wifi.map(item => ({
            '와이파이 이름 (SSID)': item.serviceName || '',
            '비밀번호': item.password || '',
            '메모': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));

        const wifiWs = XLSX.utils.json_to_sheet(
            wifiData.length > 0 ? wifiData : [wifiBaseRow]
        );
        XLSX.utils.book_append_sheet(wb, wifiWs, '와이파이정보');
        
        // 파일 다운로드
        const fileName = `계정관리_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        alert(
            `Excel file downloaded successfully.\n\n` +
            `Accounts: ${accounts.length}\n` +
            `Insurance: ${insurance.length}\n` +
            `Extras: ${extras.length}\n` +
            `WiFi: ${wifi.length}`
        );
    } catch (error) {
        console.error('Excel download error:', error);
        alert('An error occurred while downloading the Excel file.');
    }
}

// 엑셀 업로드
// 시트 구조(다운로드 포맷과 동일하게 가정):
//  - 1시트: '계정'      → 계정 데이터
//  - 2시트: '보험정보'  → 보험 데이터
async function uploadExcel(file) {
    const user = auth.currentUser;
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!file) {
        return;
    }
    
    try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const promises = [];
                let totalAdded = 0;
                let totalSkipped = 0;
                const errors = [];

                const sheetNames = workbook.SheetNames;

                // 시트 이름 기준으로 탐색 (없으면 기존 순서대로 폴백)
                const accountSheetName =
                    sheetNames.find(name => name === '계정') || sheetNames[0];
                const bankSheetName =
                    sheetNames.find(name => name === '은행정보');
                const insuranceSheetName =
                    sheetNames.find(name => name === '보험정보') ||
                    (sheetNames.length > 1 ? sheetNames[1] : null);
                const extraSheetName =
                    sheetNames.find(name => name === '기타정보') ||
                    (sheetNames.length > 2 ? sheetNames[2] : null);
                const wifiSheetName =
                    sheetNames.find(name => name === '와이파이정보') ||
                    (sheetNames.length > 3 ? sheetNames[3] : null);

                // 1시트: 계정
                if (accountSheetName) {
                    const accountSheet = workbook.Sheets[accountSheetName];
                    const accountRows = XLSX.utils.sheet_to_json(accountSheet);

                    accountRows.forEach((row, index) => {
                        try {
                            const serviceName =
                                row['서비스 명'] ||
                                row['사이트명'] ||
                                row['서비스/사이트명'] ||
                                row['서비스'] ||
                                '';
                            const username =
                                row['아이디 (이메일)'] ||
                                row['아이디/이메일'] ||
                                row['아이디'] ||
                                row['이메일'] ||
                                '';
                            const password = row['비밀번호'] || '';

                            if (!serviceName || !username || !password) {
                                totalSkipped++;
                                errors.push(`계정 시트 ${index + 2}행: 필수 필드 누락 (서비스 명, 아이디, 비밀번호 필요)`);
                                return;
                            }

                            const itemData = {
                                serviceName: String(serviceName).trim(),
                                username: String(username).trim(),
                                password: String(password).trim(),
                                // 기존 '특이사항' 컬럼도 계속 지원하면서, 새 기본 컬럼은 '메모'로 사용
                                notes: String(row['메모'] || row['특이사항'] || '').trim(),
                                type: 'account',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            if (row['사이트 주소']) {
                                itemData.siteUrl = String(row['사이트 주소']).trim();
                            }

                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`계정 시트 ${index + 2}행: ${error.message}`);
                                });

                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`계정 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                }

                // 2시트: 은행정보
                if (bankSheetName) {
                    const bankSheet = workbook.Sheets[bankSheetName];
                    const bankRows = XLSX.utils.sheet_to_json(bankSheet);

                    bankRows.forEach((row, index) => {
                        try {
                            const bankName =
                                row['은행명'] ||
                                row['이름'] ||
                                '';
                            const accountNumber =
                                row['계좌번호'] ||
                                row['계좌'] ||
                                '';
                            const password = row['비밀번호'] || '';

                            if (!bankName || !accountNumber || !password) {
                                totalSkipped++;
                                errors.push(`은행정보 시트 ${index + 2}행: 필수 필드 누락 (은행명, 계좌번호, 비밀번호 필요)`);
                                return;
                            }

                            const itemData = {
                                serviceName: String(bankName).trim(),   // 은행명
                                username: String(accountNumber).trim(), // 계좌번호
                                password: String(password).trim(),
                                notes: String(row['메모'] || '').trim(),
                                type: 'bank',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`은행정보 시트 ${index + 2}행: ${error.message}`);
                                });

                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`은행정보 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                }

                // 3시트: 보험정보
                if (insuranceSheetName) {
                    const insuranceSheet = workbook.Sheets[insuranceSheetName];
                    const insuranceRows = XLSX.utils.sheet_to_json(insuranceSheet);
                    
                    insuranceRows.forEach((row, index) => {
                        try {
                            const serviceName =
                                row['보험서비스'] ||
                                row['서비스/사이트명'] ||
                                row['서비스 명'] ||
                                row['서비스'] ||
                                '';
                            const insuranceCompany =
                                row['보험사명'] || '';
                            const insuranceNumber =
                                row['보험번호'] || '';
                            const username =
                                row['아이디(이메일)'] ||
                                row['아이디/이메일'] ||
                                row['아이디'] ||
                                row['이메일'] ||
                                '';
                            const password = row['비밀번호'] || '';

                            // 보험은 "서비스/사이트명, 아이디/이메일"만 필수로 보고, 비밀번호는 선택
                            if (!serviceName || !username) {
                                totalSkipped++;
                                errors.push(`보험정보 시트 ${index + 2}행: 필수 필드 누락 (서비스/사이트명, 아이디/이메일 필요)`);
                                return;
                            }

                            const itemData = {
                                serviceName: String(serviceName).trim(),
                                insuranceCompany: String(insuranceCompany).trim(),
                                insuranceNumber: String(insuranceNumber).trim(),
                                username: String(username).trim(),
                                password: String(password || '').trim(),
                                notes: String(row['메모'] || '').trim(),
                                type: 'insurance',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`보험정보 시트 ${index + 2}행: ${error.message}`);
                                });

                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`보험정보 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                }

                // 4시트: 기타정보 (통관번호 / 와이파이 등 단순 정보)
                if (extraSheetName) {
                    const extraSheet = workbook.Sheets[extraSheetName];
                    const extraRows = XLSX.utils.sheet_to_json(extraSheet);

                    extraRows.forEach((row, index) => {
                        try {
                            const name =
                                row['항목명'] ||
                                row['이름'] ||
                                row['구분'] ||
                                '';
                            const value =
                                row['내용'] ||
                                row['값'] ||
                                row['메모'] ||
                                '';

                            // 항목명 또는 내용 둘 중 하나만 있어도 저장하도록 허용
                            if (!name && !value) {
                                totalSkipped++;
                                errors.push(`기타정보 시트 ${index + 2}행: 항목명/내용이 모두 비어 있습니다.`);
                                return;
                            }

                            const itemData = {
                                serviceName: String(name || '').trim(), // 이름처럼 사용
                                notes: String(value || '').trim(),      // 내용
                                type: 'extra',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`기타정보 시트 ${index + 2}행: ${error.message}`);
                                });

                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`기타정보 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                }

                // 5시트: 와이파이정보
                if (wifiSheetName) {
                    const wifiSheet = workbook.Sheets[wifiSheetName];
                    const wifiRows = XLSX.utils.sheet_to_json(wifiSheet);

                    wifiRows.forEach((row, index) => {
                        try {
                            const wifiName =
                                row['와이파이 이름 (SSID)'] ||
                                row['와이파이 이름'] ||
                                row['SSID'] ||
                                row['이름'] ||
                                '';
                            const password = row['비밀번호'] || '';

                            if (!wifiName || !password) {
                                totalSkipped++;
                                errors.push(`와이파이정보 시트 ${index + 2}행: 필수 필드 누락 (와이파이 이름, 비밀번호 필요)`);
                                return;
                            }

                            const itemData = {
                                serviceName: String(wifiName).trim(),
                                password: String(password).trim(),
                                notes: String(row['메모'] || '').trim(),
                                type: 'wifi',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`와이파이정보 시트 ${index + 2}행: ${error.message}`);
                                });

                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`와이파이정보 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                }
                
                // 모든 Promise 완료 대기
                await Promise.allSettled(promises);
                
                // 데이터 새로고침
                await loadData();
                
                // 결과 표시
                let message = `Excel upload completed!\n\n`;
                message += `Success: ${totalAdded}\n`;
                message += `Failed: ${totalSkipped}`;
                
                if (errors.length > 0 && errors.length <= 10) {
                    message += `\n\nErrors:\n${errors.slice(0, 10).join('\n')}`;
                } else if (errors.length > 10) {
                    message += `\n\nErrors: ${errors.length} (showing first 10)`;
                }
                
                alert(message);
                
            } catch (error) {
                console.error('Excel parsing error:', error);
                alert('An error occurred while reading the Excel file.\n\nPlease check the file format.');
            }
        };
        
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Excel upload error:', error);
        alert('An error occurred while uploading the Excel file.');
    }
}

// 엑셀 다운로드 버튼 이벤트는 DOMContentLoaded에서 처리됨

// 엑셀 업로드 버튼 이벤트
const openUploadExcelBtn = document.getElementById('openUploadExcelBtn');
const uploadExcelInput = document.getElementById('uploadExcelInput');

if (openUploadExcelBtn && uploadExcelInput) {
    // 1단계: 버튼 클릭 시 확인 모달 먼저
    openUploadExcelBtn.addEventListener('click', () => {
        openConfirmModal(
            'Upload Excel',
            'Upload an Excel file to add data to existing records?',
            () => {
                // 확인 시에만 파일 선택창 열기
                uploadExcelInput.click();
            }
        );
    });

    // 2단계: 파일 선택 후 바로 업로드 실행
    uploadExcelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadExcel(file);

        // 다음에 다시 선택할 수 있도록 초기화
        e.target.value = '';
    });
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal');
        if (modal.classList.contains('active')) {
            closeModal();
        }
    }
});

// 모바일에서 스크롤 최적화
let lastTouchY = 0;
document.addEventListener('touchstart', (e) => {
    lastTouchY = e.touches[0].clientY;
}, { passive: true });

// iOS Safari에서 스크롤 부드럽게
if (CSS.supports('scroll-behavior', 'smooth')) {
    document.documentElement.style.scrollBehavior = 'smooth';
}


