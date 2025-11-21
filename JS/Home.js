// ============================
// HOME.JS - Calisthenics.Co
// Complete Interactivity Script
// ============================

(function() {
    'use strict';

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

    // ============================
    // 1. PRODUCT TABS FUNCTIONALITY
    // ============================
    function initProductTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const productCards = document.querySelectorAll('.product-card');
        
        // Create and position the animated underline
        const tabsContainer = document.querySelector('.product-tabs');
        if (!tabsContainer) return;

        const underline = document.createElement('div');
        underline.className = 'tab-underline';
        underline.style.cssText = `
            position: absolute;
            bottom: 0;
            height: 3px;
            background: #dc2626;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
        `;
        tabsContainer.style.position = 'relative';
        tabsContainer.appendChild(underline);

        // Function to update underline position
        function updateUnderline(button) {
            const rect = button.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();
            const left = rect.left - containerRect.left;
            const width = rect.width;
            
            underline.style.width = width + 'px';
            underline.style.left = left + 'px';
        }

        // Initialize underline position
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            updateUnderline(activeTab);
        }

        // Handle tab hover animation
        tabButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                updateUnderline(button);
            });
        });

        // Return underline to active tab when mouse leaves
        tabsContainer.addEventListener('mouseleave', () => {
            const activeBtn = document.querySelector('.tab-btn.active');
            if (activeBtn) {
                updateUnderline(activeBtn);
            }
        });

        // Handle tab click and product filtering
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetCategory = button.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateUnderline(button);

                // Filter products with smooth animation
                productCards.forEach((card, index) => {
                    const cardCategory = card.dataset.category;
                    
                    if (cardCategory === targetCategory) {
                        // Show matching products
                        setTimeout(() => {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '0';
                                card.style.transform = 'translateY(20px)';
                                
                                requestAnimationFrame(() => {
                                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                    card.style.opacity = '1';
                                    card.style.transform = 'translateY(0)';
                                });
                            }, 10);
                        }, index * 50);
                    } else {
                        // Hide non-matching products
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(-20px)';
                        
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });

        // Update underline position on window resize (throttled)
        window.addEventListener('resize', throttle(() => {
            const activeBtn = document.querySelector('.tab-btn.active');
            if (activeBtn) {
                updateUnderline(activeBtn);
            }
        }, 150));
        
        // Initialize products display - show only equipment by default
        const defaultCategory = 'equipment';
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (cardCategory === defaultCategory) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        });
    }

    // ============================
    // 2. TESTIMONIALS SLIDESHOW
    // ============================
    function initTestimonialsSlideshow() {
        const slides = document.querySelectorAll('.testimonials-slide');
        const dots = document.querySelectorAll('.testimonial-dots .dot');
        let currentSlide = 0;

        if (slides.length === 0 || dots.length === 0) return;

        // Function to show specific slide
        function showSlide(index) {
            // Hide all slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.style.display = 'block';
                    // Force reflow for animation
                    setTimeout(() => {
                        slide.classList.add('active');
                    }, 10);
                } else {
                    slide.classList.remove('active');
                    setTimeout(() => {
                        if (!slide.classList.contains('active')) {
                            slide.style.display = 'none';
                        }
                    }, 600);
                }
            });

            // Update active dot
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('active');
                    dot.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        dot.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    dot.classList.remove('active');
                }
            });

            currentSlide = index;
        }

        // Handle dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (currentSlide !== index) {
                    showSlide(index);
                }
            });

            // Add hover effect
            dot.addEventListener('mouseenter', () => {
                dot.style.transform = 'scale(1.3)';
                dot.style.transition = 'transform 0.2s ease';
            });

            dot.addEventListener('mouseleave', () => {
                if (index !== currentSlide) {
                    dot.style.transform = 'scale(1)';
                }
            });
        });

        // Initialize first slide
        showSlide(0);

        // Optional: Auto-slide every 5 seconds
        let autoSlideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);

        // Pause auto-slide on hover
        const testimonialsSection = document.querySelector('.testimonials');
        if (testimonialsSection) {
            testimonialsSection.addEventListener('mouseenter', () => {
                clearInterval(autoSlideInterval);
            });

            testimonialsSection.addEventListener('mouseleave', () => {
                autoSlideInterval = setInterval(() => {
                    currentSlide = (currentSlide + 1) % slides.length;
                    showSlide(currentSlide);
                }, 5000);
            });
        }
    }

    // ============================
    // 3. CONTACT IMAGE ALIGNMENT
    // ============================
    function initContactImageAlignment() {
        const contactContent = document.querySelector('.contact-content');
        const contactImage = document.querySelector('.contact-figure');
        
        if (!contactContent || !contactImage) return;

        // Ensure proper layout structure
        contactContent.style.display = 'grid';
        contactContent.style.gridTemplateColumns = '1fr 1fr';
        contactContent.style.gap = '4rem';
        contactContent.style.alignItems = 'center';

        // Make image responsive while maintaining aspect ratio
        const contactImageWrapper = contactImage.parentElement;
        if (contactImageWrapper) {
            contactImageWrapper.style.display = 'flex';
            contactImageWrapper.style.justifyContent = 'center';
            contactImageWrapper.style.alignItems = 'center';
            contactImageWrapper.style.overflow = 'hidden';
        }

        contactImage.style.maxWidth = '100%';
        contactImage.style.height = 'auto';
        contactImage.style.objectFit = 'contain';
        
        // Add smooth scale effect on hover
        contactImage.addEventListener('mouseenter', () => {
            contactImage.style.transition = 'transform 0.4s ease';
            contactImage.style.transform = 'scale(1.05)';
        });

        contactImage.addEventListener('mouseleave', () => {
            contactImage.style.transform = 'scale(1)';
        });
    }

    // ============================
    // 4. MOBILE MENU TOGGLE
    // ============================
    function initMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    // ============================
    // 5. SMOOTH SCROLLING
    // ============================
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ============================
    // 6. SCROLL ANIMATIONS
    // ============================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    // ============================
    // 7. HERO PARALLAX EFFECT (OPTIMIZED)
    // ============================
    function initHeroParallax() {
        // Disable parallax on mobile to prevent transform conflicts
        if (window.innerWidth <= 768) return;
        
        const heroCircle = document.querySelector('.hero-circle');
        const heroPhoto = document.querySelector('.hero-photo');
        
        if (!heroCircle && !heroPhoto) return;
        
        const handleScroll = throttle(() => {
            // Only apply parallax on desktop
            if (window.innerWidth > 768) {
                const scrolled = window.pageYOffset;
                
                if (scrolled < window.innerHeight) {
                    requestAnimationFrame(() => {
                        if (heroCircle) heroCircle.style.transform = `scale(${1 + scrolled * 0.0005})`;
                        if (heroPhoto) heroPhoto.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.3}px)`;
                    });
                }
            }
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ============================
    // 8. SCROLL PROGRESS INDICATOR (OPTIMIZED)
    // ============================
    function initScrollProgress() {
        let progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: #dc2626;
            z-index: 1001;
            will-change: width;
        `;
        document.body.appendChild(progressBar);

        const updateScrollProgress = throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            requestAnimationFrame(() => {
                progressBar.style.width = scrollPercent + '%';
            });
        }, 100);

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
    }

    // ============================
    // 9. SCROLL TO TOP BUTTON (LEFT SIDE)
    // ============================
    function initScrollToTop() {
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
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
        `;
        
        document.body.appendChild(scrollToTopBtn);

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        const handleScrollVisibility = throttle(() => {
            const shouldShow = window.pageYOffset > 300;
            requestAnimationFrame(() => {
                scrollToTopBtn.style.opacity = shouldShow ? '1' : '0';
                scrollToTopBtn.style.transform = shouldShow ? 'scale(1)' : 'scale(0.8)';
            });
        }, 100);
        window.addEventListener('scroll', handleScrollVisibility, { passive: true });
    }

    // ============================
    // 10. WHATSAPP BUTTON (RIGHT SIDE)
    // ============================
    function initWhatsAppButton() {
        const whatsappBtn = document.createElement('a');
        whatsappBtn.href = 'https://wa.me/94713293562'; // Replace with your WhatsApp number
        whatsappBtn.target = '_blank';
        whatsappBtn.rel = 'noopener noreferrer';
        whatsappBtn.className = 'whatsapp-button';
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
        whatsappBtn.title = 'Chat on WhatsApp';
        whatsappBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: #25D366;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.3s ease;
            text-decoration: none;
            box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
        `;
        
        document.body.appendChild(whatsappBtn);

        // Hover effect
        whatsappBtn.addEventListener('mouseenter', () => {
            whatsappBtn.style.transform = 'scale(1.1)';
            whatsappBtn.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.4)';
        });
        
        whatsappBtn.addEventListener('mouseleave', () => {
            whatsappBtn.style.transform = 'scale(1)';
            whatsappBtn.style.boxShadow = '0 5px 15px rgba(37, 211, 102, 0.3)';
        });

        // Show/hide on scroll (throttled)
        const handleWhatsAppVisibility = throttle(() => {
            const shouldShow = window.pageYOffset > 300;
            requestAnimationFrame(() => {
                whatsappBtn.style.opacity = shouldShow ? '1' : '0';
                whatsappBtn.style.transform = shouldShow ? 'scale(1)' : 'scale(0.8)';
            });
        }, 100);
        window.addEventListener('scroll', handleWhatsAppVisibility, { passive: true });
    }

    // ============================
    // 10. LOGIN MODAL
    // ============================
    function initLoginModal() {
        const userIcon = document.querySelector('.nav-icons .fa-user');
        const modal = document.getElementById('loginModal');
        const closeBtn = modal ? modal.querySelector('.login-close') : null;
        const content = modal ? modal.querySelector('.login-modal-content') : null;

        if (!userIcon || !modal) return;

        function openModal() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (content) {
                    content.style.transform = 'scale(1)';
                    content.style.opacity = '1';
                }
            }, 10);
        }

        function closeModal() {
            if (content) {
                content.style.transform = 'scale(0.9)';
                content.style.opacity = '0';
            }
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }

        // Add initial styles for animation
        if (content) {
            content.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            content.style.transform = 'scale(0.9)';
            content.style.opacity = '0';
        }

        userIcon.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        if (content) content.addEventListener('click', (e) => e.stopPropagation());

        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Login functionality would be implemented here!');
                closeModal();
            });
        }
    }

    // ============================
    // 11. PRODUCT CARD HOVER EFFECTS
    // ============================
    function initProductCardEffects() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
                card.style.transform = 'translateY(-15px) scale(1.03)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    // ============================
    // 12. LOADING ANIMATION
    // ============================
    function initLoadingAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }

    // ============================
    // 17. IMAGE LAZY LOADING
    // ============================
    function initImageLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
            });
        }
    }

    // ============================
    // 13. VISION SECTION MOBILE CAROUSEL
    // ============================
    function initVisionMobileCarousel() {
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
            currentTranslate = prevTranslate + diff;
            updateSlidePosition();
        });
        
        carouselWrapper.addEventListener('touchend', (e) => {
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            carouselWrapper.style.transition = 'transform 0.4s ease';
            
            // Determine if we should change slides
            if (movedBy < -50 && currentSlide < visionItems.length - 1) {
                goToSlide(currentSlide + 1);
            } else if (movedBy > 50 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide);
            }
        });
        
        // Mouse events for desktop testing
        carouselWrapper.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            carouselWrapper.style.transition = 'none';
            carouselWrapper.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        carouselWrapper.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.clientX;
            const diff = currentX - startX;
            currentTranslate = prevTranslate + diff;
            updateSlidePosition();
        });
        
        carouselWrapper.addEventListener('mouseup', () => {
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            carouselWrapper.style.transition = 'transform 0.4s ease';
            carouselWrapper.style.cursor = 'grab';
            
            if (movedBy < -50 && currentSlide < visionItems.length - 1) {
                goToSlide(currentSlide + 1);
            } else if (movedBy > 50 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide);
            }
        });
        
        carouselWrapper.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                carouselWrapper.style.transition = 'transform 0.4s ease';
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
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                // Reset to desktop layout
                location.reload();
            } else {
                goToSlide(currentSlide);
            }
        });
    }

    // ============================
    // 14. TESTIMONIALS MOBILE CAROUSEL
    // ============================
    function initTestimonialsMobileCarousel() {
        // Only initialize on mobile
        if (window.innerWidth > 768) return;
        
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        const slides = document.querySelectorAll('.testimonials-slide');
        const dots = document.querySelectorAll('.testimonial-dots .dot');
        
        if (!testimonialsSlider || slides.length === 0) return;
        
        let currentSlide = 0;
        let startX = 0;
        let isDragging = false;
        let currentTranslate = 0;
        let prevTranslate = 0;
        
        // Setup carousel wrapper
        testimonialsSlider.style.display = 'flex';
        testimonialsSlider.style.transition = 'transform 0.4s ease';
        
        slides.forEach(slide => {
            slide.style.minWidth = '100%';
            slide.style.opacity = '1';
            slide.style.transform = 'none';
            slide.style.position = 'relative';
        });
        
        function goToSlide(index) {
            currentSlide = index;
            currentTranslate = -index * testimonialsSlider.offsetWidth;
            prevTranslate = currentTranslate;
            testimonialsSlider.style.transform = `translateX(${currentTranslate}px)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }
        
        // Touch events
        testimonialsSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            testimonialsSlider.style.transition = 'none';
        });
        
        testimonialsSlider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            currentTranslate = prevTranslate + diff;
            testimonialsSlider.style.transform = `translateX(${currentTranslate}px)`;
        });
        
        testimonialsSlider.addEventListener('touchend', () => {
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            testimonialsSlider.style.transition = 'transform 0.4s ease';
            
            if (movedBy < -50 && currentSlide < slides.length - 1) {
                goToSlide(currentSlide + 1);
            } else if (movedBy > 50 && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            } else {
                goToSlide(currentSlide);
            }
        });
        
        // Dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Initialize first slide
        goToSlide(0);
    }

    // ============================
    // 15. CREW SECTION MOBILE CAROUSEL
    // ============================
    function initCrewMobileCarousel() {
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
    }

    // ============================
    // INITIALIZE ALL FEATURES
    // ============================
    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAll);
        } else {
            initializeAll();
        }
    }

    function initializeAll() {
        initProductTabs();
        initTestimonialsSlideshow();
        initContactImageAlignment();
        initMobileMenu();
        initSmoothScrolling();
        initScrollToTop();
        initWhatsAppButton();
        initHeroParallax();
        initScrollProgress();
        initLoginModal();
        initProductCardEffects();
        initLoadingAnimation();
        initImageLazyLoading();
        initVisionMobileCarousel();
        initTestimonialsMobileCarousel();
        initCrewMobileCarousel();

        console.log(' Calisthenics.Co - All interactions initialized successfully!');
    }

    // Start initialization
    init();

})();
const authModal = document.getElementById("authModal");
const openAuth = document.getElementById("openAuth");
const closeAuth = document.querySelector(".auth-close");

openAuth.onclick = () => authModal.classList.add("show");
closeAuth.onclick = () => authModal.classList.remove("show");

// tab switching
document.getElementById("loginTab").onclick = () => {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("signupForm").classList.remove("active");
};

document.getElementById("signupTab").onclick = () => {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("signupForm").classList.add("active");
};

// login
document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  let email = loginEmail.value;
  let password = loginPassword.value;

  let res = await fetch("./backend/login.php", {
    method: "POST",
    body: new FormData(loginForm)
  });

  let data = await res.json();
  if (data.status === "success") {
    // Check if admin login
    if (data.role === "admin") {
      localStorage.setItem("auth", JSON.stringify({
        username: data.username,
        email: data.email,
        role: "admin"
      }));
      // Redirect to admin panel
      window.location.href = "admin.html";
      return;
    }
    
    // Regular user login
    // Persist full auth payload so UI can render avatar and username
    localStorage.setItem("auth", JSON.stringify({
      username: data.username,
      email: data.email,
      role: "user",
      gender: data.gender || null,
      profile_image: data.profile_image || null
    }));
    // Close modal and render authenticated UI
    authModal.classList.remove("show");
    renderAuthUI();
  } else {
    loginMsg.innerHTML = "Invalid Login";
  }
};

// signup
document.getElementById("signupForm").onsubmit = async (e) => {
  e.preventDefault();

  if (signupPassword.value !== signupConfirm.value) {
    signupMsg.innerHTML = "Passwords do not match";
    return;
  }

  let res = await fetch("./backend/signup.php", {
    method: "POST",
    body: new FormData(signupForm)
  });

  let text = await res.text();
  signupMsg.innerHTML = text === "success" ? "Account Created ✅" : text;
};

// ============================
// AUTH UI RENDERING & ACTIONS
// ============================
(function () {
  function getAuth() {
    try { return JSON.parse(localStorage.getItem("auth") || "null"); } catch (_) { return null; }
  }

  function getAvatarSrc(auth) {
    if (auth && auth.profile_image) {
      return `uploads/profile/${auth.profile_image}`;
    }
    const g = (auth && auth.gender ? String(auth.gender) : "").toLowerCase();
    if (g === "female" || g === "girl" || g === "f" || g === "woman" || g === "women") {
      return "IMG/default_girl.png";
    }
    return "IMG/default_boy.png";
  }

  async function uploadProfileImage(username, file) {
    const fd = new FormData();
    fd.append("username", username);
    fd.append("profileImage", file);
    const res = await fetch("./backend/upload_profile.php", { method: "POST", body: fd });
    return res.json();
  }

  window.renderAuthUI = function renderAuthUI() {
    const navIcons = document.querySelector('.nav-icons');
    const userIcon = document.getElementById('openAuth');
    if (!navIcons || !userIcon) return;

    const auth = getAuth();
    // Cleanup existing user menu if re-rendering
    const existing = document.querySelector('.user-menu');
    if (existing) existing.remove();

    if (!auth) {
      // Not logged in: show login icon
      userIcon.style.display = '';
      return;
    }

    // Logged in: hide login icon and render avatar + username dropdown
    userIcon.style.display = 'none';

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.style.position = 'relative';
    menu.style.display = 'flex';
    menu.style.alignItems = 'center';
    menu.style.gap = '8px';
    menu.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.alt = 'avatar';
    img.src = getAvatarSrc(auth);
    img.style.width = '32px';
    img.style.height = '32px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.border = '2px solid #eee';

    const name = document.createElement('span');
    name.textContent = auth.username || 'User';
    name.style.fontWeight = '600';
    name.style.fontSize = '0.95rem';

    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '110%';
    dropdown.style.right = '0';
    dropdown.style.minWidth = '180px';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #e5e7eb';
    dropdown.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
    dropdown.style.borderRadius = '10px';
    dropdown.style.padding = '8px';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '1002';

    // My Cart link
    const cartBtn = document.createElement('a');
    cartBtn.href = 'cart.html';
    cartBtn.textContent = '🛒 My Cart';
    cartBtn.style.display = 'block';
    cartBtn.style.width = '100%';
    cartBtn.style.padding = '10px 12px';
    cartBtn.style.border = 'none';
    cartBtn.style.background = 'transparent';
    cartBtn.style.textAlign = 'left';
    cartBtn.style.borderRadius = '8px';
    cartBtn.style.textDecoration = 'none';
    cartBtn.style.color = 'inherit';
    cartBtn.onmouseenter = () => cartBtn.style.background = '#f3f4f6';
    cartBtn.onmouseleave = () => cartBtn.style.background = 'transparent';

    // My Orders link
    const ordersBtn = document.createElement('a');
    ordersBtn.href = 'my-orders.html';
    ordersBtn.textContent = '📦 My Orders';
    ordersBtn.style.display = 'block';
    ordersBtn.style.width = '100%';
    ordersBtn.style.padding = '10px 12px';
    ordersBtn.style.border = 'none';
    ordersBtn.style.background = 'transparent';
    ordersBtn.style.textAlign = 'left';
    ordersBtn.style.borderRadius = '8px';
    ordersBtn.style.textDecoration = 'none';
    ordersBtn.style.color = 'inherit';
    ordersBtn.onmouseenter = () => ordersBtn.style.background = '#f3f4f6';
    ordersBtn.onmouseleave = () => ordersBtn.style.background = 'transparent';

    // Divider
    const divider = document.createElement('div');
    divider.style.height = '1px';
    divider.style.background = '#e5e7eb';
    divider.style.margin = '8px 0';

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = '📷 Update Image';
    uploadBtn.style.width = '100%';
    uploadBtn.style.padding = '10px 12px';
    uploadBtn.style.border = 'none';
    uploadBtn.style.background = 'transparent';
    uploadBtn.style.textAlign = 'left';
    uploadBtn.style.borderRadius = '8px';
    uploadBtn.onmouseenter = () => uploadBtn.style.background = '#f3f4f6';
    uploadBtn.onmouseleave = () => uploadBtn.style.background = 'transparent';

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.width = '100%';
    logoutBtn.style.padding = '10px 12px';
    logoutBtn.style.border = 'none';
    logoutBtn.style.background = 'transparent';
    logoutBtn.style.textAlign = 'left';
    logoutBtn.style.borderRadius = '8px';
    logoutBtn.onmouseenter = () => logoutBtn.style.background = '#fef2f2';
    logoutBtn.onmouseleave = () => logoutBtn.style.background = 'transparent';
    logoutBtn.style.color = '#b91c1c';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      if (!fileInput.files || !fileInput.files[0]) return;
      const file = fileInput.files[0];
      const result = await uploadProfileImage(auth.username, file);
      if (result && result.status === 'success' && result.filename) {
        // Update local storage and UI
        const next = { ...auth, profile_image: result.filename };
        localStorage.setItem('auth', JSON.stringify(next));
        img.src = getAvatarSrc(next);
        dropdown.style.display = 'none';
      } else {
        alert('Failed to upload image');
      }
      // reset file input
      fileInput.value = '';
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('auth');
      localStorage.removeItem('user'); // cleanup older key if used elsewhere
      location.reload();
    });

    dropdown.appendChild(cartBtn);
    dropdown.appendChild(ordersBtn);
    dropdown.appendChild(divider);
    dropdown.appendChild(uploadBtn);
    dropdown.appendChild(fileInput);
    dropdown.appendChild(logoutBtn);

    menu.appendChild(img);
    menu.appendChild(name);
    menu.appendChild(dropdown);

    // Toggle dropdown on avatar/name click
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', () => { dropdown.style.display = 'none'; });

    const cartIcon = navIcons.querySelector('.fa-shopping-cart');
    if (cartIcon && cartIcon.parentElement === navIcons) {
      navIcons.insertBefore(menu, cartIcon);
    } else {
      navIcons.appendChild(menu);
    }
  };

  // Render on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.renderAuthUI());
  } else {
    window.renderAuthUI();
  }
})();
