/**
 * Router
 * Maneja la navegación entre vistas
 */
import { Header } from '../components/Header/Header.js';
import { Welcome } from '../components/Welcome/Welcome.js';
import { Menu } from '../components/Menu/Menu.js';
import { Cart } from '../components/Cart/Cart.js';
import { Orders } from '../components/Orders/Orders.js';
import { AdminPanel } from '../components/AdminPanel/AdminPanel.js';

export class Router {
    constructor() {
        this.routes = new Map();
        this.currentView = null;
        this.components = new Map();
        
        this.init();
    }

    init() {
        this.setupRoutes();
        this.setupNavigation();
        this.handleInitialRoute();
    }

    setupRoutes() {
        this.routes.set('#welcome', {
            component: Welcome,
            template: 'Welcome'
        });
        
        this.routes.set('#menu', {
            component: Menu,
            template: 'Menu'
        });
        
        this.routes.set('#comanda', {
            component: Cart,
            template: 'Cart'
        });
        
        this.routes.set('#mis-ordenes', {
            component: Orders,
            template: 'Orders'
        });
        
        this.routes.set('#panel-ordenes', {
            component: AdminPanel,
            template: 'AdminPanel'
        });
    }

    setupNavigation() {
        // Header navigation
        const header = new Header();
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.navigate(window.location.hash);
        });

        // Listen for custom navigation events
        document.addEventListener('navigate', (e) => {
            this.navigate(e.detail.route);
        });
    }

    handleInitialRoute() {
        const hash = window.location.hash || '#welcome';
        this.navigate(hash);
    }

    async navigate(route) {
        const routeConfig = this.routes.get(route);
        
        if (!routeConfig) {
            console.warn(`Route ${route} not found`);
            return;
        }

        // Hide all views
        this.hideAllViews();

        // Show target view
        const viewElement = document.querySelector(route);
        if (viewElement) {
            viewElement.classList.remove('hidden');
            this.currentView = route;

            // Initialize component if not already done
            if (!this.components.has(route)) {
                const ComponentClass = routeConfig.component;
                const component = new ComponentClass();
                this.components.set(route, component);
            }
        }
    }

    hideAllViews() {
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.add('hidden');
        });
    }

    getCurrentView() {
        return this.currentView;
    }
}

export const router = new Router();
