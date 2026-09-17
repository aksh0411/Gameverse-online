// =========================================================================
// DECRYPTED TEXT ANIMATION
// Vanilla JS implementation of react-bits DecryptedText
// Scrambles text and sequentially reveals characters with cyber glyphs
// =========================================================================

class DecryptedText {
    constructor(element, options = {}) {
        if (!element) return;
        this.element = element;
        this.originalText = options.text || element.textContent.trim();
        this.speed = options.speed || 35; // milliseconds per frame
        this.maxIterations = options.maxIterations || 15;
        this.sequential = options.sequential !== false;
        this.revealDirection = options.revealDirection || 'start';
        this.characters = options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}:<>?~/\\|[]';
        this.className = options.className || 'revealed';
        this.encryptedClassName = options.encryptedClassName || 'encrypted';
        this.parentClassName = options.parentClassName || 'decrypted-text-wrapper';
        this.animateOn = options.animateOn || 'view';
        this.isAnimating = false;
        this.interval = null;

        this.init();
    }

    init() {
        this.element.classList.add(this.parentClassName);
        this.element.setAttribute('data-original-text', this.originalText);

        // Run on view / load
        if (this.animateOn === 'view') {
            // Small initial delay so hero entrance fade-in starts first
            setTimeout(() => {
                this.startAnimation();
            }, 250);
        }

        // Also decrypt on hover
        this.element.addEventListener('mouseenter', () => {
            if (!this.isAnimating) {
                this.startAnimation();
            }
        });
    }

    getRandomChar() {
        return this.characters[Math.floor(Math.random() * this.characters.length)];
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        clearInterval(this.interval);

        const length = this.originalText.length;
        let step = 0;

        // Calculate reveal speed: advance reveal position smoothly
        this.interval = setInterval(() => {
            step++;
            const revealedCount = Math.floor(step * 1.5);

            if (revealedCount >= length) {
                clearInterval(this.interval);
                this.renderFinal();
                this.isAnimating = false;
                return;
            }

            this.renderScrambled(revealedCount);
        }, this.speed);
    }

    renderScrambled(revealedCount) {
        const chars = this.originalText.split('');
        const html = chars.map((char, index) => {
            if (char === ' ') {
                return ' ';
            }
            if (index < revealedCount) {
                return `<span class="${this.className}">${char}</span>`;
            } else {
                // Scrambled cyber character
                const randomChar = this.getRandomChar();
                return `<span class="${this.encryptedClassName}">${randomChar}</span>`;
            }
        }).join('');

        this.element.innerHTML = html;
    }

    renderFinal() {
        const chars = this.originalText.split('');
        const html = chars.map((char) => {
            if (char === ' ') return ' ';
            return `<span class="${this.className}">${char}</span>`;
        }).join('');
        this.element.innerHTML = html;
    }
}

// Auto-initialize on hero description paragraph when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const heroDesc = document.querySelector('.hero-desc');
    if (heroDesc) {
        new DecryptedText(heroDesc, {
            speed: 30,
            sequential: true,
            revealDirection: 'start',
            animateOn: 'view',
            characters: '0123456789ABCDEF!@#$%^&*<>~_[]{}—=+'
        });
    }
});
