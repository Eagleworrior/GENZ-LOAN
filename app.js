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
    country: "Kenya",
    currency: "KES",
    limit: 10000,
    pendingLoan: 0,
    lastDisbursementTime: 0,
    history: [],
    referralCode: "GENZ-" + Math.random().toString(36).substring(2, 6).toUpperCase()
};

let globalQualifiedAmount = 0;
let currentLoanTerms = {}; // For Agreement Screen
let currentStep = 1;
const totalSteps = 7;

const COUNTRIES = [
    { name: "Afghanistan", code: "AF", dialCode: "+93", currency: "AFN", rate: 0.54, localLimit: 10000 },
    { name: "Albania", code: "AL", dialCode: "+355", currency: "ALL", rate: 0.71, localLimit: 15000 },
    { name: "Algeria", code: "DZ", dialCode: "+213", currency: "DZD", rate: 1.05, localLimit: 20000 },
    { name: "Andorra", code: "AD", dialCode: "+376", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Angola", code: "AO", dialCode: "+244", currency: "AOA", rate: 6.5, localLimit: 100000 },
    { name: "Argentina", code: "AR", dialCode: "+54", currency: "ARS", rate: 6.8, localLimit: 150000 },
    { name: "Armenia", code: "AM", dialCode: "+374", currency: "AMD", rate: 3.1, localLimit: 50000 },
    { name: "Australia", code: "AU", dialCode: "+61", currency: "AUD", rate: 0.012, localLimit: 1000 },
    { name: "Austria", code: "AT", dialCode: "+43", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Azerbaijan", code: "AZ", dialCode: "+994", currency: "AZN", rate: 0.013, localLimit: 500 },
    { name: "Bahamas", code: "BS", dialCode: "+1-242", currency: "BSD", rate: 0.0077, localLimit: 1000 },
    { name: "Bahrain", code: "BH", dialCode: "+973", currency: "BHD", rate: 0.0029, localLimit: 500 },
    { name: "Bangladesh", code: "BD", dialCode: "+880", currency: "BDT", rate: 0.92, localLimit: 20000 },
    { name: "Barbados", code: "BB", dialCode: "+1-246", currency: "BBD", rate: 0.015, localLimit: 1500 },
    { name: "Belarus", code: "BY", dialCode: "+375", currency: "BYN", rate: 0.025, localLimit: 1000 },
    { name: "Belgium", code: "BE", dialCode: "+32", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Belize", code: "BZ", dialCode: "+501", currency: "BZD", rate: 0.015, localLimit: 1500 },
    { name: "Benin", code: "BJ", dialCode: "+229", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Bhutan", code: "BT", dialCode: "+975", currency: "BTN", rate: 0.64, localLimit: 10000 },
    { name: "Bolivia", code: "BO", dialCode: "+591", currency: "BOB", rate: 0.053, localLimit: 5000 },
    { name: "Botswana", code: "BW", dialCode: "+267", currency: "BWP", rate: 0.10, localLimit: 10000 },
    { name: "Brazil", code: "BR", dialCode: "+55", currency: "BRL", rate: 0.038, localLimit: 5000 },
    { name: "Bulgaria", code: "BG", dialCode: "+359", currency: "BGN", rate: 0.014, localLimit: 2000 },
    { name: "Burkina Faso", code: "BF", dialCode: "+226", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Burundi", code: "BI", dialCode: "+257", currency: "BIF", rate: 22.0, localLimit: 250000 },
    { name: "Cambodia", code: "KH", dialCode: "+855", currency: "KHR", rate: 31.0, localLimit: 500000 },
    { name: "Cameroon", code: "CM", dialCode: "+237", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Canada", code: "CA", dialCode: "+1", currency: "CAD", rate: 0.010, localLimit: 1000 },
    { name: "Cape Verde", code: "CV", dialCode: "+238", currency: "CVE", rate: 0.78, localLimit: 15000 },
    { name: "Central African Republic", code: "CF", dialCode: "+236", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Chad", code: "TD", dialCode: "+235", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Chile", code: "CL", dialCode: "+56", currency: "CLP", rate: 7.2, localLimit: 150000 },
    { name: "China", code: "CN", dialCode: "+86", currency: "CNY", rate: 0.055, localLimit: 5000 },
    { name: "Colombia", code: "CO", dialCode: "+57", currency: "COP", rate: 30.0, localLimit: 500000 },
    { name: "Comoros", code: "KM", dialCode: "+269", currency: "KMF", rate: 3.4, localLimit: 50000 },
    { name: "Congo (Brazzaville)", code: "CG", dialCode: "+242", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Congo (Kinshasa)", code: "CD", dialCode: "+243", currency: "CDF", rate: 21.0, localLimit: 500000 },
    { name: "Costa Rica", code: "CR", dialCode: "+506", currency: "CRC", rate: 4.1, localLimit: 100000 },
    { name: "Ivory Coast", code: "CI", dialCode: "+225", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Croatia", code: "HR", dialCode: "+385", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Cuba", code: "CU", dialCode: "+53", currency: "CUP", rate: 0.18, localLimit: 5000 },
    { name: "Cyprus", code: "CY", dialCode: "+357", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Czech Republic", code: "CZ", dialCode: "+420", currency: "CZK", rate: 0.18, localLimit: 10000 },
    { name: "Denmark", code: "DK", dialCode: "+45", currency: "DKK", rate: 0.053, localLimit: 5000 },
    { name: "Djibouti", code: "DJ", dialCode: "+253", currency: "DJF", rate: 1.37, localLimit: 25000 },
    { name: "Dominica", code: "DM", dialCode: "+1-767", currency: "XCD", rate: 0.021, localLimit: 2500 },
    { name: "Dominican Republic", code: "DO", dialCode: "+1-809", currency: "DOP", rate: 0.45, localLimit: 25000 },
    { name: "Ecuador", code: "EC", dialCode: "+593", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Egypt", code: "EG", dialCode: "+20", currency: "EGP", rate: 0.37, localLimit: 10000 },
    { name: "El Salvador", code: "SV", dialCode: "+503", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Equatorial Guinea", code: "GQ", dialCode: "+240", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Eritrea", code: "ER", dialCode: "+291", currency: "ERN", rate: 0.11, localLimit: 5000 },
    { name: "Estonia", code: "EE", dialCode: "+372", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Eswatini", code: "SZ", dialCode: "+268", currency: "SZL", rate: 0.14, localLimit: 10000 },
    { name: "Ethiopia", code: "ET", dialCode: "+251", currency: "ETB", rate: 0.44, localLimit: 15000 },
    { name: "Fiji", code: "FJ", dialCode: "+679", currency: "FJD", rate: 0.017, localLimit: 2000 },
    { name: "Finland", code: "FI", dialCode: "+358", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "France", code: "FR", dialCode: "+33", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Gabon", code: "GA", dialCode: "+241", currency: "XAF", rate: 4.6, localLimit: 100000 },
    { name: "Gambia", code: "GM", dialCode: "+220", currency: "GMD", rate: 0.52, localLimit: 10000 },
    { name: "Georgia", code: "GE", dialCode: "+995", currency: "GEL", rate: 0.021, localLimit: 2000 },
    { name: "Germany", code: "DE", dialCode: "+49", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Ghana", code: "GH", dialCode: "+233", currency: "GHS", rate: 0.11, localLimit: 10000 },
    { name: "Greece", code: "GR", dialCode: "+30", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Grenada", code: "GD", dialCode: "+1-473", currency: "XCD", rate: 0.021, localLimit: 2500 },
    { name: "Guatemala", code: "GT", dialCode: "+502", currency: "GTQ", rate: 0.06, localLimit: 5000 },
    { name: "Guinea", code: "GN", dialCode: "+224", currency: "GNF", rate: 66.0, localLimit: 1000000 },
    { name: "Guinea-Bissau", code: "GW", dialCode: "+245", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Guyana", code: "GY", dialCode: "+592", currency: "GYD", rate: 1.6, localLimit: 25000 },
    { name: "Haiti", code: "HT", dialCode: "+509", currency: "HTG", rate: 1.0, localLimit: 15000 },
    { name: "Honduras", code: "HN", dialCode: "+504", currency: "HNL", rate: 0.19, localLimit: 10000 },
    { name: "Hungary", code: "HU", dialCode: "+36", currency: "HUF", rate: 2.8, localLimit: 100000 },
    { name: "Iceland", code: "IS", dialCode: "+354", currency: "ISK", rate: 1.06, localLimit: 25000 },
    { name: "India", code: "IN", dialCode: "+91", currency: "INR", rate: 0.64, localLimit: 50000 },
    { name: "Indonesia", code: "ID", dialCode: "+62", currency: "IDR", rate: 120.0, localLimit: 2500000 },
    { name: "Iran", code: "IR", dialCode: "+98", currency: "IRR", rate: 325.0, localLimit: 5000000 },
    { name: "Iraq", code: "IQ", dialCode: "+964", currency: "IQD", rate: 10.0, localLimit: 250000 },
    { name: "Ireland", code: "IE", dialCode: "+353", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Israel", code: "IL", dialCode: "+972", currency: "ILS", rate: 0.029, localLimit: 2500 },
    { name: "Italy", code: "IT", dialCode: "+39", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Jamaica", code: "JM", dialCode: "+1-876", currency: "JMD", rate: 1.2, localLimit: 25000 },
    { name: "Japan", code: "JP", dialCode: "+81", currency: "JPY", rate: 1.14, localLimit: 100000 },
    { name: "Jordan", code: "JO", dialCode: "+962", currency: "JOD", rate: 0.0055, localLimit: 500 },
    { name: "Kazakhstan", code: "KZ", dialCode: "+7", currency: "KZT", rate: 3.5, localLimit: 50000 },
    { name: "Kenya", code: "KE", dialCode: "+254", currency: "KES", rate: 1.0, localLimit: 10000 },
    { name: "Kiribati", code: "KI", dialCode: "+686", currency: "AUD", rate: 0.012, localLimit: 1000 },
    { name: "Kuwait", code: "KW", dialCode: "+965", currency: "KWD", rate: 0.0024, localLimit: 250 },
    { name: "Kyrgyzstan", code: "KG", dialCode: "+996", currency: "KGS", rate: 0.69, localLimit: 10000 },
    { name: "Laos", code: "LA", dialCode: "+856", currency: "LAK", rate: 160.0, localLimit: 2000000 },
    { name: "Latvia", code: "LV", dialCode: "+371", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Lebanon", code: "LB", dialCode: "+961", currency: "LBP", rate: 115.0, localLimit: 1500000 },
    { name: "Lesotho", code: "LS", dialCode: "+266", currency: "LSL", rate: 0.14, localLimit: 10000 },
    { name: "Liberia", code: "LR", dialCode: "+231", currency: "LRD", rate: 1.48, localLimit: 25000 },
    { name: "Libya", code: "LY", dialCode: "+218", currency: "LYD", rate: 0.037, localLimit: 1000 },
    { name: "Liechtenstein", code: "LI", dialCode: "+423", currency: "CHF", rate: 0.0068, localLimit: 1000 },
    { name: "Lithuania", code: "LT", dialCode: "+370", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Luxembourg", code: "LU", dialCode: "+352", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Madagascar", code: "MG", dialCode: "+261", currency: "MGA", rate: 35.0, localLimit: 500000 },
    { name: "Malawi", code: "MW", dialCode: "+265", currency: "MWK", rate: 13.0, localLimit: 200000 },
    { name: "Malaysia", code: "MY", dialCode: "+60", currency: "MYR", rate: 0.036, localLimit: 2500 },
    { name: "Maldives", code: "MV", dialCode: "+960", currency: "MVR", rate: 0.12, localLimit: 10000 },
    { name: "Mali", code: "ML", dialCode: "+223", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Malta", code: "MT", dialCode: "+356", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Marshall Islands", code: "MH", dialCode: "+692", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Mauritania", code: "MR", dialCode: "+222", currency: "MRU", rate: 0.31, localLimit: 5000 },
    { name: "Mauritius", code: "MU", dialCode: "+230", currency: "MUR", rate: 0.35, localLimit: 5000 },
    { name: "Mexico", code: "MX", dialCode: "+52", currency: "MXN", rate: 0.13, localLimit: 10000 },
    { name: "Micronesia", code: "FM", dialCode: "+691", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Moldova", code: "MD", dialCode: "+373", currency: "MDL", rate: 0.14, localLimit: 5000 },
    { name: "Monaco", code: "MC", dialCode: "+377", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Mongolia", code: "MN", dialCode: "+976", currency: "MNT", rate: 26.0, localLimit: 500000 },
    { name: "Montenegro", code: "ME", dialCode: "+382", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Morocco", code: "MA", dialCode: "+212", currency: "MAD", rate: 0.078, localLimit: 5000 },
    { name: "Mozambique", code: "MZ", dialCode: "+258", currency: "MZN", rate: 0.49, localLimit: 10000 },
    { name: "Myanmar", code: "MM", dialCode: "+95", currency: "MMK", rate: 16.0, localLimit: 250000 },
    { name: "Namibia", code: "NA", dialCode: "+264", currency: "NAD", rate: 0.14, localLimit: 10000 },
    { name: "Nauru", code: "NR", dialCode: "+674", currency: "AUD", rate: 0.012, localLimit: 1000 },
    { name: "Nepal", code: "NP", dialCode: "+977", currency: "NPR", rate: 1.0, localLimit: 15000 },
    { name: "Netherlands", code: "NL", dialCode: "+31", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "New Zealand", code: "NZ", dialCode: "+64", currency: "NZD", rate: 0.013, localLimit: 1500 },
    { name: "Nicaragua", code: "NI", dialCode: "+505", currency: "NIO", rate: 0.28, localLimit: 10000 },
    { name: "Niger", code: "NE", dialCode: "+227", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Nigeria", code: "NG", dialCode: "+234", currency: "NGN", rate: 12.0, localLimit: 250000 },
    { name: "North Korea", code: "KP", dialCode: "+850", currency: "KPW", rate: 6.9, localLimit: 100000 },
    { name: "North Macedonia", code: "MK", dialCode: "+389", currency: "MKD", rate: 0.43, localLimit: 10000 },
    { name: "Norway", code: "NO", dialCode: "+47", currency: "NOK", rate: 0.082, localLimit: 10000 },
    { name: "Oman", code: "OM", dialCode: "+968", currency: "OMR", rate: 0.003, localLimit: 250 },
    { name: "Pakistan", code: "PK", dialCode: "+92", currency: "PKR", rate: 2.15, localLimit: 100000 },
    { name: "Palau", code: "PW", dialCode: "+680", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Panama", code: "PA", dialCode: "+507", currency: "PAB", rate: 0.0077, localLimit: 1000 },
    { name: "Papua New Guinea", code: "PG", dialCode: "+675", currency: "PGK", rate: 0.029, localLimit: 2500 },
    { name: "Paraguay", code: "PY", dialCode: "+595", currency: "PYG", rate: 57.0, localLimit: 1000000 },
    { name: "Peru", code: "PE", dialCode: "+51", currency: "PEN", rate: 0.029, localLimit: 2500 },
    { name: "Philippines", code: "PH", dialCode: "+63", currency: "PHP", rate: 0.44, localLimit: 50000 },
    { name: "Poland", code: "PL", dialCode: "+48", currency: "PLN", rate: 0.031, localLimit: 2500 },
    { name: "Portugal", code: "PT", dialCode: "+351", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Qatar", code: "QA", dialCode: "+974", currency: "QAR", rate: 0.028, localLimit: 2500 },
    { name: "Romania", code: "RO", dialCode: "+40", currency: "RON", rate: 0.035, localLimit: 2500 },
    { name: "Russia", code: "RU", dialCode: "+7", currency: "RUB", rate: 0.70, localLimit: 50000 },
    { name: "Rwanda", code: "RW", dialCode: "+250", currency: "RWF", rate: 10.0, localLimit: 150000 },
    { name: "Saint Kitts and Nevis", code: "KN", dialCode: "+1-869", currency: "XCD", rate: 0.021, localLimit: 2500 },
    { name: "Saint Lucia", code: "LC", dialCode: "+1-758", currency: "XCD", rate: 0.021, localLimit: 2500 },
    { name: "Saint Vincent and the Grenadines", code: "VC", dialCode: "+1-784", currency: "XCD", rate: 0.021, localLimit: 2500 },
    { name: "Samoa", code: "WS", dialCode: "+685", currency: "WST", rate: 0.021, localLimit: 2500 },
    { name: "San Marino", code: "SM", dialCode: "+378", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Sao Tome and Principe", code: "ST", dialCode: "+239", currency: "STN", rate: 0.17, localLimit: 5000 },
    { name: "Saudi Arabia", code: "SA", dialCode: "+966", currency: "SAR", rate: 0.029, localLimit: 2500 },
    { name: "Senegal", code: "SN", dialCode: "+221", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Serbia", code: "RS", dialCode: "+381", currency: "RSD", rate: 0.83, localLimit: 15000 },
    { name: "Seychelles", code: "SC", dialCode: "+248", currency: "SCR", rate: 0.10, localLimit: 10000 },
    { name: "Sierra Leone", code: "SL", dialCode: "+232", currency: "SLL", rate: 175.0, localLimit: 2500000 },
    { name: "Singapore", code: "SG", dialCode: "+65", currency: "SGD", rate: 0.010, localLimit: 1000 },
    { name: "Slovakia", code: "SK", dialCode: "+421", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Slovenia", code: "SI", dialCode: "+386", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Solomon Islands", code: "SB", dialCode: "+677", currency: "SBD", rate: 0.065, localLimit: 5000 },
    { name: "Somalia", code: "SO", dialCode: "+252", currency: "SOS", rate: 4.4, localLimit: 50000 },
    { name: "South Africa", code: "ZA", dialCode: "+27", currency: "ZAR", rate: 0.14, localLimit: 15000 },
    { name: "South Korea", code: "KR", dialCode: "+82", currency: "KRW", rate: 10.0, localLimit: 1000000 },
    { name: "South Sudan", code: "SS", dialCode: "+211", currency: "SSP", rate: 0.77, localLimit: 15000 },
    { name: "Spain", code: "ES", dialCode: "+34", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Sri Lanka", code: "LK", dialCode: "+94", currency: "LKR", rate: 2.3, localLimit: 25000 },
    { name: "Sudan", code: "SD", dialCode: "+249", currency: "SDG", rate: 4.6, localLimit: 100000 },
    { name: "Suriname", code: "SR", dialCode: "+597", currency: "SRD", rate: 0.29, localLimit: 5000 },
    { name: "Sweden", code: "SE", dialCode: "+46", currency: "SEK", rate: 0.081, localLimit: 10000 },
    { name: "Switzerland", code: "CH", dialCode: "+41", currency: "CHF", rate: 0.0068, localLimit: 1000 },
    { name: "Syria", code: "SY", dialCode: "+963", currency: "SYP", rate: 19.0, localLimit: 250000 },
    { name: "Taiwan", code: "TW", dialCode: "+886", currency: "TWD", rate: 0.25, localLimit: 25000 },
    { name: "Tajikistan", code: "TJ", dialCode: "+992", currency: "TJS", rate: 0.084, localLimit: 10000 },
    { name: "Tanzania", code: "TZ", dialCode: "+255", currency: "TZS", rate: 20.0, localLimit: 250000 },
    { name: "Thailand", code: "TH", dialCode: "+66", currency: "THB", rate: 0.28, localLimit: 25000 },
    { name: "Timor-Leste", code: "TL", dialCode: "+670", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Togo", code: "TG", dialCode: "+228", currency: "XOF", rate: 4.6, localLimit: 100000 },
    { name: "Tonga", code: "TO", dialCode: "+676", currency: "TOP", rate: 0.018, localLimit: 2000 },
    { name: "Trinidad and Tobago", code: "TT", dialCode: "+1-868", currency: "TTD", rate: 0.052, localLimit: 5000 },
    { name: "Tunisia", code: "TN", dialCode: "+216", currency: "TND", rate: 0.024, localLimit: 2500 },
    { name: "Turkey", code: "TR", dialCode: "+90", currency: "TRY", rate: 0.25, localLimit: 25000 },
    { name: "Turkmenistan", code: "TM", dialCode: "+993", currency: "TMT", rate: 0.027, localLimit: 2500 },
    { name: "Tuvalu", code: "TV", dialCode: "+688", currency: "AUD", rate: 0.012, localLimit: 1000 },
    { name: "Uganda", code: "UG", dialCode: "+256", currency: "UGX", rate: 28.0, localLimit: 500000 },
    { name: "Ukraine", code: "UA", dialCode: "+380", currency: "UAH", rate: 0.31, localLimit: 15000 },
    { name: "UAE", code: "AE", dialCode: "+971", currency: "AED", rate: 0.028, localLimit: 5000 },
    { name: "UK", code: "GB", dialCode: "+44", currency: "GBP", rate: 0.0061, localLimit: 1000 },
    { name: "USA", code: "US", dialCode: "+1", currency: "USD", rate: 0.0077, localLimit: 1000 },
    { name: "Uruguay", code: "UY", dialCode: "+598", currency: "UYU", rate: 0.30, localLimit: 25000 },
    { name: "Uzbekistan", code: "UZ", dialCode: "+998", currency: "UZS", rate: 96.0, localLimit: 1000000 },
    { name: "Vanuatu", code: "VU", dialCode: "+678", currency: "VUV", rate: 0.92, localLimit: 15000 },
    { name: "Vatican City", code: "VA", dialCode: "+39", currency: "EUR", rate: 0.007, localLimit: 1000 },
    { name: "Venezuela", code: "VE", dialCode: "+58", currency: "VES", rate: 0.28, localLimit: 25000 },
    { name: "Vietnam", code: "VN", dialCode: "+84", currency: "VND", rate: 190.0, localLimit: 5000000 },
    { name: "Yemen", code: "YE", dialCode: "+967", currency: "YER", rate: 1.9, localLimit: 50000 },
    { name: "Zambia", code: "ZM", dialCode: "+260", currency: "ZMW", rate: 0.20, localLimit: 5000 },
    { name: "Zimbabwe", code: "ZW", dialCode: "+263", currency: "USD", rate: 0.0077, localLimit: 1000 }
];

const BANKS = {
    "Kenya": ["KCB Bank", "Equity Bank", "Co-operative Bank", "NCBA Bank", "Absa Bank", "Stanbic Bank", "Diamond Trust Bank", "Family Bank", "Standard Chartered", "I&M Bank", "M-Pesa Wallet", "Airtel Money"],
    "Nigeria": ["First Bank", "Zenith Bank", "Access Bank", "UBA", "GTBank", "Kuda Bank", "Opay", "Moniepoint", "Fidelity Bank", "Union Bank", "Stanbic IBTC", "Sterling Bank", "Wema Bank", "Palmpay"],
    "Ghana": ["GCB Bank", "Ecobank", "Absa Bank Ghana", "Standard Chartered", "Fidelity Bank", "CAL Bank", "Zenith Bank Ghana", "MTN MoMo", "Vodafone Cash"],
    "South Africa": ["Standard Bank", "FirstRand Bank", "Absa Group", "Nedbank", "Capitec Bank", "TymeBank", "Discovery Bank", "Investec", "African Bank"],
    "Uganda": ["Stanbic Bank Uganda", "Centenary Bank", "DFCU Bank", "Standard Chartered", "Absa Bank Uganda", "MTN Mobile Money", "Airtel Money"],
    "Tanzania": ["CRDB Bank", "NMB Bank", "NBC Bank", "Standard Chartered", "Absa Bank Tanzania", "Vodacom M-Pesa", "Tigo Pesa"],
    "Rwanda": ["Bank of Kigali", "I&M Bank Rwanda", "Equity Bank Rwanda", "Cogebanque", "MTN MoMo"],
    "Ethiopia": ["Commercial Bank of Ethiopia", "Awash Bank", "Dashen Bank", "Abyssinia Bank", "Telebirr"],
    "Zambia": ["Zambia National Commercial Bank", "Standard Chartered", "Absa Bank Zambia", "Stanbic Bank Zambia", "MTN MoMo"],
    "Egypt": ["National Bank of Egypt", "Banque Misr", "CIB", "QNB Alahli", "Vodafone Cash"],
    "USA": ["JPMorgan Chase", "Bank of America", "Citigroup", "Wells Fargo", "Goldman Sachs", "Capital One", "U.S. Bancorp", "PNC Bank", "Truist", "Charles Schwab"],
    "UK": ["HSBC", "Barclays", "Lloyds Bank", "NatWest", "Standard Chartered", "Santander UK", "Nationwide", "Monzo", "Revolut", "Starling"],
    "Canada": ["RBC", "TD Bank", "Scotiabank", "BMO", "CIBC", "National Bank of Canada", "Desjardins"],
    "Australia": ["Commonwealth Bank", "Westpac", "ANZ", "NAB", "Macquarie Bank"],
    "India": ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Kotak Mahindra Bank", "Bank of Baroda", "Paytm Bank"],
    "Germany": ["Deutsche Bank", "Commerzbank", "Sparkasse", "Volksbanken", "N26"],
    "France": ["BNP Paribas", "Crédit Agricole", "Société Générale", "BPCE", "La Banque Postale"],
    "UAE": ["Emirates NBD", "First Abu Dhabi Bank", "ADCB", "Dubai Islamic Bank"],
    "Pakistan": ["Habib Bank", "National Bank of Pakistan", "Meezan Bank", "MCB Bank", "JazzCash", "Easypaisa"],
    "Philippines": ["BDO Unibank", "Metrobank", "BPI", "Land Bank", "GCash", "Maya"],
    "Zimbabwe": ["CBZ Bank", "CABS", "Stanbic Bank Zimbabwe", "EcoCash"],
    "Botswana": ["First National Bank Botswana", "Standard Chartered Botswana", "Absa Bank Botswana", "Orange Money"],
    "Cameroon": ["Afriland First Bank", "Société Générale Cameroun", "MTN MoMo", "Orange Money"],
    "Ivory Coast": ["NSIA Banque", "Société Générale Côte d'Ivoire", "Orange Money", "MTN MoMo"],
    "Morocco": ["Attijariwafa Bank", "Banque Populaire du Maroc", "BMCE Bank"],
    "Algeria": ["Banque Extérieure d'Algérie", "Banque Nationale d'Algérie"],
    "Angola": ["Banco Angolano de Investimentos", "Banco Económico"],
    "Mozambique": ["Millennium BIM", "Standard Bank Mozambique", "M-Pesa"],
    "Senegal": ["CBAO Groupe Attijariwafa Bank", "Société Générale Sénégal", "Wave", "Orange Money"],
    "Sudan": ["Bank of Khartoum", "Faisal Islamic Bank"],
    "Tunisia": ["BIAT", "Banque Nationale Agricole"],
    "Argentina": ["Banco de la Nación Argentina", "Banco Galicia", "Mercado Pago"],
    "Brazil": ["Itaú Unibanco", "Banco do Brasil", "Bradesco", "Nubank", "Pix"],
    "Mexico": ["BBVA México", "Banorte", "Santander México"],
    "Colombia": ["Bancolombia", "Banco de Bogotá", "Daviplata"],
    "Chile": ["Banco de Chile", "Banco Santander Chile"],
    "Peru": ["Banco de Crédito del Perú", "BBVA Perú"],
    "Saudi Arabia": ["Al Rajhi Bank", "SNB", "Riyad Bank", "STC Pay"],
    "Turkey": ["Ziraat Bankası", "İş Bankası", "Garanti BBVA"],
    "Indonesia": ["Bank Mandiri", "Bank Rakyat Indonesia", "Bank Central Asia", "GoPay", "OVO"],
    "Malaysia": ["Maybank", "CIMB Bank", "Public Bank", "GrabPay"],
    "Thailand": ["Kasikornbank", "Siam Commercial Bank", "Bangkok Bank", "PromptPay"],
    "Vietnam": ["Vietcombank", "VietinBank", "BIDV", "MoMo"],
    "Japan": ["MUFG Bank", "Sumitomo Mitsui Bank", "Mizuho Bank", "PayPay"],
    "South Korea": ["KB Kookmin Bank", "Shinhan Bank", "Hana Bank", "KakaoBank"],
    "Russia": ["Sberbank", "VTB Bank", "Gazprombank", "Tinkoff"],
    "Poland": ["PKO Bank Polski", "Bank Pekao", "mBank"],
    "Netherlands": ["ING Bank", "ABN AMRO", "Rabobank"],
    "Spain": ["Banco Santander", "BBVA", "CaixaBank"],
    "Italy": ["Intesa Sanpaolo", "UniCredit", "Poste Italiane"],
    "Austria": ["Erste Bank", "Raiffeisen Bank International"],
    "Switzerland": ["UBS", "Credit Suisse", "Zürcher Kantonalbank"],
    "Belgium": ["BNP Paribas Fortis", "KBC Bank", "Belfius"],
    "Ireland": ["AIB", "Bank of Ireland", "Permanent TSB"],
    "New Zealand": ["ANZ New Zealand", "ASB Bank", "Westpac NZ", "KiwiBank"]
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
            currentStep = currentUser.loanStep || 1;
            populateDateDropdowns();
            populateBankList();
            updateStepUI();
            restoreFormData();
        }
        if (id === 'agreement-screen') renderAgreement();
        if (id === 'result-screen') {
            updateDispersalFeeDisplay();
            if (currentUser.country === 'Nigeria') {
                setTimeout(() => {
                    showToast("Nigerian Users: Please use a VISA or Mastercard. Verve cards are not supported for international disbursement.", "info");
                }, 500);
            }
        }
    }
}

// Professional Neon Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function updateDispersalFeeDisplay() {
    const feeEl = document.getElementById('dynamic-fee');
    if (feeEl) {
        const country = COUNTRIES.find(c => c.name === currentUser.country) || { rate: 1.0 };
        const convertedFee = Math.ceil(500 * country.rate);
        feeEl.innerText = convertedFee.toLocaleString();
    }
}

function populateCountryList() {
    const select = document.getElementById('country-select');
    if (!select) return;

    // Alphabetical sort for better UX
    COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));

    select.innerHTML = COUNTRIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    // Sync initial state if not logged in
    if (!currentUser.isLoggedIn) {
        const defaultCountry = COUNTRIES.find(c => c.name === "Kenya") || COUNTRIES[0];
        select.value = defaultCountry.name;

        const phoneInput = document.getElementById('phone');
        if (phoneInput) phoneInput.value = defaultCountry.dialCode + " ";

        currentUser.country = defaultCountry.name;
        currentUser.currency = defaultCountry.currency;
    }
}

// Locked Dial Code Logic
document.getElementById('country-select').addEventListener('change', (e) => {
    const countryName = e.target.value;
    const country = COUNTRIES.find(c => c.name === countryName);
    if (country) {
        const phoneInput = document.getElementById('phone');
        phoneInput.value = country.dialCode + " ";
        currentUser.country = countryName;
        currentUser.currency = country.currency;
        updateDashboard();
    }
});

document.getElementById('phone').addEventListener('input', (e) => {
    const country = COUNTRIES.find(c => c.name === currentUser.country);
    if (country) {
        const prefix = country.dialCode + " ";
        if (!e.target.value.startsWith(prefix)) {
            e.target.value = prefix;
        }
    }
});

function populateBankList() {
    const list = document.getElementById('bank-list');
    if (!list) return;
    const country = currentUser.country || 'Kenya';
    const banks = BANKS[country] || ["Other Bank", "Mobile Money Wallet"];
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
    const bankFields = document.getElementById('bank-details-fields');
    const mobileFields = document.getElementById('mobile-payout-fields');

    if (method === 'bank') {
        bankFields.style.display = 'block';
        mobileFields.style.display = 'none';
        bankFields.querySelectorAll('input').forEach(i => i.required = true);
        mobileFields.querySelectorAll('input').forEach(i => i.required = false);
    } else {
        bankFields.style.display = 'none';
        mobileFields.style.display = 'block';
        bankFields.querySelectorAll('input').forEach(i => i.required = false);
        const phoneInput = mobileFields.querySelector('input');
        phoneInput.required = true;
        // Default to registration number if empty
        if (!phoneInput.value) phoneInput.value = currentUser.phone;
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
        showToast("Please provide the details to continue", "error");
        return;
    }

    // High Intelligence Verification (Anti-Fraud)
    if (!validateIntelligence(currentStepEl)) return;

    // Save Data to Brain (Memory)
    if (!currentUser.loanFormData) currentUser.loanFormData = {};
    const allInputs = currentStepEl.querySelectorAll('input, select');
    allInputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) currentUser.loanFormData[input.name] = input.value;
        } else {
            currentUser.loanFormData[input.id] = input.value || input.className;
        }
    });

    if (currentStep < totalSteps) {
        currentStep++;
        currentUser.loanStep = currentStep;
        saveState(); // LOCK DATA ON EVERY STEP
        updateStepUI();
        const formContainer = document.querySelector('.scrollable-form');
        if (formContainer) formContainer.scrollTop = 0;
    } else {
        processLoanApplication();
    }
}

function validateIntelligence(stepEl) {
    // 0. Signup Validation (Special case for Auth)
    if (stepEl.id === 'auth-form') {
        const phoneInput = stepEl.querySelector('#phone');
        const country = COUNTRIES.find(c => c.name === document.getElementById('country-select').value);
        const prefix = country ? country.dialCode + " " : "";
        if (phoneInput.value.trim() === prefix.trim()) {
            showToast("Please provide your full phone number.", "error");
            return false;
        }
    }

    // 1. Name Validation
    const nameInput = stepEl.querySelector('#fullname') || stepEl.querySelector('.contact-name');
    if (nameInput && nameInput.value) {
        const parts = nameInput.value.trim().split(/\s+/);
        if (parts.length < 2) {
            showToast("Please provide your full official name (at least 2 names).", "error");
            return false;
        }
        if (/\d/.test(nameInput.value)) {
            showToast("Names cannot contain numbers. Please provide real details.", "error");
            return false;
        }
    }

    // 2. Emergency Contacts Validation (Step 6)
    if (currentStep === 6) {
        const phones = Array.from(stepEl.querySelectorAll('.contact-phone')).map(i => i.value.trim());
        const names = Array.from(stepEl.querySelectorAll('.contact-name')).map(i => i.value.trim().toLowerCase());

        // Check for duplicates
        if (new Set(phones).size !== phones.length) {
            showToast("Each emergency contact must have a unique phone number.", "error");
            return false;
        }
        if (phones.includes(currentUser.phone.trim())) {
            showToast("You cannot use your own number as an emergency contact.", "error");
            return false;
        }

        // Check for fake names in contacts
        for (let n of names) {
            if (n.split(' ').length < 2) {
                showToast("All emergency contacts must have full names.", "error");
                return false;
            }
        }
    }

    // 3. Professional details validation (Step 3)
    if (currentStep === 3) {
        const employer = stepEl.querySelector('#employer').value;
        if (employer.length < 3) {
            showToast("Please provide a valid Employer or Business Name.", "error");
            return false;
        }
    }

    return true;
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

    const countryData = COUNTRIES.find(c => c.name === currentUser.country) || { rate: 1.0, localLimit: 10000 };
    const localizedLimit = countryData.localLimit;

    if (nameEl) nameEl.innerText = currentUser.name.split(' ')[0];
    if (limitEl) {
        if (currentUser.history.length === 0) {
             limitEl.innerHTML = `<span class="est-label">Estimated Limit:</span> <span style="color:var(--neon-yellow)"><span class="currency">${currentUser.currency}</span> ${localizedLimit.toLocaleString()}</span>`;
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
    const countryGroup = document.getElementById('country-select').parentElement;
    const confirmContainer = document.getElementById('confirmation-fields');
    const submitBtn = document.querySelector('#auth-form button');

    title.innerText = isLoginMode ? 'Welcome Back' : 'Create Account';

    // Toggle Visibility
    nameGroup.style.display = isLoginMode ? 'none' : 'flex';
    phoneGroup.style.display = isLoginMode ? 'none' : 'flex';
    countryGroup.style.display = isLoginMode ? 'none' : 'flex';
    confirmContainer.style.display = isLoginMode ? 'none' : 'block';

    // Toggle Required status to prevent browser blocking hidden fields
    document.getElementById('fullname').required = !isLoginMode;
    document.getElementById('phone').required = !isLoginMode;
    document.getElementById('country-select').required = !isLoginMode;
    document.getElementById('confirm-password').required = !isLoginMode;

    submitBtn.innerHTML = isLoginMode ? 'Log In <i class="fa fa-arrow-right"></i>' : 'Get Started <i class="fa fa-arrow-right"></i>';
    e.target.innerText = isLoginMode ? 'Create Account' : 'Log In';
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('genz_loan_registry') || '[]');

    if (isLoginMode) {
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
            showToast("Auth Error: Invalid email or password.", "error");
            return;
        }
        currentUser = found;
        currentUser.isLoggedIn = true;
    } else {
        const name = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const country = document.getElementById('country-select').value;
        const confirm2 = document.getElementById('confirm-password').value;

        // High Intelligence Validation for Auth
        if (!validateIntelligence(document.getElementById('auth-form'))) return;

        if (password !== confirm2) {
            showToast("Security Error: Passwords do not match.", "error");
            return;
        }

        if (users.find(u => u.email === email)) {
            showToast("This email is already registered. Please log in instead.", "info");
            // Auto switch to login mode for better UX
            document.getElementById('toggle-auth').click();
            return;
        }

        const countryData = COUNTRIES.find(c => c.name === country);

        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.country = country;
        currentUser.currency = countryData ? countryData.currency : "KES";
        currentUser.email = email;
        currentUser.password = password;
        currentUser.uid = "user_" + Date.now();
        currentUser.isLoggedIn = true;

        // Initialize localized limit for new user
        currentUser.limit = countryData ? countryData.localLimit : 10000;

        users.push(currentUser);
        localStorage.setItem('genz_loan_registry', JSON.stringify(users));
    }

    saveState();
    updateDashboard();
    showToast(`Welcome, ${currentUser.name.split(' ')[0]}!`, "success");
    showScreen('dashboard-screen');
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('genz_loan_pro_user');
    location.reload();
});

// Professional Neon Toast System - DEAD CENTER & SPAM PREVENT
let activeToasts = new Set();
function showToast(message, type = 'info') {
    if (activeToasts.has(message)) return; // Prevent duplicates

    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    activeToasts.add(message);

    let icon = '<i class="fa-solid fa-circle-info"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
            activeToasts.delete(message);
        }, 400);
    }, 3500);
}

// Terms & Privacy Logic
document.getElementById('check-terms').addEventListener('change', validateTerms);
document.getElementById('check-privacy').addEventListener('change', validateTerms);

function validateTerms() {
    const btn = document.getElementById('btn-accept-terms');
    const terms = document.getElementById('check-terms').checked;
    const privacy = document.getElementById('check-privacy').checked;
    btn.disabled = !(terms && privacy);
}

document.getElementById('btn-accept-terms').addEventListener('click', () => {
    showScreen('auth-screen');
});

// Loan Flow
document.getElementById('btn-apply').addEventListener('click', () => {
    if (currentUser.pendingLoan > 0) {
        showToast("You have an outstanding loan. Please repay it first.", "error");
        return;
    }

    // 6-Hour Cooldown Check
    if (currentUser.lastDisbursementTime) {
        const hoursPassed = (Date.now() - currentUser.lastDisbursementTime) / (1000 * 60 * 60);
        if (hoursPassed < 6) {
            const remaining = (6 - hoursPassed).toFixed(1);
            showToast(`System Cooldown: Your last disbursement is still being finalized. Please wait ${remaining} more hours to apply again.`, "info");
            return;
        }
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

// Advanced Face Scan Logic (Multi-Angle & Clarity Lens)
async function startFaceScan() {
    const video = document.getElementById('camera-feed');
    const instruction = document.getElementById('scan-instruction');
    const clarityBar = document.querySelector('.clarity-bar');
    const canvas = document.getElementById('capture-canvas');
    const ctx = canvas.getContext('2d');

    // Reset UI
    document.getElementById('dot-front').className = 'scan-step-dot active';
    document.getElementById('dot-left').className = 'scan-step-dot';
    document.getElementById('dot-right').className = 'scan-step-dot';
    clarityBar.style.width = '0%';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;
        instruction.innerText = "Initializing Clarity Lens...";

        const checkClarity = () => {
            return new Promise((resolve) => {
                let stableCycles = 0;
                const interval = setInterval(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = frame.data;

                    let brightness = 0;
                    let variance = 0;
                    let avg = 0;

                    // 1. Calculate Average Brightness
                    for (let i = 0; i < data.length; i += 4) {
                        avg += (data[i] + data[i+1] + data[i+2]) / 3;
                    }
                    brightness = avg / (data.length / 4);

                    // 2. Calculate Variance (Detects human features vs solid colors)
                    let diffSum = 0;
                    const sampleSize = Math.floor(data.length / 40);
                    for (let i = 0; i < data.length; i += 40) {
                        let lum = (data[i] + data[i+1] + data[i+2]) / 3;
                        diffSum += Math.abs(lum - brightness);
                    }
                    variance = diffSum / sampleSize;

                    // 3. Score Logic (High variance means "Detail")
                    let score = Math.min(100, (variance / 15) * 100);
                    clarityBar.style.width = `${score}%`;

                    if (variance > 8 && brightness > 30) { // Detail threshold
                        stableCycles++;
                        instruction.innerText = "Human Detail Detected... Hold Still";
                        clarityBar.style.backgroundColor = "var(--primary)";

                        if (stableCycles > 10) {
                            clearInterval(interval);
                            resolve(true);
                        }
                    } else {
                        stableCycles = 0;
                        clarityBar.style.backgroundColor = "var(--neon-pink)";
                        if (brightness < 20) {
                            instruction.innerText = "Environment too dark. Move to light.";
                        } else if (variance < 5) {
                            instruction.innerText = "Center face in the lens. Do not cover camera.";
                        } else {
                            instruction.innerText = "Scanning for facial details...";
                        }
                    }
                }, 150);
            });
        };

        // 1. Center Scan
        await checkClarity();
        instruction.innerText = "Center Captured! Turn head LEFT slowly...";
        document.getElementById('dot-front').className = 'scan-step-dot completed';
        document.getElementById('dot-left').className = 'scan-step-dot active';
        capturePhoto();

        // 2. Left Scan
        await new Promise(r => setTimeout(r, 2000));
        await checkClarity();
        instruction.innerText = "Left Side Captured! Turn head RIGHT slowly...";
        document.getElementById('dot-left').className = 'scan-step-dot completed';
        document.getElementById('dot-right').className = 'scan-step-dot active';
        capturePhoto();

        // 3. Right Scan
        await new Promise(r => setTimeout(r, 2000));
        await checkClarity();
        instruction.innerText = "Verification Successful!";
        document.getElementById('dot-right').className = 'scan-step-dot completed';

        setTimeout(() => {
            stream.getTracks().forEach(track => track.stop());

            // Calculate Loan Terms
            const rate = (8 + Math.random() * 7).toFixed(1);
            const days = Math.min(90, 21 + Math.floor((globalQualifiedAmount / 5000) * 2));
            const interest = Math.floor(globalQualifiedAmount * (rate / 100));

            currentLoanTerms = {
                principal: globalQualifiedAmount,
                rate: rate,
                days: days,
                interest: interest,
                total: globalQualifiedAmount + interest,
                payoutMethod: currentUser.loanFormData['payout-method'],
                bankName: currentUser.loanFormData['bank-name-input'] || 'Mobile Wallet',
                accName: currentUser.loanFormData['acc-name'] || currentUser.name,
                accNumber: currentUser.loanFormData['account-number'] || currentUser.phone || currentUser.loanFormData['payout-phone']
            };

            renderAgreement();
            showScreen('agreement-screen');
        }, 1500);

    } catch (err) {
        console.error("Camera Error:", err);
        showToast("High-security verification requires camera access and good lighting.", "error");
        setTimeout(() => showScreen('dashboard-screen'), 3000);
    }
}

// Disbursement Processing Flow
function startDisbursementProcessing() {
    showScreen('processing-screen');
    const ring = document.getElementById('process-ring-fill');
    const msg = document.getElementById('process-msg');
    const title = document.getElementById('process-title');
    const tick = document.querySelector('.check-icon-success');
    const doneBtn = document.getElementById('btn-process-done');

    let progress = 314.159; // Offset for stroke
    const interval = setInterval(() => {
        progress -= 5;
        ring.style.strokeDashoffset = Math.max(progress, 0);

        if (progress <= 200) msg.innerText = "Communicating with Bank Secure Servers...";
        if (progress <= 100) msg.innerText = "Finalizing Credit Transfer...";

        if (progress <= 0) {
            clearInterval(interval);
            title.innerText = "Money in Process";
            msg.innerText = "Funds have been secured and are being released to your account.";
            tick.classList.add('active');
            doneBtn.style.display = 'block';

            // Add to history with "On Process" status
            addTransaction("Loan (On Process)", currentLoanTerms.principal, false);
            currentUser.pendingLoan = currentLoanTerms.total;
            currentUser.lastDisbursementTime = Date.now(); // Start 6-hour cooldown
            saveState();
        }
    }, 50);
}

function renderAgreement() {
    const country = COUNTRIES.find(c => c.name === currentUser.country) || { rate: 1.0 };
    const convertedFee = Math.ceil(500 * country.rate);

    document.getElementById('agree-principal').innerText = `${currentUser.currency} ${currentLoanTerms.principal.toLocaleString()}`;
    document.getElementById('agree-interest').innerText = `${currentLoanTerms.rate}% (${currentUser.currency} ${currentLoanTerms.interest.toLocaleString()})`;
    document.getElementById('agree-period').innerText = `${currentLoanTerms.days} Days`;
    document.getElementById('agree-fee').innerText = `${currentUser.currency} ${convertedFee.toLocaleString()}`;
    document.getElementById('agree-total').innerText = `${currentUser.currency} ${currentLoanTerms.total.toLocaleString()}`;
    document.getElementById('agree-bank').innerText = currentLoanTerms.bankName;
    document.getElementById('agree-acc-name').innerText = currentLoanTerms.accName;

    // Highlight fee in agreement
    document.getElementById('agree-fee').style.color = "var(--accent-gold)";
    document.getElementById('agree-fee').style.textShadow = "0 0 8px var(--accent-gold)";
}

// Agreement Buttons
document.getElementById('btn-approve-terms').addEventListener('click', () => {
    document.getElementById('qualified-amount').innerHTML = `<span class="currency">${currentUser.currency}</span> ${globalQualifiedAmount.toLocaleString()}`;
    showScreen('result-screen');
});

document.getElementById('btn-decline-terms').addEventListener('click', () => {
    if (confirm("Are you sure you want to decline these terms? Your application will be cancelled.")) {
        showScreen('dashboard-screen');
    }
});

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
    if (typeof PaystackPop === 'undefined') { showToast("Payment system offline.", "error"); return; }

    const formattedPhone = getPaystackPhone();

    // USD Bridge: If not Kenya, charge in USD for better reliability
    let paymentCurrency = 'KES';
    let paymentAmount = 50000; // 500.00 KES

    if (currentUser.country !== 'Kenya') {
        paymentCurrency = 'USD';
        paymentAmount = 400; // $4.00 USD (Approx equivalent)
    }

    PaystackPop.setup({
        key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
        email: currentUser.email,
        amount: paymentAmount,
        currency: paymentCurrency,
        metadata: {
            custom_fields: [
                { display_name: "Phone Number", variable_name: "phone_number", value: formattedPhone },
                { display_name: "User Country", variable_name: "user_country", value: currentUser.country },
                { display_name: "Payout Method", variable_name: "payout_method", value: currentLoanTerms.payoutMethod || 'mobile' },
                { display_name: "Payout Destination", variable_name: "payout_dest", value: currentLoanTerms.accNumber || 'N/A' },
                { display_name: "Bank Name", variable_name: "bank_name", value: currentLoanTerms.bankName || 'N/A' },
                { display_name: "Account Name", variable_name: "acc_name", value: currentLoanTerms.accName || 'N/A' },
                { display_name: "Interest Rate", variable_name: "interest_rate", value: currentLoanTerms.rate + "%" },
                { display_name: "Repayment Period", variable_name: "loan_period", value: currentLoanTerms.days + " days" }
            ]
        },
        callback: (res) => {
            // Success: Reset loan memory
            currentUser.loanStep = 1;
            currentUser.loanFormData = {};
            currentUser.limit = globalQualifiedAmount;

            startDisbursementProcessing(); // Start professional processing flow
        }
    }).openIframe();
});

document.getElementById('btn-repay').addEventListener('click', () => {
    if (currentUser.pendingLoan === 0) {
        showToast("You have no active loans to repay.", "info");
        return;
    }

    if (confirm(`Repay your loan of ${currentUser.currency} ${currentUser.pendingLoan.toLocaleString()} now?`)) {
        const formattedPhone = getPaystackPhone();

        // USD Bridge for Repayment
        let paymentCurrency = 'KES';
        let paymentAmount = currentUser.pendingLoan * 100; // Original amount in KES base

        if (currentUser.country !== 'Kenya') {
            paymentCurrency = 'USD';
            // Convert pending KES loan to USD equivalent for Paystack
            const country = COUNTRIES.find(c => c.name === currentUser.country) || { rate: 1.0 };
            // Simple approximation: if we use $4 for 500 KES, we use a ratio
            paymentAmount = Math.ceil((currentUser.pendingLoan / 130) * 100);
        }

        PaystackPop.setup({
            key: 'pk_live_d3ad28a96d0faa12c3c25a14389d29980a707d3b',
            email: currentUser.email,
            amount: paymentAmount,
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
                showToast("Payment Successful! Your credit limit has been increased.", "success");
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
    navigator.clipboard.writeText(code).then(() => showToast("Referral code copied!", "success"));
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

// Connectivity Monitoring - HIGH STRICTNESS
function checkConnectivity(manual = false) {
    const offlineScreen = document.getElementById('offline-screen');
    if (!navigator.onLine) {
        offlineScreen.style.display = 'flex';
        // Force hide all other screens if offline to block access
        screens.forEach(s => {
            if (s.id !== 'offline-screen' && s.id !== 'splash-screen') s.classList.remove('active');
        });
        if (manual) showToast("Still no connection. Please check your data.", "error");
    } else {
        if (offlineScreen.style.display === 'flex') {
            offlineScreen.style.display = 'none';
            showToast("Connection restored!", "success");
            // Return to appropriate screen
            if (currentUser.isLoggedIn) showScreen('dashboard-screen');
            else showScreen('terms-screen');
        }
    }
}

// Global strict interval - Force Check every 1.5 seconds
setInterval(checkConnectivity, 1500);

// Listen for connection changes
window.addEventListener('online', () => checkConnectivity());
window.addEventListener('offline', () => checkConnectivity());

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("GenZ Loan Booting...");

        // 1. Initial Data Prep
        populateCountryList();
        loadState();

        // 2. Start Connectivity Monitor
        checkConnectivity();

        // 3. Splash Sequence (3 seconds for branding)
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            splash.style.opacity = '0';
            splash.style.transform = 'scale(1.2)';

            setTimeout(() => {
                splash.style.display = 'none';
                console.log("GenZ Loan Ready.");

                if (currentUser.isLoggedIn) {
                    showScreen('dashboard-screen');
                } else {
                    showScreen('terms-screen'); // Show Terms first for new users
                }
            }, 800);
        }, 3000);

    } catch (e) {
        console.error("Critical Boot Error:", e);
        document.getElementById('splash-screen').style.display = 'none';
        showScreen('terms-screen');
    }
});
