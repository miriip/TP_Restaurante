using Application.Interfaces.ICategory;
using Application.Interfaces.IDeliveryType;
using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Interfaces.IOrderItem;
using Application.Interfaces.IStatus;
using Application.Services;
using Application.Services.StatusServices;
using Asp.Versioning;
using Infrastructure.Command;
using Infrastructure.Data;
using Infrastructure.Querys;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using TPindv_Proyecto_Guerra.Middleware;
using TPindv_Proyecto_Guerra.Swagger;
using TPindv_Proyecto_Guerra.Converters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configurar EF Core con SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// INJECTIONS
// Dish interfaces
builder.Services.AddScoped<Application.Interfaces.IDish.IDishCommand, Infrastructure.Command.DishCommand>();
builder.Services.AddScoped<Application.Interfaces.IDish.IDishQuery, Infrastructure.Querys.DishQuery>();

// Category interfaces
builder.Services.AddScoped<Application.Interfaces.ICategory.ICategoryCommand, Infrastructure.Command.CategoryCommand>();
builder.Services.AddScoped<Application.Interfaces.ICategory.ICategoryQuery, Infrastructure.Querys.CategoryQuery>();

// Status interfaces
builder.Services.AddScoped<Application.Interfaces.IStatus.IStatusCommand, Infrastructure.Command.StatusCommand>();
builder.Services.AddScoped<Application.Interfaces.IStatus.IStatusQuery, Infrastructure.Querys.StatusQuery>();

// DeliveryType interfaces
builder.Services.AddScoped<Application.Interfaces.IDeliveryType.IDeliveryTypeCommand, Infrastructure.Command.DeliveryTypeCommand>();
builder.Services.AddScoped<Application.Interfaces.IDeliveryType.IDeliveryTypeQuery, Infrastructure.Querys.DeliveryTypeQuery>();

// Order interfaces
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderCommand, Infrastructure.Command.OrderCommand>();
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderQuery, Infrastructure.Querys.OrderQuery>();

// OrderItem interfaces
builder.Services.AddScoped<Application.Interfaces.IOrderItem.IOrderItemCommand, Infrastructure.Command.OrderItemCommand>();
builder.Services.AddScoped<Application.Interfaces.IOrderItem.IOrderItemQuery, Infrastructure.Querys.OrderItemQuery>();

// Servicios especializados
builder.Services.AddScoped<Application.Services.DishServices.DishCreationService>();
builder.Services.AddScoped<Application.Services.DishServices.DishSearchService>();
builder.Services.AddScoped<Application.Services.DishServices.DishUpdateService>();
builder.Services.AddScoped<Application.Services.DishServices.DishDeleteService>();

// Servicios de Dish con interfaces específicas
builder.Services.AddScoped<Application.Interfaces.IDish.ICreateDishService, Application.Services.DishServices.DishCreationService>();
builder.Services.AddScoped<Application.Interfaces.IDish.ISearchDishesService, Application.Services.DishServices.DishSearchService>();
builder.Services.AddScoped<Application.Interfaces.IDish.IUpdateDishService, Application.Services.DishServices.DishUpdateService>();
builder.Services.AddScoped<Application.Interfaces.IDish.IDeleteDishService, Application.Services.DishServices.DishDeleteService>();

// Servicios de órdenes (nombres descriptivos)
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderCreationService, Application.Services.OrderServices.OrderCreationService>();
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderListService, Application.Services.OrderServices.OrderListService>();
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderDetailsService, Application.Services.OrderServices.OrderDetailsService>();
builder.Services.AddScoped<Application.Interfaces.IOrder.IOrderUpdateService, Application.Services.OrderServices.OrderUpdateService>();

// Servicios de OrderItem
builder.Services.AddScoped<Application.Interfaces.IOrderItem.IOrderItemStatusUpdateService, Application.Services.OrderItemServices.OrderItemStatusUpdateService>();

// Servicios de catálogos
builder.Services.AddScoped<Application.Interfaces.ICategory.ICategoryListService, Application.Services.CategoryServices.CategoryListService>();
builder.Services.AddScoped<Application.Interfaces.IDeliveryType.IDeliveryTypeListService, Application.Services.DeliveryTypeServices.DeliveryTypeListService>();
builder.Services.AddScoped<Application.Interfaces.IStatus.IStatusListService, Application.Services.StatusServices.StatusListService>();

// Controllers y JSON
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        // Formato de fecha compatible con la API del profesor
        options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());
    });

// Versionado de API
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Restaurant API",
        Version = "1.0",
        Description = "API para la gestión de platos en un restaurante",
        Contact = new OpenApiContact
        {
            Name = "Restaurant API Support",
            Email = "lolivera@unaj.edu.ar"
        }
    });

    // Incluir comentarios XML si existen
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    c.OperationFilter<ExamplesOperationFilter>();
});

// CORS para permitir el front en cualquier puerto
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:3000", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(origin => true); // Permitir cualquier origen
    });
});

var app = builder.Build();

// Swagger en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Restaurant API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Restaurant API - Documentación";
    });
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Middleware de excepciones
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Aplicar CORS antes de MapControllers
app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();