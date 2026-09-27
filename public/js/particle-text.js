// =========================================================================
// PARTICLE TEXT ENGINE — Vanilla JS Canvas Particle Text Animation
// Inspired by react-bits ParticleText component
// =========================================================================

class ParticleText {
    constructor(container, options = {}) {
        this.container = container;
        this.text = options.text || 'GAMEVERSE';
        this.particleSize = options.particleSize || 2.2;
        this.density = options.density || 4;
        this.color = options.color || '#f8fafc';
        this.highlightColor = options.highlightColor || '#0891b2';
        this.scatter = options.scatter || 190;
        this.gatherDuration = options.gatherDuration || 1600;
        this.stagger = options.stagger || 420;
        this.pointerRepel = options.pointerRepel || 42;
        this.repelRadius = options.repelRadius || 120;
        this.idleDrift = options.idleDrift || 0.8;
        this.fontSize = options.fontSize || 'clamp(3.5rem, 13vw, 9rem)';
        this.fontWeight = options.fontWeight || 800;
        this.fontFamily = options.fontFamily || "'Space Grotesk', sans-serif";
        this.glow = options.glow !== false;
        this.textAlign = options.textAlign || 'left';
        this.lines = options.lines || null; // Array of {text, fontSize, fontWeight, color} for multi-line

        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: -9999, y: -9999 };
        this.dpr = Math.min(window.devicePixelRatio, 2);
        this.animId = null;
        this.startTime = 0;
        this.isVisible = false;

        this._init();
    }

    _init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width:100%;height:100%;display:block;pointer-events:auto;';
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this._resize();
        this._sampleText();
        this._scatter();

        // Events
        this._onResize = () => { this._resize(); this._sampleText(); };
        this._onMouse = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) * this.dpr;
            this.mouse.y = (e.clientY - rect.top) * this.dpr;
        };
        this._onMouseLeave = () => { this.mouse.x = -9999; this.mouse.y = -9999; };
        this._onTouch = (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = (e.touches[0].clientX - rect.left) * this.dpr;
                this.mouse.y = (e.touches[0].clientY - rect.top) * this.dpr;
            }
        };

        window.addEventListener('resize', this._onResize);
        this.canvas.addEventListener('mousemove', this._onMouse);
        this.canvas.addEventListener('mouseleave', this._onMouseLeave);
        this.canvas.addEventListener('touchmove', this._onTouch, { passive: true });
        this.canvas.addEventListener('touchend', this._onMouseLeave);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                this._resize();
                this._sampleText();
            });
        }

        // Intersection observer — start animation when visible
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

    _resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width * this.dpr;
        this.height = rect.height * this.dpr;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    _sampleText() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Clear and render text to sample pixels
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        const align = this.textAlign || 'left';
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        const oldParticleTargets = this.particles.length > 0;

        if (this.lines && this.lines.length > 0) {
            // Multi-line mode
            const totalLines = this.lines.length;
            const lineGap = 8 * this.dpr;
            
            // Measure total height
            let totalTextHeight = 0;
            const lineMeasurements = [];
            
            this.lines.forEach((line) => {
                const fSize = this._parseFontSize(line.fontSize || this.fontSize);
                ctx.font = `${line.fontWeight || this.fontWeight} ${fSize}px ${line.fontFamily || this.fontFamily}`;
                const metrics = ctx.measureText(line.text);
                const lineHeight = fSize * 1.05;
                lineMeasurements.push({ fSize, lineHeight, width: metrics.width });
                totalTextHeight += lineHeight;
            });
            totalTextHeight += lineGap * (totalLines - 1);

            let currentY = Math.max(10 * this.dpr, (h - totalTextHeight) / 2);

            // Draw each line
            this.lines.forEach((line, i) => {
                const m = lineMeasurements[i];
                const fSize = m.fSize;
                ctx.font = `${line.fontWeight || this.fontWeight} ${fSize}px ${line.fontFamily || this.fontFamily}`;
                const yCenter = currentY + m.lineHeight / 2;
                const xPos = align === 'left' ? 4 * this.dpr : (align === 'right' ? w - 4 * this.dpr : w / 2);
                ctx.fillText(line.text, xPos, yCenter);
                currentY += m.lineHeight + lineGap;
            });
        } else {
            // Single text mode
            const fSize = this._parseFontSize(this.fontSize);
            ctx.font = `${this.fontWeight} ${fSize}px ${this.fontFamily}`;
            const xPos = align === 'left' ? 4 * this.dpr : (align === 'right' ? w - 4 * this.dpr : w / 2);
            ctx.fillText(this.text, xPos, h / 2);
        }

        // Sample pixels
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const step = Math.max(1, Math.round(this.density));

        const newTargets = [];
        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const idx = (y * w + x) * 4;
                if (data[idx + 3] > 128) {
                    newTargets.push({ x, y });
                }
            }
        }

        // Build/update particles
        if (!oldParticleTargets) {
            // First time — create particles
            this.particles = newTargets.map((t, i) => ({
                x: t.x + (Math.random() - 0.5) * this.scatter * this.dpr,
                y: t.y + (Math.random() - 0.5) * this.scatter * this.dpr,
                tx: t.x,
                ty: t.y,
                vx: 0,
                vy: 0,
                delay: i * (this.stagger / newTargets.length),
                size: this.particleSize * this.dpr * (0.6 + Math.random() * 0.8),
                driftPhase: Math.random() * Math.PI * 2,
                driftSpeed: 0.3 + Math.random() * 0.7,
                gathered: false
            }));
        } else {
            // On resize — just update targets
            const minLen = Math.min(this.particles.length, newTargets.length);
            for (let i = 0; i < minLen; i++) {
                this.particles[i].tx = newTargets[i].x;
                this.particles[i].ty = newTargets[i].y;
            }
            // Add new or trim excess
            if (newTargets.length > this.particles.length) {
                for (let i = this.particles.length; i < newTargets.length; i++) {
                    this.particles.push({
                        x: newTargets[i].x, y: newTargets[i].y,
                        tx: newTargets[i].x, ty: newTargets[i].y,
                        vx: 0, vy: 0, delay: 0,
                        size: this.particleSize * this.dpr * (0.6 + Math.random() * 0.8),
                        driftPhase: Math.random() * Math.PI * 2,
                        driftSpeed: 0.3 + Math.random() * 0.7,
                        gathered: true
                    });
                }
            } else {
                this.particles.length = newTargets.length;
            }
        }

        ctx.clearRect(0, 0, w, h);
    }

    _parseFontSize(cssSize) {
        if (typeof cssSize === 'number') return cssSize * this.dpr;
        
        // Handle clamp()
        const clampMatch = cssSize.match(/clamp\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
        if (clampMatch) {
            const min = this._parseUnit(clampMatch[1].trim());
            const preferred = this._parseUnit(clampMatch[2].trim());
            const max = this._parseUnit(clampMatch[3].trim());
            return Math.min(max, Math.max(min, preferred)) * this.dpr;
        }
        
        return this._parseUnit(cssSize) * this.dpr;
    }

    _parseUnit(val) {
        val = val.trim();
        if (val.endsWith('rem')) return parseFloat(val) * 16;
        if (val.endsWith('vw')) return parseFloat(val) * window.innerWidth / 100;
        if (val.endsWith('px')) return parseFloat(val);
        return parseFloat(val) || 48;
    }

    _scatter() {
        this.particles.forEach(p => {
            p.x = p.tx + (Math.random() - 0.5) * this.scatter * this.dpr;
            p.y = p.ty + (Math.random() - 0.5) * this.scatter * this.dpr;
            p.gathered = false;
        });
    }

    _animate() {
        if (!this.isVisible) return;
        this.animId = requestAnimationFrame(() => this._animate());

        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const now = performance.now();
        const elapsed = now - this.startTime;

        ctx.clearRect(0, 0, w, h);

        // Glow setup
        if (this.glow) {
            ctx.shadowBlur = 6 * this.dpr;
            ctx.shadowColor = this.highlightColor;
        }

        const repelR = this.repelRadius * this.dpr;
        const repelR2 = repelR * repelR;
        const repelForce = this.pointerRepel * this.dpr;
        const driftAmp = this.idleDrift * this.dpr;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Staggered gather timing
            const localElapsed = elapsed - p.delay;
            const gatherProgress = Math.min(1, Math.max(0, localElapsed / this.gatherDuration));
            // Smooth ease-out cubic
            const ease = 1 - Math.pow(1 - gatherProgress, 3);

            // Target with idle drift
            const driftX = Math.sin(now * 0.001 * p.driftSpeed + p.driftPhase) * driftAmp;
            const driftY = Math.cos(now * 0.0013 * p.driftSpeed + p.driftPhase * 1.3) * driftAmp;

            let targetX = p.tx + driftX;
            let targetY = p.ty + driftY;

            // Pointer repel
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < repelR2 && dist2 > 0.1) {
                const dist = Math.sqrt(dist2);
                const force = (1 - dist / repelR) * repelForce;
                targetX += (dx / dist) * force;
                targetY += (dy / dist) * force;
            }

            // Spring physics toward target
            const springK = 0.08;
            const damping = 0.82;

            if (gatherProgress < 1) {
                // Still gathering — lerp from scattered position
                p.x += (targetX - p.x) * ease * 0.12;
                p.y += (targetY - p.y) * ease * 0.12;
            } else {
                // Gathered — spring physics
                p.vx += (targetX - p.x) * springK;
                p.vy += (targetY - p.y) * springK;
                p.vx *= damping;
                p.vy *= damping;
                p.x += p.vx;
                p.y += p.vy;
            }

            // Color: blend between base and highlight based on proximity to pointer
            let alpha = gatherProgress * 0.9 + 0.1;
            let fillColor = this.color;

            if (dist2 < repelR2 * 2.5) {
                const proximity = 1 - Math.sqrt(dist2) / (repelR * 1.6);
                if (proximity > 0) {
                    fillColor = this.highlightColor;
                    alpha = Math.min(1, alpha + proximity * 0.3);
                    if (this.glow) {
                        ctx.shadowBlur = (6 + proximity * 14) * this.dpr;
                    }
                }
            }

            ctx.globalAlpha = alpha;
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Reset
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        if (this._observer) this._observer.disconnect();
        window.removeEventListener('resize', this._onResize);
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this._onMouse);
            this.canvas.removeEventListener('mouseleave', this._onMouseLeave);
            this.canvas.removeEventListener('touchmove', this._onTouch);
            this.canvas.removeEventListener('touchend', this._onMouseLeave);
        }
    }
}

// Auto-initialize when DOM is ready
function initHeroParticleText() {
    const container = document.getElementById('particleTextHero');
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = 'true';

    new ParticleText(container, {
        lines: [
            {
                text: 'Welcome to',
                fontSize: 'clamp(2.0rem, 3.8vw, 3.0rem)',
                fontWeight: 700,
                color: '#f8fafc',
                highlightColor: '#2dd4bf'
            },
            {
                text: 'GAMEVERSE',
                fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
                fontWeight: 800,
                color: '#f8fafc',
                highlightColor: '#00f5d4'
            }
        ],
        particleSize: 2.2,
        density: 4,
        color: '#f8fafc',
        highlightColor: '#00f5d4',
        scatter: 190,
        gatherDuration: 1600,
        stagger: 420,
        pointerRepel: 42,
        repelRadius: 120,
        idleDrift: 0.8,
        trigger: 'mount',
        fontFamily: "'Space Grotesk', sans-serif",
        textAlign: 'left',
        glow: true
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroParticleText);
} else {
    initHeroParticleText();
}
