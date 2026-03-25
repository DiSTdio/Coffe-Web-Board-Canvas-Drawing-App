import { DRAWING_CONFIG, generateId } from './constants'
import { State, Action, } from './types';

// 。。後は、英語ですみません。Reducer for managing drawing state (strokes, undo/redo, current stroke)
export function drawingReducer(state: State, action: Action): State {

    console.log('[REDUCER]', action.type, action);

    switch (action.type) {
        case 'START_STROKE':

            return {
                ...state,
                currentStroke: {
                    id: generateId(),
                    color: action.payload.color,
                    points: [{ x: action.payload.x, y: action.payload.y }],
                },
            };

        case 'ADD_POINT':

            if (!state.currentStroke) {
                console.warn('[ADD_POINT] ignored: no currentStroke');
                return state;
            }
            const points = state.currentStroke.points;
            const last = points[points.length - 1];

            if (
                // Skip points that are too close to reduce noise
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


        case 'END_STROKE':

            if (!state.currentStroke) return state;
            return {
                ...state,
                undoStack: [...state.undoStack, state.strokes],
                redoStack: [],
                strokes: [...state.strokes, state.currentStroke],
                currentStroke: null,
            };

        case 'UNDO': {

            if (state.undoStack.length === 0) {
                console.warn('[UNDO] ignored: undoStack is empty');
                return state;
            }

            const previous = state.undoStack[state.undoStack.length - 1];

            return {
                strokes: previous,
                undoStack: state.undoStack.slice(0, -1),
                redoStack: [...state.redoStack, state.strokes],
                currentStroke: null,
            };
        }

        case 'REDO': {

            if (state.redoStack.length === 0) {
                console.warn('[REDO] ignored: redoStack is empty');
                return state;
            }
            const next = state.redoStack[state.redoStack.length - 1];
            return {
                strokes: next,
                undoStack: [...state.undoStack, state.strokes],
                redoStack: state.redoStack.slice(0, -1),
                currentStroke: null,
            };
        }

        case 'CLEAR': {

            if (state.strokes.length === 0) {
                console.warn('[CLEAR] ignored: nothing to clear');
                return state;
            }
            return {
                strokes: [],
                undoStack: [...state.undoStack, state.strokes],
                redoStack: [],
                currentStroke: null,
            };
        }

        default:
            // // Ensure all action types are handled (exhaustive check)
            // const _exhaustive: never = action;
            // return state;
            return assertNever(action);
    }
}

function assertNever(x: never): never {
    throw new Error("Unexpected action: " + JSON.stringify(x));
}