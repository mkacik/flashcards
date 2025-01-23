import React from "react";
import { useState, useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
  pressure: number;
}

export function Scratchpad(): React.ReactNode {
  // TODO: this currently does nothing!
  const [autoclear, setAutoclear] = useState<boolean>(true);

  const toggleAutoclear = () => setAutoclear(!autoclear);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const killItWithFire = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const events = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

    const target = containerRef.current;
    if (target !== null) {
      for (const e of events) {
        target.addEventListener(e, killItWithFire, {passive: false});
      }
    }

    return () => {
      if (target !== null) {
        for (const e of events) {
          target.removeEventListener(e, killItWithFire);
        }
      }
    };
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const clearButton = clearButtonRef.current;
    const stroke: Array<Point> = [];

    if ((canvas === null) || (clearButton === null)) {
      return;
    }

    const drawOnCanvas = () => {
      const i = stroke.length - 1;
      const ctx = canvas.getContext('2d', { desynchronized: true})!;
      ctx.strokeStyle = '#000000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (stroke.length < 3) {
        const it = stroke.at(i)!;
        ctx.lineWidth = it.pressure * 2;
        ctx.beginPath();
        ctx.moveTo(it.x, it.y);
        ctx.stroke();
        return;
      }

      const cpx = (stroke[i].x + stroke[i - 1].x) / 2;
      const cpy = (stroke[i].y + stroke[i - 1].y) / 2;
      ctx.lineWidth = stroke[i - 1].pressure * 10;
      ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, cpx, cpy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cpx, cpy);
    };

    const onCanvasPointerMove = (e) => {
      e.stopPropagation()
      if (e.pressure === 0) {
        stroke.length = 0;
        return;
      }

      const parentElement = canvas.parentElement!;
      const w = parentElement.offsetWidth;
      const h = parentElement.offsetHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const point: Point = { x: e.offsetX, y: e.offsetY, pressure: e.pressure} as Point;
      stroke.push(point);
      drawOnCanvas();
    };

    const clearCanvas = () => {
      canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    }

    const clearStroke = () => {
      stroke.length = 0;
    };

    canvas.addEventListener('pointermove', onCanvasPointerMove);
    canvas.addEventListener('pointerleave', clearStroke);
    clearButton.addEventListener('click', clearCanvas);

    return () => {
      canvas.removeEventListener('pointermove', onCanvasPointerMove);
      canvas.removeEventListener('pointerleave', clearStroke);
      clearButton.removeEventListener('click', clearCanvas);
    };
  });

  return (
    <div id="scratchpad-root">
      <button ref={clearButtonRef} id="scratchpad-clear">⌫ Clear</button>
      <div id="scratchpad-autoclear-container">
        <input
          type="checkbox"
          id="scratchpad-autoclear"
          checked={autoclear}
          onChange={toggleAutoclear} />
        <label htmlFor="scratchpad-autoclear">Clear when changing cards</label>
      </div>
      <div ref={containerRef} id="scratchpad-canvas-container">
        <canvas ref={canvasRef} id="scratchpad"></canvas>
      </div>
    </div>
  );
}
