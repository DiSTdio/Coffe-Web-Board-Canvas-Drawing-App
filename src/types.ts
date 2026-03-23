// Типы и конфигурация
export type Point = {
    x: number;
    y: number;
};

export type Stroke = {
    id: string;
    color: string;
    points: Point[];          // переименовано для краткости
};

export type State = {
    strokes: Stroke[];
    currentStroke: Stroke | null;
    undoStack: Stroke[][];
    redoStack: Stroke[][];
};

export type Action =
    | { type: 'START_STROKE'; payload: { x: number; y: number; color: string } }
    | { type: 'ADD_POINT'; payload: { x: number; y: number } }
    | { type: 'END_STROKE' }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'CLEAR' };
export const initialState: State = {
    strokes: [],
    currentStroke: null,
    undoStack: [],
    redoStack: [],
};