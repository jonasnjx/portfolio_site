import * as THREE from 'three';

const _playerPos = new THREE.Vector3();
const _objPos    = new THREE.Vector3();

export function initInteraction(controls, registry, openModal, startPick) {
    const promptEl   = document.getElementById('prompt');
    const promptText = document.getElementById('prompt-text');

    let focused = null;

    function setFocused(entry) {
        if (focused === entry) return;
        if (focused) focused.onBlur();
        focused = entry;
        if (focused) focused.onFocus();
    }

    function handleClick() {
        if (!controls.isLocked) return;

        // Stand up from sofa on click
        if (controls.isSitting) {
            controls.standUp();
            return;
        }

        if (!focused) return;

        if (focused.action === 'sit') {
            controls.sit(focused.position);
        } else if (focused.href) {
            startPick(() => { window.location.href = focused.href; }, 'default');
        } else if (focused.modal) {
            const type = focused.id === 'telephone' ? 'phone' : 'default';
            startPick(() => {
                controls.unlock();
                openModal(focused.modal);
            }, type);
        }
    }

    // Left click — works while pointer is locked
    document.addEventListener('mousedown', e => {
        if (e.button === 0) handleClick();
    });

    return {
        update(_dt) {
            if (!controls.isLocked) {
                setFocused(null);
                promptEl.classList.remove('visible');
                return;
            }

            controls.getObject().getWorldPosition(_playerPos);

            let nearest = null, nearestDist = Infinity;
            for (const entry of registry) {
                _objPos.set(entry.position.x, entry.position.y, entry.position.z);
                const dist = _playerPos.distanceTo(_objPos);
                if (dist < entry.radius && dist < nearestDist) {
                    nearest = entry;
                    nearestDist = dist;
                }
            }

            setFocused(nearest);

            if (focused) {
                const label = (controls.isSitting && focused.action === 'sit')
                    ? 'Click to stand up'
                    : `Click to ${focused.prompt}`;
                promptText.textContent = label;
                promptEl.classList.add('visible');
            } else {
                promptEl.classList.remove('visible');
            }
        }
    };
}
