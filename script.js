// ===== INITIAL SETUP ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');

    if (startDateEl && endDateEl) {
        startDateEl.valueAsDate = today;
        endDateEl.valueAsDate = tomorrow;
        startDateEl.min = today.toISOString().split('T')[0];
    }

    // Attach fee + bracelet calculation triggers
    document.getElementById('startDate')?.addEventListener('change', calculateFees);
    document.getElementById('endDate')?.addEventListener('change', calculateFees);
    document.getElementById('apartmentType')?.addEventListener('change', function () {
        const otherContainer = document.getElementById('otherTypeContainer');
        if (otherContainer) {
            otherContainer.style.display = this.value === 'other' ? 'block' : 'none';
        }
        calculateFees();
    });

    document.getElementById('adults')?.addEventListener('input', calculateBracelets);
    document.getElementById('children')?.addEventListener('input', calculateBracelets);

    // Style inputs on interaction
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value) this.style.borderColor = '#d4af37';
        });
    });

    // Initial state
    setCurrentDate();
    calculateFees();
    calculateBracelets();
});

// ===== SET CURRENT DATE =====
function setCurrentDate() {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', options);
    document.getElementById('currentDate')!.textContent = formattedDate;
}

// ===== CALCULATE FEES =====
function calculateFees() {
    const apartmentType = document.getElementById('apartmentType')?.value;
    const startDateStr = document.getElementById('startDate')?.value;
    const endDateStr = document.getElementById('endDate')?.value;

    if (!apartmentType || !startDateStr || !endDateStr) return;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const fixedFee = 30;
    let variableFee = 0;

    const rateTable = {
        s0: [40, 80],
        s1: [60, 120],
        s2: [80, 160],
        s3: [100, 200],
    };

    if (nights > 0 && rateTable[apartmentType]) {
        variableFee = nights <= 10 ? rateTable[apartmentType][0] : rateTable[apartmentType][1];
    }

    document.getElementById('fixedFee').textContent = `${fixedFee} DT`;
    document.getElementById('variableFee').textContent = `${variableFee} DT`;
    document.getElementById('totalFee').textContent = `${fixedFee + variableFee} DT`;
}

// ===== CALCULATE TOTAL BRACELETS =====
function calculateBracelets() {
    const adults = parseInt(document.getElementById("adults")?.value) || 0;
    const children = parseInt(document.getElementById("children")?.value) || 0;
    const braceletsEl = document.getElementById("bracelets");
    if (braceletsEl) {
        braceletsEl.value = adults + children;
    }
}

// ===== SIGNATURE PAD HANDLING =====
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas?.getContext("2d");
let drawing = false, lastX = 0, lastY = 0;

if (canvas && ctx) {
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
}

function clearSignature() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ===== FORM VALIDATION & SUBMISSION =====
document.getElementById('rentalForm')?.addEventListener('submit', function (e) {
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
        if (!el?.value.trim()) {
            el.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            el.style.borderColor = '#d4af37';
        }
    });

    const requiredCheckboxes = ['regulationKnowledge', 'informationAccuracy', 'feeCommitment', 'acceptTerms'];
    requiredCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox?.checked) {
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
        calculateBracelets();
        document.getElementById('otherTypeContainer').style.display = 'none';
    } else {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('FailedMessage').style.display = 'block';
    }
});

// ===== RESET BUTTON HANDLING =====
document.querySelector('.btn-reset')?.addEventListener('click', function () {
    const form = document.getElementById('rentalForm');
    if (!form) return;

    form.reset();
    clearSignature();
    setCurrentDate();
    calculateFees();
    calculateBracelets();

    document.getElementById('otherTypeContainer').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('FailedMessage').style.display = 'none';

    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => field.style.borderColor = '#d4af37');
});
