document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    chrome.storage.sync.get(['userData'], (result) => {
        const userData = result.userData || {};
        document.getElementById('first_name').value = userData.first_name || '';
        document.getElementById('middle_name').value = userData.middle_name || '';
        document.getElementById('last_name').value = userData.last_name || '';
        document.getElementById('present_address').value = userData.present_address || '';
        document.getElementById('permanent_address').value = userData.permanent_address || '';
        document.getElementById('same_address').checked = userData.same_address || false;
        document.getElementById('country').value = userData.country || '';
        document.getElementById('state').value = userData.state || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('gender').value = userData.gender || '';
        document.getElementById('age').value = userData.age || '';
        document.getElementById('school_name').value = userData.school?.name || '';
        document.getElementById('school_year').value = userData.school?.year || '';
        document.getElementById('school_grade').value = userData.school?.grade || '';
        document.getElementById('school_stream').value = userData.school?.stream || '';
        document.getElementById('junior_college_name').value = userData.junior_college?.name || '';
        document.getElementById('junior_college_start_year').value = userData.junior_college?.start_year || '';
        document.getElementById('junior_college_end_year').value = userData.junior_college?.end_year || '';
        document.getElementById('junior_college_grade').value = userData.junior_college?.grade || '';
        document.getElementById('junior_college_stream').value = userData.junior_college?.stream || '';

        // Load degrees
        const degreesContainer = document.getElementById('degrees_container');
        (userData.degrees || []).forEach((degree, index) => {
            addDegree(degree, index);
        });

        // Load jobs
        const jobsContainer = document.getElementById('jobs_container');
        (userData.jobs || []).forEach((job, index) => {
            addJob(job, index);
        });
    });

    // Checkbox logic for permanent address
    document.getElementById('same_address').addEventListener('change', (event) => {
        const permanentAddress = document.getElementById('permanent_address');
        if (event.target.checked) {
            permanentAddress.value = document.getElementById('present_address').value;
            permanentAddress.disabled = true;
        } else {
            permanentAddress.disabled = false;
        }
    });

    // Handle present address changes when checkbox is checked
    document.getElementById('present_address').addEventListener('input', () => {
        if (document.getElementById('same_address').checked) {
            document.getElementById('permanent_address').value = document.getElementById('present_address').value;
        }
    });

    // Add degree fields
    window.addDegree = function (degree = {}, index = Date.now()) {
        const container = document.getElementById('degrees_container');
        const div = document.createElement('div');
        div.className = 'section degree';
        div.dataset.index = index;
        div.innerHTML = `
         <h3>Degree ${container.children.length + 1}</h3>
         <label for="degree_${index}_name">Institution Name:</label>
         <input type="text" id="degree_${index}_name" name="degree_${index}_name" value="${degree.name || ''}"><br>
         <label for="degree_${index}_start_year">Start Year:</label>
         <input type="number" id="degree_${index}_start_year" name="degree_${index}_start_year" value="${degree.start_year || ''}"><br>
         <label for="degree_${index}_end_year">End Year:</label>
         <input type="number" id="degree_${index}_end_year" name="degree_${index}_end_year" value="${degree.end_year || ''}"><br>
         <label for="degree_${index}_grade">CGPA/Percentage:</label>
         <input type="text" id="degree_${index}_grade" name="degree_${index}_grade" value="${degree.grade || ''}"><br>
         <label for="degree_${index}_major">Major:</label>
         <input type="text" id="degree_${index}_major" name="degree_${index}_major" value="${degree.major || ''}"><br>
         <button type="button" onclick="this.parentElement.remove()">Remove Degree</button>
       `;
        container.appendChild(div);
    };

    // Add job fields
    window.addJob = function (job = {}, index = Date.now()) {
        const container = document.getElementById('jobs_container');
        const div = document.createElement('div');
        div.className = 'section job';
        div.dataset.index = index;
        div.innerHTML = `
         <h3>Job ${container.children.length + 1}</h3>
         <label for="job_${index}_company">Company Name:</label>
         <input type="text" id="job_${index}_company" name="job_${index}_company" value="${job.company || ''}"><br>
         <label for="job_${index}_role">Job Role:</label>
         <input type="text" id="job_${index}_role" name="job_${index}_role" value="${job.role || ''}"><br>
         <label for="job_${index}_start_date">Start Date:</label>
         <input type="date" id="job_${index}_start_date" name="job_${index}_start_date" value="${job.start_date || ''}"><br>
         <label for="job_${index}_end_date">End Date:</label>
         <input type="date" id="job_${index}_end_date" name="job_${index}_end_date" value="${job.end_date || ''}"><br>
         <label for="job_${index}_domain">Domain:</label>
         <input type="text" id="job_${index}_domain" name="job_${index}_domain" value="${job.domain || ''}"><br>
         <button type="button" onclick="this.parentElement.remove()">Remove Job</button>
       `;
        container.appendChild(div);
    };

    // Form submission
    const form = document.getElementById('userDataForm');
    if (!form) {
        console.error('Form with ID "userDataForm" not found');
        document.getElementById('status').textContent = 'Error: Form not found';
        document.getElementById('status').style.color = 'red';
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            first_name: formData.get('first_name') || '',
            middle_name: formData.get('middle_name') || '',
            last_name: formData.get('last_name') || '',
            present_address: formData.get('present_address') || '',
            permanent_address: formData.get('permanent_address') || '',
            same_address: formData.get('same_address') === 'on',
            country: formData.get('country') || '',
            state: formData.get('state') || '',
            phone: formData.get('phone') || '',
            gender: formData.get('gender') || '',
            age: formData.get('age') || '',
            school: {
                name: formData.get('school_name') || '',
                year: formData.get('school_year') || '',
                grade: formData.get('school_grade') || '',
                stream: formData.get('school_stream') || ''
            },
            junior_college: {
                name: formData.get('junior_college_name') || '',
                start_year: formData.get('junior_college_start_year') || '',
                end_year: formData.get('junior_college_end_year') || '',
                grade: formData.get('junior_college_grade') || '',
                stream: formData.get('junior_college_stream') || ''
            },
            degrees: [],
            jobs: []
        };

        // Collect degrees
        document.querySelectorAll('.degree').forEach((div) => {
            const index = div.dataset.index;
            userData.degrees.push({
                name: formData.get(`degree_${index}_name`) || '',
                start_year: formData.get(`degree_${index}_start_year`) || '',
                end_year: formData.get(`degree_${index}_end_year`) || '',
                grade: formData.get(`degree_${index}_grade`) || '',
                major: formData.get(`degree_${index}_major`) || ''
            });
        });

        // Collect jobs
        document.querySelectorAll('.job').forEach((div) => {
            const index = div.dataset.index;
            userData.jobs.push({
                company: formData.get(`job_${index}_company`) || '',
                role: formData.get(`job_${index}_role`) || '',
                start_date: formData.get(`job_${index}_start_date`) || '',
                end_date: formData.get(`job_${index}_end_date`) || '',
                domain: formData.get(`job_${index}_domain`) || ''
            });
        });

        try {
            chrome.storage.sync.set({ userData }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Storage Error:', chrome.runtime.lastError);
                    document.getElementById('status').textContent = `Error: ${chrome.runtime.lastError.message}`;
                    document.getElementById('status').style.color = 'red';
                } else {
                    document.getElementById('status').textContent = 'Data saved successfully!';
                    document.getElementById('status').style.color = 'green';
                }
            });
        } catch (error) {
            console.error('Save Error:', error);
            document.getElementById('status').textContent = `Error: ${error.message}`;
            document.getElementById('status').style.color = 'red';
        }
    });
});