import React from "react";
import { useState, useEffect, useRef } from "react";

export function Scratchpad(): React.ReactNode {

  const [autoclear, setAutoclear] = useState<boolean>(true);

  const toggleAutoclear = () => setAutoclear(!autoclear);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const killItWithFire = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const events = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];

    const target = ref.current;
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

  return (
    <div id="scratchpad-root">
      <button id="scratchpad-clear">⌫ Clear</button>
      <div id="scratchpad-autoclear-container">
        <input
          type="checkbox"
          id="scratchpad-autoclear"
          checked={autoclear}
          onChange={toggleAutoclear} />
        <label htmlFor="scratchpad-autoclear">Clear when changing cards</label>
      </div>
      <div ref={ref} id="scratchpad-canvas-container">
        <canvas id="scratchpad"></canvas>
      </div>
    </div>
  );
}
