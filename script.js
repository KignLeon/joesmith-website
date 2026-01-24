/**
 * Shared logic for handling form submissions and navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Highlighting Logic
    const currentPath = window.location.pathname;
    const normalizedPath = currentPath.endsWith('/') && currentPath !== '/' ? currentPath : currentPath + '/';
    const cleanPath = normalizedPath.replace('index.html/', '').replace('//', '/');

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

    // 2. Form Handling Logic
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop default reload

            // Find feedback elements (create them if missing for robustness)
            let successMsg = form.querySelector('.success-message');
            let errorMsg = form.querySelector('.error-message');
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;

            if (!successMsg) {
                successMsg = document.createElement('div');
                successMsg.className = 'success-message hidden text-green-600 font-bold mt-4 text-center';
                successMsg.innerText = 'Thank you! We’ll be in touch shortly.';
                form.appendChild(successMsg);
            }
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message hidden text-red-600 font-bold mt-4 text-center';
                errorMsg.innerText = 'Something went wrong. Please try again.';
                form.appendChild(errorMsg);
            }

            // Reset state
            successMsg.classList.add('hidden');
            errorMsg.classList.add('hidden');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sending...';

            // Gather data
            const formData = new FormData(form);
            
            // Explicitly set the recipient for FormSubmit
            // We use the hidden input if present, or default
            
            try {
                const response = await fetch("https://formsubmit.co/ajax/hpcfmedia@gmail.com", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    successMsg.classList.remove('hidden');
                    form.reset(); // Clear form
                } else {
                    console.error('Form error:', result);
                    errorMsg.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Network error:', error);
                errorMsg.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    });
});