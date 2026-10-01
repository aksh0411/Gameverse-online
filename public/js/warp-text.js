// =========================================================================
// WARP TEXT ENGINE — Vanilla WebGL Text Warp/Bend Animation
// Vanilla port of the ReactBits WarpText component (no build step).
// Renders a statement to an offscreen canvas, uploads it as a texture and
// displaces it in a fragment shader: flowing warp + pointer bulge +
// expanding ripple + chromatic refraction.
//
// Usage:
//   new WarpText(document.getElementById('warpTextHero'), {
//       text: 'Explore 100+ Games', ...options
//   });
// =========================================================================

class WarpText {
    constructor(container, options = {}) {
        this.container = container;
        this.text = options.text || 'Explore 100+ Games';
        this.color = options.color || '#f8f5ff';
        this.warpStrength = options.warpStrength || 0.08;
        this.warpScale = options.warpScale || 1.7;
        this.speed = options.speed || 0.55;
        this.pointerInfluence = options.pointerInfluence || 0.42;  // radius (fraction of width)
        this.pointerStrength = options.pointerStrength || 0.38;    // displacement amount
        this.refraction = options.refraction || 0.018;             // chromatic offset
        this.ripple = options.ripple !== false;
        this.fontSize = options.fontSize || 76;                    // px, fit-scaled to container
        this.fontWeight = options.fontWeight || 800;
        this.fontFamily = options.fontFamily || "'Space Grotesk', sans-serif";
        this.letterSpacing = options.letterSpacing || -0.06;       // em
        this.maxFontSize = options.maxFontSize || null;            // hard cap override
        this.glow = options.glow !== false;

        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, inside: 0, target: 0 };
        this.rippleT = 10;          // ripple start time (seconds); 10 = no active ripple
        this.rippleOrigin = { x: 0.5, y: 0.5 };
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
            // Graceful fallback: plain styled text
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
            this.pointer.target = 1;
        };
        this._onLeave = () => { this.pointer.target = 0; };
        this._onDown = (e) => {
            if (!this.ripple) return;
            const rect = this.canvas.getBoundingClientRect();
            this.rippleOrigin.x = (e.clientX - rect.left) / Math.max(1, rect.width);
            this.rippleOrigin.y = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
            this.rippleT = (performance.now() - this.startTime) / 1000;
        };
        this.canvas.addEventListener('mousemove', this._onMove);
        this.canvas.addEventListener('mouseleave', this._onLeave);
        this.canvas.addEventListener('mousedown', this._onDown);
        this.canvas.addEventListener('touchmove', this._onMove, { passive: true });
        this.canvas.addEventListener('touchstart', (e) => { this._onMove(e); this._onDown(e); }, { passive: true });
        this.canvas.addEventListener('touchend', this._onLeave);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => { if (!this.destroyed) { this._resize(); this._renderTextTexture(); } });
        }

        // WebGL context loss (GPU reset, too many contexts, driver churn):
        // without this the canvas freezes on a stale frame and every later
        // texture/uniform change silently no-ops
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
                this.rippleT = 10;
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

        const fs = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uText;
            uniform vec2 uResolution;
            uniform float uTime;
            uniform vec2 uPointer;
            uniform float uPointerIn;
            uniform float uRippleT;
            uniform vec2 uRippleOrigin;
            uniform float uWarpStrength;
            uniform float uWarpScale;
            uniform float uSpeed;
            uniform float uPointerStrength;
            uniform float uRefraction;
            uniform vec3 uColor;

            void main() {
                // Aspect-corrected space for uniform distortion
                float aspect = uResolution.x / max(uResolution.y, 1.0);
                vec2 uv = vUv;

                // 1. Flowing ribbon bend — vertical displacement along the
                // horizontal axis, so the line waves like a ribbon and each
                // glyph stays readable (horizontal shear would destroy it)
                float bend = sin(vUv.x * uWarpScale * 6.2831853 + uTime * uSpeed * 2.0) * uWarpStrength;
                float bendSlow = sin(vUv.x * uWarpScale * 3.14159265 + uTime * uSpeed * 1.1) * uWarpStrength * 0.6;

                // 2. Pointer bulge — text displaces away from the cursor.
                // influence ramps to uPointerIn * uPointerStrength (~0.3), so
                // the push damping keeps the shift to a few pixels, and the
                // falloff radius stays tight (~100px) around the cursor
                vec2 toPointer = uv - uPointer;
                toPointer.x *= aspect;
                float pd = length(toPointer);
                float radius = 0.06 + uPointerIn * 0.14;
                float influence = smoothstep(radius, 0.0, pd) * uPointerIn * uPointerStrength;
                vec2 pushDir = normalize(toPointer + vec2(0.0, 0.0001));
                vec2 push = pushDir * influence;

                // 3. Expanding ripple from the last pointer-down / touch
                float rt = uTime - uRippleT;
                float ripple = 0.0;
                if (rt > 0.0 && rt < 2.2) {
                    vec2 rDelta = uv - uRippleOrigin;
                    rDelta.x *= aspect;
                    float rdist = length(rDelta);
                    float wavefront = rt * 0.55;
                    float band = exp(-pow((rdist - wavefront) * 9.0, 2.0));
                    float decay = 1.0 - rt / 2.2;
                    ripple = sin(rdist * 40.0 - rt * 10.0) * band * decay * 0.035;
                }

                // Apply displacement — damped for legibility at hero scale:
                // one dominant ribbon bend + a subtle secondary sway; the
                // pointer push is capped so glyphs displace, not explode
                vec2 disp = vec2(0.0, (bend + bendSlow * 0.35) * 0.8);
                disp += vec2(push.x / aspect, push.y) * 0.09;
                disp += vec2(ripple / aspect, ripple) * 0.5;

                // 4. Chromatic refraction — subtle glassy edge; hard-capped so
                // the R/B channel split stays ~1-3px (uv-scale offsets here
                // translate to many pixels, which ghosts the glyphs apart)
                float refr = min(uRefraction * (1.0 + abs(bend) * 6.0 + influence * 8.0) * 0.3, 0.006);
                float r = texture2D(uText, uv + disp + vec2(refr, 0.0)).r;
                float g = texture2D(uText, uv + disp).g;
                float b = texture2D(uText, uv + disp - vec2(refr, 0.0)).b;
                float a = texture2D(uText, uv + disp).a;

                vec3 base = uColor;
                float lum = (r + g + b) / 3.0;
                // Tint towards cyan on the refracted edges for a glassy look
                vec3 tinted = mix(base, vec3(0.18, 0.96, 0.83), refr * 22.0 * lum);

                if (a < 0.01) discard;
                gl_FragColor = vec4(tinted * a, a);
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
            uTime: gl.getUniformLocation(this._program, 'uTime'),
            uPointer: gl.getUniformLocation(this._program, 'uPointer'),
            uPointerIn: gl.getUniformLocation(this._program, 'uPointerIn'),
            uRippleT: gl.getUniformLocation(this._program, 'uRippleT'),
            uRippleOrigin: gl.getUniformLocation(this._program, 'uRippleOrigin'),
            uWarpStrength: gl.getUniformLocation(this._program, 'uWarpStrength'),
            uWarpScale: gl.getUniformLocation(this._program, 'uWarpScale'),
            uSpeed: gl.getUniformLocation(this._program, 'uSpeed'),
            uPointerStrength: gl.getUniformLocation(this._program, 'uPointerStrength'),
            uRefraction: gl.getUniformLocation(this._program, 'uRefraction'),
            uColor: gl.getUniformLocation(this._program, 'uColor')
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
        let fSize = Math.min(this.fontSize, this.maxFontSize || Infinity) * this.dpr;
        const maxWidth = w * 0.94;
        const setFont = (size) => {
            const spacingPx = this.letterSpacing * size;
            ctx.font = `${this.fontWeight} ${size}px ${this.fontFamily}`;
            // canvas2d has no letterSpacing in older browsers — measure manually
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

        // Small glow baked into the texture
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
            const t = (now - this.startTime) / 1000;

            // Ease pointer + presence
            this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.08;
            this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.08;
            this.pointer.inside += (this.pointer.target - this.pointer.inside) * 0.08;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.uniform1i(this._uniforms.uText, 0);
            gl.uniform2f(this._uniforms.uResolution, this.width, this.height);
            gl.uniform1f(this._uniforms.uTime, t);
            gl.uniform2f(this._uniforms.uPointer, this.pointer.x, this.pointer.y);
            gl.uniform1f(this._uniforms.uPointerIn, this.pointer.inside);
            gl.uniform1f(this._uniforms.uRippleT, this.rippleT);
            gl.uniform2f(this._uniforms.uRippleOrigin, this.rippleOrigin.x, this.rippleOrigin.y);
            gl.uniform1f(this._uniforms.uWarpStrength, this.warpStrength);
            gl.uniform1f(this._uniforms.uWarpScale, this.warpScale);
            gl.uniform1f(this._uniforms.uSpeed, this.speed);
            gl.uniform1f(this._uniforms.uPointerStrength, this.pointerStrength);
            gl.uniform1f(this._uniforms.uRefraction, this.refraction);
            const c = this._hexToRgb(this.color);
            gl.uniform3f(this._uniforms.uColor, c[0], c[1], c[2]);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } catch (err) {
            // Never let one bad frame kill the rAF chain — the canvas would
            // freeze on a stale frame and every later tweak would look ignored
            console.error('[WarpText] frame error:', err);
        }
    }

    _hexToRgb(hex) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [0.97, 0.96, 1];
    }

    destroy() {
        this.destroyed = true;
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this._observer) this._observer.disconnect();
        window.removeEventListener('resize', this._onResize);
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
        warpStrength: 0.09,
        warpScale: 1.4,
        speed: 0.55,
        pointerInfluence: 0.42,
        pointerStrength: 0.35,
        refraction: 0.014,
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
