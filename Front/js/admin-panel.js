import { api } from './api.js';
import { createEl, mapSearchParams } from './utils.js';

const panel = document.getElementById('ordersPanel');
const statusFilterSel = document.getElementById('panelStatusFilter');
let statuses = [];
let pollId;

async function loadStatuses() {
    statuses = await api.getStatuses().catch(() => []);
    if (statusFilterSel && statusFilterSel.children.length <= 1) {
        for (const s of statuses) {
            const opt = createEl('option'); opt.value = s.id; opt.textContent = s.name; statusFilterSel.appendChild(opt);
        }
    }
}

async function loadAllOrders() {
    try {
        const params = mapSearchParams({ panelStatus: statusFilterSel ? statusFilterSel.value : 'all' });
        const qs = params.toString();
        const orders = await api.getAllOrders(qs ? { status: params.get('status') } : {});
        renderPanel(orders);
    } catch (e) { console.error(e); }
}

function renderPanel(orders) {
    panel.innerHTML = '';
    const localName = (typeof localStorage !== 'undefined') ? (localStorage.getItem('displayName') || '') : '';
    for (const o of orders) {
        const row = createEl('div', 'row');
        const orderId = o.orderNumber ?? o.id ?? o.orderId ?? '—';
        const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.CreatedAt ? new Date(o.CreatedAt).toLocaleString() : '');
        // Mostrar nombre en encabezado (si el back no lo envía, usar displayName local)
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
        for (const s of statuses) {
            const opt = createEl('option'); opt.value = s.id; opt.textContent = s.name; if (s.id === statusId) opt.selected = true; sel.appendChild(opt);
        }
        function updateChipName(name) {
            const norm = String(name || '').toLowerCase();
            chip.className = 'chip';
            if (norm.includes('pendiente')) chip.classList.add('chip--status-pendiente');
            else if (norm.includes('prepar') || norm.includes('en prepar')) chip.classList.add('chip--status-en-preparacion');
            else if (norm.includes('listo')) chip.classList.add('chip--status-listo');
            else if (norm.includes('entregado')) chip.classList.add('chip--status-entregado');
            chip.textContent = name || `Estado ${statusId}`;
        }
        const currentStatusName = (statuses.find(s => s.id === statusId) || {}).name;
        updateChipName(currentStatusName);
        async function applyStatusChange() {
            const val = parseInt(sel.value, 10);
            changeBtn.disabled = true; confirmBtn.disabled = true; cancelBtn.disabled = true;
            try {
                // Intentar actualizar estado de la orden
                try {
                    await api.updateOrderStatus(orderId, val);
                } catch {
                    // Fallback: actualizar items uno por uno
                    const items = (o.items || o.Items || []);
                    for (const it of items) {
                        const itemId = it.id ?? it.Id;
                        if (itemId != null) await api.updateOrderItemStatus(orderId, itemId, { statusId: val });
                    }
                }
                const newName = (statuses.find(s => s.id === val) || {}).name;
                updateChipName(newName);
                controls.style.display = 'none';
                changeBtn.style.display = '';
            } catch (e) {
                console.error('No se pudo cambiar el estado', e);
            } finally {
                changeBtn.disabled = false; confirmBtn.disabled = false; cancelBtn.disabled = false;
            }
        }
        changeBtn.addEventListener('click', () => { controls.style.display = ''; changeBtn.style.display = 'none'; });
        cancelBtn.addEventListener('click', () => { controls.style.display = 'none'; changeBtn.style.display = ''; });
        confirmBtn.addEventListener('click', applyStatusChange);
        controls.append(sel, confirmBtn, cancelBtn);
        statusWrap.append(chip);
        // dejar espacio entre chip y botón
        const spacer = createEl('span', ''); spacer.style.flex = '1';
        statusWrap.append(spacer, changeBtn, controls);
        row.append(title, items);
        if (addrLine) row.append(addrLine);
        row.append(statusWrap);
        panel.appendChild(row);
    }
}

function startPolling() {
    clearInterval(pollId);
    pollId = setInterval(loadAllOrders, 7000);
}

window.addEventListener('hashchange', async () => { if (location.hash === '#panel-ordenes') { await loadStatuses(); await loadAllOrders(); startPolling(); } else { clearInterval(pollId); } });
window.addEventListener('DOMContentLoaded', async () => { if (location.hash === '#panel-ordenes') { await loadStatuses(); await loadAllOrders(); startPolling(); } });
if (statusFilterSel) statusFilterSel.addEventListener('change', loadAllOrders);


