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

// Checkerboard voxel floor from 1×1 tiles
function buildFloor(scene) {
    const matA = flat(COLORS.floor);
    const matB = flat(COLORS.floorAlt);
    const count = ROOM.width;
    const half  = count / 2;

    for (let ix = 0; ix < count; ix++) {
        for (let iz = 0; iz < count; iz++) {
            const mat  = (ix + iz) % 2 === 0 ? matA : matB;
            const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 1), mat);
            tile.position.set(ix - half + 0.5, -0.2, iz - half + 0.5);
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }
}

function addTrim(scene, w, h, d, x, y, z) {
    const trim = box(w, 0.15, d, flat(COLORS.trim, COLORS.accentDim, 0.6), x, y + h / 2 + 0.075, z);
    scene.add(trim);
}

// Window on east wall — centered at z=0, y 1.0→2.9
const WIN = { d: 3.2, h: 1.9, cz: 0, bot: 1.0 };
WIN.top = WIN.bot + WIN.h; // 2.9

function buildWalls(scene) {
    const mat = flat(COLORS.wall);
    const hw  = ROOM.width / 2;
    const hd  = ROOM.depth / 2;
    const hy  = ROOM.height / 2;
    const ex  = hw + 0.25; // east wall x

    // ── North wall — solid ─────────────────────────────────
    const north = box(ROOM.width + 1, ROOM.height, 0.5, mat, 0, hy, -hd - 0.25);
    scene.add(north);
    addTrim(scene, ROOM.width + 1, ROOM.height, 0.5, 0, hy, -hd - 0.25);

    // ── South wall ─────────────────────────────────────────
    const south = box(ROOM.width + 1, ROOM.height, 0.5, mat, 0, hy, hd + 0.25);
    scene.add(south);
    addTrim(scene, ROOM.width + 1, ROOM.height, 0.5, 0, hy, hd + 0.25);

    // ── West wall ──────────────────────────────────────────
    const west = box(0.5, ROOM.height, ROOM.depth + 1, mat, -hw - 0.25, hy, 0);
    scene.add(west);
    addTrim(scene, 0.5, ROOM.height, ROOM.depth + 1, -hw - 0.25, hy, 0);

    // ── East wall — split around window ───────────────────
    const sideD = (ROOM.depth + 1 - WIN.d) / 2; // depth of each side piece

    // North side piece (negative z)
    const eN = box(0.5, ROOM.height, sideD, mat, ex, hy, -(WIN.d / 2 + sideD / 2));
    scene.add(eN);
    addTrim(scene, 0.5, ROOM.height, sideD, ex, hy, -(WIN.d / 2 + sideD / 2));

    // South side piece (positive z)
    const eS = box(0.5, ROOM.height, sideD, mat, ex, hy, WIN.d / 2 + sideD / 2);
    scene.add(eS);
    addTrim(scene, 0.5, ROOM.height, sideD, ex, hy, WIN.d / 2 + sideD / 2);

    // Top piece
    const topH = ROOM.height - WIN.top;
    scene.add(box(0.5, topH, WIN.d, mat, ex, WIN.top + topH / 2, WIN.cz));
    addTrim(scene, 0.5, topH, WIN.d, ex, WIN.top + topH / 2, WIN.cz);

    // Bottom piece
    scene.add(box(0.5, WIN.bot, WIN.d, mat, ex, WIN.bot / 2, WIN.cz));

    // ── Window frame (east wall) ───────────────────────────
    const fMat = flat(0x44403c);
    const fx   = ex - 0.28; // slightly inside from wall face
    const fCy  = WIN.bot + WIN.h / 2;
    const fD   = WIN.d + 0.2;

    scene.add(box(0.12, 0.12, fD,   fMat, fx, WIN.top, WIN.cz)); // top bar
    scene.add(box(0.12, 0.12, fD,   fMat, fx, WIN.bot, WIN.cz)); // bottom bar
    scene.add(box(0.12, WIN.h, 0.12, fMat, fx, fCy, -(WIN.d / 2))); // north post
    scene.add(box(0.12, WIN.h, 0.12, fMat, fx, fCy,   WIN.d / 2));  // south post
    scene.add(box(0.08, 0.08, fD,   fMat, fx, fCy, WIN.cz)); // mid crossbar

    // Window sill
    scene.add(box(0.35, 0.09, fD, flat(0x57534e), ex - 0.45, WIN.bot - 0.045, WIN.cz));

    // ── Ceiling ────────────────────────────────────────────
    const ceiling = box(ROOM.width + 1, 0.5, ROOM.depth + 1, flat(COLORS.ceiling), 0, ROOM.height + 0.25, 0);
    scene.add(ceiling);
}

// Sunset outdoor scene visible through east window
function buildOutdoor(scene) {
    const bx = 9; // base x for outdoor elements (east side)

    // Sky layers — sunset gradient from bottom to top
    scene.add(box(0.2, 1.2, 8, flat(0xfbbf24, 0xfbbf24, 0.9), bx, 3.6,  0)); // gold top
    scene.add(box(0.2, 1.2, 8, flat(0xf97316, 0xf97316, 0.9), bx, 2.4,  0)); // orange mid
    scene.add(box(0.2, 1.2, 8, flat(0xef4444, 0xef4444, 0.8), bx, 1.2,  0)); // red low
    scene.add(box(0.2, 0.5, 8, flat(0x7c3aed, 0x7c3aed, 0.7), bx, 0.25, 0)); // purple horizon

    // Ground
    scene.add(box(0.2, 0.6, 8, flat(0x1c1917, 0x292524, 0.4), bx, -0.15, 0));

    // Voxel mountains — dark silhouettes against sunset
    buildMountain(scene, bx + 1.0, -1.5, 0x581c87, 1.2);
    buildMountain(scene, bx + 1.5,  0.8, 0x4c1d95, 1.0);
    buildMountain(scene, bx + 0.8,  0.0, 0x3b0764, 0.8);

    // Sun — low on the horizon, large and glowing
    scene.add(box(0.2, 0.7, 0.7, flat(0xfef3c7, 0xfde68a, 1.5), bx,      1.4,  0.4));
    // Sun glow ring
    scene.add(box(0.15, 1.0, 1.0, flat(0xfbbf24, 0xfbbf24, 0.5), bx + 0.05, 1.4, 0.4));

    // Warm sunset point light into room through window
    const sunLight = new THREE.PointLight(0xff6b35, 1.6, 18);
    sunLight.position.set(6.0, 1.8, 0);
    scene.add(sunLight);
}

// cx = x position (depth behind east wall), cz = z offset, color, scale
function buildMountain(scene, cx, cz, color, scale = 1) {
    const mat = flat(color, color, 0.6);
    const layers = [
        { d: 0.25, y: 2.8 },
        { d: 0.55, y: 2.42 },
        { d: 0.9,  y: 2.04 },
        { d: 1.3,  y: 1.66 },
        { d: 1.7,  y: 1.28 },
        { d: 2.1,  y: 0.9 },
    ];
    layers.forEach(({ d, y }) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, d * scale), mat);
        m.position.set(cx, y * (scale * 0.5 + 0.5), cz);
        scene.add(m);
    });
}

function buildRug(scene) {
    scene.add(box(4, 0.06, 3, flat(COLORS.rug), 0, 0.01, 1));
}

function buildPlant(scene, x, z) {
    const pot  = box(0.5, 0.5, 0.5, flat(COLORS.pot),       x, 0.25, z);
    const stem = box(0.2, 0.6, 0.2, flat(COLORS.plantDark),  x, 0.8,  z);
    const top  = box(0.8, 0.5, 0.8, flat(COLORS.plant),      x, 1.25, z);
    const top2 = box(0.5, 0.4, 0.5, flat(COLORS.plantDark),  x, 1.65, z);
    [pot, stem, top, top2].forEach(m => scene.add(m));
}

function buildSkateboard(scene) {
    scene.add(box(1.4, 0.08, 0.4, flat(0x7c3aed), 4, 0.04, 4.5));
    const wheelMat = flat(0x1e293b);
    [[-0.5, 0], [0.5, 0], [-0.5, 1], [0.5, 1]].forEach(([dx, dz]) => {
        scene.add(box(0.12, 0.12, 0.12, wheelMat, 4 + dx, 0.06, 4.5 + dz * 0.15));
    });
}

function buildServers(scene) {
    const serverMat = flat(COLORS.decor, COLORS.accent, 0.3);
    const lightMat  = flat(COLORS.accent, COLORS.accent, 1.0);
    for (let i = 0; i < 3; i++) {
        scene.add(box(0.9, 0.25, 0.5, serverMat, 4.2, 0.125 + i * 0.3, -4.5));
        const led = box(0.06, 0.06, 0.06, lightMat, 4.6, 0.2 + i * 0.3, -4.25);
        led.userData.isLed = true;
        led.userData.blinkOffset = i * 0.4;
        scene.add(led);
    }
}

function buildCamera(scene) {
    scene.add(box(0.8,  0.08, 0.3,  flat(COLORS.deskTop),                4.6, 1.6,  -1));
    scene.add(box(0.5,  0.35, 0.3,  flat(0x1e293b),                      4.6, 1.85, -1));
    scene.add(box(0.18, 0.18, 0.18, flat(0x0f172a, COLORS.accent, 0.2),  4.6, 1.85, -0.84));
}

// Sofa against south wall, facing TV
function buildSofa(scene) {
    const bodyMat = flat(0x1e3a5f);
    const cushMat = flat(0x1d4ed8);
    const legMat  = flat(0x0f172a);

    // Main seat
    scene.add(box(2.4, 0.45, 0.85, bodyMat, 0, 0.225, 3.8));
    // Back rest
    scene.add(box(2.4, 0.65, 0.2,  bodyMat, 0, 0.675, 4.15));
    // Arm rests
    scene.add(box(0.2, 0.55, 0.85, bodyMat, -1.1, 0.375, 3.8));
    scene.add(box(0.2, 0.55, 0.85, bodyMat,  1.1, 0.375, 3.8));
    // Cushions
    scene.add(box(0.9, 0.12, 0.7, cushMat, -0.6, 0.48, 3.75));
    scene.add(box(0.9, 0.12, 0.7, cushMat,  0.6, 0.48, 3.75));
    // Legs
    [[-1, -0.35], [1, -0.35], [-1, 0.35], [1, 0.35]].forEach(([dx, dz]) => {
        scene.add(box(0.08, 0.18, 0.08, legMat, dx, 0.09, 3.8 + dz));
    });
}

// Coffee table in front of sofa
function buildCoffeeTable(scene) {
    const mat    = flat(0x334155);
    const legMat = flat(0x1e293b);
    scene.add(box(1.2, 0.07, 0.55, mat, 0, 0.38, 2.9));
    [[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]].forEach(([dx, dz]) => {
        scene.add(box(0.06, 0.38, 0.06, legMat, dx, 0.19, 2.9 + dz));
    });
    // Small decor on table — tiny glowing cube like a crystal/lamp
    scene.add(box(0.1, 0.14, 0.1, flat(0x7dd3fc, 0x7dd3fc, 0.9), 0.2, 0.46, 2.9));
}

// Bookshelf on west wall
function buildBookshelf(scene) {
    const frame = flat(0x292524);
    const x = -4.6, z = -2.5;
    scene.add(box(0.12, 1.8, 0.8, frame, x, 0.9, z)); // left side
    scene.add(box(0.12, 1.8, 0.8, frame, x + 1.0, 0.9, z)); // right side
    scene.add(box(1.12, 0.08, 0.8, frame, x + 0.5, 0.04, z)); // base
    scene.add(box(1.12, 0.08, 0.8, frame, x + 0.5, 0.9, z));  // shelf 1
    scene.add(box(1.12, 0.08, 0.8, frame, x + 0.5, 1.7, z));  // top

    // Books (colored spines)
    const books = [
        [0xef4444, 0.14], [0x3b82f6, 0.18], [0x22c55e, 0.12],
        [0xf59e0b, 0.16], [0x8b5cf6, 0.13], [0xec4899, 0.15],
        [0x06b6d4, 0.12], [0xf97316, 0.17],
    ];
    let bx = x + 0.1;
    let shelf = 0;
    books.forEach(([color, w], i) => {
        const sy = shelf === 0 ? 0.5 : 1.3;
        scene.add(box(w, 0.38, 0.55, flat(color), bx + w / 2, sy, z));
        bx += w + 0.02;
        if (i === 3) { bx = x + 0.1; shelf = 1; }
    });
}

function buildLights(scene) {
    const fixtureMat = flat(0x1e293b);
    const glowMat    = flat(0xffffff, 0xffffff, 1.0);
    [[-3, 3], [3, 3], [0, -2]].forEach(([x, z]) => {
        scene.add(box(0.6, 0.08, 0.6, fixtureMat, x, 3.98, z));
        scene.add(box(0.4, 0.04, 0.4, glowMat,    x, 3.94, z));
        const l = new THREE.PointLight(0xffffff, 0.7, 8);
        l.position.set(x, 3.8, z);
        scene.add(l);
    });
}

export function buildRoom(scene) {
    buildFloor(scene);
    buildWalls(scene);
    buildOutdoor(scene);
    buildRug(scene);
    buildLights(scene);
    buildPlant(scene, -4.5, 3.5);
    buildPlant(scene,  4.5, 3.5);
    buildSkateboard(scene);
    buildServers(scene);
    buildCamera(scene);
    buildSofa(scene);
    buildCoffeeTable(scene);
    buildBookshelf(scene);
}

export function getLeds(scene) {
    return scene.children.filter(m => m.userData.isLed);
}
