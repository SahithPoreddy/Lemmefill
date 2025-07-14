(async () => {
    console.log('Content script started');
    try {
        const fastText = new window.FastText();
        console.log('FastText instantiated');
        await fastText.loadModel('model.bin');
        console.log('FastText model ready');

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Received message:', request);
            if (request.action === 'autofill') {
                (async () => {
                    try {
                        const result = await new Promise(resolve => chrome.storage.sync.get(['userData'], resolve));
                        const userData = result.userData || {};
                        console.log('User data retrieved:', userData);

                        const forms = document.querySelectorAll('form');
                        const inputs = Array.from(forms).flatMap(form => Array.from(form.querySelectorAll('input, textarea, select')));
                        console.log('Found inputs:', inputs.length);
                        const fieldData = inputs.map(input => ({
                            id: input.id || '',
                            name: input.name || '',
                            placeholder: input.placeholder || '',
                            label: input.labels && input.labels[0] ? input.labels[0].textContent.trim() : '',
                            type: input.type || 'text',
                            section: input.closest('section, div')?.querySelector('h1, h2, h3')?.textContent.trim().toLowerCase() || ''
                        }));

                        const autofillValues = await predictFieldValues(fieldData, userData, fastText);

                        inputs.forEach((input, index) => {
                            if (autofillValues[index]) {
                                input.value = autofillValues[index];
                                console.log(`Filled ${fieldData[index].label || fieldData[index].id}: ${autofillValues[index]}`);
                            }
                        });

                        sendResponse({ success: true, filledFields: autofillValues.filter(val => val !== '').length });
                    } catch (error) {
                        console.error('Autofill Error:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                })();
                return true; // Keep message channel open for async response
            }
        });
        console.log('Message listener registered');
    } catch (error) {
        console.error('Content script initialization failed:', error);
        chrome.runtime.sendMessage({ action: 'autofill_error', message: 'Failed to initialize content script: ' + error.message });
    }

    async function predictFieldValues(fields, userData, fastText) {
        const predictions = await Promise.all(fields.map(async field => {
            const text = `${field.label} ${field.name} ${field.placeholder} ${field.section}`.toLowerCase();
            if (!text.trim()) return '';

            let prediction;
            try {
                const results = await fastText.predict(text);
                prediction = results[0].label.replace('__label__', '');
                console.log(`Predicted ${text} -> ${prediction}`);
            } catch (error) {
                console.error('Prediction Error for field:', field, error);
                return '';
            }

            if (field.section.includes('education') || field.section.includes('school') || field.section.includes('academic')) {
                if (text.includes('school') || text.includes('secondary')) {
                    if (text.includes('name')) return userData.school?.name || '';
                    if (text.includes('year') || text.includes('graduation')) return userData.school?.year || '';
                    if (text.includes('cgpa') || text.includes('percentage') || text.includes('grade')) return userData.school?.grade || '';
                    if (text.includes('stream')) return userData.school?.stream || '';
                }
                if (text.includes('junior college') || text.includes('college')) {
                    if (text.includes('name')) return userData.junior_college?.name || '';
                    if (text.includes('start year')) return userData.junior_college?.start_year || '';
                    if (text.includes('end year')) return userData.junior_college?.end_year || '';
                    if (text.includes('cgpa') || text.includes('percentage') || text.includes('grade')) return userData.junior_college?.grade || '';
                    if (text.includes('stream')) return userData.junior_college?.stream || '';
                }
                if (text.includes('degree')) {
                    const degreeIndex = parseInt(text.match(/degree\s*(\d+)/i)?.[1] || '1') - 1;
                    if (degreeIndex >= 0 && degreeIndex < (userData.degrees?.length || 0)) {
                        if (text.includes('name') || text.includes('institution')) return userData.degrees[degreeIndex].name || '';
                        if (text.includes('start year')) return userData.degrees[degreeIndex].start_year || '';
                        if (text.includes('end year')) return userData.degrees[degreeIndex].end_year || '';
                        if (text.includes('cgpa') || text.includes('percentage') || text.includes('grade')) return userData.degrees[degreeIndex].grade || '';
                        if (text.includes('major')) return userData.degrees[degreeIndex].major || '';
                    }
                    return '';
                }
            }
            if (field.section.includes('work') || field.section.includes('employment') || field.section.includes('job')) {
                const jobIndex = parseInt(text.match(/(?:job|employment|work)\s*(\d+)/i)?.[1] || '1') - 1;
                if (jobIndex >= 0 && jobIndex < (userData.jobs?.length || 0)) {
                    if (text.includes('company')) return userData.jobs[jobIndex].company || '';
                    if (text.includes('role')) return userData.jobs[jobIndex].role || '';
                    if (text.includes('start date')) return userData.jobs[jobIndex].start_date || '';
                    if (text.includes('end date')) return userData.jobs[jobIndex].end_date || '';
                    if (text.includes('domain')) return userData.jobs[jobIndex].domain || '';
                }
                return '';
            }

            switch (prediction) {
                case 'first_name': return userData.first_name || '';
                case 'middle_name': return userData.middle_name || '';
                case 'last_name': return userData.last_name || '';
                case 'present_address': return userData.present_address || '';
                case 'permanent_address': return userData.permanent_address || '';
                case 'country': return userData.country || '';
                case 'state': return userData.state || '';
                case 'phone': return userData.phone || '';
                case 'gender': return userData.gender || '';
                case 'age': return userData.age || '';
                case 'school_name': return userData.school?.name || '';
                case 'school_year': return userData.school?.year || '';
                case 'school_grade': return userData.school?.grade || '';
                case 'school_stream': return userData.school?.stream || '';
                case 'junior_college_name': return userData.junior_college?.name || '';
                case 'junior_college_start_year': return userData.junior_college?.start_year || '';
                case 'junior_college_end_year': return userData.junior_college?.end_year || '';
                case 'junior_college_grade': return userData.junior_college?.grade || '';
                case 'junior_college_stream': return userData.junior_college?.stream || '';
                case 'degree1_name': return userData.degrees?.[0]?.name || '';
                case 'degree1_start_year': return userData.degrees?.[0]?.start_year || '';
                case 'degree1_end_year': return userData.degrees?.[0]?.end_year || '';
                case 'degree1_grade': return userData.degrees?.[0]?.grade || '';
                case 'degree1_major': return userData.degrees?.[0]?.major || '';
                case 'degree2_name': return userData.degrees?.[1]?.name || '';
                case 'degree2_start_year': return userData.degrees?.[1]?.start_year || '';
                case 'degree2_end_year': return userData.degrees?.[1]?.end_year || '';
                case 'degree2_grade': return userData.degrees?.[1]?.grade || '';
                case 'degree2_major': return userData.degrees?.[1]?.major || '';
                case 'job1_company': return userData.jobs?.[0]?.company || '';
                case 'job1_role': return userData.jobs?.[0]?.role || '';
                case 'job1_start_date': return userData.jobs?.[0]?.start_date || '';
                case 'job1_end_date': return userData.jobs?.[0]?.end_date || '';
                case 'job1_domain': return userData.jobs?.[0]?.domain || '';
                case 'job2_company': return userData.jobs?.[1]?.company || '';
                case 'job2_role': return userData.jobs?.[1]?.role || '';
                case 'job2_start_date': return userData.jobs?.[1]?.start_date || '';
                case 'job2_end_date': return userData.jobs?.[1]?.end_date || '';
                case 'job2_domain': return userData.jobs?.[1]?.domain || '';
                default: return '';
            }
        }));

        return predictions;
    }
})();