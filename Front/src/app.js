/**
 * Main Application Entry Point - Versión Simplificada
 * Inicializa la aplicación sin ES modules complejos
 */

console.log('🚀 Iniciando aplicación...');

// Función para mostrar vista
function showView(viewId) {
    console.log('Mostrando vista:', viewId);
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        console.log('✅ Vista mostrada:', viewId);
    } else {
        console.error('❌ No se encontró la vista:', viewId);
    }
}

// Función para cargar menú
async function loadMenu() {
    console.log('🍽️ Cargando menú...');
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) {
        console.error('No se encontró dishesGrid');
        return;
    }
    
    try {
        const response = await fetch('https://localhost:7069/api/v1/Dish', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const dishes = await response.json();
            console.log('✅ Platos cargados:', dishes.length);
            renderDishes(dishes);
        } else {
            console.error('❌ Error HTTP:', response.status);
            dishesGrid.innerHTML = '<div class="error">Error cargando el menú</div>';
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        dishesGrid.innerHTML = '<div class="error">No se pudo conectar con el servidor</div>';
    }
}

// Función para renderizar platos
function renderDishes(dishes) {
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) return;

    dishesGrid.innerHTML = '';

    // Si no hay platos, mostrar mensaje
    if (dishes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-dishes';
        emptyMessage.innerHTML = `
            <div class="empty-dishes__content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12h8"></path>
                </svg>
                <h3>No hay platos disponibles</h3>
                <p>No se encontraron platos en esta categoría.</p>
            </div>
        `;
        dishesGrid.appendChild(emptyMessage);
        return;
    }

    dishes.forEach(dish => {
        const card = document.createElement('article');
        card.className = 'card';

        card.innerHTML = `
            <img src="${dish.image || './assets/logo.svg'}"
                 alt="${dish.name}"
                 class="card__media"
                 onerror="this.src='./assets/logo.svg'" />
            <div class="card__body">
                <h3 class="card__title card__title--center">${dish.name}</h3>
                <div class="card__meta">
                    <span class="price">$${dish.price}</span>
                </div>
                <div class="row__actions">
                    <button class="btn btn--primary btn--pill" onclick="viewDish('${dish.id}')">
                        Ver detalle
                    </button>
                    <button class="btn btn--ghost btn--pill" onclick="addToCart('${dish.id}', '${dish.name}', ${dish.price})">
                        Agregar
                    </button>
                </div>
            </div>
        `;

        dishesGrid.appendChild(card);
    });
}

// Funciones globales
window.viewDish = function(dishId) {
    console.log('🔍 Ver detalle del plato:', dishId);
    console.log('📋 Platos disponibles:', allDishes.length);
    
    // Buscar el plato en la lista
    const dish = allDishes.find(d => d.id === dishId);
    console.log('🍽️ Plato encontrado:', dish);
    
    if (!dish) {
        console.error('❌ Plato no encontrado');
        showNotification('Plato no encontrado', 'error');
        return;
    }
    
    // Mostrar modal con detalles del plato
    console.log('📱 Mostrando modal...');
    showDishDetailsModal(dish);
};

// Función para mostrar modal de detalles del plato
window.showDishDetailsModal = function(dish) {
    console.log('🔧 Creando modal para:', dish.name);
    
    // Remover modal existente si hay uno
    const existingModal = document.getElementById('dishDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'dishDetailsModal';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closeDishDetailsModal()"></div>
        <div class="modal__content">
            <div class="modal__header">
                <h2>${dish.name}</h2>
                <button class="modal__close" onclick="closeDishDetailsModal()">&times;</button>
            </div>
            <div class="modal__body">
                <div class="dish-image">
                    <img src="${dish.image || './assets/logo.svg'}" 
                         alt="${dish.name}" 
                         onerror="this.src='./assets/logo.svg'">
                </div>
                <div class="dish-info">
                    <div class="dish-price">$${dish.price}</div>
                    ${dish.description && dish.description !== 'string' ? `<p class="dish-description">${dish.description}</p>` : ''}
                    ${dish.category ? `<p class="dish-category">Categoría: ${dish.category.name}</p>` : ''}
                </div>
                ${currentRole === 'personal' ? `
                    <div class="dish-admin-actions">
                        <h3>Acciones de Personal</h3>
                        <div class="admin-form">
                            <label for="dishDescription">Descripción del plato:</label>
                            <textarea id="dishDescription" placeholder="Agregar descripción del plato...">${dish.description && dish.description !== 'string' ? dish.description : ''}</textarea>
                            <button onclick="updateDishDescription('${dish.id}')" class="btn btn--primary">
                                Guardar descripción
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Modal de detalles del plato creado y mostrado');
};

// Función para cerrar modal de detalles del plato
window.closeDishDetailsModal = function() {
    const modal = document.getElementById('dishDetailsModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
};

// Función para actualizar descripción del plato (solo personal)
window.updateDishDescription = async function(dishId) {
    const description = document.getElementById('dishDescription').value;
    console.log(`Actualizando descripción del plato ${dishId}:`, description);
    
    try {
        // Buscar el plato actual para obtener todos los datos
        const dish = allDishes.find(d => d.id === dishId);
        if (!dish) {
            showNotification('Plato no encontrado', 'error');
            return;
        }
        
        // Preparar datos para actualización
        const updateData = {
            name: dish.name,
            description: description,
            price: dish.price,
            category: dish.category?.id || 1,
            image: dish.image || null,
            isActive: dish.isAvailable !== false
        };
        
        console.log('📤 Enviando datos de actualización:', updateData);
        
        const response = await fetch(`https://localhost:7069/api/v1/Dish/${dishId}`, {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            const updatedDish = await response.json();
            console.log('✅ Plato actualizado:', updatedDish);
            
            // Actualizar el plato en la lista local
            const dishIndex = allDishes.findIndex(d => d.id === dishId);
            if (dishIndex !== -1) {
                allDishes[dishIndex].description = updatedDish.description;
            }
            
            showNotification('Descripción actualizada exitosamente', 'success');
            
            // Cerrar el modal
            closeDishDetailsModal();
        } else {
            const errorData = await response.json();
            console.error('❌ Error del backend:', errorData);
            showNotification(`Error al actualizar: ${errorData.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    }
};

// Función para validar transiciones de estado
function isValidStatusTransition(currentStatus, newStatus) {
    // Estados: 1=Pendiente, 2=En preparación, 3=Listo, 4=Entregado, 5=Cancelado
    
    // Reglas de transición según el backend:
    // - De "Entregado" (4) solo se puede mantener "Entregado" (4)
    // - De "Cancelado" (5) solo se puede mantener "Cancelado" (5)
    // - Flujo normal: Pendiente → En preparación → Listo → Entregado
    // - Se puede cancelar en cualquier momento (excepto si ya está entregado)
    
    if (currentStatus === 4 && newStatus !== 4) {
        return false; // De "Entregado" solo se puede mantener "Entregado"
    }
    
    if (currentStatus === 5 && newStatus !== 5) {
        return false; // De "Cancelado" solo se puede mantener "Cancelado"
    }
    
    // Flujo normal permitido
    if (newStatus === 5) {
        return true; // Se puede cancelar en cualquier momento (excepto entregado)
    }
    
    // Transiciones progresivas permitidas
    const allowedTransitions = {
        1: [2, 5], // Pendiente → En preparación o Cancelado
        2: [3, 5], // En preparación → Listo o Cancelado
        3: [4, 5], // Listo → Entregado o Cancelado
        4: [4],    // Entregado → solo Entregado
        5: [5]     // Cancelado → solo Cancelado
    };
    
    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
}

// Función para mostrar modal de confirmación estético
window.showConfirmModal = function(title, message, confirmText, cancelText) {
    console.log('🔔 Mostrando modal de confirmación:', { title, message, confirmText, cancelText });
    
    return new Promise((resolve) => {
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'confirmModal';
        console.log('🔔 Modal creado con ID:', modal.id);
        
        modal.innerHTML = `
            <div class="modal__overlay" onclick="closeConfirmModal(false)"></div>
            <div class="modal__content confirm-modal">
                <div class="modal__header">
                    <h2>${title}</h2>
                    <button class="modal__close" onclick="closeConfirmModal(false)">&times;</button>
                </div>
                <div class="modal__body">
                    <p class="confirm-message">${message}</p>
                </div>
                <div class="modal__footer">
                    <button class="btn btn--ghost" onclick="closeConfirmModal(false)">${cancelText}</button>
                    <button class="btn btn--primary" onclick="closeConfirmModal(true)">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        console.log('🔔 Modal agregado al DOM');
        
        // Forzar el display del modal
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        console.log('🔔 Modal configurado para mostrar');
        
        // Pequeño delay para asegurar que se renderice
        setTimeout(() => {
            console.log('🔔 Modal debería estar visible ahora');
        }, 100);
        
        // Hacer función global para cerrar
        window.closeConfirmModal = function(result) {
            console.log('🔔 Cerrando modal con resultado:', result);
            modal.remove();
            document.body.style.overflow = 'auto';
            resolve(result);
        };
    });
}

window.addToCart = function(id, name, price) {
    console.log('Agregar al carrito:', { id, name, price });
    
    // Buscar el plato en la lista para verificar si está activo
    const dish = allDishes.find(d => d.id === id);
    if (!dish) {
        showNotification('Plato no encontrado', 'error');
        return;
    }
    
    // Validar que el plato esté disponible (según el backend, no se pueden agregar platos inactivos)
    if (dish.isAvailable === false) {
        showNotification('Este plato no está disponible actualmente', 'error');
        return;
    }
    
    // Obtener carrito del localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    
    // Buscar si el plato ya existe
    const existingItem = cart.items.find(item => item.dishId === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            dishId: id,
            name: name,
            price: price,
            quantity: 1,
            notes: ''
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mostrar notificación personalizada
    showNotification(`${name} agregado al carrito!`, 'success');
    
    // Actualizar contador si existe
    updateCartCounter();
};

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Actualizar contador en la navegación si existe
    const cartLink = document.querySelector('a[href="#comanda"]');
    if (cartLink) {
        cartLink.textContent = `Mi comanda (${totalItems})`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM cargado');

    // Navegación
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('href').substring(1);
            showView(viewId);
            
            if (viewId === 'menu') {
                loadMenu();
            } else if (viewId === 'comanda') {
                loadCart();
            } else if (viewId === 'mis-ordenes') {
                loadOrders();
            } else if (viewId === 'panel-ordenes') {
                loadAdminPanel();
            }
        });
    });
    
    // Botón de entrada
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
        console.log('✅ Botón "Ingresar al Menú" encontrado');
        enterBtn.addEventListener('click', () => {
            console.log('🖱️ Botón "Ingresar al Menú" clickeado');
            showView('menu');
            loadMenu();
        });
        
        // Event listener alternativo por si acaso
        enterBtn.onclick = function() {
            console.log('🖱️ Botón "Ingresar al Menú" clickeado (onclick)');
            showView('menu');
            loadMenu();
        };
    } else {
        console.error('❌ No se encontró el botón "Ingresar al Menú"');
    }
    
    console.log('✅ Aplicación inicializada');
    
    // Inicializar filtros
    initializeFilters();
    
    // Inicializar toggle de rol
    initializeRoleToggle();
});

// Hacer funciones globales
window.showView = showView;
window.loadMenu = loadMenu;
window.filterByCategory = filterByCategory;

// Función global para el botón (fallback adicional)
window.enterMenu = function() {
    console.log('🖱️ Función global enterMenu llamada');
    showView('menu');
    loadMenu();
};

// Sistema de notificaciones personalizadas
function showNotification(message, type = 'info') {
    // Crear contenedor si no existe
    let container = document.getElementById('notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; margin-left: 10px;">×</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Función para cargar el carrito
async function loadCart() {
    console.log('🛒 Cargando carrito...');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.items.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        cartTotal.textContent = '$0';
        return;
    }
    
    cart.items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'row';
        
        row.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} x ${item.quantity}</p>
                <input type="text" placeholder="Notas especiales..." 
                       value="${item.notes || ''}" 
                       onchange="updateItemNotes(${index}, this.value)"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;">
            </div>
            <div class="item-controls">
                <button onclick="updateQuantity(${index}, -1)" class="btn-quantity">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button onclick="updateQuantity(${index}, 1)" class="btn-quantity">+</button>
                <button onclick="removeItem(${index})" class="btn-remove">🗑️</button>
            </div>
        `;
        
        cartItems.appendChild(row);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    // Agregar opciones de entrega si no existen
    addDeliveryOptions();
}

// Función para agregar opciones de entrega
function addDeliveryOptions() {
    const cartSection = document.getElementById('comanda');
    if (!cartSection) return;
    
    // Verificar si ya existen las opciones
    if (document.getElementById('deliveryOptions')) return;
    
    const deliveryDiv = document.createElement('div');
    deliveryDiv.id = 'deliveryOptions';
    deliveryDiv.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    `;
    
    deliveryDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #8B0000; font-size: 18px;">Forma de Entrega</h3>
        <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="deliveryType" value="mesa" checked>
                <span>En mesa</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="deliveryType" value="para_llevar">
                <span>Para llevar</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="radio" name="deliveryType" value="delivery">
                <span>Delivery</span>
            </label>
        </div>
        <div id="deliveryAddress" style="display: none;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Dirección de entrega:</label>
            <input type="text" id="deliveryAddressInput" placeholder="Ingresa tu dirección completa..." 
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-top: 20px;">
            <button onclick="confirmOrder()" class="btn-confirm-order">
                Confirmar Pedido
            </button>
        </div>
    `;
    
    // Agregar event listeners para mostrar/ocultar dirección
    deliveryDiv.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const addressDiv = document.getElementById('deliveryAddress');
            if (this.value === 'delivery') {
                addressDiv.style.display = 'block';
            } else {
                addressDiv.style.display = 'none';
            }
        });
    });
    
    cartSection.appendChild(deliveryDiv);
}

// Función para actualizar notas del item
window.updateItemNotes = function(index, notes) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items[index].notes = notes;
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Función para confirmar pedido
window.confirmOrder = async function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const deliveryAddress = document.getElementById('deliveryAddressInput')?.value;
    
    if (cart.items.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    if (deliveryType === 'delivery' && !deliveryAddress) {
        showNotification('Por favor ingresa la dirección de entrega', 'error');
        return;
    }
    
    // Mapear tipos de entrega a IDs del backend
    // Backend: 1=Delivery, 2=Take away, 3=Dine in
    const deliveryTypeMap = {
        'mesa': 3,        // Dine in (En mesa)
        'para_llevar': 2,  // Take away (Para llevar)  
        'delivery': 1      // Delivery
    };
    
    // Crear orden para el backend
    const orderRequest = {
        items: cart.items.map(item => ({
            id: item.dishId,
            quantity: item.quantity,
            notes: item.notes || null
        })),
        delivery: {
            id: deliveryTypeMap[deliveryType],
            to: deliveryType === 'delivery' ? deliveryAddress : null
        },
        notes: null
    };
    
    console.log('Enviando orden al backend:', orderRequest);
    
    try {
        // Enviar orden al backend
        const response = await fetch('https://localhost:7069/api/v1/Order', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderRequest)
        });
        
        if (response.ok) {
            const orderResponse = await response.json();
            console.log('✅ Orden creada en el backend:', orderResponse);
            
            showNotification(`¡Pedido confirmado! Número de orden: ${orderResponse.orderNumber}`, 'success');
            
            // Limpiar carrito
            localStorage.removeItem('cart');
            loadCart();
            updateCartCounter();
        } else {
            const errorData = await response.json();
            console.error('❌ Error del backend:', errorData);
            showNotification(`Error al crear la orden: ${errorData.message || 'Error desconocido'}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    }
};

// Funciones del carrito
window.updateQuantity = function(index, delta) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items[index].quantity += delta;
    
    if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCounter();
};

window.removeItem = function(index) {
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCounter();
};

// Función para cargar órdenes
async function loadOrders() {
    console.log('📋 Cargando órdenes...');
    const ordersList = document.getElementById('myOrdersList');
    if (!ordersList) return;
    
    try {
        const response = await fetch('https://localhost:7069/api/v1/Order');
        if (response.ok) {
            const orders = await response.json();
            console.log('✅ Órdenes cargadas:', orders);
            renderOrders(orders);
        } else {
            console.error('❌ Error HTTP:', response.status);
            ordersList.innerHTML = '<div class="error">Error cargando órdenes</div>';
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        ordersList.innerHTML = '<div class="error">No se pudieron cargar las órdenes</div>';
    }
}

function renderOrders(orders) {
    const ordersList = document.getElementById('myOrdersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<div class="empty">No tienes órdenes</div>';
        return;
    }
    
    console.log('📋 Renderizando órdenes:', orders);
    
    orders.forEach(order => {
        console.log('📋 Procesando orden:', order);
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const orderId = order.orderNumber || order.id || order.OrderNumber || order.Id;
        const statusId = order.status?.id || 1;
        const statusName = order.status?.name || 'Pendiente';
        const totalAmount = order.totalAmount || 0;
        
        console.log('📋 ID de orden:', orderId);
        
        orderCard.innerHTML = `
            <div class="order-header">
                <h3 class="order-number">Orden #${orderId}</h3>
                <span class="order-status status-${statusId}">${statusName}</span>
            </div>
            <div class="order-total">Total: $${totalAmount}</div>
            <div class="order-actions">
                <button onclick="viewOrderDetails('${orderId}')">Ver detalles</button>
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// Variable global para almacenar todas las órdenes
let allOrders = [];

// Función para cargar panel de administración
async function loadAdminPanel() {
    console.log('👨‍💼 Cargando panel de administración...');
    const ordersPanel = document.getElementById('ordersPanel');
    if (!ordersPanel) {
        console.error('❌ No se encontró el panel de órdenes');
        return;
    }
    
    try {
        console.log('📡 Enviando request a: https://localhost:7069/api/v1/Order');
        const response = await fetch('https://localhost:7069/api/v1/Order');
        console.log('📡 Respuesta recibida:', response.status, response.statusText);
        
        if (response.ok) {
            const orders = await response.json();
            console.log('📋 Órdenes recibidas:', orders);
            
            // Almacenar todas las órdenes globalmente
            allOrders = orders;
            
            // Renderizar órdenes sin filtro inicialmente
            renderAdminOrders(orders);
            
            // Configurar el filtro
            setupStatusFilter();
            
            // Configurar el botón de actualizar
            setupRefreshButton();
        } else {
            console.error('❌ Error en la respuesta:', response.status);
            ordersPanel.innerHTML = '<div class="error">Error cargando órdenes</div>';
        }
    } catch (error) {
        console.error('❌ Error cargando órdenes:', error);
        ordersPanel.innerHTML = '<div class="error">No se pudieron cargar las órdenes</div>';
    }
}

// Función para configurar el filtro de estado
function setupStatusFilter() {
    const statusFilter = document.getElementById('panelStatusFilter');
    if (!statusFilter) {
        console.error('❌ No se encontró el filtro de estado');
        return;
    }
    
    console.log('🔧 Configurando filtro de estado...');
    
    statusFilter.addEventListener('change', function() {
        const selectedStatus = this.value;
        console.log('🔍 Filtrando por estado:', selectedStatus);
        
        let filteredOrders = allOrders;
        
        if (selectedStatus !== 'all') {
            const statusId = parseInt(selectedStatus);
            filteredOrders = allOrders.filter(order => {
                const orderStatusId = order.status?.id || 1;
                return orderStatusId === statusId;
            });
        }
        
        console.log(`📊 Mostrando ${filteredOrders.length} de ${allOrders.length} órdenes`);
        renderAdminOrders(filteredOrders);
    });
}

// Función para configurar el botón de actualizar
function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshOrders');
    if (!refreshBtn) {
        console.error('❌ No se encontró el botón de actualizar');
        return;
    }
    
    console.log('🔧 Configurando botón de actualizar...');
    
    refreshBtn.addEventListener('click', async function() {
        console.log('🔄 Actualizando órdenes...');
        
        // Mostrar estado de carga
        this.disabled = true;
        this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <path d="M21 12a9 9 0 11-6.219-8.56"></path>
            </svg>
            Actualizando...
        `;
        
        try {
            await loadAdminPanel();
            showNotification('Órdenes actualizadas correctamente', 'success');
        } catch (error) {
            console.error('❌ Error actualizando órdenes:', error);
            showNotification('Error al actualizar las órdenes', 'error');
        } finally {
            // Restaurar botón
            this.disabled = false;
            this.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
                Actualizar
            `;
        }
    });
}

function renderAdminOrders(orders) {
    console.log('🎨 Renderizando órdenes de administración:', orders);
    const ordersPanel = document.getElementById('ordersPanel');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!ordersPanel) {
        console.error('❌ No se encontró el panel de órdenes para renderizar');
        return;
    }
    
    // Actualizar contador de resultados
    if (resultsCount) {
        const totalOrders = allOrders.length;
        const filteredCount = orders.length;
        
        if (filteredCount === totalOrders) {
            resultsCount.textContent = `${totalOrders} órdenes`;
        } else {
            resultsCount.textContent = `${filteredCount} de ${totalOrders} órdenes`;
        }
    }
    
    ordersPanel.innerHTML = '';
    
    if (orders.length === 0) {
        console.log('📭 No hay órdenes para mostrar');
        ordersPanel.innerHTML = '<div class="empty">No hay órdenes que coincidan con el filtro</div>';
        return;
    }

    console.log(`📋 Renderizando ${orders.length} órdenes`);
    orders.forEach((order, index) => {
        console.log(`📋 Procesando orden ${index + 1}:`, order);
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const currentStatusId = order.status?.id || 1;
        const statusName = order.status?.name || 'Pendiente';
        const orderId = order.orderNumber || order.id;
        const totalAmount = order.totalAmount || 0;
        
        // Guardar el valor anterior para poder revertir
        const selectId = `status-${orderId}`;
        
        orderCard.innerHTML = `
            <div class="order-header">
                <h3 class="order-number">Orden #${orderId}</h3>
                <span class="order-status status-${currentStatusId}">${statusName}</span>
            </div>
            <div class="order-total">Total: $${totalAmount}</div>
            <div class="order-actions">
                <select id="${selectId}" 
                        data-previous-value="${currentStatusId}"
                        onchange="updateOrderStatus('${orderId}', this.value, this)">
                    <option value="1" ${currentStatusId === 1 ? 'selected' : ''}>Pendiente</option>
                    <option value="2" ${currentStatusId === 2 ? 'selected' : ''}>En preparación</option>
                    <option value="3" ${currentStatusId === 3 ? 'selected' : ''}>Listo</option>
                    <option value="4" ${currentStatusId === 4 ? 'selected' : ''}>Entregado</option>
                    <option value="5" ${currentStatusId === 5 ? 'selected' : ''}>Cancelado</option>
                </select>
            </div>
        `;
        
        ordersPanel.appendChild(orderCard);
        console.log(`✅ Orden ${orderId} renderizada con estado ${currentStatusId}`);
    });
    
    console.log('✅ Todas las órdenes renderizadas correctamente');
}

// Funciones globales adicionales
window.viewOrderDetails = async function(orderId) {
    console.log('📋 Cargando detalles de la orden:', orderId);
    console.log('🔍 URL:', `https://localhost:7069/api/v1/Order/${orderId}`);
    
    try {
        const response = await fetch(`https://localhost:7069/api/v1/Order/${orderId}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        
        if (response.ok) {
            const orderDetails = await response.json();
            console.log('✅ Detalles de la orden recibidos:', orderDetails);
            showOrderDetailsModal(orderDetails);
        } else {
            const errorText = await response.text();
            console.error('❌ Error HTTP:', response.status, errorText);
            showNotification(`Error ${response.status}: ${errorText}`, 'error');
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification(`Error de conexión: ${error.message}`, 'error');
    }
};

// Función para mostrar modal de detalles de la orden
function showOrderDetailsModal(orderDetails) {
    // Crear modal si no existe
    let modal = document.getElementById('orderDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Determinar si mostrar dirección (solo si es delivery)
    const isDelivery = orderDetails.deliveryType?.id === 1; // 1 = Delivery
    const showAddress = isDelivery && orderDetails.deliveryTo;
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closeOrderDetailsModal()"></div>
        <div class="modal__content">
            <div class="modal__header">
                <h2>Detalles de la Orden #${orderDetails.orderNumber}</h2>
                <button class="modal__close" onclick="closeOrderDetailsModal()">×</button>
            </div>
            <div class="modal__body">
                <div class="order-details">
                    <div class="order-info">
                        <div class="info-row">
                            <span class="label">Estado:</span>
                            <span class="value status status--${orderDetails.status?.name?.toLowerCase().replace(' ', '-')}">${orderDetails.status?.name || 'Desconocido'}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Tipo de entrega:</span>
                            <span class="value">${orderDetails.deliveryType?.name || 'Desconocido'}</span>
                        </div>
                        ${showAddress ? `
                        <div class="info-row">
                            <span class="label">Dirección:</span>
                            <span class="value">${orderDetails.deliveryTo}</span>
                        </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="label">Total:</span>
                            <span class="value price">$${orderDetails.totalAmount}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Fecha:</span>
                            <span class="value">${new Date(orderDetails.createdAt).toLocaleString()}</span>
                        </div>
                        ${orderDetails.notes ? `
                        <div class="info-row">
                            <span class="label">Notas:</span>
                            <span class="value">${orderDetails.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="order-items">
                        <h3>Items de la orden:</h3>
                        <div class="items-list">
                            ${orderDetails.items?.map(item => `
                                <div class="item-row">
                                    <div class="item-info">
                                        <h4>${item.dish?.name || 'Plato desconocido'}</h4>
                                        <p>Cantidad: ${item.quantity}</p>
                                        ${item.notes ? `<p class="item-notes">Notas: ${item.notes}</p>` : ''}
                                    </div>
                                    <div class="item-status">
                                        <span class="status status--${item.status?.name?.toLowerCase().replace(' ', '-')}">${item.status?.name || 'Desconocido'}</span>
                                    </div>
                                </div>
                            `).join('') || '<p>No hay items en esta orden</p>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
window.closeOrderDetailsModal = function() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.updateOrderStatus = async function(orderId, statusId, selectElement) {
    console.log(`🔄 Actualizando orden ${orderId} a estado ${statusId}`);
    
    // Mostrar confirmación
    const statusNames = {
        1: 'Pendiente',
        2: 'En preparación', 
        3: 'Listo',
        4: 'Entregado',
        5: 'Cancelado'
    };
    
    const newStatusName = statusNames[statusId] || 'Desconocido';
    console.log(`📋 Nuevo estado: ${newStatusName}`);
    
    // Validar transiciones de estado permitidas
    const currentStatusId = parseInt(selectElement.dataset.previousValue || '1');
    console.log(`📋 Estado actual: ${currentStatusId}, Nuevo estado: ${statusId}`);
    
    if (!isValidStatusTransition(currentStatusId, parseInt(statusId))) {
        console.log('❌ Transición no permitida');
        showNotification(`No se puede cambiar de "${statusNames[currentStatusId]}" a "${newStatusName}". Transición no permitida.`, 'error');
        // Revertir el select
        selectElement.value = currentStatusId;
        return;
    }
    
    console.log('✅ Transición válida, mostrando modal de confirmación...');
    
    // Mostrar modal de confirmación estético
    const confirmed = await showConfirmModal(
        'Confirmar Cambio de Estado',
        `¿Estás seguro de que quieres cambiar el estado de la orden ${orderId} a "${newStatusName}"?`,
        'Cambiar Estado',
        'Cancelar'
    );
    
    console.log(`📋 Usuario confirmó: ${confirmed}`);
    
    if (!confirmed) {
        console.log('❌ Usuario canceló, revirtiendo select');
        // Si cancela, revertir el select al valor anterior
        selectElement.value = selectElement.dataset.previousValue || '1';
        return;
    }
    
    try {
        console.log('🚀 Iniciando actualización de estado...');
        
        // Obtener los detalles de la orden primero
        const orderDetailsResponse = await fetch(`https://localhost:7069/api/v1/Order/${orderId}`);
        if (!orderDetailsResponse.ok) {
            if (orderDetailsResponse.status === 404) {
                throw new Error('Orden no encontrada');
            }
            throw new Error('No se pudo obtener los detalles de la orden');
        }
        
        const orderDetails = await orderDetailsResponse.json();
        console.log('📋 Detalles de la orden:', orderDetails);
        
        // Validar que la orden no esté cerrada (estado 5 = Cancelado)
        if (orderDetails.status?.id === 5) {
            showNotification('No se puede actualizar una orden cancelada', 'error');
            selectElement.value = selectElement.dataset.previousValue || '1';
            return;
        }
        
        // Validar que la orden no esté entregada (estado 4 = Entregado)
        if (orderDetails.status?.id === 4) {
            showNotification('No se puede actualizar una orden ya entregada', 'error');
            selectElement.value = selectElement.dataset.previousValue || '1';
            return;
        }
        
        // Actualizar el estado de cada item de la orden
        const updatePromises = orderDetails.items.map(async (item) => {
            console.log(`🔄 Actualizando item ${item.id} a estado ${statusId}`);
            
            const itemUpdateResponse = await fetch(`https://localhost:7069/api/v1/Order/${orderId}/item/${item.id}`, {
                method: 'PATCH',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: parseInt(statusId)
                })
            });
            
            if (!itemUpdateResponse.ok) {
                const errorData = await itemUpdateResponse.json();
                let errorMessage = `Error actualizando item ${item.id}`;
                
                // Manejar errores específicos del backend
                if (itemUpdateResponse.status === 400) {
                    errorMessage = `Estado inválido o transición no permitida para el item ${item.id}`;
                } else if (itemUpdateResponse.status === 404) {
                    errorMessage = `Item ${item.id} no encontrado`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                
                throw new Error(errorMessage);
            }
            
            return itemUpdateResponse.json();
        });
        
        const results = await Promise.all(updatePromises);
        console.log('✅ Items actualizados:', results);
        
        showNotification(`Orden ${orderId} actualizada a "${newStatusName}"`, 'success');
        
        // Actualizar el select con el nuevo valor
        selectElement.dataset.previousValue = statusId;
        
        // Recargar el panel de administración
        console.log('🔄 Recargando panel de administración...');
        await loadAdminPanel();
        
        // También recargar "Mis órdenes" si estamos en esa vista
        if (document.getElementById('myOrdersList')) {
            console.log('🔄 Recargando mis órdenes...');
            await loadOrders();
        }
        
        // Verificar que se recargó correctamente
        console.log('✅ Panel de administración recargado');
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
        
        // Revertir el select en caso de error
        selectElement.value = selectElement.dataset.previousValue || '1';
    }
};

// Variables globales para filtros
let allDishes = [];
let allCategories = [];
let currentSort = { field: 'name', direction: 'asc' };
let currentCategory = 'all';

// Variable para el rol actual
let currentRole = 'cliente'; // 'cliente' o 'admin'

// Función para inicializar filtros
function initializeFilters() {
    console.log('🔍 Inicializando filtros...');
    
    // Event listeners para ordenamiento
    document.getElementById('sortName').addEventListener('click', () => toggleSort('name'));
    document.getElementById('sortPrice').addEventListener('click', () => toggleSort('price'));
    
    // Event listener para búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterDishes(e.target.value);
    });
    
    // Event listeners para rango de precio
    document.getElementById('priceMin').addEventListener('input', filterByPrice);
    document.getElementById('priceMax').addEventListener('input', filterByPrice);
    
    // Cargar categorías
    loadCategories();
}

// Función para inicializar el toggle de rol
function initializeRoleToggle() {
    console.log('🔄 Inicializando toggle de rol...');
    
    const roleToggle = document.getElementById('roleToggle');
    const roleLabel = document.getElementById('roleLabel');
    const panelLink = document.getElementById('panelLink');
    
    if (!roleToggle || !roleLabel || !panelLink) {
        console.error('❌ No se encontraron elementos del toggle de rol');
        return;
    }
    
    // Event listener para el toggle
    roleToggle.addEventListener('change', function() {
        if (this.checked) {
            // Cambiar a personal
            currentRole = 'personal';
            roleLabel.textContent = 'Rol: Personal';
            panelLink.style.display = 'inline-block';
            showNotification('Cambiado a modo personal', 'info');
            console.log('👨‍💼 Cambiado a modo personal');
            
            // Ocultar elementos del cliente
            hideClientElements();
        } else {
            // Cambiar a cliente
            currentRole = 'cliente';
            roleLabel.textContent = 'Rol: Cliente';
            panelLink.style.display = 'none';
            showNotification('Cambiado a modo cliente', 'info');
            console.log('👤 Cambiado a modo cliente');
            
            // Mostrar elementos del cliente
            showClientElements();
        }
    });
    
    // Inicializar estado
    roleLabel.textContent = 'Rol: Cliente';
    panelLink.style.display = 'none';
    
    console.log('✅ Toggle de rol inicializado');
}

// Función para ocultar elementos del cliente (vista personal)
function hideClientElements() {
    console.log('👨‍💼 Ocultando elementos del cliente...');
    
    // Ocultar enlaces de navegación del cliente
    const clientNavLinks = document.querySelectorAll('a[href="#comanda"], a[href="#mis-ordenes"]');
    clientNavLinks.forEach(link => {
        link.style.display = 'none';
    });
    
    // Ocultar vistas del cliente
    const clientViews = document.querySelectorAll('#comanda, #mis-ordenes');
    clientViews.forEach(view => {
        view.style.display = 'none';
    });
    
    // Ocultar carrito en el header
    const cartLink = document.querySelector('a[href="#comanda"]');
    if (cartLink) {
        cartLink.style.display = 'none';
    }
    
    // Si estamos en una vista del cliente, cambiar a menú
    const currentView = document.querySelector('.view:not(.hidden)');
    if (currentView && (currentView.id === 'comanda' || currentView.id === 'mis-ordenes')) {
        showView('menu');
    }
    
    console.log('✅ Elementos del cliente ocultos');
}

// Función para mostrar elementos del cliente (vista cliente)
function showClientElements() {
    console.log('👤 Mostrando elementos del cliente...');
    
    // Mostrar enlaces de navegación del cliente
    const clientNavLinks = document.querySelectorAll('a[href="#comanda"], a[href="#mis-ordenes"]');
    clientNavLinks.forEach(link => {
        link.style.display = 'inline-block';
    });
    
    // Mostrar vistas del cliente
    const clientViews = document.querySelectorAll('#comanda, #mis-ordenes');
    clientViews.forEach(view => {
        view.style.display = 'block';
    });
    
    // Mostrar carrito en el header
    const cartLink = document.querySelector('a[href="#comanda"]');
    if (cartLink) {
        cartLink.style.display = 'inline-block';
    }
    
    console.log('✅ Elementos del cliente mostrados');
}

// Función para alternar ordenamiento
function toggleSort(field) {
    const button = document.getElementById(`sort${field.charAt(0).toUpperCase() + field.slice(1)}`);
    
    // Si es el mismo campo, cambiar dirección
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Si es un campo diferente, empezar con asc
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    // Actualizar UI
    updateSortButtons();
    
    // Aplicar ordenamiento
    applySorting();
}

// Función para actualizar botones de ordenamiento
function updateSortButtons() {
    // Remover clase active de todos
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('data-direction', 'asc');
    });
    
    // Activar el botón actual
    const activeButton = document.getElementById(`sort${currentSort.field.charAt(0).toUpperCase() + currentSort.field.slice(1)}`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.setAttribute('data-direction', currentSort.direction);
    }
}

// Función para aplicar ordenamiento
function applySorting() {
    if (allDishes.length === 0) return;
    
    const sortedDishes = [...allDishes].sort((a, b) => {
        let aValue, bValue;
        
        if (currentSort.field === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        } else if (currentSort.field === 'price') {
            aValue = parseFloat(a.price);
            bValue = parseFloat(b.price);
        }
        
        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    renderDishes(sortedDishes);
}

// Función para filtrar por búsqueda
function filterDishes(searchTerm) {
    if (allDishes.length === 0) return;
    
    let filtered = allDishes;
    
    // Aplicar filtro de categoría
    if (currentCategory !== 'all') {
        filtered = filtered.filter(dish => {
            return dish.categoryId === currentCategory || 
                   dish.category?.id === currentCategory || 
                   dish.category?.name?.toLowerCase().includes(currentCategory.toLowerCase());
        });
    }
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
        filtered = filtered.filter(dish => 
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Aplicar filtro de precio
    const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;
    filtered = filtered.filter(dish => {
        const price = parseFloat(dish.price);
        return price >= minPrice && price <= maxPrice;
    });
    
    renderDishes(filtered);
}

// Función para filtrar por precio
function filterByPrice() {
    if (allDishes.length === 0) return;
    
    let filtered = allDishes;
    
    // Aplicar filtro de categoría
    if (currentCategory !== 'all') {
        filtered = filtered.filter(dish => {
            return dish.categoryId === currentCategory || 
                   dish.category?.id === currentCategory || 
                   dish.category?.name?.toLowerCase().includes(currentCategory.toLowerCase());
        });
    }
    
    // Aplicar filtro de búsqueda
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        filtered = filtered.filter(dish => 
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Aplicar filtro de precio
    const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;
    filtered = filtered.filter(dish => {
        const price = parseFloat(dish.price);
        return price >= minPrice && price <= maxPrice;
    });
    
    renderDishes(filtered);
}

// Función para cargar categorías
async function loadCategories() {
    console.log('📂 Cargando categorías...');
    const categoriesTabs = document.getElementById('categoriesTabs');
    if (!categoriesTabs) {
        console.error('No se encontró categoriesTabs');
        return;
    }

    try {
        const response = await fetch('https://localhost:7069/api/v1/Category', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            const categories = await response.json();
            console.log('✅ Categorías cargadas:', categories);
            
            // Agregar "Todas" al inicio
            allCategories = [
                { id: 'all', name: 'Todas' },
                ...categories
            ];
            
            console.log('📋 Categorías finales:', allCategories);
            renderCategories();
        } else {
            console.error('❌ Error HTTP:', response.status);
            // Crear categorías por defecto si falla
            createDefaultCategories();
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        // Crear categorías por defecto si falla
        createDefaultCategories();
    }
}


// Función para crear categorías por defecto
function createDefaultCategories() {
    allCategories = [
        { id: 'all', name: 'Todas' },
        { id: 'entrada', name: 'Entradas' },
        { id: 'principal', name: 'Platos Principales' },
        { id: 'postre', name: 'Postres' },
        { id: 'bebida', name: 'Bebidas' }
    ];
    renderCategories();
}

// Función para renderizar categorías
function renderCategories() {
    const categoriesTabs = document.getElementById('categoriesTabs');
    if (!categoriesTabs) return;
    
    categoriesTabs.innerHTML = '';
    
    allCategories.forEach(category => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.textContent = category.name;
        tab.dataset.categoryId = category.id;
        
        if (category.id === 'all') {
            tab.classList.add('active');
        }
        
        tab.addEventListener('click', () => {
            // Remover active de todos
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Activar el seleccionado
            tab.classList.add('active');
            
            // Filtrar por categoría
            filterByCategory(category.id);
        });
        
        categoriesTabs.appendChild(tab);
    });
}

// Función para filtrar por categoría
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    console.log('🔍 Filtrando por categoría:', categoryId);
    
    if (allDishes.length === 0) return;
    
    let filtered = allDishes;
    
    if (categoryId !== 'all') {
        console.log('🔍 Aplicando filtro de categoría...');
        // Filtrar por categoría
        filtered = allDishes.filter(dish => {
            console.log('🍽️ Plato:', dish.name, 'Categoría del plato:', dish.category);
            
            // Verificar si el plato pertenece a la categoría seleccionada
            const matches = dish.category?.id === categoryId || 
                           dish.category?.name === categoryId ||
                           dish.categoryId === categoryId;
            
            console.log('✅ Coincide:', matches);
            return matches;
        });
        
        console.log('📋 Platos filtrados:', filtered.length, filtered);
    }
    
    // Aplicar otros filtros
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        filtered = filtered.filter(dish => 
            dish.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    const minPrice = parseFloat(document.getElementById('priceMin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('priceMax').value) || Infinity;
    filtered = filtered.filter(dish => {
        const price = parseFloat(dish.price);
        return price >= minPrice && price <= maxPrice;
    });
    
    console.log('📋 Resultado final:', filtered.length, 'platos');
    renderDishes(filtered);
}

// Función para cargar menú (actualizada)
async function loadMenu() {
    console.log('🍽️ Cargando menú...');
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) {
        console.error('No se encontró dishesGrid');
        return;
    }

    try {
        const response = await fetch('https://localhost:7069/api/v1/Dish', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            allDishes = await response.json();
            console.log('✅ Platos cargados:', allDishes.length);
            console.log('📋 Datos de platos:', allDishes);
            renderDishes(allDishes);
        } else {
            console.error('❌ Error HTTP:', response.status);
            dishesGrid.innerHTML = '<div class="error">Error cargando el menú</div>';
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        dishesGrid.innerHTML = '<div class="error">No se pudo conectar con el servidor</div>';
    }
}
