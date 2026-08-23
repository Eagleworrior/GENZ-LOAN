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
    currency: "KES",
    limit: 10000, // Initial Estimated Limit
    pendingLoan: 0,
    history: [],
    referralCode: "GENZ-" + Math.random().toString(36).substring(2, 6).toUpperCase()
};

let globalQualifiedAmount = 0;
let currentStep = 1;
const totalSteps = 7;

const BANKS = {
    "KES": ["KCB Bank", "Equity Bank", "Co-operative Bank", "NCBA Bank", "Absa Bank", "Stanbic Bank", "Diamond Trust Bank", "Family Bank"],
    "NGN": ["First Bank", "Zenith Bank", "Access Bank", "UBA", "GTBank", "Kuda Bank", "Opay", "Moniepoint"],
    "GHS": ["GCB Bank", "Ecobank", "Absa Bank Ghana", "Standard Chartered", "Fidelity Bank"],
    "ZAR": ["Standard Bank", "FirstRand Bank", "Absa Group", "Nedbank", "Capitec Bank"],
    "USD": ["JPMorgan Chase", "Bank of America", "Citigroup", "Wells Fargo", "Goldman Sachs"]
};

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
            // Memory Brain: Resume from last step
            currentStep = currentUser.loanStep || 1;
            populateDateDropdowns();
            populateBankList();
            updateStepUI();
            restoreFormData();
        }
    }
}

function populateBankList() {
    const list = document.getElementById('bank-list');
    if (!list) return;
    const currency = currentUser.currency || 'KES';
    const banks = BANKS[currency] || BANKS["KES"];
    list.innerHTML = banks.map(b => `<option value="${b}">`).join('');
}

// Restore saved form data
function restoreFormData() {
    if (!currentUser.loanFormData) return;
    Object.keys(currentUser.loanFormData).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            if (input.type === 'radio') {
                if (input.value === currentUser.loanFormData[id]) input.checked = true;
            } else {
                input.value = currentUser.loanFormData[id];
            }
        }
    });
    // Trigger radio change UI
    const bankRadio = document.querySelector('input[name="payout-method"]:checked');
    if (bankRadio) togglePayoutFields(bankRadio.value);
}

function togglePayoutFields(method) {
    const fields = document.getElementById('bank-details-fields');
    if (fields) {
        fields.style.display = (method === 'bank') ? 'block' : 'none';
        const inputs = fields.querySelectorAll('input');
        inputs.forEach(i => i.required = (method === 'bank'));
    }
}

// Add event listener for payout toggle
document.addEventListener('change', (e) => {
    if (e.target.name === 'payout-method') {
        togglePayoutFields(e.target.value);
    }
});

function populateDateDropdowns() {
    const daySelect = document.getElementById('dob-day');
    const yearSelect = document.getElementById('dob-year');

    if (daySelect && daySelect.options.length <= 1) {
        for (let i = 1; i <= 31; i++) {
            const opt = document.createElement('option');
            opt.value = i < 10 ? '0' + i : '' + i;
            opt.innerText = i;
            daySelect.appendChild(opt);
        }
    }

    if (yearSelect && yearSelect.options.length <= 1) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 18; i >= currentYear - 70; i--) {
            const opt = document.createElement('option');
            opt.value = '' + i;
            opt.innerText = i;
            yearSelect.appendChild(opt);
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
    const submitBtn = document.getElementById('next-step-btn');
    if (submitBtn) {
        if (currentStep === totalSteps) {
            submitBtn.innerHTML = 'Complete Verification <i class="fa-solid fa-circle-check"></i>';
        } else {
            submitBtn.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right"></i>';
        }
    }
}

function nextStep() {
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required], input[type="radio"]:checked');

    let isValid = true;
    inputs.forEach(input => {
        if (!input.value || (input.tagName === 'SELECT' && input.selectedIndex === 0)) {
            input.parentElement.style.borderColor = 'var(--neon-pink)';
            input.style.borderColor = 'var(--neon-pink)';
            isValid = false;
        } else {
            input.parentElement.style.borderColor = 'transparent';
            input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
    });

    if (!isValid) {
        alert("Please complete all fields in this step to proceed.");
        return;
    }

    // Save Data to Brain (Memory)
    if (!currentUser.loanFormData) currentUser.loanFormData = {};
    const allInputs = currentStepEl.querySelectorAll('input, select');
    allInputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) currentUser.loanFormData[input.name] = input.value;
        } else {
            currentUser.loanFormData[input.id] = input.value;
        }
    });

    if (currentStep < totalSteps) {
        currentStep++;
        currentUser.loanStep = currentStep;
        saveState();
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
    const currencyElements = document.querySelectorAll('.currency');

    // Update all currency symbols in the UI
    currencyElements.forEach(el => el.innerText = currentUser.currency);

    if (nameEl) nameEl.innerText = currentUser.name.split(' ')[0];
    if (limitEl) {
        if (currentUser.limit === 10000 && currentUser.history.length === 0) {
             limitEl.innerHTML = `<span class="est-label">Estimated Limit:</span> <span style="color:var(--neon-yellow)"><span class="currency">${currentUser.currency}</span> 10,000</span>`;
             if (statusEl) {
                 statusEl.innerText = "Complete Profile to Unlock Max Limit";
                 statusEl.style.color = "var(--neon-orange)";
             }
        } else {
             limitEl.innerHTML = `<span style="color:var(--neon-yellow)"><span class="currency">${currentUser.currency}</span> ${currentUser.limit.toLocaleString()}</span>`;
             if (statusEl) {
                 statusEl.innerText = "Premium Account Verified";
                 statusEl.style.color = "var(--primary)";
             }
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
        currency: currentUser.currency,
        date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
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
            <p class="item-amount">${item.isOut ? '-' : '+'}${item.currency || 'KES'} ${item.amount.toLocaleString()}</p>
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
    const currencyGroup = document.getElementById('currency-select').parentElement;
    const confirmContainer = document.getElementById('confirmation-fields');
    const submitBtn = document.querySelector('#auth-form button');

    title.innerText = isLoginMode ? 'Welcome Back' : 'Create Account';

    // Toggle Visibility
    nameGroup.style.display = isLoginMode ? 'none' : 'flex';
    phoneGroup.style.display = isLoginMode ? 'none' : 'flex';
    currencyGroup.style.display = isLoginMode ? 'none' : 'flex';
    confirmContainer.style.display = isLoginMode ? 'none' : 'block';

    // Toggle Required status to prevent browser blocking hidden fields
    document.getElementById('fullname').required = !isLoginMode;
    document.getElementById('phone').required = !isLoginMode;
    document.getElementById('currency-select').required = !isLoginMode;
    document.getElementById('confirm-password').required = !isLoginMode;

    submitBtn.innerHTML = isLoginMode ? 'Log In <i class="fa fa-arrow-right"></i>' : 'Get Started <i class="fa fa-arrow-right"></i>';
    e.target.innerText = isLoginMode ? 'Create Account' : 'Log In';
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('genz_loan_registry') || '[]');

    if (isLoginMode) {
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
            alert("Auth Error: Invalid email or password. Please try again.");
            return;
        }
        currentUser = found;
        currentUser.isLoggedIn = true;
    } else {
        const name = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const currency = document.getElementById('currency-select').value;
        const confirm2 = document.getElementById('confirm-password').value;

        if (password !== confirm2) {
            alert("Security Error: Passwords do not match. Please verify your password.");
            return;
        }

        if (users.find(u => u.email === email)) {
            alert("Registration Error: Email already exists.");
            return;
        }

        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.currency = currency;
        currentUser.email = email;
        currentUser.password = password; // In real app, hash this
        currentUser.uid = "user_" + Date.now();
        currentUser.isLoggedIn = true;

        users.push(currentUser);
        localStorage.setItem('genz_loan_registry', JSON.stringify(users));
    }

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
                    document.getElementById('qualified-amount').innerHTML = `<span class="currency">${currentUser.currency}</span> ${globalQualifiedAmount.toLocaleString()}`;
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

// Helper to format phone for Paystack (remove + and spaces)
function getPaystackPhone() {
    let p = currentUser.phone || "";
    return p.replace(/\+/g, "").replace(/\s/g, "");
}

// Payment & Repayment
document.getElementById('btn-pay-fee').addEventListener('click', () => {
    if (typeof PaystackPop === 'undefined') { alert("Payment offline."); return; }

    const formattedPhone = getPaystackPhone();

    // Paystack Kenya only supports KES and USD.
    // We default to KES for global compatibility.
    const paymentCurrency = (currentUser.currency === 'USD') ? 'USD' : 'KES';

    PaystackPop.setup({
        key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
        email: currentUser.email,
        amount: 50000, // Increased to 500.00 KES
        currency: paymentCurrency,
        metadata: {
            custom_fields: [
                { display_name: "Phone Number", variable_name: "phone_number", value: formattedPhone },
                { display_name: "User Country Currency", variable_name: "user_currency", value: currentUser.currency },
                { display_name: "Payout Method", variable_name: "payout_method", value: currentUser.loanFormData['payout-method'] || 'mobile' },
                { display_name: "Bank Name", variable_name: "bank_name", value: currentUser.loanFormData['bank-name-input'] || 'N/A' },
                { display_name: "Account Number", variable_name: "acc_number", value: currentUser.loanFormData['account-number'] || 'N/A' }
            ]
        },
        callback: (res) => {
            // Success: Reset loan memory
            currentUser.loanStep = 1;
            currentUser.loanFormData = {};
            currentUser.limit = globalQualifiedAmount;
            currentUser.pendingLoan = globalQualifiedAmount;
            addTransaction("Loan Disbursed", globalQualifiedAmount, false);
            updateDashboard();
            alert("Loan Disbursed successfully!");
            showScreen('dashboard-screen');
        }
    }).openIframe();
});

document.getElementById('btn-repay').addEventListener('click', () => {
    if (currentUser.pendingLoan === 0) {
        alert("You have no active loans to repay.");
        return;
    }

    if (confirm(`Repay your loan of ${currentUser.currency} ${currentUser.pendingLoan.toLocaleString()} now?`)) {
        const formattedPhone = getPaystackPhone();

        // Paystack Kenya only supports KES and USD.
        const paymentCurrency = (currentUser.currency === 'USD') ? 'USD' : 'KES';

        PaystackPop.setup({
            key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
            email: currentUser.email,
            amount: currentUser.pendingLoan * 100,
            currency: paymentCurrency,
            metadata: {
                custom_fields: [
                    { display_name: "Phone Number", variable_name: "phone_number", value: formattedPhone },
                    { display_name: "User Country Currency", variable_name: "user_currency", value: currentUser.currency }
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
