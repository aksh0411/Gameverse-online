// =========================================================================
// WARP TEXT ENGINE — Vanilla WebGL port of the ReactBits WarpText
// component (no build step). Faithful to the original shader:
// ultra-subtle fbm ambient drift + pointer lens bulge + ripple ring +
// directional chromatic refraction. No sine-wave bending.
//
// Usage:
//   new WarpText(document.getElementById('warpTextHero'), { text: '...' });
// =========================================================================

class WarpText {
    constructor(container, options = {}) {
        this.container = container;
        this.text = options.text || 'Explore 100+ Games';
        this.color = options.color || '#f8f5ff';
        this.warpStrength = options.warpStrength || 0.08;
        this.warpScale = options.warpScale || 1.7;
        this.speed = options.speed || 0.55;
        this.pointerInfluence = options.pointerInfluence || 0.42;
        this.pointerStrength = options.pointerStrength || 0.38;
        this.refraction = options.refraction || 0.018;
        this.ripple = options.ripple !== false;
        this.fontSize = options.fontSize || 76;            // px, fit-scaled to container
        this.fontWeight = options.fontWeight || 800;
        this.fontFamily = options.fontFamily || "'Space Grotesk', sans-serif";
        this.letterSpacing = options.letterSpacing || -0.06; // em
        this.glow = options.glow !== false;

        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
        this.animId = null;
        this.startTime = performance.now();
        this.isVisible = false;
        this.destroyed = false;

        this._init();
    }

    _init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width:100%;height:100%;display:block;pointer-events:auto;';
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);

        const gl = this.canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!gl) {
            this.container.innerHTML = `<span style="font-family:${this.fontFamily};font-weight:${this.fontWeight};font-size:clamp(1.6rem,6vw,${this.fontSize}px);color:${this.color};letter-spacing:${this.letterSpacing}em;">${this.text}</span>`;
            return;
        }
        this.gl = gl;

        this._buildProgram();
        this._buildGeometry();
        this._textCanvas = document.createElement('canvas');
        this._textCtx = this._textCanvas.getContext('2d');

        this._resize();
        this._renderTextTexture();

        let resizeTimer = null;
        this._onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { this._resize(); this._renderTextTexture(); }, 120);
        };
        window.addEventListener('resize', this._onResize);

        this._onMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.pointer.tx = (e.clientX - rect.left) / Math.max(1, rect.width);
            this.pointer.ty = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
            this.pointer.activeTarget = 1;
        };
        this._onLeave = () => { this.pointer.activeTarget = 0; };
        this.canvas.addEventListener('mousemove', this._onMove);
        this.canvas.addEventListener('mouseleave', this._onLeave);
        this.canvas.addEventListener('touchmove', this._onMove, { passive: true });
        this.canvas.addEventListener('touchend', this._onLeave);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => { if (!this.destroyed) { this._resize(); this._renderTextTexture(); } });
        }

        // WebGL context loss: without handling, the canvas freezes on a stale
        // frame and every later texture/uniform change silently no-ops
        this._onContextLost = (e) => {
            e.preventDefault();
            console.warn('[WarpText] WebGL context lost — pausing until restored');
            this.isVisible = false;
            if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        };
        this._onContextRestored = () => {
            try {
                this._buildProgram();
                this._buildGeometry();
                this._resize();
                this._renderTextTexture();
                this.isVisible = true;
                this.startTime = performance.now();
                this._animate();
                console.info('[WarpText] WebGL context restored');
            } catch (err) {
                console.error('[WarpText] context restore failed:', err);
            }
        };
        this.canvas.addEventListener('webglcontextlost', this._onContextLost, false);
        this.canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);

        this._observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.isVisible) {
                this.isVisible = true;
                this.startTime = performance.now();
                this._animate();
            } else if (!entries[0].isIntersecting) {
                this.isVisible = false;
                if (this.animId) cancelAnimationFrame(this.animId);
            }
        }, { threshold: 0.1 });
        this._observer.observe(this.container);
    }

    _buildProgram() {
        const gl = this.gl;
        const compile = (type, src) => {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                const err = gl.getShaderInfoLog(sh);
                console.error('[WarpText] shader compile error:', err);
                throw new Error('WarpText shader compile error: ' + err);
            }
            return sh;
        };

        const vs = `
            attribute vec2 aPos;
            varying vec2 vUv;
            void main() {
                vUv = aPos * 0.5 + 0.5;
                gl_Position = vec4(aPos, 0.0, 1.0);
            }
        `;

        // Faithful GLSL ES 1.0 port of the ReactBits WarpText fragment shader
        const fs = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uText;
            uniform vec2 uResolution;
            uniform vec2 uPointer;
            uniform float uPointerActive;
            uniform float uTime;
            uniform float uWarpStrength;
            uniform float uWarpScale;
            uniform float uSpeed;
            uniform float uPointerInfluence;
            uniform float uPointerStrength;
            uniform float uRefraction;
            uniform float uRipple;
            uniform float uMotion;

            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
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
                float amplitude = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amplitude * noise(p);
                    p *= 2.02;
                    amplitude *= 0.5;
                }
                return value;
            }

            vec4 sampleText(vec2 uv) {
                if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                    return vec4(0.0);
                }
                return texture2D(uText, uv);
            }

            void main() {
                vec2 uv = vUv;
                float aspect = uResolution.x / max(uResolution.y, 1.0);
                float time = uTime * uSpeed;
                float scale = max(uWarpScale, 0.001);

                // Ambient drift — near-imperceptible fbm noise (NOT a wave)
                vec2 drift = vec2(time * 0.055, -time * 0.045);
                float n1 = fbm(uv * scale * 3.1 + drift);
                float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
                vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

                // Pointer lens: smooth bulge pushing glyphs away from the cursor
                vec2 pointerDelta = uv - uPointer;
                vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
                float dist = length(aspectDelta);
                float radius = max(uPointerInfluence, 0.001);
                float t = clamp(dist / radius, 0.0, 1.0);
                float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
                float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
                vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

                // Ripple ring travelling around the pointer
                float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
                float rippleRing = (rippleWave - 0.5) * uRipple;
                vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
                pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;

                vec2 displaced = uv + ambient + pointerWarp;

                // Directional chromatic refraction along the distortion
                vec2 splitDir = ambient + pointerWarp;
                float splitLen = length(splitDir);
                splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
                vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);

                vec4 base = sampleText(displaced);
                float r = sampleText(displaced + split).r;
                float g = base.g;
                float b = sampleText(displaced - split).b;
                float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);

                vec3 color = vec3(r, g, b) + lens * base.a * 0.055;
                if (a < 0.01) discard;
                gl_FragColor = vec4(color, a);
            }
        `;

        this._program = gl.createProgram();
        gl.attachShader(this._program, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(this._program, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            const err = gl.getProgramInfoLog(this._program);
            console.error('[WarpText] program link error:', err);
            throw new Error('WarpText program link error: ' + err);
        }
        gl.useProgram(this._program);

        this._uniforms = {
            uText: gl.getUniformLocation(this._program, 'uText'),
            uResolution: gl.getUniformLocation(this._program, 'uResolution'),
            uPointer: gl.getUniformLocation(this._program, 'uPointer'),
            uPointerActive: gl.getUniformLocation(this._program, 'uPointerActive'),
            uTime: gl.getUniformLocation(this._program, 'uTime'),
            uWarpStrength: gl.getUniformLocation(this._program, 'uWarpStrength'),
            uWarpScale: gl.getUniformLocation(this._program, 'uWarpScale'),
            uSpeed: gl.getUniformLocation(this._program, 'uSpeed'),
            uPointerInfluence: gl.getUniformLocation(this._program, 'uPointerInfluence'),
            uPointerStrength: gl.getUniformLocation(this._program, 'uPointerStrength'),
            uRefraction: gl.getUniformLocation(this._program, 'uRefraction'),
            uRipple: gl.getUniformLocation(this._program, 'uRipple'),
            uMotion: gl.getUniformLocation(this._program, 'uMotion')
        };
    }

    _buildGeometry() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(this._program, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    _resize() {
        // Re-read DPR every time (browser zoom / devtools emulation change it)
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.round(rect.width * this.dpr));
        this.height = Math.max(1, Math.round(rect.height * this.dpr));
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.gl) this.gl.viewport(0, 0, this.width, this.height);
    }

    _renderTextTexture() {
        const gl = this.gl;
        const ctx = this._textCtx;
        const w = this.width, h = this.height;

        this._textCanvas.width = w;
        this._textCanvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // Fit-scale the text to the container (never clip, never overflow)
        let fSize = this.fontSize * this.dpr;
        const maxWidth = w * 0.94;
        const setFont = (size) => {
            const spacingPx = this.letterSpacing * size;
            ctx.font = `${this.fontWeight} ${size}px ${this.fontFamily}`;
            let width = 0;
            for (const ch of this.text) width += ctx.measureText(ch).width + spacingPx;
            return width - spacingPx;
        };
        let measured = setFont(fSize);
        if (measured > maxWidth) {
            fSize *= maxWidth / measured;
            measured = setFont(fSize);
        }

        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        const startX = 2 * this.dpr;
        const y = h / 2;
        let x = startX;
        const spacingPx = this.letterSpacing * fSize;
        for (const ch of this.text) {
            ctx.fillText(ch, x, y);
            x += ctx.measureText(ch).width + spacingPx;
        }

        // Subtle glow baked into the texture
        if (this.glow) {
            ctx.shadowColor = 'rgba(45, 212, 191, 0.55)';
            ctx.shadowBlur = 12 * this.dpr;
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(45, 212, 191, 0.18)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        if (!this._texture) this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        // DOM sources are top-down; GL texture v=0 is bottom — flip so the
        // text isn't rendered upside-down (and therefore unrecognizable)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._textCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    setText(text) {
        this.text = text || this.text;
        if (this.gl) this._renderTextTexture();
    }

    _animate() {
        if (!this.isVisible || this.destroyed) return;
        this.animId = requestAnimationFrame(() => this._animate());

        try {
            const gl = this.gl;
            const now = performance.now();
            const elapsed = (now - this.startTime) / 1000;

            // Pointer eases toward the cursor; when idle it wanders slowly so
            // the lens effect feels alive (same idle wander as ReactBits)
            const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12;
            const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1;
            const tx = this.pointer.activeTarget > 0 ? this.pointer.tx : idleX;
            const ty = this.pointer.activeTarget > 0 ? this.pointer.ty : idleY;
            const damping = this.pointer.activeTarget > 0 ? 0.12 : 0.035;
            this.pointer.x += (tx - this.pointer.x) * damping;
            this.pointer.y += (ty - this.pointer.y) * damping;
            this.pointer.active += ((this.pointer.activeTarget > 0 ? 1 : 0.18) - this.pointer.active) * 0.06;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(this._uniforms.uText, 0);
            gl.uniform2f(this._uniforms.uResolution, this.width, this.height);
            gl.uniform2f(this._uniforms.uPointer, this.pointer.x, this.pointer.y);
            gl.uniform1f(this._uniforms.uPointerActive, this.reduceMotion ? this.pointer.active * 0.35 : this.pointer.active);
            gl.uniform1f(this._uniforms.uTime, this.reduceMotion ? 0 : elapsed);
            gl.uniform1f(this._uniforms.uWarpStrength, this.warpStrength);
            gl.uniform1f(this._uniforms.uWarpScale, this.warpScale);
            gl.uniform1f(this._uniforms.uSpeed, this.speed);
            gl.uniform1f(this._uniforms.uPointerInfluence, this.pointerInfluence);
            gl.uniform1f(this._uniforms.uPointerStrength, this.pointerStrength);
            gl.uniform1f(this._uniforms.uRefraction, this.refraction);
            gl.uniform1f(this._uniforms.uRipple, this.ripple ? 1 : 0);
            gl.uniform1f(this._uniforms.uMotion, this.reduceMotion ? 0 : 1);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } catch (err) {
            // Never let one bad frame kill the rAF chain — the canvas would
            // freeze on a stale frame and every later tweak would look ignored
            console.error('[WarpText] frame error:', err);
        }
    }

    destroy() {
        this.destroyed = true;
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this._observer) this._observer.disconnect();
        window.removeEventListener('resize', this._onResize);
        this.canvas.removeEventListener('mousemove', this._onMove);
        this.canvas.removeEventListener('mouseleave', this._onLeave);
        this.canvas.removeEventListener('touchmove', this._onMove);
        this.canvas.removeEventListener('touchend', this._onLeave);
        this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
        this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
    }
}

// Auto-initialize on the home page
function initHeroWarpText() {
    const container = document.getElementById('warpTextHero');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    window.__heroWarpText = new WarpText(container, {
        text: 'Explore 100+ Games',
        color: '#f8f5ff',
        warpStrength: 0.08,
        warpScale: 1.7,
        speed: 0.55,
        pointerInfluence: 0.42,
        pointerStrength: 0.38,
        refraction: 0.018,
        ripple: true,
        fontSize: 76,
        fontWeight: 800,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: -0.06,
        glow: true
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroWarpText);
} else {
    initHeroWarpText();
}
