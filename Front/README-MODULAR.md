# Arquitectura Modular - Rosso & Oro Frontend

## 🏗️ Estructura del Proyecto

```
Front/
├── src/
│   ├── components/          # Componentes UI reutilizables
│   │   ├── Header/
│   │   │   ├── Header.html
│   │   │   └── Header.js
│   │   ├── Welcome/
│   │   │   ├── Welcome.html
│   │   │   └── Welcome.js
│   │   ├── Menu/
│   │   │   ├── Menu.html
│   │   │   └── Menu.js
│   │   ├── Cart/
│   │   │   ├── Cart.html
│   │   │   └── Cart.js
│   │   ├── Orders/
│   │   │   ├── Orders.html
│   │   │   └── Orders.js
│   │   └── AdminPanel/
│   │       ├── AdminPanel.html
│   │       └── AdminPanel.js
│   ├── services/            # Servicios de negocio
│   │   ├── api.js          # API calls
│   │   └── CartService.js  # Lógica del carrito
│   ├── templates/           # Templates dinámicos
│   │   ├── TemplateEngine.js
│   │   ├── DishCard.js
│   │   └── OrderCard.js
│   ├── utils/              # Utilidades
│   │   └── utils.js
│   ├── router/             # Navegación
│   │   └── Router.js
│   └── app.js              # Punto de entrada
├── index.html              # Versión original
├── index-modular.html      # Versión modular
├── package.json
└── vite.config.js
```

## 🚀 Beneficios de la Arquitectura Modular

### 1. **Separación de Responsabilidades**
- Cada componente maneja su propia lógica
- Servicios centralizados para operaciones de negocio
- Templates reutilizables para elementos dinámicos

### 2. **Mantenibilidad**
- Código organizado por funcionalidad
- Fácil localización de bugs
- Testing individual por componente

### 3. **Escalabilidad**
- Nuevos componentes sin afectar existentes
- Reutilización de código
- Fácil integración de nuevas funcionalidades

### 4. **Colaboración en Equipo**
- Múltiples desarrolladores pueden trabajar en paralelo
- Conflictos de merge reducidos
- Código más legible y documentado

## 🛠️ Cómo Usar

### Desarrollo
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Servidor simple (alternativo)
npm run serve
```

### Build para Producción
```bash
npm run build
```

## 📦 Componentes

### Header Component
- **Responsabilidad**: Navegación y toggle de roles
- **Métodos**: `toggleRole()`, `setupNavigation()`

### Menu Component  
- **Responsabilidad**: Mostrar y filtrar platos
- **Métodos**: `loadDishes()`, `filterDishes()`, `sortDishes()`

### Cart Component
- **Responsabilidad**: Gestión del carrito
- **Métodos**: `addItem()`, `removeItem()`, `updateQuantity()`

## 🔧 Servicios

### API Service
- Centraliza todas las llamadas al backend
- Manejo de errores consistente
- Configuración centralizada de URLs

### Cart Service
- Estado del carrito persistente
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

## 📋 Próximos Pasos

1. **Testing**: Implementar tests unitarios para cada componente
2. **State Management**: Integrar un store global (Redux/Zustand)
3. **Performance**: Lazy loading y code splitting
4. **PWA**: Service workers y offline support
5. **TypeScript**: Migración gradual a TypeScript

## 🏢 Patrones Empresariales Implementados

- **Component-Based Architecture**: Como React/Vue
- **Service Layer Pattern**: Separación de lógica de negocio
- **Template Engine**: Como Handlebars/Mustache
- **Event-Driven Architecture**: Comunicación entre componentes
- **Dependency Injection**: Servicios inyectados
- **Observer Pattern**: Event listeners y subscriptions

Esta arquitectura sigue las mejores prácticas de la industria y facilita el mantenimiento y escalabilidad del proyecto.
