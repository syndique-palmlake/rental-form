document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    const apartmentTypeEl = document.getElementById('apartmentType');
    const adultsEl = document.getElementById('adults');
    const childrenEl = document.getElementById('children');
    const braceletsEl = document.getElementById('bracelets');
    const otherTypeContainer = document.getElementById('otherTypeContainer');

    // Set start/end date defaults
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (startDateEl && endDateEl) {
        startDateEl.valueAsDate = today;
        endDateEl.valueAsDate = tomorrow;
        startDateEl.min = today.toISOString().split('T')[0];
    }

    // Set current date in French
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const formattedDate = today.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        currentDateEl.textContent = formattedDate;
    }

    // Event listeners
    if (apartmentTypeEl) {
        apartmentTypeEl.addEventListener('change', () => {
            if (apartmentTypeEl.value === 'other') {
                otherTypeContainer.style.display = 'block';
            } else {
                otherTypeContainer.style.display = 'none';
            }
            calculateFees();
        });
    }

    startDateEl?.addEventListener('change', calculateFees);
    endDateEl?.addEventListener('change', calculateFees);
    adultsEl?.addEventListener('input', () => {
        calculateBracelets();
        calculateFees();
    });
    childrenEl?.addEventListener('input', () => {
        calculateBracelets();
        calculateFees();
    });

    // Calculate initial values
    calculateFees();
    calculateBracelets();

    // Form reset
    document.querySelector('.btn-reset')?.addEventListener('click', () => {
        document.getElementById('rentalForm').reset();
        clearSignature();
        if (otherTypeContainer) otherTypeContainer.style.display = 'none';
        document.getElementById('fixedFee').textContent = '30 DT';
        document.getElementById('variableFee').textContent = '0 DT';
        document.getElementById('totalFee').textContent = '30 DT';
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('FailedMessage').style.display = 'none';
        calculateBracelets();
        setCurrentDate();
    });

    // Signature canvas
    initSignaturePad();

    // Form submission
    document.getElementById('rentalForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const valid = validateForm();
        if (valid) {
            this.reset();
            clearSignature();
            calculateFees();
            calculateBracelets();
            setCurrentDate();
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('FailedMessage').style.display = 'none';
            if (otherTypeContainer) otherTypeContainer.style.display = 'none';
        } else {
            document.getElementById('successMessage').style.display = 'none';
            document.getElementById('FailedMessage').style.display = 'block';
        }
    });
});

// ===== FEES CALCULATION =====
function calculateFees() {
    const type = document.getElementById('apartmentType')?.value;
    const startStr = document.getElementById('startDate')?.value;
    const endStr = document.getElementById('endDate')?.value;

    if (!type || !startStr || !endStr) return;

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start) || isNaN(end)) return;

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return;

    const fixed = 30;
    let variable = 0;

    const rates = {
        s0: [40, 80],
        s1: [60, 120],
        s2: [80, 160],
        s3: [100, 200],
    };

    if (rates[type]) {
        variable = nights <= 10 ? rates[type][0] : rates[type][1];
    }

    document.getElementById('fixedFee').textContent = `${fixed} DT`;
    document.getElementById('variableFee').textContent = `${variable} DT`;
    document.getElementById('totalFee').textContent = `${fixed + variable} DT`;
}

// ===== BRACELET COUNT =====
function calculateBracelets() {
    const adults = parseInt(document.getElementById('adults')?.value) || 0;
    const children = parseInt(document.getElementById('children')?.value) || 0;
    document.getElementById('bracelets').value = adults + children;
}

// ===== DATE SETTER =====
function setCurrentDate() {
    const now = new Date();
    const el = document.getElementById('currentDate');
    if (el) {
        el.textContent = now.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}

// ===== SIGNATURE CANVAS =====
function initSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let drawing = false, lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    canvas.addEventListener('mousemove', (e) => {
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

    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseout', () => drawing = false);

    canvas.addEventListener('touchstart', (e) => {
        drawing = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
    });

    canvas.addEventListener('touchmove', (e) => {
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

    canvas.addEventListener('touchend', () => drawing = false);
}

function clearSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ===== FORM VALIDATION =====
function validateForm() {
    let isValid = true;
    const required = [
        'declarantType', 'fullName', 'phone', 'email', 'cin',
        'block', 'apartmentNumber', 'apartmentType',
        'tenantName', 'tenantDob', 'nationality', 'idType', 'idNumber',
        'startDate', 'endDate', 'adults', 'children'
    ];

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
            el.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            el.style.borderColor = '#d4af37';
        }
    });

    const checkboxes = ['regulationKnowledge', 'informationAccuracy', 'feeCommitment', 'acceptTerms'];
    checkboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox?.checked) {
            checkbox.parentElement.style.color = '#e74c3c';
            isValid = false;
        } else {
            checkbox.parentElement.style.color = '';
        }
    });

    return isValid;
}
