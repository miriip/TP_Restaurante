/**
 * Menu Component
 * Maneja la lógica del menú de platos
 */
import { api } from '../../services/api.js';
import { createEl, toast } from '../../utils/utils.js';

export class Menu {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.categoriesTabs = document.getElementById('categoriesTabs');
        this.dishesGrid = document.getElementById('dishesGrid');
        this.sortButtons = document.querySelectorAll('.sort-btn');
        this.priceMin = document.getElementById('priceMin');
        this.priceMax = document.getElementById('priceMax');
        
        this.dishes = [];
        this.filteredDishes = [];
        this.currentCategory = 'all';
        this.currentSort = 'name';
        
        this.init();
    }

    async init() {
        await this.loadDishes();
        await this.loadCategories();
        this.setupEventListeners();
        this.renderDishes();
    }

    async loadDishes() {
        try {
            this.dishes = await api.getAllDishes();
            this.filteredDishes = [...this.dishes];
        } catch (error) {
            console.error('Error loading dishes:', error);
            toast('Error al cargar el menú');
        }
    }

    async loadCategories() {
        try {
            const categories = await api.getAllCategories();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories(categories) {
        this.categoriesTabs.innerHTML = '';
        
        const allTab = createEl('button', 'tab active', 'Todos');
        allTab.addEventListener('click', () => this.filterByCategory('all'));
        this.categoriesTabs.appendChild(allTab);

        categories.forEach(category => {
            const tab = createEl('button', 'tab', category.name);
            tab.addEventListener('click', () => this.filterByCategory(category.id));
            this.categoriesTabs.appendChild(tab);
        });
    }

    setupEventListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.filterDishes(e.target.value);
            });
        }

        // Sort buttons
        this.sortButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sortDishes(e.target.dataset.sort);
            });
        });

        // Price range
        if (this.priceMin) {
            this.priceMin.addEventListener('input', () => this.applyFilters());
        }
        if (this.priceMax) {
            this.priceMax.addEventListener('input', () => this.applyFilters());
        }
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.applyFilters();
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
    }

    filterDishes(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }

    sortDishes(sortBy) {
        this.currentSort = sortBy;
        this.applyFilters();
        
        // Update active sort button
        this.sortButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-sort="${sortBy}"]`).classList.add('active');
    }

    applyFilters() {
        let filtered = [...this.dishes];

        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(dish => dish.categoryId === this.currentCategory);
        }

        // Search filter
        if (this.searchTerm) {
            filtered = filtered.filter(dish => 
                dish.name.toLowerCase().includes(this.searchTerm)
            );
        }

        // Price filter
        const minPrice = parseFloat(this.priceMin?.value) || 0;
        const maxPrice = parseFloat(this.priceMax?.value) || Infinity;
        filtered = filtered.filter(dish => 
            dish.price >= minPrice && dish.price <= maxPrice
        );

        // Sort
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'popular':
                    return (b.popularity || 0) - (a.popularity || 0);
                default:
                    return 0;
            }
        });

        this.filteredDishes = filtered;
        this.renderDishes();
    }

    renderDishes() {
        this.dishesGrid.innerHTML = '';
        
        if (this.filteredDishes.length === 0) {
            this.dishesGrid.innerHTML = '<div class="no-results">No se encontraron platos</div>';
            return;
        }

        this.filteredDishes.forEach(dish => {
            const dishCard = this.createDishCard(dish);
            this.dishesGrid.appendChild(dishCard);
        });
    }

    createDishCard(dish) {
        const card = createEl('div', 'card');
        card.innerHTML = `
            <div class="card__image">
                <img src="${dish.image || './assets/placeholder-dish.jpg'}" alt="${dish.name}" />
            </div>
            <div class="card__content">
                <h3 class="card__title">${dish.name}</h3>
                <p class="card__description">${dish.description || ''}</p>
                <div class="card__footer">
                    <span class="card__price">$${dish.price}</span>
                    <button class="btn btn--primary" data-dish-id="${dish.id}">
                        Agregar
                    </button>
                </div>
            </div>
        `;

        // Add click handler
        const addBtn = card.querySelector('button');
        addBtn.addEventListener('click', () => {
            this.addToCart(dish);
        });

        return card;
    }

    addToCart(dish) {
        // Emit custom event for cart
        const event = new CustomEvent('addToCart', { 
            detail: { dish } 
        });
        document.dispatchEvent(event);
        
        toast(`${dish.name} agregado al carrito`);
    }
}
