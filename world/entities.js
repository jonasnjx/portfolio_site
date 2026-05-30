import * as THREE from 'three';

// ── Random wandering controller ───────────────────────────────────
class Wander {
    constructor(startX, startZ, speed, phaseOffset = 0) {
        this.tx = startX;
        this.tz = startZ;
        this.speed = speed;
        this.waitT = phaseOffset; // stagger so pets don't all start at once
        this.pickTarget();
    }

    pickTarget() {
        // Stay within furniture-safe inner zone
        this.tx = (Math.random() - 0.5) * 8.5;
        this.tz = (Math.random() - 0.5) * 7.5;
    }

    update(group, dt) {
        if (this.waitT > 0) { this.waitT -= dt; return false; }

        const dx = this.tx - group.position.x;
        const dz = this.tz - group.position.z;
        const d  = Math.sqrt(dx * dx + dz * dz);

        if (d < 0.3) {
            this.waitT = 0.8 + Math.random() * 2.5;
            this.pickTarget();
            return false;
        }

        group.position.x += (dx / d) * this.speed * dt;
        group.position.z += (dz / d) * this.speed * dt;
        group.rotation.y  = Math.atan2(dx, dz);
        return true;
    }
}

function mesh(w, h, d, color) {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ color })
    );
    m.castShadow = true;
    return m;
}

function pivot(child, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    if (child) g.add(child);
    return g;
}

// ── Giraffe ───────────────────────────────────────────────────────
export function buildGiraffe(scene) {
    const group = new THREE.Group();
    const Y = 0xfbbf24, S = 0x92400e;

    const body = mesh(0.38, 0.24, 0.52, Y); body.position.set(0, 0.46, 0); group.add(body);
    [[0.10, 0.50, 0.10], [-0.08, 0.48, -0.12], [0.05, 0.44, -0.04]].forEach(([x, y, z]) => {
        const s = mesh(0.09, 0.09, 0.09, S); s.position.set(x, y, z); group.add(s);
    });
    const neck = mesh(0.11, 0.48, 0.11, Y); neck.position.set(0, 0.78, 0.17); neck.rotation.x = -0.22; group.add(neck);
    const head = mesh(0.15, 0.14, 0.20, Y); head.position.set(0, 1.08, 0.30); group.add(head);
    [0.05, -0.05].forEach(ox => { const h = mesh(0.04, 0.10, 0.04, S); h.position.set(ox, 1.18, 0.24); group.add(h); });
    [0.11, -0.11].forEach(ox => { const e = mesh(0.04, 0.08, 0.06, Y); e.position.set(ox, 1.10, 0.24); e.rotation.z = ox > 0 ? 0.45 : -0.45; group.add(e); });
    const tail = mesh(0.05, 0.16, 0.05, Y); tail.position.set(0, 0.48, -0.26); tail.rotation.x = 0.5; group.add(tail);

    const legDefs = [[0.13, 0.17], [-0.13, 0.17], [0.13, -0.17], [-0.13, -0.17]];
    const legs = legDefs.map(([x, z]) => {
        const piv = pivot(null, x, 0.36, z);
        const leg = mesh(0.07, 0.36, 0.07, Y); leg.position.y = -0.18; piv.add(leg);
        group.add(piv); return piv;
    });

    group.scale.setScalar(0.72);
    group.position.set(2, 0, -1);
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group);

    const wander = new Wander(2, -1, 0.7, 0);

    return {
        group,
        emoji: '🦒',
        greeting: 'Hello! I\'m Giraffy!',
        update(dt, elapsed) {
            const moving = wander.update(group, dt);
            const s = moving ? Math.sin(elapsed * 8) * 0.4 : 0;
            legs[0].rotation.x =  s; legs[1].rotation.x = -s;
            legs[2].rotation.x = -s; legs[3].rotation.x =  s;
        }
    };
}

// ── Dinosaur (cute baby T-rex) ────────────────────────────────────
export function buildDinosaur(scene) {
    const group = new THREE.Group();
    const G = 0x4ade80, D = 0x16a34a, BELLY = 0xa3e635;

    // Body — slightly tilted forward (T-rex posture)
    const body = mesh(0.36, 0.28, 0.48, G); body.position.set(0, 0.44, 0); group.add(body);
    // Belly
    const belly = mesh(0.22, 0.16, 0.36, BELLY); belly.position.set(0, 0.38, 0.06); group.add(belly);
    // BIG cute head
    const head = mesh(0.34, 0.30, 0.36, G); head.position.set(0, 0.64, 0.28); group.add(head);
    // Snout
    const snout = mesh(0.22, 0.16, 0.18, D); snout.position.set(0, 0.60, 0.44); group.add(snout);
    // Tiny T-rex arms (the comedy)
    const armL = mesh(0.07, 0.12, 0.07, G); armL.position.set(0.20, 0.54, 0.10); armL.rotation.z = -0.6; group.add(armL);
    const armR = mesh(0.07, 0.12, 0.07, G); armR.position.set(-0.20, 0.54, 0.10); armR.rotation.z = 0.6; group.add(armR);
    // Tail
    const tail = mesh(0.10, 0.14, 0.36, G); tail.position.set(0, 0.36, -0.28); tail.rotation.x = 0.25; group.add(tail);
    // Spines along back
    [[0, 0.60, -0.10], [0, 0.62, 0], [0, 0.60, 0.10]].forEach(([x, y, z]) => {
        const sp = mesh(0.05, 0.10, 0.05, D); sp.position.set(x, y, z); group.add(sp);
    });

    const legDefs = [[0.13, 0.12], [-0.13, 0.12], [0.13, -0.14], [-0.13, -0.14]];
    const legs = legDefs.map(([x, z]) => {
        const piv = pivot(null, x, 0.28, z);
        const leg = mesh(0.10, 0.28, 0.12, G); leg.position.y = -0.14; piv.add(leg);
        group.add(piv); return piv;
    });

    group.scale.setScalar(0.68);
    group.position.set(-2, 0, 1);
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group);

    const wander = new Wander(-2, 1, 0.9, 1.2);

    return {
        group,
        emoji: '🦕',
        greeting: 'ROAR! I mean... Hi!',
        update(dt, elapsed) {
            const moving = wander.update(group, dt);
            const s = moving ? Math.sin(elapsed * 10) * 0.45 : 0;
            legs[0].rotation.x =  s; legs[1].rotation.x = -s;
            legs[2].rotation.x = -s; legs[3].rotation.x =  s;
        }
    };
}

// ── Polar bear ────────────────────────────────────────────────────
export function buildPolarBear(scene) {
    const group = new THREE.Group();
    const W = 0xf1f5f9, OFF = 0xe2e8f0, DARK = 0x1c1917;

    // Body — round and chubby
    const body = mesh(0.44, 0.36, 0.50, W); body.position.set(0, 0.42, 0); group.add(body);
    // Tummy patch
    const tum = mesh(0.28, 0.22, 0.44, OFF); tum.position.set(0, 0.38, 0.06); group.add(tum);
    // Head — big and round
    const head = mesh(0.36, 0.34, 0.36, W); head.position.set(0, 0.74, 0.24); group.add(head);
    // Muzzle
    const muzz = mesh(0.20, 0.14, 0.14, OFF); muzz.position.set(0, 0.70, 0.38); group.add(muzz);
    // Nose
    const nose = mesh(0.08, 0.06, 0.05, DARK); nose.position.set(0, 0.72, 0.44); group.add(nose);
    // Eyes
    [-0.10, 0.10].forEach(ox => { const eye = mesh(0.05, 0.05, 0.04, DARK); eye.position.set(ox, 0.78, 0.40); group.add(eye); });
    // Round ears
    [-0.17, 0.17].forEach(ox => { const ear = mesh(0.11, 0.11, 0.08, W); ear.position.set(ox, 0.94, 0.18); group.add(ear); });
    // Tail (tiny)
    const tail = mesh(0.08, 0.08, 0.06, W); tail.position.set(0, 0.44, -0.26); group.add(tail);

    const legDefs = [[0.15, 0.15], [-0.15, 0.15], [0.15, -0.15], [-0.15, -0.15]];
    const legs = legDefs.map(([x, z]) => {
        const piv = pivot(null, x, 0.24, z);
        const leg = mesh(0.13, 0.24, 0.16, W); leg.position.y = -0.12; piv.add(leg);
        group.add(piv); return piv;
    });

    group.scale.setScalar(0.70);
    group.position.set(1, 0, 2);
    group.traverse(m => { if (m.isMesh) m.castShadow = true; });
    scene.add(group);

    const wander = new Wander(1, 2, 0.6, 2.1);

    return {
        group,
        emoji: '🐻‍❄️',
        greeting: 'Brrr... Hello there!',
        update(dt, elapsed) {
            const moving = wander.update(group, dt);
            const s = moving ? Math.sin(elapsed * 7) * 0.35 : 0;
            legs[0].rotation.x =  s; legs[1].rotation.x = -s;
            legs[2].rotation.x = -s; legs[3].rotation.x =  s;
        }
    };
}
