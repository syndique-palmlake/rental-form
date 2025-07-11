const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxRem1opsNa6nSuMKtT2X_lGxBwO5ie-IiN50t5enBTQeykbPJBybbO2O5_raf2Z63F/exec";

document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("signatureCanvas");
    const ctx = canvas.getContext("2d");
    let drawing = false;

    canvas.addEventListener("mousedown", e => {
        drawing = true;
        ctx.moveTo(e.offsetX, e.offsetY);
    });
    canvas.addEventListener("mousemove", e => {
        if (drawing) {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    });
    canvas.addEventListener("mouseup", () => drawing = false);
    canvas.addEventListener("mouseout", () => drawing = false);

    // Touch support
    canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
        drawing = true;
    }, { passive: false });

    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        if (!drawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    }, { passive: false });

    canvas.addEventListener("touchend", () => drawing = false);

    document.querySelector(".btn-submit").addEventListener("click", submitForm);
    document.querySelector(".btn-reset").addEventListener("click", resetForm);

    // Display today's date
    const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById("currentDate").textContent = today;
});

function clearSignature() {
    const canvas = document.getElementById("signatureCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resetForm() {
    document.getElementById("rentalform").reset();
    clearSignature();
    document.getElementById("successMessage").style.display = "none";
    document.getElementById("FailedMessage").style.display = "none";
}

function submitForm() {
    const form = document.getElementById("rentalform");
    const formData = new FormData(form);

    // Get signature as data URL
    const canvas = document.getElementById("signatureCanvas");
    canvas.toBlob(function (blob) {
        if (blob) formData.append("signature", blob, "signature.png");

        // Collect all uploaded files
        const fileInputs = form.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            if (input.files.length > 0) {
                for (let i = 0; i < input.files.length; i++) {
                    formData.append(input.name, input.files[i]);
                }
            }
        });

        // Submit to Google Script
        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: formData,
        })
            .then(response => response.text())
            .then(response => {
                console.log("Success:", response);
                document.getElementById("successMessage").style.display = "block";
                document.getElementById("FailedMessage").style.display = "none";
            })
            .catch(error => {
                console.error("Error:", error);
                document.getElementById("successMessage").style.display = "none";
                document.getElementById("FailedMessage").style.display = "block";
            });
    }, 'image/png');
}
