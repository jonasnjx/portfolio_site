import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { ROOM } from './config.js';

export function initControls(camera, canvas, scene) {
    const controls = new PointerLockControls(camera, canvas);
    scene.add(controls.getObject());

    const keys = { w: false, a: false, s: false, d: false };
    let velX = 0, velZ = 0;
    let bobTime = 0;
    const SPEED   = 2.5;
    const DAMPING = 0.85;
    const EYE_HEIGHT = 1.6;

    document.addEventListener('keydown', e => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.w = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.s = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.a = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = true;
    });

    document.addEventListener('keyup', e => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.w = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.s = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.a = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = false;
    });

    controls.update = function(dt) {
        if (!controls.isLocked) return;

        const moving = keys.w || keys.s || keys.a || keys.d;

        if (keys.w) velZ -= SPEED * dt;
        if (keys.s) velZ += SPEED * dt;
        if (keys.a) velX -= SPEED * dt;
        if (keys.d) velX += SPEED * dt;

        controls.moveForward(-velZ);
        controls.moveRight(velX);

        velX *= DAMPING;
        velZ *= DAMPING;

        // Head bob when moving
        const speed = Math.sqrt(velX * velX + velZ * velZ);
        if (moving && speed > 0.01) bobTime += dt * 8;

        const pos = controls.getObject().position;
        pos.x = Math.max(-ROOM.boundsX, Math.min(ROOM.boundsX, pos.x));
        pos.z = Math.max(-ROOM.boundsZ, Math.min(ROOM.boundsZ, pos.z));
        pos.y = EYE_HEIGHT + (moving ? Math.sin(bobTime) * 0.032 : 0);
    };

    return controls;
}
