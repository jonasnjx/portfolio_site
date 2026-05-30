export const ROOM = {
    width:  12,
    depth:  12,
    height: 4,
    boundsX: 5.3,
    boundsZ: 5.3,
};

export const COLORS = {
    bg:       0x0a0806,
    wall:     0x3d2b1f,
    floor:    0x2d1e12,
    floorAlt: 0x251807,
    ceiling:  0x1a1008,
    accent:   0x3b82f6,
    accentDim:0x1e40af,
    trim:     0x78350f,
    desk:     0x292524,
    deskTop:  0x4a3728,
    decor:    0x44403c,
    plant:    0x16a34a,
    plantDark:0x14532d,
    pot:      0x9a3412,
    rug:      0x991b1b,
};

export const SPAWN = { x: 0, y: 0, z: 2 };
export const SPAWN_YAW = Math.PI;

export const INTERACTABLES = [
    {
        id:       'resume',
        position: { x: -2.0, y: 0, z: -4.0 },
        radius:   2.5,
        prompt:   'see resume',
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
        id:       'arcade',
        position: { x: 3.5, y: 0, z: -5.0 },
        radius:   2.5,
        prompt:   'see projects',
        modal:    'terminal',
    },
    {
        id:       'telephone',
        position: { x: 3.5, y: 0, z: 0.5 },
        radius:   2.0,
        prompt:   'contact me',
        modal:    'telephone',
    },
    {
        id:       'sofa',
        position: { x: 0, y: 0, z: 4.0 },
        radius:   2.0,
        prompt:   'sit down',
        action:   'sit',
    },
];
