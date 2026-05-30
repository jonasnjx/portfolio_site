// Mobile / WebGL / PointerLock guard — redirect before touching Three.js
const isTouch  = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isNarrow = innerWidth < 820;
const hasWebGL = (() => {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
})();
const hasPLock = 'pointerLockElement' in document;

if (isTouch || isNarrow || !hasWebGL || !hasPLock) {
    location.replace('/home');
}

// ── UI element refs ───────────────────────────────────────────────
const loadingOverlay   = document.getElementById('loading-overlay');
const onboardingOverlay = document.getElementById('onboarding-overlay');
const pauseOverlay     = document.getElementById('pause-overlay');
const hud              = document.getElementById('hud');
const progressBar      = document.getElementById('progress-bar');
const enterBtn         = document.getElementById('enter-btn');
const resumeBtn        = document.getElementById('resume-btn');
const prompt           = document.getElementById('prompt');
const promptText       = document.getElementById('prompt-text');

// Modal refs
const modals = {
    resume:   document.getElementById('resume-modal'),
    video:    document.getElementById('video-modal'),
    terminal: document.getElementById('terminal-modal'),
};
const introVideo     = document.getElementById('intro-video');
const videoFallback  = document.getElementById('video-fallback');

// ── Modal helpers ─────────────────────────────────────────────────
function openModal(name) {
    if (modals[name]) {
        modals[name].classList.remove('hidden');
        if (name === 'video') {
            // Show fallback text if video can't load
            introVideo.addEventListener('error', () => {
                introVideo.style.display = 'none';
                videoFallback.style.display = 'block';
            }, { once: true });
            introVideo.play().catch(() => {});
        }
    }
}

function closeModal(name) {
    if (modals[name]) {
        modals[name].classList.add('hidden');
        if (name === 'video') {
            introVideo.pause();
            introVideo.currentTime = 0;
        }
    }
}

// controls set after boot() — relock helper populated then
let _relock = () => {};

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(btn.dataset.close);
        setTimeout(() => _relock(), 50);
    });
});

// Close modal on backdrop click
Object.entries(modals).forEach(([name, el]) => {
    el.addEventListener('click', e => {
        if (e.target !== el) return;
        closeModal(name);
        setTimeout(() => _relock(), 50);
    });
});

// ── Show / hide helpers ───────────────────────────────────────────
export function showPrompt(text) {
    promptText.textContent = text;
    prompt.classList.add('visible');
}

export function hidePrompt() {
    prompt.classList.remove('visible');
}

export function getOpenModal() { return openModal; }
export function getCloseModal() { return closeModal; }

// ── Boot sequence ─────────────────────────────────────────────────
async function boot() {
    // Animate progress bar while Three.js modules load
    let progress = 0;
    const tick = setInterval(() => {
        progress = Math.min(progress + Math.random() * 15, 85);
        progressBar.style.width = progress + '%';
    }, 200);

    // Dynamically import the world modules (loads Three.js from CDN)
    const [{ initScene }, { buildRoom, getLeds }, { buildInteractables, animateInteractables }, { initControls }, { initInteraction }, { buildDog, buildPeople }] =
        await Promise.all([
            import('./scene.js'),
            import('./room.js'),
            import('./interactables.js'),
            import('./controls.js'),
            import('./interaction.js'),
            import('./entities.js'),
        ]);

    clearInterval(tick);
    progressBar.style.width = '100%';

    // Small pause so the bar visually completes
    await new Promise(r => setTimeout(r, 400));

    // Init the scene
    const canvas = document.getElementById('world-canvas');
    const { scene, camera, renderer, clock } = initScene(canvas);
    buildRoom(scene);
    const leds    = getLeds(scene);
    const registry = buildInteractables(scene);
    const dog     = buildDog(scene);
    const people  = buildPeople(scene);
    const controls = initControls(camera, canvas, scene);
    const interaction = initInteraction(camera, registry, controls, openModal);

    // ── Pointer lock lifecycle ────────────────────────────────────
    let nudgeDone = false;
    controls.addEventListener('lock', () => {
        onboardingOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        hud.classList.add('visible');

        // First-time nudge: flash the prompt toward the TV after 2s
        if (!nudgeDone) {
            nudgeDone = true;
            setTimeout(() => {
                if (!controls.isLocked) return;
                const tvEntry = registry.find(r => r.id === 'tv');
                if (tvEntry) {
                    document.getElementById('prompt-text').textContent = tvEntry.prompt;
                    document.getElementById('prompt').classList.add('visible');
                    setTimeout(() => document.getElementById('prompt').classList.remove('visible'), 2000);
                }
            }, 2000);
        }
    });

    controls.addEventListener('unlock', () => {
        hud.classList.remove('visible');
        // Only show pause if no modal is open
        const anyModalOpen = Object.values(modals).some(m => !m.classList.contains('hidden'));
        if (!anyModalOpen) pauseOverlay.classList.remove('hidden');
    });

    // ── Button wiring ─────────────────────────────────────────────
    _relock = () => controls.lock();
    enterBtn.addEventListener('click', () => controls.lock());
    resumeBtn.addEventListener('click', () => controls.lock());

    // ── Render loop ───────────────────────────────────────────────
    let elapsed = 0;
    renderer.setAnimationLoop(() => {
        const dt = clock.getDelta();
        elapsed += dt;

        animateInteractables(registry, elapsed);
        dog.update(dt);
        people.update(elapsed);

        // Blink server LEDs
        leds.forEach(led => {
            const on = Math.sin(elapsed * 2 + led.userData.blinkOffset) > 0;
            led.material.emissiveIntensity = on ? 1.0 : 0.1;
        });

        controls.update(dt);
        interaction.update(dt);
        renderer.render(scene, camera);
    });

    // ── Show onboarding ───────────────────────────────────────────
    loadingOverlay.classList.add('hidden');
    onboardingOverlay.classList.remove('hidden');
}

boot().catch(err => {
    console.error('World failed to load:', err);
    location.replace('/home');
});
