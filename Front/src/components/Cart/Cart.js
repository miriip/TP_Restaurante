/**
 * Cart Component
 * Maneja la lógica del carrito de compras
 */
import { api } from '../../services/api.js';
import { createEl, formatPrice, toast, getAddressHistory, saveAddressToHistory } from '../../utils/utils.js';

export class Cart {
    constructor() {
        this.list = document.getElementById('cartItems');
        this.totalEl = document.getElementById('cartTotal');
        this.deliverySel = document.getElementById('deliveryTypeSelect');
        this.confirmBtn = document.getElementById('confirmOrderBtn');
        this.deliveryToInput = document.getElementById('deliveryToInput');
        this.deliveryToLabel = document.getElementById('deliveryToLabel');
        this.deliveryToWrap = document.getElementById('deliveryToWrap');
        this.orderNotesInput = document.getElementById('orderNotesInput');
        this.deliveryAddressWrap = document.getElementById('deliveryAddressWrap');
        this.deliveryAddressInput = document.getElementById('deliveryAddressInput');
        this.addressHistoryList = document.getElementById('addressHistoryList');
        
        this.deliveryTypeNames = {};
        this.init();
    }

    async init() {
        await this.loadDeliveryTypes();
        this.setupEventListeners();
        this.updateDeliveryFields();
        this.renderCart();
    }

    async loadDeliveryTypes() {
        try {
            const types = await api.getAllDeliveryTypes();
            this.deliverySel.innerHTML = '';
            for (const t of types) {
                this.deliveryTypeNames[String(t.id)] = String(t.name || '');
                const opt = createEl('option');
                opt.value = t.id;
                opt.textContent = this.toSpanishDeliveryLabel(t.name);
                this.deliverySel.appendChild(opt);
            }
            
            // Seleccionar "Comer acá" por defecto
            if (this.deliverySel.options.length > 0) {
                let defaultIndex = 0;
                for (let i = 0; i < this.deliverySel.options.length; i++) {
                    const optionText = this.deliverySel.options[i].textContent.toLowerCase();
                    if (optionText.includes('comer') || optionText.includes('mesa') || optionText.includes('local')) {
                        defaultIndex = i;
                        break;
                    }
                }
                this.deliverySel.selectedIndex = defaultIndex;
            }
        } catch (e) {
            console.error('Error loading delivery types:', e);
        }
    }

    setupEventListeners() {
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => this.confirmOrder());
        }
        
        if (this.deliverySel) {
            this.deliverySel.addEventListener('change', () => this.updateDeliveryFields());
        }
        
        if (this.deliveryAddressInput) {
            this.deliveryAddressInput.addEventListener('change', () => 
                saveAddressToHistory(this.deliveryAddressInput.value));
            this.deliveryAddressInput.addEventListener('blur', () => 
                saveAddressToHistory(this.deliveryAddressInput.value));
        }
    }

    updateDeliveryFields() {
        const selectedId = this.deliverySel ? String(this.deliverySel.value) : '';
        const rawName = this.deliveryTypeNames[selectedId] || '';
        const isDelivery = /delivery/i.test(rawName);
        const isTakeAway = /take/i.test(rawName);
        const isDineIn = /dine/i.test(rawName) || /comer|mesa|local/i.test(rawName);
        
        // Ocultar campo "Para" para todos los tipos
        if (this.deliveryToWrap) {
            this.deliveryToWrap.classList.add('hidden');
        }
        
        // Campo de entrada visible para Delivery, Para llevar y En mesa
        if (this.deliveryAddressWrap) {
            const shouldShow = isDelivery || isTakeAway || isDineIn;
            this.deliveryAddressWrap.classList.toggle('hidden', !shouldShow);
        }

        // Ajustar etiqueta y placeholder según tipo
        if (this.deliveryToLabel) {
            if (isDelivery) this.deliveryToLabel.textContent = 'Dirección';
            else if (isTakeAway) this.deliveryToLabel.textContent = 'Nombre de quien retira';
            else if (isDineIn) this.deliveryToLabel.textContent = 'Mesa';
            else this.deliveryToLabel.textContent = 'Para';
        }

        if (this.deliveryAddressInput) {
            if (isDelivery) this.deliveryAddressInput.placeholder = 'Ej: Av. Corrientes 1234, Piso 5B';
            else if (isTakeAway) this.deliveryAddressInput.placeholder = 'Ej: Juan Pérez';
            else if (isDineIn) this.deliveryAddressInput.placeholder = 'Ej: Mesa 12';
            else this.deliveryAddressInput.placeholder = '';
        }
    }

    renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
        this.list.innerHTML = '';
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
            
            plus.addEventListener('click', () => this.updateQty(item, 1));
            minus.addEventListener('click', () => this.updateQty(item, -1));
            rm.addEventListener('click', () => this.removeItem(item));
            
            actions.append(plus, minus, rm);
            row.append(title);
            if (note) row.append(note);
            row.append(sub, actions);
            this.list.appendChild(row);
            total += item.price * item.quantity;
        }
        
        this.totalEl.textContent = formatPrice(total);
    }

    updateQty(item, delta) {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
        const idx = cart.items.findIndex(i => i.dishId === item.dishId && (i.note||'') === (item.note||''));
        if (idx < 0) return;
        
        cart.items[idx].quantity = Math.max(1, Math.min(10, cart.items[idx].quantity + delta));
        if (cart.items[idx].quantity === 0) cart.items.splice(idx, 1);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.renderCart();
    }

    removeItem(item) {
        const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
        const idx = cart.items.findIndex(i => i.dishId === item.dishId && (i.note||'') === (item.note||''));
        if (idx >= 0) cart.items.splice(idx, 1);
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.renderCart();
    }

    async confirmOrder() {
        if (this.confirmBtn) this.confirmBtn.disabled = true;
        
        const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}') || { items: [] };
        if (!cart.items.length) {
            toast('La comanda está vacía');
            if (this.confirmBtn) this.confirmBtn.disabled = false;
            return;
        }
        
        const deliveryTypeId = parseInt(this.deliverySel.value, 10);
        if (!this.deliverySel.value || Number.isNaN(deliveryTypeId)) {
            toast('Elegí un tipo de entrega');
            if (this.confirmBtn) this.confirmBtn.disabled = false;
            return;
        }
        
        // Validación de IDs de platos
        const invalidIds = cart.items.filter(i => !/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/i.test(String(i.dishId||'')));
        if (invalidIds.length) {
            toast('Hay platos con ID inválido, vuelve a agregarlos desde el menú');
            return;
        }
        
        const toValue = this.buildDeliveryTo();
        // Validaciones de Delivery según tipo
        const typeName = (this.deliveryTypeNames[String(deliveryTypeId)] || '').toLowerCase();
        const isDelivery = /delivery/.test(typeName);
        const isTakeAway = /take/.test(typeName);
        const isDineIn = /dine/.test(typeName) || /comer|mesa|local/.test(typeName);

        if ((isDelivery || isTakeAway || isDineIn) && !toValue) {
            const msg = isDelivery ? 'Ingresá una dirección de entrega' :
                        isTakeAway ? 'Ingresá el nombre de quien retira' :
                        'Ingresá el número de mesa';
            toast(msg);
            if (this.confirmBtn) this.confirmBtn.disabled = false;
            return;
        }

        const payload = {
            items: cart.items.map(i => ({ id: i.dishId, quantity: i.quantity, notes: i.note || '' })),
            delivery: { id: deliveryTypeId, to: toValue },
            notes: (this.orderNotesInput && this.orderNotesInput.value) ? this.orderNotesInput.value : ''
        };
        
        try {
            await api.createOrder(payload);
            localStorage.setItem('cart', JSON.stringify({ items: [] }));
            localStorage.removeItem('activeOrderId');
            this.renderCart();
            toast('Pedido enviado');
            location.hash = '#mis-ordenes';
        } catch (e) {
            const message = (e && e.message) ? e.message : '';
            let friendly = 'No se pudo enviar el pedido';
            const status = (e && e.status) ? e.status : undefined;
            if (status === 400) friendly = message || 'Datos inválidos. Revisá tipo de entrega y cantidades';
            else if (status === 404) friendly = message || 'Recurso no encontrado. Probá crear una nueva orden';
            else if (status === 409) friendly = message || 'Conflicto con los datos enviados';
            else if (status === 500) friendly = 'No pudimos procesar tu pedido. Intentá de nuevo';
            toast(friendly);
            console.error('Error al confirmar pedido:', e);
        } finally {
            if (this.confirmBtn) this.confirmBtn.disabled = false;
        }
    }

    buildDeliveryTo() {
        const selectedId = this.deliverySel ? String(this.deliverySel.value) : '';
        const rawName = this.deliveryTypeNames[selectedId] || '';
        const isDelivery = /delivery/i.test(rawName);
        const isTakeAway = /take/i.test(rawName);
        const isDineIn = /dine/i.test(rawName) || /comer|mesa|local/i.test(rawName);
        const addr = (this.deliveryAddressInput && this.deliveryAddressInput.value) ? this.deliveryAddressInput.value.trim() : '';
        if (isDelivery) return addr;
        if (isTakeAway || isDineIn) return addr; // reutilizamos un único input visual; semántica cambia por label
        return '';
    }

    toSpanishDeliveryLabel(name) {
        const n = String(name || '').toLowerCase();
        if (n.includes('take')) return 'Para llevar';
        if (n.includes('dine')) return 'Comer acá';
        if (n.includes('delivery')) return 'Delivery';
        return name || 'Entrega';
    }
}