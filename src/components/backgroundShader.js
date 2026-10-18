export const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const fragmentShader = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_energy;
uniform float u_scroll;
uniform float u_strikeX;
uniform float u_strikeAge;
uniform float u_strikeSeed;

varying vec2 v_uv;

const vec3 BG = vec3(0.039);                 // #0a0a0a, same as the page
const vec3 SMOKE = vec3(0.075, 0.085, 0.07); // the soft smoke
const vec3 LIME = vec3(0.776, 1.0, 0.239);   // #c6ff3d, your accent

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p = rot * p * 2.0;
    amp *= 0.5;
  }
  return value;
}

// ---------- Lightning ----------

// How far the bolt is pushed sideways at height y
float boltPath(float y, float seed) {
  float wander = (fbm(vec2(y * 3.0, seed)) - 0.5) * 0.5;          // big slow curves
  float jag = (noise(vec2(y * 40.0, seed * 2.0)) - 0.5) * 0.03;   // sharp zig-zags
  return wander + jag;
}

// Brightness at a given distance from a bolt line
float boltLine(float dist) {
  float core = 1.0 - smoothstep(0.0, 0.003, dist); // thin white-hot center
  float glow = 0.002 / (dist + 0.002);             // electric glow around it
  return core + glow * 0.8;
}

float lightning(vec2 uv, float aspect) {
  float seed = u_strikeSeed;
  float age = u_strikeAge;

  // Where the bolt ends, and how far down it has travelled so far
  float endY = 0.05 + 0.25 * fract(seed * 5.3);
  float head = 1.0 - clamp(age / 0.08, 0.0, 1.0) * (1.0 - endY);
  if (uv.y < head) return 0.0;

  // Main bolt
  float path = u_strikeX + boltPath(uv.y, seed);
  float trunk = boltLine(abs(uv.x - path) * aspect) * smoothstep(endY, endY + 0.15, uv.y);

  // One branch that splits off partway down
  float by = endY + (1.0 - endY) * (0.55 + 0.2 * fract(seed * 1.7));
  float dir = fract(seed * 3.1) > 0.5 ? 1.0 : -1.0;
  float bt = clamp((by - uv.y) / 0.3, 0.0, 1.0);
  float bx = path + dir * (by - uv.y) * 0.5
           + (fbm(vec2(uv.y * 6.0, seed + 11.0)) - 0.5) * 0.08 * bt;
  float inBranch = step(uv.y, by) * step(by - 0.3, uv.y) * (1.0 - bt);
  float branch = boltLine(abs(uv.x - bx) * aspect) * 0.6 * inBranch;

  return trunk + branch;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 drift = vec2(0.0, u_scroll * 3.0);
  vec2 p = (v_uv - 0.5) * vec2(aspect, 1.0) * 2.5 + drift;
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0) * 2.5 + drift;

  // 1. Stir: twist space around the cursor (harder when the mouse moves fast)
  vec2 toM = p - m;
  float angle = (0.4 + u_energy * 2.0) * exp(-dot(toM, toM) * 0.8);
  float s = sin(angle);
  float c = cos(angle);
  p = m + mat2(c, s, -s, c) * toM;

  // 2. Domain warping: noise bends the coordinates of noise, twice
  float t = u_time * 0.05;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 1.5),
    fbm(p + 4.0 * q + vec2(8.3, 2.8) - t)
  );
  float f = fbm(p + 4.0 * r);

  // 3. Color: dark smoke, glowing veins, thin contour lines
  float smokeAmt = smoothstep(0.3, 0.75, f);
  vec3 col = mix(BG, SMOKE, smokeAmt);
  float veins = pow(smoothstep(0.5, 0.72, f), 2.0) * length(r);
  col += LIME * veins * 0.28;
  float ridge = 1.0 - smoothstep(0.0, 0.03, abs(f - 0.52));
  col += LIME * ridge * 0.12 * smoothstep(0.4, 0.9, length(r));

  // 4. Soft glow that follows the cursor
  vec2 dm = (v_uv - u_mouse) * vec2(aspect, 1.0);
  col += LIME * (0.03 + u_energy * 0.06) * exp(-dot(dm, dm) * 8.0);

  // 5. Lightning flash: fades out while flickering
  float flash = max(exp(-u_strikeAge * 4.0) * (0.55 + 0.45 * sin(u_strikeAge * 75.0)), 0.0);

  // Smoke near the bolt lights up from inside, like storm clouds
  if (flash > 0.002) {
    float near = exp(-abs(v_uv.x - u_strikeX) * aspect * 2.5);
    col += LIME * flash * (0.35 * smokeAmt + 0.04) * near;
  }

  // 6. Vignette: darker edges keep focus on the middle
  float vig = 1.0 - smoothstep(0.2, 1.2, length((v_uv - 0.5) * vec2(aspect, 1.0)));
  col *= 0.55 + 0.45 * vig;

  // 7. The bolt itself, drawn last so it stays bright even at the edges
  if (flash > 0.002) {
    vec3 hot = mix(LIME, vec3(1.0), 0.6); // white-hot lime
    col += hot * min(lightning(v_uv, aspect), 3.0) * flash;
  }

  gl_FragColor = vec4(col, 1.0);
}
`;
