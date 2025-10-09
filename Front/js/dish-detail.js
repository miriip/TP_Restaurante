import { api } from './api.js';
import { createEl, formatPrice, getFallbackImage, addToCart, toast } from './utils.js';

const container = document.getElementById('detalle-plato');

async function renderDishDetail(id) {
    if (!container) return;
    container.innerHTML = '';
    try {
        const d = await api.getDishById(id);
        const wrap = createEl('div', 'row');
        const media = createEl('img', 'card__media');
        media.src = d.imageUrl || getFallbackImage(d.name || d.id);
        media.onerror = () => { media.src = getFallbackImage(d.name || d.id); };
        media.alt = d.name || 'Plato';
        const title = createEl('h2', 'card__title card__title--center', d.name);
        const desc = createEl('p', '', d.description || '');
        const price = createEl('div', 'price', formatPrice(d.price));
        const avail = createEl('div', `chip ${d.isAvailable ? 'chip--ok' : 'chip--off'}`, d.isAvailable ? 'Disponible' : 'Sin stock');

        // Controles de comanda
        const controls = createEl('div', 'row__actions');
        const qtyInput = createEl('input', 'input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.max = '10';
        qtyInput.value = '1';
        const noteInput = createEl('input', 'input');
        noteInput.type = 'text';
        noteInput.placeholder = 'Nota (opcional)';
        const addBtn = createEl('button', 'btn btn--primary', 'Agregar a comanda');
        addBtn.addEventListener('click', () => {
            if (!d.isAvailable) { toast('El plato no está disponible'); return; }
            addToCart({ dishId: d.id, name: d.name, price: d.price, quantity: parseInt(qtyInput.value, 10) || 1, note: noteInput.value });
            toast('Agregado a la comanda');
            location.hash = '#comanda';
        });
        controls.append(qtyInput, noteInput, addBtn);

        wrap.append(media, title, desc, price, avail, controls);
        container.appendChild(wrap);
    } catch (e) {
        container.appendChild(createEl('p', '', 'No se pudo cargar el plato.'));
        console.error(e);
    }
}

window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '');
    const [view, id] = hash.split('/');
    if (view === 'detalle-plato' && id) renderDishDetail(id);
});

window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash.replace('#', '');
    const [view, id] = hash.split('/');
    if (view === 'detalle-plato' && id) renderDishDetail(id);
});


