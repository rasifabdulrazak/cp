/* 
   C-Portals | Interactions & Animations 
   Three.js + GSAP 
*/

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initGSAP();
    initUI();
});

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
            menuToggle.classList.toggle('active'); // specific animation for toggle icon if needed
        });
    }

    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps update

        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target; // Ensure exact final value
                // Add "+" if needed, handled in HTML usually or appended here
                if (counter.textContent.length < 4) { // minimalistic check
                    // counter.textContent += "+"; 
                }
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
    gsap.from('.hero-content > *', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.5
    });

    // Section Titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // Service Cards Stagger
    gsap.from('.card', {
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
    });

    // Project Cards Parallax/Reveal
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out'
        });
    });
}

/* =========================================
   Three.js 3D Scene
   ========================================= */
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // SCENE
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x121212); // Match CSS background or transparent
    // Keep transparent to blend with CSS gradient if any, or set color

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // GEOMETRY - Abstract Structural Beams (Icosahedron wireframe for now)
    // A complex group of lines to resemble construction
    const geometry = new THREE.IcosahedronGeometry(2.5, 1);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);

    // Material
    const material = new THREE.LineBasicMaterial({
        color: 0xFFD700, // Safety Yellow
        transparent: true,
        opacity: 0.3,
        linewidth: 1 // Note: linewidth is always 1 on Windows WebGL usually
    });

    line.material = material;
    scene.add(line);

    // Inner core structure
    const coreGeo = new THREE.IcosahedronGeometry(1.5, 0);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0x2A2A2A,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x787878,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Rotate main structure
        line.rotation.y = elapsedTime * 0.1;
        line.rotation.x = elapsedTime * 0.05;

        // Counter rotate core
        core.rotation.y = -elapsedTime * 0.15;
        core.rotation.x = -elapsedTime * 0.05;

        // Float particles
        particlesMesh.rotation.y = elapsedTime * 0.05;

        // Mouse parallax (simple ease)
        // (Optional: add mousemove event listener to update targetRotation)

        renderer.render(scene, camera);
    };

    animate();

    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;  // Use container dimensions
        const height = canvas.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false); // false prevents resizing canvas style
    });
}
