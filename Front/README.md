# Rosso & Oro - Frontend Modular

## 🏗️ Estructura del Proyecto

```
Front/
├── src/                          # Código fuente modular
│   ├── components/               # Componentes UI reutilizables
│   │   ├── Header/              # Navegación y toggle de roles
│   │   ├── Welcome/             # Página de bienvenida
│   │   ├── Menu/                # Catálogo de platos
│   │   ├── Cart/                # Carrito de compras
│   │   ├── Orders/              # Órdenes del usuario
│   │   └── AdminPanel/          # Panel de administración
│   ├── services/                # Servicios de negocio
│   │   ├── api.js              # Llamadas a la API
│   │   └── CartService.js      # Lógica del carrito
│   ├── templates/               # Templates dinámicos
│   │   ├── DishCard.js         # Tarjeta de plato
│   │   ├── OrderCard.js        # Tarjeta de orden
│   │   └── TemplateEngine.js   # Motor de templates
│   ├── router/                  # Navegación
│   │   └── Router.js           # Router principal
│   ├── utils/                   # Utilidades
│   │   └── utils.js            # Funciones auxiliares
│   └── app.js                   # Punto de entrada
├── css/                         # Estilos
│   └── styles.css              # Estilos principales
├── assets/                      # Recursos estáticos
│   ├── logo.svg                # Logo de la empresa
│   └── damask-pattern.webp.jpg # Patrón de fondo
├── index.html                   # Página principal
├── package.json                 # Dependencias
└── vite.config.js              # Configuración de Vite
```

## 🚀 Cómo ejecutar

### Desarrollo
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con Vite
npm run dev

# Servidor simple (alternativo)
npm run serve
```

### Producción
```bash
# Build para producción
npm run build
```

## 🎯 Características

- **Arquitectura Modular**: Componentes separados y reutilizables
- **Routing**: Navegación por hash (#menu, #comanda, etc.)
- **Estado Persistente**: Carrito guardado en localStorage
- **Responsive Design**: Adaptable a diferentes dispositivos
- **API Integration**: Comunicación con backend REST

## 📦 Componentes

### Header
- Navegación principal
- Toggle de roles (Cliente/Admin)
- Logo y branding

### Menu
- Catálogo de platos
- Filtros y búsqueda
- Agregar al carrito

### Cart
- Gestión del carrito
- Tipos de entrega
- Confirmación de pedidos

### Orders
- Historial de órdenes
- Estados de pedidos
- Agregar más platos

### AdminPanel
- Gestión de órdenes
- Cambio de estados
- Filtros por estado

## 🔧 Servicios

### API Service
- Centraliza llamadas al backend
- Manejo de errores
- Configuración de URLs

### Cart Service
- Estado del carrito
- Eventos de cambio
- Cálculos de totales

## 🎨 Templates

### Template Engine
- Sistema de templates dinámicos
- Registro de templates personalizados
- Renderizado eficiente

## 🧭 Router

### Navegación
- Hash-based routing
- Lazy loading de componentes
- Gestión de estado de navegación

## 🔄 Flujo de Datos

```
User Action → Component → Service → API → Backend
                ↓
            State Update → Template → UI Update
```

## 🏢 Patrones Empresariales

- **Component-Based Architecture**: Como React/Vue
- **Service Layer Pattern**: Separación de lógica de negocio
- **Template Engine**: Como Handlebars/Mustache
- **Event-Driven Architecture**: Comunicación entre componentes
- **Dependency Injection**: Servicios inyectados
- **Observer Pattern**: Event listeners y subscriptions

## 📋 Configuración

### API Base URL
```javascript
// En src/services/api.js
const baseURL = 'http://localhost:7069/api/v1';
```

### LocalStorage Keys
- `cart`: Carrito de compras
- `userId`: ID del usuario
- `activeOrderId`: Orden activa para agregar platos

## 🎨 Estilos

- **Tipografía**: Playfair Display (títulos) + Inter (texto)
- **Paleta**: Vino (#8B0000), Beige (#D4A373), Dorado (#C89D3D)
- **Responsive**: Mobile-first design
- **Animaciones**: Transiciones suaves

## 🚀 Próximos Pasos

1. **Testing**: Tests unitarios para cada componente
2. **State Management**: Store global (Redux/Zustand)
3. **Performance**: Lazy loading y code splitting
4. **PWA**: Service workers y offline support
5. **TypeScript**: Migración gradual a TypeScript

Esta arquitectura sigue las mejores prácticas de la industria y facilita el mantenimiento y escalabilidad del proyecto.