import * as THREE from 'three';

const _playerPos = new THREE.Vector3();
const _objPos    = new THREE.Vector3();

export function initInteraction(camera, registry, controls, openModal) {
    const promptEl   = document.getElementById('prompt');
    const promptText = document.getElementById('prompt-text');

    let focused = null;

    function setFocused(entry) {
        if (focused === entry) return;
        if (focused) focused.onBlur();
        focused = entry;
        if (focused) {
            focused.onFocus();
            promptText.textContent = focused.prompt;
            promptEl.classList.add('visible');
        } else {
            promptEl.classList.remove('visible');
        }
    }

    // E-key handler
    document.addEventListener('keydown', e => {
        if (e.code !== 'KeyE' || !focused || !controls.isLocked) return;

        if (focused.href) {
            window.location.href = focused.href;
        } else if (focused.modal) {
            controls.unlock();
            openModal(focused.modal);
        }
    });

    return {
        update(_dt) {
            if (!controls.isLocked) {
                setFocused(null);
                return;
            }

            controls.getObject().getWorldPosition(_playerPos);

            let nearest     = null;
            let nearestDist = Infinity;

            for (const entry of registry) {
                _objPos.set(entry.position.x, entry.position.y, entry.position.z);
                const dist = _playerPos.distanceTo(_objPos);
                if (dist < entry.radius && dist < nearestDist) {
                    nearest     = entry;
                    nearestDist = dist;
                }
            }

            setFocused(nearest);
        }
    };
}
