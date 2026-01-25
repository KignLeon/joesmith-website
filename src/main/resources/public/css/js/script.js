/**
 * Shared logic for handling form submissions and navigation
 * REFACTORED: Enforcing pure AJAX submission to eliminate page redirects.
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

    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        if (!link.getAttribute('href') || link.getAttribute('href').startsWith('#') || link.getAttribute('href').startsWith('http')) return;

        let linkPath;
        try {
            linkPath = new URL(link.href).pathname;
        } catch (e) {
            linkPath = link.getAttribute('href');
        }

        if (!linkPath.endsWith('/')) linkPath += '/';

        // Simple check: is this the current page?
        const isActive = (cleanPath === '/' && linkPath === '/') ||
            (linkPath !== '/' && cleanPath.includes(linkPath));

        // Use existing classes for active state if matches (handled by HTML structure mostly, but we can enhance if needed)
    });

    // --- 2. Form Handling Logic (FormSubmit.co via AJAX) ---
    const forms = document.querySelectorAll('form');

    // YOUR FORMSUBMIT TOKEN - "Source of Truth" for destination
    const FORM_ENDPOINT = "https://formsubmit.co/ajax/d0c3aa9a8589f7452b449592aef75f90";

    console.log(`[FormHandler] Found ${forms.length} forms to attach AJAX listeners to.`);

    forms.forEach(form => {
        // Remove action/method if present just in case HTML still has them (defence in depth)
        form.removeAttribute('action');
        form.removeAttribute('method');

        form.addEventListener('submit', async (e) => {
            // CRITICAL: Stop the browser from submitting the form normally (No Redirect)
            e.preventDefault();
            console.log("[FormHandler] Form submission intercepted via JS.");

            // UI Elements
            let successMsg = form.querySelector('.success-message');
            let errorMsg = form.querySelector('.error-message');
            const submitBtn = form.querySelector('button[type="submit"]');

            if (!submitBtn) {
                console.error("No submit button found in form");
                return;
            }

            const originalBtnText = submitBtn.innerText;

            // Create status messages if they don't exist in HTML
            if (!successMsg) {
                successMsg = document.createElement('div');
                successMsg.className = 'success-message hidden text-green-600 font-bold mt-4 text-center p-4 bg-green-50 rounded-xl border border-green-100';
                successMsg.innerText = 'Thank you! We’ll be in touch shortly.';
                // Append after the button implies "inline" at the bottom of form
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
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

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
                    console.log("[FormHandler] Success:", result);
                    successMsg.classList.remove('hidden');
                    form.reset(); // Clear input fields

                    // Optional: Hide success message after 10 seconds
                    setTimeout(() => {
                        successMsg.classList.add('hidden');
                    }, 10000);
                } else {
                    // FormSubmit returned an error
                    console.error('[FormHandler] Form error:', result);
                    errorMsg.innerText = result.message || 'Something went wrong. Please try again.';
                    errorMsg.classList.remove('hidden');
                }
            } catch (error) {
                // Network error
                console.error('[FormHandler] Network error:', error);
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
