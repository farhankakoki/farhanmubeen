// Initialize Libraries
AOS.init({ duration: 1200, once: true, easing: 'ease-out-expo' });
lucide.createIcons();

// Global Selectors
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-pill');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const indicator = document.getElementById('nav-indicator');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const menuIcon = document.getElementById('menu-icon');

// Wobbly Path Collection
const landscapePaths = [
    "M12,4 Q50,2 180,6 Q340,3 388,8 Q394,50 392,140 Q395,230 390,276 Q300,282 200,280 Q80,284 10,278 Q4,200 6,140 Q3,60 12,4 Z",
    "M10,8 Q120,2 200,5 Q320,1 390,10 Q396,80 393,150 Q396,240 388,278 Q280,284 180,281 Q60,285 8,276 Q2,180 5,120 Q1,40 10,8 Z"
];
const squarePaths = [
    "M8,4 Q50,1 100,5 Q160,2 192,8 Q197,50 195,100 Q198,160 193,192 Q150,197 100,195 Q40,198 7,193 Q2,140 4,100 Q1,40 8,4 Z",
    "M10,6 Q60,1 110,7 Q165,3 190,12 Q196,55 194,105 Q197,170 191,190 Q145,196 95,194 Q35,197 9,190 Q3,145 6,98 Q2,42 10,6 Z"
];

// Initialize Wobbly Backgrounds
document.querySelectorAll('.wobbly-container').forEach((el, index) => {
    const variant = el.dataset.variant || 'landscape';
    const paths = variant === 'square' ? squarePaths : landscapePaths;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", variant === 'square' ? '0 0 200 200' : '0 0 400 286');
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("wobbly-svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[index % paths.length]);
    path.classList.add("wobbly-path");
    svg.appendChild(path);
    el.prepend(svg);
});

// Mobile Menu Logic
let isMenuOpen = false;
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    mobileMenu.classList.toggle('translate-x-full', !isMenuOpen);
    mobileMenu.classList.toggle('translate-x-0', isMenuOpen);

    // Change icon
    if (isMenuOpen) {
        menuIcon.setAttribute('data-lucide', 'x');
        document.body.style.overflow = 'hidden';

        // Staggered animation for links
        mobileNavLinks.forEach((link, i) => {
            setTimeout(() => {
                link.classList.remove('opacity-0', 'translate-y-4');
                link.classList.add('opacity-100', 'translate-y-0');
            }, 200 + (i * 100));
        });
    } else {
        menuIcon.setAttribute('data-lucide', 'menu');
        document.body.style.overflow = '';

        mobileNavLinks.forEach(link => {
            link.classList.add('opacity-0', 'translate-y-4');
            link.classList.remove('opacity-100', 'translate-y-0');
        });
    }
    lucide.createIcons();
}

mobileMenuToggle.addEventListener('click', toggleMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener('click', toggleMenu);

mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (isMenuOpen) toggleMenu();
    });
});

// Mobile touch animation support
document.querySelectorAll('.sticker-group').forEach(sticker => {
    let touchTimer;
    sticker.addEventListener('touchstart', () => {
        clearTimeout(touchTimer);
        sticker.classList.add('touching');
    }, { passive: true });
    sticker.addEventListener('touchend', () => {
        touchTimer = setTimeout(() => sticker.classList.remove('touching'), 800);
    }, { passive: true });
});

// Navigation Scroll Behavior
window.addEventListener('scroll', () => {
    const nav = document.getElementById('desktop-nav');
    const blurBg = document.getElementById('header-blur-bg');
    if (window.scrollY > 80) {
        nav.classList.remove('opacity-0', 'translate-y-[-10px]');
        blurBg.classList.remove('opacity-0');
    } else {
        nav.classList.add('opacity-0', 'translate-y-[-10px]');
        blurBg.classList.add('opacity-0');
    }
}, { passive: true });

// Move Pill Indicator
function moveIndicator(element) {
    if (!element || !indicator) return;
    const rect = element.getBoundingClientRect();
    const navRect = document.getElementById('desktop-nav').getBoundingClientRect();
    indicator.style.width = `${rect.width}px`;
    indicator.style.left = `${rect.left - navRect.left}px`;
    indicator.style.opacity = '1';
}

// Scroll-Spy
function updateActiveNav() {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;
    let activeSection = null;
    let minDist = Infinity;

    sections.forEach(section => {
        const top = section.getBoundingClientRect().top + scrollY;
        const bottom = top + section.offsetHeight;
        if (scrollY + viewportH * 0.35 >= top && scrollY < bottom) {
            const dist = Math.abs(section.getBoundingClientRect().top);
            if (dist < minDist) {
                minDist = dist;
                activeSection = section;
            }
        }
    });

    if (activeSection) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === activeSection.id) {
                link.classList.add('active');
                moveIndicator(link);
            }
        });
    }
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav, { passive: true });

// Load Events
window.addEventListener('load', () => {
    // Nav Indicator Initial Position
    const active = document.querySelector('.nav-pill.active');
    if (active) moveIndicator(active);
});

// ── Contact Form Handler (Web3Forms) ─────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('cf-submit');
        const btnText = document.getElementById('cf-btn-text');
        const iconContainer = document.getElementById('cf-btn-icon-container');
        const toast = document.getElementById('cf-toast');

        // Loading state
        btn.disabled = true;
        btnText.textContent = 'Sending…';
        iconContainer.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i>';
        lucide.createIcons();

        try {
            const formData = new FormData(contactForm);

            // Check if user still has placeholders
            if (formData.get('access_key') === 'YOUR_WEB3FORMS_KEY') {
                throw new Error('Its an internal error, Please mail us directly');
            }

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                toast.textContent = '✓ Message sent! I\'ll get back to you soon.';
                toast.className = 'text-[11px] font-bold text-center py-3 px-4 rounded-xl bg-green-50 text-green-700 border border-green-200 block mb-4 animate-in fade-in zoom-in duration-300';
                contactForm.reset();
                
                // Refresh to main root (Home) after 4 seconds
                setTimeout(() => {
                    window.location.href = window.location.origin + window.location.pathname;
                }, 4000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (err) {
            toast.textContent = '✕ ' + err.message;
            toast.className = 'text-[11px] font-bold text-center py-3 px-4 rounded-xl bg-red-50 text-red-600 border border-red-200 block mb-4 animate-in fade-in zoom-in duration-300';
        } finally {
            btn.disabled = false;
            btnText.textContent = 'Send Message';
            iconContainer.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>';
            lucide.createIcons();
            setTimeout(() => {
                toast.classList.add('opacity-0');
                setTimeout(() => toast.className = 'hidden', 500);
            }, 5000);
        }
    });
}

// ── Asset Protection ──────────────────────────────────────────────────────────

// Disable right-click context menu
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Disable image dragging (prevents drag-to-desktop save)
document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
    img.addEventListener('dragstart', (e) => e.preventDefault());
});

// Re-apply drag block on any dynamically added images
const imgObserver = new MutationObserver(() => {
    document.querySelectorAll('img:not([draggable="false"])').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
});
imgObserver.observe(document.body, { childList: true, subtree: true });

// Block keyboard shortcuts: Ctrl+S (save), Ctrl+U (view source), Ctrl+P (print)
document.addEventListener('keydown', (e) => {
    const blocked = (
        e.ctrlKey && ['s', 'u', 'p'].includes(e.key.toLowerCase())
    );
    if (blocked) e.preventDefault();
});
