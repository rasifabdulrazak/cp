/* 
   C-Portals | Interactions & Animations 
   Three.js + GSAP + Transitions 
*/

document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    initSmoothImageLoading();
    initThreeJS();
    initGSAP();
    initUI();
});

/* =========================================
   Page Transitions
   ========================================= */
function initPageTransitions() {
    // Reveal body on load
    // Use setTimeout to ensure the transition happens after paint
    setTimeout(() => {
        document.body.classList.add('fade-in');
    }, 50);

    // Handle back/forward cache (bfcache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.body.classList.add('fade-in');
        }
    });

    // Intercept clicks
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Allow internal page navigation to be intercepted
            // Ignore anchors, target blank, or mailto/tel
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && link.target !== '_blank') {
                e.preventDefault();
                document.body.classList.remove('fade-in'); // Fade out

                setTimeout(() => {
                    window.location.href = href;
                }, 400); // Match CSS transition duration
            }
        });
    });
}

/* =========================================
   Smooth Image Loading
   ========================================= */
function initSmoothImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        }
    });
}

/* =========================================
   UI Interactivity
   ========================================= */
function initUI() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Stats Counter Animation
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(statsSection);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const increment = target / (duration / 16);

        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        updateCounter();
    });
}

/* =========================================
   GSAP Animations
   ========================================= */
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Text Stagger
    if (document.querySelector('.hero-content')) {
        gsap.to('.hero-content > *', {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.2
        });
    }

    // Generic Section Animation (Headings)
    gsap.utils.toArray('.heading-lg, .heading-xl').forEach(heading => {
        gsap.fromTo(heading,
            { y: 30, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out'
            }
        );
    });

    // ROBUST CARD ANIMATION
    // Instead of relying on a parent container trigger which might fail if the structure differs,
    // we animate cards in batches based on their container, or correctly individually.

    // Find all grids that contain cards
    const grids = document.querySelectorAll('.grid, .grid-2, .grid-3, .grid-4');
    grids.forEach(grid => {
        const cards = grid.querySelectorAll('.card');
        if (cards.length > 0) {
            gsap.to(cards, {
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 85%'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }

        // Also handle project cards in grids
        const projectCards = grid.querySelectorAll('.project-card');
        if (projectCards.length > 0) {
            gsap.to(projectCards, {
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 85%'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    });

    // Fallback: If any card is missed (not in a .grid or individually placed), animate it when it comes into view
    gsap.utils.toArray('.card, .project-card').forEach(card => {
        // Check if already animated (gsap sets checks) or if we need a failsafe
        // A simple way is to use a batch or individual triggers if they aren't part of a grid stagger
        if (!card.style.opacity || card.style.opacity === '0') {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%'
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: 'auto' // ensure grid stagger doesn't conflict
            });
        }
    });
}

/* =========================================
   Three.js 3D Scene
   ========================================= */
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();

    // Safety check for dimensions
    let width = canvas.clientWidth || canvas.parentElement.clientWidth;
    let height = canvas.clientHeight || canvas.parentElement.clientHeight;

    // Fallback if height is 0 (common on mobile load)
    if (height === 0) {
        height = window.innerHeight * 0.5; // Estimate 50vh
        width = window.innerWidth;
    }

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.IcosahedronGeometry(2.5, 1);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);

    const material = new THREE.LineBasicMaterial({
        color: 0x0EA5E9,
        transparent: true,
        opacity: 0.5,
        linewidth: 1
    });

    line.material = material;
    scene.add(line);

    const coreGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x0F172A,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.03,
        color: 0x38BDF8,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        line.rotation.y = elapsedTime * 0.1;
        line.rotation.x = elapsedTime * 0.05;
        core.rotation.y = -elapsedTime * 0.15;
        core.rotation.x = -elapsedTime * 0.05;
        particlesMesh.rotation.y = elapsedTime * 0.05;
        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        const newWidth = canvas.parentElement.clientWidth;
        const newHeight = canvas.parentElement.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight, false);
    });
}
