/**
 * Nexus 3D Animated Scene & Interactive Showcase Controller
 * ------------------------------------------------------------------
 * Drives the interactive CSS 3D orbiting stage, the floating game cards,
 * the ambient particle canvas, and the password visibility toggles.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    init3DParallax();
    initPasswordToggles();
  });

  /* ------------------------------------------------------------------
     1. Interactive Ambient Particle Canvas
     ------------------------------------------------------------------ */
  function initParticleCanvas() {
    const canvas = document.getElementById('nexusParticleCanvas');
    const panel = document.getElementById('nexusShowcasePanel');
    const modal = document.getElementById('loginModal');
    if (!canvas || !panel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let rafId = null;
    let isRunning = false;
    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999 };

    const colors = ['rgba(255, 176, 116, 0.75)', 'rgba(251, 113, 133, 0.75)', 'rgba(252, 211, 77, 0.65)', 'rgba(255, 247, 237, 0.45)'];

    function resize() {
      const rect = panel.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(18, Math.min(48, Math.floor((width * height) / 8000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: 0.9 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Gentle push from pointer
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < 120 * 120) {
          const d = Math.sqrt(d2);
          const force = ((120 - d) / 120) * 0.6;
          p.x += (dx / d) * force;
          p.y += (dy / d) * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // Connecting lines between neighbors
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 95 * 95) {
            const alpha = (1 - Math.sqrt(d2) / 95) * 0.18;
            ctx.strokeStyle = `rgba(255, 176, 116, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (!isRunning) {
        isRunning = true;
        resize();
        loop();
      }
    }

    function stop() {
      if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(rafId);
      }
    }

    panel.addEventListener('pointermove', (e) => {
      const rect = panel.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });

    panel.addEventListener('pointerleave', () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    // Auto-pause when modal is hidden or tab is inactive to preserve 100% GPU
    if (modal) {
      const observer = new MutationObserver(() => {
        if (!modal.classList.contains('hidden') && !document.hidden) {
          start();
        } else {
          stop();
        }
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (modal && !modal.classList.contains('hidden')) start();
    });

    window.addEventListener('resize', () => {
      if (isRunning) resize();
    });

    // Initial check
    if (modal && !modal.classList.contains('hidden')) {
      start();
    }
  }

  /* ------------------------------------------------------------------
     2. Interactive 3D Stage Parallax Tilt
     ------------------------------------------------------------------ */
  function init3DParallax() {
    const stage = document.getElementById('nexus3dStage');
    const panel = document.getElementById('nexusShowcasePanel');
    if (!stage || !panel) return;

    let targetRotX = 68;
    let targetRotY = 0;
    let currentRotX = 68;
    let currentRotY = 0;
    let animFrame = null;

    function updateTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;

      stage.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) rotateZ(-12deg)`;

      if (Math.abs(targetRotX - currentRotX) > 0.05 || Math.abs(targetRotY - currentRotY) > 0.05) {
        animFrame = requestAnimationFrame(updateTilt);
      } else {
        animFrame = null;
      }
    }

    panel.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = panel.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotY = nx * 22; // -11 to +11 deg
      targetRotX = 68 - ny * 16; // 60 to 76 deg

      if (!animFrame) {
        animFrame = requestAnimationFrame(updateTilt);
      }
    });

    panel.addEventListener('pointerleave', () => {
      targetRotX = 68;
      targetRotY = 0;
      if (!animFrame) {
        animFrame = requestAnimationFrame(updateTilt);
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Password Visibility Toggles
     ------------------------------------------------------------------ */
  function initPasswordToggles() {
    function setupToggle(toggleId, inputId) {
      const toggleBtn = document.getElementById(toggleId);
      const input = document.getElementById(inputId);
      if (!toggleBtn || !input) return;

      const eyeOpen = toggleBtn.querySelector('.eye-open');
      const eyeClosed = toggleBtn.querySelector('.eye-closed');

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        if (eyeOpen && eyeClosed) {
          eyeOpen.classList.toggle('hidden', isPassword);
          eyeClosed.classList.toggle('hidden', !isPassword);
        }
      });
    }

    setupToggle('loginPasswordToggle', 'loginPassword');
    setupToggle('signUpPasswordToggle', 'signUpPassword');
  }
})();
