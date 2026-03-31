import { drawingReducer as reducer } from './drawingReducer';
import { State, Action, initialState } from './types';
import './App.css';


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
        expect(next.currentStroke?.id).toBeDefined(); // IDを生成する必要があるはずだから、存在することを確認します
    });

    // 2. ADD_POINT — 遠すぎる場合は丸を追加する
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
            payload: { x: 10, y: 10 } // 距離 > minPointDistance (2)
        };
        const next = reducer(state, action);
        expect(next.currentStroke?.points.length).toBe(2);
        expect(next.currentStroke?.points[1]).toEqual({ x: 10, y: 10 });
    });

    // 3. ADD_POINT — 遠くない場合は追加しない
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
            payload: { x: 1, y: 1 } // 距離 < 2
        };
        const next = reducer(state, action);
        expect(next.currentStroke?.points.length).toBe(1);
    });

    // 4. ADD_POINT — 何も起こらない if currentStroke = null
    it('does nothing when no current stroke', () => {
        const state: State = { ...initialState, currentStroke: null };
        const action: Action = {
            type: 'ADD_POINT',
            payload: { x: 5, y: 5 }
        };
        const next = reducer(state, action);
        expect(next).toBe(state); // 必ず同じオブジェクトを返す (または等価性を確認する)
    });

    // 5. END_STROKE — currentStrokeをstrokesに移動し、undoStackを更新し、redoStackをクリアします。
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
            redoStack: [[{ id: 'old', color: 'red', points: [] }]]
        };
        const action: Action = { type: 'END_STROKE' };
        const next = reducer(state, action);
        expect(next.strokes).toEqual([current]);
        expect(next.currentStroke).toBeNull();
        expect(next.undoStack).toEqual([[]]); // 以前の strokes（空）がundoStackに追加されました
        expect(next.redoStack).toEqual([]);
    });

    // 6. UNDO — undoStackが存在する場合、ロールバックされます
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

    // 7. UNDO — undoStackが空の場合は何もしない
    it('undo does nothing if undoStack empty', () => {
        const state: State = {
            strokes: [],
            currentStroke: null,
            undoStack: [],
            redoStack: []
        };
        const action: Action = { type: 'UNDO' };
        const next = reducer(state, action);
        expect(next).toBe(state); // または 状態が変わっていないことを確認してください
    });

    // 8. REDO — simmetrically
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

    // 9. REDO — 空のredoStackは何も変更しません。
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

    // 10. CLEAR —  strokesをクリアし、「undoStack」に追加します
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

    // 11. CLEAR — 空のCLEARは何も変更しません。
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