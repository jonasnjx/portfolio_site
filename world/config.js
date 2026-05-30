// Single source of truth for all positions, colors, and object data.
// Edit here — never hardcode values in other modules.

export const ROOM = {
    width:  12,
    depth:  12,
    height: 4,
    // Walkable bounds (player radius ~0.4 from walls)
    boundsX: 5.3,
    boundsZ: 5.3,
};

export const COLORS = {
    bg:       0x0f0608,
    wall:     0x1a0e0a,
    floor:    0x1c110a,
    floorAlt: 0x16100a,
    ceiling:  0x0a0508,
    accent:   0x3b82f6,
    accentDim:0xc2410c,
    trim:     0xd97706,
    desk:     0x292524,
    deskTop:  0x44403c,
    screen:   0x0a0608,
    decor:    0x44403c,
    plant:    0x166534,
    plantDark:0x14532d,
    pot:      0x78350f,
    rug:      0x7f1d1d,
};

export const SPAWN = { x: 0, y: 1.6, z: 4 };

// Each interactable: id, position, radius (proximity trigger), prompt text, action type
export const INTERACTABLES = [
    {
        id:       'resume',
        position: { x: -3.5, y: 0, z: -5 },
        radius:   2.5,
        prompt:   'View Résumé',
        modal:    'resume',
    },
    {
        id:       'tv',
        position: { x: 0,    y: 0, z: -5.6 },
        radius:   2.5,
        prompt:   'Watch Intro',
        modal:    'video',
    },
    {
        id:       'terminal',
        position: { x: 3.5,  y: 0, z: -5 },
        radius:   2.5,
        prompt:   'View My Work',
        modal:    'terminal',
    },
    {
        id:       'connect',
        position: { x: -5.5, y: 0, z: 0 },
        radius:   2.2,
        prompt:   'Connect with Me',
        href:     '/connect',
    },
];
