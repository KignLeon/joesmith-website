/**
 * Shared logic for handling form submissions and navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Navigation Highlighting Logic ---
    const currentPath = window.location.pathname;
    let normalizedPath = currentPath;
    if (normalizedPath.endsWith('index.html')) {
        normalizedPath = normalizedPath.replace('index.html', '');
    }
    if (!normalizedPath.endsWith('/') && normalizedPath !== '/') {
        normalizedPath += '/';
    }

    const cleanPath = normalizedPath.replace('//', '/');

    const inactiveClasses = ['text-slate-500', 'hover:text-navy', 'hover:bg-gray-50'];
    const activeClasses = ['text-navy', 'bg-navy/5'];

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        let linkPath = new URL(link.href).pathname;
        if (!linkPath.endsWith('/')) linkPath += '/';

        const isActive = (cleanPath === '/' && linkPath === '/') ||
            (linkPath !== '/' && cleanPath.includes(linkPath));

        if (isActive) {
            link.classList.remove(...inactiveClasses);
            link.classList.add(...activeClasses);
        } else {
            link.classList.remove(...activeClasses);
            link.classList.add(...inactiveClasses);
        }
    });

    // --- 2. Form Handling Logic (FormSubmit.co via AJAX) ---
    const forms = document.querySelectorAll('form');
    // YOUR FORMSUBMIT TOKEN
    const FORM_ENDPOINT = "https://formsubmit.co/ajax/d0c3aa9a8589f7452b449592aef75f90";

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop default reload/redirect

            // UI Elements
            let successMsg = form.querySelector('.success-message');
            let errorMsg = form.querySelector('.error-message');
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            // Create status messages if they don't exist in HTML
            if (!successMsg) {
                successMsg = document.createElement('div');
                successMsg.className = 'success-message hidden text-green-600 font-bold mt-4 text-center p-4 bg-green-50 rounded-xl border border-green-100';
                successMsg.innerText = 'Thank you! We’ll be in touch shortly.';
                form.appendChild(successMsg);
            }
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message hidden text-red-600 font-bold mt-4 text-center p-4 bg-red-50 rounded-xl border border-red-100';
                errorMsg.innerText = 'Something went wrong. Please try again.';
                form.appendChild(errorMsg);
            }

            // Reset UI State
            successMsg.classList.add('hidden');
            errorMsg.classList.add('hidden');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            // Gather Form Data
            const formData = new FormData(form);

            try {
                const response = await fetch(FORM_ENDPOINT, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    // Success
                    successMsg.classList.remove('hidden');
                    form.reset(); // Clear input fields
                } else {
                    // FormSubmit returned an error
                    console.error('Form error:', result);
                    errorMsg.innerText = result.message || 'Something went wrong. Please try again.';
                    errorMsg.classList.remove('hidden');
                }
            } catch (error) {
                // Network error
                console.error('Network error:', error);
                errorMsg.innerText = 'Network error. Please check your connection.';
                errorMsg.classList.remove('hidden');
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    });
});