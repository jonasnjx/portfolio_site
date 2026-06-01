import { ROOM, SPAWN_YAW } from './config.js';

export function initControls(camera, canvas, character) {
    let yaw     = SPAWN_YAW;
    let pitch   = 0.40;   // vertical camera angle (radians above horizontal)
    let isSit   = false;
    let velY    = 0;
    let onGround = true;

    const SPEED   = 3.8;
    const DIST    = 3.2;
    const GRAVITY = -20;
    const JUMP    = 7.0;

    const keys = { w: false, a: false, s: false, d: false };

    canvas.addEventListener('click', () => {
        if (!isLocked()) canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        canvas.dispatchEvent(new Event(isLocked() ? 'lock' : 'unlock'));
    });

    document.addEventListener('mousemove', e => {
        if (!isLocked()) return;
        yaw   -= e.movementX * 0.0022;
        pitch  = Math.max(-0.25, Math.min(1.1, pitch + e.movementY * 0.002));
    });

    const inputFocused = () => document.activeElement?.tagName === 'INPUT';

    document.addEventListener('keydown', e => {
        if (inputFocused()) return; // typing in chat — ignore all game keys
        if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.w = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.s = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.a = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = true;
        if (e.code === 'Space' && onGround && !isSit) {
            velY = JUMP;
            onGround = false;
        }
        if (isSit && (keys.w || keys.s || keys.a || keys.d)) standUp();
    });

    document.addEventListener('keyup', e => {
        if (inputFocused()) return;
        if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.w = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.s = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.a = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = false;
    });

    function isLocked() { return document.pointerLockElement === canvas; }

    function updateCamera() {
        const p = character.group.position;
        const cosP = Math.cos(pitch);
        camera.position.set(
            p.x + Math.sin(yaw) * DIST * cosP,
            Math.max(0.2, p.y + Math.sin(pitch) * DIST + 0.9),
            p.z + Math.cos(yaw) * DIST * cosP
        );
        camera.lookAt(p.x, p.y + 0.9, p.z);
    }

    function sit(pos) {
        isSit = true;
        character.group.position.set(pos.sitX ?? pos.x, pos.sitY ?? 0.44, pos.sitZ ?? pos.z);
        character.group.rotation.y = pos.sitRot ?? Math.PI;
        updateCamera();
    }

    function standUp() { isSit = false; }

    const controls = {
        get isLocked()  { return isLocked(); },
        get isSitting() { return isSit; },

        lock()   { canvas.requestPointerLock(); },
        unlock() { document.exitPointerLock(); },
        addEventListener(event, cb) { canvas.addEventListener(event, cb); },
        getObject() { return character.group; },
        setCharacter(newChar) { character = newChar; },
        sit,
        standUp,

        update(dt) {
            this.isLocked; // keep getter warm

            // Jump / gravity
            if (!onGround) {
                velY += GRAVITY * dt;
                character.group.position.y += velY * dt;
                if (character.group.position.y <= 0) {
                    character.group.position.y = 0;
                    velY = 0;
                    onGround = true;
                }
            }

            if (!isLocked() || isSit) { updateCamera(); return false; }

            let mx = 0, mz = 0;
            if (keys.w) { mx -= Math.sin(yaw); mz -= Math.cos(yaw); }
            if (keys.s) { mx += Math.sin(yaw); mz += Math.cos(yaw); }
            if (keys.a) { mx -= Math.cos(yaw); mz += Math.sin(yaw); }
            if (keys.d) { mx += Math.cos(yaw); mz -= Math.sin(yaw); }

            const moving = mx !== 0 || mz !== 0;
            if (moving) {
                const len = Math.sqrt(mx * mx + mz * mz);
                character.group.position.x += (mx / len) * SPEED * dt;
                character.group.position.z += (mz / len) * SPEED * dt;
                character.group.rotation.y = Math.atan2(mx, mz);

                const p = character.group.position;
                p.x = Math.max(-ROOM.boundsX, Math.min(ROOM.boundsX, p.x));
                p.z = Math.max(-ROOM.boundsZ, Math.min(ROOM.boundsZ, p.z));
            }

            updateCamera();
            return moving;
        }
    };

    updateCamera();
    return controls;
}
