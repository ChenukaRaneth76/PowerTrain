// JS/contact.js
// Handles scroll reveal animations, client-side validation, toast & submit simulation.

document.addEventListener('DOMContentLoaded', function () {
  // Insert current year in footer
  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  // IntersectionObserver for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // Toast helper
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message, timeout = 3200) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, timeout);
  }

  // Basic field validators
  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  const form = document.getElementById('contactForm');
  const statusNode = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.form-row').forEach(row => row.classList.remove('invalid'));
      statusNode.textContent = '';

      // Collect fields
      const name = form.querySelector('#fullName');
      const email = form.querySelector('#email');
      const subject = form.querySelector('#subject');
      const message = form.querySelector('#message');

      let valid = true;

      // Name
      if (!name.value.trim()) {
        markError(name, 'Please enter your name');
        valid = false;
      }

      // Email
      if (!email.value.trim() || !isEmail(email.value.trim())) {
        markError(email, 'Enter a valid email address');
        valid = false;
      }

      // Subject
      if (!subject.value.trim()) {
        markError(subject, 'Add a subject');
        valid = false;
      }

      // Message
      if (!message.value.trim() || message.value.trim().length < 10) {
        markError(message, 'Message must be at least 10 characters');
        valid = false;
      }

      if (!valid) {
        // subtle shake animation
        form.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(0)' }
        ], { duration: 360, iterations: 1, easing: 'cubic-bezier(.2,.9,.2,1)' });
        showToast('Please fix the highlighted fields');
        return;
      }

      // Simulate sending (replace this with actual fetch to your backend)
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // small simulated delay
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';

        // reset form
        form.reset();

        // show inline success + toast
        statusNode.textContent = 'Message sent successfully! We will reply to your email shortly.';
        statusNode.style.color = 'var(--accent)';
        showToast('Message sent — we will get back to you soon!');

        // fade status text in/out
        statusNode.animate([
          { opacity: 0, transform: 'translateY(-6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 350, easing: 'cubic-bezier(.2,.9,.2,1)' });

      }, 900);

    }); // end submit handler
  } // end if form

  // Mark an input as invalid with animation and message
  function markError(el, message) {
    const row = el.closest('.form-row');
    if (!row) return;
    row.classList.add('invalid');
    const err = row.querySelector('.error-msg');
    if (err) err.textContent = message;
    // focus first invalid
    setTimeout(() => el.focus(), 80);
  }

  // Remove inline error when user types
  document.querySelectorAll('.form-row input, .form-row textarea').forEach(input => {
    input.addEventListener('input', function () {
      const row = input.closest('.form-row');
      if (row && row.classList.contains('invalid')) {
        row.classList.remove('invalid');
        const err = row.querySelector('.error-msg');
        if (err) err.textContent = '';
      }
    });
  });

});
