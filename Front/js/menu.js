import { api, baseURL } from './api.js';
import { debounce, formatPrice, createEl, mapSearchParams, getFallbackImage, addToCart, toast } from './utils.js';

const categoriesTabs = document.getElementById('categoriesTabs');
const dishesGrid = document.getElementById('dishesGrid');
const searchInput = document.getElementById('searchInput');
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const sortButtons = document.querySelectorAll('.sort-btn');

let state = { 
    categories: [], 
    dishes: [], 
    activeCategoryId: null, 
    query: '', 
    priceMin: null,
    priceMax: null,
    sort: 'none',
    sortDirection: 'asc'
};
let apiErrorHandled = false;

function trySwitchProtocolOnce() {
    try {
        const current = localStorage.getItem('apiBaseURL') || baseURL || '';
        if (!current) return false;
        const u = new URL(current);
        if (u.hostname === 'localhost') {
            u.protocol = u.protocol === 'https:' ? 'http:' : 'https:';
            localStorage.setItem('apiBaseURL', u.toString().replace(/\/$/, ''));
            location.reload();
            return true;
        }
    } catch (_) { /* noop */ }
    return false;
}

async function loadCategories() {
    try {
        state.categories = await api.getCategories();
        renderCategories();
    } catch (e) {
        console.error('Error cargando categorías', e);
        toast('No se pudo cargar categorías. Verificá la API.');
        if (!apiErrorHandled) {
            apiErrorHandled = true;
            const current = localStorage.getItem('apiBaseURL') || baseURL || '';
            // Intento automático: alternar https/http en localhost
            if (/^https?:\/\/localhost/i.test(current)) {
                if (trySwitchProtocolOnce()) return;
            }
            const val = prompt('URL de la API (por ejemplo https://localhost:7069):', current);
            if (val) {
                localStorage.setItem('apiBaseURL', val);
                location.reload();
            }
        }
    }
}

async function loadDishes() {
    try {
        const params = mapSearchParams({ 
            search: state.query, 
            categoryId: state.activeCategoryId, 
            onlyAvailable: state.onlyAvailable ? true : undefined,
            sort: state.sort === 'none' ? undefined : state.sort 
        });
        let list = await api.getDishes(params.toString());
        
        // Aplicar filtros adicionales en el frontend
        list = applyFrontendFilters(list);
        
        state.dishes = list;
        renderDishes();
    } catch (e) {
        console.error('Error cargando platos', e);
        toast('No se pudo cargar el menú. Verificá la API.');
    }
}

function applyFrontendFilters(dishes) {
    return dishes.filter(dish => {
        // Filtro de precio
        if (state.priceMin !== null && dish.price < state.priceMin) return false;
        if (state.priceMax !== null && dish.price > state.priceMax) return false;
        
        
        return true;
    }).sort((a, b) => {
        if (state.sort === 'name') {
            return state.sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        if (state.sort === 'price') {
            return state.sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        }
        if (state.sort === 'popular') {
            // Simulado - podrías agregar un campo 'popularity' en tu backend
            const aPopularity = a.popularity || Math.random();
            const bPopularity = b.popularity || Math.random();
            return state.sortDirection === 'asc' ? aPopularity - bPopularity : bPopularity - aPopularity;
        }
        return 0;
    });
}

function renderCategories() {
    categoriesTabs.innerHTML = '';
    const all = createEl('button', `tab ${state.activeCategoryId ? '' : 'tab--active'}`, 'Todas');
    all.addEventListener('click', () => { state.activeCategoryId = null; loadDishes(); highlightActive(); });
    categoriesTabs.appendChild(all);
    for (const c of state.categories) {
        const btn = createEl('button', `tab ${state.activeCategoryId === c.id ? 'tab--active' : ''}`, c.name);
        btn.addEventListener('click', () => { state.activeCategoryId = c.id; loadDishes(); highlightActive(); });
        categoriesTabs.appendChild(btn);
    }
}

function highlightActive() {
    [...categoriesTabs.children].forEach((el, i) => {
        const isAll = i === 0 && !state.activeCategoryId;
        el.classList.toggle('tab--active', isAll || state.categories[i-1]?.id === state.activeCategoryId);
    });
}

function renderDishes() {
    // Los filtros ya se aplicaron en applyFrontendFilters
    const filtered = state.dishes;
    dishesGrid.innerHTML = '';
    
    if (!filtered.length) {
        const msg = createEl('div', 'row', 'No hay platos que coincidan con los filtros seleccionados.');
        dishesGrid.appendChild(msg);
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
        btn.addEventListener('click', () => { location.hash = `detalle-plato/${d.id}`; });
        const quick = createEl('button', 'btn btn--ghost btn--pill', 'Agregar');
        quick.addEventListener('click', () => {
            if (!d.isAvailable) { toast('El plato no está disponible'); return; }
            addToCart({ dishId: d.id, name: d.name, price: d.price, quantity: 1 });
            toast('Agregado a la comanda');
            // LLevar a Mi comanda para ver inmediatamente
            location.hash = '#comanda';
        });
        meta.append(price, chip);
        actions.append(btn, quick);
        body.append(title, meta, actions);
        card.append(img, body);
        dishesGrid.appendChild(card);
    }
}

// Event listeners para filtros
searchInput.addEventListener('input', debounce((e) => { 
    state.query = e.target.value.trim(); 
    loadDishes(); 
}, 300));

// Filtros de botones

// Filtros de precio
priceMin.addEventListener('input', debounce((e) => { 
    state.priceMin = e.target.value ? parseFloat(e.target.value) : null; 
    loadDishes(); 
}, 300));

priceMax.addEventListener('input', debounce((e) => { 
    state.priceMax = e.target.value ? parseFloat(e.target.value) : null; 
    loadDishes(); 
}, 300));

// Botones de ordenamiento
sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const sortType = btn.dataset.sort;
        
        // Si es el mismo tipo, cambiar dirección
        if (state.sort === sortType) {
            state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort = sortType;
            state.sortDirection = 'asc';
        }
        
        // Actualizar UI
        sortButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Agregar indicador de dirección
        btn.querySelector('span').textContent = btn.dataset.sort === 'name' ? 'Nombre' : 
                                               btn.dataset.sort === 'price' ? 'Precio' : 'Popularidad';
        if (state.sortDirection === 'desc') {
            btn.querySelector('span').textContent += ' ↓';
        } else {
            btn.querySelector('span').textContent += ' ↑';
        }
        
        loadDishes();
    });
});

window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadDishes();
});


