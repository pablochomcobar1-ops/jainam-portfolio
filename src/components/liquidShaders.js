export const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const fragmentShader = `
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_brush;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_radius;
uniform float u_time;
uniform float u_strength;
uniform float u_idle;

varying vec2 v_uv;

// Works like CSS object-fit: cover (crops instead of stretching)
vec2 coverUV(vec2 uv) {
  float boxAspect = u_resolution.x / u_resolution.y;
  vec2 scale = vec2(1.0);
  if (boxAspect > u_imageAspect) {
    scale.y = u_imageAspect / boxAspect;
  } else {
    scale.x = boxAspect / u_imageAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  // 1. Where is this pixel relative to the cursor?
  vec2 diff = v_uv - u_mouse;
  diff.x *= u_resolution.x / u_resolution.y;   // keeps the brush round
  vec2 brushUV = diff / max(u_radius, 0.0001) + 0.5;

  // 2. Read the brush stencil (only inside its square)
  float inside = step(0.0, brushUV.x) * step(brushUV.x, 1.0)
               * step(0.0, brushUV.y) * step(brushUV.y, 1.0);
  float mask = texture2D(u_brush, brushUV).a * inside;
  float strength = clamp(pow(mask, 2.5), 0.0, 1.0);

  // 3. A gentle wobble everywhere, always moving
  vec2 baseWarp = u_idle * vec2(
    sin(v_uv.y * 10.0 + u_time * 0.75),
    cos(v_uv.x * 10.0 - u_time * 0.75)
  );

  // 4. A strong wobble only under the brush
  vec2 brushWarp = strength * u_strength * vec2(
    sin(v_uv.y * 20.0 + u_time * 2.0),
    sin(v_uv.x * 40.0 - u_time * 2.0)
  );

  // 5. Read the image at the wobbled position
  gl_FragColor = texture2D(u_texture, coverUV(v_uv + baseWarp + brushWarp));
}
`;
