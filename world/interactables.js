import * as THREE from 'three';
import { INTERACTABLES } from './config.js';

export function buildInteractables(scene) {
    const registry = INTERACTABLES.map(cfg => ({
        ...cfg,
        focused: false,
        onFocus() { this.focused = true; },
        onBlur()  { this.focused = false; },
    }));

    // Store ref to paper mesh for bobbing animation
    const resumeEntry = registry.find(r => r.id === 'resume');
    // Paper mesh was already added by room.js — find it by userData
    resumeEntry._paper = scene.children.find(m => m.userData.isPaper) || null;

    return registry;
}

export function animateInteractables(registry, elapsed) {
    const r = registry.find(e => e.id === 'resume');
    if (r?._paper) {
        r._paper.position.y = r._paper.userData.bobBase + Math.sin(elapsed * 1.8) * 0.06;
        r._paper.rotation.y = elapsed * 0.4;
        r._paper.material.emissiveIntensity = r.focused ? 1.0 : 0.5;
    }
}
