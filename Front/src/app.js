/**
 * Main Application Entry Point - Versión Simplificada
 * Inicializa la aplicación sin ES modules complejos
 */

console.log('🚀 Iniciando aplicación...');

// Función de prueba para verificar que el archivo se carga
window.testApp = function() {
    console.log('✅ Aplicación cargada correctamente');
    return true;
};

// Función para mostrar vista
window.showView = function(viewId) {
    console.log('🔍 Mostrando vista:', viewId);
    
    try {
        // Ocultar todas las vistas
        const allViews = document.querySelectorAll('.view');
        allViews.forEach(view => {
            view.classList.add('hidden');
        });
        
        // Mostrar la vista objetivo
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            console.log('✅ Vista mostrada:', viewId);
        } else {
            console.error('❌ No se encontró la vista:', viewId);
        }
        
        // Manejar navegación
        const nav = document.getElementById('mainNav');
        if (nav) {
            if (viewId === 'welcome') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
            }
        }
    } catch (error) {
        console.error('❌ Error en showView:', error);
    }
};


// Función para cargar menú
window.loadMenu = async function() {
    console.log('🍽️ Cargando menú...');
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) {
        console.error('No se encontró dishesGrid');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/v1/Dish', {
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
        
        const response = await fetch(`http://localhost:5000/api/v1/Dish/${dishId}`, {
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
    
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        showNotification('Solo los clientes pueden agregar items al carrito', 'error');
        return;
    }
    
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM cargado');

    // Detectar la URL correcta del backend
    console.log('🔍 Detectando backend...');
    const backendURL = await detectBackendURL();
    if (backendURL) {
        console.log(`✅ Backend detectado en: ${backendURL}`);
    } else {
        console.log('❌ No se pudo conectar con el backend. Verifica que esté corriendo.');
        showNotification('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.', 'error');
    }

    // Asegurar que la navegación esté oculta en la página de bienvenida inicial
    const nav = document.getElementById('mainNav');
    const welcomePage = document.getElementById('welcome');
    if (welcomePage && !welcomePage.classList.contains('hidden')) {
        nav.style.display = 'none';
    }

    // Navegación (excluyendo enlaces del panel de administración)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        // Saltar enlaces del panel de administración
        if (link.onclick && link.onclick.toString().includes('showAdminSection')) {
            return;
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('href').substring(1);
            
            // Solo procesar si no es un enlace vacío
            if (viewId && viewId !== '') {
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

// Notificación especial para órdenes movidas al historial
function showSpecialNotification(message) {
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
    
    // Crear notificación especial
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        transform: translateX(100%) scale(0.8);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        font-weight: 600;
        border: 2px solid #45a049;
        position: relative;
        overflow: hidden;
    `;
    
    // Efecto de brillo animado
    const shine = document.createElement('div');
    shine.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.6s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; position: relative; z-index: 1;">
            <div style="font-size: 24px;">📋</div>
            <div style="flex: 1;">
                <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">¡Orden Entregada!</div>
                <div style="font-size: 14px; opacity: 0.9;">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; cursor: pointer; font-size: 20px; padding: 0; margin-left: 10px; opacity: 0.8; transition: opacity 0.2s;">×</button>
        </div>
    `;
    
    notification.appendChild(shine);
    container.appendChild(notification);
    
    // Animar entrada con efecto especial
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
        // Activar efecto de brillo
        setTimeout(() => {
            shine.style.left = '100%';
        }, 200);
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%) scale(0.8)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }
    }, 5000);
}

// Función para cargar el carrito
async function loadCart() {
    console.log('🛒 Cargando carrito...');
    
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        console.log('🚫 Usuario en modo personal, no se puede cargar el carrito');
        return;
    }
    
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
                <button onclick="removeCartItem(${index})" class="btn-remove">🗑️</button>
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
        <div id="deliveryToWrap">
            <label id="deliveryToLabel" style="display: block; margin-bottom: 8px; font-weight: 500;">Mesa</label>
            <input type="text" id="deliveryToInput" placeholder="Ej: Mesa 12" 
                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-top: 20px;">
            <button onclick="confirmOrder()" class="btn-confirm-order">
                Confirmar Pedido
            </button>
        </div>
    `;
    
    // Agregar event listeners para ajustar etiqueta/placeholder
    deliveryDiv.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const label = document.getElementById('deliveryToLabel');
            const input = document.getElementById('deliveryToInput');
            if (!label || !input) return;
            if (this.value === 'delivery') { 
                label.textContent = 'Dirección de entrega';
                input.placeholder = 'Ej: Av. Corrientes 1234, Piso 5B';
            } else if (this.value === 'para_llevar') {
                label.textContent = 'Nombre de quien retira';
                input.placeholder = 'Ej: Juan Pérez';
            } else { // mesa
                label.textContent = 'Mesa';
                input.placeholder = 'Ej: Mesa 12';
            }
        });
    });
    // Inicializar label/placeholder con la opción por defecto
    const evt = new Event('change');
    const checked = deliveryDiv.querySelector('input[name="deliveryType"]:checked');
    if (checked) checked.dispatchEvent(evt);
    
    cartSection.appendChild(deliveryDiv);
}

// Función para actualizar notas del item
window.updateItemNotes = function(index, notes) {
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        showNotification('Solo los clientes pueden modificar el carrito', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items[index].notes = notes;
    localStorage.setItem('cart', JSON.stringify(cart));
};

// Función para confirmar pedido
window.confirmOrder = async function() {
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        showNotification('Solo los clientes pueden realizar pedidos', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
    const deliveryTo = document.getElementById('deliveryToInput')?.value?.trim();
    
    if (cart.items.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Validaciones por tipo
    if (deliveryType === 'delivery' && !deliveryTo) {
        showNotification('Por favor ingresa la dirección de entrega', 'error');
        return;
    }
    if (deliveryType === 'para_llevar' && !deliveryTo) {
        showNotification('Ingresá el nombre de quien retira', 'error');
        return;
    }
    if (deliveryType === 'mesa' && !deliveryTo) {
        showNotification('Ingresá el número de mesa', 'error');
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
            to: deliveryTo || null
        },
        notes: null
    };
    
    console.log('Enviando orden al backend:', orderRequest);
    
    try {
        // Enviar orden al backend
        const orderResponse = await backendRequest('/Order', {
            method: 'POST',
            body: JSON.stringify(orderRequest)
        });
        
        console.log('✅ Orden creada en el backend:', orderResponse);
        // Abrir simulación de pago
        showPaymentModal(orderResponse);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    }
};

// Funciones del carrito
window.updateQuantity = function(index, delta) {
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        showNotification('Solo los clientes pueden modificar el carrito', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items[index].quantity += delta;
    
    if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCounter();
};

window.removeCartItem = function(index) {
    // Verificar que el usuario esté en modo cliente
    if (currentRole !== 'cliente') {
        showNotification('Solo los clientes pueden modificar el carrito', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
    cart.items.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCounter();
};

// Función para cargar órdenes
async function loadOrders(forceRefresh = false) {
    console.log('📋 Cargando órdenes...', forceRefresh ? '(forzando actualización)' : '');
    const ordersList = document.getElementById('myOrdersList');
    if (!ordersList) return;
    
    try {
        const orders = await backendRequest('/Order');
        console.log('✅ Órdenes cargadas:', orders);
        
        // Solo aplicar cambios guardados si no es un refresh forzado
        if (!forceRefresh) {
            // Aplicar cambios guardados desde localStorage
            orders.forEach((order, index) => {
                const savedChanges = localStorage.getItem(`order_changes_${order.orderNumber}`);
                if (savedChanges) {
                    try {
                        const changes = JSON.parse(savedChanges);
                        orders[index] = { ...order, ...changes };
                        console.log(`🔄 Orden ${order.orderNumber} actualizada con cambios guardados:`, changes);
                    } catch (error) {
                        console.error('❌ Error cargando cambios guardados:', error);
                    }
                }
            });
            
            // Si hay una orden editada localmente, actualizar sus datos
            if (editingOrder) {
                const orderIndex = orders.findIndex(order => order.orderNumber === editingOrder.orderNumber);
                if (orderIndex !== -1) {
                    orders[orderIndex] = { ...orders[orderIndex], ...editingOrder };
                    console.log('🔄 Orden actualizada con cambios locales:', orders[orderIndex]);
                }
            }
        } else {
            console.log('🔄 Cargando datos frescos del backend (sin cache local)');
        }
        
        renderOrders(orders);
    } catch (error) {
        console.error('❌ Error cargando órdenes:', error);
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
                ${statusId === 1 ? `<button onclick="editOrder('${orderId}')" class="btn-edit">Editar orden</button>` : `<span class="edit-disabled">No editable (${statusName})</span>`}
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// Variable global para almacenar todas las órdenes
let allOrders = [];

// Variables globales para el estado de edición de órdenes
let editingOrder = null;
let originalItems = [];
let modifiedItems = [];

// Función para cargar panel de administración
async function loadAdminPanel() {
    console.log('👨‍💼 Cargando panel de administración...');
    const ordersPanel = document.getElementById('ordersPanel');
    if (!ordersPanel) {
        console.error('❌ No se encontró el panel de órdenes');
        return;
    }
    
    try {
        console.log('📡 Cargando órdenes del panel de administración...');
        const orders = await backendRequest('/Order');
            console.log('📋 Órdenes recibidas:', orders);
            
            // Filtrar órdenes: solo mostrar las que NO estén entregadas (estado 4)
            const activeOrders = orders.filter(order => {
                const orderStatusId = order.status?.id || 1;
                return orderStatusId !== 4; // Excluir órdenes entregadas
            });
            
            console.log(`📊 Órdenes activas (no entregadas): ${activeOrders.length} de ${orders.length} total`);
            
            // Almacenar todas las órdenes globalmente
            allOrders = orders;
            
            // Renderizar solo órdenes activas
            renderAdminOrders(activeOrders);
            
            // Configurar el filtro
            setupStatusFilter();
            
            // Configurar el botón de actualizar
            setupRefreshButton();
    } catch (error) {
        console.error('❌ Error cargando órdenes:', error);
        ordersPanel.innerHTML = '<div class="error">No se pudieron cargar las órdenes</div>';
    }
}

// Función para configurar los filtros del panel de cocina
function setupStatusFilter() {
    const statusFilter = document.getElementById('panelStatusFilter');
    const dateFromInput = document.getElementById('panelDateFrom');
    const dateToInput = document.getElementById('panelDateTo');
    const filterBtn = document.getElementById('filterPanelBtn');
    
    if (!statusFilter) {
        console.error('❌ No se encontró el filtro de estado');
        return;
    }
    
    console.log('🔧 Configurando filtros del panel de cocina...');
    
    // Función para aplicar filtros
    function applyFilters() {
        const selectedStatus = statusFilter.value;
        const dateFrom = dateFromInput?.value;
        const dateTo = dateToInput?.value;
        
        console.log('🔍 Aplicando filtros:', { selectedStatus, dateFrom, dateTo });
        
        // Si se selecciona "Entregados" (estado 4), mostrar mensaje informativo
        if (selectedStatus === '4') {
            const ordersPanel = document.getElementById('ordersPanel');
            if (ordersPanel) {
                ordersPanel.innerHTML = `
                    <div class="info-message" style="
                        text-align: center;
                        padding: 40px 20px;
                        background: #f8f9fa;
                        border-radius: 12px;
                        border: 2px dashed #dee2e6;
                        margin: 20px 0;
                    ">
                        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                        <h3 style="color: #495057; margin-bottom: 12px; font-size: 20px;">Órdenes Entregadas</h3>
                        <p style="color: #6c757d; margin-bottom: 16px; font-size: 16px;">
                            Las órdenes entregadas se han movido al historial.
                        </p>
                        <p style="color: #6c757d; font-size: 14px;">
                            Ve a la sección <strong>"Entregados"</strong> para ver todas las órdenes completadas.
                        </p>
                        <button onclick="showAdminSection('history')" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            margin-top: 16px;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
                            Ver Órdenes Entregadas
                        </button>
                    </div>
                `;
                
                // Actualizar contador
                const resultsCount = document.getElementById('resultsCount');
                if (resultsCount) {
                    resultsCount.textContent = '0 órdenes (ver sección Entregados)';
                }
            }
            return;
        }
        
        // Validar fechas si se proporcionan
        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            
            if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                showNotification('Formato de fecha inválido', 'error');
                return;
            }
            
            if (fromDate > toDate) {
                showNotification('Rango de fechas inválido: "desde" es mayor que "hasta"', 'error');
                return;
            }
        } else if (dateFrom || dateTo) {
            showNotification('Debés seleccionar fecha desde y fecha hasta', 'error');
            return;
        }
        
        // Filtrar órdenes activas (no entregadas)
        let activeOrders = allOrders.filter(order => {
            const orderStatusId = order.status?.id || 1;
            return orderStatusId !== 4; // Excluir órdenes entregadas
        });
        
        let filteredOrders = activeOrders;
        
        // Aplicar filtro de estado
        if (selectedStatus !== 'all') {
            const statusId = parseInt(selectedStatus);
            filteredOrders = filteredOrders.filter(order => {
                const orderStatusId = order.status?.id || 1;
                return orderStatusId === statusId;
            });
        }
        
        // Aplicar filtro de fecha
        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            
            // Ajustar toDate para incluir todo el día
            toDate.setHours(23, 59, 59, 999);
            
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= fromDate && orderDate <= toDate;
            });
        }
        
        console.log(`📊 Mostrando ${filteredOrders.length} de ${activeOrders.length} órdenes activas`);
        renderAdminOrders(filteredOrders);
    }
    
    // Event listeners
    statusFilter.addEventListener('change', applyFilters);
    
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }
    
    // También aplicar filtros cuando cambien las fechas
    if (dateFromInput) {
        dateFromInput.addEventListener('change', applyFilters);
    }
    if (dateToInput) {
        dateToInput.addEventListener('change', applyFilters);
    }
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
    console.log('🔍 Obteniendo detalles de orden:', orderId);
    
    try {
        const orderDetails = await backendRequest(`/Order/${orderId}`);
            console.log('✅ Detalles de la orden recibidos:', orderDetails);
            showOrderDetailsModal(orderDetails);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification(`Error de conexión: ${error.message}`, 'error');
    }
};

// Función para editar orden
window.editOrder = async function(orderId) {
    console.log('✏️ Editando orden:', orderId);
    try {
        // Cargar detalles de la orden
        const orderDetails = await backendRequest(`/Order/${orderId}`);
        console.log('✅ Detalles de la orden para editar:', orderDetails);
        
        // Verificar que la orden esté en estado "Pendiente" (ID = 1)
        const statusId = orderDetails.status?.id || orderDetails.statusId;
        const statusName = orderDetails.status?.name || 'Desconocido';
        
        console.log(`🔍 Estado de la orden: ID=${statusId}, Nombre=${statusName}`);
        
        if (statusId !== 1) {
            showNotification(`No se puede editar la orden. Estado actual: ${statusName}. Solo se pueden editar órdenes en estado "Pendiente".`, 'error');
            return;
        }
        
        console.log('🔍 Estructura de items del backend:', orderDetails.items?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            dish: item.dish,
            price: item.price,
            dishPrice: item.dish?.price
        })));
        
        // Verificar si hay cambios guardados para esta orden
        const savedChanges = localStorage.getItem(`order_changes_${orderDetails.orderNumber}`);
        let itemsToUse = orderDetails.items || [];
        
        if (savedChanges) {
            try {
                const changes = JSON.parse(savedChanges);
                console.log('💾 Cargando cambios guardados:', changes);
                itemsToUse = changes.items || orderDetails.items || [];
                orderDetails.totalAmount = changes.totalAmount || orderDetails.totalAmount;
            } catch (error) {
                console.error('❌ Error cargando cambios guardados:', error);
            }
        }
        
        // Guardar datos originales
        editingOrder = orderDetails;
        originalItems = [...(orderDetails.items || [])];
        
        // Inicializar modifiedItems con los items (originales o guardados), asegurando que tengan precio correcto
        modifiedItems = (itemsToUse || []).map(item => {
            let price = parseFloat(item.dish?.price || item.price || 0);
            
            // Si el precio es 0, intentar calcularlo desde el total original
            if (price === 0 && orderDetails.totalAmount) {
                const totalItems = orderDetails.items?.length || 1;
                const totalAmount = parseFloat(orderDetails.totalAmount);
                price = totalAmount / totalItems;
                console.log(`⚠️ Precio 0 detectado, calculando desde total: ${totalAmount} / ${totalItems} = ${price}`);
            }
            
            console.log(`💰 Item: ${item.dish?.name || item.name}, Precio original: ${item.dish?.price || item.price}, Precio procesado: ${price}`);
            
            return {
                ...item,
                dish: {
                    ...item.dish,
                    price: price
                }
            };
        });
        
        console.log('📋 Items originales:', originalItems);
        console.log('📋 Items modificados inicializados:', modifiedItems);
        
        // Mostrar modal de edición
        showEditOrderModal(orderDetails);
    } catch (error) {
        console.error('❌ Error cargando orden para editar:', error);
        showNotification('Error cargando la orden', 'error');
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
    // Persistir datos clave como dataset para usos posteriores (recibo)
    try {
        modal.setAttribute('data-created-at', orderDetails.createdAt || '');
        modal.setAttribute('data-delivery-to', (orderDetails.deliveryTo || ''));
        modal.setAttribute('data-delivery-type', (orderDetails.deliveryType?.name || ''));
    } catch {}
    
    // Etiqueta contextual según tipo de entrega
    const typeName = (orderDetails.deliveryType?.name || '').toLowerCase();
    const isDelivery = /delivery/.test(typeName) || orderDetails.deliveryType?.id === 1;
    const isTakeAway = /take|retir/.test(typeName) || orderDetails.deliveryType?.id === 2;
    const isDineIn = /dine|comer|mesa|local/.test(typeName) || orderDetails.deliveryType?.id === 3;
    let deliveryLabel = '';
    if (isDelivery) deliveryLabel = 'Dirección';
    else if (isTakeAway) deliveryLabel = 'Retira';
    else if (isDineIn) deliveryLabel = 'Mesa';
    const showDeliveryTo = !!deliveryLabel; // siempre mostramos la fila, con fallback si vacío
    const deliveryToValue = (orderDetails.deliveryTo || '').trim();
    console.log('[DETALLE] tipo=', orderDetails.deliveryType, 'label=', deliveryLabel, 'to=', deliveryToValue);
    
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
                        ${showDeliveryTo ? `
                        <div class="info-row">
                            <span class="label">${deliveryLabel}:</span>
                            <span class="value">${deliveryToValue || (isDineIn ? 'No especificada' : isTakeAway ? 'No especificado' : 'No especificada')}</span>
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
                    <div class="order-actions" style="margin-top: 16px; display: flex; gap: 8px;">
                        <button class="btn btn--primary" onclick="printOrderReceipt()">Imprimir comprobante</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
// Comprobante/recibo (no fiscal)
window.printOrderReceipt = function () {
    try {
        // Resolver datos desde la página actual si no viene el objeto completo
        const modal = document.getElementById('orderDetailsModal');
        const safeGet = (sel) => modal?.querySelector(sel)?.textContent || '';
        const orderNumber = safeGet('.modal__header h2')?.replace(/\D+/g, '') || '';
        const deliveryTypeName = safeGet('.info-row:nth-child(2) .value');
        const deliveryLabelEl = Array.from(modal?.querySelectorAll('.info-row .label')||[]).find(el=>/dirección|retira|mesa/i.test(el.textContent||''));
        const deliveryValueEl = deliveryLabelEl ? deliveryLabelEl.nextElementSibling : null;
        const deliveryLabel = deliveryLabelEl?.textContent || '';
        const deliveryTo = (deliveryValueEl?.textContent || '');
        const totalAmount = safeGet('.price')?.replace(/[^0-9.,]/g,'');
        let createdAt = modal?.getAttribute('data-created-at') || safeGet('.info-row:nth-child(4) .value');
        // Si no es válido, intentar buscar por etiqueta "Fecha" y luego fallback a ahora
        if (!createdAt || isNaN(new Date(createdAt).getTime())) {
            const dateRowLabel = Array.from(modal?.querySelectorAll('.info-row .label')||[]).find(el=>/fecha/i.test(el.textContent||''));
            const dateValEl = dateRowLabel ? dateRowLabel.nextElementSibling : null;
            createdAt = (dateValEl?.textContent || '').trim();
        }
        if (!createdAt || isNaN(new Date(createdAt).getTime())) {
            createdAt = new Date().toISOString();
        }

        // Extraer items (nombre y cantidad) del modal
        const items = Array.from(modal?.querySelectorAll('.items-list .item-row')||[]).map(row => {
            const name = row.querySelector('h4')?.textContent || 'Plato';
            const qtyText = row.querySelector('p')?.textContent || '';
            // Extraer solo el número de la cantidad (ej: "Cantidad: 2" -> "2")
            const qty = qtyText.replace(/[^\d]/g, '') || '1';
            return { name, qty };
        });

        const w = window.open('', '_blank');
        if (!w) return;
        w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante #${orderNumber}</title>
            <style>
            :root{--brand:#8B0000;--ink:#1f2328;--muted:#6b7280;--border:#e5e7eb}
            *{box-sizing:border-box}
            body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,sans-serif;margin:0;background:#fafafa;color:var(--ink)}
            .page{max-width:720px;margin:32px auto;padding:0 16px}
            .receipt{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.06);overflow:hidden}
            .head{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid var(--border)}
            .brand{display:flex;gap:12px;align-items:center}
            .logo{width:36px;height:36px;border-radius:8px;background:var(--brand);box-shadow:inset 0 0 0 3px rgba(255,255,255,.4)}
            .title{font-weight:800;letter-spacing:.2px;color:var(--brand)}
            .code{color:var(--muted)}
            .body{padding:20px 24px;display:grid;gap:18px}
            .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
            .row{display:flex;justify-content:space-between;gap:12px}
            .label{color:var(--muted)}
            table{width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:8px;overflow:hidden}
            th,td{padding:10px 12px;border-bottom:1px solid var(--border);text-align:left}
            th{background:#f9fafb;color:#374151;font-weight:600}
            tfoot td{font-weight:800;color:var(--brand)}
            .actions{padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end}
            .btn{background:var(--brand);color:#fff;border:none;border-radius:8px;padding:10px 14px;font-weight:600;cursor:pointer}
            @media print{.actions{display:none}body{background:#fff}.page{margin:0}.receipt{border:none;box-shadow:none}}
            </style>
        </head><body>
            <div class="page">
                <div class="receipt">
                    <div class="head">
                        <div class="brand"><div class="logo"></div><div class="title">Comprobante (no fiscal)</div></div>
                        <div class="code">#${orderNumber}</div>
                    </div>
                    <div class="body">
                        <div class="grid">
                            <div class="row"><span class="label">Fecha</span><span>${new Date(createdAt).toLocaleString()}</span></div>
                            <div class="row"><span class="label">Tipo de entrega</span><span>${deliveryTypeName || '—'}</span></div>
                            ${deliveryLabel ? `<div class="row"><span class="label">${deliveryLabel}</span><span>${deliveryTo || '—'}</span></div>` : ''}
                        </div>
                        <div>
                            <table>
                                <thead><tr><th>Item</th><th style="width:110px">Cantidad</th></tr></thead>
                                <tbody>
                                    ${items.map(i=>`<tr><td>${i.name}</td><td>${i.qty}</td></tr>`).join('')}
                                </tbody>
                                <tfoot><tr><td>Total</td><td>$${totalAmount}</td></tr></tfoot>
                            </table>
                        </div>
                    </div>
                    <div class="actions"><button class="btn" onclick="window.print()">Imprimir</button></div>
                </div>
            </div>
        </body></html>`);
        w.document.close();
        w.focus();
    } catch (e) { console.error('No se pudo imprimir el comprobante', e); }
}

// Simulación de pago (estilo MP)
function showPaymentModal(order) {
    // Crear modal si no existe
    let modal = document.getElementById('paymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    const total = order?.totalAmount ?? 0;
    const orderNumber = order?.orderNumber ?? '—';
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closePaymentModal()"></div>
        <div class="modal__content">
            <div class="modal__header">
                <h2>Pagar orden #${orderNumber}</h2>
                <button class="modal__close" onclick="closePaymentModal()">×</button>
            </div>
            <div class="modal__body">
                <div style="display:grid;gap:12px;">
                    <div style="font-size:1.1rem;">Total a pagar: <strong class="price">$${total}</strong></div>
                    <label>Método de pago
                        <select id="payMethod" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
                            <option>Tarjeta de crédito</option>
                            <option>Tarjeta de débito</option>
                            <option>QR / Billetera</option>
                        </select>
                    </label>
                    <button id="payBtn" class="btn btn--primary">Pagar</button>
                    <div id="payProgress" style="display:none;align-items:center;gap:8px;">
                        <div class="spinner" style="width:18px;height:18px;border:2px solid #ccc;border-top-color:#8B0000;border-radius:50%;animation:spin 1s linear infinite"></div>
                        Procesando pago...
                    </div>
                    <div id="payResult" style="display:none;color:#0a7a14;font-weight:600;">Pago exitoso</div>
                    <div id="payActions" style="display:none;gap:8px;">
                        <button class="btn btn--primary" onclick="printOrderReceipt()">Imprimir comprobante</button>
                        <button class="btn" onclick="closePaymentModal()">Cerrar</button>
                    </div>
                    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
                </div>
            </div>
        </div>
    `;

    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';

    const payBtn = modal.querySelector('#payBtn');
    const progress = modal.querySelector('#payProgress');
    const result = modal.querySelector('#payResult');
    const actions = modal.querySelector('#payActions');

    payBtn.addEventListener('click', () => {
        payBtn.disabled = true;
        progress.style.display = 'flex';

        setTimeout(() => {
            progress.style.display = 'none';
            result.style.display = '';
            actions.style.display = 'flex';
            // Limpiar carrito tras pago
            localStorage.removeItem('cart');
            loadCart();
            updateCartCounter();
        }, 1800);
    });
}

window.closePaymentModal = function() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Función para cerrar el modal
window.closeOrderDetailsModal = function() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Función para mostrar modal de edición de orden
function showEditOrderModal(orderDetails) {
    // Crear modal si no existe
    let modal = document.getElementById('editOrderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editOrderModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closeEditOrderModal()"></div>
        <div class="modal__content edit-order-modal">
            <div class="modal__header">
                <h2>Editar Orden #${orderDetails.orderNumber}</h2>
                <button class="modal__close" onclick="closeEditOrderModal()">×</button>
            </div>
            <div class="modal__body">
                <div class="edit-order-content">
                    <div class="order-info-section">
                        <h3>Información de la orden</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Estado:</label>
                                <span class="status status--${orderDetails.status?.name?.toLowerCase().replace(' ', '-')}">${orderDetails.status?.name}</span>
                            </div>
                            <div class="info-item">
                                <label>Tipo de entrega:</label>
                                <span>${orderDetails.deliveryType?.name}</span>
                            </div>
                            <div class="info-item">
                                <label>Total actual:</label>
                                <span class="price" data-total>$${orderDetails.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-items-section">
                        <h3>Items de la orden</h3>
                        <div id="editOrderItems" class="edit-items-list">
                            <!-- Los items se cargarán dinámicamente -->
                        </div>
                    </div>
                    
                    <div class="add-items-section">
                        <h3>Agregar más platos</h3>
                        <button onclick="showAddDishesModal('${orderDetails.orderNumber}')" class="btn btn--primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Agregar platos
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal__footer">
                <button onclick="closeEditOrderModal()" class="btn btn--ghost">Cancelar</button>
                <button onclick="saveOrderChanges('${orderDetails.orderNumber}')" class="btn btn--primary">
                    Guardar cambios
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Cargar los items dinámicamente después de crear el modal
    setTimeout(() => {
        updateEditOrderItems();
    }, 100);
}

// Función para cerrar el modal de edición
window.closeEditOrderModal = function() {
    const modal = document.getElementById('editOrderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Funciones de control de cantidad
window.increaseQuantity = function(itemId) {
    console.log('➕ Aumentando cantidad para item:', itemId);
    const quantityDisplay = document.getElementById(`qty-${itemId}`);
    if (!quantityDisplay) {
        console.error('❌ No se encontró el elemento de cantidad:', `qty-${itemId}`);
        return;
    }
    
    const currentQty = parseInt(quantityDisplay.textContent);
    const newQty = currentQty + 1;
    console.log(`➕ Cantidad: ${currentQty} → ${newQty}`);
    
    quantityDisplay.textContent = newQty;
    updateItemQuantity(itemId, newQty);
    updateOrderTotal(); // Actualizar total
};

window.decreaseQuantity = function(itemId) {
    console.log('➖ Disminuyendo cantidad para item:', itemId);
    const quantityDisplay = document.getElementById(`qty-${itemId}`);
    if (!quantityDisplay) {
        console.error('❌ No se encontró el elemento de cantidad:', `qty-${itemId}`);
        return;
    }
    
    const currentQty = parseInt(quantityDisplay.textContent);
    if (currentQty > 1) {
        const newQty = currentQty - 1;
        console.log(`➖ Cantidad: ${currentQty} → ${newQty}`);
        quantityDisplay.textContent = newQty;
        updateItemQuantity(itemId, newQty);
        updateOrderTotal(); // Actualizar total
    } else {
        console.log('➖ No se puede disminuir más (cantidad mínima: 1)');
    }
};

window.removeItem = function(itemId) {
    const itemCard = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemCard) {
        itemCard.style.opacity = '0.5';
        itemCard.style.pointerEvents = 'none';
        itemCard.classList.add('removing');
        
        // Marcar para eliminación
        const index = modifiedItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            modifiedItems[index].toDelete = true;
            console.log('🗑️ Item marcado para eliminación:', modifiedItems[index]);
        }
        
        // Actualizar total inmediatamente
        updateOrderTotal();
        
        // Animar eliminación
        setTimeout(() => {
            if (itemCard.parentNode) {
                itemCard.parentNode.removeChild(itemCard);
            }
        }, 300);
    }
};

function updateItemQuantity(itemId, newQuantity) {
    console.log(`🔄 Actualizando cantidad del item ${itemId} a ${newQuantity}`);
    
    // Buscar por ID exacto primero
    let index = modifiedItems.findIndex(item => item.id === itemId);
    console.log(`🔍 Búsqueda por ID exacto: ${index}`);
    
    // Si no se encuentra, buscar por ID como string
    if (index === -1) {
        index = modifiedItems.findIndex(item => String(item.id) === String(itemId));
        console.log(`🔍 Búsqueda por ID como string: ${index}`);
    }
    
    // Si aún no se encuentra, buscar por ID del plato
    if (index === -1) {
        index = modifiedItems.findIndex(item => item.dish?.id === itemId);
        console.log(`🔍 Búsqueda por dish.id: ${index}`);
    }
    
    if (index !== -1) {
        const oldQuantity = modifiedItems[index].quantity;
        modifiedItems[index].quantity = newQuantity;
        console.log(`✅ Cantidad actualizada: ${oldQuantity} → ${newQuantity} para ${modifiedItems[index].dish?.name || modifiedItems[index].name}`);
    } else {
        console.error(`❌ No se encontró el item ${itemId} en modifiedItems`);
        console.log('📋 modifiedItems actuales:', modifiedItems.map(item => ({
            id: item.id,
            name: item.dish?.name || item.name,
            quantity: item.quantity
        })));
        
        // Intentar crear el item si no existe
        console.log('🔧 Intentando crear item faltante...');
        const itemCard = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemCard) {
            const itemName = itemCard.querySelector('h4')?.textContent;
            const itemPrice = parseFloat(itemCard.querySelector('.item-price')?.textContent?.replace('$', '') || 0);
            
            if (itemName && itemPrice > 0) {
                const newItem = {
                    id: itemId,
                    dish: {
                        name: itemName,
                        price: itemPrice
                    },
                    quantity: newQuantity
                };
                
                modifiedItems.push(newItem);
                console.log('✅ Item creado:', newItem);
            }
        }
    }
}

// Función para calcular el total de la orden
function calculateOrderTotal() {
    const activeItems = modifiedItems.filter(item => !item.toDelete);
    console.log('🧮 Calculando total con items:', activeItems);
    
    const total = activeItems.reduce((sum, item) => {
        // Intentar obtener el precio de diferentes fuentes
        let itemPrice = 0;
        
        // 1. Intentar desde item.dish.price
        if (item.dish?.price) {
            itemPrice = parseFloat(item.dish.price);
        }
        // 2. Intentar desde item.price
        else if (item.price) {
            itemPrice = parseFloat(item.price);
        }
        // 3. Intentar desde el item original
        else {
            const originalItem = originalItems.find(orig => orig.id === item.id);
            if (originalItem) {
                itemPrice = parseFloat(originalItem.dish?.price || originalItem.price || 0);
            }
        }
        
        // Si aún es 0, intentar desde el total original de la orden
        if (itemPrice === 0 && editingOrder) {
            const originalTotal = parseFloat(editingOrder.totalAmount || 0);
            const originalItemsCount = originalItems.reduce((sum, orig) => sum + (orig.quantity || 0), 0);
            if (originalItemsCount > 0) {
                itemPrice = originalTotal / originalItemsCount;
            }
        }
        
        const itemTotal = itemPrice * item.quantity;
        console.log(`💰 Item: ${item.dish?.name || item.name}, Precio: ${itemPrice}, Cantidad: ${item.quantity}, Subtotal: ${itemTotal}`);
        return sum + itemTotal;
    }, 0);
    
    console.log('💰 Total calculado:', total);
    return total;
}

// Función para actualizar el total en el modal de edición
function updateOrderTotal() {
    const total = calculateOrderTotal();
    console.log('💰 Calculando total:', total);
    
    // Buscar el elemento del total de diferentes maneras
    let totalElement = document.querySelector('.edit-order-modal .price');
    if (!totalElement) {
        totalElement = document.querySelector('.order-info-section .price');
    }
    if (!totalElement) {
        totalElement = document.querySelector('[data-total]');
    }
    
    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
        console.log('✅ Total actualizado:', totalElement.textContent);
    } else {
        console.warn('⚠️ No se encontró el elemento del total');
    }
}

// Función para guardar cambios de la orden
window.saveOrderChanges = async function(orderId) {
    try {
        console.log('💾 Guardando cambios de la orden:', orderId);
        
        // Preparar cambios
        const itemsToUpdate = modifiedItems.filter(item => !item.toDelete);
        const itemsToDelete = modifiedItems.filter(item => item.toDelete).map(item => item.id);
        const newItems = itemsToUpdate.filter(item => item.toAdd);
        const updatedItems = itemsToUpdate.filter(item => !item.toAdd);
        
        console.log('📝 Items a actualizar:', updatedItems);
        console.log('➕ Items nuevos:', newItems);
        console.log('🗑️ Items a eliminar:', itemsToDelete);
        
        // Calcular nuevo total
        const newTotal = calculateOrderTotal();
        console.log('💰 Nuevo total:', newTotal);
        
        // Procesar cambios en el backend
        const changes = {
            orderId: orderId,
            newTotal: newTotal,
            itemsToUpdate: updatedItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            })),
            itemsToAdd: newItems.map(item => ({
                dishId: item.dish.id,
                quantity: item.quantity
            })),
            itemsToDelete: itemsToDelete
        };
        
        console.log('📤 Enviando cambios al backend:', changes);
        
        // Actualizar la orden localmente para reflejar los cambios
        if (editingOrder) {
            editingOrder.totalAmount = newTotal;
            editingOrder.items = itemsToUpdate;
            console.log('🔄 Orden actualizada localmente:', editingOrder);
            
            // Guardar cambios en localStorage para persistencia
            const orderChanges = {
                orderNumber: editingOrder.orderNumber,
                totalAmount: newTotal,
                items: itemsToUpdate,
                lastModified: new Date().toISOString()
            };
            
            localStorage.setItem(`order_changes_${editingOrder.orderNumber}`, JSON.stringify(orderChanges));
            console.log('💾 Cambios guardados en localStorage:', orderChanges);
        }
        
        // Simular guardado (ya que no tocas el backend)
        showNotification(`Cambios guardados correctamente. Nuevo total: $${newTotal.toFixed(2)}`, 'success');
        closeEditOrderModal();
        
        // Recargar la lista de órdenes si estamos en esa vista
        if (document.getElementById('myOrdersList')) {
            loadOrders();
        }
        
    } catch (error) {
        console.error('❌ Error guardando cambios:', error);
        showNotification('Error guardando los cambios', 'error');
    }
};

// Función para mostrar modal de agregar platos
window.showAddDishesModal = async function(orderId) {
    console.log('🍽️ Mostrando modal de agregar platos para orden:', orderId);
    console.log('🔍 modifiedItems actuales:', modifiedItems);
    
    try {
        // Cargar platos disponibles
        const dishes = await backendRequest('/Dish');
        console.log('✅ Platos cargados para agregar:', dishes.length);
        console.log('📋 Platos disponibles:', dishes.map(d => ({ id: d.id, name: d.name, price: d.price })));
        
        // Mostrar modal
        showAddDishesModalContent(orderId, dishes);
    } catch (error) {
        console.error('❌ Error cargando platos:', error);
        showNotification('Error cargando el menú', 'error');
    }
};

// Función para mostrar el contenido del modal de agregar platos
function showAddDishesModalContent(orderId, dishes) {
    console.log('🍽️ Generando contenido del modal de agregar platos');
    console.log('📋 Platos a mostrar:', dishes.length);
    
    // Crear modal si no existe
    let modal = document.getElementById('addDishesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addDishesModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closeAddDishesModal()"></div>
        <div class="modal__content add-dishes-modal">
            <div class="modal__header">
                <h2>Agregar platos a la orden #${orderId}</h2>
                <button class="modal__close" onclick="closeAddDishesModal()">×</button>
            </div>
            <div class="modal__body">
                <div class="add-dishes-content">
                    <div class="dishes-grid" id="addDishesGrid">
                        ${dishes.map(dish => `
                            <div class="dish-card" data-dish-id="${dish.id}">
                                <div class="dish-info">
                                    <h4>${dish.name}</h4>
                                    <p class="dish-price">$${dish.price}</p>
                                    <div class="dish-actions">
                                        <div class="quantity-controls">
                                            <button onclick="decreaseAddQuantity('${dish.id}')" class="btn-quantity">-</button>
                                            <span class="quantity-display" id="add-qty-${dish.id}">1</span>
                                            <button onclick="increaseAddQuantity('${dish.id}')" class="btn-quantity">+</button>
                                        </div>
                                        <button onclick="addDishToOrder('${dish.id}', '${dish.name}', ${dish.price})" class="btn btn--primary btn--small">
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="modal__footer">
                <button onclick="closeAddDishesModal()" class="btn btn--ghost">Cerrar</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Verificar que los botones se crearon correctamente
    setTimeout(() => {
        const addButtons = modal.querySelectorAll('[onclick*="addDishToOrder"]');
        console.log('🔍 Botones de agregar encontrados:', addButtons.length);
        addButtons.forEach((btn, index) => {
            console.log(`🔍 Botón ${index + 1}:`, btn.onclick?.toString());
        });
    }, 100);
}

// Función para cerrar el modal de agregar platos
window.closeAddDishesModal = function() {
    const modal = document.getElementById('addDishesModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Variables para controlar cantidades en el modal de agregar
let addDishQuantities = {};

// Funciones de control de cantidad para agregar platos
window.increaseAddQuantity = function(dishId) {
    const quantityDisplay = document.getElementById(`add-qty-${dishId}`);
    const currentQty = parseInt(quantityDisplay.textContent);
    quantityDisplay.textContent = currentQty + 1;
    addDishQuantities[dishId] = currentQty + 1;
};

window.decreaseAddQuantity = function(dishId) {
    const quantityDisplay = document.getElementById(`add-qty-${dishId}`);
    const currentQty = parseInt(quantityDisplay.textContent);
    if (currentQty > 1) {
        quantityDisplay.textContent = currentQty - 1;
        addDishQuantities[dishId] = currentQty - 1;
    }
};

// Función para agregar plato a la orden
window.addDishToOrder = function(dishId, dishName, dishPrice) {
    const quantity = addDishQuantities[dishId] || 1;
    
    console.log('🍽️ Agregando plato a la orden:', { dishId, dishName, dishPrice, quantity });
    console.log('📋 modifiedItems antes:', modifiedItems);
    console.log('📋 Buscando plato existente con nombre:', dishName);
    
    // Verificar si ya existe un item con el mismo plato (por nombre)
    const existingItemIndex = modifiedItems.findIndex(item => {
        const itemName = item.dish?.name || item.name;
        const sameName = itemName === dishName;
        const notDeleted = !item.toDelete;
        console.log(`🔍 Verificando item: "${itemName}" vs "${dishName}", Same Name: ${sameName}, Not Deleted: ${notDeleted}`);
        return sameName && notDeleted;
    });
    
    console.log('🔍 Índice del item existente:', existingItemIndex);
    
    if (existingItemIndex !== -1) {
        // Si ya existe, aumentar la cantidad y actualizar precio si es necesario
        const existingItem = modifiedItems[existingItemIndex];
        const oldQuantity = existingItem.quantity;
        const newQuantity = oldQuantity + quantity;
        
        modifiedItems[existingItemIndex].quantity = newQuantity;
        
        console.log(`➕ Item existente actualizado: ${existingItem.dish?.name} de ${oldQuantity} a ${newQuantity}`);
        
        // Actualizar el precio si el nuevo precio es diferente
        if (existingItem.dish?.price !== parseFloat(dishPrice)) {
            existingItem.dish.price = parseFloat(dishPrice);
            console.log(`💰 Precio actualizado de ${existingItem.dish?.name}: $${dishPrice}`);
        }
        
        console.log('➕ Item existente actualizado:', modifiedItems[existingItemIndex]);
    } else {
        // Si no existe, crear nuevo item
        console.log('➕ No se encontró item existente, creando nuevo');
        const newItem = {
            id: `temp-${Date.now()}`, // ID temporal
            dish: {
                id: dishId,
                name: dishName,
                price: parseFloat(dishPrice) // Asegurar que sea número
            },
            quantity: quantity,
            toAdd: true // Marcar como nuevo item
        };
        
        // Agregar a la lista de items modificados
        modifiedItems.push(newItem);
        console.log('➕ Nuevo item agregado:', newItem);
    }
    
    console.log('📋 modifiedItems después:', modifiedItems);
    
    // Actualizar la vista del modal de edición
    updateEditOrderItems();
    
    // Mostrar notificación
    showNotification(`${dishName} agregado a la orden`, 'success');
    
    // Resetear cantidad
    addDishQuantities[dishId] = 1;
    const qtyElement = document.getElementById(`add-qty-${dishId}`);
    if (qtyElement) {
        qtyElement.textContent = '1';
    }
};

// Función para actualizar la vista de items en el modal de edición
function updateEditOrderItems() {
    const editOrderItems = document.getElementById('editOrderItems');
    if (!editOrderItems) return;
    
    // Filtrar items que no están marcados para eliminar
    const activeItems = modifiedItems.filter(item => !item.toDelete);
    console.log('🔄 Actualizando items en el modal:', activeItems);
    
    editOrderItems.innerHTML = activeItems.map(item => {
        // Asegurar que el precio se muestre correctamente
        const price = item.dish?.price || item.price || 0;
        const name = item.dish?.name || item.name || 'Plato desconocido';
        
        console.log(`🎨 Renderizando item: ${name}, Precio: ${price}, Cantidad: ${item.quantity}`);
        console.log(`🔍 Estructura del item:`, item);
        console.log(`🔍 HTML que se va a insertar:`, `
            <div class="edit-item-card" data-item-id="${item.id}">
                <div class="item-details">
                    <h4>${name}</h4>
                    <p class="item-price">$${price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="decreaseQuantity('${item.id}')" class="btn-quantity">-</button>
                        <span class="quantity-display" id="qty-${item.id}">${item.quantity}</span>
                        <button onclick="increaseQuantity('${item.id}')" class="btn-quantity">+</button>
                    </div>
                    <button onclick="removeItem('${item.id}')" class="btn-remove">Eliminar</button>
                    ${item.toAdd ? '<span class="new-item-badge">Nuevo</span>' : ''}
                </div>
            </div>
        `);
        
        return `
            <div class="edit-item-card" data-item-id="${item.id}">
                <div class="item-details">
                    <h4>${name}</h4>
                    <p class="item-price">$${price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="decreaseQuantity('${item.id}')" class="btn-quantity">-</button>
                        <span class="quantity-display" id="qty-${item.id}">${item.quantity}</span>
                        <button onclick="increaseQuantity('${item.id}')" class="btn-quantity">+</button>
                    </div>
                    <button onclick="removeItem('${item.id}')" class="btn-remove">Eliminar</button>
                    ${item.toAdd ? '<span class="new-item-badge">Nuevo</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Verificar que el HTML se insertó correctamente
    console.log('🔍 HTML insertado en editOrderItems:', editOrderItems.innerHTML);
    
    // Verificar que el precio se muestra correctamente
    const priceElements = editOrderItems.querySelectorAll('.item-price');
    priceElements.forEach((el, index) => {
        console.log(`💰 Precio ${index + 1} en el DOM:`, el.textContent);
    });
    
    // Actualizar el total después de actualizar los items
    updateOrderTotal();
}

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
        const orderDetails = await backendRequest(`/Order/${orderId}`);
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
            
            return await backendRequest(`/Order/${orderId}/item/${item.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    status: parseInt(statusId)
                })
            });
        });
        
        const results = await Promise.all(updatePromises);
        console.log('✅ Items actualizados:', results);
        
        showNotification(`Orden ${orderId} actualizada a "${newStatusName}"`, 'success');
        
        // Verificar si se marcó como entregado (estado 4)
        if (parseInt(statusId) === 4) {
            // Mostrar notificación especial de movimiento al historial
            showSpecialNotification(`🎉 ¡Orden ${orderId} movida al historial de órdenes entregadas!`);
            
            // Esperar un momento para que se vea la notificación
            setTimeout(async () => {
                // Recargar el panel de administración
                console.log('🔄 Recargando panel de administración...');
                await loadAdminPanel();
            }, 2000);
        } else {
            // Recargar el panel de administración inmediatamente
            console.log('🔄 Recargando panel de administración...');
            await loadAdminPanel();
        }
        
        // Actualizar el select con el nuevo valor
        selectElement.dataset.previousValue = statusId;
        
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

// Variable para la URL base del backend
let backendBaseURL = 'http://localhost:5000/api/v1';

// Función para detectar la URL correcta del backend
async function detectBackendURL() {
    console.log('🔍 Detectando URL correcta del backend...');
    
    const possibleURLs = [
        'http://localhost:5000/api/v1',
        'https://localhost:7069/api/v1',
        'http://localhost:5069/api/v1'
    ];
    
    for (const url of possibleURLs) {
        try {
            console.log(`📡 Probando: ${url}/Dish`);
            const response = await fetch(`${url}/Dish`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                console.log(`✅ Backend encontrado en: ${url}`);
                backendBaseURL = url;
                return url;
            }
        } catch (error) {
            console.log(`❌ ${url} - Error:`, error.message);
        }
    }
    
    console.log('❌ No se pudo conectar con el backend en ninguna URL');
    return null;
}

// Función helper para hacer llamadas al backend
async function backendRequest(endpoint, options = {}) {
    const url = `${backendBaseURL}${endpoint}`;
    console.log(`📡 Llamando a: ${url}`);
    
    const config = {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`❌ Error en ${url}:`, error);
        throw error;
    }
}

// Función helper para convertir fechas a UTC
function toUTCString(date) {
    if (!date) return null;
    
    // Si es una fecha local, convertir a UTC
    const utcDate = new Date(date);
    return utcDate.toISOString();
}

// Función helper para formatear fechas para el backend
function formatDateForBackend(date) {
    if (!date) return null;
    
    // Convertir a UTC y formatear como espera el backend
    const utcDate = new Date(date);
    return utcDate.toISOString().replace('Z', 'Z'); // Asegurar formato UTC
}

// Función helper para mostrar fechas en formato local
function formatDateForDisplay(utcDateString) {
    if (!utcDateString) return 'N/A';
    
    try {
        // Parsear la fecha UTC del backend
        const date = new Date(utcDateString);
        
        // Formatear para mostrar en zona horaria local
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('❌ Error formateando fecha:', error);
        return utcDateString; // Devolver original si hay error
    }
}

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
            
            // Limpiar cache de órdenes al cambiar a personal
            clearOrdersCache();
            
            // Ocultar elementos del cliente
            hideClientElements();
        } else {
            // Cambiar a cliente
            currentRole = 'cliente';
            roleLabel.textContent = 'Rol: Cliente';
            panelLink.style.display = 'none';
            showNotification('Cambiado a modo cliente', 'info');
            console.log('👤 Cambiado a modo cliente');
            
            // Limpiar cache y recargar datos al volver a cliente
            clearOrdersCache();
            refreshClientData();
            
            // Mostrar elementos del cliente
            showClientElements();
        }
    });
    
    // Inicializar estado
    roleLabel.textContent = 'Rol: Cliente';
    panelLink.style.display = 'none';
}

// Función para limpiar cache de órdenes
function clearOrdersCache() {
    console.log('🧹 Limpiando cache de órdenes...');
    
    // Limpiar variables globales
    editingOrder = null;
    originalItems = [];
    modifiedItems = [];
    
    // Limpiar localStorage de cambios de órdenes
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('order_changes_')) {
            localStorage.removeItem(key);
            console.log(`🗑️ Eliminado cache: ${key}`);
        }
    });
    
    console.log('✅ Cache de órdenes limpiado');
}

// Función para refrescar datos del cliente
function refreshClientData() {
    console.log('🔄 Refrescando datos del cliente...');
    
    // Recargar órdenes si estamos en la vista de órdenes
    if (document.getElementById('myOrdersList')) {
        console.log('📋 Recargando órdenes...');
        loadOrders(true); // Forzar actualización
    }
    
    // Recargar carrito si está visible
    if (document.getElementById('cartItems')) {
        console.log('🛒 Recargando carrito...');
        loadCart();
        updateCartCounter();
    }
    
    console.log('✅ Datos del cliente refrescados');
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
        const categories = await backendRequest('/Category');
        console.log('✅ Categorías cargadas:', categories);
        
        // Agregar "Todas" al inicio
        allCategories = [
            { id: 'all', name: 'Todas' },
            ...categories
        ];
        
        console.log('📋 Categorías finales:', allCategories);
        renderCategories();
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
window.loadMenu = async function() {
    console.log('🍽️ Cargando menú...');
    const dishesGrid = document.getElementById('dishesGrid');
    if (!dishesGrid) {
        console.error('No se encontró dishesGrid');
        return;
    }

    try {
        allDishes = await backendRequest('/Dish');
        console.log('✅ Platos cargados:', allDishes.length);
        console.log('📋 Datos de platos:', allDishes);
        renderDishes(allDishes);
    } catch (error) {
        console.error('❌ Error cargando menú:', error);
        dishesGrid.innerHTML = '<div class="error">No se pudo conectar con el servidor</div>';
    }
}

// ===== FUNCIONES DEL PANEL DE ADMINISTRACIÓN =====

// Función para mostrar secciones del panel de administración
window.showAdminSection = function(section) {
    console.log('🔧 Mostrando sección de administración:', section);
    
    try {
        // Asegurar que la sección padre del panel esté visible
        const panelSection = document.getElementById('panel-ordenes');
        if (panelSection) {
            panelSection.classList.remove('hidden');
            console.log('✅ Panel de administración mostrado');
        }
        
        // Ocultar todas las subsecciones
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.add('hidden');
            console.log('🔍 Ocultando sección:', sec.id);
        });
        
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.admin-nav__link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`admin-${section}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log('✅ Sección mostrada:', targetSection.id);
            console.log('🔍 Clases después:', targetSection.className);
            console.log('🔍 Display después:', window.getComputedStyle(targetSection).display);
        } else {
            console.error('❌ No se encontró la sección:', `admin-${section}-section`);
            return;
        }
        
        // Activar el enlace correspondiente
        const targetLink = document.querySelector(`[onclick="showAdminSection('${section}')"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            console.log('✅ Enlace activado:', targetLink.textContent);
        }
        
        // Cargar datos según la sección
        switch(section) {
            case 'orders':
                console.log('📋 Cargando panel de órdenes...');
                loadAdminPanel();
                break;
            case 'menu':
                console.log('🍽️ Cargando gestión de menú...');
                loadMenuManagement();
                break;
            case 'history':
                console.log('📜 Cargando historial...');
                loadOrderHistory();
                break;
        }
    } catch (error) {
        console.error('❌ Error en showAdminSection:', error);
    }
};

// ===== GESTIÓN DE MENÚ =====

// Función para cargar la gestión del menú
async function loadMenuManagement() {
    console.log('🍽️ Cargando gestión del menú...');
    const menuPanel = document.getElementById('menuManagementPanel');
    if (!menuPanel) {
        console.error('❌ No se encontró menuManagementPanel');
        return;
    }
    
    // Mostrar indicador de carga
    menuPanel.innerHTML = '<div class="loading">Cargando gestión del menú...</div>';
    
    try {
        // Cargar todos los platos (incluyendo inactivos)
        const dishes = await backendRequest('/Dish?onlyActive=false');
        console.log('✅ Platos cargados para gestión:', dishes.length);
        renderMenuManagement(dishes);
    } catch (error) {
        console.error('❌ Error cargando gestión del menú:', error);
        menuPanel.innerHTML = '<div class="error">No se pudo conectar con el servidor</div>';
    }
}

// Función para renderizar la gestión del menú
function renderMenuManagement(dishes) {
    const menuPanel = document.getElementById('menuManagementPanel');
    if (!menuPanel) return;
    
    menuPanel.innerHTML = '';
    
    if (dishes.length === 0) {
        menuPanel.innerHTML = `
            <div class="empty-dishes">
                <div class="empty-dishes__content">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 12h8"></path>
                    </svg>
                    <h3>No hay platos en el menú</h3>
                    <p>Agrega tu primer plato usando el botón "Añadir Nuevo Plato".</p>
                </div>
            </div>
        `;
        return;
    }
    
    dishes.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'menu-item-card';
        
        const isActive = dish.isActive !== false;
        const statusClass = isActive ? 'active' : 'inactive';
        const statusText = isActive ? 'Activo' : 'Inactivo';
        const actionButton = isActive ? 
            `<button class="btn btn--deactivate" onclick="toggleDishStatus('${dish.id}', false)">Desactivar</button>` :
            `<button class="btn btn--activate" onclick="toggleDishStatus('${dish.id}', true)">Activar</button>`;
        
        card.innerHTML = `
            <div class="menu-item-header">
                <h3 class="menu-item-name">${dish.name}</h3>
                <span class="menu-item-status ${statusClass}">${statusText}</span>
            </div>
            <div class="menu-item-price">$${dish.price}</div>
            <div class="menu-item-description">${dish.description || 'Sin descripción'}</div>
            <div class="menu-item-actions">
                <button class="btn btn--edit" onclick="editDish('${dish.id}')">Editar</button>
                ${actionButton}
            </div>
        `;
        
        menuPanel.appendChild(card);
    });
}

// Función para alternar el estado de un plato
window.toggleDishStatus = async function(dishId, newStatus) {
    console.log(`🔄 Cambiando estado del plato ${dishId} a ${newStatus ? 'activo' : 'inactivo'}`);
    
    try {
        // Primero obtener los datos actuales del plato
        const dish = await backendRequest(`/Dish/${dishId}`);
        
        // Preparar datos para actualización
        const updateData = {
            name: dish.name,
            description: dish.description || '',
            price: dish.price,
            category: dish.category?.id || 1,
            image: dish.image || null,
            isActive: newStatus
        };
        
        console.log('📤 Enviando datos de actualización:', updateData);
        
        // Actualizar el plato
        const updatedDish = await backendRequest(`/Dish/${dishId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        console.log('✅ Plato actualizado:', updatedDish);
        showNotification(
            `Plato ${newStatus ? 'activado' : 'desactivado'} exitosamente`, 
            'success'
        );
        
        // Recargar la gestión del menú
        loadMenuManagement();
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    }
};

// Función para editar un plato
window.editDish = async function(dishId) {
    console.log('✏️ Editando plato:', dishId);
    
    try {
        // Obtener datos del plato
        const dish = await backendRequest(`/Dish/${dishId}`);
        
        // Cargar categorías para el select
        let categories = [];
        try {
            categories = await backendRequest('/Category');
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
        }
        
        showDishFormModal(dish, categories);
    } catch (error) {
        console.error('❌ Error cargando plato:', error);
        showNotification('Error al cargar los datos del plato', 'error');
    }
};

// ===== CREAR/EDITAR PLATO =====

// Función para mostrar el modal de crear/editar plato
async function showDishFormModal(dish = null, categories = []) {
    const isEdit = dish !== null;
    const title = isEdit ? 'Editar Plato' : 'Crear Nuevo Plato';
    
    // Si no se pasaron categorías, cargarlas
    if (categories.length === 0) {
        try {
            categories = await backendRequest('/Category');
        } catch (error) {
            console.error('❌ Error cargando categorías:', error);
        }
    }
    
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'dishFormModal';
    modal.style.display = 'flex';
    
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}" ${dish && dish.category?.id === cat.id ? 'selected' : ''}>${cat.name}</option>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal__overlay" onclick="closeDishFormModal()"></div>
        <div class="modal__content dish-form-modal">
            <div class="modal__header">
                <h2>${title}</h2>
                <button class="modal__close" onclick="closeDishFormModal()">&times;</button>
            </div>
            <div class="modal__body">
                <form class="dish-form" id="dishForm">
                    <div class="form-group">
                        <label for="dishName">Nombre del plato *</label>
                        <input type="text" id="dishName" name="name" value="${dish?.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="dishDescription">Descripción</label>
                        <textarea id="dishDescription" name="description" placeholder="Describe el plato...">${dish?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="dishPrice">Precio *</label>
                        <input type="number" id="dishPrice" name="price" value="${dish?.price || ''}" step="0.01" min="0" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="dishCategory">Categoría *</label>
                        <select id="dishCategory" name="category" required>
                            <option value="">Selecciona una categoría</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="dishImage">URL de la imagen</label>
                        <input type="url" id="dishImage" name="image" value="${dish?.image || ''}" placeholder="https://ejemplo.com/imagen.jpg">
                    </div>
                    
                    ${isEdit ? `
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="dishActive" name="isActive" ${dish?.isActive !== false ? 'checked' : ''}>
                            Plato activo (disponible en el menú)
                        </label>
                    </div>
                    ` : ''}
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn--ghost" onclick="closeDishFormModal()">Cancelar</button>
                        <button type="submit" class="btn btn--primary">
                            ${isEdit ? 'Actualizar Plato' : 'Crear Plato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Configurar el formulario
    const form = document.getElementById('dishForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isEdit) {
            updateDish(dish.id);
        } else {
            createDish();
        }
    });
}

// Función para cerrar el modal de formulario
window.closeDishFormModal = function() {
    const modal = document.getElementById('dishFormModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
};

// Función para crear un nuevo plato
async function createDish() {
    console.log('🍽️ Creando nuevo plato...');
    
    const formData = {
        name: document.getElementById('dishName').value,
        description: document.getElementById('dishDescription').value,
        price: parseFloat(document.getElementById('dishPrice').value),
        category: parseInt(document.getElementById('dishCategory').value),
        image: document.getElementById('dishImage').value || null,
        isActive: true
    };
    
    console.log('📤 Datos del plato:', formData);
    // Validaciones en UI
    if (!formData.name || !formData.name.trim()) {
        showNotification('El nombre es obligatorio', 'error');
        document.getElementById('dishName').focus();
        return;
    }
    if (!Number.isFinite(formData.price) || formData.price <= 0) {
        showNotification('El precio debe ser mayor a 0', 'error');
        const priceInput = document.getElementById('dishPrice');
        if (priceInput) priceInput.focus();
        return;
    }
    if (!Number.isInteger(formData.category) || formData.category <= 0) {
        showNotification('Seleccioná una categoría', 'error');
        document.getElementById('dishCategory').focus();
        return;
    }
    
    try {
        const createdDish = await backendRequest('/Dish', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('✅ Plato creado:', createdDish);
        showNotification('Plato creado exitosamente', 'success');
        closeDishFormModal();
        loadMenuManagement();
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        const msg = /400/.test(String(error && error.message)) ? 'Datos inválidos. Verificá nombre, precio y categoría' : 'Error de conexión. Intenta nuevamente.';
        showNotification(msg, 'error');
    }
}

// Función para actualizar un plato existente
async function updateDish(dishId) {
    console.log('✏️ Actualizando plato:', dishId);
    
    const formData = {
        name: document.getElementById('dishName').value,
        description: document.getElementById('dishDescription').value,
        price: parseFloat(document.getElementById('dishPrice').value),
        category: parseInt(document.getElementById('dishCategory').value),
        image: document.getElementById('dishImage').value || null,
        isActive: document.getElementById('dishActive')?.checked !== false
    };
    
    console.log('📤 Datos de actualización:', formData);
    // Validaciones en UI
    if (!formData.name || !formData.name.trim()) {
        showNotification('El nombre es obligatorio', 'error');
        document.getElementById('dishName').focus();
        return;
    }
    if (!Number.isFinite(formData.price) || formData.price <= 0) {
        showNotification('El precio debe ser mayor a 0', 'error');
        const priceInput = document.getElementById('dishPrice');
        if (priceInput) priceInput.focus();
        return;
    }
    if (!Number.isInteger(formData.category) || formData.category <= 0) {
        showNotification('Seleccioná una categoría', 'error');
        document.getElementById('dishCategory').focus();
        return;
    }
    
    try {
        const updatedDish = await backendRequest(`/Dish/${dishId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        console.log('✅ Plato actualizado:', updatedDish);
        showNotification('Plato actualizado exitosamente', 'success');
        closeDishFormModal();
        loadMenuManagement();
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        const msg = /400/.test(String(error && error.message)) ? 'Datos inválidos. Verificá nombre, precio y categoría' : (/409/.test(String(error && error.message)) ? 'Ya existe un plato con ese nombre' : 'Error de conexión. Intenta nuevamente.');
        showNotification(msg, 'error');
    }
}

// ===== HISTORIAL DE ÓRDENES =====

// Función para cargar el historial de órdenes entregadas
async function loadOrderHistory() {
    console.log('📋 Cargando historial de órdenes...');
    const historyPanel = document.getElementById('historyPanel');
    if (!historyPanel) {
        console.error('❌ No se encontró historyPanel');
        return;
    }
    
    // Mostrar indicador de carga
    historyPanel.innerHTML = '<div class="loading">Cargando historial de órdenes...</div>';
    
    try {
        // Obtener parámetros de fecha si existen
        const dateFrom = document.getElementById('historyDateFrom')?.value;
        const dateTo = document.getElementById('historyDateTo')?.value;

        let endpoint = '/Order?status=4'; // Solo órdenes entregadas (estado 4)

        // Validaciones de fechas en UI
        const hasFrom = !!dateFrom;
        const hasTo = !!dateTo;
        if ((hasFrom && !hasTo) || (!hasFrom && hasTo)) {
            showNotification('Debés seleccionar fecha desde y fecha hasta', 'error');
            historyPanel.innerHTML = '<div class="error">Seleccioná fecha desde y hasta</div>';
            return;
        }

        if (hasFrom && hasTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
                showNotification('Formato de fecha inválido', 'error');
                historyPanel.innerHTML = '<div class="error">Formato de fecha inválido</div>';
                return;
            }
            if (fromDate > toDate) {
                showNotification('Rango de fechas inválido: "desde" es mayor que "hasta"', 'error');
                historyPanel.innerHTML = '<div class="error">Rango de fechas inválido</div>';
                return;
            }

            // Agregar filtros convertidos a UTC ISO
            const fromIso = formatDateForBackend(new Date(fromDate.setHours(0,0,0,0)));
            const toIso = formatDateForBackend(new Date(toDate.setHours(23,59,59,999)));
            endpoint += `&from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`;
        }

        console.log('📡 Endpoint del historial:', endpoint);
        
        const orders = await backendRequest(endpoint);
        console.log('✅ Órdenes del historial cargadas:', orders.length);
        renderOrderHistory(orders);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        // Mensajes amistosos según posibles 400 del backend
        const msg = /400/.test(String(error && error.message))
            ? 'Parámetros inválidos en el filtro de fechas'
            : 'No se pudo conectar con el servidor';
        historyPanel.innerHTML = `<div class="error">${msg}</div>`;
    }
}

// Función para renderizar el historial de órdenes
function renderOrderHistory(orders) {
    const historyPanel = document.getElementById('historyPanel');
    const resultsCount = document.getElementById('historyResultsCount');
    
    if (!historyPanel) return;
    
    // Actualizar contador
    if (resultsCount) {
        resultsCount.textContent = `${orders.length} órdenes entregadas`;
    }
    
    historyPanel.innerHTML = '';
    
    if (orders.length === 0) {
        historyPanel.innerHTML = `
            <div class="empty-dishes">
                <div class="empty-dishes__content">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 12h8"></path>
                    </svg>
                    <h3>No hay órdenes entregadas</h3>
                    <p>No se encontraron órdenes entregadas en el período seleccionado.</p>
                </div>
            </div>
        `;
        return;
    }
    
    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        const orderId = order.orderNumber || order.id;
        const totalAmount = order.totalAmount || 0;
        const deliveryType = order.deliveryType?.name || 'Desconocido';
        const createdAt = formatDateForDisplay(order.createdAt || order.createDate);
        
        card.innerHTML = `
            <div class="history-header">
                <h3 class="history-order-number">Orden #${orderId}</h3>
                <span class="history-delivery-type">${deliveryType}</span>
            </div>
            
            <div class="history-details">
                <div class="history-detail">
                    <span class="history-detail-label">Total</span>
                    <span class="history-detail-value price">$${totalAmount}</span>
                </div>
                <div class="history-detail">
                    <span class="history-detail-label">Fecha de entrega</span>
                    <span class="history-detail-value">${createdAt}</span>
                </div>
                <div class="history-detail">
                    <span class="history-detail-label">Estado</span>
                    <span class="history-detail-value">Entregado</span>
                </div>
            </div>
            
            <div class="history-actions">
                <button class="btn btn--view-detail" onclick="viewOrderDetails('${orderId}')">
                    Ver Detalle
                </button>
            </div>
        `;
        
        historyPanel.appendChild(card);
    });
}

// Configurar event listeners para el historial
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Configurando event listeners del panel de administración...');
    
    // Botón de agregar plato
    const addDishBtn = document.getElementById('addDishBtn');
    if (addDishBtn) {
        console.log('✅ Configurando botón de agregar plato');
        addDishBtn.addEventListener('click', () => {
            console.log('🍽️ Botón agregar plato clickeado');
            showDishFormModal();
        });
    } else {
        console.log('❌ No se encontró el botón addDishBtn');
    }
    
    // Filtros del historial
    const filterHistoryBtn = document.getElementById('filterHistoryBtn');
    if (filterHistoryBtn) {
        console.log('✅ Configurando botón de filtrar historial');
        filterHistoryBtn.addEventListener('click', loadOrderHistory);
    }
    
    const refreshHistoryBtn = document.getElementById('refreshHistory');
    if (refreshHistoryBtn) {
        console.log('✅ Configurando botón de actualizar historial');
        refreshHistoryBtn.addEventListener('click', loadOrderHistory);
    }
    
    // Establecer fecha por defecto (hoy)
    const today = new Date().toISOString().split('T')[0];
    const historyDateTo = document.getElementById('historyDateTo');
    if (historyDateTo && !historyDateTo.value) {
        historyDateTo.value = today;
    }
    
    console.log('✅ Event listeners del panel de administración configurados');
    
});
