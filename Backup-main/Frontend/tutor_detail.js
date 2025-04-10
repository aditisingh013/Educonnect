function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
}

function isValidNumber(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const error = formGroup.querySelector('.error-message') || document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    formGroup.appendChild(error);
    input.classList.add('error');
}

function clearError(input) {
    const formGroup = input.parentElement;
    const error = formGroup.querySelector('.error-message');
    if (error) {
        formGroup.removeChild(error);
    }
    input.classList.remove('error');
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.type) {
        case 'email':
            isValid = isValidEmail(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'tel':
            isValid = isValidPhone(value);
            errorMessage = 'Please enter a valid phone number';
            break;
        case 'number':
            if (input.hasAttribute('min') || input.hasAttribute('max')) {
                const min = input.getAttribute('min');
                const max = input.getAttribute('max');
                isValid = isValidNumber(value, min, max);
                errorMessage = `Please enter a number between ${min} and ${max}`;
            }
            break;
    }

    if (!isValid) {
        showError(input, errorMessage);
    } else {
        clearError(input);
    }

    return isValid;
}

function validateFile(input) {
    const file = input.files[0];
    let isValid = true;
    let errorMessage = '';

    if (!file) {
        isValid = false;
        errorMessage = 'Please select a file';
    } else if (!input.accept.includes(file.type)) {
        isValid = false;
        errorMessage = 'Please select a valid file type';
    } else if (file.size > 5 * 1024 * 1024) {
        isValid = false;
        errorMessage = 'File size should be less than 5MB';
    }

    if (!isValid) {
        showError(input, errorMessage);
    } else {
        clearError(input);
    }

    return isValid;
}

function addSubjectEntry() {
    const container = document.querySelector('.subjects-container');
    const newEntry = document.querySelector('.subject-entry').cloneNode(true);
    newEntry.querySelectorAll('input').forEach(input => input.value = '');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-entry';
    removeButton.innerHTML = '<i class="fas fa-trash"></i> Remove';
    removeButton.onclick = () => newEntry.remove();

    newEntry.appendChild(removeButton);
    container.appendChild(newEntry);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tutor-form');
    if (form) {
        form.addEventListener('input', (e) => validateInput(e.target));
    }

    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', () => validateFile(input));
    });

    document.getElementById('add-subject-btn')?.addEventListener('click', addSubjectEntry);
});
