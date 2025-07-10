// ===== INITIAL SETUP ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Set current date in French format
    const formattedDate = today.toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById('currentDate').textContent = formattedDate;

    // Set default values for start and end dates
    document.getElementById('startDate').valueAsDate = today;
    document.getElementById('endDate').valueAsDate = tomorrow;
    document.getElementById('startDate').min = today.toISOString().split('T')[0];

    // Input styling on change
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value) this.style.borderColor = '#d4af37';
        });
    });

    // Initial calculations
    calculateFees();
    calculateBracelets();
});

// ===== CALCULATE FEES =====
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
        const rates = rateTable[apartmentType];
        if (rates) {
            variableFee = nights <= 10 ? rates[0] : rates[1];
        }
    }

    document.getElementById('fixedFee').textContent = `${fixedFee} DT`;
    document.getElementById('variableFee').textContent = `${variableFee} DT`;
    document.getElementById('totalFee').textContent = `${fixedFee + variableFee} DT`;
}

// ===== CALCULATE TOTAL BRACELETS =====
function calculateBracelets() {
    const adults = parseInt(document.getElementById("adults").value) || 0;
    const children = parseInt(document.getElementById("children").value) || 0;
    document.getElementById("bracelets").value = adults + children;
}

document.getElementById("adults").addEventListener("input", calculateBracelets);
document.getElementById("children").addEventListener("input", calculateBracelets);
document.getElementById("startDate").addEventListener("change", calculateFees);
document.getElementById("endDate").addEventListener("change", calculateFees);
document.getElementById("apartmentType").addEventListener("change", function () {
    const otherContainer = document.getElementById('otherTypeContainer');
    otherContainer.style.display = this.value === 'other' ? 'block' : 'none';
    calculateFees();
});

// ===== SIGNATURE PAD HANDLING =====
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
let drawing = false, lastX = 0, lastY = 0;

canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    ctx.strokeStyle = '#0c2340';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("touchstart", (e) => {
    drawing = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
});
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!drawing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}, { passive: false });
canvas.addEventListener("touchend", () => drawing = false);

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ===== FORM VALIDATION & SUBMISSION =====
function validateForm() {
    let isValid = true;
    const requiredFields = [
        'declarantType', 'fullName', 'phone', 'email', 'cin',
        'block', 'apartmentNumber', 'apartmentType',
        'tenantName', 'tenantDob', 'nationality', 'idType', 'idNumber',
        'startDate', 'endDate', 'adults', 'children'
    ];

    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el || (el.type !== 'number' && !el.value.trim()) || (el.type === 'number' && isNaN(el.value))) {
            if (el) el.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            el.style.borderColor = '#d4af37';
        }
    });

    const checkboxes = ['regulationKnowledge', 'informationAccuracy', 'feeCommitment', 'acceptTerms'];
    checkboxes.forEach(id => {
        const cb = document.getElementById(id);
        if (!cb || !cb.checked) {
            if (cb && cb.parentElement) cb.parentElement.style.color = '#e74c3c';
            isValid = false;
        } else {
            cb.parentElement.style.color = '';
        }
    });

    if (isValid) {
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('FailedMessage').style.display = 'none';

        setTimeout(() => {
            document.getElementById('rentalform').submit();
        }, 500);
    } else {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('FailedMessage').style.display = 'block';
    }
}

// ===== RESET FORM =====
function resetForm() {
    const form = document.getElementById('rentalform');
    form.reset();
    clearSignature();
    calculateFees();
    calculateBracelets();
    document.getElementById('otherTypeContainer').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('FailedMessage').style.display = 'none';

    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => field.style.borderColor = '#d4af37');
} 
