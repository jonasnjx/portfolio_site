// Mobile / WebGL / PointerLock guard
const isTouch  = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const isNarrow = innerWidth < 820;
const hasWebGL = (() => {
    try { const c = document.createElement('canvas');
          return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch { return false; }
})();
const hasPLock = 'pointerLockElement' in document;
if (isTouch || isNarrow || !hasWebGL || !hasPLock) location.replace('/home');

// ── UI refs ───────────────────────────────────────────────────────
const loadingOverlay    = document.getElementById('loading-overlay');
const onboardingOverlay = document.getElementById('onboarding-overlay');
const pauseOverlay      = document.getElementById('pause-overlay');
const hud               = document.getElementById('hud');
const progressBar       = document.getElementById('progress-bar');
const enterBtn          = document.getElementById('enter-btn');
const resumeBtn         = document.getElementById('resume-btn');

const modals = {
    resume:      document.getElementById('resume-modal'),
    terminal:    document.getElementById('terminal-modal'),
    casestudies: document.getElementById('casestudies-modal'),
    telephone:   document.getElementById('telephone-modal'),
    clock:       document.getElementById('clock-modal'),
};

// ── Modal helpers ─────────────────────────────────────────────────
let _clockInterval = null;

function openModal(name) {
    const el = modals[name];
    if (!el) return;
    el.classList.remove('hidden');
    if (name === 'clock') {
        function updateClock() {
            const now = new Date();
            document.getElementById('clock-time').textContent =
                now.toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour12: false });
            document.getElementById('clock-date').textContent =
                now.toLocaleDateString('en-SG', {
                    timeZone: 'Asia/Singapore',
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
        }
        updateClock();
        _clockInterval = setInterval(updateClock, 1000);
    }
}

function closeModal(name) {
    const key = name.replace(/-modal$/, '');
    const el = modals[key];
    if (!el) return;
    el.classList.add('hidden');
    if (key === 'clock') { clearInterval(_clockInterval); _clockInterval = null; }
}

let _relock = () => {};

document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(btn.dataset.close);
        setTimeout(() => _relock(), 50);
    });
});

Object.entries(modals).forEach(([name, el]) => {
    if (!el) return;
    el.addEventListener('click', e => {
        if (e.target !== el) return;
        closeModal(name);
        setTimeout(() => _relock(), 50);
    });
});

// Esc only closes chat (via chatInput keydown handler).
// Modals are closed via ✕ button or backdrop click only.
// Game pause/resume is handled by the browser's pointer lock behaviour + Enter key.

// ── Read avatar colour choices ────────────────────────────────────
function readAvatarOpts() {
    return {
        type: document.querySelector('#char-options .char-card.selected')?.dataset.char || 'robot',
    };
}

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
    let progress = 0;
    const tick = setInterval(() => {
        progress = Math.min(progress + Math.random() * 15, 85);
        progressBar.style.width = progress + '%';
    }, 200);

    // Load all modules
    const [
        { initScene },
        { buildRoom, getLeds },
        { buildInteractables, animateInteractables },
        { buildCharacter, animateCharacter, renderPreview },
        { initControls },
        { initInteraction },
        { buildGiraffe, buildDinosaur, buildPolarBear },
    ] = await Promise.all([
        import('./scene.js'),
        import('./room.js'),
        import('./interactables.js'),
        import('./character.js'),
        import('./controls.js'),
        import('./interaction.js'),
        import('./entities.js'),
    ]);

    clearInterval(tick);
    progressBar.style.width = '100%';
    await new Promise(r => setTimeout(r, 400));

    // ── Phase 1: build static world (no character yet) ────────────
    const canvas = document.getElementById('world-canvas');
    const { scene, camera, renderer, clock } = initScene(canvas);

    const { arcadeUpdate } = buildRoom(scene);
    const leds     = getLeds(scene);
    const registry = buildInteractables(scene);
    const giraffe   = buildGiraffe(scene);
    const dino      = buildDinosaur(scene);
    const polarbear = buildPolarBear(scene);
    const pets      = [giraffe, dino, polarbear];

    // Expose camera for pet greeting projection
    window._worldCamera = camera;

    const swayMeshes = [];
    scene.traverse(m => { if (m.userData.plantSway) swayMeshes.push(m); });

    const signMeshes = [];
    scene.traverse(m => { if (m.userData.signBob) signMeshes.push(m); });

    // Pet greeting bubble
    const petBubble = document.getElementById('pet-bubble');
    let bubbleTimer = null;
    function showPetGreeting(pet) {
        const cam = window._worldCamera;
        if (!cam) return;
        const pos = pet.group.position.clone();
        pos.y += 1.4 / pet.group.scale.x;
        pos.project(cam);
        const x = (pos.x * 0.5 + 0.5) * innerWidth;
        const y = (-pos.y * 0.5 + 0.5) * innerHeight;
        petBubble.textContent = pet.emoji + ' ' + pet.greeting;
        petBubble.style.left  = x + 'px';
        petBubble.style.top   = y + 'px';
        petBubble.style.opacity = '1';
        clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => { petBubble.style.opacity = '0'; }, 2200);
    }

    // ── Random pet talking ────────────────────────────────────────
    const petPhrases = {
        giraffe:  ['My neck is a lifestyle.', 'Anyone up there?', 'I ate 30kg today.', 'Height = personality.', 'Yes I can see the resume.'],
        dino:     ['ROAR! ...I mean hi!', 'Tiny arms, big dreams.', 'Meteor? What meteor?', 'I was here before Java.', 'Pick me up? Please?'],
        polarbear:['Too warm in here.', 'Ice cream time?', 'Global warming is real...', 'Someone turn on AC.', 'Brrr... hello!'],
    };
    let petTalkTimer = 6;
    function tickPetTalk(dt) {
        petTalkTimer -= dt;
        if (petTalkTimer > 0) return;
        petTalkTimer = 8 + Math.random() * 10;
        const pet = pets[Math.floor(Math.random() * pets.length)];
        const key = pet === giraffe ? 'giraffe' : pet === dino ? 'dino' : 'polarbear';
        const phrases = petPhrases[key];
        pet.greeting = phrases[Math.floor(Math.random() * phrases.length)];
        showPetGreeting(pet);
    }

    // ── Chat commands ─────────────────────────────────────────────
    const chatOverlay = document.getElementById('chat-overlay');
    const chatInput   = document.getElementById('chat-input');
    const chatOutput  = document.getElementById('chat-output');

    function addChatMsg(text) {
        const line = document.createElement('div');
        line.textContent = '> ' + text;
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    let chatting = false;

    function openChat() {
        if (!controls?.isLocked) return;
        chatting = true;          // tell unlock handler not to pause
        controls.unlock();
        chatOverlay.classList.remove('hidden');
        chatInput.value = '';
        setTimeout(() => chatInput.focus(), 50);
    }

    function closeChat() {
        chatting = false;
        chatOverlay.classList.add('hidden');
        setTimeout(() => _relock(), 50);
    }

    // Live character swap — must be in boot() scope so runCommand can access it
    function switchCharacter(type) {
        if (!character || !controls) return;
        const pos  = character.group.position.clone();
        const rotY = character.group.rotation.y;
        scene.remove(character.group);

        const newChar = buildCharacter(scene, { type });
        newChar.group.position.copy(pos);
        newChar.group.rotation.y = rotY;
        newChar._tickPick    = character._tickPick;
        newChar._getPickInfo = character._getPickInfo;

        controls.setCharacter(newChar);
        character = newChar;

        document.querySelectorAll('#char-options .char-card')
            .forEach(c => c.classList.remove('selected'));
        const card = document.querySelector(`[data-char="${type}"]`);
        if (card) card.classList.add('selected');
    }

    function runCommand(raw) {
        const parts = raw.trim().toLowerCase().split(/\s+/);
        const cmd = parts[0] || '', arg = parts[1] || '';
        switch (cmd) {
            case '/resume':       closeChat(); setTimeout(() => openModal('resume'), 100); break;
            case '/projects':     closeChat(); setTimeout(() => openModal('terminal'), 100); break;
            case '/casestudies':  closeChat(); setTimeout(() => openModal('casestudies'), 100); break;
            case '/contact':      closeChat(); setTimeout(() => openModal('telephone'), 100); break;
            case '/help':
                addChatMsg('/resume  /projects  /casestudies  /contact  /char <name>');
                addChatMsg('chars: robot  kong  spider  wonder  maleficent');
                break;
            case '/char':
                if (['robot','kong','spider','wonder','maleficent','hulk'].includes(arg)) {
                    switchCharacter(arg);
                    closeChat();
                } else {
                    addChatMsg('Try: /char robot | kong | spider | wonder | maleficent | hulk');
                }
                break;
            default:
                addChatMsg('Unknown command. Type /help');
        }
    }

    document.addEventListener('keydown', e => {
        if (document.activeElement?.tagName === 'INPUT') return; // ignore when chat is focused
        if (e.code === 'Enter') {
            if (controls?.isLocked) {
                openChat();           // in-game → open chat
            } else {
                const pauseEl = document.getElementById('pause-overlay');
                if (pauseEl && !pauseEl.classList.contains('hidden')) {
                    _relock();        // paused → resume
                }
            }
        }
        if (e.code === 'KeyT' && controls?.isLocked) {
            openChat();
        }
    });

    chatInput.addEventListener('keydown', e => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter') {
            e.preventDefault();
            e.stopPropagation();
            const val = chatInput.value.trim();
            chatInput.value = '';
            if (val) {
                try { runCommand(val); }
                catch (err) { addChatMsg('Error: ' + err.message); }
            }
        }
        if (e.code === 'Escape') closeChat();
    });

    // Click on pet handler (checked separately from interactables since pets move)
    document.addEventListener('mousedown', e => {
        if (e.button !== 0 || !controls?.isLocked) return;
        const playerPos = controls.getObject().position;
        let nearest = null, nearestDist = 2.2;
        pets.forEach(pet => {
            const d = playerPos.distanceTo(pet.group.position);
            if (d < nearestDist) { nearest = pet; nearestDist = d; }
        });
        if (nearest) showPetGreeting(nearest);
    });

    // Render character previews (all 6)
    ['robot', 'kong', 'spider', 'wonder', 'maleficent', 'hulk'].forEach(type => {
        const cvs = document.getElementById('preview-' + type);
        if (cvs) renderPreview(type, cvs);
    });

    // Show onboarding while user picks character
    loadingOverlay.classList.add('hidden');
    onboardingOverlay.classList.remove('hidden');

    // Idle render loop — room visible behind the overlay card
    let elapsed = 0;
    let character = null, controls = null, interaction = null;

    renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.05);
        elapsed += dt;

        arcadeUpdate(elapsed);
        animateInteractables(registry, elapsed);
        pets.forEach(pet => pet.update(dt, elapsed));
        tickPetTalk(dt);
        swayMeshes.forEach(m => {
            m.rotation.z = Math.sin(elapsed * 1.1 + m.userData.swayPhase) * 0.055;
            m.rotation.x = Math.sin(elapsed * 0.8 + m.userData.swayPhase + 1.5) * 0.035;
        });
        signMeshes.forEach(m => {
            m.position.y = m.userData.bobBase + Math.sin(elapsed * 1.6 + m.position.x) * 0.05;
        });
        leds.forEach(led => {
            led.material.emissiveIntensity =
                Math.sin(elapsed * 2 + led.userData.blinkOffset) > 0 ? 1.0 : 0.1;
        });

        if (character && controls && interaction) {
            if (character._tickPick) character._tickPick(dt);
            const pickInfo = character._getPickInfo ? character._getPickInfo() : { t: -1, type: 'default' };
            const isMoving = controls.update(dt) || false;
            animateCharacter(character, elapsed, isMoving, controls.isSitting, pickInfo);
            interaction.update(dt);
        }

        renderer.render(scene, camera);
    });

    // ── Phase 2: Enter World — NOW read colours and build character ─
    enterBtn.addEventListener('click', () => {
        // Show loading — overlay stays fully visible until pointer lock is granted
        enterBtn.textContent = 'Loading...';
        enterBtn.disabled = true;

        const avatarOpts = readAvatarOpts();

        character   = buildCharacter(scene, avatarOpts);
        controls    = initControls(camera, canvas, character);

        // Pick animation state
        let pickT = -1, pickCb = null, pickType = 'default';
        function startPick(cb, type = 'default') { pickT = 0; pickCb = cb; pickType = type; }
        character._getPickInfo = () => ({ t: pickT, type: pickType });
        character._tickPick    = dt => {
            if (pickT < 0) return;
            pickT += dt / 0.55;
            if (pickT >= 0.5 && pickCb) { pickCb(); pickCb = null; }
            if (pickT >= 1.0) { pickT = -1; pickType = 'default'; }
        };

        interaction = initInteraction(controls, registry, openModal, startPick);

        // Pointer lock lifecycle
        let nudgeDone = false;
        controls.addEventListener('lock', () => {
            pauseOverlay.classList.add('hidden');
            hud.classList.add('visible');
            // Hold the dialog for 900ms so "Loading..." is clearly seen, then snap away
            setTimeout(() => onboardingOverlay.classList.add('hidden'), 900);

            if (!nudgeDone) {
                nudgeDone = true;
                setTimeout(() => {
                    if (!controls.isLocked) return;
                    document.getElementById('prompt-text').textContent =
                        'Walk up to an object and click to interact';
                    document.getElementById('prompt').classList.add('visible');
                    setTimeout(() =>
                        document.getElementById('prompt').classList.remove('visible'), 2500);
                }, 1500);
            }
        });

        controls.addEventListener('unlock', () => {
            hud.classList.remove('visible');
            const anyOpen = Object.values(modals).some(m => m && !m.classList.contains('hidden'));
            if (!anyOpen && !chatting) pauseOverlay.classList.remove('hidden');
        });

        _relock = () => controls.lock();
        resumeBtn.addEventListener('click', () => controls.lock());

        controls.lock();
    }, { once: true }); // once — prevent re-building on subsequent pause→resume flows

    // Pause resume button (after first enter, resumeBtn re-locks via _relock)
}

boot().catch(err => {
    console.error('World failed to load:', err);
    location.replace('/home');
});
