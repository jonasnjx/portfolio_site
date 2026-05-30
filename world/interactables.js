import * as THREE from 'three';
import { COLORS, INTERACTABLES } from './config.js';

const mat = (color, emissive = 0x000000, emissiveIntensity = 0) =>
    new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity });

function box(w, h, d, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return mesh;
}

// ── Resume desk ───────────────────────────────────────────────────
function buildResume(scene) {
    const cfg = INTERACTABLES.find(i => i.id === 'resume');
    const { x, z } = cfg.position;

    // Desk surface + legs
    const top  = box(1.6, 0.1, 0.8, mat(COLORS.deskTop), x, 0.85, z);
    const legL = box(0.1, 0.85, 0.1, mat(COLORS.desk), x - 0.7, 0.425, z - 0.3);
    const legR = box(0.1, 0.85, 0.1, mat(COLORS.desk), x + 0.7, 0.425, z - 0.3);
    const legLb = box(0.1, 0.85, 0.1, mat(COLORS.desk), x - 0.7, 0.425, z + 0.3);
    const legRb = box(0.1, 0.85, 0.1, mat(COLORS.desk), x + 0.7, 0.425, z + 0.3);
    [top, legL, legR, legLb, legRb].forEach(m => scene.add(m));

    // Floating glowing resume page (paper)
    const paper = box(0.55, 0.7, 0.04, mat(0xdde6f0, COLORS.accent, 0.4), x, 1.35, z);
    paper.userData.bobBase = 1.35;
    paper.userData.isPaper = true;
    scene.add(paper);

    // Point light to highlight the desk
    const light = new THREE.PointLight(COLORS.accent, 0.8, 3);
    light.position.set(x, 1.8, z);
    scene.add(light);

    return paper;
}

// ── TV + stand ────────────────────────────────────────────────────
function buildTV(scene) {
    const cfg = INTERACTABLES.find(i => i.id === 'tv');
    const { x, z } = cfg.position;

    // Stand
    const standBase = box(1.0, 0.1, 0.5, mat(COLORS.decor), x, 0.05, z);
    const standPole = box(0.15, 0.8, 0.15, mat(COLORS.decor), x, 0.45, z);
    scene.add(standBase);
    scene.add(standPole);

    // TV bezel
    const bezel = box(2.6, 1.5, 0.15, mat(0x0a0f1a), x, 1.55, z);
    scene.add(bezel);

    // Screen (inner, emissive — pulses when idle)
    const screen = box(2.3, 1.2, 0.08, mat(0x0c1a30, COLORS.accent, 0.15), x, 1.55, z + 0.05);
    screen.userData.isScreen = true;
    screen.userData.pulseBase = 0.15;
    scene.add(screen);

    // "JONAS" sign above TV — 5 small cubes spelling it out
    const signMat = mat(COLORS.accent, COLORS.accent, 0.8);
    const letters = [
        box(0.18, 0.18, 0.1, signMat, x - 0.5, 2.45, z),
        box(0.18, 0.18, 0.1, signMat, x - 0.25, 2.45, z),
        box(0.18, 0.18, 0.1, signMat, x, 2.45, z),
        box(0.18, 0.18, 0.1, signMat, x + 0.25, 2.45, z),
        box(0.18, 0.18, 0.1, signMat, x + 0.5, 2.45, z),
    ];
    letters.forEach(l => scene.add(l));

    // Point light from the screen
    const light = new THREE.PointLight(COLORS.accent, 0.6, 4);
    light.position.set(x, 1.55, z + 0.5);
    scene.add(light);

    return screen;
}

// ── Terminal kiosk ────────────────────────────────────────────────
function buildTerminal(scene) {
    const cfg = INTERACTABLES.find(i => i.id === 'terminal');
    const { x, z } = cfg.position;

    // Pedestal
    const base = box(0.8, 0.9, 0.5, mat(COLORS.decor), x, 0.45, z);
    scene.add(base);

    // Monitor
    const monitor = box(1.1, 0.8, 0.12, mat(0x0a0f1a), x, 1.35, z);
    scene.add(monitor);

    // Screen (green-tinted for terminal feel)
    const screen = box(0.9, 0.6, 0.07, mat(0x001a0f, 0x00ff88, 0.25), x, 1.35, z + 0.04);
    screen.userData.isTerminalScreen = true;
    scene.add(screen);

    // Point light
    const light = new THREE.PointLight(0x00ff88, 0.5, 3);
    light.position.set(x, 1.6, z + 0.5);
    scene.add(light);
}

// ── Connect poster (west wall) ────────────────────────────────────
function buildConnect(scene) {
    const cfg = INTERACTABLES.find(i => i.id === 'connect');
    const { x, z } = cfg.position;

    // Poster frame
    const frame = box(0.06, 1.6, 1.1, mat(COLORS.deskTop), x + 0.03, 2.0, z);
    scene.add(frame);

    // Poster face (emissive accent)
    const poster = box(0.04, 1.4, 0.9, mat(0x0c1a30, COLORS.accent, 0.2), x + 0.05, 2.0, z);
    poster.userData.isPoster = true;
    scene.add(poster);

    // Small pixel pattern blocks on the poster (decorative QR-like)
    const pixMat = mat(COLORS.accent, COLORS.accent, 0.6);
    const pixels = [
        [0, 0.3], [0, -0.3], [0.2, 0], [-0.2, 0.2], [0.2, -0.2],
    ];
    pixels.forEach(([dy, dz]) => {
        const p = box(0.04, 0.12, 0.12, pixMat, x + 0.06, 2.0 + dy, z + dz);
        scene.add(p);
    });

    // Point light
    const light = new THREE.PointLight(COLORS.accent, 0.5, 3);
    light.position.set(x + 0.5, 2.0, z);
    scene.add(light);
}

// ── Build all + return registry ───────────────────────────────────
export function buildInteractables(scene) {
    const paper  = buildResume(scene);
    const screen = buildTV(scene);
    buildTerminal(scene);
    buildConnect(scene);

    // Registry — maps config entries to their focus meshes for glow animation
    const registry = INTERACTABLES.map(cfg => ({
        ...cfg,
        focused: false,
        onFocus() {
            this.focused = true;
        },
        onBlur() {
            this.focused = false;
        },
    }));

    // Expose animated meshes for the render loop
    registry.find(r => r.id === 'resume')._paper  = paper;
    registry.find(r => r.id === 'tv')._screen     = screen;

    return registry;
}

// Called every frame from main.js to animate objects
export function animateInteractables(registry, elapsed) {
    const resumeEntry = registry.find(r => r.id === 'resume');
    if (resumeEntry?._paper) {
        const p = resumeEntry._paper;
        p.position.y = p.userData.bobBase + Math.sin(elapsed * 1.8) * 0.06;
        p.rotation.y = elapsed * 0.4;
        // Boost glow when focused
        p.material.emissiveIntensity = resumeEntry.focused ? 0.9 : 0.4;
    }

    const tvEntry = registry.find(r => r.id === 'tv');
    if (tvEntry?._screen) {
        const s = tvEntry._screen;
        s.material.emissiveIntensity = tvEntry.focused
            ? 0.5
            : s.userData.pulseBase + Math.sin(elapsed * 0.8) * 0.08;
    }
}
