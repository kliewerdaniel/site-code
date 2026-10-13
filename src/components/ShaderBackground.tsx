"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   ShaderBackground — "The Sovereign Machine" ambient layer.
   v2.1: restraint pass. The grid is FELT, not seen: near-black
   base, hairlines at ~8% opacity, no pulses, no orbs, nothing
   that can ever compete with the text layer. A single slow
   breathing of overall brightness is the only motion.

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
  return 1.0 - smoothstep(0.0, 0.03, min(g.x, g.y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);

  // base: near-black with a breath of navy
  vec3 col = vec3(0.020, 0.028, 0.045);

  // whisper grids — visible only if you look for them
  float fine = gridLine(p, 28.0);
  float major = gridLine(p, 7.0);
  col += vec3(0.357, 0.482, 0.639) * fine * 0.055;
  col += vec3(0.357, 0.482, 0.639) * major * 0.085;

  // one slow breath of brightness, ±2.5% over ~40 seconds
  float breath = 0.975 + 0.025 * sin(u_time * 0.157);
  col *= breath;

  // deep vignette: edges fall to pure black
  float vig = smoothstep(1.3, 0.3, length(uv - 0.5) * 1.6);
  col *= mix(0.45, 1.0, vig);

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
