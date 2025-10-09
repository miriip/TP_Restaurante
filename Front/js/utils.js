export function formatPrice(value) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
}

export function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

export function toast(message, ms = 2600) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), ms);
}

export function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
}

export function getFallbackImage(key = '') {
    const images = [
        'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1529042410759-befb1204b468?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1543339523-33ebe48305f0?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop'
    ];
    let hash = 0;
    const s = String(key || 'dish');
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    return images[hash % images.length];
}

export function addToCart(item) {
    // item: { dishId, name, price, quantity, note }
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
    const normalized = {
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        quantity: Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1)),
        note: item.note || ''
    };
    const idx = cart.items.findIndex(i => i.dishId === normalized.dishId && (i.note || '') === normalized.note);
    if (idx >= 0) {
        cart.items[idx].quantity = Math.min(10, cart.items[idx].quantity + normalized.quantity);
    } else {
        cart.items.push(normalized);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

export function getAddressHistory(max = 8) {
    try {
        const raw = localStorage.getItem('addressHistory') || '[]';
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list.slice(0, max) : [];
    } catch (_) { return []; }
}

export function saveAddressToHistory(address) {
    const v = String(address || '').trim();
    if (!v) return;
    try {
        const raw = localStorage.getItem('addressHistory') || '[]';
        const list = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const exists = list.findIndex(x => String(x).toLowerCase() === v.toLowerCase());
        if (exists >= 0) list.splice(exists, 1);
        list.unshift(v);
        localStorage.setItem('addressHistory', JSON.stringify(list.slice(0, 12)));
    } catch (_) { /* noop */ }
}

// Map frontend search keys to backend query param names
export function mapSearchParams(params) {
    // Defaults aligned to your backend controllers
    const backendNames = JSON.parse(localStorage.getItem('searchParamMap') || '{}');
    const map = {
        search: backendNames.search || 'name',
        categoryId: backendNames.categoryId || 'category',
        onlyAvailable: backendNames.onlyAvailable || 'onlyActive',
        sortKey: backendNames.sortKey || 'sortByPrice',
        sortAsc: backendNames.sortAsc || 'ascendente',
        sortDesc: backendNames.sortDesc || 'descendente',
        panelStatusKey: backendNames.panelStatusKey || 'status',
    };
    const qp = new URLSearchParams();
    if (params.search) qp.set(map.search, params.search);
    if (params.categoryId != null) qp.set(map.categoryId, params.categoryId);
    if (params.onlyAvailable != null) qp.set(map.onlyAvailable, String(params.onlyAvailable));
    if (params.sort) {
        const v = params.sort === 'asc' ? map.sortAsc : (params.sort === 'desc' ? map.sortDesc : '');
        if (v) qp.set(map.sortKey, v);
    }
    if (params.panelStatus != null && params.panelStatus !== 'all') {
        qp.set(map.panelStatusKey, String(params.panelStatus));
    }
    return qp;
}


