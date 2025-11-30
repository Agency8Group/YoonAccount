// 인증 상태 확인
auth.onAuthStateChanged((user) => {
    if (user) {
        // 로그인 상태
        showMainScreen(user);
    } else {
        // 로그아웃 상태
        showLoginScreen();
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

// 로그인/회원가입 토글
let isSignupMode = false;
document.getElementById('toggleAuth').addEventListener('click', () => {
    isSignupMode = !isSignupMode;
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.getElementById('toggleAuth');
    
    if (isSignupMode) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        toggleText.textContent = '이미 계정이 있으신가요?';
        toggleBtn.textContent = '로그인';
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        toggleText.textContent = '계정이 없으신가요?';
        toggleBtn.textContent = '회원가입';
    }
    document.getElementById('authError').textContent = '';
});

// 로그인
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('authError');
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
    }
});

// 회원가입
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('authError');
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // 사용자 이름 저장 (선택사항)
        await userCredential.user.updateProfile({ displayName: name });
        errorDiv.textContent = '';
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
    }
});

// 로그아웃
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
});

// 에러 메시지 변환
function getErrorMessage(errorCode) {
    const messages = {
        'auth/user-not-found': '등록되지 않은 이메일입니다.',
        'auth/wrong-password': '비밀번호가 잘못되었습니다.',
        'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
        'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
        'auth/invalid-email': '유효하지 않은 이메일입니다.',
        'auth/network-request-failed': '네트워크 오류가 발생했습니다.',
    };
    return messages[errorCode] || '오류가 발생했습니다. 다시 시도해주세요.';
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
    
    if (type === 'insurance') {
        document.getElementById('modalTitle').textContent = itemId ? '보험정보 수정' : '새 보험정보 추가';
        insuranceFields.style.display = 'block';
        insuranceFields2.style.display = 'block';
    } else {
        document.getElementById('modalTitle').textContent = itemId ? '계정 수정' : '새 계정 추가';
        insuranceFields.style.display = 'none';
        insuranceFields2.style.display = 'none';
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
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.getElementById('accountForm').reset();
    editingItemId = null;
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
    if (!user) return;
    
    const itemData = {
        serviceName: document.getElementById('serviceName').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        notes: document.getElementById('notes').value,
        type: currentItemType,
        userId: user.uid,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (currentItemType === 'insurance') {
        itemData.insuranceCompany = document.getElementById('insuranceCompany').value;
        itemData.insuranceNumber = document.getElementById('insuranceNumber').value;
    }
    
    try {
        if (editingItemId) {
            // 수정
            await db.collection('items').doc(editingItemId).update(itemData);
        } else {
            // 추가
            itemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('items').add(itemData);
        }
        
        closeModal();
        loadData();
    } catch (error) {
        console.error('저장 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
});

// 데이터 로드
async function loadData() {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const snapshot = await db.collection('items')
            .where('userId', '==', user.uid)
            .orderBy('updatedAt', 'desc')
            .get();
        
        const accounts = [];
        const insurance = [];
        
        snapshot.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (data.type === 'account') {
                accounts.push(data);
            } else {
                insurance.push(data);
            }
        });
        
        renderAccounts(accounts);
        renderInsurance(insurance);
    } catch (error) {
        console.error('데이터 로드 오류:', error);
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
            ${account.notes ? `<div class="card-notes">${escapeHtml(account.notes)}</div>` : ''}
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
        const doc = await db.collection('items').doc(itemId).get();
        if (!doc.exists) return;
        
        const data = doc.data();
        document.getElementById('itemId').value = itemId;
        document.getElementById('itemType').value = type;
        document.getElementById('serviceName').value = data.serviceName || '';
        document.getElementById('username').value = data.username || '';
        document.getElementById('password').value = data.password || '';
        document.getElementById('notes').value = data.notes || '';
        
        if (type === 'insurance') {
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
        await db.collection('items').doc(itemId).delete();
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
    db.collection('items').doc(itemId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
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

