/**
 * Dish Card Template
 * Template para las tarjetas de platos
 */
export default function dishCardTemplate(dish) {
    return `
        <div class="card" data-dish-id="${dish.id}">
            <div class="card__image">
                <img src="${dish.image || './assets/placeholder-dish.jpg'}" 
                     alt="${dish.name}" 
                     loading="lazy" />
            </div>
            <div class="card__content">
                <h3 class="card__title">${dish.name}</h3>
                <p class="card__description">${dish.description || ''}</p>
                <div class="card__footer">
                    <span class="card__price">$${dish.price}</span>
                    <button class="btn btn--primary add-to-cart-btn" 
                            data-dish-id="${dish.id}">
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
}
