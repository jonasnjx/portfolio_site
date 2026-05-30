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

    // Cute sky-blue ceiling
    scene.add(box(ROOM.width + 1, 0.5, ROOM.depth + 1,
        flat(0x7dd3fc, 0x7dd3fc, 0.25), 0, ROOM.height + 0.25, 0));
    buildCuteCeiling(scene);
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

// ── Cute ceiling — sky, clouds, sun ───────────────────────────────
function cloudCluster(scene, cx, cz, scale = 1) {
    const cMat = flat(0xffffff, 0xffffff, 0.55);
    const cy = ROOM.height + 0.02; // just below ceiling face
    // Each cloud is layered boxes of varying widths (fluffy silhouette from below)
    [
        [0,          0,    1.1*scale, 0.22, 0.75*scale],
        [-0.38*scale,0,    0.7*scale, 0.18, 0.55*scale],
        [ 0.35*scale,0,    0.65*scale,0.18, 0.50*scale],
        [ 0.05*scale,0.2*scale, 0.55*scale,0.16, 0.45*scale],
    ].forEach(([dx, dz, w, h, d]) =>
        scene.add(box(w, h, d, cMat, cx + dx, cy, cz + dz))
    );
}

function buildCuteCeiling(scene) {
    // Cloud clusters (keep away from ceiling light positions)
    cloudCluster(scene, -3.2, -3.5, 0.9);
    cloudCluster(scene,  2.0, -2.5, 1.0);
    cloudCluster(scene, -1.5,  2.8, 0.8);
    cloudCluster(scene,  3.5,  2.2, 0.75);

    // Sun in the northwest corner
    const sunY  = ROOM.height + 0.04;
    const sunMat = flat(0xfde68a, 0xfbbf24, 1.8);
    const rayMat = flat(0xfef3c7, 0xfde68a, 1.0);
    // Sun disc
    scene.add(box(0.7, 0.16, 0.7, sunMat, -4.0, sunY, -4.0));
    scene.add(box(0.5, 0.18, 0.5, flat(0xfef9c3, 0xfef9c3, 2.0), -4.0, sunY, -4.0));
    // Rays (cross + diagonals)
    [
        [1.4, 0.08, 0.08],
        [0.08, 0.08, 1.4],
        [1.0,  0.06, 1.0],
    ].forEach(([w, h, d]) =>
        scene.add(box(w, h, d, rayMat, -4.0, sunY, -4.0))
    );
    // Warm sun glow light
    const sunLight = new THREE.PointLight(0xfde68a, 1.2, 8);
    sunLight.position.set(-4.0, 3.6, -4.0);
    scene.add(sunLight);

    // Small birds (tiny dark V shapes) scattered around
    const birdMat = flat(0x374151);
    [
        [1.0, -4.2], [-0.5, -3.8], [2.5, -4.0], [-2.0, -4.3],
    ].forEach(([bx, bz]) => {
        scene.add(box(0.22, 0.05, 0.08, birdMat, bx - 0.08, ROOM.height + 0.02, bz));
        scene.add(box(0.22, 0.05, 0.08, birdMat, bx + 0.08, ROOM.height + 0.02, bz));
    });
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
// ── Street Fighter pixel animation ───────────────────────────────
function drawSFFrame(ctx, elapsed) {
    const W = 128, H = 80;
    ctx.fillStyle = '#0a0e28'; ctx.fillRect(0, 0, W, H);

    // Background buildings
    ctx.fillStyle = '#12184a';
    [0, 22, 44, 66, 88, 110].forEach(bx => {
        const bh = 12 + (bx % 24);
        ctx.fillRect(bx, 55 - bh, 20, bh);
    });
    // Moon
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath(); ctx.arc(104, 12, 6, 0, Math.PI * 2); ctx.fill();

    // Floor
    ctx.fillStyle = '#2d1810'; ctx.fillRect(0, 55, W, H - 55);
    ctx.fillStyle = '#4a2a18'; ctx.fillRect(0, 55, W, 2);
    // Floor pattern
    ctx.fillStyle = '#3d2214';
    for (let i = 0; i < W; i += 16) ctx.fillRect(i, 57, 8, H - 57);

    // HP bars
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(4, 4, 52, 6); ctx.fillRect(72, 4, 52, 6);
    ctx.fillStyle = '#22c55e'; ctx.fillRect(4, 4, 44, 6);   // P1 85%
    ctx.fillStyle = '#ef4444'; ctx.fillRect(72, 4, 30, 6);  // P2 58%

    // Names + timer
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 5px monospace';
    ctx.textAlign = 'left';  ctx.fillText('RYU', 4, 18);
    ctx.textAlign = 'right'; ctx.fillText('KEN', 124, 18);
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px monospace';
    const timer = 99 - Math.floor(elapsed * 0.25) % 99;
    ctx.fillText(timer.toString().padStart(2,'0'), W/2, 17);
    ctx.font = '4px monospace'; ctx.fillStyle = '#94a3b8';
    ctx.fillText('ROUND 2', W/2, 23);

    // Fight animation cycle (6s loop)
    const cycle = elapsed % 6;
    const bob = Math.sin(elapsed * 5) * 0.8;
    let p1 = 'idle', p2 = 'idle';
    if (cycle > 0.8 && cycle < 1.5)  { p1 = 'punch'; }
    if (cycle > 1.2 && cycle < 1.8)  { p2 = 'hit'; }
    if (cycle > 2.5 && cycle < 3.2)  { p2 = 'kick'; }
    if (cycle > 2.9 && cycle < 3.5)  { p1 = 'hit'; }
    if (cycle > 4.2 && cycle < 4.8)  { p1 = 'punch'; p2 = 'punch'; }
    if (cycle > 4.6 && cycle < 5.1)  { p1 = 'hit'; p2 = 'hit'; }

    drawSFFighter(ctx, 28,  55 + bob,       p1, '#1d4ed8', '#93c5fd',  1);
    drawSFFighter(ctx, 100, 55 + (-bob),    p2, '#991b1b', '#fca5a5', -1);

    if (cycle > 5.6) {
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText('FIGHT!', W/2, 44); ctx.fillText('FIGHT!', W/2, 44);
    }
}

function drawSFFighter(ctx, x, y, state, body, light, dir) {
    const ho = state === 'hit' ? dir * 3 : 0; // hit offset
    const bob = state === 'idle' ? 0 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + ho, y + 1, 7, 2, 0, 0, Math.PI * 2); ctx.fill();

    // Legs
    ctx.fillStyle = body;
    if (state === 'kick') {
        ctx.fillRect(x - 4 + ho, y - 8, 4, 8);
        ctx.fillRect(x + (dir > 0 ? 0 : -10) + ho, y - 13, 10, 3);
    } else if (state === 'punch') {
        ctx.fillRect(x - 5 + ho, y - 8, 4, 8);
        ctx.fillRect(x + 1 + ho, y - 8, 4, 8);
    } else if (state === 'hit') {
        ctx.fillRect(x - 1 + ho, y - 8, 3, 8);
        ctx.fillRect(x + 3 + ho, y - 8, 3, 8);
    } else {
        ctx.fillRect(x - 3, y - 8, 3, 8);
        ctx.fillRect(x + 1, y - 8, 3, 8);
    }

    // Body
    ctx.fillStyle = body;
    ctx.fillRect(x - 4 + ho, y - 18, 8, 10);
    ctx.fillStyle = light;
    ctx.fillRect(x - 4 + ho, y - 12, 8, 2); // belt

    // Head
    ctx.fillStyle = '#fdc5a0';
    const hx = x - 3 + ho + (state === 'hit' ? dir * 2 : 0);
    ctx.fillRect(hx, y - 24, 6, 6);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(hx, y - 24, 6, 2); // hair

    // Arms
    ctx.fillStyle = '#fdc5a0';
    if (state === 'punch') {
        ctx.fillRect(x + (dir > 0 ? 4 : -12) + ho, y - 18, 8, 3);
        ctx.fillRect(x + (dir > 0 ? 11 : -14) + ho, y - 19, 4, 4);
        ctx.fillRect(x - 5 + ho, y - 18, 2, 4);
    } else {
        ctx.fillRect(x - 5 + ho, y - 18, 2, 5);
        ctx.fillRect(x + 4 + ho, y - 18, 2, 5);
    }

    // Hit sparks
    if (state === 'hit') {
        ctx.fillStyle = '#fbbf24';
        const sx = x - dir * 11;
        [[sx, y-19, 3, 3],[sx+3, y-22, 2, 2],[sx-2, y-21, 2, 2]].forEach(
            ([rx, ry, rw, rh]) => ctx.fillRect(rx, ry, rw, rh)
        );
    }
}

function buildArcadeMachine(scene) {
    const x = 3.5, z = -5.0;
    const cab  = flat(0x1a1208);
    const trim = flat(0x4c1d95, 0x7c3aed, 0.6);

    // Base
    scene.add(box(1.0, 0.12, 0.68, flat(0x111008), x, 0.06, z));
    // Main cabinet body
    scene.add(box(0.92, 1.85, 0.65, cab, x, 1.0, z));
    // Side art strips (purple glow)
    scene.add(box(0.04, 1.7, 0.6, trim, x - 0.46, 0.95, z));
    scene.add(box(0.04, 1.7, 0.6, trim, x + 0.46, 0.95, z));

    // Marquee (angled top sign)
    const marquee = box(0.9, 0.28, 0.12, flat(0x1c1917, 0xf97316, 1.2), x, 2.06, z + 0.26);
    marquee.rotation.x = -0.3;
    scene.add(marquee);
    // Marquee light
    const mLight = new THREE.PointLight(0xf97316, 0.8, 2);
    mLight.position.set(x, 2.1, z + 0.35);
    scene.add(mLight);

    // Screen bezel
    scene.add(box(0.72, 0.54, 0.07, flat(0x0a0808), x, 1.52, z + 0.33));

    // Screen — canvas texture
    const sfCanvas = document.createElement('canvas');
    sfCanvas.width = 128; sfCanvas.height = 80;
    const sfCtx = sfCanvas.getContext('2d');
    const sfTexture = new THREE.CanvasTexture(sfCanvas);
    sfTexture.magFilter = THREE.NearestFilter;
    sfTexture.minFilter = THREE.NearestFilter;
    const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.60, 0.44, 0.05),
        new THREE.MeshBasicMaterial({ map: sfTexture })
    );
    screen.position.set(x, 1.52, z + 0.35);
    scene.add(screen);

    // Screen glow
    const sLight = new THREE.PointLight(0x7c3aed, 0.6, 2.5);
    sLight.position.set(x, 1.52, z + 0.6);
    scene.add(sLight);

    // Control panel (angled)
    const panel = box(0.88, 0.09, 0.42, flat(0x111008), x, 1.0, z + 0.22);
    panel.rotation.x = -0.35;
    scene.add(panel);

    // Joystick
    scene.add(box(0.05, 0.12, 0.05, flat(0x292524), x - 0.22, 1.1, z + 0.18));
    scene.add(box(0.09, 0.09, 0.09, flat(0x1c1917), x - 0.22, 1.18, z + 0.18));

    // Buttons — 6 coloured (2 rows of 3, SF style)
    const btnColors = [0xef4444, 0xfbbf24, 0x22c55e, 0x3b82f6, 0xa855f7, 0xf97316];
    btnColors.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        scene.add(box(0.07, 0.04, 0.07, flat(c, c, 0.5),
            x + 0.05 + col * 0.11, 1.10 - row * 0.06, z + 0.16 + row * 0.04));
    });

    // Coin slot
    scene.add(box(0.18, 0.03, 0.04, flat(0x292524), x, 0.68, z + 0.33));
    // Speaker grille dots
    [-0.2, 0.2].forEach(ox => {
        for (let i = 0; i < 4; i++) {
            scene.add(box(0.04, 0.04, 0.04, flat(0x292524), x + ox, 1.82 - i * 0.06, z + 0.33));
        }
    });

    return {
        update(elapsed) {
            drawSFFrame(sfCtx, elapsed);
            sfTexture.needsUpdate = true;
        }
    };
}

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
    const arcade = buildArcadeMachine(scene);
    return { arcadeUpdate: arcade.update };
}

export function getLeds(scene) {
    return scene.children.filter(m => m.userData.isLed);
}
