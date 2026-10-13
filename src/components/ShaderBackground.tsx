"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   ShaderBackground — "The Sovereign Machine" ambient layer.
   Custom GLSL: dark blueprint grid with slow current-like pulses
   drifting along the grid lines. GPU-cheap single fullscreen pass.

   Fully self-contained: no textures, no fonts, no network calls.
   prefers-reduced-motion (or no WebGL) -> the static CSS grid
   underneath (blueprint-static) is all that renders.
   ============================================================ */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float gridLine(vec2 p, float cells) {
  vec2 g = abs(fract(p * cells - 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);

  // base: abyss
  vec3 col = vec3(0.043, 0.067, 0.098);

  // fine + major blueprint grids
  float fine = gridLine(p, 24.0);
  float major = gridLine(p, 6.0);
  col += vec3(0.102, 0.137, 0.196) * fine * 0.5;
  col += vec3(0.157, 0.200, 0.259) * major * 0.6;

  // pulses: current drifting along grid lines
  float aspect = u_res.x / u_res.y;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float speed = 0.028 + 0.014 * fract(fi * 0.6180339);
    float t = fract(u_time * speed + fi * 0.371);
    vec2 q;
    vec2 dir;
    if (mod(fi, 2.0) < 1.0) {
      // horizontal lane: y sits on a major grid row, x sweeps
      float row = (floor(fi * 1.7) + 0.5) / 6.0;
      q = vec2(t * aspect, row);
      dir = vec2(1.0, 0.0);
    } else {
      // vertical lane: x sits on a major grid column, y sweeps
      float colu = (floor(fi * 2.3) + 0.5) / 10.0;
      q = vec2(colu * aspect, t);
      dir = vec2(0.0, 1.0);
    }
    vec2 dvec = p - q;
    float along = dot(dvec, dir);
    vec2 across = dvec - dir * along;
    float core = exp(-dot(dvec, dvec) * 900.0);
    float trail = exp(-along * along * 28.0) * exp(-dot(across, across) * 2600.0)
      * step(along, 0.0);
    vec3 pc = mod(fi, 3.0) < 1.0
      ? vec3(0.851, 0.651, 0.282)   // gold
      : vec3(0.357, 0.482, 0.639);  // steel blue
    col += pc * (core * 1.1 + trail * 0.55);
  }

  // vignette: keep the edges deep
  float vig = smoothstep(1.25, 0.35, length(uv - 0.5) * 1.6);
  col *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader alloc failed");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("shader compile failed");
  }
  return shader;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    let program: WebGLProgram | null = null;
    let raf = 0;
    let start = performance.now();

    try {
      program = gl.createProgram();
      if (!program) throw new Error("program alloc failed");
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("program link failed");
      }
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, "u_res");
      const uTime = gl.getUniformLocation(program, "u_time");

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.floor(window.innerWidth * dpr);
        const h = Math.floor(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      };
      resize();
      window.addEventListener("resize", resize);

      const frame = () => {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (performance.now() - start) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(frame);
      };
      frame();

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (program) gl.deleteProgram(program);
        const ext = gl.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      };
    } catch {
      // WebGL unavailable or shader failed: the static grid div
      // underneath stays visible. No error UI; the page just works.
      if (program) gl.deleteProgram(program);
      cancelAnimationFrame(raf);
      return undefined;
    }
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      {/* Static fallback: always painted; the canvas layers over it. */}
      <div className="blueprint-static absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
