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
            s1: 50,
            s2: 80,
            s3: 100,
        };
        variableFee = rateTable[apartmentType] || 0;
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
        'startDate', 'endDate', 'adults', 'children'
    ];
    
    // Add tenant fields to required fields
    for (let i = 1; i <= tenantCount; i++) {
        requiredFields.push(`tenantName${i}`, `tenantDob${i}`, `nationality${i}`, `relationship${i}`, `idNumber${i}`);
    }

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

    sendToGoogleAppsScript();
} else {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('FailedMessage').style.display = 'block';
}

     for (let i = 1; i <= tenantCount; i++) {
        requiredFields.push(`socialStatus${i}`);
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
    const tenantsContainer = document.getElementById('tenantsContainer');
    const tenants = tenantsContainer.querySelectorAll('.tenant-group');
    for (let i = tenants.length - 1; i > 0; i--) {
        tenants[i].remove();
    }
    tenantCount = 1;
    
    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => field.style.borderColor = '#d4af37');
}

let tenantCount = 1;
function addTenant() {
    if (tenantCount >= 6) {
        alert("Maximum de 6 locataires atteint");
        return;
    }
    
    tenantCount++;
    const container = document.getElementById('tenantsContainer');
    
    const newTenant = document.createElement('div');
    newTenant.className = 'tenant-group';
    newTenant.setAttribute('data-tenant', tenantCount);
      
    newTenant.innerHTML = `
        <!-- ... existing fields ... -->
        <div class="form-group">
            <div class="form-column">
                <label for="socialStatus${tenantCount}" class="required">Statut Social</label>
                <input type="text" id="socialStatus${tenantCount}" name="socialStatus${tenantCount}" list="socialStatusOptions">
                <datalist id="socialStatusOptions">
                    <option value="Célibataire">
                    <option value="Marié(e)">
                    <option value="Divorcé(e)">
                    <option value="Veuf/Veuve">
                    <option value="En concubinage">
                    <option value="Séparé(e)">
                </datalist>
            </div>
        </div>
        <!-- ... rest of the fields ... -->
    `;
    
    newTenant.innerHTML = `
        <h3>Locataire ${tenantCount}</h3>
        <div class="form-group">
            <div class="form-column">
                <label for="tenantName${tenantCount}" class="required">Nom & Prénom</label>
                <input type="text" id="tenantName${tenantCount}" name="tenantName${tenantCount}">
            </div>
            <div class="form-column">
                <label for="tenantDob${tenantCount}" class="required">Date de naissance</label>
                <input type="date" id="tenantDob${tenantCount}" name="tenantDob${tenantCount}">
            </div>
        </div>
        
        <div class="form-group">
            <div class="form-column">
                <label for="nationality${tenantCount}" class="required">Nationalité</label>
                <input type="text" id="nationality${tenantCount}" name="nationality${tenantCount}">
            </div>
            <div class="form-column">
                <label for="relationship${tenantCount}" class="required">Relation avec déclarant</label>
                <select id="relationship${tenantCount}" name="relationship${tenantCount}">
                    <option value="">Sélectionnez</option>
                    <option value="family">Famille</option>
                    <option value="friend">Ami</option>
                    <option value="colleague">Collègue</option>
                    <option value="client">Client</option>
                    <option value="other">Autre</option>
                </select>
            </div>
        </div>
        
        <div class="form-group">
            <div class="form-column">
                <label for="idNumber${tenantCount}" class="required">N° CIN/Passeport</label>
                <input type="text" id="idNumber${tenantCount}" name="idNumber${tenantCount}">
            </div>
            <div class="form-column">
                <button type="button" class="btn-upload remove-tenant" data-tenant="${tenantCount}" style="margin-top: 25px;">
                    <i class="fas fa-user-minus"></i> Supprimer
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(newTenant);
    
    newTenant.querySelector('.remove-tenant').addEventListener('click', function() {
        removeTenant(this.getAttribute('data-tenant'));
    });
    
}

function removeTenant(tenantNum) {
    if (tenantNum <= 1) return; 
    
    const tenantToRemove = document.querySelector(`.tenant-group[data-tenant="${tenantNum}"]`);
    if (tenantToRemove) {
        tenantToRemove.remove();
        tenantCount--;

        const tenants = document.querySelectorAll('.tenant-group');
        tenants.forEach((tenant, index) => {
            const newNum = index + 1;
            tenant.setAttribute('data-tenant', newNum);
            tenant.querySelector('h3').textContent = newNum === 1 ? 'Locataire 1 (Principal)' : `Locataire ${newNum}`;
            const fields = tenant.querySelectorAll('[id^="tenantName"], [id^="tenantDob"], [id^="nationality"], [id^="relationship"], [id^="idNumber"]');
            fields.forEach(field => {
                const fieldType = field.id.replace(/\d+$/, '');
                field.id = fieldType + newNum;
                field.name = fieldType + newNum;
            });
            const removeBtn = tenant.querySelector('.remove-tenant');
            if (removeBtn) {
                removeBtn.setAttribute('data-tenant', newNum);
            }
        });
    }
}



document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById('addTenantBtn').addEventListener('click', addTenant);
});
// Add this to your DOMContentLoaded event listener
document.getElementById('declarantType').addEventListener('change', function() {
    const isAgencyOrRep = this.value === 'agency' || this.value === 'representative';
    
    // Toggle document sections
    document.getElementById('ownerDocuments').style.display = isAgencyOrRep ? 'none' : 'block';
    document.getElementById('agencyDocuments').style.display = isAgencyOrRep ? 'block' : 'none';
    
    // Update required fields
    document.getElementById('ownerId').required = !isAgencyOrRep;
    document.getElementById('procurationFile').required = isAgencyOrRep;
    document.getElementById('representativeId').required = isAgencyOrRep;
    
    // Clear fields when switching types
    if (!isAgencyOrRep) {
        document.getElementById('procurationFile').value = '';
        document.getElementById('representativeId').value = '';
    } else {
        document.getElementById('ownerId').value = '';
    }
});
// keep all your existing code for DOM, calculations, validation, signature pad...

async function submitAll() {
  if (!validateForm()) return;

  const form = document.getElementById("rentalform");
  const formData = new FormData(form);
  const signatureData = document.getElementById("signatureCanvas").toDataURL("image/png");
  formData.append("signature", signatureData);

  // Send to Google Apps Script
  fetch("https://script.google.com/macros/s/AKfycbzTOTSxKfeJxqQGElnjuNdHm2yFDJoEBebKuc6zHdzR7yuux_hGAn_BxWEM22en2gkS/exec", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(res => {
    if (res.success) {
      alert("✅ Soumis à Google Apps Script !");
      // then let native FormSubmit happen:
      form.submit();
    } else {
      alert("❌ Erreur Apps Script : " + res.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("❌ Échec communication Apps Script");
  });
}


