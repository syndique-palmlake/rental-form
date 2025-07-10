// ===== SHOW/HIDE OTHER APARTMENT TYPE FIELD =====
document.getElementById('apartmentType').addEventListener('change', function () {
    const otherContainer = document.getElementById('otherTypeContainer');
    if (this.value === 'other') {
        otherContainer.style.display = 'block';
    } else {
        otherContainer.style.display = 'none';
    }
    calculateFees();
});

// ===== CALCULATE FEES BASED ON STAY =====
function calculateFees() {
    const apartmentType = document.getElementById('apartmentType').value;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (!apartmentType || isNaN(startDate) || isNaN(endDate)) return;

    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const fixedFee = 30;
    let variableFee = 0;

    if (nights > 0) {
        const rateTable = {
            s0: [40, 80],
            s1: [60, 120],
            s2: [80, 160],
            s3: [100, 200],
        };
        const fees = rateTable[apartmentType];
        if (fees) {
            variableFee = nights <= 10 ? fees[0] : fees[1];
        }
    }

    document.getElementById('fixedFee').textContent = ${fixedFee} DT;
    document.getElementById('variableFee').textContent = ${variableFee} DT;
    document.getElementById('totalFee').textContent = ${fixedFee + variableFee} DT;
}

// ===== CALCULATE TOTAL BRACELETS =====
function calculateNigts() {
    const adults = parseInt(document.getElementById("adults").value) || 0;
    const children = parseInt(document.getElementById("children").value) || 0;
    const total = adults + children;
    document.getElementById("bracelets").value = total;
}

// ===== SET CURRENT DATE =====
function setCurrentDate() {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', options);
    document.getElementById('currentDate').textContent = formattedDate;
}

// ===== SIGNATURE PAD HANDLING =====
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", () => {
    drawing = true;
    ctx.beginPath();
});
canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", () => {
    drawing = true;
    ctx.beginPath();
});
canvas.addEventListener("touchend", () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener("touchmove", function (e) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw({ clientX: touch.clientX, clientY: touch.clientY, rect });
}, { passive: false });

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===== FORM VALIDATION & SUBMISSION =====
document.getElementById('rentalForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    const requiredFields = [
        'declarantType', 'fullName', 'phone', 'email', 'cin',
        'block', 'apartmentNumber', 'apartmentType',
        'tenantName', 'tenantDob', 'nationality', 'idType', 'idNumber',
        'startDate', 'endDate', 'adults', 'children'
    ];

    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            el.style.borderColor = '#ddd';
        }
    });

    const requiredCheckboxes = ['regulationKnowledge', 'informationAccuracy', 'feeCommitment', 'acceptTerms'];
    requiredCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox.checked) {
            checkbox.parentElement.style.color = '#e74c3c';
            isValid = false;
        } else {
            checkbox.parentElement.style.color = '';
        }
    });

    if (isValid) {
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('FailedMessage').style.display = 'none';
        this.reset();
        clearSignature();
        setCurrentDate();
        calculateFees();
        calculateNigts();
        document.getElementById('otherTypeContainer').style.display = 'none';
    } else {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('FailedMessage').style.display = 'block';
    }
});

// ===== RESET BUTTON HANDLING =====
document.querySelector('.btn-reset').addEventListener('click', function () {
    const form = document.getElementById('rentalForm');
    form.reset();
    clearSignature();
    setCurrentDate();
    calculateFees();
    calculateNigts();
    document.getElementById('otherTypeContainer').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('FailedMessage').style.display = 'none';

    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => field.style.borderColor = '#ddd');
});

// ===== INITIAL SETUP =====
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
document.getElementById('startDate').valueAsDate = today;
document.getElementById('endDate').valueAsDate = tomorrow;

setCurrentDate();
calculateFees();
calculateNigts();
