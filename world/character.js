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

// ── Robot (black body, green visor) ──────────────────────────────
function buildRobot(group) {
    const METAL = 0x1c1917, DARK = 0x111111, VISOR = 0x22c55e, JOINT = 0x292524;

    const head = part(0.42, 0.36, 0.38, METAL); head.position.set(0, 1.18, 0); group.add(head);
    const visor = part(0.30, 0.10, 0.06, DARK, VISOR, 1.2); visor.position.set(0, 1.20, 0.20); group.add(visor);

    const antBase = part(0.06, 0.06, 0.06, DARK); antBase.position.set(0, 1.40, 0); group.add(antBase);
    const antRod  = part(0.04, 0.18, 0.04, METAL); antRod.position.set(0, 1.53, 0); group.add(antRod);
    const antTip  = part(0.08, 0.08, 0.08, VISOR, VISOR, 1.0); antTip.position.set(0, 1.64, 0); group.add(antTip);

    const body = part(0.44, 0.48, 0.24, METAL); body.position.set(0, 0.72, 0); group.add(body);
    const panel = part(0.22, 0.22, 0.06, DARK); panel.position.set(0, 0.76, 0.14); group.add(panel);
    const panelLight = part(0.08, 0.08, 0.06, VISOR, VISOR, 0.8); panelLight.position.set(0, 0.76, 0.16); group.add(panelLight);

    [0.30, -0.30].forEach(ox => { const s = part(0.12, 0.12, 0.22, DARK); s.position.set(ox, 0.93, 0); group.add(s); });

    const armL = armGroup( 0.30, METAL, JOINT); group.add(armL);
    const armR = armGroup(-0.30, METAL, JOINT); group.add(armR);
    const legL = legGroup( 0.12, METAL, DARK);  group.add(legL);
    const legR = legGroup(-0.12, METAL, DARK);  group.add(legR);

    return { armL, armR, legL, legR, antTip, panelLight };
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

// ── Maleficent ────────────────────────────────────────────────────
function buildMaleficent(group) {
    const BLACK = 0x1c1917, ROBE = 0x111111, PURPLE = 0x7c3aed, GOLD = 0xd4af37, SKIN = 0xc8b8a0;

    // Elegant elongated head
    const head = part(0.34, 0.46, 0.34, SKIN); head.position.set(0, 1.24, 0); group.add(head);

    // Tall curved horns
    const hornL = part(0.08, 0.58, 0.07, BLACK); hornL.position.set( 0.14, 1.64, -0.02); hornL.rotation.z = -0.22; group.add(hornL);
    const hornR = part(0.08, 0.58, 0.07, BLACK); hornR.position.set(-0.14, 1.64, -0.02); hornR.rotation.z =  0.22; group.add(hornR);
    // Purple horn tips (glowing)
    const htL = part(0.05, 0.14, 0.05, PURPLE, PURPLE, 0.8); htL.position.set( 0.17, 1.94, -0.06); group.add(htL);
    const htR = part(0.05, 0.14, 0.05, PURPLE, PURPLE, 0.8); htR.position.set(-0.17, 1.94, -0.06); group.add(htR);

    // Gold glowing eyes
    const eyeL = part(0.08, 0.07, 0.05, ROBE, GOLD, 1.4); eyeL.position.set( 0.10, 1.28, 0.18); group.add(eyeL);
    const eyeR = part(0.08, 0.07, 0.05, ROBE, GOLD, 1.4); eyeR.position.set(-0.10, 1.28, 0.18); group.add(eyeR);

    // Pointed collar pieces
    const colL = part(0.18, 0.16, 0.06, BLACK); colL.position.set( 0.20, 1.04, 0.14); colL.rotation.z =  0.5; group.add(colL);
    const colR = part(0.18, 0.16, 0.06, BLACK); colR.position.set(-0.20, 1.04, 0.14); colR.rotation.z = -0.5; group.add(colR);

    // Dark robe body
    const body = part(0.40, 0.56, 0.24, BLACK); body.position.set(0, 0.70, 0); group.add(body);
    // Purple gem chest
    const gem = part(0.10, 0.13, 0.07, PURPLE, PURPLE, 1.1); gem.position.set(0, 0.84, 0.14); group.add(gem);

    // Cape panels (floating dark wings effect)
    const capeL = part(0.16, 0.70, 0.08, ROBE); capeL.position.set( 0.30, 0.64, -0.06); capeL.rotation.z =  0.12; group.add(capeL);
    const capeR = part(0.16, 0.70, 0.08, ROBE); capeR.position.set(-0.30, 0.64, -0.06); capeR.rotation.z = -0.12; group.add(capeR);

    // Elegant sleeved arms
    const armLm = new THREE.Group(); armLm.position.set( 0.26, 0.88, 0);
    const almM = part(0.13, 0.44, 0.15, BLACK); almM.position.y = -0.22; armLm.add(almM);
    const almH = part(0.10, 0.10, 0.10, SKIN); almH.position.y = -0.48; armLm.add(almH);
    group.add(armLm);

    const armRm = new THREE.Group(); armRm.position.set(-0.26, 0.88, 0);
    const armM = part(0.13, 0.44, 0.15, BLACK); armM.position.y = -0.22; armRm.add(armM);
    const armH = part(0.10, 0.10, 0.10, SKIN); armH.position.y = -0.48; armRm.add(armH);
    group.add(armRm);

    // Robed legs (barely visible under robe)
    const legLm = new THREE.Group(); legLm.position.set( 0.10, 0.44, 0);
    const llmM = part(0.15, 0.46, 0.22, ROBE); llmM.position.y = -0.23; legLm.add(llmM);
    group.add(legLm);

    const legRm = new THREE.Group(); legRm.position.set(-0.10, 0.44, 0);
    const lrmM = part(0.15, 0.46, 0.22, ROBE); lrmM.position.y = -0.23; legRm.add(lrmM);
    group.add(legRm);

    return { armL: armLm, armR: armRm, legL: legLm, legR: legRm, antTip: gem, panelLight: eyeL };
}

// ── Build entry point ─────────────────────────────────────────────
export function buildCharacter(scene, opts = {}) {
    const group = new THREE.Group();
    const type  = opts.type || 'robot';

    const parts = type === 'hulk'       ? buildHulk(group)
                : type === 'maleficent' ? buildMaleficent(group)
                :                         buildRobot(group);

    group.position.set(SPAWN.x, SPAWN.y, SPAWN.z);
    group.rotation.y = SPAWN_YAW;
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group);

    return { group, type, ...parts };
}

// ── Animation ─────────────────────────────────────────────────────
export function animateCharacter({ armL, armR, legL, legR, antTip, panelLight, type }, elapsed, isMoving, isSitting, pickInfo = { t: -1, type: 'default' }) {
    const { t: pickT, type: pickType } = typeof pickInfo === 'object' ? pickInfo : { t: pickInfo, type: 'default' };

    // Special glowing parts (robot antenna / hulk eyes / maleficent gem)
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

    const speed = type === 'hulk' ? 7 : type === 'maleficent' ? 10 : 9;
    const swing = type === 'hulk' ? 0.6 : type === 'maleficent' ? 0.3 : 0.5;

    if (isMoving) {
        const s = Math.sin(elapsed * speed) * swing;
        legL.rotation.x =  s; legR.rotation.x = -s;
        armL.rotation.x = -s * 0.6; armR.rotation.x = s * 0.6;
    } else {
        legL.rotation.x *= 0.8; legR.rotation.x *= 0.8;
        armL.rotation.x *= 0.8; armR.rotation.x *= 0.8;
    }
}
