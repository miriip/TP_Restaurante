/**
 * Header Component
 * Maneja la navegación y el toggle de roles
 */
export class Header {
    constructor() {
        this.roleToggle = document.getElementById('roleToggle');
        this.roleLabel = document.getElementById('roleLabel');
        this.panelLink = document.getElementById('panelLink');
        this.init();
    }

    init() {
        this.setupRoleToggle();
        this.setupNavigation();
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
}
