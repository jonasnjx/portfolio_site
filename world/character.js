import * as THREE from 'three';
import { SPAWN, SPAWN_YAW } from './config.js';

function part(w, h, d, color, emissive = 0, emInt = 0) {
    return new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: emInt })
    );
}

function armGroup(x, upperColor, handColor, w = 0.14, hw = 0.12) {
    const g = new THREE.Group();
    g.position.set(x, 0.88, 0);
    const upper = part(w, 0.40, w + 0.02, upperColor); upper.position.y = -0.20; g.add(upper);
    const hand  = part(hw, hw, hw, handColor);           hand.position.y  = -0.44; g.add(hand);
    return g;
}

function legGroup(x, upperColor, footColor, fw = 0.18) {
    const g = new THREE.Group();
    g.position.set(x, 0.48, 0);
    const upper = part(0.16, 0.42, 0.18, upperColor); upper.position.y = -0.21; g.add(upper);
    const foot  = part(fw,  0.10, fw + 0.04, footColor); foot.position.set(0, -0.46, 0.03); g.add(foot);
    return g;
}

// ── Hulk ─────────────────────────────────────────────────────────
function buildHulk(group) {
    const G = 0x22c55e, DG = 0x16a34a, PURPLE = 0x6d28d9, RED = 0xef4444, TEETH = 0xe2e8f0;

    // Big wide head
    const head = part(0.52, 0.48, 0.48, G); head.position.set(0, 1.24, 0); group.add(head);
    // Angry brow
    const brow = part(0.46, 0.09, 0.10, DG); brow.position.set(0, 1.42, 0.24); group.add(brow);
    // Red glowing eyes
    const eyeL = part(0.11, 0.09, 0.06, DG, RED, 1.3); eyeL.position.set( 0.14, 1.30, 0.25); group.add(eyeL);
    const eyeR = part(0.11, 0.09, 0.06, DG, RED, 1.3); eyeR.position.set(-0.14, 1.30, 0.25); group.add(eyeR);
    // Teeth grimace
    const teeth = part(0.26, 0.07, 0.06, TEETH); teeth.position.set(0, 1.14, 0.26); group.add(teeth);
    // Gap in teeth
    const gap = part(0.04, 0.07, 0.06, G); gap.position.set(0, 1.14, 0.27); group.add(gap);

    // Massive torso
    const body = part(0.64, 0.56, 0.34, G); body.position.set(0, 0.72, 0); group.add(body);
    // Purple torn shorts
    const shorts = part(0.56, 0.24, 0.30, PURPLE); shorts.position.set(0, 0.48, 0); group.add(shorts);

    // Thick arms — positioned wider
    const armLg = new THREE.Group(); armLg.position.set( 0.42, 0.90, 0);
    const alM = part(0.24, 0.50, 0.24, G); alM.position.y = -0.25; armLg.add(alM);
    const alF = part(0.22, 0.22, 0.22, DG); alF.position.y = -0.58; armLg.add(alF);
    group.add(armLg);

    const armRg = new THREE.Group(); armRg.position.set(-0.42, 0.90, 0);
    const arM = part(0.24, 0.50, 0.24, G); arM.position.y = -0.25; armRg.add(arM);
    const arF = part(0.22, 0.22, 0.22, DG); arF.position.y = -0.58; armRg.add(arF);
    group.add(armRg);

    // Thick legs
    const legLg = new THREE.Group(); legLg.position.set( 0.16, 0.36, 0);
    const llM = part(0.24, 0.44, 0.26, G); llM.position.y = -0.22; legLg.add(llM);
    const llF = part(0.26, 0.10, 0.28, DG); llF.position.set(0, -0.49, 0.03); legLg.add(llF);
    group.add(legLg);

    const legRg = new THREE.Group(); legRg.position.set(-0.16, 0.36, 0);
    const lrM = part(0.24, 0.44, 0.26, G); lrM.position.y = -0.22; legRg.add(lrM);
    const lrF = part(0.26, 0.10, 0.28, DG); lrF.position.set(0, -0.49, 0.03); legRg.add(lrF);
    group.add(legRg);

    return { armL: armLg, armR: armRg, legL: legLg, legR: legRg, antTip: null, panelLight: eyeL };
}

// ── Preview renderer — 2D pixel art portraits (much more recognisable) ─
export function renderPreview(type, canvas) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const r = (x, y, w, h, c) => { if (c) ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const cx = Math.floor(W / 2);

    const spider = () => {
        r(0,0,W,H,'#991b1b');
        // Blue body
        r(cx-30,76,60,60,'#1e3a8a');
        r(cx-22,80,44,30,'#ef4444'); // red chest patch
        r(cx-8,88,16,14,'#0a0a0a'); // spider symbol
        // Red mask
        r(cx-28,8,56,70,'#ef4444');
        // ICONIC ANGULAR WHITE EYES — left
        r(cx-30,24,28,24,'#0a0a0a'); // outline L
        r(cx-28,26,24,20,'#ffffff'); // white L
        r(cx-30,24,8,8,'#ef4444');  // corner clip top-left
        r(cx-10,24,8,8,'#ef4444');  // corner clip top-right
        r(cx-30,40,8,8,'#ef4444');  // corner clip bot-left
        r(cx-10,40,8,8,'#ef4444');  // corner clip bot-right
        // ICONIC ANGULAR WHITE EYES — right
        r(cx+2,24,28,24,'#0a0a0a'); // outline R
        r(cx+4,26,24,20,'#ffffff'); // white R
        r(cx+2,24,8,8,'#ef4444');
        r(cx+22,24,8,8,'#ef4444');
        r(cx+2,40,8,8,'#ef4444');
        r(cx+22,40,8,8,'#ef4444');
    };

    const wonder = () => {
        r(0,0,W,H,'#0a0d18');
        // Black hair (voluminous)
        r(cx-38,4,76,14,'#1c1917');     // top
        r(cx-38,4,14,72,'#1c1917');     // left
        r(cx+24,4,14,72,'#1c1917');     // right
        // GOLD TIARA — most iconic
        r(cx-30,8,60,14,'#ca8a04');
        r(cx-28,6,56,16,'#d4af37');
        r(cx-26,4,52,18,'#f59e0b');
        // Red star gem on tiara
        r(cx-9,2,18,16,'#ef4444'); r(cx-6,4,12,12,'#fca5a5');
        // Skin face
        r(cx-24,22,48,48,'#fdc5a0');
        // Eyes
        r(cx-16,36,10,7,'#1c1917'); r(cx+6,36,10,7,'#1c1917');
        // Red bustier
        r(cx-30,72,60,34,'#ef4444');
        // Gold eagle emblem
        r(cx-12,78,24,16,'#d4af37'); r(cx-8,80,16,10,'#fbbf24');
        // Blue body
        r(cx-32,106,64,30,'#1d4ed8');
        // Gold bracelets
        r(cx-40,82,8,8,'#d4af37'); r(cx+32,82,8,8,'#d4af37');
    };

    const hulk = () => {
        r(0,0,W,H,'#052e16');
        // MASSIVE body
        r(cx-46,68,92,68,'#16a34a');
        r(cx-40,76,80,54,'#22c55e');
        // Purple shorts
        r(cx-42,102,84,34,'#6d28d9');
        r(cx-32,98,64,8,'#ca8a04'); // belt
        // Wide neck
        r(cx-22,52,44,20,'#16a34a');
        // HUGE HEAD
        r(cx-42,4,84,50,'#16a34a');
        r(cx-40,6,80,46,'#22c55e');
        // Heavy brow
        r(cx-40,14,80,18,'#166534');
        // RED ANGRY EYES
        r(cx-34,16,22,14,'#0a0a0a'); r(cx+12,16,22,14,'#0a0a0a');
        r(cx-32,18,18,10,'#ef4444'); r(cx+14,18,18,10,'#ef4444');
        r(cx-30,19,10,6,'#fca5a5'); r(cx+20,19,10,6,'#fca5a5');
        // Grimace / teeth
        r(cx-22,38,44,10,'#0a1a08');
        r(cx-16,40,12,6,'#e8d8c0'); r(cx+4,40,12,6,'#e8d8c0');
    };

    ({ spider, wonder, hulk }[type] || spider)();
}

// ── Spiderman ─────────────────────────────────────────────────────
function buildSpiderman(group) {
    const RED = 0xef4444, BLUE = 0x1d4ed8, DRED = 0xb91c1c, BLACK = 0x0a0a1a;

    const head = part(0.38, 0.38, 0.36, RED); head.position.set(0, 1.18, 0); group.add(head);
    // ICONIC large angular white eye lenses — black outline then white on top
    [-0.11, 0.11].forEach((ox, i) => {
        const dir = i === 0 ? -1 : 1;
        // Black outline (slightly bigger)
        const eo = part(0.22, 0.16, 0.05, BLACK); eo.position.set(ox, 1.23, 0.18); eo.rotation.z = dir * 0.38; group.add(eo);
        // White lens on top
        const ew = part(0.20, 0.13, 0.06, 0xffffff); ew.position.set(ox, 1.23, 0.20); ew.rotation.z = dir * 0.38; group.add(ew);
    });

    const body = part(0.38, 0.46, 0.22, BLUE); body.position.set(0, 0.72, 0); group.add(body);
    const chestRed = part(0.30, 0.30, 0.06, RED); chestRed.position.set(0, 0.80, 0.13); group.add(chestRed);
    const spider = part(0.10, 0.09, 0.04, BLACK); spider.position.set(0, 0.82, 0.17); group.add(spider);

    const armLs = new THREE.Group(); armLs.position.set(0.28, 0.88, 0);
    const alM = part(0.14, 0.40, 0.16, BLUE); alM.position.y = -0.20; armLs.add(alM);
    const alH = part(0.12, 0.12, 0.14, RED); alH.position.y = -0.44; armLs.add(alH);
    group.add(armLs);

    const armRs = new THREE.Group(); armRs.position.set(-0.28, 0.88, 0);
    const arM = part(0.14, 0.40, 0.16, BLUE); arM.position.y = -0.20; armRs.add(arM);
    const arH = part(0.12, 0.12, 0.14, RED); arH.position.y = -0.44; armRs.add(arH);
    group.add(armRs);

    const legLs = new THREE.Group(); legLs.position.set(0.10, 0.48, 0);
    const llM = part(0.15, 0.42, 0.17, BLUE); llM.position.y = -0.21; legLs.add(llM);
    const llF = part(0.16, 0.10, 0.20, RED); llF.position.set(0, -0.46, 0.03); legLs.add(llF);
    group.add(legLs);

    const legRs = new THREE.Group(); legRs.position.set(-0.10, 0.48, 0);
    const lrM = part(0.15, 0.42, 0.17, BLUE); lrM.position.y = -0.21; legRs.add(lrM);
    const lrF = part(0.16, 0.10, 0.20, RED); lrF.position.set(0, -0.46, 0.03); legRs.add(lrF);
    group.add(legRs);

    return { armL: armLs, armR: armRs, legL: legLs, legR: legRs, antTip: null, panelLight: null };
}

// ── Wonder Woman ──────────────────────────────────────────────────
function buildWonderWoman(group) {
    const RED = 0xef4444, BLUE = 0x1d4ed8, GOLD = 0xd4af37, BLACK = 0x1c1917, SKIN = 0xfdc5a0;

    const head = part(0.36, 0.36, 0.34, SKIN); head.position.set(0, 1.18, 0); group.add(head);
    // ICONIC gold tiara — large and bright
    const tiara = part(0.40, 0.10, 0.10, GOLD, 0xfbbf24, 0.8); tiara.position.set(0, 1.37, 0.16); group.add(tiara);
    // Star gem centre of tiara
    const tStar = part(0.10, 0.10, 0.08, RED, RED, 1.0); tStar.position.set(0, 1.40, 0.21); group.add(tStar);
    // Voluminous black hair — very visible
    const hairTop = part(0.40, 0.12, 0.38, BLACK); hairTop.position.set(0, 1.44, -0.02); group.add(hairTop);
    [-0.24, 0.24].forEach(ox => { const hs = part(0.10, 0.46, 0.32, BLACK); hs.position.set(ox, 1.14, -0.05); group.add(hs); });
    const hairBack = part(0.38, 0.55, 0.16, BLACK); hairBack.position.set(0, 1.08, -0.19); group.add(hairBack);
    [-0.09, 0.09].forEach(ox => { const e = part(0.06, 0.05, 0.04, BLACK); e.position.set(ox, 1.22, 0.18); group.add(e); });

    const bust = part(0.40, 0.28, 0.22, RED); bust.position.set(0, 0.84, 0); group.add(bust);
    const emblem = part(0.22, 0.12, 0.06, GOLD); emblem.position.set(0, 0.88, 0.13); group.add(emblem);
    const skirt = part(0.44, 0.24, 0.26, BLUE); skirt.position.set(0, 0.56, 0); group.add(skirt);
    const stripe = part(0.46, 0.06, 0.26, RED); stripe.position.set(0, 0.45, 0); group.add(stripe);

    const armLw = new THREE.Group(); armLw.position.set(0.27, 0.90, 0);
    const alM = part(0.12, 0.40, 0.14, SKIN); alM.position.y = -0.20; armLw.add(alM);
    const bracL = part(0.16, 0.06, 0.16, GOLD); bracL.position.y = -0.36; armLw.add(bracL);
    const alH = part(0.10, 0.10, 0.12, SKIN); alH.position.y = -0.44; armLw.add(alH);
    group.add(armLw);

    const armRw = new THREE.Group(); armRw.position.set(-0.27, 0.90, 0);
    const arM = part(0.12, 0.40, 0.14, SKIN); arM.position.y = -0.20; armRw.add(arM);
    const bracR = part(0.16, 0.06, 0.16, GOLD); bracR.position.y = -0.36; armRw.add(bracR);
    const arH = part(0.10, 0.10, 0.12, SKIN); arH.position.y = -0.44; armRw.add(arH);
    group.add(armRw);

    const legLw = new THREE.Group(); legLw.position.set(0.10, 0.44, 0);
    const llM = part(0.14, 0.44, 0.16, SKIN); llM.position.y = -0.22; legLw.add(llM);
    const llF = part(0.16, 0.12, 0.20, RED); llF.position.set(0, -0.47, 0.03); legLw.add(llF);
    group.add(legLw);

    const legRw = new THREE.Group(); legRw.position.set(-0.10, 0.44, 0);
    const lrM = part(0.14, 0.44, 0.16, SKIN); lrM.position.y = -0.22; legRw.add(lrM);
    const lrF = part(0.16, 0.12, 0.20, RED); lrF.position.set(0, -0.47, 0.03); legRw.add(lrF);
    group.add(legRw);

    return { armL: armLw, armR: armRw, legL: legLw, legR: legRw, antTip: null, panelLight: emblem };
}

// ── Build entry point ─────────────────────────────────────────────
export function buildCharacter(scene, opts = {}) {
    const group = new THREE.Group();
    const type  = opts.type || 'spider';

    const parts = type === 'wonder'  ? buildWonderWoman(group)
                : type === 'hulk'    ? buildHulk(group)
                :                      buildSpiderman(group);

    group.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    group.rotation.y = SPAWN_YAW;
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group);

    return { group, type, ...parts };
}

// ── Animation ─────────────────────────────────────────────────────
export function animateCharacter({ armL, armR, legL, legR, antTip, panelLight, type }, elapsed, isMoving, isSitting, pickInfo = { t: -1, type: 'default' }) {
    const { t: pickT, type: pickType } = typeof pickInfo === 'object' ? pickInfo : { t: pickInfo, type: 'default' };

    // Special glowing parts (hulk eyes)
    if (antTip)    antTip.material.emissiveIntensity    = 0.6 + Math.sin(elapsed * 3) * 0.4;
    if (panelLight) panelLight.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 2.1 + 1) * 0.3;

    if (isSitting) {
        legL.rotation.x =  1.45; legR.rotation.x =  1.45;
        armL.rotation.z =  0.45; armR.rotation.z = -0.45;
        armL.rotation.x =  0;    armR.rotation.x =  0;
        return;
    }

    armL.rotation.z = 0; armR.rotation.z = 0;

    if (pickT >= 0) {
        const reach = Math.sin(pickT * Math.PI);
        if (pickType === 'phone') {
            armR.rotation.x = -reach * 0.8;
            armR.rotation.z = -reach * 0.7;
        } else {
            armR.rotation.x = -reach * 1.5;
            armR.rotation.z =  reach * 0.3;
        }
        armL.rotation.x *= 0.8;
        legL.rotation.x *= 0.9; legR.rotation.x *= 0.9;
        return;
    }

    armR.rotation.z = 0;

    const speed = type === 'hulk' ? 7 : 9;
    const swing = type === 'hulk' ? 0.6 : 0.5;

    if (isMoving) {
        const s = Math.sin(elapsed * speed) * swing;
        legL.rotation.x =  s; legR.rotation.x = -s;
        armL.rotation.x = -s * 0.6; armR.rotation.x = s * 0.6;
    } else {
        legL.rotation.x *= 0.8; legR.rotation.x *= 0.8;
        armL.rotation.x *= 0.8; armR.rotation.x *= 0.8;
    }
}
