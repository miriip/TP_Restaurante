/**
 * Menu Component
 * Maneja la lógica del menú de platos
 */
import { api } from '../../services/api.js';
import { createEl, toast, debounce, formatPrice, getFallbackImage } from '../../utils/utils.js';

export class Menu {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.categoriesTabs = document.getElementById('categoriesTabs');
        this.dishesGrid = document.getElementById('dishesGrid');
        this.sortButtons = document.querySelectorAll('.sort-btn');
        this.priceMin = document.getElementById('priceMin');
        this.priceMax = document.getElementById('priceMax');
        
        this.state = { 
            categories: [], 
            dishes: [], 
            activeCategoryId: null, 
            query: '', 
            priceMin: null,
            priceMax: null,
            sort: 'none',
            sortDirection: 'asc'
        };
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadDishes();
        this.setupEventListeners();
        this.renderDishes();
    }

    async loadCategories() {
        try {
            this.state.categories = await api.getAllCategories();
            this.renderCategories();
        } catch (e) {
            console.error('Error cargando categorías', e);
            toast('No se pudo cargar categorías. Verificá la API.');
        }
    }

    async loadDishes() {
        try {
            const params = new URLSearchParams();
            if (this.state.query) params.append('search', this.state.query);
            if (this.state.activeCategoryId) params.append('categoryId', this.state.activeCategoryId);
            if (this.state.sort !== 'none') params.append('sort', this.state.sort);
            
            let list = await api.getAllDishes(params.toString());
            
            // Aplicar filtros adicionales en el frontend
            list = this.applyFrontendFilters(list);
            
            this.state.dishes = list;
            this.renderDishes();
        } catch (e) {
            console.error('Error cargando platos', e);
            toast('No se pudo cargar el menú. Verificá la API.');
        }
    }

    applyFrontendFilters(dishes) {
        return dishes.filter(dish => {
            // Filtro de precio
            if (this.state.priceMin !== null && dish.price < this.state.priceMin) return false;
            if (this.state.priceMax !== null && dish.price > this.state.priceMax) return false;
            
            return true;
        }).sort((a, b) => {
            if (this.state.sort === 'name') {
                return this.state.sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            }
            if (this.state.sort === 'price') {
                return this.state.sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
            }
            if (this.state.sort === 'popular') {
                const aPopularity = a.popularity || Math.random();
                const bPopularity = b.popularity || Math.random();
                return this.state.sortDirection === 'asc' ? aPopularity - bPopularity : bPopularity - aPopularity;
            }
            return 0;
        });
    }

    renderCategories() {
        this.categoriesTabs.innerHTML = '';
        const all = createEl('button', `tab ${this.state.activeCategoryId ? '' : 'tab--active'}`, 'Todas');
        all.addEventListener('click', () => { 
            this.state.activeCategoryId = null; 
            this.loadDishes(); 
            this.highlightActive(); 
        });
        this.categoriesTabs.appendChild(all);
        
        for (const c of this.state.categories) {
            const btn = createEl('button', `tab ${this.state.activeCategoryId === c.id ? 'tab--active' : ''}`, c.name);
            btn.addEventListener('click', () => { 
                this.state.activeCategoryId = c.id; 
                this.loadDishes(); 
                this.highlightActive(); 
            });
            this.categoriesTabs.appendChild(btn);
        }
    }

    highlightActive() {
        [...this.categoriesTabs.children].forEach((el, i) => {
            const isAll = i === 0 && !this.state.activeCategoryId;
            el.classList.toggle('tab--active', isAll || this.state.categories[i-1]?.id === this.state.activeCategoryId);
        });
    }

    renderDishes() {
        const filtered = this.state.dishes;
        this.dishesGrid.innerHTML = '';
        
        if (!filtered.length) {
            const msg = createEl('div', 'row', 'No hay platos que coincidan con los filtros seleccionados.');
            this.dishesGrid.appendChild(msg);
            return;
        }
        
        for (const d of filtered) {
            const card = createEl('article', 'card');
            const img = createEl('img', 'card__media');
            img.src = d.imageUrl || getFallbackImage(d.name || d.id);
            img.onerror = () => { img.src = getFallbackImage(d.name || d.id); };
            img.alt = d.name || 'Plato';
            
            const body = createEl('div', 'card__body');
            const title = createEl('h3', 'card__title card__title--center', d.name);
            const meta = createEl('div', 'card__meta');
            const price = createEl('span', 'price', formatPrice(d.price));
            const chip = createEl('span', `chip ${d.isAvailable ? 'chip--ok' : 'chip--off'}`, d.isAvailable ? 'Disponible' : 'Sin stock');
            
            const actions = createEl('div', 'row__actions');
            const btn = createEl('button', 'btn btn--primary btn--pill', 'Ver detalle');
            btn.addEventListener('click', () => { 
                location.hash = `#detalle-plato/${d.id}`; 
            });
            
            const quick = createEl('button', 'btn btn--ghost btn--pill', 'Agregar');
            quick.addEventListener('click', () => {
                if (!d.isAvailable) { 
                    toast('El plato no está disponible'); 
                    return; 
                }
                this.addToCart({ dishId: d.id, name: d.name, price: d.price, quantity: 1 });
                toast('Agregado a la comanda');
                location.hash = '#comanda';
            });
            
            meta.append(price, chip);
            actions.append(btn, quick);
            body.append(title, meta, actions);
            card.append(img, body);
            this.dishesGrid.appendChild(card);
        }
    }

    setupEventListeners() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => { 
                this.state.query = e.target.value.trim(); 
                this.loadDishes(); 
            }, 300));
        }

        // Price filters
        if (this.priceMin) {
            this.priceMin.addEventListener('input', debounce((e) => { 
                this.state.priceMin = e.target.value ? parseFloat(e.target.value) : null; 
                this.loadDishes(); 
            }, 300));
        }
        
        if (this.priceMax) {
            this.priceMax.addEventListener('input', debounce((e) => { 
                this.state.priceMax = e.target.value ? parseFloat(e.target.value) : null; 
                this.loadDishes(); 
            }, 300));
        }

        // Sort buttons
        this.sortButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const sortType = btn.dataset.sort;
                
                if (this.state.sort === sortType) {
                    this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.state.sort = sortType;
                    this.state.sortDirection = 'asc';
                }
                
                // Actualizar UI
                this.sortButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Agregar indicador de dirección
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = btn.dataset.sort === 'name' ? 'Nombre' : 
                                      btn.dataset.sort === 'price' ? 'Precio' : 'Popularidad';
                    if (this.state.sortDirection === 'desc') {
                        span.textContent += ' ↓';
                    } else {
                        span.textContent += ' ↑';
                    }
                }
                
                this.loadDishes();
            });
        });
    }

    addToCart(item) {
        // Emit custom event for cart
        const event = new CustomEvent('addToCart', { 
            detail: { dish: item } 
        });
        document.dispatchEvent(event);
    }
}