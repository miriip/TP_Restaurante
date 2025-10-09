TP3 Frontend - TP_GUERRA_MIRANDA_com2

Cómo correr
1. Abrí index.html directamente en el navegador, o serví la carpeta con un server estático.
2. Configurá la URL de la API: en el navegador, abrí la consola y ejecutá:
   localStorage.setItem('apiBaseURL', 'http://localhost:5228');
   Recargá la página. Alternativamente, editá js/api.js y cambiá baseURL por defecto.

Agregar platos a una orden existente
- En "Mis Órdenes", presioná "Agregar platos" en la orden deseada.
- Serás enviado al Menú; agregá platos a la comanda y luego confirmá en "Mi comanda".
- El sistema agregará esos ítems a la orden activa en lugar de crear una nueva.

Estructura
- index.html: contenedor de vistas (Menú, Detalle, Comanda, Mis Órdenes, Panel).
- css/styles.css: estilos base, paleta, layout responsive.
- js/api.js: helpers de fetch a la API del TP2.
- js/router.js: enrutado por hash (#menu, #comanda, etc.).
- js/menu.js: carga categorías y platos, búsqueda y filtros.
- js/dish-detail.js: detalle de plato y agregado a comanda.
- js/cart.js: comanda, selector de entrega y confirmación.
- js/orders.js: listado de órdenes del usuario.
- js/admin-panel.js: panel para cambiar estado de órdenes.
- assets/: logo e imágenes placeholder.

Notas
- El panel se actualiza por polling cada ~7s.
- Se usa localStorage para userId y cart.
- Asegurate de que los endpoints de tu backend coincidan con los usados en js/api.js.
- Tipografía: Playfair Display (títulos) + Inter (texto) via Google Fonts.
- Paleta: Vino (#8B0000), Beige (#D4A373), Dorado (#C89D3D), Fondo (#F5F5F5), Texto (#2E2E2E).


