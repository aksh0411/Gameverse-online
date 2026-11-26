// ===== GAMEVERSE — WebThreads-Style Flowing-Line Backdrop =====
// Straight glowing threads fanning from the center (NO bending/curl), rendered
// as a fullscreen shader plane drawn BEHIND a Three.js scene. Drop-in companion
// for collection-core.js: create it, call update(t) + render(renderer) at the
// start of each frame with renderer.autoClear = false.
//
// Usage:
//   const threads = createThreadsBackground({ opacity: 0.85 });
//   threads.resize(w, h, renderer.getPixelRatio());
//   // each frame:
//   renderer.clear();
//   threads.setMouse(mx, my); threads.update(t); threads.render(renderer);
//   renderer.render(mainScene, mainCamera);
(function () {
    'use strict';

    const DEFAULTS = {
        color1: '#00f5d4',      // primary cyan
        color2: '#FF9FFC',      // pink accent
        color3: '#ffffff',      // hot core
        speed: 0.2,             // flow travel speed
        threadCount: 6,         // threads in the fan
        frequency: 5,           // flow-pulse density along each thread
        thickness: 1.1,         // line width multiplier
        brightness: 0.6,        // overall brightness
        glow: 0.02,             // halo strength
        falloff: 0.6,           // radial attenuation from center
        taper: 1.0,             // thin/fade toward far ends
        opacity: 1.0,           // master opacity
        mirror: true,           // symmetric fan about the horizontal axis
        shimmer: false,         // per-thread slow shimmer
        grain: true,
        grainIntensity: 0.05,
        mouseInteraction: true,
        mouseStrength: 0.3,     // fan-center parallax strength (no bending)
        flowScale: 1.0          // pulse spacing scale
    };

    const VERT = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `;

    const FRAG = `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uCount;
        uniform float uFreq;
        uniform float uSpeed;
        uniform float uThickness;
        uniform float uBrightness;
        uniform float uGlow;
        uniform float uFalloff;
        uniform float uTaper;
        uniform float uOpacity;
        uniform float uMirror;
        uniform float uShimmer;
        uniform float uGrain;
        uniform float uMouseStrength;
        uniform float uFlowScale;

        float hash21(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        void main() {
            // Centered, aspect-corrected coords (y spans -1..1)
            vec2 uv = (vUv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0) * 2.0;

            // Mouse shifts the fan center slightly (parallax only — lines stay straight)
            vec2 p = uv - uMouse * 0.10 * uMouseStrength;

            float radius = length(p);

            // Mirror: fold about the horizontal axis for a symmetric fan
            vec2 pf = p;
            if (uMirror > 0.5) pf.y = abs(pf.y);

            float angF = atan(pf.y, pf.x);                 // -PI..PI (0..PI folded)
            float sector = 6.28318530718 / max(uCount, 1.0);
            float idx = floor((angF + 3.14159265359) / sector + 0.5);
            float angThread = idx * sector - 3.14159265359;

            // Straight thread = infinite line through the origin:
            // perpendicular distance is radius * sin(angle difference)
            float dLine = abs(radius * sin(angF - angThread));

            // Flowing pulses travel outward along each thread
            float flowPhase = radius * uFreq * 2.2 * uFlowScale - uTime * uSpeed * 2.6;
            float flow = 0.62 + 0.38 * sin(flowPhase);

            // Slow per-thread shimmer (off by default, like the reference)
            float shimmer = 1.0;
            if (uShimmer > 0.5) {
                shimmer = 0.82 + 0.18 * sin(uTime * 0.6 + idx * 12.9898);
            }

            // Line profile: hot core + wide soft halo
            float w = 0.0028 * uThickness;
            float core = exp(-pow(dLine / (w * 0.55), 2.0));
            float haloW = w * (6.0 + uGlow * 220.0);
            float halo = exp(-pow(dLine / haloW, 2.0)) * (0.35 + uGlow * 6.0);

            // Envelopes: suppress the hot center, attenuate outward, taper the ends
            float centerFade = smoothstep(0.03, 0.30, radius);
            float radial = exp(-radius * uFalloff * 1.35);
            float taper = mix(1.0, clamp(1.15 - radius * 0.42, 0.0, 1.0), uTaper);

            float intensity = (core * 1.15 + halo) * flow * shimmer * centerFade * radial * taper * uBrightness;

            // Per-thread color spread across the palette, whitened in the core
            float mixT = fract(idx * 0.61803398875);
            vec3 col = mix(uColor1, uColor2, mixT);
            col = mix(col, uColor3, core * 0.55);

            // Fine animated grain twinkle
            if (uGrain > 0.001) {
                float g = hash21(vUv * uResolution * 0.5 + fract(uTime) * 61.7);
                intensity *= 0.92 + (g - 0.5) * 2.0 * uGrain;
            }

            vec3 outCol = col * intensity * uOpacity;
            gl_FragColor = vec4(outCol, 1.0);
        }
    `;

    function hexToRgb(hex) {
        const c = new THREE.Color(hex);
        return c;
    }

    function createThreadsBackground(overrides) {
        const opts = Object.assign({}, DEFAULTS, overrides || {});

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const uniforms = {
            uResolution: { value: new THREE.Vector2(1, 1) },
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uColor1: { value: hexToRgb(opts.color1) },
            uColor2: { value: hexToRgb(opts.color2) },
            uColor3: { value: hexToRgb(opts.color3) },
            uCount: { value: Math.max(1, opts.threadCount) },
            uFreq: { value: opts.frequency },
            uSpeed: { value: opts.speed },
            uThickness: { value: opts.thickness },
            uBrightness: { value: opts.brightness },
            uGlow: { value: opts.glow },
            uFalloff: { value: opts.falloff },
            uTaper: { value: opts.taper },
            uOpacity: { value: opts.opacity },
            uMirror: { value: opts.mirror ? 1 : 0 },
            uShimmer: { value: opts.shimmer ? 1 : 0 },
            uGrain: { value: opts.grain ? opts.grainIntensity : 0 },
            uMouseStrength: { value: opts.mouseInteraction ? opts.mouseStrength : 0 },
            uFlowScale: { value: opts.flowScale }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        const mouseTarget = { x: 0, y: 0 };
        let startedAt = null;

        return {
            scene: scene,
            camera: camera,
            update: function (t) {
                if (typeof t !== 'number') t = performance.now() / 1000;
                if (startedAt === null) startedAt = t;
                uniforms.uTime.value = t - startedAt;
                // Smoothly ease the fan center toward the mouse target
                uniforms.uMouse.value.x += (mouseTarget.x - uniforms.uMouse.value.x) * 0.05;
                uniforms.uMouse.value.y += (mouseTarget.y - uniforms.uMouse.value.y) * 0.05;
            },
            setMouse: function (nx, ny) {
                mouseTarget.x = nx;
                mouseTarget.y = ny;
            },
            resize: function (w, h, pixelRatio) {
                const pr = pixelRatio || 1;
                uniforms.uResolution.value.set(Math.max(1, w * pr), Math.max(1, h * pr));
            },
            render: function (renderer) {
                renderer.render(scene, camera);
            },
            dispose: function () {
                mesh.geometry.dispose();
                material.dispose();
            }
        };
    }

    window.createThreadsBackground = createThreadsBackground;
})();
