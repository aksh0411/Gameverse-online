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
            // Pause rendering when nav scrolls out of view (saves CPU)
            this._isVisible = true;
            if ('IntersectionObserver' in window && this.container) {
                this._visObs = new IntersectionObserver((entries) => {
                    this._isVisible = entries[0].isIntersecting;
                }, { threshold: 0 });
                this._visObs.observe(this.container);
            }
            const step = (time) => {
                if (!this.isPaused && this._isVisible) {
                    this._update(time);
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
})();
