/**
 * High Reach Signature Fluid Gradient Effect
 * Proprietary WebGL fluid shader engineered exclusively for High Reach Media
 * Features 3D Gradient Noise with analytical derivatives, procedural film-grain texture,
 * smooth multi-stop color blending, cursor-flow reactivity, and autonomous fluid breathing.
 * Supports multiple instances (Contact page hero and Homepage footer CTA).
 */
(function () {
  'use strict';

  function hexToRgb(hex) {
    var num = parseInt(hex.replace('#', ''), 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    ];
  }

  // High Reach official logo gradient palette:
  // Yellow (#FDE813) -> Light Lime (#A7DD87) -> Mint Teal (#5FC0AD) -> Brand Blue (#0062F7)
  var color1 = hexToRgb('#fde813');
  var color2 = hexToRgb('#a7dd87');
  var color3 = hexToRgb('#5fc0ad');
  var color4 = hexToRgb('#0062f7');

  var vsSource300 = `#version 300 es
in vec2 position;
out vec2 vPosition;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vPosition = position;
}
`;

  var vsSource100 = `
attribute vec2 position;
varying vec2 vPosition;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vPosition = position;
}
`;

  var fsSource300 = `#version 300 es
precision highp float;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform float colorSize;
uniform float colorSpacing;
uniform float colorRotation;
uniform float colorSpread;
uniform float displacement;
uniform float zoom;
uniform float spacing;
uniform float seed;
uniform vec2 viewportSize;
uniform vec2 colorOffset;
uniform vec2 transformPosition;
uniform float noiseSize;
uniform float noiseIntensity;

in vec2 vPosition;
out vec4 fragColor;

vec3 gradientDerivativesNoise3DHash(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

vec4 gradientDerivativesNoise3D(in vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
  
  vec3 ga = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 0.0));
  vec3 gb = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 0.0));
  vec3 gc = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 0.0));
  vec3 gd = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 0.0));
  vec3 ge = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 1.0));
  vec3 gf = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 1.0));
  vec3 gg = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 1.0));
  vec3 gh = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 1.0));
  
  float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
  float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
  float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
  float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
  float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
  float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
  float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
  float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

  return vec4(
    va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,
    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +
    du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh))
  );
}

float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float computeNoise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

void main() {
  vec2 position = vPosition;
  position.x *= min(1., viewportSize.x / viewportSize.y);
  position.y *= min(1., viewportSize.y / viewportSize.x);
  position /= zoom;
  position += transformPosition;

  vec2 noiseLocalPosition = position * .5 + .5;
  vec3 displacementNoise = gradientDerivativesNoise3D(vec3(noiseLocalPosition, seed)).xyz;

  float noise = computeNoise(vPosition * viewportSize / noiseSize);

  position += displacementNoise.xz * displacement;

  vec2 offsetedPosition = position;
  offsetedPosition -= colorOffset;
  offsetedPosition = mod(offsetedPosition - spacing, vec2(spacing * 2.)) - spacing;
  offsetedPosition = rotate(offsetedPosition, -colorRotation);
  offsetedPosition /= vec2(colorSize, colorSize);
  offsetedPosition *= vec2(1. / colorSpread, 1.);

  vec3 color = vec3(0.);
  color = mix(color1, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., colorSpacing * 1.5))));
  color = mix(color2, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., colorSpacing * .5))));
  color = mix(color3, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., -colorSpacing * .5))));
  color = mix(color4, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., -colorSpacing * 1.5))));

  color += noise * noiseIntensity;
  color = clamp(color, 0., 1.);

  fragColor = vec4(color, 1.);
}
`;

  var fsSource100 = `
precision highp float;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform float colorSize;
uniform float colorSpacing;
uniform float colorRotation;
uniform float colorSpread;
uniform float displacement;
uniform float zoom;
uniform float spacing;
uniform float seed;
uniform vec2 viewportSize;
uniform vec2 colorOffset;
uniform vec2 transformPosition;
uniform float noiseSize;
uniform float noiseIntensity;

varying vec2 vPosition;

vec3 gradientDerivativesNoise3DHash(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

vec4 gradientDerivativesNoise3D(in vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
  
  vec3 ga = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 0.0));
  vec3 gb = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 0.0));
  vec3 gc = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 0.0));
  vec3 gd = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 0.0));
  vec3 ge = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 1.0));
  vec3 gf = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 1.0));
  vec3 gg = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 1.0));
  vec3 gh = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 1.0));
  
  float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
  float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
  float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
  float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
  float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
  float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
  float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
  float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

  return vec4(
    va + u.x*(vb-va) + u.y*(vc-va) + u.z*(ve-va) + u.x*u.y*(va-vb-vc+vd) + u.y*u.z*(va-vc-ve+vg) + u.z*u.x*(va-vb-ve+vf) + (-va+vb+vc-vd+ve-vf-vg+vh)*u.x*u.y*u.z,
    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.z*(ge-ga) + u.x*u.y*(ga-gb-gc+gd) + u.y*u.z*(ga-gc-ge+gg) + u.z*u.x*(ga-gb-ge+gf) + (-ga+gb+gc-gd+ge-gf-gg+gh)*u.x*u.y*u.z +
    du * (vec3(vb,vc,ve) - va + u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh))
  );
}

float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float computeNoise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

void main() {
  vec2 position = vPosition;
  position.x *= min(1., viewportSize.x / viewportSize.y);
  position.y *= min(1., viewportSize.y / viewportSize.x);
  position /= zoom;
  position += transformPosition;

  vec2 noiseLocalPosition = position * .5 + .5;
  vec3 displacementNoise = gradientDerivativesNoise3D(vec3(noiseLocalPosition, seed)).xyz;

  float noise = computeNoise(vPosition * viewportSize / noiseSize);

  position += displacementNoise.xz * displacement;

  vec2 offsetedPosition = position;
  offsetedPosition -= colorOffset;
  offsetedPosition = mod(offsetedPosition - spacing, vec2(spacing * 2.)) - spacing;
  offsetedPosition = rotate(offsetedPosition, -colorRotation);
  offsetedPosition /= vec2(colorSize, colorSize);
  offsetedPosition *= vec2(1. / colorSpread, 1.);

  vec3 color = vec3(0.);
  color = mix(color1, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., colorSpacing * 1.5))));
  color = mix(color2, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., colorSpacing * .5))));
  color = mix(color3, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., -colorSpacing * .5))));
  color = mix(color4, color, smoothstep(0., 1., distance(offsetedPosition, vec2(0., -colorSpacing * 1.5))));

  color += noise * noiseIntensity;
  color = clamp(color, 0., 1.);

  gl_FragColor = vec4(color, 1.);
}
`;

  function createShader(gl, type, source) {
    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function initSingleGradient(container, canvas) {
    if (!container || !canvas) return;

    var gl = canvas.getContext('webgl2', { alpha: false, antialias: true, depth: false });
    var isWebGL2 = !!gl;
    if (!gl) {
      gl = canvas.getContext('webgl', { alpha: false, antialias: true, depth: false }) ||
           canvas.getContext('experimental-webgl', { alpha: false, antialias: true, depth: false });
    }
    if (!gl) {
      console.warn('WebGL not supported for High Reach gradient.');
      container.style.background = 'radial-gradient(circle at 50% 50%, #fde813 0%, #a7dd87 25%, #5fc0ad 55%, #0062f7 85%, #040508 100%)';
      return;
    }

    var vs = createShader(gl, gl.VERTEX_SHADER, isWebGL2 ? vsSource300 : vsSource100);
    var fs = createShader(gl, gl.FRAGMENT_SHADER, isWebGL2 ? fsSource300 : fsSource100);
    if (!vs || !fs) return;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    var quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);

    var posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var uniforms = {
      color1: gl.getUniformLocation(program, 'color1'),
      color2: gl.getUniformLocation(program, 'color2'),
      color3: gl.getUniformLocation(program, 'color3'),
      color4: gl.getUniformLocation(program, 'color4'),
      colorSize: gl.getUniformLocation(program, 'colorSize'),
      colorSpacing: gl.getUniformLocation(program, 'colorSpacing'),
      colorRotation: gl.getUniformLocation(program, 'colorRotation'),
      colorSpread: gl.getUniformLocation(program, 'colorSpread'),
      displacement: gl.getUniformLocation(program, 'displacement'),
      zoom: gl.getUniformLocation(program, 'zoom'),
      spacing: gl.getUniformLocation(program, 'spacing'),
      seed: gl.getUniformLocation(program, 'seed'),
      viewportSize: gl.getUniformLocation(program, 'viewportSize'),
      colorOffset: gl.getUniformLocation(program, 'colorOffset'),
      transformPosition: gl.getUniformLocation(program, 'transformPosition'),
      noiseSize: gl.getUniformLocation(program, 'noiseSize'),
      noiseIntensity: gl.getUniformLocation(program, 'noiseIntensity')
    };

    function updateUniforms(w, h, disp, s) {
      gl.uniform3fv(uniforms.color1, color1);
      gl.uniform3fv(uniforms.color2, color2);
      gl.uniform3fv(uniforms.color3, color3);
      gl.uniform3fv(uniforms.color4, color4);
      gl.uniform1f(uniforms.colorSize, 0.58);
      gl.uniform1f(uniforms.colorSpacing, 0.52);
      gl.uniform1f(uniforms.colorRotation, -0.38159);
      gl.uniform1f(uniforms.colorSpread, 4.52);
      gl.uniform1f(uniforms.displacement, disp);
      gl.uniform1f(uniforms.zoom, 0.72);
      gl.uniform1f(uniforms.spacing, 4.27);
      gl.uniform1f(uniforms.seed, s);
      gl.uniform2f(uniforms.viewportSize, w, h);
      gl.uniform2f(uniforms.colorOffset, -0.7741, -0.2064);
      gl.uniform2f(uniforms.transformPosition, -0.2816, -0.4391);
      gl.uniform1f(uniforms.noiseSize, 0.5);
      gl.uniform1f(uniforms.noiseIntensity, 0.04);
    }

    var width = 0, height = 0;
    var containerRect = null;

    function updateContainerRect() {
      if (container) {
        containerRect = container.getBoundingClientRect();
      }
    }

    function resize() {
      updateContainerRect();
      width = Math.max(containerRect ? containerRect.width : container.offsetWidth, 100);
      height = Math.max(containerRect ? containerRect.height : container.offsetHeight, 100);
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', updateContainerRect, { passive: true });
    resize();

    // Interaction states exactly aligned with High Reach fluid formula
    var targetDisplacement = 4.66;
    var targetSeed = -0.06;
    var smoothDisplacement = targetDisplacement;
    var smoothSeed = targetSeed;

    function applyPointer(clientX, clientY) {
      if (!containerRect) updateContainerRect();
      var cW = (containerRect && containerRect.width) || 1;
      var cH = (containerRect && containerRect.height) || 1;
      var cL = containerRect ? containerRect.left : 0;
      var cT = containerRect ? containerRect.top : 0;

      var x = (clientX - cL) / cW;
      var y = (clientY - cT) / cH;

      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));

      targetDisplacement = 0.5 + x * 4.5;
      targetSeed = -0.8 + y * 1.6;
    }

    // Direct section interaction
    var parentSection = container.closest('.page-header, .hr-cta-section, footer, section') || container;
    if (parentSection) {
      parentSection.addEventListener('pointermove', function (e) {
        applyPointer(e.clientX, e.clientY);
      }, { passive: true });

      parentSection.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches[0]) {
          applyPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    }

    // Global pointer reaction when near the section viewport
    window.addEventListener('pointermove', function (e) {
      if (!containerRect) updateContainerRect();
      var cT = containerRect ? containerRect.top : 0;
      var cB = containerRect ? containerRect.bottom : 0;
      var cL = containerRect ? containerRect.left : 0;
      var cR = containerRect ? containerRect.right : 0;

      if (e.clientY >= cT - 150 && e.clientY <= cB + 150 &&
          e.clientX >= cL - 100 && e.clientX <= cR + 100) {
        applyPointer(e.clientX, e.clientY);
      }
    }, { passive: true });

    var isVisible = true;
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      obs.observe(container);
    }

    var time = 0;
    var animFrameId = null;

    function render() {
      animFrameId = requestAnimationFrame(render);
      if (!isVisible) return; // Save GPU when scrolled away

      time += 0.008;
      // Organic living undulation
      var breathDisp = Math.sin(time) * 0.25;
      var breathSeed = Math.cos(time * 0.7) * 0.08;

      smoothDisplacement += 0.07 * (targetDisplacement + breathDisp - smoothDisplacement);
      smoothSeed += 0.07 * (targetSeed + breathSeed - smoothSeed);

      updateUniforms(width, height, smoothDisplacement, smoothSeed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    render();
  }

  function initAllGradients() {
    var wraps = document.querySelectorAll('.hr-fluid-gradient-wrap, .hr-cta-gradient-wrap');
    if (wraps.length === 0) {
      var wrap = document.getElementById('hrFluidGradientWrap') || document.getElementById('hrFooterGradientWrap');
      var c = (wrap && wrap.querySelector('canvas')) ||
              document.getElementById('hrFluidGradientCanvas') ||
              document.getElementById('hrFooterGradientCanvas');
      if (wrap && c) {
        initSingleGradient(wrap, c);
      }
      return;
    }

    wraps.forEach(function (wrap) {
      if (wrap._hrGradientInit) return;
      var canvas = wrap.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        wrap.appendChild(canvas);
      }
      wrap._hrGradientInit = true;
      initSingleGradient(wrap, canvas);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllGradients);
  } else {
    initAllGradients();
  }
})();
