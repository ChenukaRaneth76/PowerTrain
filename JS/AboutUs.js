// ============================
// THROTTLE UTILITY FOR PERFORMANCE
// ============================
function throttle(func, wait) {
    let timeout = null;
    let previous = 0;
    return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(this, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(this, args);
            }, remaining);
        }
    };
}

// Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Counter animation
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
            });
        }

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    if (entry.target.classList.contains('vision-grid')) {
                        setTimeout(animateCounters, 500);
                    }
                }
            });
        }, observerOptions);

        // Observe vision items for animations
        document.addEventListener('DOMContentLoaded', () => {
            const visionItems = document.querySelectorAll('.vision-item');
            const visionGrid = document.querySelector('.vision-grid');
            
            if (visionGrid) {
                observer.observe(visionGrid);
            }
            
            visionItems.forEach(item => {
                observer.observe(item);
            });
        });

        // Enhanced hover effects
        document.querySelectorAll('.vision-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            });
        });


        // Observe all sections for animations
        document.addEventListener('DOMContentLoaded', () => {
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                section.classList.add('animate-on-scroll');
                observer.observe(section);
            });

            // Add floating animation to background elements
            const backgroundElements = document.querySelectorAll('.vision-bg, .why-bg');
            backgroundElements.forEach(element => {
                element.classList.add('floating-element');
            });

            // Add pulse animation to icons
            const icons = document.querySelectorAll('.why-item i, .crew-member i');
            icons.forEach(icon => {
                icon.classList.add('pulse');
            });
        });

        // Enhanced hover effects for cards
        document.querySelectorAll('.why-item, .crew-member, .vision-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                
                // Add ripple effect
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(220, 38, 38, 0.3)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                ripple.style.left = '50%';
                ripple.style.top = '50%';
                ripple.style.width = '100px';
                ripple.style.height = '100px';
                ripple.style.marginLeft = '-50px';
                ripple.style.marginTop = '-50px';
                ripple.style.pointerEvents = 'none';
                
                this.style.position = 'relative';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            });
        });

        // Parallax scrolling effect
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax-bg');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Interactive button effects
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Typing effect for hero text
        function typeWriter(element, text, speed = 100) {
            let i = 0;
            element.innerHTML = '';
            
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            
            type();
        }

        // Initialize typing effect on page load
        document.addEventListener('DOMContentLoaded', () => {
            const heroText = document.querySelector('.hero-quote h1:first-child');
            if (heroText) {
                const originalText = heroText.textContent;
                setTimeout(() => {
                    typeWriter(heroText, originalText, 150);
                }, 1000);
            }
        });

        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add CSS for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(220, 38, 38, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Scroll to top button (LEFT SIDE)
        (function initScrollToTop() {
            const scrollToTopBtn = document.createElement('button');
            scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            scrollToTopBtn.className = 'scroll-to-top';
            scrollToTopBtn.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 30px;
                width: 50px;
                height: 50px;
                background: #dc2626;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                transform: scale(0.8);
                transition: all 0.3s ease;
                z-index: 1000;
                font-size: 20px;
                box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
            `;
            
            document.body.appendChild(scrollToTopBtn);

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.style.opacity = '1';
                    scrollToTopBtn.style.transform = 'scale(1)';
                } else {
                    scrollToTopBtn.style.opacity = '0';
                    scrollToTopBtn.style.transform = 'scale(0.8)';
                }
            });
        })();

        // WhatsApp button (RIGHT SIDE)
        (function initWhatsAppButton() {
            const whatsappBtn = document.createElement('a');
            whatsappBtn.href = 'https://wa.me/94713293562';
            whatsappBtn.target = '_blank';
            whatsappBtn.rel = 'noopener noreferrer';
            whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
            whatsappBtn.title = 'Chat on WhatsApp';
            whatsappBtn.style.cssText = `position:fixed;bottom:30px;right:30px;width:60px;height:60px;background:#25D366;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer;z-index:1000;opacity:0;transform:scale(0.8);transition:all 0.3s;text-decoration:none;box-shadow:0 5px 15px rgba(37,211,102,0.3)`;
            document.body.appendChild(whatsappBtn);
            whatsappBtn.addEventListener('mouseenter', () => {
                whatsappBtn.style.transform = 'scale(1.1)';
                whatsappBtn.style.boxShadow = '0 8px 20px rgba(37,211,102,0.4)';
            });
            whatsappBtn.addEventListener('mouseleave', () => {
                whatsappBtn.style.transform = 'scale(1)';
                whatsappBtn.style.boxShadow = '0 5px 15px rgba(37,211,102,0.3)';
            });
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    whatsappBtn.style.opacity = '1';
                    whatsappBtn.style.transform = 'scale(1)';
                } else {
                    whatsappBtn.style.opacity = '0';
                    whatsappBtn.style.transform = 'scale(0.8)';
                }
            });
        })();

        // Vision Section Mobile Carousel
        (function initVisionMobileCarousel() {
            // Only initialize on mobile devices
            if (window.innerWidth > 768) return;
            
            const visionGrid = document.querySelector('.vision-grid');
            const visionItems = document.querySelectorAll('.vision-item');
            
            if (!visionGrid || visionItems.length === 0) return;
            
            // Create carousel wrapper
            const carouselWrapper = document.createElement('div');
            carouselWrapper.className = 'vision-carousel-wrapper';
            
            // Move all vision items into the wrapper
            visionItems.forEach(item => {
                carouselWrapper.appendChild(item.cloneNode(true));
            });
            
            // Clear original grid and add wrapper
            visionGrid.innerHTML = '';
            visionGrid.appendChild(carouselWrapper);
            
            // Create dots container
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'vision-carousel-dots';
            
            // Create dots
            visionItems.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'carousel-dot';
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            // Add dots after the vision grid
            visionGrid.parentNode.insertBefore(dotsContainer, visionGrid.nextSibling);
            
            let currentSlide = 0;
            let startX = 0;
            let isDragging = false;
            let currentTranslate = 0;
            let prevTranslate = 0;
            
            // Update slide position
            function updateSlidePosition() {
                carouselWrapper.style.transform = `translateX(${currentTranslate}px)`;
            }
            
            // Go to specific slide
            function goToSlide(slideIndex) {
                currentSlide = slideIndex;
                currentTranslate = -slideIndex * visionGrid.offsetWidth;
                prevTranslate = currentTranslate;
                updateSlidePosition();
                
                // Update dots
                document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                    dot.classList.toggle('active', index === slideIndex);
                });
            }
            
            // Touch events for swipe
            carouselWrapper.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                carouselWrapper.style.transition = 'none';
            });
            
            carouselWrapper.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                currentTranslate = prevTranslate + diff;
                updateSlidePosition();
            });
            
            carouselWrapper.addEventListener('touchend', (e) => {
                isDragging = false;
                carouselWrapper.style.transition = 'transform 0.4s ease';
                
                // Determine if we should change slides
                if (currentTranslate < -50 && currentSlide < visionItems.length - 1) {
                    goToSlide(currentSlide + 1);
                } else if (currentTranslate > 50 && currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                } else {
                    goToSlide(currentSlide);
                }
            });
            
            // Auto-play carousel
            setInterval(() => {
                if (!isDragging) {
                    currentSlide = (currentSlide + 1) % visionItems.length;
                    goToSlide(currentSlide);
                }
            }, 5000);
        })();

        // Crew Section Mobile Carousel
        (function initCrewMobileCarousel() {
            // Only initialize on mobile
            if (window.innerWidth > 768) return;
            
            const crewGrid = document.querySelector('.crew-grid');
            const crewMembers = document.querySelectorAll('.crew-member');
            
            if (!crewGrid || crewMembers.length === 0) return;
            
            // Create carousel wrapper
            const carouselWrapper = document.createElement('div');
            carouselWrapper.className = 'crew-carousel-wrapper';
            
            // Clone and move crew members
            crewMembers.forEach(member => {
                carouselWrapper.appendChild(member.cloneNode(true));
            });
            
            // Clear and restructure
            crewGrid.innerHTML = '';
            crewGrid.appendChild(carouselWrapper);
            
            // Create dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'crew-carousel-dots';
            
            crewMembers.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = 'crew-dot';
                if (index === 0) dot.classList.add('active');
                dotsContainer.appendChild(dot);
            });
            
            crewGrid.parentNode.insertBefore(dotsContainer, crewGrid.nextSibling);
            
            let currentSlide = 0;
            let startX = 0;
            let isDragging = false;
            
            function goToSlide(index) {
                currentSlide = index;
                carouselWrapper.style.transform = `translateX(-${index * 100}%)`;
                
                // Update dots
                document.querySelectorAll('.crew-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            }
            
            // Touch events
            carouselWrapper.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                carouselWrapper.style.transition = 'none';
            });
            
            carouselWrapper.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const currentX = e.touches[0].clientX;
                const diff = currentX - startX;
                const translateX = -currentSlide * 100 + (diff / crewGrid.offsetWidth) * 100;
                carouselWrapper.style.transform = `translateX(${translateX}%)`;
            });
            
            carouselWrapper.addEventListener('touchend', (e) => {
                isDragging = false;
                carouselWrapper.style.transition = 'transform 0.4s ease';
                const endX = e.changedTouches[0].clientX;
                const diff = endX - startX;
                
                if (diff < -50 && currentSlide < crewMembers.length - 1) {
                    goToSlide(currentSlide + 1);
                } else if (diff > 50 && currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                } else {
                    goToSlide(currentSlide);
                }
            });
            
            // Dot clicks
            document.querySelectorAll('.crew-dot').forEach((dot, index) => {
                dot.addEventListener('click', () => goToSlide(index));
            });
            
            // Auto-play
            setInterval(() => {
                if (!isDragging) {
                    currentSlide = (currentSlide + 1) % crewMembers.length;
                    goToSlide(currentSlide);
                }
            }, 4000);
        })();

        // Login modal toggle
        (function initLoginModal(){
            const userIcon = document.querySelector('.nav-icons .fa-user');
            const modal = document.getElementById('loginModal');
            const closeBtn = modal ? modal.querySelector('.login-close') : null;
            const content = modal ? modal.querySelector('.login-modal-content') : null;

            if (!userIcon || !modal) { return; }

            function openModal(){ modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
            function closeModal(){ modal.style.display = 'none'; document.body.style.overflow = ''; }

            userIcon.addEventListener('click', openModal);
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            if (content) content.addEventListener('click', (e) => e.stopPropagation());

            const form = document.getElementById('loginForm');
            if (form) {
                form.addEventListener('submit', function(e){
                    e.preventDefault();
                    closeModal();
                });
            }
        })();