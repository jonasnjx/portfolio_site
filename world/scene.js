import * as THREE from 'three';
import { COLORS } from './config.js';

export function initScene(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    scene.fog = new THREE.Fog(COLORS.bg, 10, 24);

    const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 3.5, 6);

    // Bright daytime ambient
    scene.add(new THREE.AmbientLight(0xfff8f0, 3.5));

    // Sun streaming in from east window
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.0);
    sun.position.set(8, 6, 0);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(1024);
    scene.add(sun);

    // Soft secondary fill
    const fill = new THREE.PointLight(0xffffff, 0.8, 20);
    fill.position.set(0, 3.5, 0);
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
