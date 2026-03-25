export const DRAWING_CONFIG = {
    minPointDistance: 2,
    strokeWidth: 4,
} as const;

export const getRandomColor = (): string => {
    const h = Math.floor(Math.random() * 360);
    const s = 70 + Math.random() * 30;
    const l = 50 + Math.random() * 30;
    return `hsl(${h}, ${s}%, ${l}%)`;
};

export const generateId = (): string => Math.random().toString(36).substring(2, 9);


