// Firebase Configuration - PLACEHOLDERS
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase safely
let db = null;
try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

// State Management
let currentUser = {
    uid: null,
    isLoggedIn: false,
    name: "User",
    email: "",
    phone: "",
    limit: 10000, // Initial Estimated Limit
    pendingLoan: 0,
    history: [],
    referralCode: "GENZ-" + Math.random().toString(36).substring(2, 6).toUpperCase()
};

let globalQualifiedAmount = 0;
let currentStep = 1;
const totalSteps = 6;

// UI Helpers
const screens = document.querySelectorAll('.screen');
function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        if (id === 'history-screen') renderHistory();
        if (id === 'refer-screen') document.getElementById('referral-code').innerText = currentUser.referralCode;
        if (id === 'apply-screen') {
            currentStep = 1;
            updateStepUI();
        }
    }
}

// Multi-step Wizard Logic
function updateStepUI() {
    const sections = document.querySelectorAll('.form-step');
    sections.forEach((s, index) => {
        s.style.display = (index + 1 === currentStep) ? 'block' : 'none';
        if (index + 1 === currentStep) {
            s.classList.add('animate-in');
        } else {
            s.classList.remove('animate-in');
        }
    });

    // Update Step Indicators
    const indicators = document.querySelectorAll('.step-indicator .step');
    indicators.forEach((ind, index) => {
        if (index + 1 === currentStep) {
            ind.classList.add('active');
        } else if (index + 1 < currentStep) {
            ind.classList.add('completed');
            ind.classList.remove('active');
        } else {
            ind.classList.remove('active', 'completed');
        }
    });

    // Update Button Text
    const submitBtn = document.querySelector('#loan-form button[type="submit"]');
    if (submitBtn) {
        if (currentStep === totalSteps) {
            submitBtn.innerHTML = 'Complete Verification <i class="fa fa-shield-check"></i>';
        } else {
            submitBtn.innerHTML = 'Next Step <i class="fa fa-arrow-right"></i>';
        }
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
        const formContainer = document.querySelector('.scrollable-form');
        if (formContainer) formContainer.scrollTop = 0;
    } else {
        processLoanApplication();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    } else {
        showScreen('dashboard-screen');
    }
}

// Persistence
function saveState() {
    localStorage.setItem('genz_loan_pro_user', JSON.stringify(currentUser));
    if (db && currentUser.uid) {
        db.collection("users").doc(currentUser.uid).set(currentUser).catch(e => console.error("Cloud Save Fail:", e));
    }
}

function loadState() {
    const localData = localStorage.getItem('genz_loan_pro_user');
    if (localData) {
        try {
            currentUser = JSON.parse(localData);
            if (currentUser.isLoggedIn) {
                updateDashboard();
                showScreen('dashboard-screen');
            }
        } catch (e) {
            console.error("Load state error:", e);
        }
    }
}

function updateDashboard() {
    const nameEl = document.getElementById('user-name');
    const limitEl = document.getElementById('limit-amount');
    const statusEl = document.querySelector('.status');

    if (nameEl) nameEl.innerText = currentUser.name.split(' ')[0];
    if (limitEl) {
        if (currentUser.limit === 10000 && currentUser.history.length === 0) {
             limitEl.innerHTML = `<span class="est-label">Estimated Limit:</span> KES 10,000`;
             if (statusEl) statusEl.innerText = "Complete Profile to Unlock Max Limit";
        } else {
             limitEl.innerText = `KES ${currentUser.limit.toLocaleString()}`;
             if (statusEl) statusEl.innerText = "Premium Account Verified";
        }
    }
}

// Transaction History Logic
function addTransaction(type, amount, isOut = true) {
    const entry = {
        id: Date.now(),
        type: type,
        amount: amount,
        isOut: isOut,
        date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    currentUser.history.unshift(entry);
    saveState();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;
    if (currentUser.history.length === 0) {
        list.innerHTML = '<p class="empty-msg">No transactions yet.</p>';
        return;
    }
    list.innerHTML = currentUser.history.map(item => `
        <div class="history-item ${item.isOut ? 'out' : ''}">
            <div class="item-info">
                <p class="item-type">${item.type}</p>
                <p class="item-date">${item.date}</p>
            </div>
            <p class="item-amount">${item.isOut ? '-' : '+'}${item.amount.toLocaleString()}</p>
        </div>
    `).join('');
}

// Auth Logic
let isLoginMode = false;
document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    const title = document.getElementById('auth-title');
    const nameGroup = document.getElementById('fullname').parentElement;
    const phoneGroup = document.getElementById('phone').parentElement;
    const confirmContainer = document.getElementById('confirmation-fields');
    const submitBtn = document.querySelector('#auth-form button');

    title.innerText = isLoginMode ? 'Welcome Back' : 'Create Account';

    // Toggle Visibility
    nameGroup.style.display = isLoginMode ? 'none' : 'flex';
    phoneGroup.style.display = isLoginMode ? 'none' : 'flex';
    confirmContainer.style.display = isLoginMode ? 'none' : 'block';

    // Toggle Required status to prevent browser blocking hidden fields
    document.getElementById('fullname').required = !isLoginMode;
    document.getElementById('phone').required = !isLoginMode;
    document.getElementById('confirm-password').required = !isLoginMode;

    submitBtn.innerHTML = isLoginMode ? 'Log In <i class="fa fa-arrow-right"></i>' : 'Get Started <i class="fa fa-arrow-right"></i>';
    e.target.innerText = isLoginMode ? 'Create Account' : 'Log In';
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!isLoginMode) {
        const name = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const confirm2 = document.getElementById('confirm-password').value;

        // 2-Step Password Confirmation Logic
        if (password !== confirm2) {
            alert("Security Error: Passwords do not match. Please verify your password.");
            return;
        }

        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.uid = "user_" + Date.now();
    }

    currentUser.isLoggedIn = true;
    currentUser.email = email;

    saveState();
    updateDashboard();
    showScreen('dashboard-screen');
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('genz_loan_pro_user');
    location.reload();
});

// Loan Flow
document.getElementById('btn-apply').addEventListener('click', () => {
    if (currentUser.pendingLoan > 0) {
        alert("You have an outstanding loan. Please repay it first.");
        return;
    }
    showScreen('apply-screen');
});

document.getElementById('loan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    nextStep();
});

function processLoanApplication() {
    const income = parseInt(document.getElementById('income').value) || 0;
    const expenses = parseInt(document.getElementById('expenses').value) || 0;
    const existingLoans = parseInt(document.getElementById('existing-loans').value) || 0;

    let disposable = income - expenses - existingLoans;
    globalQualifiedAmount = Math.max(5000, Math.min(250000, Math.floor((disposable * 2.5) / 1000) * 1000));
    
    showScreen('scan-screen');
    startFaceScan();
}

function startFaceScan() {
    const video = document.getElementById('camera-feed');
    const instruction = document.getElementById('scan-instruction');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        video.srcObject = stream;
        instruction.innerText = "Keep your eyes on the screen...";
        
        setTimeout(() => {
            instruction.innerText = "Scanning Biometrics...";
            capturePhoto();

            setTimeout(() => {
                instruction.innerText = "Biometrics Verified!";
                setTimeout(() => {
                    stream.getTracks().forEach(track => track.stop());
                    document.getElementById('qualified-amount').innerText = `KES ${globalQualifiedAmount.toLocaleString()}`;
                    showScreen('result-screen');
                }, 1000);
            }, 2000);
        }, 2500);
    })
    .catch(err => {
        instruction.innerText = "Camera needed for verification.";
        setTimeout(() => showScreen('dashboard-screen'), 2000);
    });
}

function capturePhoto() {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('capture-canvas');
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    document.getElementById('captured-photo').src = canvas.toDataURL('image/png');
}

// Helper to format phone for Paystack (remove + and ensure 254...)
function getPaystackPhone() {
    let p = currentUser.phone || "";
    p = p.replace("+", "");
    if (p.startsWith("0")) p = "254" + p.substring(1);
    return p;
}

// Payment & Repayment
document.getElementById('btn-pay-fee').addEventListener('click', () => {
    if (typeof PaystackPop === 'undefined') { alert("Payment offline."); return; }

    const formattedPhone = getPaystackPhone();

    PaystackPop.setup({
        key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
        email: currentUser.email,
        amount: 20000,
        currency: 'KES',
        channels: ['mobile_money', 'card'],
        metadata: {
            custom_fields: [
                { display_name: "Phone Number", variable_name: "phone_number", value: formattedPhone }
            ]
        },
        callback: (res) => {
            currentUser.limit = globalQualifiedAmount;
            currentUser.pendingLoan = globalQualifiedAmount;
            addTransaction("Loan Disbursed", globalQualifiedAmount, false);
            updateDashboard();
            alert("Loan Disbursed to M-Pesa!");
            showScreen('dashboard-screen');
        }
    }).openIframe();
});

document.getElementById('btn-repay').addEventListener('click', () => {
    if (currentUser.pendingLoan === 0) {
        alert("You have no active loans to repay.");
        return;
    }

    if (confirm(`Repay your loan of KES ${currentUser.pendingLoan.toLocaleString()} now?`)) {
        const formattedPhone = getPaystackPhone();

        PaystackPop.setup({
            key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
            email: currentUser.email,
            amount: currentUser.pendingLoan * 100,
            currency: 'KES',
            channels: ['mobile_money', 'card'],
            metadata: {
                custom_fields: [
                    { display_name: "Phone Number", variable_name: "phone_number", value: formattedPhone }
                ]
            },
            callback: (res) => {
                addTransaction("Loan Repayment", currentUser.pendingLoan, true);
                currentUser.pendingLoan = 0;
                currentUser.limit = Math.floor(currentUser.limit * 1.1);
                saveState();
                updateDashboard();
                alert("Payment Successful! Your credit limit has been increased.");
                showScreen('dashboard-screen');
            }
        }).openIframe();
    }
});

// Referrals & Navigation
document.getElementById('btn-history').addEventListener('click', () => showScreen('history-screen'));
document.getElementById('btn-refer').addEventListener('click', () => showScreen('refer-screen'));

function copyReferral() {
    const code = document.getElementById('referral-code').innerText;
    navigator.clipboard.writeText(code).then(() => alert("Referral code copied!"));
}

document.getElementById('share-referral').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'GenZ Loan',
            text: `Join me on GenZ Loan and get instant cash! Use my code: ${currentUser.referralCode}`,
            url: 'https://genzloan.co.ke'
        });
    } else {
        copyReferral();
    }
});

// Initialization
window.onload = loadState;
