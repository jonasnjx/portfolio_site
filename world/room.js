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
    // Sill ledge
    const sill = box(0.38, 0.10, fD + 0.1, flat(0x78716c), ex - 0.44, WIN.bot - 0.05, WIN.cz);
    scene.add(sill);

    // Cute sky-blue ceiling
    scene.add(box(ROOM.width + 1, 0.5, ROOM.depth + 1,
        flat(0x7dd3fc, 0x7dd3fc, 0.25), 0, ROOM.height + 0.25, 0));
    buildCuteCeiling(scene);
}

// ── Outdoor — beach and sea ────────────────────────────────────────
function buildOutdoor(scene) {
    const bx = 9.5;

    // Sky gradient (deep blue top → hazy near horizon)
    scene.add(box(0.2, 2.0, 8, flat(0x0369a1, 0x0ea5e9, 1.0), bx, 3.6, 0));
    scene.add(box(0.2, 1.4, 8, flat(0x38bdf8, 0x7dd3fc, 0.95), bx, 2.0, 0));
    scene.add(box(0.2, 0.5, 8, flat(0xbae6fd, 0xe0f2fe, 0.85), bx, 1.15, 0));

    // Sea (deep teal → lighter near shore)
    scene.add(box(0.2, 0.55, 8, flat(0x0e7490, 0x0891b2, 1.0), bx, 0.88, 0));
    scene.add(box(0.2, 0.28, 8, flat(0x06b6d4, 0x22d3ee, 0.9), bx, 0.62, 0));

    // Wave foam lines
    const wMat = flat(0xf0fdfa, 0xf0fdfa, 0.8);
    scene.add(box(0.12, 0.035, 8, wMat, bx, 0.76, 0));
    scene.add(box(0.12, 0.030, 8, wMat, bx, 0.61, 0));

    // Sandy beach
    scene.add(box(0.2, 0.40, 8, flat(0xfcd34d, 0xfde68a, 0.7), bx, 0.28, 0));
    scene.add(box(0.2, 0.18, 8, flat(0xf59e0b, 0xfbbf24, 0.6), bx, 0.01, 0));

    // Clouds
    const cMat = flat(0xffffff, 0xffffff, 0.9);
    [[-0.5, 3.5, -1.0], [-0.4, 3.6, -0.2], [-0.55, 3.3, 0.8], [-0.45, 3.4, 1.2]].forEach(([ox, y, z]) => {
        scene.add(box(0.15, 0.26, 0.8, cMat, bx + ox, y, z));
        scene.add(box(0.15, 0.18, 0.5, cMat, bx + ox - 0.05, y + 0.18, z));
    });

    // Sun over the water
    scene.add(box(0.2, 0.72, 0.72, flat(0xfef3c7, 0xfde68a, 2.5), bx - 0.25, 3.8, 0.7));
    scene.add(box(0.15, 0.95, 0.95, flat(0xfef9c3, 0xfef9c3, 0.5), bx - 0.15, 3.8, 0.7));

    // Sun shimmer on water
    scene.add(box(0.12, 0.06, 0.55, flat(0xfde68a, 0xfde68a, 1.2), bx, 0.80, 0.7));
    scene.add(box(0.12, 0.04, 0.35, flat(0xfef9c3, 0xfef9c3, 0.9), bx, 0.75, 0.7));

    // Seagulls (tiny V shapes)
    const gMat = flat(0x475569);
    [[-0.5, 3.1, -0.6], [-0.35, 2.85, 0.4], [-0.6, 3.0, 1.1]].forEach(([ox, y, z]) => {
        scene.add(box(0.16, 0.04, 0.05, gMat, bx + ox - 0.07, y, z));
        scene.add(box(0.16, 0.04, 0.05, gMat, bx + ox + 0.07, y, z));
    });

    // Warm beach light
    const sunLight = new THREE.PointLight(0xfff4d0, 2.4, 20);
    sunLight.position.set(6.3, 2.0, 0);
    scene.add(sunLight);
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

// ── Sofa — against east wall, facing window ────────────────────────
function buildSofa(scene) {
    const g    = new THREE.Group();
    g.position.set(3.6, 0, 2.0);
    g.rotation.y = Math.PI / 2; // seat faces east (toward window)

    const body = flat(0x1e3a5f), cush = flat(0x1d4ed8), leg = flat(0x0f172a);

    function gb(w, h, d, mat, x = 0, y = 0, z = 0) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z); m.castShadow = true; return m;
    }

    g.add(gb(2.4, 0.44, 0.88, body, 0,  0.22, 0));    // seat
    g.add(gb(2.4, 0.68, 0.20, body, 0,  0.68, 0.40));  // back
    g.add(gb(0.20, 0.58, 0.88, body, -1.1, 0.38, 0));   // arm L
    g.add(gb(0.20, 0.58, 0.88, body,  1.1, 0.38, 0));   // arm R
    g.add(gb(0.90, 0.12, 0.72, cush, -0.65, 0.50, -0.04));
    g.add(gb(0.90, 0.12, 0.72, cush,  0.65, 0.50, -0.04));
    g.add(gb(0.30, 0.30, 0.10, flat(0xfbbf24), -0.85, 0.72, 0.28)); // pillow
    [[-1.0,-0.34],[1.0,-0.34],[-1.0,0.34],[1.0,0.34]].forEach(([dx,dz]) =>
        g.add(gb(0.09, 0.19, 0.09, leg, dx, 0.095, dz))
    );
    scene.add(g);
}

// ── Newspaper stack — cream flat papers, distinct from books ──────
function buildNewspaperStack(scene, x, shelfTop, z) {
    const paper   = flat(0xe7e0cf);
    const paperHi = flat(0xf0ead8);
    for (let i = 0; i < 3; i++) {
        const p = box(0.55, 0.025, 0.4, i % 2 ? paperHi : paper,
                      x, shelfTop + 0.03 + i * 0.028, z + i * 0.03);
        p.rotation.y = (i - 1) * 0.08;
        scene.add(p);
    }
    // rolled newspaper leaning across
    const roll = box(0.5, 0.07, 0.07, flat(0xddd5c0), x - 0.05, shelfTop + 0.15, z - 0.18);
    roll.rotation.x = Math.PI / 2.2;
    scene.add(roll);
}

// ── Coffee mug ─────────────────────────────────────────────────────
function buildMug(scene, x, y, z) {
    scene.add(box(0.12, 0.14, 0.12, flat(0xf1f5f9), x, y + 0.07, z));
    scene.add(box(0.10, 0.02, 0.10, flat(0x6b4423), x, y + 0.14, z));
    scene.add(box(0.04, 0.08, 0.03, flat(0xf1f5f9), x + 0.08, y + 0.07, z));
}

// ── Bookshelf — west wall, study zone (taller, richer) ────────────
function buildBookshelf(scene) {
    const frame = flat(0x3a2418);
    const back  = flat(0x2a1a10);
    const wx  = -5.92;
    const zc  =  1.8;
    const dep =  0.85;
    const wid =  2.0;
    const H   =  2.6;
    const cy  =  H / 2;

    // Back panel
    scene.add(box(0.06, H, wid, back, wx + 0.03, cy, zc));
    // Side panels
    scene.add(box(dep, H, 0.08, frame, wx + dep/2, cy, zc - wid/2));
    scene.add(box(dep, H, 0.08, frame, wx + dep/2, cy, zc + wid/2));
    // 4 shelf boards (bottom, 2 mid, top rim)
    [0.05, 0.9, 1.75, H - 0.05].forEach(sy =>
        scene.add(box(dep, 0.08, wid, frame, wx + dep/2, sy, zc)));

    const bookFaceX = wx + dep/2 - 0.04;

    function bookRow(shelfTop, defs) {
        let bz = zc - wid/2 + 0.08;
        defs.forEach(([color, w, hgt]) => {
            scene.add(box(dep - 0.12, hgt, w, flat(color), bookFaceX, shelfTop + hgt/2, bz + w/2));
            bz += w + 0.02;
        });
    }

    // Shelf 1 (bottom bay)
    bookRow(0.13, [
        [0xef4444, 0.16, 0.62], [0x1d4ed8, 0.14, 0.58], [0x16a34a, 0.13, 0.66],
        [0xf59e0b, 0.18, 0.55], [0x7c3aed, 0.15, 0.60],
    ]);
    // Shelf 2 (mid bay) — books + newspapers
    bookRow(0.98, [
        [0x0ea5e9, 0.13, 0.50], [0xec4899, 0.15, 0.54],
        [0xf97316, 0.12, 0.48], [0x22c55e, 0.16, 0.52],
    ]);
    buildNewspaperStack(scene, bookFaceX, 0.98, zc + 0.55);

    // Shelf 3 (top bay) — fewer books + framed photo
    bookRow(1.83, [
        [0xfbbf24, 0.14, 0.46], [0x3b82f6, 0.13, 0.50], [0xdc2626, 0.12, 0.44],
    ]);
    scene.add(box(0.04, 0.34, 0.26, flat(0x9ca3af), bookFaceX, 2.05, zc - 0.5));
    scene.add(box(0.02, 0.28, 0.20, flat(0xbae6fd, 0xbae6fd, 0.3), bookFaceX + 0.02, 2.05, zc - 0.5));

    // Reading lamp on top
    const lampX = wx + dep/2 + 0.1;
    scene.add(box(0.22, 0.04, 0.22, flat(0x44403c), lampX, H + 0.02, zc - 0.5));
    scene.add(box(0.04, 0.4,  0.04, flat(0x57534e), lampX, H + 0.22, zc - 0.5));
    scene.add(box(0.3, 0.18, 0.3, flat(0xfde68a, 0xfde68a, 0.9), lampX + 0.05, H + 0.42, zc - 0.5));
    const lampLight = new THREE.PointLight(0xffd580, 0.6, 3);
    lampLight.position.set(lampX, H + 0.35, zc - 0.5);
    scene.add(lampLight);

    // Small study desk in front of the shelf
    const dx = -4.3, dz = 2.9;
    scene.add(box(1.2, 0.08, 0.6, flat(COLORS.deskTop), dx, 0.72, dz));
    [[-0.5,-0.22],[0.5,-0.22],[-0.5,0.22],[0.5,0.22]].forEach(([ox,oz]) =>
        scene.add(box(0.08, 0.72, 0.08, flat(COLORS.desk), dx + ox, 0.36, dz + oz)));
    // open book on desk
    scene.add(box(0.4, 0.04, 0.3, flat(0xf5f5f0), dx, 0.78, dz));
    scene.add(box(0.02, 0.05, 0.3, flat(0x6b4423), dx, 0.80, dz));
    buildMug(scene, dx + 0.35, 0.78, dz - 0.1);
}

// ── Resume desk — centre north ─────────────────────────────────────
function buildResumeDesk(scene) {
    const x = 0, z = -4.5;
    scene.add(box(1.7, 0.10, 0.85, flat(COLORS.deskTop), x, 0.86, z));
    [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]].forEach(([dx, dz]) =>
        scene.add(box(0.10, 0.86, 0.10, flat(COLORS.desk), x + dx, 0.43, z + dz))
    );
    // Floating resume page with canvas texture
    const pCvs = document.createElement('canvas');
    pCvs.width = 48; pCvs.height = 64;
    const pCtx = pCvs.getContext('2d');
    pCtx.fillStyle = '#dde6f0'; pCtx.fillRect(0, 0, 48, 64);
    pCtx.fillStyle = '#1c1917';
    pCtx.font = 'bold 5px monospace';
    pCtx.textAlign = 'center';
    pCtx.fillText('RESUME', 24, 10);
    pCtx.fillStyle = '#94a3b8';
    for (let i = 0; i < 7; i++) pCtx.fillRect(4, 17 + i * 7, 40, 1.5);
    pCtx.fillRect(4, 17, 20, 1.5); // shorter first line (name area)
    const pTex = new THREE.CanvasTexture(pCvs);
    pTex.magFilter = THREE.NearestFilter;
    const paper = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.70, 0.04),
        new THREE.MeshBasicMaterial({ map: pTex })
    );
    paper.position.set(x, 1.36, z);
    paper.userData.bobBase = 1.36;
    paper.userData.isPaper = true;
    scene.add(paper);
    const pl = new THREE.PointLight(0x3b82f6, 0.9, 3.2);
    pl.position.set(x, 1.9, z);
    scene.add(pl);
}

// ── Telephone — side table beside sofa, near east window ───────────
function buildTelephone(scene) {
    const x = 4.4, z = 0.2;
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

// ── Extra decor — clock, mug, cork board, trophy ──────────────────
function buildExtraDecor(scene) {
    // Wall clock on north wall (right of resume desk)
    scene.add(box(0.56, 0.56, 0.04, flat(0x44403c), 1.6, 2.8, -5.92));
    scene.add(box(0.5,  0.5,  0.06, flat(0xf5f5f0), 1.6, 2.8, -5.9));
    scene.add(box(0.04, 0.18, 0.02, flat(0x1c1917), 1.6, 2.86, -5.86));
    scene.add(box(0.12, 0.04, 0.02, flat(0x1c1917), 1.64, 2.8, -5.86));

    // Mug on resume desk
    buildMug(scene, 0.55, 0.91, -4.4);

    // Cork board above arcade (west-centre wall)
    scene.add(box(0.07, 1.1, 1.5, flat(0x44403c), -5.92, 2.6, -2.2));
    scene.add(box(0.06, 1.0, 1.4, flat(0xb45309), -5.9,  2.6, -2.2));
    [[0.35,-0.4,0xfbbf24],[-0.3,0.3,0xf472b6],[0.3,0.35,0x60a5fa],[-0.35,-0.35,0x4ade80]]
        .forEach(([dy,dz,c]) => scene.add(box(0.02, 0.3, 0.3, flat(c), -5.85, 2.6+dy, -2.2+dz)));

    // Small shelf + trophy on north wall (left of resume desk)
    scene.add(box(0.4, 0.05, 0.18, flat(0x57534e), -1.4, 1.6, -5.92));
    const gold = flat(0xfbbf24, 0xfbbf24, 0.4);
    scene.add(box(0.14, 0.1,  0.1,  gold,           -1.4, 1.7, -5.88));
    scene.add(box(0.05, 0.12, 0.05, gold,           -1.4, 1.6, -5.88));
    scene.add(box(0.16, 0.05, 0.1,  flat(0x3a2418), -1.4, 1.52,-5.88));
}

// ── Wayfinding signs — floating canvas labels ─────────────────────
function buildSign(scene, text, x, y, z, w = 1.3, h = 0.38, faceYaw = 0) {
    const cvs = document.createElement('canvas');
    cvs.width = 256; cvs.height = 72;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 256, 72);
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 250, 66);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 38);

    const tex = new THREE.CanvasTexture(cvs);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.LinearFilter;

    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    sign.position.set(x, y, z);
    sign.rotation.y = faceYaw;
    sign.userData.signBob = true;
    sign.userData.bobBase = y;
    scene.add(sign);

    // Small arrow pointing downward
    const arrowY = y - h/2 - 0.12;
    const arrow = box(0.12, 0.12, 0.02, flat(0x60a5fa, 0x60a5fa, 0.8), x, arrowY, z);
    arrow.rotation.z = Math.PI / 4;
    arrow.rotation.y = faceYaw;
    arrow.userData.signBob = true;
    arrow.userData.bobBase = arrowY;
    scene.add(arrow);
}

function buildSigns(scene) {
    buildSign(scene, '📄 RESUME',        0,    2.7, -4.2, 1.3, 0.38, 0);
    buildSign(scene, '🎮 PROJECTS',     -3.2,  2.7, -2.2, 1.4, 0.38, 0);
    buildSign(scene, '📚 CASE STUDIES', -4.3,  2.7,  1.8, 1.7, 0.38, Math.PI/2);
    buildSign(scene, '📞 CONTACT',       4.3,  2.7,  0.2, 1.4, 0.38, -Math.PI/2);
}

// ── Main build ─────────────────────────────────────────────────────
// ── Canvas texture helper ─────────────────────────────────────────
function paintingMat(drawFn, w, h) {
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    drawFn(ctx, w, h);
    const tex = new THREE.CanvasTexture(cvs);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return new THREE.MeshBasicMaterial({ map: tex });
}

// ── Mona Lisa (cartoon pixel art) — north wall ────────────────────
function buildMonaLisa(scene) {
    const mat = paintingMat((ctx, W, H) => {
        // Background gradient
        ctx.fillStyle = '#5a6b40'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#607890'; ctx.fillRect(0, 0, W, 28); // sky
        ctx.fillStyle = '#4a5c38';
        ctx.fillRect(0, 28, 18, H - 28); ctx.fillRect(W - 18, 28, 18, H - 28); // sides
        // Dark robe/body
        ctx.fillStyle = '#201810'; ctx.fillRect(20, 42, 24, H - 42);
        // Hands
        ctx.fillStyle = '#c8a878'; ctx.fillRect(23, 50, 18, 10);
        // Neck
        ctx.fillStyle = '#c8a878'; ctx.fillRect(27, 33, 10, 10);
        // Face
        ctx.fillStyle = '#d4b08a'; ctx.fillRect(24, 20, 16, 14);
        // Hair
        ctx.fillStyle = '#302010';
        ctx.fillRect(22, 18, 20, 6); // top
        ctx.fillRect(22, 18, 4, 16); // left side
        ctx.fillRect(38, 18, 4, 16); // right side
        // Eyes
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(27, 24, 3, 2); ctx.fillRect(34, 24, 3, 2);
        // Smile
        ctx.fillStyle = '#a87850'; ctx.fillRect(30, 30, 4, 1);
        // Veil/headpiece
        ctx.fillStyle = '#383820'; ctx.fillRect(22, 16, 20, 4);
    }, 64, 80);

    // Frame (thin backing plate, wider than painting)
    scene.add(box(1.32, 1.65, 0.05, flat(0x3d2010), 3.8, 2.2, -5.895));
    // Painting (in front of frame)
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), mat);
    p.position.set(3.8, 2.2, -5.868); p.rotation.y = 0;
    scene.add(p);
}

// ── Starry Night (pixel art) — south wall ─────────────────────────
function buildStarryNight(scene) {
    const mat = paintingMat((ctx, W, H) => {
        // Dark swirling sky
        ctx.fillStyle = '#0a1428'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#0e1e3a'; ctx.fillRect(0, 0, W, H * 0.7);
        // Swirl patches
        ctx.fillStyle = '#1a2e5a';
        [[8,6,22,8],[30,4,20,7],[54,8,18,6],[6,18,24,5],[38,16,22,5]].forEach(
            ([x,y,w,h]) => ctx.fillRect(x, y, w, h));
        // Stars
        ctx.fillStyle = '#fde68a';
        [[12,5],[22,3],[36,7],[50,2],[63,6],[18,15],[46,13],[70,10]].forEach(
            ([x,y]) => { ctx.fillRect(x, y, 3, 3); });
        // Large bright stars
        ctx.fillStyle = '#fef9c3';
        [[35,5],[65,8]].forEach(([x,y]) => {
            ctx.fillRect(x-1, y, 5, 3); ctx.fillRect(x, y-1, 3, 5);
        });
        // Moon
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(72, 9, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0a1428';
        ctx.beginPath(); ctx.arc(75, 7, 6, 0, Math.PI * 2); ctx.fill();
        // Cypress tree
        ctx.fillStyle = '#0a1810';
        ctx.fillRect(3, 22, 7, 22); ctx.fillRect(1, 18, 9, 8);
        // Village
        ctx.fillStyle = '#1a1a28'; ctx.fillRect(0, 44, W, H - 44);
        ctx.fillStyle = '#28284a';
        [[5,36,10,8],[18,38,8,6],[32,34,12,10],[50,37,9,7],[63,36,10,8]].forEach(
            ([x,y,w,h]) => ctx.fillRect(x, y, w, h));
        ctx.fillStyle = '#1e1e38'; ctx.fillRect(33, 30, 4, 5); // steeple
    }, 80, 64);

    // Frame — west wall, above study desk (faces east into room)
    scene.add(box(0.08, 1.10, 1.45, flat(0x3d2010), -5.88, 3.05, 1.8));
    // Painting
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.0), mat);
    p.position.set(-5.85, 3.05, 1.8); p.rotation.y = Math.PI / 2;
    scene.add(p);
}

// ── Entry door — south wall, decorative closed ────────────────────
function buildDoor(scene) {
    const doorWood = flat(0x6b4423);
    const slabWood = flat(0x8a5a2b);
    const slabTrim = flat(0x5a3818);
    const z  = 5.98;
    const sz = 5.95;

    const DW = 1.6, DH = 2.8, FT = 0.18;

    // Frame: left jamb, right jamb, lintel
    scene.add(box(FT, DH + FT, 0.30, doorWood, -(DW/2 + FT/2), (DH + FT)/2, z));
    scene.add(box(FT, DH + FT, 0.30, doorWood,  (DW/2 + FT/2), (DH + FT)/2, z));
    scene.add(box(DW + FT*2, FT, 0.30, doorWood, 0, DH + FT/2, z));

    // Door slab
    scene.add(box(DW, DH, 0.10, slabWood, 0, DH/2, sz));
    // Recessed panel lines
    scene.add(box(DW - 0.4, 0.06, 0.12, slabTrim, 0, DH*0.66, sz + 0.01));
    scene.add(box(DW - 0.4, 0.06, 0.12, slabTrim, 0, DH*0.34, sz + 0.01));
    scene.add(box(0.06, DH - 0.5, 0.12, slabTrim, -(DW/2 - 0.3), DH/2, sz + 0.01));
    scene.add(box(0.06, DH - 0.5, 0.12, slabTrim,  (DW/2 - 0.3), DH/2, sz + 0.01));

    // Brass handle
    const brass = flat(0xd4a017, 0xd4a017, 0.3);
    scene.add(box(0.10, 0.10, 0.10, brass, DW/2 - 0.22, 1.45, sz - 0.04));
    scene.add(box(0.06, 0.26, 0.04, brass, DW/2 - 0.22, 1.45, sz - 0.02));

    // Fanlight window above door
    scene.add(box(DW - 0.3, 0.34, 0.06, flat(0xbae6fd, 0xbae6fd, 0.6), 0, DH - 0.2, sz + 0.005));

    // Doormat
    scene.add(box(1.5, 0.04, 0.7, flat(0x4a3520), 0, 0.02, 4.9));
    scene.add(box(1.3, 0.05, 0.5, flat(0x6b5535), 0, 0.025, 4.9));

    // Coat hook board (right of door)
    scene.add(box(0.9, 0.18, 0.06, flat(0x4a3520), 1.7, 2.2, z));
    const hook = flat(0x9ca3af, 0x9ca3af, 0.2);
    [-0.3, 0, 0.3].forEach(dx =>
        scene.add(box(0.05, 0.14, 0.10, hook, 1.7 + dx, 2.12, z - 0.06)));
    // scarf hung on hook
    scene.add(box(0.22, 0.5, 0.06, flat(0xdc2626), 1.4, 1.85, z - 0.05));

    // Umbrella stand (left of door)
    scene.add(box(0.3, 0.5, 0.3, flat(0x374151), -1.9, 0.25, 5.7));
    scene.add(box(0.05, 0.9, 0.05, flat(0x1e3a5f), -1.95, 0.7, 5.7));
    scene.add(box(0.05, 0.9, 0.05, flat(0x7f1d1d), -1.85, 0.7, 5.72));
}

// ── Sunflower ─────────────────────────────────────────────────────
function buildSunflower(scene, x, z) {
    scene.add(box(0.42, 0.42, 0.42, flat(0x8a5028), x, 0.21, z));
    scene.add(box(0.08, 1.10, 0.08, flat(0x166534), x, 0.76, z));
    // Leaf
    scene.add(box(0.22, 0.07, 0.22, flat(0x22c55e), x + 0.18, 0.70, z));
    // Dark centre
    scene.add(box(0.30, 0.30, 0.08, flat(0x3d1a00, 0x2d0e00, 0.3), x, 1.36, z));
    // Petals
    const pMat = flat(0xfbbf24, 0xfde68a, 0.4);
    [[0,0.2],[0,-0.2],[0.2,0],[-0.2,0],[0.14,0.14],[-0.14,0.14],[0.14,-0.14],[-0.14,-0.14]].forEach(
        ([px,pz]) => scene.add(box(0.12, 0.12, 0.07, pMat, x+px, 1.36, z+pz))
    );
}

// ── Sakura tree ───────────────────────────────────────────────────
function buildSakura(scene, x, z) {
    scene.add(box(0.14, 1.1, 0.14, flat(0x5c2e00), x, 0.55, z));
    // Branches
    scene.add(box(0.07, 0.35, 0.07, flat(0x5c2e00), x + 0.28, 1.1, z));
    scene.add(box(0.07, 0.30, 0.07, flat(0x5c2e00), x - 0.22, 1.2, z));
    // Blossom clusters (pink)
    const bMat = flat(0xfba4b4, 0xfda4a4, 0.25);
    [[0,0,1.4],[0.38,0,1.25],[-0.28,0,1.32],[0,0.25,1.3],[0.2,0.2,1.18],[-0.2,0.2,1.1]].forEach(
        ([dx, dy, by]) => scene.add(box(0.58, 0.48, 0.58, bMat, x+dx, by, z+dy))
    );
}

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
    const x = -3.2, z = -2.2;
    const cab  = flat(0x1a1208);
    const trim = flat(0x4c1d95, 0x7c3aed, 0.6);

    // Base
    scene.add(box(1.0, 0.12, 0.68, flat(0x111008), x, 0.06, z));
    // Main cabinet body (arcade faces north — z offset is front)
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
    buildDoor(scene);
    buildSofa(scene);
    buildBookshelf(scene);
    buildResumeDesk(scene);
    buildTelephone(scene);
    buildMonaLisa(scene);
    buildStarryNight(scene);
    buildPlant(scene, -4.8, 3.8, 0);
    buildSunflower(scene,  4.5, -1.0);
    buildExtraDecor(scene);
    buildSigns(scene);
    const arcade = buildArcadeMachine(scene);
    return { arcadeUpdate: arcade.update };
}

export function getLeds(scene) {
    return scene.children.filter(m => m.userData.isLed);
}
