export const ROOM = {
    width:  12,
    depth:  12,
    height: 4,
    boundsX: 5.3,
    boundsZ: 5.3,
};

// Blue marble + cosy palette
export const COLORS = {
    bg:       0x0a0d18,
    wall:     0x1e2d4a,  // deep navy blue (marble)
    floor:    0x1a1e2a,  // dark blue-gray marble
    floorAlt: 0x141828,  // darker blue marble
    ceiling:  0x7dd3fc,  // sky blue (cute ceiling)
    accent:   0x60a5fa,  // softer blue accent
    accentDim:0x2563eb,
    trim:     0x4a6fa5,  // marble vein blue
    desk:     0x1e1a2a,
    deskTop:  0x3a3050,
    decor:    0x2a2a4a,
    plant:    0x22c55e,
    plantDark:0x166534,
    pot:      0x8a5028,
    rug:      0x991b1b,
};

export const SPAWN     = { x: 0, y: 0, z: 0 }; // centre of room
export const SPAWN_YAW = Math.PI;                // face north

export const INTERACTABLES = [
    {
        id:       'resume',
        position: { x: 0, y: 0, z: -4.5 },
        radius:   2.5,
        prompt:   'see my resume',
        modal:    'resume',
    },
    {
        id:       'bookshelf',
        position: { x: -5.2, y: 0, z: -1.5 },
        radius:   2.5,
        prompt:   'see case studies',
        modal:    'casestudies',
    },
    {
        id:       'telephone',
        position: { x: 0, y: 0, z: 0.5 },
        radius:   2.0,
        prompt:   'contact me',
        modal:    'telephone',
    },
    {
        id:       'arcade',
        position: { x: -2.5, y: 0, z: 4.0 },
        radius:   2.5,
        prompt:   'see projects',
        modal:    'terminal',
    },
    {
        id:       'sofa',
        position: { x: 3.5, y: 0, z: 2.0 },
        radius:   2.0,
        prompt:   'sit down',
        action:   'sit',
        sitX:     3.5,
        sitZ:     2.0,
        sitRot:   -Math.PI / 2, // face east (toward window)
    },
];
