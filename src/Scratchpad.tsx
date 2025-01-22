import React from "react";
import { useState } from "react";

export function Scratchpad(): React.ReactNode {
  return (
    <div id="scratchpad-root">
      <button id="scratchpad-clear">⌫ Clear</button>
      <div id="scratchpad-autoclear-container">
        <input type="checkbox" id="scratchpad-autoclear" checked />
        <label htmlFor="scratchpad-autoclear">Clear when changing cards</label>
      </div>
      <div id="scratchpad-canvas-container">
        <canvas id="scratchpad"></canvas>
      </div>
    </div>
  );
}
