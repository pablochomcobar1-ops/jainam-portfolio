export const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const fragmentShader = `
precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_imageAspect;
uniform float u_radius;
uniform float u_dotSize;
uniform float u_full;

varying vec2 v_uv;

const vec3 LIME = vec3(0.776, 1.0, 0.239);

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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float brightness(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 px = v_uv * u_resolution;
  vec2 center = (floor(px / u_dotSize) + 0.5) * u_dotSize;

  float reach = max(u_radius * u_resolution.y, 1.0);
  float grow = 1.0 - smoothstep(reach * 0.35, reach, length(center - u_mouse * u_resolution));

  vec2 fromMid = (center - u_resolution * 0.5) / (length(u_resolution) * 0.5);
  float spread = length(fromMid) + hash(floor(px / u_dotSize)) * 0.12;
  float wave = 1.0 - smoothstep(u_full * 1.4 - 0.25, u_full * 1.4, spread);
  float front = wave * (1.0 - wave) * 4.0;
  grow = max(grow, wave);

  vec4 cell = texture2D(u_texture, coverUV(center / u_resolution));
  float lum = smoothstep(0.08, 0.85, brightness(cell.rgb));
  float radius = mix(sqrt(lum) * u_dotSize * 0.6, u_dotSize * 0.75, grow);
  float visible = max(smoothstep(0.0, 0.05, lum), grow) * cell.a;
  float dotMask = (1.0 - smoothstep(radius - 0.75, radius + 0.75, length(px - center))) * visible;

  vec4 photo = texture2D(u_texture, coverUV(v_uv));
  float toPhoto = smoothstep(0.0, 0.6, grow);
  vec3 col = mix(LIME, photo.rgb, toPhoto) + LIME * front * 0.35;
  float alpha = dotMask * mix(1.0, photo.a, toPhoto);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;
