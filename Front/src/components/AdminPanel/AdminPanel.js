/**
 * Admin Panel Component
 * Maneja el panel de administración para el personal del restaurante
 */
import { api } from '../../services/api.js';
import { createEl } from '../../utils/utils.js';

export class AdminPanel {
    constructor() {
        this.panel = document.getElementById('ordersPanel');
        this.statusFilterSel = document.getElementById('panelStatusFilter');
        this.statuses = [];
        this.pollId = null;
        
        this.init();
    }

    async init() {
        await this.loadStatuses();
        this.setupEventListeners();
        await this.loadAllOrders();
    }

    setupEventListeners() {
        window.addEventListener('hashchange', async () => { 
            if (location.hash === '#panel-ordenes') { 
                await this.loadStatuses(); 
                await this.loadAllOrders(); 
                this.startPolling(); 
            } else { 
                this.clearPolling(); 
            } 
        });
        
        window.addEventListener('DOMContentLoaded', async () => { 
            if (location.hash === '#panel-ordenes') { 
                await this.loadStatuses(); 
                await this.loadAllOrders(); 
                this.startPolling(); 
            } 
        });
        
        if (this.statusFilterSel) {
            this.statusFilterSel.addEventListener('change', () => this.loadAllOrders());
        }
    }

    async loadStatuses() {
        try {
            this.statuses = await api.getAllStatuses();
            if (this.statusFilterSel && this.statusFilterSel.children.length <= 1) {
                for (const s of this.statuses) {
                    const opt = createEl('option');
                    opt.value = s.id;
                    opt.textContent = s.name;
                    this.statusFilterSel.appendChild(opt);
                }
            }
        } catch (e) {
            console.error('Error loading statuses:', e);
        }
    }

    async loadAllOrders() {
        try {
            const params = new URLSearchParams();
            if (this.statusFilterSel && this.statusFilterSel.value !== 'all') {
                params.append('status', this.statusFilterSel.value);
            }
            
            const qs = params.toString();
            const orders = await api.getAllOrders(qs ? { status: params.get('status') } : {});
            this.renderPanel(orders);
        } catch (e) {
            console.error('Error loading orders:', e);
        }
    }

    renderPanel(orders) {
        this.panel.innerHTML = '';
        const localName = (typeof localStorage !== 'undefined') ? (localStorage.getItem('displayName') || '') : '';
        
        for (const o of orders) {
            const row = createEl('div', 'row');
            const orderId = o.orderNumber ?? o.id ?? o.orderId ?? '—';
            const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : 
                          (o.CreatedAt ? new Date(o.CreatedAt).toLocaleString() : '');
            
            const who = (o.to || o.customer || localName || '').trim();
            const address = ((o.delivery && (o.delivery.to || o.delivery.To)) || o.deliveryTo || o.DeliveryTo || '').trim();
            const title = createEl('div', '', `#${orderId}${who ? ' · ' + who : ''}${created ? ' · ' + created : ''}`);
            
            const itemsText = (o.items||o.Items||[]).map(i => {
                const dish = (i.dish && (i.dish.name || i.dish.Name)) || i.dishName || i.name || i.dishId || 'Plato';
                const qty = i.quantity ?? i.Quantity ?? 0;
                return `${dish} x${qty}`;
            }).join(', ');
            const items = createEl('div', '', itemsText || 'Sin items');
            const addrLine = address ? createEl('div', '', `Dirección: ${address}`) : null;
            
            const statusWrap = createEl('div', 'row__actions');
            const chip = createEl('span', 'chip', '');
            const changeBtn = createEl('button', 'btn btn--primary', 'Cambiar estado');
            const controls = createEl('span', '');
            controls.style.display = 'none';
            
            const sel = createEl('select');
            const confirmBtn = createEl('button', 'btn btn--primary', 'Confirmar');
            const cancelBtn = createEl('button', 'btn btn--ghost', 'Cancelar');
            controls.style.gap = '8px';
            controls.style.marginLeft = '12px';
            
            const statusId = o.statusId ?? (o.status && o.status.id);
            for (const s of this.statuses) {
                const opt = createEl('option');
                opt.value = s.id;
                opt.textContent = s.name;
                if (s.id === statusId) opt.selected = true;
                sel.appendChild(opt);
            }
            
            const updateChipName = (name) => {
                const norm = String(name || '').toLowerCase();
                chip.className = 'chip';
                if (norm.includes('pendiente')) chip.classList.add('chip--status-pendiente');
                else if (norm.includes('prepar') || norm.includes('en prepar')) chip.classList.add('chip--status-en-preparacion');
                else if (norm.includes('listo')) chip.classList.add('chip--status-listo');
                else if (norm.includes('entregado')) chip.classList.add('chip--status-entregado');
                chip.textContent = name || `Estado ${statusId}`;
            };
            
            const currentStatusName = (this.statuses.find(s => s.id === statusId) || {}).name;
            updateChipName(currentStatusName);
            
            const applyStatusChange = async () => {
                const val = parseInt(sel.value, 10);
                changeBtn.disabled = true;
                confirmBtn.disabled = true;
                cancelBtn.disabled = true;
                
                try {
                    try {
                        await api.updateOrderStatus(orderId, val);
                    } catch {
                        // Fallback: actualizar items uno por uno
                        const items = (o.items || o.Items || []);
                        for (const it of items) {
                            const itemId = it.id ?? it.Id;
                            if (itemId != null) {
                                await api.updateOrderItemStatus(orderId, itemId, { statusId: val });
                            }
                        }
                    }
                    const newName = (this.statuses.find(s => s.id === val) || {}).name;
                    updateChipName(newName);
                    controls.style.display = 'none';
                    changeBtn.style.display = '';
                } catch (e) {
                    console.error('No se pudo cambiar el estado', e);
                } finally {
                    changeBtn.disabled = false;
                    confirmBtn.disabled = false;
                    cancelBtn.disabled = false;
                }
            };
            
            changeBtn.addEventListener('click', () => { 
                controls.style.display = ''; 
                changeBtn.style.display = 'none'; 
            });
            cancelBtn.addEventListener('click', () => { 
                controls.style.display = 'none'; 
                changeBtn.style.display = ''; 
            });
            confirmBtn.addEventListener('click', applyStatusChange);
            
            controls.append(sel, confirmBtn, cancelBtn);
            statusWrap.append(chip);
            
            const spacer = createEl('span', '');
            spacer.style.flex = '1';
            statusWrap.append(spacer, changeBtn, controls);
            
            row.append(title, items);
            if (addrLine) row.append(addrLine);
            row.append(statusWrap);
            this.panel.appendChild(row);
        }
    }

    startPolling() {
        this.clearPolling();
        this.pollId = setInterval(() => this.loadAllOrders(), 7000);
    }

    clearPolling() {
        if (this.pollId) {
            clearInterval(this.pollId);
            this.pollId = null;
        }
    }
}