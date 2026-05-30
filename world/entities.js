import * as THREE from 'three';

function mat(color) {
    return new THREE.MeshLambertMaterial({ color });
}

function box(w, h, d, color, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
}

// ── Voxel dog ─────────────────────────────────────────────────────
function buildDogMesh() {
    const group = new THREE.Group();
    const BODY  = 0x92651a;
    const DARK  = 0x6b4c13;
    const NOSE  = 0x1a1a1a;
    const BELLY = 0xc4934a;

    // Body
    group.add(box(0.55, 0.28, 0.3, BODY,  0, 0.28, 0));
    // Belly patch
    group.add(box(0.3,  0.08, 0.28, BELLY, 0, 0.16, 0.02));
    // Head
    group.add(box(0.24, 0.24, 0.26, DARK,  0, 0.42, 0.24));
    // Snout
    group.add(box(0.14, 0.11, 0.14, BODY,  0, 0.38, 0.36));
    // Nose
    group.add(box(0.07, 0.07, 0.04, NOSE,  0, 0.40, 0.43));
    // Ears (floppy — slightly angled down)
    const earL = box(0.08, 0.13, 0.07, DARK, 0.12, 0.52, 0.22);
    earL.rotation.z = 0.3;
    group.add(earL);
    const earR = box(0.08, 0.13, 0.07, DARK, -0.12, 0.52, 0.22);
    earR.rotation.z = -0.3;
    group.add(earR);
    // Tail (wagging is done in update)
    const tail = box(0.07, 0.22, 0.07, BODY, 0, 0.38, -0.18);
    tail.rotation.x = -0.6;
    group.add(tail);
    tail.userData.isTail = true;

    // Legs — each is a pivot group so rotation.x animates the swing
    const legDefs = [
        { x:  0.16, z:  0.12, label: 'fl' },
        { x: -0.16, z:  0.12, label: 'fr' },
        { x:  0.16, z: -0.12, label: 'bl' },
        { x: -0.16, z: -0.12, label: 'br' },
    ];
    const legs = {};
    legDefs.forEach(({ x, z, label }) => {
        const pivot = new THREE.Group();
        pivot.position.set(x, 0.15, z);
        const leg = box(0.09, 0.24, 0.09, BODY, 0, -0.12, 0);
        pivot.add(leg);
        group.add(pivot);
        legs[label] = pivot;
    });

    return { group, legs, tail };
}

export function buildDog(scene) {
    const { group, legs, tail } = buildDogMesh();
    scene.add(group);

    const CX = 0, CZ = 0.5, R = 2.0;
    const SPEED = 0.55; // rad/s
    let angle = 0;

    return {
        update(dt) {
            angle += SPEED * dt;

            group.position.x = CX + R * Math.sin(angle);
            group.position.z = CZ + R * Math.cos(angle);
            group.position.y = 0;
            group.rotation.y = angle + Math.PI; // face direction of travel

            // Leg swing — diagonals in sync (trot gait)
            const swing = Math.sin(angle * 5) * 0.45;
            legs.fl.rotation.x =  swing;
            legs.br.rotation.x =  swing;
            legs.fr.rotation.x = -swing;
            legs.bl.rotation.x = -swing;

            // Tail wag
            tail.rotation.z = Math.sin(angle * 6) * 0.4;
        }
    };
}

// ── Voxel people outside the window ──────────────────────────────
function buildPersonMesh(color) {
    const group = new THREE.Group();
    const m     = new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.4) });

    const head  = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), m);
    head.position.y = 0.52;

    const body  = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.22, 0.09), m);
    body.position.y = 0.3;

    const legL  = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), m);
    legL.position.set(0.04, 0.1, 0);

    const legR  = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), m);
    legR.position.set(-0.04, 0.1, 0);

    group.add(head, body, legL, legR);
    return { group, legL, legR };
}

export function buildPeople(scene) {
    // People walk along z axis outside the east window (x~9, varying z)
    const configs = [
        { bz: -0.8, x: 9.2, speed: 0.35, phase: 0,          color: 0x581c87, range: 1.1 },
        { bz:  0.2, x: 9.5, speed: 0.28, phase: Math.PI,     color: 0x7c3aed, range: 0.9 },
        { bz:  0.6, x: 9.0, speed: 0.42, phase: Math.PI / 2, color: 0x4c1d95, range: 1.0 },
    ];

    const people = configs.map(({ bz, x, speed, phase, color, range }) => {
        const { group, legL, legR } = buildPersonMesh(color);
        group.position.set(x, 0, bz);
        group.scale.setScalar(1.7);
        scene.add(group);
        return { group, legL, legR, bz, speed, phase, range };
    });

    return {
        update(elapsed) {
            people.forEach(p => {
                const t = elapsed * p.speed + p.phase;
                p.group.position.z = p.bz + Math.sin(t) * p.range;
                p.group.rotation.y = Math.cos(t) >= 0 ? Math.PI / 2 : -Math.PI / 2;

                const legSwing = Math.sin(elapsed * p.speed * 9) * 0.4;
                p.legL.rotation.x =  legSwing;
                p.legR.rotation.x = -legSwing;
            });
        }
    };
}
