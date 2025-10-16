/**
 * Header Component
 * Maneja la navegación y el toggle de roles
 */
export class Header {
    constructor() {
        this.roleToggle = document.getElementById('roleToggle');
        this.roleLabel = document.getElementById('roleLabel');
        this.panelLink = document.getElementById('panelLink');
        this.nav = document.getElementById('mainNav');
        this.init();
    }

    init() {
        this.setupRoleToggle();
        this.setupNavigation();
        this.hideNavigationOnWelcome();
    }

    setupRoleToggle() {
        if (this.roleToggle) {
            this.roleToggle.addEventListener('change', (e) => {
                const isAdmin = e.target.checked;
                this.toggleRole(isAdmin);
            });
        }
    }

    setupNavigation() {
        // Lógica de navegación si es necesaria
        console.log('Header navigation initialized');
    }

    toggleRole(isAdmin) {
        if (isAdmin) {
            this.roleLabel.textContent = 'Rol: Admin';
            this.panelLink.style.display = 'inline-block';
        } else {
            this.roleLabel.textContent = 'Rol: Cliente';
            this.panelLink.style.display = 'none';
        }
    }

    hideNavigationOnWelcome() {
        // Ocultar navegación cuando estamos en la página de bienvenida
        const welcomePage = document.getElementById('welcome');
        if (welcomePage && !welcomePage.classList.contains('hidden')) {
            this.nav.style.display = 'none';
        }
    }

    showNavigation() {
        // Mostrar navegación en otras páginas
        this.nav.style.display = 'flex';
    }
}
