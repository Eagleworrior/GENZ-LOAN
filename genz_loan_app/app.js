const screens = document.querySelectorAll('.screen');
function showScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

let isLogin = false;
document.getElementById('toggle-auth').addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? 'Log In' : 'Create Account';
    
    // Hide extra fields if logging in
    const displayStyle = isLogin ? 'none' : 'block';
    document.getElementById('fullname').style.display = displayStyle;
    document.getElementById('phone').style.display = displayStyle;
    document.getElementById('confirm-password').style.display = displayStyle;
    
    // Update button text
    document.querySelector('#auth-form button').innerText = isLogin ? 'Log In' : 'Sign Up';
    e.target.innerText = isLogin ? 'Create Account' : 'Log In';
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;
    
    if (!isLogin && pass !== confirm) {
        alert("Passwords do not match! Please try again.");
        return;
    }
    
    const nameInput = document.getElementById('fullname').value;
    const displayName = nameInput ? nameInput.split(' ')[0] : 'User';
    document.getElementById('user-name').innerText = displayName;
    showScreen('dashboard-screen');
});

document.getElementById('logout').addEventListener('click', () => {
    document.getElementById('auth-form').reset();
    isLogin = false;
    showScreen('auth-screen');
});

document.getElementById('btn-apply').addEventListener('click', () => {
    showScreen('apply-screen');
});

document.getElementById('btn-cancel').addEventListener('click', () => {
    showScreen('dashboard-screen');
});

document.getElementById('loan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const income = parseInt(document.getElementById('income').value);
    
    // Algorithm: Qualifies for 1.5x monthly income. Max KES 150,000. Min KES 2,000.
    let qualified = Math.floor((income * 1.5) / 1000) * 1000;
    if (qualified > 150000) qualified = 150000;
    if (qualified < 2000) qualified = 2000;
    
    document.getElementById('qualified-amount').innerText = `KES ${qualified.toLocaleString()}`;
    showScreen('result-screen');
});

document.getElementById('btn-accept').addEventListener('click', () => {
    const amount = document.getElementById('qualified-amount').innerText;
    document.getElementById('limit-amount').innerText = amount;
    alert(`Success! ${amount} has been approved and processed for disbursement.`);
    showScreen('dashboard-screen');
});

// Prevent user from deleting the +254 country code
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        if (!this.value.startsWith('+254')) {
            this.value = '+254';
        }
    });
}
