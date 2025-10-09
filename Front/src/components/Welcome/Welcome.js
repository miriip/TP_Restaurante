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
        this.setupEnterButton();
    }

    setupEnterButton() {
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => {
                this.navigateToMenu();
            });
        }
    }

    navigateToMenu() {
        window.location.hash = '#menu';
    }
}
