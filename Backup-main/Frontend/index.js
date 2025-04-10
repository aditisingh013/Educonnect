document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const urlParams = new URLSearchParams(window.location.search);
    const tutorId = urlParams.get('tutor_id');
    
        console.log("Tutor ID from URL:", tutorId);
        if (tutorId) {
            fetch(`http://localhost:5000/tutor/${tutorId}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text(); 
            })
            .then(text => {
                const json = JSON.parse(text);
    
                if (!json.data) {
                    console.error("No tutor data in response!");
                    return;
                }
    
                console.log("Tutor fetched:", json.data); // ✅ Should not be undefined
                renderTutorDetails(json.data);
            })
            .catch(err => console.error("Failed to load tutor details:", err));
        } else {
            console.error("No tutor_id found in URL.");
        }

    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    //logout i think
// Add remove button
const removeButton = document.createElement('button');
removeButton.type = 'button';
removeButton.className = 'remove-entry';
removeButton.innerHTML = '<i class="fas fa-trash"></i> Remove';
removeButton.onclick = function() {
    this.parentElement.remove();
};

    // Add input validation
    const form = document.getElementById('tutor-form');
    if (form) {
        form.addEventListener('input', function(event) {
            validateInput(event.target);
        });
    }

    // Add file validation
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateFile(this);
        });
    });


    //filter_tutor
    if (document.querySelector('#tutor-body')) {
        function loadHTMLTable(data) {
            console.log("Data passed to table:", data);
            const table = document.querySelector('#tutor-body');
    
            if (data.length === 0) {
                table.innerHTML = "<tr><td class='no-data' colspan='3'>No Results</td></tr>";
                return;
            }
    
            let tableHtml = "";
    
            data.forEach(({ tutor_id, profile, first_name, last_name, education, rating, subjects_with_rates }) => {
                const subjectList = subjects_with_rates
                    .split(', ')
                    .map(subRate => `<li>${subRate}</li>`)
                    .join('');
                    tableHtml += `
                    <tr class="clickable-row" data-id="${tutor_id}">
                        <td>
                            <img src="${profile}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%;">
                        </td>
                        <td>
                            <div class="tutor-info">
                                <h3>${first_name} ${last_name}</h3>
                                <p><strong>Education:</strong> ${education}</p>
                                <p><strong>Rating:</strong> ${parseFloat(rating).toFixed(1)} ⭐</p>
                            </div>
                        </td>
                        <td>
                            <ul style="list-style: disc; padding-left: 1.2rem;">
                                ${subjectList}
                            </ul>
                        </td>
                    </tr>
                    `;
            });
    
            table.innerHTML = tableHtml;

            document.querySelectorAll('.clickable-row').forEach(row => {
                row.addEventListener('click', () => {
                    const tutorId = row.dataset.id;
                    window.location.href = `tutor_desc.html?tutor_id=${tutorId}`;
                });
            });
            
            
        }
    }
    

    // Load all tutors on page load
    fetch("http://localhost:5000/getAll")
        .then(response => response.json())
        .then(data => loadHTMLTable(data.data))
        .then(data => documentTable(data.data))
        .catch(error => console.error("Error fetching data:", error));

    // Search by name
    const nameSearchBtn = document.querySelector('#search-name-btn');
    if (nameSearchBtn) {
        nameSearchBtn.onclick = function () {
            const name = document.querySelector('#search-name-input').value;
            fetch('http://localhost:5000/search/name/' + name)
                .then(response => response.json())
                .then(data => loadHTMLTable(data.data))
                .catch(err => console.error("Error loading table:", err));
        };
    }

    // Search by institution
    const instituteSearchBtn = document.querySelector('#search-institution-btn');
    if (instituteSearchBtn) {
        instituteSearchBtn.onclick = function () {
            const institute = document.querySelector('#search-institution').value;
            fetch('http://localhost:5000/search/institute/' + institute)
                .then(response => response.json())
                .then(data => loadHTMLTable(data.data))
                .catch(err => console.error("Error loading table:", err));
        };
    }

    // Apply filters
    const filterBtn = document.querySelector('#apply-filters-btn');
    if (filterBtn) {
        filterBtn.onclick = function () {
            const minPrice = document.querySelector('#min-price')?.value || '';
            const maxPrice = document.querySelector('#max-price')?.value || '';

            const education = Array.from(document.querySelectorAll('input[name="education"]:checked'))
                .map(el => el.value);
            const experience = Array.from(document.querySelectorAll('input[name="experience"]:checked'))
                .map(el => el.value);
            const rating = document.querySelector('#rating-filter')?.value || '';
            const subject = document.querySelector('#subject-filter')?.value || '';

            const filters = { minPrice, maxPrice, education, experience, rating, subject };

            fetch('http://localhost:5000/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters)
            })
            .then(response => response.json())
            .then(data => loadHTMLTable(data['data']))
            .catch(err => console.error("Filter error:", err));
        };
    }

    //tutor description page
function renderTutorDetails(tutor) {
    document.getElementById('tutor-name').textContent = `${tutor.first_name} ${tutor.last_name}`;
    document.getElementById('tutor-email').textContent = tutor.email;
    document.getElementById('tutor-id').textContent = tutor.tutor_id;
    document.getElementById('tutor-bio').textContent = tutor.bio;

    // Render education
    const educationList = document.getElementById('education-list');
    educationList.innerHTML = ''; // Clear before rendering
    if (tutor.school) {
        educationList.innerHTML += `<li>${tutor.school}</li>`;
    }
    if (tutor.college) {
        educationList.innerHTML += `<li>${tutor.college}</li>`;
    }
    if (tutor.job_place) {
        educationList.innerHTML += `<li>${tutor.job_place}</li>`;
    }

    // Resume
    const resumeLink = document.getElementById('resume-link');
    if (tutor.resume) {
        resumeLink.href = tutor.resume;
        resumeLink.style.display = 'inline';
    } else {
        resumeLink.style.display = 'none';
    }

    // Rating
    const ratingContainer = document.getElementById('tutor-rating');
    const rating = parseFloat(tutor.rating || 0).toFixed(1);
    ratingContainer.innerHTML = '';
    const stars = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < stars; i++) {
        ratingContainer.innerHTML += '<i class="fas fa-star"></i>';
    }
    if (half) ratingContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
    for (let i = stars + half; i < 5; i++) {
        ratingContainer.innerHTML += '<i class="far fa-star"></i>';
    }
    ratingContainer.innerHTML += `<span>${rating}</span>`;

    // Subjects
    const subjectsContainer = document.getElementById('subjects-container');
    subjectsContainer.innerHTML = ''; // Clear old data
    const subjects = tutor.subjects_with_rates?.split(', ') || [];
    subjects.forEach(sub => {
        const [subjectPart, ratePart] = sub.split(' - ₹');
        const [subName, skill] = subjectPart.split(' (');
        const skillLevel = skill.replace(')', '');
        subjectsContainer.innerHTML += `
            <div class="subject-card">
                <h3>${subName}</h3>
                <p class="price">₹${ratePart}/hour</p>
                <p>${skillLevel} level</p>
            </div>
        `;
    });
    console.log(tutor);
}


// Reset filters
const resetBtn = document.querySelector('#reset-filters-btn');
if (resetBtn) {
    resetBtn.onclick = function () {
        // Clear all filter inputs
        document.querySelector('#min-price').value = '';
        document.querySelector('#max-price').value = '';
        document.querySelectorAll('input[name="education"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="experience"]').forEach(cb => cb.checked = false);
        document.querySelector('#rating-filter').value = '';
        document.querySelector('#subject-filter').value = '';
        document.querySelector('#search-institution').value = '';

        // Reload all tutors
        fetch("http://localhost:5000/getAll")
            .then(response => response.json())
            .then(data => loadHTMLTable(data.data))
            .catch(error => console.error("Error fetching data:", error));
    };
}

//display documents
// Load uploaded documents
fetch("http://localhost:5000/getAllDocuments")
    .then(response => response.json())
    .then(data => documentTable(data.data))
    .catch(error => console.error("Error loading documents:", error));

    function documentTable(data) {
        const doctable = document.querySelector('#documentsTableBody');
        if (!doctable) return;
      
        if (data.length === 0) {
          doctable.innerHTML = "<tr><td class='no-data' colspan='5'>No Results</td></tr>";
          return;
        }
      
        let docTableHtml = "";
      
        data.forEach(({ doc_id, file_name, file_url, subject, uploaded_at }) => {
          docTableHtml += `
            <tr>
              <td>${doc_id}</td>
              <td>${file_name}</td>
              <td><a href="${file_url}" target="_blank">View File</a></td>
              <td>${subject}</td>
              <td>${new Date(uploaded_at).toLocaleDateString()}</td>
            </tr>`;
        });
      
        doctable.innerHTML = docTableHtml;
      }
});

// Add subject entry dynamically
function addSubjectEntry() {
    const subjectsContainer = document.querySelector('.subjects-container');
    const newEntry = document.querySelector('.subject-entry').cloneNode(true);

    const inputs = newEntry.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-entry';
    removeButton.innerHTML = '<i class="fas fa-trash"></i> Remove';
    removeButton.onclick = function () {
        this.parentElement.remove();
    };

    newEntry.appendChild(removeButton);
    subjectsContainer.appendChild(newEntry);
}


      
// Form submission
function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const jsonData = {};

    formData.forEach((value, key) => {
        if (jsonData[key]) {
            if (!Array.isArray(jsonData[key])) {
                jsonData[key] = [jsonData[key]];
            }
            jsonData[key].push(value);
        } else {
            jsonData[key] = value;
        }
    });

    console.log('Form Data:', jsonData);
    alert('Your application has been submitted successfully!');
    event.target.reset();
}

// Input validation
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

// File validation
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

// Validation helpers
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
