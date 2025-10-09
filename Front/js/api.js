export const baseURL = localStorage.getItem('apiBaseURL') || 'http://localhost:7069';

// Exportar baseURL para uso en otros módulos
export { baseURL as apiBaseURL };

async function request(path, options = {}) {
	const url = `${baseURL}${path}`;
	console.log('Making request to:', url);
	const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
	const res = await fetch(url, { ...options, headers });
	console.log('Response status:', res.status);
	if (!res.ok) {
        // Intentar leer JSON de error para extraer Message
        let message = `Error ${res.status}`;
        let status = res.status;
        try {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                const j = await res.json();
                const m = (j && (j.Message || j.message || j.error || j.title));
                if (m) message = String(m);
                else message = JSON.stringify(j);
            } else {
                const text = await res.text();
                message = text || message;
            }
        } catch (_) {
            // fallback
        }
        const err = new Error(message);
        // @ts-ignore attach status for consumers
        err.status = status;
        throw err;
	}
	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) return res.json();
	return res.text();
}

function mapDish(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    // Backend properties (camelCased by ASP.NET): id, name, description, price, image, isActive, category
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description,
        price: raw.price,
        imageUrl: raw.image || raw.imageUrl,
        isAvailable: (typeof raw.isActive !== 'undefined' ? raw.isActive : raw.isAvailable),
        categoryId: (raw.category && typeof raw.category.id !== 'undefined') ? raw.category.id : raw.categoryId
    };
}

export const api = {
	// Categories
	getCategories: () => request('/api/v1/Category'),

	// Dishes
	getDishes: async (params = {}) => {
		// Accepts object, string (query), or URLSearchParams
		let qs = '';
		if (typeof params === 'string') {
			qs = params.trim();
		} else if (params instanceof URLSearchParams) {
			qs = params.toString();
		} else if (params && typeof params === 'object') {
			const query = new URLSearchParams();
			if (params.name) query.set('name', params.name);
			if (params.category != null) query.set('category', params.category);
			if (params.sortByPrice) query.set('sortByPrice', params.sortByPrice); // 'ascendente' | 'descendente'
			if (params.onlyActive != null) query.set('onlyActive', String(params.onlyActive));
			qs = query.toString();
		}
		const data = await request(`/api/v1/Dish${qs ? `?${qs}` : ''}`);
		return Array.isArray(data) ? data.map(mapDish) : data;
	},
	getDishById: async (id) => {
		const d = await request(`/api/v1/Dish/${id}`);
		return mapDish(d);
	},

	// Delivery types and Status
	getDeliveryTypes: () => request('/api/v1/DeliveryType'),
	getStatuses: () => request('/api/v1/Status'),

	// Orders
	createOrder: (payload) => request('/api/v1/Order', { method: 'POST', body: JSON.stringify(payload) }),
	getAllOrders: (filters = {}) => {
		// filters: { from, to, status }
		const query = new URLSearchParams();
		if (filters.from) query.set('from', filters.from); // ISO string o compatible con tu converter
		if (filters.to) query.set('to', filters.to);
		if (filters.status != null) query.set('status', String(filters.status));
		const qs = query.toString();
		return request(`/api/v1/Order${qs ? `?${qs}` : ''}`);
	},
	getOrderById: (id) => request(`/api/v1/Order/${id}`),
	updateOrder: (id, payload) => request(`/api/v1/Order/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    updateOrderItemStatus: (orderId, itemId, payload) => {
        // Backend espera { Status: number }
        const body = { Status: payload.statusId ?? payload.Status ?? payload.status ?? payload.id ?? payload.value };
        return request(`/api/v1/Order/${orderId}/item/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) });
    },
	// Extra helpers used by UI
	getOrdersByUser: async (userId) => {
		const all = await request('/api/v1/Order');
		return (Array.isArray(all) ? all : []).filter(o => String(o.userId || '') === String(userId));
	},
	updateOrderStatus: (orderId, statusId) => request(`/api/v1/Order/${orderId}`, { method: 'PUT', body: JSON.stringify({ statusId }) }),
    addItemsToOrder: (orderId, items) => {
        // Map items to backend Items model: { id: Guid, quantity, notes }
        const list = Array.isArray(items) ? items : [];
        const mapped = list.map(function(i){
            const id = (i && typeof i.dishId !== 'undefined') ? i.dishId : (i ? i.id : undefined);
            const quantity = (i && typeof i.quantity !== 'undefined') ? i.quantity : 1;
            const notes = (i && typeof i.note !== 'undefined' && i.note !== null && i.note !== '') ? i.note : ((i && typeof i.notes !== 'undefined') ? i.notes : '');
            return { id: id, quantity: quantity, notes: notes };
        });
        return request(`/api/v1/Order/${orderId}`, { method: 'PUT', body: JSON.stringify({ items: mapped }) });
    },
};


