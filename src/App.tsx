import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import { drawingReducer } from './drawingReducer';
import { useWindowResize } from './Resize';
import { DRAWING_CONFIG, getRandomColor } from './constants'
import { State, initialState, Stroke, Point } from './types';
import './App.css';

const loadInitialState = (): State => {
  try {
    const saved = localStorage.getItem('drawing-strokes');
    if (saved) {
      const strokes = JSON.parse(saved) as Stroke[];
      return {
        ...initialState,
        strokes,
      };
    }
  } catch (e) {
    console.error('Failed to load drawing', e);
  }
  return initialState;
};

function App() {
  const [state, dispatch] = useReducer(drawingReducer, loadInitialState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerId = useRef<number | null>(null);

  // 最初の点が丸い点として描画されるように、drawStroke関数を修正
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 1) {
      // 丸い点を描画
      ctx.beginPath();
      ctx.fillStyle = stroke.color;
      const radius = DRAWING_CONFIG.strokeWidth * 1.1;
      ctx.arc(stroke.points[0].x, stroke.points[0].y, radius, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    if (stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = DRAWING_CONFIG.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  };

  // sizeについて
  const { width, height } = useWindowResize();

  // strokesまたはcurrentStrokeが変更されたときにcanvasを再描画します
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画布をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // すべてのstrokesを描画

    state.strokes.forEach((stroke: Stroke) => drawStroke(ctx, stroke));

    // 現在のstroke
    if (state.currentStroke) {
      drawStroke(ctx, state.currentStroke);
    }
  }, [state.strokes, state.currentStroke, width, height]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'drawing-strokes',
        JSON.stringify(state.strokes)
      );
    } catch (e) {
      console.error('Failed to save drawing', e);
    }
  }, [state.strokes]);

  useEffect(() => {
    console.log('STROKES UPDATED', state.strokes.length);
  }, [state.strokes]);


  // 座標調整を伴うイベントハンドラ
  const getCanvasPoint = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;

    const point = getCanvasPoint(e);
    console.log('[POINTER_DOWN]', point);

    dispatch({
      type: 'START_STROKE',
      payload: {
        x: point.x,
        y: point.y,
        color: getRandomColor(),
      },
    });

  };


  const lastTimeRef = useRef(0);
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const now = Date.now();
    if (now - lastTimeRef.current < 17) return; // ~~~~60fps
    lastTimeRef.current = now;

    if (
      !state.currentStroke ||
      activePointerId.current !== e.pointerId
    ) {
      return;
    }

    const point = getCanvasPoint(e);
    dispatch({ type: 'ADD_POINT', payload: point });
  };

  const endPointerStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore errors if pointer capture was already released
    }

    activePointerId.current = null;
    dispatch({ type: 'END_STROKE' });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    link.click();
  };



  return (
    <>
      <div className="button-bar">
        <button onClick={() => dispatch({ type: 'UNDO' })}>↩️ Undo</button>
        <button onClick={() => dispatch({ type: 'REDO' })}>↪️ Redo</button>
        <button onClick={() => dispatch({ type: 'CLEAR' })}>🧹 Clear</button>
        <button onClick={handleDownload}>📲 Download PNG</button>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          touchAction: 'none',
          border: '1px solid #ccc',
          display: 'block',
          margin: '0 auto',
          backgroundColor: 'rgba(186, 147, 147, 0.754)',
        }} onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerStroke}
        onPointerLeave={endPointerStroke}
      />
    </>
  );
}

export default App;