/**
 * API Service
 * Centraliza todas las llamadas al backend
 */
const baseURL = 'http://localhost:5000/api/v1';

class ApiService {
    constructor() {
        this.baseURL = baseURL;
    }

    // Generic HTTP methods
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const isNoContent = response.status === 204;
            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                let message = `HTTP ${response.status}`;
                try {
                    if (!isNoContent && contentType.includes('application/json')) {
                        const err = await response.json();
                        if (err && err.message) message = err.message;
                    } else {
                        const text = await response.text();
                        if (text) message = text;
                    }
                } catch {}
                const error = new Error(message);
                error.status = response.status;
                throw error;
            }

            if (isNoContent) return true;
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Dish endpoints
    async getAllDishes(params = '') {
        return this.request(`/Dish${params ? '?' + params : ''}`);
    }

    async getDishById(id) {
        return this.request(`/Dish/${id}`);
    }

    // Category endpoints
    async getAllCategories() {
        return this.request('/Category');
    }

    async getCategoryById(id) {
        return this.request(`/Category/${id}`);
    }

    // Order endpoints
    async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/Order${queryString ? '?' + queryString : ''}`);
    }

    async getOrderById(id) {
        return this.request(`/Order/${id}`);
    }

    async getOrdersByUser(userId) {
        return this.request(`/Order/user/${userId}`);
    }

    async createOrder(orderData) {
        return this.request('/Order', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrder(id, orderData) {
        return this.request(`/Order/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(orderData)
        });
    }

    // Deprecated: el backend no expone update de estado general; usar updateOrderItemStatus

    async updateOrderItemStatus(orderId, itemId, status) {
        return this.request(`/Order/${orderId}/item/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // Status endpoints
    async getAllStatuses() {
        return this.request('/Status');
    }

    // Delivery Type endpoints
    async getAllDeliveryTypes() {
        return this.request('/DeliveryType');
    }

    // Dish management endpoints
    async createDish(dishData) {
        return this.request('/Dish', {
            method: 'POST',
            body: JSON.stringify(dishData)
        });
    }

    async updateDish(id, dishData) {
        return this.request(`/Dish/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dishData)
        });
    }

    async deleteDish(id) {
        return this.request(`/Dish/${id}`, { method: 'DELETE' });
    }

    async getDishesWithFilters(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/Dish${queryString ? '?' + queryString : ''}`);
    }

    // Order history endpoints
    async getOrderHistory(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/Order${queryString ? '?' + queryString : ''}`);
    }

    async getDeliveredOrders(dateFrom = null, dateTo = null) {
        let params = { status: 4 }; // Estado 4 = Entregado
        
        if (dateFrom) {
            params.from = `${dateFrom}T00:00:00`;
        }
        if (dateTo) {
            params.to = `${dateTo}T23:59:59`;
        }
        
        return this.getOrderHistory(params);
    }
}

export const api = new ApiService();
export { baseURL };