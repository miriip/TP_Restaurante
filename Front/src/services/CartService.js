/**
 * Cart Service
 * Maneja la lógica del carrito de compras
 */
import { storage } from '../utils/utils.js';

class CartService {
    constructor() {
        this.cartKey = 'cart';
        this.cart = this.loadCart();
        this.listeners = [];
    }

    loadCart() {
        return storage.get(this.cartKey, []);
    }

    saveCart() {
        storage.set(this.cartKey, this.cart);
        this.notifyListeners();
    }

    addItem(dish, quantity = 1) {
        const existingItem = this.cart.find(item => item.dish.id === dish.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: Date.now(),
                dish,
                quantity,
                notes: ''
            });
        }
        
        this.saveCart();
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    updateNotes(itemId, notes) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.notes = notes;
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.dish.price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => {
            listener(this.cart);
        });
    }
}

export const cartService = new CartService();
