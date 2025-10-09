/**
 * Utility Functions
 * Funciones de utilidad reutilizables
 */

/**
 * Crea un elemento HTML con clases y contenido
 * @param {string} tag - Tag HTML
 * @param {string} className - Clases CSS
 * @param {string} content - Contenido del elemento
 * @returns {HTMLElement}
 */
export function createEl(tag, className = '', content = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content) el.textContent = content;
    return el;
}

/**
 * Muestra un toast notification
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, error, info)
 */
export function toast(message, type = 'info') {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.className = `toast toast--${type}`;
    toastEl.classList.remove('hidden');

    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

/**
 * Formatea un precio como moneda
 * @param {number} price - Precio a formatear
 * @returns {string}
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
}

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha a formatear
 * @returns {string}
 */
export function formatDate(date) {
    return new Date(date).toLocaleString('es-AR');
}

/**
 * Debounce function para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Genera un ID único
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Local Storage helpers
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }
};
