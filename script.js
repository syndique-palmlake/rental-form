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

        // Submit the form
        const form = document.getElementById('rentalform');
        setTimeout(() => {
            form.submit(); // or call form.requestSubmit() for compatibility
        }, 500);
    } else {
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('FailedMessage').style.display = 'block';
    }
}
