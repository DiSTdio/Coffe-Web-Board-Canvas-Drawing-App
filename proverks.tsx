// import React, { useReducer, useEffect, useRef } from 'react';
// import { drawingReducer } from './drawingReducer.tsx';
// import './App.css';

// // Типы и конфигурация
// export const DRAWING_CONFIG = {
//     minPointDistance: 2,
//     strokeWidth: 4,
// } as const;

// type Point = {
//     x: number;
//     y: number;
// };

// type Stroke = {
//     id: string;
//     color: string;
//     points: Point[];          // переименовано для краткости
// };

// export type State = {
//     strokes: Stroke[];
//     currentStroke: Stroke | null;
//     undoStack: Stroke[][];
//     redoStack: Stroke[][];
// };

// export type Action =
//     | { type: 'START_STROKE'; payload: { x: number; y: number; color: string } }
//     | { type: 'ADD_POINT'; payload: { x: number; y: number } }
//     | { type: 'END_STROKE' }
//     | { type: 'UNDO' }
//     | { type: 'REDO' }
//     | { type: 'CLEAR' };

// // Вспомогательные функции
// export const getRandomColor = (): string => {
//     const h = Math.floor(Math.random() * 360);
//     const s = 70 + Math.random() * 30;
//     const l = 50 + Math.random() * 30;
//     return `hsl(${h}, ${s}%, ${l}%)`;
// };

// export const generateId = (): string => Math.random().toString(36).substring(2, 9);

// // Начальное состояние
// export const initialState: State = {
//     strokes: [],
//     currentStroke: null,
//     undoStack: [],
//     redoStack: [],
// };

// // Редьюсер (почти без изменений, только strokePoints -> points)
// // function drawingReducer(state: State, action: Action): State {
// //     switch (action.type) {
// //         case 'START_STROKE':
// //             return {
// //                 ...state,
// //                 currentStroke: {
// //                     id: generateId(),
// //                     color: action.payload.color,
// //                     points: [{ x: action.payload.x, y: action.payload.y }],
// //                 },
// //             };

// //         case 'ADD_POINT': {
// //             if (!state.currentStroke) return state;
// //             const points = state.currentStroke.points;
// //             const last = points[points.length - 1];

// //             if (
// //                 Math.abs(action.payload.x - last.x) < DRAWING_CONFIG.minPointDistance &&
// //                 Math.abs(action.payload.y - last.y) < DRAWING_CONFIG.minPointDistance
// //             ) {
// //                 return state;
// //             }

// //             return {
// //                 ...state,
// //                 currentStroke: {
// //                     ...state.currentStroke,
// //                     points: [...points, action.payload],
// //                 },
// //             };
// //         }

// //         case 'END_STROKE':
// //             if (!state.currentStroke) return state;
// //             return {
// //                 ...state,
// //                 undoStack: [...state.undoStack, state.strokes],
// //                 redoStack: [],
// //                 strokes: [...state.strokes, state.currentStroke],
// //                 currentStroke: null,
// //             };

// //         case 'UNDO': {
// //             if (state.undoStack.length === 0) return state;
// //             const previous = state.undoStack[state.undoStack.length - 1];
// //             return {
// //                 strokes: previous,
// //                 undoStack: state.undoStack.slice(0, -1),
// //                 redoStack: [...state.redoStack, state.strokes],
// //                 currentStroke: null,
// //             };
// //         }

// //         case 'REDO': {
// //             if (state.redoStack.length === 0) return state;
// //             const next = state.redoStack[state.redoStack.length - 1];
// //             return {
// //                 strokes: next,
// //                 undoStack: [...state.undoStack, state.strokes],
// //                 redoStack: state.redoStack.slice(0, -1),
// //                 currentStroke: null,
// //             };
// //         }

// //         case 'CLEAR': {
// //             if (state.strokes.length === 0) return state;
// //             return {
// //                 strokes: [],
// //                 undoStack: [...state.undoStack, state.strokes],
// //                 redoStack: [],
// //                 currentStroke: null,
// //             };
// //         }

// //         default:
// //             const _exhaustive: never = action;
// //             return state;
// //     }
// // }

// const loadInitialState = (): State => {
//     try {
//         const saved = localStorage.getItem('drawing-strokes');
//         if (saved) {
//             const strokes = JSON.parse(saved) as Stroke[];
//             return {
//                 ...initialState,
//                 strokes,
//             };
//         }
//     } catch (e) {
//         console.error('Failed to load drawing', e);
//     }
//     return initialState;
// };

// // Компонент App
// function App() {
//     const [state, dispatch] = useReducer(drawingReducer, loadInitialState());
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);

//     // Функция рисования одного штриха
//     const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
//         if (stroke.points.length === 1) {
//             // Рисуем точку как закрашенный круг
//             ctx.beginPath();
//             ctx.fillStyle = stroke.color;
//             const radius = DRAWING_CONFIG.strokeWidth * 1.1;
//             ctx.arc(stroke.points[0].x, stroke.points[0].y, radius, 0, 2 * Math.PI);
//             ctx.fill();
//             return;
//         }

//         if (stroke.points.length < 2) return;
//         ctx.beginPath();
//         ctx.strokeStyle = stroke.color;
//         ctx.lineWidth = DRAWING_CONFIG.strokeWidth;
//         ctx.lineCap = 'round';
//         ctx.lineJoin = 'round';

//         ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
//         for (let i = 1; i < stroke.points.length; i++) {
//             ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
//         }
//         ctx.stroke();
//     };

//     // Перерисовка canvas при изменении strokes или currentStroke
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;

//         // очистка
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         // завершённые штрихи
//         state.strokes.forEach((stroke) => drawStroke(ctx, stroke));

//         // текущий штрих
//         if (state.currentStroke) {
//             drawStroke(ctx, state.currentStroke);
//         }
//     }, [state.strokes, state.currentStroke]);

//     useEffect(() => {
//         try {
//             localStorage.setItem(
//                 'drawing-strokes',
//                 JSON.stringify(state.strokes)
//             );
//         } catch (e) {
//             console.error('Failed to save drawing', e);
//         }
//     }, [state.strokes]);


//     // Обработчики событий с корректировкой координат
//     const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
//         const rect = e.currentTarget.getBoundingClientRect();
//         return {
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top,
//         };
//     };

//     const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
//         const point = getCanvasPoint(e);
//         dispatch({
//             type: 'START_STROKE',
//             payload: { x: point.x, y: point.y, color: getRandomColor() },
//         });
//     };

//     const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
//         if (!state.currentStroke) return;
//         const point = getCanvasPoint(e);
//         dispatch({ type: 'ADD_POINT', payload: point });
//     };

//     const handleMouseUp = () => {
//         dispatch({ type: 'END_STROKE' });
//     };

//     const handleDownload = () => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const dataURL = canvas.toDataURL('image/png');
//         const link = document.createElement('a');
//         link.download = 'drawing.png';
//         link.href = dataURL;
//         link.click();
//     };
//     return (
//         <>
//             <div className="button-bar">
//                 <button onClick={() => dispatch({ type: 'UNDO' })}>↩️ Undo</button>
//                 <button onClick={() => dispatch({ type: 'REDO' })}>↪️ Redo</button>
//                 <button onClick={() => dispatch({ type: 'CLEAR' })}>🧹 Clear</button>
//                 <button onClick={handleDownload}>📲 Download PNG</button>
//             </div>

//             <canvas
//                 ref={canvasRef}
//                 width={window.innerWidth}
//                 height={window.innerHeight}
//                 style={{ border: '1px solid #ccc', display: 'block', margin: '0 auto', backgroundColor: 'rgba(186, 147, 147, 0.754)' }}
//                 onMouseDown={handleMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//                 onMouseLeave={handleMouseUp}
//             />
//         </>
//     );
// }

// export default App;