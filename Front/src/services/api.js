/**
 * API Service
 * Centraliza todas las llamadas al backend
 */
const baseURL = 'http://localhost:5069/api/v1';

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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
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
            method: 'PUT',
            body: JSON.stringify(orderData)
        });
    }

    async updateOrderStatus(orderId, statusId) {
        return this.request(`/Order/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ statusId })
        });
    }

    async updateOrderItemStatus(orderId, itemId, data) {
        return this.request(`/Order/${orderId}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
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
}

export const api = new ApiService();
export { baseURL };