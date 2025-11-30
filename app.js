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
                text.textContent = '서버 연결 상태 정상';
                text.classList.add('connected');
            } else if (errorMessage.includes('permission-denied') || errorMessage.includes('API')) {
                text.textContent = '서버 연결 상태 제한됨';
                text.classList.add('warning');
                // 툴팁 추가
                text.title = '일부 기능이 제한될 수 있습니다.';
            } else {
                text.textContent = '서버 연결 상태 확인 불가';
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

// 로그인
document.getElementById('loginForm').addEventListener('submit', async (e) => {
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

// 회원가입 기능 비활성화됨

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('로그아웃 오류:', error);
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

// 탭 전환
document.querySelectorAll('.tab').forEach(tab => {
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
            document.getElementById('accountsTab').classList.add('active');
        } else {
            document.getElementById('insuranceTab').classList.add('active');
        }
    });
});

// 모달 관리
let currentItemType = 'account';
let editingItemId = null;

document.getElementById('addAccountBtn').addEventListener('click', () => {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    openModal(activeTab === 'accounts' ? 'account' : 'insurance');
});

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

function openModal(type, itemId = null) {
    currentItemType = type;
    editingItemId = itemId;
    const modal = document.getElementById('modal');
    const form = document.getElementById('accountForm');
    const insuranceFields = document.getElementById('insuranceFields');
    const insuranceFields2 = document.getElementById('insuranceFields2');
    const accountSiteUrlField = document.getElementById('accountSiteUrlField');
    const serviceNameLabel = document.getElementById('serviceNameLabel');
    const notesLabel = document.getElementById('notesLabel');
    
    if (type === 'insurance') {
        document.getElementById('modalTitle').textContent = itemId ? '보험정보 수정' : '새 보험정보 추가';
        insuranceFields.style.display = 'block';
        insuranceFields2.style.display = 'block';
        accountSiteUrlField.style.display = 'none';
        serviceNameLabel.textContent = '서비스/사이트명';
        notesLabel.textContent = '메모';
    } else {
        document.getElementById('modalTitle').textContent = itemId ? '계정 수정' : '새 계정 추가';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
        accountSiteUrlField.style.display = 'block';
        serviceNameLabel.textContent = '사이트명';
        notesLabel.textContent = '특이사항';
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

// 비밀번호 표시/숨기기
document.getElementById('togglePassword').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
});

// 폼 제출
document.getElementById('accountForm').addEventListener('submit', async (e) => {
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
    
    const itemData = {
        serviceName: document.getElementById('serviceName').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value.trim(),
        notes: document.getElementById('notes').value.trim(),
        type: currentItemType,
        userId: user.uid,
        updatedAt: Date.now()
    };
    
    // 필수 필드 검증
    if (!itemData.serviceName || !itemData.username || !itemData.password) {
        alert('사이트명, 아이디, 비밀번호는 필수 입력 항목입니다.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
        return;
    }
    
    // 계정인 경우 사이트 주소 추가
    if (currentItemType === 'account') {
        const siteUrl = document.getElementById('siteUrl').value.trim();
        if (siteUrl) {
            itemData.siteUrl = siteUrl;
        }
    }
    
    // 보험정보인 경우 추가 필드
    if (currentItemType === 'insurance') {
        itemData.insuranceCompany = document.getElementById('insuranceCompany').value.trim();
        itemData.insuranceNumber = document.getElementById('insuranceNumber').value.trim();
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
});

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
        
        const accounts = [];
        const insurance = [];
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = { id: childSnapshot.key, ...childSnapshot.val() };
                console.log('데이터 항목:', data);
                if (data.type === 'account') {
                    accounts.push(data);
                } else {
                    insurance.push(data);
                }
            });
        }
        
        console.log('로드된 계정 수:', accounts.length);
        console.log('로드된 보험정보 수:', insurance.length);
        
        // updatedAt 기준으로 정렬
        accounts.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        insurance.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        
        renderAccounts(accounts);
        renderInsurance(insurance);
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

// 계정 렌더링
function renderAccounts(accounts) {
    const container = document.getElementById('accountsList');
    
    if (accounts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 계정이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = accounts.map(account => `
        <div class="account-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(account.serviceName)}</div>
                    <div class="card-subtitle">${escapeHtml(account.username)}</div>
                    ${account.siteUrl ? `<div class="card-url" style="font-size: 11px; color: var(--accent); margin-top: 4px;">
                        <a href="${escapeHtml(account.siteUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none;">
                            ${escapeHtml(account.siteUrl)}
                        </a>
                    </div>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="editItem('account', '${account.id}')" title="수정">✏️</button>
                    <button class="btn-icon" onclick="deleteItem('${account.id}')" title="삭제">🗑️</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <span class="info-label">비밀번호:</span>
                    <span class="info-value" id="pwd-${account.id}">••••••••</span>
                </div>
            </div>
            ${account.notes ? `<div class="card-notes"><strong>특이사항:</strong> ${escapeHtml(account.notes)}</div>` : ''}
            <button class="btn-link" style="margin-top: 8px; font-size: 12px;" onclick="togglePassword('${account.id}')">비밀번호 보기</button>
        </div>
    `).join('');
}

// 보험정보 렌더링
function renderInsurance(insuranceList) {
    const container = document.getElementById('insuranceList');
    
    if (insuranceList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">등록된 보험정보가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = insuranceList.map(insurance => `
        <div class="insurance-card">
            <div class="card-header">
                <div>
                    <div class="card-title">${escapeHtml(insurance.insuranceCompany || insurance.serviceName)}</div>
                    <div class="card-subtitle">${escapeHtml(insurance.insuranceNumber || '')}</div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="editItem('insurance', '${insurance.id}')" title="수정">✏️</button>
                    <button class="btn-icon" onclick="deleteItem('${insurance.id}')" title="삭제">🗑️</button>
                </div>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <span class="info-label">계정:</span>
                    <span class="info-value">${escapeHtml(insurance.username)}</span>
                </div>
                ${insurance.password ? `
                <div class="info-item">
                    <span class="info-label">비밀번호:</span>
                    <span class="info-value" id="pwd-${insurance.id}">••••••••</span>
                </div>
                ` : ''}
            </div>
            ${insurance.notes ? `<div class="card-notes">${escapeHtml(insurance.notes)}</div>` : ''}
            ${insurance.password ? `<button class="btn-link" style="margin-top: 8px; font-size: 12px;" onclick="togglePassword('${insurance.id}')">비밀번호 보기</button>` : ''}
        </div>
    `).join('');
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
        } else {
            // 보험정보인 경우
            document.getElementById('insuranceCompany').value = data.insuranceCompany || '';
            document.getElementById('insuranceNumber').value = data.insuranceNumber || '';
        }
    } catch (error) {
        console.error('데이터 로드 오류:', error);
    }
}

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

// 모달 외부 클릭 시 닫기
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

// 엑셀 다운로드
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
        const insurance = [];
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = { id: childSnapshot.key, ...childSnapshot.val() };
                if (data.type === 'account') {
                    accounts.push(data);
                } else {
                    insurance.push(data);
                }
            });
        }
        
        // 엑셀 워크북 생성
        const wb = XLSX.utils.book_new();
        
        // 계정 시트 생성
        const accountData = accounts.map(item => ({
            '사이트 주소': item.siteUrl || '',
            '사이트명': item.serviceName || '',
            '아이디 (이메일)': item.username || '',
            '비밀번호': item.password || '',
            '특이사항': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));
        
        if (accountData.length > 0) {
            const accountWs = XLSX.utils.json_to_sheet(accountData);
            XLSX.utils.book_append_sheet(wb, accountWs, '계정');
        }
        
        // 보험정보 시트 생성
        const insuranceData = insurance.map(item => ({
            '서비스/사이트명': item.serviceName || '',
            '보험사명': item.insuranceCompany || '',
            '보험번호': item.insuranceNumber || '',
            '아이디/이메일': item.username || '',
            '비밀번호': item.password || '',
            '메모': item.notes || '',
            '등록일': item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            '수정일': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : ''
        }));
        
        if (insuranceData.length > 0) {
            const insuranceWs = XLSX.utils.json_to_sheet(insuranceData);
            XLSX.utils.book_append_sheet(wb, insuranceWs, '보험정보');
        }
        
        // 빈 경우 빈 시트라도 생성
        if (accountData.length === 0 && insuranceData.length === 0) {
            const emptyWs = XLSX.utils.json_to_sheet([{ '메시지': '등록된 데이터가 없습니다.' }]);
            XLSX.utils.book_append_sheet(wb, emptyWs, '계정');
        }
        
        // 파일 다운로드
        const fileName = `계정관리_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        alert(`엑셀 파일이 다운로드되었습니다.\n\n계정: ${accounts.length}개\n보험정보: ${insurance.length}개`);
    } catch (error) {
        console.error('엑셀 다운로드 오류:', error);
        alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
}

// 엑셀 업로드
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
                
                // 각 시트 처리
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    jsonData.forEach((row, index) => {
                        try {
                            // 필수 필드 확인 (계정인 경우)
                            const isInsurance = sheetName.includes('보험');
                            let serviceName = '';
                            let username = '';
                            let password = '';
                            
                            if (isInsurance) {
                                // 보험정보인 경우
                                serviceName = row['서비스/사이트명'] || row['서비스'] || row['사이트명'] || '';
                                username = row['아이디/이메일'] || row['아이디'] || row['이메일'] || '';
                                password = row['비밀번호'] || '';
                            } else {
                                // 계정인 경우 - 새로운 컬럼 형식
                                serviceName = row['사이트명'] || row['서비스/사이트명'] || row['서비스'] || '';
                                username = row['아이디 (이메일)'] || row['아이디/이메일'] || row['아이디'] || row['이메일'] || '';
                                password = row['비밀번호'] || '';
                            }
                            
                            if (!serviceName || !username || !password) {
                                totalSkipped++;
                                errors.push(`${sheetName} 시트 ${index + 2}행: 필수 필드 누락 (사이트명, 아이디, 비밀번호 필요)`);
                                return;
                            }
                            
                            // 데이터 준비
                            const itemData = {
                                serviceName: String(serviceName).trim(),
                                username: String(username).trim(),
                                password: String(password).trim(),
                                notes: String(row['특이사항'] || row['메모'] || '').trim(),
                                type: isInsurance ? 'insurance' : 'account',
                                userId: user.uid,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };
                            
                            // 사이트 주소 추가 (계정인 경우)
                            if (!isInsurance && row['사이트 주소']) {
                                itemData.siteUrl = String(row['사이트 주소']).trim();
                            }
                            
                            // 보험정보인 경우 추가 필드
                            if (itemData.type === 'insurance') {
                                itemData.insuranceCompany = String(row['보험사명'] || '').trim();
                                itemData.insuranceNumber = String(row['보험번호'] || '').trim();
                            }
                            
                            // Realtime Database에 추가 (Promise 배열에 추가)
                            const promise = db.ref('items').push(itemData)
                                .then(() => {
                                    totalAdded++;
                                })
                                .catch(error => {
                                    totalSkipped++;
                                    errors.push(`${sheetName} 시트 ${index + 2}행: ${error.message}`);
                                });
                            
                            promises.push(promise);
                        } catch (error) {
                            totalSkipped++;
                            errors.push(`${sheetName} 시트 ${index + 2}행: ${error.message}`);
                        }
                    });
                });
                
                // 모든 Promise 완료 대기
                await Promise.allSettled(promises);
                
                // 데이터 새로고침
                await loadData();
                
                // 결과 표시
                let message = `엑셀 업로드 완료!\n\n`;
                message += `성공: ${totalAdded}개\n`;
                message += `실패: ${totalSkipped}개`;
                
                if (errors.length > 0 && errors.length <= 10) {
                    message += `\n\n오류:\n${errors.slice(0, 10).join('\n')}`;
                } else if (errors.length > 10) {
                    message += `\n\n오류: ${errors.length}개 (처음 10개만 표시)`;
                }
                
                alert(message);
                
            } catch (error) {
                console.error('엑셀 파싱 오류:', error);
                alert('엑셀 파일을 읽는 중 오류가 발생했습니다.\n\n파일 형식을 확인해주세요.');
            }
        };
        
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('엑셀 업로드 오류:', error);
        alert('엑셀 업로드 중 오류가 발생했습니다.');
    }
}

// 엑셀 다운로드 버튼 이벤트
document.getElementById('downloadExcelBtn').addEventListener('click', downloadExcel);

// 엑셀 업로드 버튼 이벤트
document.getElementById('uploadExcelInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (confirm(`"${file.name}" 파일을 업로드하시겠습니까?`)) {
            uploadExcel(file);
        }
        // 파일 입력 초기화
        e.target.value = '';
    }
});

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


