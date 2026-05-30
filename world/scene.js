import * as THREE from 'three';
import { COLORS, SPAWN } from './config.js';

export function initScene(canvas) {
    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    scene.fog = new THREE.Fog(COLORS.bg, 8, 20);

    // Camera (first-person, eye height 1.6)
    const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(SPAWN.x, SPAWN.y, SPAWN.z);

    // Lighting — warm sunset
    const ambient = new THREE.AmbientLight(0xff8c42, 2.2);
    scene.add(ambient);

    // Warm directional key
    const key = new THREE.DirectionalLight(0xffd580, 1.2);
    key.position.set(6, 5, 2);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(1024);
    scene.add(key);

    // Sunset glow through east window
    const sunGlow = new THREE.PointLight(0xff6b35, 1.4, 16);
    sunGlow.position.set(5.5, 2.0, 0);
    scene.add(sunGlow);

    // Purple-blue fill (dusk sky bounce)
    const fill = new THREE.PointLight(0x7c3aed, 0.5, 18);
    fill.position.set(-3, 1.5, 0);
    scene.add(fill);

    const clock = new THREE.Clock();

    window.addEventListener('resize', () => {
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    });

    return { scene, camera, renderer, clock };
}
