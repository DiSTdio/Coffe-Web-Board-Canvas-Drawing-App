import { DRAWING_CONFIG, generateId } from './constants'
import { State, Action, } from './types';

export function drawingReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'START_STROKE':
            console.log('START_STROKE', action.payload);
            return {
                ...state,
                currentStroke: {
                    id: generateId(),
                    color: action.payload.color,
                    points: [{ x: action.payload.x, y: action.payload.y }],
                },
            };

        case 'ADD_POINT':
            console.log('ADD_POINT', action.payload); {
                if (!state.currentStroke) return state;
                const points = state.currentStroke.points;
                const last = points[points.length - 1];

                if (
                    Math.abs(action.payload.x - last.x) < DRAWING_CONFIG.minPointDistance &&
                    Math.abs(action.payload.y - last.y) < DRAWING_CONFIG.minPointDistance
                ) {
                    return state;
                }

                return {
                    ...state,
                    currentStroke: {
                        ...state.currentStroke,
                        points: [...points, action.payload],
                    },
                };
            }

        case 'END_STROKE':
            console.log('END_STROKE');
            if (!state.currentStroke) return state;
            return {
                ...state,
                undoStack: [...state.undoStack, state.strokes],
                redoStack: [],
                strokes: [...state.strokes, state.currentStroke],
                currentStroke: null,
            };

        case 'UNDO':
            console.log('UNDO');
            {
                if (state.undoStack.length === 0) return state;

                const previous = state.undoStack[state.undoStack.length - 1];

                return {
                    strokes: previous,
                    undoStack: state.undoStack.slice(0, -1),
                    redoStack: [...state.redoStack, state.strokes],
                    currentStroke: null,
                };
            }

        case 'REDO': {
            if (state.redoStack.length === 0) return state;
            const next = state.redoStack[state.redoStack.length - 1];
            return {
                strokes: next,
                undoStack: [...state.undoStack, state.strokes],
                redoStack: state.redoStack.slice(0, -1),
                currentStroke: null,
            };
        }

        case 'CLEAR': {
            if (state.strokes.length === 0) return state;
            return {
                strokes: [],
                undoStack: [...state.undoStack, state.strokes],
                redoStack: [],
                currentStroke: null,
            };
        }

        default:
            const _exhaustive: never = action;
            return state;
    }
}