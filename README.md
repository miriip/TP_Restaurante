# 🍽️ Restaurant Management System API

Una API REST moderna para la gestión de menús y pedidos de restaurante, desarrollada con .NET 8 y Clean Architecture.

## 🚀 Características

- **Clean Architecture**: Separación clara de responsabilidades en capas
- **Entity Framework Core**: ORM para gestión de base de datos
- **SQL Server**: Base de datos robusta y escalable
- **Swagger/OpenAPI**: Documentación automática de la API
- **Middleware personalizado**: Manejo centralizado de excepciones
- **Dependency Injection**: Inyección de dependencias nativa de .NET

## 🏗️ Arquitectura del Proyecto

```
TPRestaurante_Proyecto/
├── Domain/                     # Entidades y lógica de negocio
│   ├── Entities/              # Modelos de dominio
│   └── Exceptions/            # Excepciones personalizadas
│
├── Application/               # Casos de uso y capa de aplicación
│   ├── Interfaces/            # Contratos de servicios
│   ├── Models/               # Modelos de transferencia de datos (DTOs)
│   │   ├── Request/          # Modelos para recibir datos
│   │   └── Response/         # Modelos para enviar datos
│   ├── Enums/                # Enumeraciones globales
│   ├── Exceptions/           # Manejo de excepciones propias
│   └── Services/             # Implementación de la lógica de aplicación
│
├── Infrastructure/            # Persistencia y acceso a datos
│   ├── Data/                 # DbContext y configuración de base de datos
│   ├── Command/              # Comandos de escritura (Create, Update, Delete)
│   ├── Querys/               # Consultas de lectura
│   ├── Migrations/           # Migraciones de EF Core
│   └── Dependencies/         # Inyecciones de dependencias
│
├── TPRestaurante_Proyecto/    # API Web principal
│   ├── Controllers/          # Controladores REST
│   ├── Middleware/           # Middleware personalizado
│   ├── Swagger/              # Configuración y documentación de la API
│   ├── appsettings.json      # Configuración de la aplicación
│   └── Program.cs            # Punto de entrada principal
```

## 📋 Entidades del Dominio

### 🍽️ Dish (Plato)
- Gestión completa de platos del menú
- Categorización automática
- Control de disponibilidad
- Precios con precisión decimal

### 📦 Order (Pedido)
- Sistema de pedidos completo
- Múltiples tipos de entrega (Delivery, Take away, Dine in)
- Seguimiento de estado en tiempo real
- Cálculo automático de totales

### 🏷️ Category (Categoría)
- Organización jerárquica del menú
- Categorías predefinidas: Entradas, Ensaladas, Minutas, Pastas, Parrilla, Pizzas, Sandwiches, Bebidas, Cerveza Artesanal, Postres

## 🛠️ Tecnologías Utilizadas

- **.NET 8**: Framework de desarrollo
- **Entity Framework Core 8.0.19**: ORM
- **SQL Server**: Base de datos
- **Swagger/OpenAPI**: Documentación
- **ASP.NET Core**: Framework web

## 🚀 Instalación y Configuración

### Prerrequisitos
- .NET 8 SDK
- SQL Server (LocalDB o instancia completa)
- Visual Studio 2022 o VS Code

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/miriip/TP_Restaurante.git
   cd TP_Restaurante
   ```

2. **Configurar la base de datos**
   - Asegúrate de que SQL Server esté ejecutándose
   - Actualiza la cadena de conexión en `appsettings.json` si es necesario

3. **Ejecutar migraciones**
   ```bash
   cd TPindv-Proyecto-Guerra
   dotnet ef database update --project ../Infrastructure --startup-project .
   ```

4. **Ejecutar la aplicación**
   ```bash
   dotnet run
   ```

5. **Acceder a la documentación**
   - Swagger UI: `https://localhost:7000/swagger`
   - API Base: `https://localhost:7000/api`



### Configuración
- **Servidor**: localhost,1433
- **Base de datos**: MenuDigital
- **Autenticación**: SQL Server Authentication

### Tablas principales
- `Dish` - Platos del menú
- `Category` - Categorías de platos
- `Order` - Pedidos
- `OrderItem` - Items de pedidos
- `Status` - Estados de pedidos
- `DeliveryType` - Tipos de entrega

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Guerra Miranda** - *Desarrollo inicial* - [GitHub](https://github.com/miriip)

## 📞 Contacto

- Email: guerra.mirandauni@gmail.com
- Proyecto: [https://github.com/miriip/TP_Restaurante](https://github.com/miriip/TP_Restaurante)

---

⭐ ¡No olvides darle una estrella al proyecto si te resulta útil!
