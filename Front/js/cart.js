import { api } from './api.js';
import { createEl, formatPrice, toast, getAddressHistory, saveAddressToHistory } from './utils.js';

const list = document.getElementById('cartItems');
const totalEl = document.getElementById('cartTotal');
const deliverySel = document.getElementById('deliveryTypeSelect');
const confirmBtn = document.getElementById('confirmOrderBtn');
const cartSection = document.getElementById('comanda');
let deliveryToInput, deliveryToLabel, deliveryToWrap, orderNotesInput, deliveryAddressWrap, deliveryAddressInput, addressHistoryList;
const deliveryTypeNames = {};

async function loadDeliveryTypes() {
    try {
        const types = await api.getDeliveryTypes();
        deliverySel.innerHTML = '';
        for (const t of types) {
            deliveryTypeNames[String(t.id)] = String(t.name || '');
            const opt = createEl('option'); opt.value = t.id; opt.textContent = toSpanishDeliveryLabel(t.name); deliverySel.appendChild(opt);
        }
        // Seleccionar "Comer acá" por defecto si existe, sino la primera opción
        if (deliverySel.options.length > 0) {
            // Buscar la opción "Comer acá" o similar
            let defaultIndex = 0;
            for (let i = 0; i < deliverySel.options.length; i++) {
                const optionText = deliverySel.options[i].textContent.toLowerCase();
                if (optionText.includes('comer') || optionText.includes('mesa') || optionText.includes('local')) {
                    defaultIndex = i;
                    break;
                }
            }
            deliverySel.selectedIndex = defaultIndex;
        }
    } catch (e) { console.error(e); }
}

function mapDeliveryName(name) {
    const n = String(name || '').toLowerCase();
    if (n.includes('mesa') || n.includes('local') || n.includes('en mesa')) return 'Comer acá';
    if (n.includes('llevar') || n.includes('take') || n.includes('delivery')) return 'Para llevar';
    return name || 'Entrega';
}

function updateDeliveryFields() {
    const selectedId = deliverySel ? String(deliverySel.value) : '';
    const rawName = deliveryTypeNames[selectedId] || '';
    const isDelivery = /delivery/i.test(rawName);
    const isTakeAway = /llevar|take/i.test(rawName);
    const isDineIn = /comer|mesa|local|dine/i.test(rawName);
    
    console.log('updateDeliveryFields:', { selectedId, rawName, isDelivery, isTakeAway, isDineIn });
    
    // Ocultar campo "Para" para todos los tipos (no se usa)
    if (deliveryToWrap) {
        deliveryToWrap.classList.add('hidden');
        console.log('deliveryToWrap hidden: true (siempre oculto)');
    }
    
    // Dirección solo para delivery
    if (deliveryAddressWrap) {
        deliveryAddressWrap.classList.toggle('hidden', !isDelivery);
        console.log('deliveryAddressWrap hidden:', !isDelivery);
        console.log('deliveryAddressWrap element:', deliveryAddressWrap);
    } else {
        console.log('deliveryAddressWrap not found');
    }
}
function renderAddressHistory() {
    if (!addressHistoryList) return;
    addressHistoryList.innerHTML = '';
    for (const addr of getAddressHistory()) {
        const opt = document.createElement('option');
        opt.value = addr;
        addressHistoryList.appendChild(opt);
    }
}


function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
    list.innerHTML = '';
    let total = 0;
    for (const item of cart.items) {
        const row = createEl('div', 'row');
        const title = createEl('div', '', `${item.name} x${item.quantity}`);
        const note = item.note ? createEl('div', '', `Nota: ${item.note}`) : null;
        const sub = createEl('div', 'price', formatPrice(item.price * item.quantity));
        const actions = createEl('div', 'row__actions');
        const plus = createEl('button', 'btn btn--ghost', '+');
        const minus = createEl('button', 'btn btn--ghost', '−');
        const rm = createEl('button', 'btn btn--ghost', 'Quitar');
        plus.addEventListener('click', () => updateQty(item, 1));
        minus.addEventListener('click', () => updateQty(item, -1));
        rm.addEventListener('click', () => removeItem(item));
        actions.append(plus, minus, rm);
        row.append(title); if (note) row.append(note); row.append(sub, actions);
        list.appendChild(row);
        total += item.price * item.quantity;
    }
    totalEl.textContent = formatPrice(total);
}

function updateQty(item, delta) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
    const idx = cart.items.findIndex(i => i.dishId === item.dishId && (i.note||'') === (item.note||''));
    if (idx < 0) return;
    cart.items[idx].quantity = Math.max(1, Math.min(10, cart.items[idx].quantity + delta));
    if (cart.items[idx].quantity === 0) cart.items.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function removeItem(item) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
    const idx = cart.items.findIndex(i => i.dishId === item.dishId && (i.note||'') === (item.note||''));
    if (idx >= 0) cart.items.splice(idx, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

async function confirmOrder() {
    if (confirmBtn) confirmBtn.disabled = true;
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
    if (!cart.items.length) return toast('La comanda está vacía');
    const deliveryTypeId = parseInt(deliverySel.value, 10);
    if (!deliverySel.value || Number.isNaN(deliveryTypeId)) {
        toast('Elegí un tipo de entrega');
        if (confirmBtn) confirmBtn.disabled = false;
        return;
    }
    // Validación básica de GUID en ids de platos
    const invalidIds = cart.items.filter(i => !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(String(i.dishId||'')));
    if (invalidIds.length) {
        toast('Hay platos con ID inválido, vuelve a agregarlos desde el menú');
        console.warn('IDs inválidos detectados en carrito:', invalidIds);
        return;
    }
    // Mapear al esquema esperado por el backend
    const payload = {
        items: cart.items.map(i => ({ id: i.dishId, quantity: i.quantity, notes: i.note || '' })),
        delivery: { id: deliveryTypeId, to: buildDeliveryTo() },
        notes: (orderNotesInput && orderNotesInput.value) ? orderNotesInput.value : ''
    };
    
    console.log('Payload enviado:', payload);
    try {
        // Siempre crear una nueva orden para evitar modificar órdenes existentes
        await api.createOrder(payload);
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
        localStorage.removeItem('activeOrderId');
        renderCart();
        toast('Pedido enviado');
        location.hash = '#mis-ordenes';
    } catch (e) {
        let friendly = 'No se pudo enviar el pedido';
        const status = (e && e.status) ? e.status : undefined;
        const message = (e && e.message) ? e.message : '';
        if (status === 400) friendly = 'Datos inválidos. Revisá tipo de entrega y cantidades';
        else if (status === 404) friendly = 'Recurso no encontrado. Probá crear una nueva orden';
        else if (status === 500) friendly = 'No pudimos procesar tu pedido. Intentá de nuevo';
        toast(friendly);
        // Diagnóstico: mostrar payload y respuesta
        console.error('Error al confirmar pedido:', { status, message, error: e });
        console.debug('Payload enviado a create/update order:', payload);
    }
    finally {
        if (confirmBtn) confirmBtn.disabled = false;
    }
}

function buildDeliveryTo() {
    const selectedId = deliverySel ? String(deliverySel.value) : '';
    const rawName = deliveryTypeNames[selectedId] || '';
    const isDelivery = /delivery/i.test(rawName);
    const addr = (deliveryAddressInput && deliveryAddressInput.value) ? deliveryAddressInput.value.trim() : '';
    
    // Solo para delivery: enviar la dirección
    if (isDelivery) {
        return addr || '';
    }
    
    // Para comer acá o para llevar: no enviar nada (solo notas del pedido)
    return '';
}

function toSpanishDeliveryLabel(name) {
    const n = String(name || '').toLowerCase();
    if (n.includes('take')) return 'Para llevar';
    if (n.includes('dine')) return 'Comer acá';
    if (n.includes('delivery')) return 'Delivery';
    return name || 'Entrega';
}

confirmBtn.addEventListener('click', confirmOrder);
window.addEventListener('DOMContentLoaded', () => { 
    loadDeliveryTypes(); 
    renderCart(); 
    // Asegurar que se ejecute updateDeliveryFields después de cargar los tipos de entrega
    setTimeout(() => updateDeliveryFields(), 100);
});
window.addEventListener('hashchange', () => { 
    if (location.hash === '#comanda') {
        renderCart(); 
        updateDeliveryFields();
    }
});
// Enlazar inputs agregados en index
window.addEventListener('DOMContentLoaded', () => {
    deliveryToInput = document.getElementById('deliveryToInput');
    deliveryToLabel = document.getElementById('deliveryToLabel');
    deliveryToWrap = document.getElementById('deliveryToWrap');
    orderNotesInput = document.getElementById('orderNotesInput');
    deliveryAddressWrap = document.getElementById('deliveryAddressWrap');
    deliveryAddressInput = document.getElementById('deliveryAddressInput');
    addressHistoryList = document.getElementById('addressHistoryList');
    
    console.log('Elements found:', {
        deliveryToInput: !!deliveryToInput,
        deliveryToLabel: !!deliveryToLabel,
        deliveryToWrap: !!deliveryToWrap,
        orderNotesInput: !!orderNotesInput,
        deliveryAddressWrap: !!deliveryAddressWrap,
        deliveryAddressInput: !!deliveryAddressInput,
        addressHistoryList: !!addressHistoryList
    });
    
    // Ejecutar updateDeliveryFields después de inicializar las variables
    updateDeliveryFields();
    if (deliverySel) {
        deliverySel.addEventListener('change', updateDeliveryFields);
        console.log('Event listener added to deliverySel');
    } else {
        console.log('deliverySel not found');
    }
    // Historial de direcciones
    renderAddressHistory();
    if (deliveryAddressInput) {
        deliveryAddressInput.addEventListener('change', () => saveAddressToHistory(deliveryAddressInput.value));
        deliveryAddressInput.addEventListener('blur', () => saveAddressToHistory(deliveryAddressInput.value));
    }
});


