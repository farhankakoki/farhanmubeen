// Initialize Libraries
AOS.init({ duration: 1200, once: true, easing: 'ease-out-expo' });
lucide.createIcons();

// Global Selectors
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-pill');
const indicator = document.getElementById('nav-indicator');

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

    // Counter Animation
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                const duration = 2000;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOutExpo = 1 - Math.pow(2, -10 * progress);
                    const currentCount = Math.floor(easeOutExpo * target);
                    entry.target.innerText = currentCount;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                requestAnimationFrame(updateCount);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
});
