/**
 * Welcome Component
 * Maneja la página de bienvenida
 */
export class Welcome {
    constructor() {
        this.enterBtn = document.getElementById('enterBtn');
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => {
                // Navigate to menu
                window.location.hash = '#menu';
            });
        }
    }
}