const views = ['welcome', 'menu', 'detalle-plato', 'comanda', 'mis-ordenes', 'panel-ordenes'];

function showView(id) {
    for (const v of views) {
        const el = document.getElementById(v);
        if (!el) continue;
        el.classList.toggle('hidden', v !== id);
    }
    
    // Ocultar/mostrar header según la vista
    const header = document.querySelector('.header');
    if (header) {
        header.style.display = id === 'welcome' ? 'none' : 'block';
    }
    
    // highlight active nav
    const links = document.querySelectorAll('.nav__link');
    links.forEach(a => {
        const href = (a.getAttribute('href')||'').replace('#','');
        const base = href.split('/')[0];
        a.classList.toggle('nav__link--active', base === id);
    });
}

function handleRoute() {
    const hash = location.hash.replace('#', '') || 'welcome';
    const [view] = hash.split('/');
    if (!views.includes(view)) return showView('welcome');
    showView(view);
    // Control de rol: ocultar Panel si es cliente
    const role = (typeof localStorage !== 'undefined') ? (localStorage.getItem('role') || 'client') : 'client';
    const panelLink = document.getElementById('panelLink');
    if (panelLink) panelLink.classList.toggle('hidden', role !== 'staff');
    // Actualizar etiqueta del toggle
    const roleLabel = document.getElementById('roleLabel');
    const roleToggle = document.getElementById('roleToggle');
    if (roleLabel) roleLabel.textContent = role === 'staff' ? 'Rol: Personal' : 'Rol: Cliente';
    if (roleToggle) roleToggle.checked = (role === 'staff');
}

// Welcome page functionality
function initWelcomePage() {
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            location.hash = '#menu';
        });
    }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
    // simple userId for demo persistence
    if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', `u_${crypto.randomUUID?.() || Date.now()}`);
    }
    // init role
    if (!localStorage.getItem('role')) localStorage.setItem('role', 'client');
    const roleToggle = document.getElementById('roleToggle');
    if (roleToggle) {
        roleToggle.addEventListener('change', () => {
            localStorage.setItem('role', roleToggle.checked ? 'staff' : 'client');
            handleRoute();
        });
    }
    initWelcomePage();
    handleRoute();
});

export { showView };


