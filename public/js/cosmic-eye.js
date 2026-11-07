// =========================================================================
// COSMIC EYE & MINI TESSERACT COMPANION
// Centered in the Navigation Bar:
//   1. Cosmic Eye — Real-time cursor tracking using atan2(dy, dx), smooth lerp,
//      eyelid blinking, glint, and gaze response.
//   2. Floating Mini Tesseract — Genuine 4D hypercube wireframe (16 vertices,
//      32 edges) rotating through 4D planes (XW/YZ), floating beside the eye,
//      reacting to mouse position with click hyper-spin easter egg!
// =========================================================================

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────
    // 1. FLOATING MINI 4D TESSERACT ENGINE
    // ─────────────────────────────────────────────────────────────────────────
    class MiniTesseract {
        constructor(parentEl) {
            this.container = document.createElement('div');
            this.container.id = 'miniTesseract';
            this.container.className = 'mini-tesseract-widget';
            this.container.setAttribute('role', 'button');
            this.container.setAttribute('tabindex', '0');
            this.container.setAttribute('aria-label', 'Floating 4D Mini Tesseract');
            this.container.title = '4D Tesseract — Click to warp spin';

            this.canvas = document.createElement('canvas');
            this.canvas.width = 72;
            this.canvas.height = 72;
            this.ctx = this.canvas.getContext('2d');
            this.container.appendChild(this.canvas);
            parentEl.appendChild(this.container);

            // 16 4D Vertices: (x, y, z, w) where each is -1 or +1
            this.vertices4D = [];
            for (let i = 0; i < 16; i++) {
                this.vertices4D.push([
                    (i & 1) ? 1 : -1,
                    (i & 2) ? 1 : -1,
                    (i & 4) ? 1 : -1,
                    (i & 8) ? 1 : -1
                ]);
            }

            // 32 4D Edges (differ by exactly 1 bit)
            this.edges = [];
            for (let i = 0; i < 16; i++) {
                for (let j = i + 1; j < 16; j++) {
                    const diff = i ^ j;
                    if ((diff & (diff - 1)) === 0) {
                        const type = ((i & 8) === (j & 8)) ? ((i & 8) ? 'outer' : 'inner') : 'cross';
                        this.edges.push([i, j, type]);
                    }
                }
            }

            this.rotXW = 0.2;
            this.rotYZ = 0.4;
            this.tiltX = 0;
            this.tiltY = 0;
            this.hyperSpin = 0;
            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;

            // Cached rect & center coords (updated on resize/scroll, NOT every frame)
            this.cx = 0;
            this.cy = 0;
            this._updateRect();

            // Preallocated projected vertex buffer (zero GC allocations in draw loop)
            this.projected = [];
            for (let i = 0; i < 16; i++) {
                this.projected.push({ x: 0, y: 0, z: 0, w: 0 });
            }

            this._bind();
            // Driven by unified CosmicEye RAF loop
        }

        _updateRect() {
            if (!this.container) return;
            const r = this.container.getBoundingClientRect();
            this.cx = r.left + r.width / 2;
            this.cy = r.top + r.height / 2;
        }

        _bind() {
            const onMove = (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            };
            window.addEventListener('mousemove', onMove, { passive: true });

            const onResize = () => { this._updateRect(); };
            window.addEventListener('resize', onResize, { passive: true });
            window.addEventListener('scroll', onResize, { passive: true });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.isPaused = true;
                } else {
                    this.isPaused = false;
                    this._updateRect();
                }
            });

            const triggerSpin = () => {
                this.hyperSpin = 1.0;
                this.container.classList.add('is-spinning');
                setTimeout(() => this.container.classList.remove('is-spinning'), 1200);
            };

            this.container.addEventListener('click', triggerSpin);
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerSpin();
                }
            });
        }

        _start() {
            const step = () => {
                if (!this.isPaused) {
                    this._draw();
                }
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }

        _draw() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, 72, 72);

            // Use cached center coordinates (zero forced reflows)
            const cx = this.cx || 36;
            const cy = this.cy || 36;

            // Target tilt from cursor
            const targetTiltX = (this.mouseX - cx) * 0.0006;
            const targetTiltY = (this.mouseY - cy) * 0.0006;
            this.tiltX += (targetTiltX - this.tiltX) * 0.1;
            this.tiltY += (targetTiltY - this.tiltY) * 0.1;

            // 4D Rotation increment
            const speed = 0.016 + this.hyperSpin * 0.07;
            this.rotXW += speed;
            this.rotYZ += speed * 0.8;
            this.hyperSpin *= 0.95;

            // Project all 16 vertices in-place (zero GC allocations)
            const sinXW = Math.sin(this.rotXW), cosXW = Math.cos(this.rotXW);
            const sinYZ = Math.sin(this.rotYZ), cosYZ = Math.cos(this.rotYZ);
            const sinTX = Math.sin(this.tiltX), cosTX = Math.cos(this.tiltX);
            const sinTY = Math.sin(this.tiltY), cosTY = Math.cos(this.tiltY);

            const projected = this.projected;
            const d4 = 2.4;
            const d3 = 3.0;
            const zoom = 50;

            for (let i = 0; i < 16; i++) {
                const v = this.vertices4D[i];
                // 1. Rotate in 4D plane XW
                const x1 = v[0] * cosXW - v[3] * sinXW;
                const w1 = v[0] * sinXW + v[3] * cosXW;

                // 2. Rotate in 4D plane YZ
                const y1 = v[1] * cosYZ - v[2] * sinYZ;
                const z1 = v[1] * sinYZ + v[2] * cosYZ;

                // 3. Parallax 3D tilt from mouse
                const x2 = x1 * cosTX - z1 * sinTX;
                const z2 = x1 * sinTX + z1 * cosTX;
                const y2 = y1 * cosTY - z2 * sinTY;
                const z3 = y1 * sinTY + z2 * cosTY;

                // 4. Perspective projection from 4D to 3D
                const s4 = 1 / (d4 - w1 * 0.55);
                const x3 = x2 * s4;
                const y3 = y2 * s4;
                const z4 = z3 * s4;

                // 5. Perspective projection from 3D to 2D
                const s3 = 1 / (d3 - z4 * 0.7);

                const p = projected[i];
                p.x = 36 + x3 * s3 * zoom;
                p.y = 36 + y3 * s3 * zoom;
                p.z = z4;
                p.w = w1;
            }

            // Draw 32 Edges
            this.edges.forEach(([i, j, type]) => {
                const p1 = projected[i];
                const p2 = projected[j];
                const avgZ = (p1.z + p2.z) / 2;
                const alpha = Math.max(0.25, Math.min(0.95, (avgZ + 1.2) / 2.4));

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                if (type === 'outer') {
                    ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
                    ctx.lineWidth = 1.4;
                    ctx.shadowColor = '#00f5d4';
                    ctx.shadowBlur = 4;
                } else if (type === 'inner') {
                    ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.shadowColor = '#ec4899';
                    ctx.shadowBlur = 4;
                } else {
                    ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.75})`;
                    ctx.lineWidth = 0.9;
                }

                ctx.stroke();
                ctx.restore();
            });

            // Draw Vertices
            projected.forEach(p => {
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#00f5d4';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. COSMIC EYE ENGINE (CENTERED NAV WATCHER)
    // ─────────────────────────────────────────────────────────────────────────
    class CosmicEye {
        constructor(options = {}) {
            this.container = null;
            this.iris = null;
            this.pupil = null;
            this.upperLid = null;
            this.lowerLid = null;

            this.mouseX = window.innerWidth / 2;
            this.mouseY = window.innerHeight / 2;
            this.currentX = 0;
            this.currentY = 0;
            this.targetX = 0;
            this.targetY = 0;

            this.lastMoveTime = performance.now();
            this.isIdle = false;
            this.idleAngle = 0;
            this.animId = null;
            this.blinkTimer = null;
            this.isBlinking = false;

            this.maxRadius = options.maxRadius || 6.5; // max px iris can travel from center
            this.lerpSpeed = options.lerpSpeed || 0.12;

            this._init();
        }

        _init() {
            // Find or create the center cluster
            let centerCluster = document.getElementById('navCenterCluster');
            if (!centerCluster) {
                // Auto-create in floating-header or dashboard-topbar
                const navBar = document.getElementById('globalHeader') ||
                               document.querySelector('.dashboard-topbar') ||
                               document.querySelector('header');
                if (navBar) {
                    centerCluster = document.createElement('div');
                    centerCluster.id = 'navCenterCluster';
                    centerCluster.className = 'nav-center-cluster';
                    navBar.appendChild(centerCluster);
                } else {
                    centerCluster = document.createElement('div');
                    centerCluster.id = 'navCenterCluster';
                    centerCluster.className = 'nav-center-cluster cosmic-eye-fixed-slot';
                    document.body.appendChild(centerCluster);
                }
            }

            // Build Cosmic Eye DOM
            const widget = document.createElement('div');
            widget.id = 'cosmicEye';
            widget.className = 'cosmic-eye-widget';
            widget.setAttribute('role', 'button');
            widget.setAttribute('tabindex', '0');
            widget.setAttribute('aria-label', 'Cosmic Observer — Eye following cursor');
            widget.title = 'Cosmic Watcher — The universe watches back';

            widget.innerHTML = `
                <div class="cosmic-eye-bezel">
                    <div class="cosmic-eye-sclera">
                        <div class="cosmic-eye-iris">
                            <div class="cosmic-eye-pupil">
                                <span class="cosmic-eye-glint"></span>
                            </div>
                        </div>
                        <div class="cosmic-eye-lid cosmic-eye-lid-upper"></div>
                        <div class="cosmic-eye-lid cosmic-eye-lid-lower"></div>
                    </div>
                </div>
                <div class="cosmic-eye-halo" aria-hidden="true"></div>
            `;

            centerCluster.appendChild(widget);

            this.container = widget;
            this.iris = widget.querySelector('.cosmic-eye-iris');
            this.pupil = widget.querySelector('.cosmic-eye-pupil');
            this.upperLid = widget.querySelector('.cosmic-eye-lid-upper');
            this.lowerLid = widget.querySelector('.cosmic-eye-lid-lower');

            // Cached center coordinates
            this.eyeCenterX = 0;
            this.eyeCenterY = 0;
            this._updateRect();

            // Also mount the companion Floating Mini Tesseract right next to the eye!
            this.tesseract = new MiniTesseract(centerCluster);

            this._bindEvents();
            this._startLoop();
            this._scheduleNextBlink();
        }

        _updateRect() {
            if (!this.container) return;
            const r = this.container.getBoundingClientRect();
            this.eyeCenterX = r.left + r.width / 2;
            this.eyeCenterY = r.top + r.height / 2;
        }

        _bindEvents() {
            const onResize = () => { this._updateRect(); };
            window.addEventListener('resize', onResize, { passive: true });
            window.addEventListener('scroll', onResize, { passive: true });

            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.isPaused = true;
                } else {
                    this.isPaused = false;
                    this._updateRect();
                }
            });

            const onPointerMove = (e) => {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                if (typeof clientX === 'number' && typeof clientY === 'number') {
                    this.mouseX = clientX;
                    this.mouseY = clientY;
                    this.lastMoveTime = performance.now();
                    this.isIdle = false;
                }
            };

            window.addEventListener('mousemove', onPointerMove, { passive: true });
            window.addEventListener('touchmove', onPointerMove, { passive: true });

            if (this.container) {
                this.container.addEventListener('click', () => this.wink());
                this.container.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.wink();
                    }
                });
            }
        }

        wink() {
            if (this.isBlinking) return;
            this.isBlinking = true;
            this.container.classList.add('is-winking');

            if (this.pupil) this.pupil.classList.add('dilated');

            setTimeout(() => {
                this.container.classList.remove('is-winking');
                setTimeout(() => {
                    this.container.classList.add('is-winking');
                    setTimeout(() => {
                        this.container.classList.remove('is-winking');
                        if (this.pupil) this.pupil.classList.remove('dilated');
                        this.isBlinking = false;
                        this._scheduleNextBlink();
                    }, 120);
                }, 80);
            }, 120);
        }

        blink() {
            if (this.isBlinking) return;
            this.isBlinking = true;
            this.container.classList.add('is-blinking');

            setTimeout(() => {
                this.container.classList.remove('is-blinking');
                this.isBlinking = false;
                this._scheduleNextBlink();
            }, 140);
        }

        _scheduleNextBlink() {
            clearTimeout(this.blinkTimer);
            const delay = 3500 + Math.random() * 4000;
            this.blinkTimer = setTimeout(() => {
                this.blink();
            }, delay);
        }

        _startLoop() {
            const step = (time) => {
                if (!this.isPaused) {
                    this._update(time);
                    if (this.tesseract && !this.tesseract.isPaused) {
                        this.tesseract._draw();
                    }
                }
                this.animId = requestAnimationFrame(step);
            };
            this.animId = requestAnimationFrame(step);
        }

        _update(time) {
            if (!this.container || !this.iris || this.isPaused) return;

            // Use cached center coordinates (zero forced reflows in RAF loop)
            const eyeCenterX = this.eyeCenterX || (window.innerWidth / 2);
            const eyeCenterY = this.eyeCenterY || 30;

            const idleDelta = time - this.lastMoveTime;
            if (idleDelta > 3500) {
                this.isIdle = true;
                this.idleAngle += 0.025;
                const idleR = Math.sin(time * 0.0015) * (this.maxRadius * 0.55);
                this.targetX = Math.cos(this.idleAngle) * idleR;
                this.targetY = Math.sin(this.idleAngle * 1.5) * (idleR * 0.65);
            } else {
                const dx = this.mouseX - eyeCenterX;
                const dy = this.mouseY - eyeCenterY;
                const dist = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);

                const travel = Math.min(dist * 0.028, this.maxRadius);
                this.targetX = Math.cos(angle) * travel;
                this.targetY = Math.sin(angle) * travel;
            }

            this.currentX += (this.targetX - this.currentX) * this.lerpSpeed;
            this.currentY += (this.targetY - this.currentY) * this.lerpSpeed;

            this.iris.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;
        }

        destroy() {
            if (this.animId) cancelAnimationFrame(this.animId);
            clearTimeout(this.blinkTimer);
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }
    }

    function initCosmicCluster() {
        if (window.__cosmicEyeInstance) return;
        window.__cosmicEyeInstance = new CosmicEye();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCosmicCluster);
    } else {
        initCosmicCluster();
    }

    window.CosmicEye = CosmicEye;
    window.MiniTesseract = MiniTesseract;
})();
