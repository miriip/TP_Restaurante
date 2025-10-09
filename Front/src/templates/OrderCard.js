/**
 * Order Card Template
 * Template para las tarjetas de órdenes
 */
export default function orderCardTemplate(order) {
    const orderId = order.orderNumber ?? order.id ?? order.orderId ?? '—';
    const statusText = (order.status && (order.status.name || order.status.Name)) || 
                      order.statusName || order.status || 'Estado N/D';
    const deliveryType = (order.deliveryType && (order.deliveryType.name || order.deliveryType.Name)) || 
                         order.deliveryTypeName || order.deliveryType || 'Desconocido';
    const isDelivery = /delivery/i.test(deliveryType);
    const deliveryTo = (order.deliveryTo || order.DeliveryTo || '').trim();
    const who = isDelivery ? (deliveryTo || 'Sin dirección') : '';
    const when = order.createdAt ? new Date(order.createdAt).toLocaleString() : 
                 (order.CreatedAt ? new Date(order.CreatedAt).toLocaleString() : 
                 (order.date || ''));
    
    const itemsText = (order.items || order.Items || []).map(i => {
        const dish = (i.dish && (i.dish.name || i.dish.Name)) || 
                    i.dishName || i.name || i.dishId || 'Plato';
        const qty = i.quantity ?? i.Quantity ?? 0;
        return `${dish} x${qty}`;
    }).join(', ');

    return `
        <div class="row" data-order-id="${orderId}">
            <div class="row__content">
                <div class="row__title">Orden #${orderId} · ${who}${when ? ' · ' + when : ''}</div>
                <div class="row__subtitle">${itemsText || 'Sin items'}</div>
                ${isDelivery && deliveryTo ? `<div class="row__address">Dirección: ${deliveryTo}</div>` : ''}
                ${order.notes || order.Notes ? `<div class="row__notes">Notas: ${order.notes || order.Notes}</div>` : ''}
            </div>
            <div class="row__actions">
                <span class="chip">${statusText}</span>
                <button class="btn btn--primary view-details-btn" data-order-id="${orderId}">
                    Ver detalles
                </button>
                <button class="btn btn--ghost add-more-btn" data-order-id="${orderId}">
                    Agregar platos
                </button>
            </div>
        </div>
    `;
}
