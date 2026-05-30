import * as THREE from 'three';
import { COLORS, ROOM } from './config.js';

const flat = (color, emissive = 0x000000, emissiveIntensity = 0) =>
    new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity });

function box(w, h, d, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// ── Floor ──────────────────────────────────────────────────────────
function buildFloor(scene) {
    const matA = flat(COLORS.floor);
    const matB = flat(COLORS.floorAlt);
    const half = ROOM.width / 2;
    for (let ix = 0; ix < ROOM.width; ix++) {
        for (let iz = 0; iz < ROOM.depth; iz++) {
            const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 1),
                (ix + iz) % 2 === 0 ? matA : matB);
            tile.position.set(ix - half + 0.5, -0.2, iz - half + 0.5);
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }
}

// ── Walls ──────────────────────────────────────────────────────────
function addTrim(scene, w, h, d, x, y, z) {
    scene.add(box(w, 0.12, d, flat(COLORS.trim, COLORS.trim, 0.25),
        x, y + h / 2 + 0.06, z));
}

const WIN = { d: 3.0, h: 2.0, cz: 0, bot: 0.9 };
WIN.top = WIN.bot + WIN.h;

function buildWalls(scene) {
    const mat = flat(COLORS.wall);
    const hw  = ROOM.width / 2;
    const hd  = ROOM.depth / 2;
    const hy  = ROOM.height / 2;
    const ex  = hw + 0.25;

    // North, South, West walls — solid
    [
        [ROOM.width + 1, ROOM.height, 0.5, 0,          hy, -hd - 0.25],
        [ROOM.width + 1, ROOM.height, 0.5, 0,          hy,  hd + 0.25],
        [0.5, ROOM.height, ROOM.depth + 1, -hw - 0.25, hy,  0],
    ].forEach(([w, h, d, x, y, z]) => {
        scene.add(box(w, h, d, mat, x, y, z));
        addTrim(scene, w, h, d, x, y, z);
    });

    // East wall — window opening
    const sideD = (ROOM.depth + 1 - WIN.d) / 2;
    const topH  = ROOM.height - WIN.top;

    scene.add(box(0.5, ROOM.height, sideD, mat, ex, hy,  -(WIN.d / 2 + sideD / 2)));
    addTrim(scene, 0.5, ROOM.height, sideD, ex, hy, -(WIN.d / 2 + sideD / 2));
    scene.add(box(0.5, ROOM.height, sideD, mat, ex, hy,   WIN.d / 2 + sideD / 2));
    addTrim(scene, 0.5, ROOM.height, sideD, ex, hy,  WIN.d / 2 + sideD / 2);
    scene.add(box(0.5, topH, WIN.d, mat, ex, WIN.top + topH / 2, WIN.cz));
    scene.add(box(0.5, WIN.bot, WIN.d, mat, ex, WIN.bot / 2, WIN.cz));

    // Window frame
    const fMat = flat(0x57534e);
    const fx   = ex - 0.27;
    const fCy  = WIN.bot + WIN.h / 2;
    const fD   = WIN.d + 0.2;
    scene.add(box(0.12, 0.10, fD,    fMat, fx, WIN.top, WIN.cz));
    scene.add(box(0.12, 0.10, fD,    fMat, fx, WIN.bot, WIN.cz));
    scene.add(box(0.12, WIN.h, 0.12, fMat, fx, fCy,  -(WIN.d / 2)));
    scene.add(box(0.12, WIN.h, 0.12, fMat, fx, fCy,    WIN.d / 2));
    scene.add(box(0.08, 0.08, fD,    fMat, fx, fCy,  WIN.cz));
    // Sill with ledge for plants
    const sill = box(0.38, 0.10, fD + 0.1, flat(0x78716c), ex - 0.44, WIN.bot - 0.05, WIN.cz);
    scene.add(sill);
    // Tiny pot on windowsill
    const wp = box(0.18, 0.18, 0.18, flat(COLORS.pot), ex - 0.44, WIN.bot + 0.09, 0.3);
    scene.add(wp);
    const ws = box(0.08, 0.22, 0.08, flat(COLORS.plantDark), ex - 0.44, WIN.bot + 0.28, 0.3);
    ws.userData.plantSway = true; ws.userData.swayPhase = 0.5;
    scene.add(ws);
    const wl = box(0.28, 0.18, 0.28, flat(COLORS.plant, COLORS.plant, 0.1), ex - 0.44, WIN.bot + 0.46, 0.3);
    wl.userData.plantSway = true; wl.userData.swayPhase = 0.5;
    scene.add(wl);

    // Ceiling
    scene.add(box(ROOM.width + 1, 0.5, ROOM.depth + 1, flat(COLORS.ceiling), 0, ROOM.height + 0.25, 0));
}

// ── Outdoor — bright daytime ───────────────────────────────────────
function buildOutdoor(scene) {
    const bx = 9.5;

    // Sky gradient layers
    scene.add(box(0.2, 2.0, 8, flat(0x0ea5e9, 0x38bdf8, 1.0), bx, 3.5, 0));  // deep blue top
    scene.add(box(0.2, 1.5, 8, flat(0x38bdf8, 0x7dd3fc, 0.9), bx, 2.0, 0));  // bright blue mid
    scene.add(box(0.2, 0.8, 8, flat(0xbae6fd, 0xbae6fd, 0.8), bx, 0.9, 0));  // haze near horizon

    // Ground
    scene.add(box(0.2, 0.6, 8, flat(0x4ade80, 0x4ade80, 0.6), bx,  0.1, 0));
    scene.add(box(0.2, 0.5, 8, flat(0x16a34a, 0x16a34a, 0.5), bx, -0.1, 0));

    // Fluffy clouds
    const cMat = flat(0xffffff, 0xffffff, 0.9);
    [[-0.6, 3.4, -0.8], [-0.4, 3.5, -0.3], [-0.5, 3.2, 0.7], [-0.6, 3.3, 1.1]].forEach(([ox, y, z]) => {
        scene.add(box(0.15, 0.28 + Math.random() * 0.1, 0.7 + Math.random() * 0.4, cMat, bx + ox, y, z));
    });

    // Sun — high up, bright
    scene.add(box(0.2, 0.75, 0.75, flat(0xfef3c7, 0xfde68a, 2.5), bx - 0.3, 4.0, -0.5));
    // Sun halo
    scene.add(box(0.15, 1.0, 1.0, flat(0xfef9c3, 0xfef9c3, 0.5), bx - 0.2, 4.0, -0.5));

    // Bright daylight streaming in
    const sunLight = new THREE.PointLight(0xfff8f0, 2.4, 20);
    sunLight.position.set(6.3, 2.0, 0);
    scene.add(sunLight);

    // Distant tree silhouettes
    const treeMat = flat(0x166534, 0x16a34a, 0.2);
    [[-1.2, 0.7], [1.0, 0.9], [1.5, 0.5]].forEach(([cz, h]) => {
        scene.add(box(0.15, h * 1.2, 0.15, flat(0x92400e), bx + 0.2, h * 0.3, cz));
        scene.add(box(0.15, h, h * 0.9, treeMat, bx + 0.1, h * 0.8, cz));
    });
}

// ── Rug ────────────────────────────────────────────────────────────
function buildRug(scene) {
    scene.add(box(3.5, 0.055, 2.5, flat(COLORS.rug), 0, 0.01, 0.5));
    // Rug border
    scene.add(box(3.7, 0.05, 0.12, flat(0xb91c1c), 0, 0.01, -0.9));
    scene.add(box(3.7, 0.05, 0.12, flat(0xb91c1c), 0, 0.01,  1.9));
}

// ── Plants (with sway markers) ─────────────────────────────────────
function buildPlant(scene, x, z, phase = 0) {
    scene.add(box(0.44, 0.44, 0.44, flat(COLORS.pot),       x, 0.22, z));
    scene.add(box(0.17, 0.52, 0.17, flat(COLORS.plantDark),  x, 0.72, z));

    const leaf1 = box(0.70, 0.42, 0.70, flat(COLORS.plant, COLORS.plant, 0.1), x, 1.16, z);
    leaf1.userData.plantSway = true; leaf1.userData.swayPhase = phase;
    scene.add(leaf1);

    const leaf2 = box(0.42, 0.34, 0.42, flat(COLORS.plantDark, 0, 0), x, 1.52, z);
    leaf2.userData.plantSway = true; leaf2.userData.swayPhase = phase + 0.5;
    scene.add(leaf2);
}

// ── Sofa ───────────────────────────────────────────────────────────
function buildSofa(scene) {
    const body = flat(0x1e3a5f);
    const cush = flat(0x1d4ed8);
    const leg  = flat(0x0f172a);
    // Seat
    scene.add(box(2.6, 0.44, 0.88, body, 0, 0.22, 4.2));
    // Back
    scene.add(box(2.6, 0.68, 0.20, body, 0, 0.68, 4.58));
    // Armrests
    scene.add(box(0.20, 0.58, 0.88, body, -1.2, 0.38, 4.2));
    scene.add(box(0.20, 0.58, 0.88, body,  1.2, 0.38, 4.2));
    // Cushions
    scene.add(box(0.95, 0.12, 0.72, cush, -0.7, 0.50, 4.15));
    scene.add(box(0.95, 0.12, 0.72, cush,  0.7, 0.50, 4.15));
    // Legs
    [[-1.1, -0.36], [1.1, -0.36], [-1.1, 0.36], [1.1, 0.36]].forEach(([dx, dz]) =>
        scene.add(box(0.09, 0.19, 0.09, leg, dx, 0.095, 4.2 + dz))
    );
    // Throw pillow
    scene.add(box(0.32, 0.32, 0.10, flat(0xfbbf24), -0.9, 0.72, 4.02));
}

// ── Bookshelf — against west wall, facing east into room ───────────
function buildBookshelf(scene) {
    const frame = flat(0x292524);
    const wx  = -5.88; // west edge of shelf (close to inner face of west wall)
    const zc  = -1.5;  // centre z
    const dep = 0.80;  // depth eastward into room
    const wid = 1.2;   // width along z axis

    // Back panel
    scene.add(box(0.06, 1.9, wid,  frame, wx + 0.03,      0.95, zc));
    // North + south side panels
    scene.add(box(dep,  1.9, 0.07, frame, wx + dep / 2,   0.95, zc - wid / 2));
    scene.add(box(dep,  1.9, 0.07, frame, wx + dep / 2,   0.95, zc + wid / 2));
    // Shelves
    [0.04, 0.9, 1.78].forEach(sy =>
        scene.add(box(dep, 0.07, wid, frame, wx + dep / 2, sy, zc))
    );

    // Books run along z axis (visible when looking from east/+x)
    const books = [
        [0xef4444, 0.13], [0x3b82f6, 0.16], [0x22c55e, 0.11], [0xf59e0b, 0.14],
        [0x8b5cf6, 0.12], [0xec4899, 0.13], [0x06b6d4, 0.12], [0xf97316, 0.15],
    ];
    let bz = zc - wid / 2 + 0.05, shelf = 0;
    books.forEach(([color, w], i) => {
        const sy = shelf === 0 ? 0.52 : 1.38;
        scene.add(box(dep - 0.08, 0.34, w, flat(color), wx + dep / 2 - 0.02, sy, bz + w / 2));
        bz += w + 0.018;
        if (i === 3) { bz = zc - wid / 2 + 0.05; shelf = 1; }
    });
}

// ── Resume desk ────────────────────────────────────────────────────
function buildResumeDesk(scene) {
    const x = -2.0, z = -4.0;
    scene.add(box(1.7, 0.10, 0.85, flat(COLORS.deskTop), x, 0.86, z));
    [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].forEach(([dx, dz]) =>
        scene.add(box(0.10, 0.86, 0.10, flat(COLORS.desk), x + dx, 0.43, z + dz))
    );
    // Floating resume page
    const paper = box(0.55, 0.70, 0.04, flat(0xe2e8f0, 0x3b82f6, 0.55), x, 1.36, z);
    paper.userData.bobBase = 1.36;
    paper.userData.isPaper = true;
    scene.add(paper);
    const pl = new THREE.PointLight(0x3b82f6, 0.9, 3.2);
    pl.position.set(x, 1.9, z);
    scene.add(pl);
}

// ── Telephone side table ───────────────────────────────────────────
function buildTelephone(scene) {
    const x = 3.5, z = 0.5;
    // Table
    scene.add(box(0.65, 0.06, 0.65, flat(COLORS.deskTop), x, 0.68, z));
    [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]].forEach(([dx, dz]) =>
        scene.add(box(0.06, 0.68, 0.06, flat(COLORS.desk), x + dx, 0.34, z + dz))
    );
    // Phone base + body
    scene.add(box(0.34, 0.07, 0.24, flat(0x1c1917), x, 0.730, z));
    scene.add(box(0.28, 0.10, 0.18, flat(0x292524), x, 0.790, z));
    // Handset
    scene.add(box(0.09, 0.06, 0.24, flat(0x1c1917), x, 0.855, z - 0.02));
    scene.add(box(0.11, 0.06, 0.09, flat(0x1c1917), x, 0.855, z - 0.11));
    scene.add(box(0.11, 0.06, 0.09, flat(0x1c1917), x, 0.855, z + 0.09));
    // Indicator light
    scene.add(box(0.05, 0.05, 0.05, flat(0x22c55e, 0x22c55e, 1.0), x + 0.1, 0.810, z));
    const pl = new THREE.PointLight(0xffd580, 0.5, 2.5);
    pl.position.set(x, 1.4, z);
    scene.add(pl);
}

// ── Flower poster (north wall) ─────────────────────────────────────
function buildFlowerPoster(scene) {
    const wx = 2.5, wy = 2.0, wz = -5.9;
    // Frame
    scene.add(box(1.4, 1.7, 0.06, flat(0x44403c), wx, wy, wz));
    // Background (pastel)
    scene.add(box(1.25, 1.55, 0.05, flat(0xfce7f3, 0xfce7f3, 0.3), wx, wy, wz + 0.04));

    // Flower 1 — left
    const f1x = wx - 0.35;
    scene.add(box(0.05, 0.55, 0.05, flat(0x16a34a), f1x, wy - 0.38, wz + 0.06)); // stem
    [[0,0.2],[0.15,0],[0,-0.2],[-0.15,0]].forEach(([dz, dy]) =>
        scene.add(box(0.05, 0.13, 0.13, flat(0xfb7185), f1x, wy + 0.05 + dy, wz + 0.06 + dz))
    );
    scene.add(box(0.05, 0.12, 0.12, flat(0xfef08a), f1x, wy + 0.05, wz + 0.06)); // center

    // Flower 2 — right
    const f2x = wx + 0.25;
    scene.add(box(0.05, 0.45, 0.05, flat(0x16a34a), f2x, wy - 0.40, wz + 0.06));
    [[0,0.18],[0.13,0],[0,-0.18],[-0.13,0]].forEach(([dz, dy]) =>
        scene.add(box(0.05, 0.11, 0.11, flat(0xa78bfa), f2x, wy + 0.02 + dy, wz + 0.06 + dz))
    );
    scene.add(box(0.05, 0.10, 0.10, flat(0xfde68a), f2x, wy + 0.02, wz + 0.06));

    // Leaves
    const leafMat = flat(0x16a34a);
    scene.add(box(0.05, 0.10, 0.22, leafMat, f1x, wy - 0.16, wz + 0.06));
    scene.add(box(0.05, 0.10, 0.18, leafMat, f2x, wy - 0.18, wz + 0.06));
}

// ── Ceiling lights ─────────────────────────────────────────────────
function buildCeilingLights(scene) {
    const fix  = flat(0x292524);
    const glow = flat(0xffffff, 0xffffff, 1.0);
    [[-3.5, 2], [3.5, 2], [0, -3]].forEach(([x, z]) => {
        scene.add(box(0.55, 0.07, 0.55, fix,  x, 3.98, z));
        scene.add(box(0.38, 0.04, 0.38, glow, x, 3.94, z));
        const l = new THREE.PointLight(0xfff8f0, 1.0, 10);
        l.position.set(x, 3.8, z);
        scene.add(l);
    });
}

// ── Main build ─────────────────────────────────────────────────────
export function buildRoom(scene) {
    buildFloor(scene);
    buildWalls(scene);
    buildOutdoor(scene);
    buildRug(scene);
    buildCeilingLights(scene);
    buildPlant(scene, -4.8, 4.0, 0);
    buildPlant(scene,  4.5, 4.0, 1.2);
    buildSofa(scene);
    buildBookshelf(scene);
    buildResumeDesk(scene);
    buildTelephone(scene);
    buildFlowerPoster(scene);
}

export function getLeds(scene) {
    return scene.children.filter(m => m.userData.isLed);
}
