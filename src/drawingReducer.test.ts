import { drawingReducer as reducer } from './drawingReducer';
import { State, Action, initialState } from './types';
import './App.css';
// или импортируй из App, если экспортировал

describe('drawing app reducer', () => {
    // 1. START_STROKE
    it('creates current stroke with first point', () => {
        const state: State = { ...initialState };
        const action: Action = {
            type: 'START_STROKE',
            payload: { x: 10, y: 20, color: 'red' }
        };
        const next = reducer(state, action);
        expect(next.currentStroke).not.toBeNull();
        expect(next.currentStroke?.color).toBe('red');
        expect(next.currentStroke?.points).toEqual([{ x: 10, y: 20 }]);
        expect(next.currentStroke?.id).toBeDefined(); // id генерируется
    });

    // 2. ADD_POINT — добавляет точку, если далеко
    it('adds point if far enough from last', () => {
        const state: State = {
            ...initialState,
            currentStroke: {
                id: '1',
                color: 'red',
                points: [{ x: 0, y: 0 }]
            }
        };
        const action: Action = {
            type: 'ADD_POINT',
            payload: { x: 10, y: 10 } // расстояние > minPointDistance (2)
        };
        const next = reducer(state, action);
        expect(next.currentStroke?.points.length).toBe(2);
        expect(next.currentStroke?.points[1]).toEqual({ x: 10, y: 10 });
    });

    // 3. ADD_POINT — не добавляет, если слишком близко
    it('does not add point if too close', () => {
        const state: State = {
            ...initialState,
            currentStroke: {
                id: '1',
                color: 'red',
                points: [{ x: 0, y: 0 }]
            }
        };
        const action: Action = {
            type: 'ADD_POINT',
            payload: { x: 1, y: 1 } // расстояние < 2
        };
        const next = reducer(state, action);
        expect(next.currentStroke?.points.length).toBe(1);
    });

    // 4. ADD_POINT — ничего не делает, если currentStroke = null
    it('does nothing when no current stroke', () => {
        const state: State = { ...initialState, currentStroke: null };
        const action: Action = {
            type: 'ADD_POINT',
            payload: { x: 5, y: 5 }
        };
        const next = reducer(state, action);
        expect(next).toBe(state); // должен вернуть тот же объект (или проверить равенство)
    });

    // 5. END_STROKE — переносит currentStroke в strokes, обновляет undoStack, чистит redoStack
    it('ends stroke and moves to strokes', () => {
        const current = {
            id: '1',
            color: 'blue',
            points: [{ x: 0, y: 0 }, { x: 1, y: 1 }]
        };
        const state: State = {
            strokes: [],
            currentStroke: current,
            undoStack: [],
            redoStack: [[{ id: 'old', color: 'red', points: [] }]] // допустим, что-то есть
        };
        const action: Action = { type: 'END_STROKE' };
        const next = reducer(state, action);
        expect(next.strokes).toEqual([current]);
        expect(next.currentStroke).toBeNull();
        expect(next.undoStack).toEqual([[]]); // предыдущие strokes (пустые) добавлены в undoStack
        expect(next.redoStack).toEqual([]);
    });

    // 6. UNDO — когда есть undoStack, откатывает
    it('undo restores previous strokes', () => {
        const previousStrokes = [{ id: '1', color: 'red', points: [] }];
        const state: State = {
            strokes: [{ id: '2', color: 'blue', points: [] }],
            currentStroke: null,
            undoStack: [previousStrokes],
            redoStack: []
        };
        const action: Action = { type: 'UNDO' };
        const next = reducer(state, action);
        expect(next.strokes).toEqual(previousStrokes);
        expect(next.undoStack).toEqual([]);
        expect(next.redoStack).toEqual([[{ id: '2', color: 'blue', points: [] }]]);
    });

    // 7. UNDO — когда undoStack пуст, ничего не делает
    it('undo does nothing if undoStack empty', () => {
        const state: State = {
            strokes: [],
            currentStroke: null,
            undoStack: [],
            redoStack: []
        };
        const action: Action = { type: 'UNDO' };
        const next = reducer(state, action);
        expect(next).toBe(state); // или проверить, что состояние не изменилось
    });

    // 8. REDO — симметрично
    it('redo restores from redoStack', () => {
        const nextStrokes = [{ id: '3', color: 'green', points: [] }];
        const state: State = {
            strokes: [{ id: '2', color: 'blue', points: [] }],
            currentStroke: null,
            undoStack: [],
            redoStack: [nextStrokes]
        };
        const action: Action = { type: 'REDO' };
        const next = reducer(state, action);
        expect(next.strokes).toEqual(nextStrokes);
        expect(next.redoStack).toEqual([]);
        expect(next.undoStack).toEqual([[{ id: '2', color: 'blue', points: [] }]]);
    });

    // 9. REDO — пустой redoStack ничего не меняет
    it('redo does nothing if redoStack empty', () => {
        const state: State = {
            strokes: [],
            currentStroke: null,
            undoStack: [],
            redoStack: []
        };
        const action: Action = { type: 'REDO' };
        const next = reducer(state, action);
        expect(next).toBe(state);
    });

    // 10. CLEAR — очищает strokes, добавляет в undoStack
    it('clear removes all strokes and pushes to undo', () => {
        const currentStrokes = [{ id: '1', color: 'red', points: [] }];
        const state: State = {
            strokes: currentStrokes,
            currentStroke: null,
            undoStack: [],
            redoStack: [[{ id: 'old', color: 'blue', points: [] }]]
        };
        const action: Action = { type: 'CLEAR' };
        const next = reducer(state, action);
        expect(next.strokes).toEqual([]);
        expect(next.undoStack).toEqual([currentStrokes]);
        expect(next.redoStack).toEqual([]);
    });

    // 11. CLEAR — если strokes пусты, ничего не делает
    it('clear does nothing if strokes already empty', () => {
        const state: State = {
            strokes: [],
            currentStroke: null,
            undoStack: [],
            redoStack: []
        };
        const action: Action = { type: 'CLEAR' };
        const next = reducer(state, action);
        expect(next).toBe(state);
    });
});