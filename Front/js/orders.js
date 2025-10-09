import { api, baseURL } from './api.js';
import { createEl, toast } from './utils.js';

const myOrdersList = document.getElementById('myOrdersList');

async function loadMyOrders() {
    console.log('loadMyOrders called');
    const userId = localStorage.getItem('userId');
    console.log('userId:', userId);
    if (!userId) {
        console.log('No userId found, trying to load all orders');
        try {
            const all = await api.getAllOrders();
            console.log('All orders:', all);
            const orders = Array.isArray(all) ? all : [];
            renderOrders(orders);
        } catch (e) { 
            console.error('Error loading all orders:', e); 
        }
        return;
    }
    try {
        // fallback: if backend doesn't store userId, show latest orders to confirm creation
        let orders = await api.getOrdersByUser(userId);
        console.log('Orders by user:', orders);
        if ((!orders || !orders.length)) {
            const all = await api.getAllOrders();
            console.log('Fallback - all orders:', all);
            orders = Array.isArray(all) ? all : [];
        }
        renderOrders(orders);
    } catch (e) { 
        console.error('Error in loadMyOrders:', e); 
    }
}

function renderOrders(orders) {
    console.log('renderOrders called with:', orders);
    console.log('myOrdersList element:', myOrdersList);
    myOrdersList.innerHTML = '';
    // Limpiar el displayName del localStorage para evitar que se pegue en todas las órdenes
    try {
        localStorage.removeItem('displayName');
    } catch (_) {}
    
    if (!orders || orders.length === 0) {
        console.log('No orders to render');
        return;
    }
    
    for (const o of orders) {
        const row = createEl('div', 'row');
        const orderId = o.orderNumber ?? o.id ?? o.orderId ?? '—';
        const statusText = (o.status && (o.status.name || o.status.Name)) || o.statusName || o.status || o.statusId || 'Estado N/D';
        const deliveryType = (o.deliveryType && (o.deliveryType.name || o.deliveryType.Name)) || o.deliveryTypeName || o.deliveryType || 'Desconocido';
        const isDelivery = /delivery/i.test(deliveryType);
        const deliveryTo = (o.deliveryTo || o.DeliveryTo || (o.delivery && (o.delivery.to || o.delivery.To)) || '').trim();
        const who = isDelivery ? (deliveryTo || 'Sin dirección') : '';
        const when = o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.CreatedAt ? new Date(o.CreatedAt).toLocaleString() : (o.date || ''));
        const title = createEl('div', '', `Orden #${orderId} · ${who}${when ? ' · ' + when : ''}`);
        const itemsText = (o.items||o.Items||[]).map(i => {
            const dish = (i.dish && (i.dish.name || i.dish.Name)) || i.dishName || i.name || i.dishId || 'Plato';
            const qty = i.quantity ?? i.Quantity ?? 0;
            return `${dish} x${qty}`;
        }).join(', ');
        const items = createEl('div', '', itemsText || 'Sin items');
        const notesValue = o.notes || o.Notes || '';
        const notesLine = (notesValue ? createEl('div', '', `Notas: ${notesValue}`) : null);
        const addressLine = (isDelivery && deliveryTo ? createEl('div', '', `Dirección: ${deliveryTo}`) : null);
        const actions = createEl('div', 'row__actions');
        const statusChip = createEl('span', 'chip', String(statusText));
        const viewDetails = createEl('button', 'btn btn--primary', 'Ver detalles');
        const addMore = createEl('button', 'btn btn--ghost', 'Agregar platos');
        
        viewDetails.addEventListener('click', () => {
            showOrderDetails(orderId);
        });
        
        addMore.addEventListener('click', () => {
            // Limpiar cualquier orden activa previa para evitar conflictos
            localStorage.removeItem('activeOrderId');
            toast(`Creando nueva orden. Elegí platos del menú`);
            location.hash = '#menu';
        });
        actions.append(statusChip, viewDetails, addMore);
        row.append(title, items);
        if (addressLine) row.append(addressLine);
        if (notesLine) row.append(notesLine);
        row.append(actions);
        myOrdersList.appendChild(row);
    }
}

async function showOrderDetails(orderId) {
    try {
        console.log('Obteniendo detalles de la orden:', orderId);
        console.log('Base URL:', baseURL);
        
        // Verificar conectividad primero
        try {
            const testResponse = await fetch(`${baseURL}/api/v1/Status`);
            console.log('Backend connectivity test:', testResponse.status);
        } catch (connectError) {
            console.error('Backend not reachable:', connectError);
            toast('El backend no está disponible. Verificá que esté corriendo en http://localhost:7069');
            return;
        }
        
        const orderDetails = await api.getOrderById(parseInt(orderId, 10));
        console.log('Detalles obtenidos:', orderDetails);
        createOrderDetailsModal(orderDetails);
    } catch (e) {
        console.error('Error obteniendo detalles de la orden:', e);
        console.error('Status:', e.status);
        console.error('Message:', e.message);
        toast(`Error: ${e.message || 'No se pudieron cargar los detalles de la orden'}`);
    }
}

function createOrderDetailsModal(order) {
    // Log para debugging
    console.log('Estructura de datos de la orden:', order);
    console.log('OrderNumber:', order.OrderNumber);
    console.log('orderNumber:', order.orderNumber);
    console.log('OrderId:', order.OrderId);
    console.log('orderId:', order.orderId);
    console.log('id:', order.id);
    console.log('TotalAmount:', order.TotalAmount);
    console.log('Items:', order.Items);
    
    // Crear modal
    const modal = createEl('div', 'order-details-modal');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = createEl('div', 'order-details-content');
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    // Header del modal
    const header = createEl('div', 'order-details-header');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #f0f0f0;
    `;
    
    // Manejar diferentes estructuras de número de orden
    const orderNumber = order.OrderNumber || order.orderNumber || order.OrderId || order.orderId || order.id || orderId || 'N/A';
    const title = createEl('h2', '', `Orden #${orderNumber}`);
    title.style.cssText = `
        margin: 0;
        color: var(--color-primary);
        font-family: "Playfair Display", serif;
    `;
    
    const closeBtn = createEl('button', 'btn btn--ghost', '✕');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    header.append(title, closeBtn);
    
    // Información de la orden
    const orderInfo = createEl('div', 'order-info');
    orderInfo.style.cssText = `
        margin-bottom: 20px;
    `;
    
    // Manejar diferentes estructuras de datos del backend
    const status = order.Status?.Name || order.status?.name || order.statusName || order.status || 'Desconocido';
    const deliveryType = order.DeliveryType?.Name || order.deliveryType?.name || order.deliveryTypeName || order.deliveryType || 'Desconocido';
    const createdAt = order.CreatedAt ? new Date(order.CreatedAt).toLocaleString() : 
                     order.createdAt ? new Date(order.createdAt).toLocaleString() :
                     order.createDate ? new Date(order.createDate).toLocaleString() : 'No disponible';
    const updatedAt = order.UpdatedAt ? new Date(order.UpdatedAt).toLocaleString() : 
                     order.updatedAt ? new Date(order.updatedAt).toLocaleString() :
                     order.updateDate ? new Date(order.updateDate).toLocaleString() : 'No disponible';
    
    // Manejar el total con diferentes nombres de campo
    const totalAmount = order.TotalAmount || order.totalAmount || order.Price || order.price || order.total || 0;
    const formattedTotal = typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00';
    
    // Determinar si es delivery para mostrar la información correctamente
    const isDelivery = /delivery/i.test(deliveryType);
    const deliveryTo = order.DeliveryTo || order.deliveryTo || '';
    
    orderInfo.innerHTML = `
        <div style="display: grid; gap: 12px;">
            <div><strong>Estado:</strong> <span class="chip">${status}</span></div>
            <div><strong>Tipo de entrega:</strong> ${deliveryType}</div>
            ${isDelivery ? `<div><strong>Dirección:</strong> ${deliveryTo || 'No especificada'}</div>` : ''}
            <div><strong>Notas:</strong> ${order.Notes || order.notes || 'Sin notas'}</div>
            <div><strong>Total:</strong> <span style="color: var(--color-primary); font-weight: bold;">$${formattedTotal}</span></div>
            <div><strong>Creada:</strong> ${createdAt}</div>
            <div><strong>Actualizada:</strong> ${updatedAt}</div>
        </div>
    `;
    
    // Items de la orden
    const itemsSection = createEl('div', 'order-items');
    itemsSection.style.cssText = `
        margin-bottom: 20px;
    `;
    
    const itemsTitle = createEl('h3', '', 'Items del pedido');
    itemsTitle.style.cssText = `
        margin: 0 0 16px 0;
        color: var(--color-text);
        font-size: 1.1rem;
    `;
    
    const itemsList = createEl('div', 'items-list');
    itemsList.style.cssText = `
        display: grid;
        gap: 12px;
    `;
    
    // Manejar diferentes estructuras de items
    const items = order.Items || order.items || order.OrderItems || order.orderItems || [];
    
    if (items && items.length > 0) {
        for (const item of items) {
            const itemCard = createEl('div', 'item-card');
            itemCard.style.cssText = `
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                border: 1px solid #e9ecef;
            `;
            
            const itemName = createEl('div', 'item-name');
            itemName.style.cssText = `
                font-weight: bold;
                margin-bottom: 8px;
                color: var(--color-text);
            `;
            
            // Manejar diferentes estructuras de nombre del plato
            const dishName = item.Dish?.Name || item.dish?.name || item.dishName || item.name || item.DishName || 'Plato desconocido';
            itemName.textContent = dishName;
            
            const itemDetails = createEl('div', 'item-details');
            itemDetails.style.cssText = `
                display: grid;
                gap: 4px;
                font-size: 0.9rem;
                color: #666;
            `;
            
            // Manejar diferentes estructuras de datos del item
            const quantity = item.Quantity || item.quantity || 0;
            const itemStatus = item.Status?.Name || item.status?.name || item.statusName || item.status || 'Desconocido';
            const itemNotes = item.Notes || item.notes || '';
            
            itemDetails.innerHTML = `
                <div><strong>Cantidad:</strong> ${quantity}</div>
                <div><strong>Estado:</strong> <span class="chip">${itemStatus}</span></div>
                ${itemNotes ? `<div><strong>Notas:</strong> ${itemNotes}</div>` : ''}
            `;
            
            itemCard.append(itemName, itemDetails);
            itemsList.appendChild(itemCard);
        }
    } else {
        itemsList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No hay items en esta orden</div>';
    }
    
    itemsSection.append(itemsTitle, itemsList);
    
    // Botón de cerrar
    const closeButton = createEl('button', 'btn btn--primary', 'Cerrar');
    closeButton.style.cssText = `
        width: 100%;
        margin-top: 20px;
    `;
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modalContent.append(header, orderInfo, itemsSection, closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

window.addEventListener('hashchange', () => { 
    console.log('hashchange event, current hash:', location.hash);
    if (location.hash === '#mis-ordenes') {
        console.log('Loading orders due to hashchange');
        loadMyOrders(); 
    }
});
window.addEventListener('DOMContentLoaded', () => { 
    console.log('DOMContentLoaded, current hash:', location.hash);
    if (location.hash === '#mis-ordenes') {
        console.log('Loading orders due to DOMContentLoaded');
        loadMyOrders(); 
    }
});
// También actualizar cuando volvemos desde confirmación u otras vistas
document.addEventListener('visibilitychange', () => { 
    console.log('visibilitychange event, state:', document.visibilityState, 'hash:', location.hash);
    if (document.visibilityState === 'visible' && location.hash === '#mis-ordenes') {
        console.log('Loading orders due to visibilitychange');
        loadMyOrders(); 
    }
});


