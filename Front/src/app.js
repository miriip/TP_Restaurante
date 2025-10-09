/**
 * Main Application Entry Point
 * Inicializa la aplicación modular
 */
import { router } from './router/Router.js';
import { templateEngine } from './templates/TemplateEngine.js';
import { cartService } from './services/CartService.js';

class App {
    constructor() {
        this.router = router;
        this.templateEngine = templateEngine;
        this.cartService = cartService;
        
        this.init();
    }

    async init() {
        console.log('Initializing modular app...');
        
        // Load HTML templates
        await this.loadComponents();
        
        // Setup global event listeners
        this.setupGlobalListeners();
        
        console.log('App initialized successfully');
    }

    async loadComponents() {
        const components = [
            { id: 'header-container', template: 'Header' },
            { id: 'welcome-container', template: 'Welcome' },
            { id: 'menu-container', template: 'Menu' },
            { id: 'comanda-container', template: 'Cart' },
            { id: 'mis-ordenes-container', template: 'Orders' },
            { id: 'panel-ordenes-container', template: 'AdminPanel' }
        ];

        for (const component of components) {
            try {
                const response = await fetch(`./src/components/${component.template}/${component.template}.html`);
                const html = await response.text();
                document.getElementById(component.id).innerHTML = html;
            } catch (error) {
                console.error(`Error loading ${component.template}:`, error);
            }
        }
    }

    setupGlobalListeners() {
        // Cart events
        document.addEventListener('addToCart', (e) => {
            this.cartService.addItem(e.detail.dish);
        });

        // Navigation events
        document.addEventListener('navigate', (e) => {
            this.router.navigate(e.detail.route);
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
