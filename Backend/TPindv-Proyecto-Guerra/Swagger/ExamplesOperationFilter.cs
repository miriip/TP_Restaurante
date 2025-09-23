using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace TPindv_Proyecto_Guerra.Swagger
{
    public class ExamplesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.Responses == null || operation.Responses.Count == 0)
            {
                return;
            }

            var path = context.ApiDescription.RelativePath?.ToLowerInvariant() ?? string.Empty;
            var method = context.ApiDescription.HttpMethod?.ToUpperInvariant() ?? string.Empty;
            var methodName = context.MethodInfo.Name;

            // Ejemplos para Dish endpoints
            if (methodName == "CreateDish")
            {
                AddDishCreateExamples(operation);
            }
            else if (methodName == "Search")
            {
                AddDishSearchExamples(operation);
            }
            else if (methodName == "GetDishById")
            {
                AddDishGetByIdExamples(operation);
            }
            else if (methodName == "UpdateDish")
            {
                AddDishUpdateExamples(operation);
            }
            else if (methodName == "DeleteDish")
            {
                AddDishDeleteExamples(operation);
            }
            // Ejemplos para Order endpoints
            else if (methodName == "CreateOrder")
            {
                AddOrderCreateExamples(operation);
                AddOrderCreateRequestExamples(operation);
            }
            else if (methodName == "SearchOrders")
            {
                AddOrderSearchExamples(operation);
            }
            else if (methodName == "GetOrderById")
            {
                AddOrderGetByIdExamples(operation);
            }
            else if (methodName == "UpdateOrder")
            {
                AddOrderUpdateExamples(operation);
                AddOrderUpdateRequestExamples(operation);
            }
            else if (methodName == "UpdateOrderItemStatus")
            {
                AddOrderItemUpdateExamples(operation);
            }
        }

        private void AddDishCreateExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["invalid_price"] = new OpenApiExample
                    {
                        Summary = "Precio inválido",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El precio debe ser mayor a cero")
                        }
                    },
                    ["empty_name"] = new OpenApiExample
                    {
                        Summary = "Nombre vacío",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El nombre del plato es obligatorio")
                        }
                    }
                };
            }

            if (operation.Responses.ContainsKey("409"))
            {
                operation.Responses["409"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Ya existe un plato con ese nombre")
                };
            }
        }

        private void AddDishSearchExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Parámetros de ordenamiento inválidos")
                };
            }
        }

        private void AddDishGetByIdExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Formato de ID inválido")
                };
            }

            if (operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Plato no encontrado")
                };
            }
        }

        private void AddDishUpdateExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("El precio debe ser mayor a cero")
                };
            }

            if (operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Plato no encontrado")
                };
            }

            if (operation.Responses.ContainsKey("409"))
            {
                operation.Responses["409"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Ya existe un plato con ese nombre")
                };
            }
        }

        private void AddDishDeleteExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Plato no encontrado")
                };
            }

            if (operation.Responses.ContainsKey("409"))
            {
                operation.Responses["409"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("No se puede eliminar el plato porque está incluido en órdenes activas")
                };
            }
        }

        private void AddOrderCreateExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["invalid_dish"] = new OpenApiExample
                    {
                        Summary = "Plato no válido",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El plato especificado no existe o no está disponible")
                        }
                    },
                    ["invalid_quantity"] = new OpenApiExample
                    {
                        Summary = "Cantidad inválida",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("La cantidad debe ser mayor a 0")
                        }
                    },
                    ["missing_delivery"] = new OpenApiExample
                    {
                        Summary = "Tipo de entrega faltante",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("Debe especificar un tipo de entrega válido")
                        }
                    }
                };
            }
        }

        private void AddOrderSearchExamples(OpenApiOperation operation)
        {
            // Actualizar descripciones de parámetros con ejemplos
            if (operation.Parameters != null)
            {
                foreach (var parameter in operation.Parameters)
                {
                    switch (parameter.Name.ToLower())
                    {
                        case "from":
                            parameter.Description = "Fecha y hora de inicio para filtrar órdenes\n\nEjemplo: 2024-03-15T00:00:00Z";
                            break;
                        case "to":
                            parameter.Description = "Fecha y hora de fin para filtrar órdenes\n\nEjemplo: 2024-03-15T23:59:59Z";
                            break;
                        case "status":
                            parameter.Description = "Estado de la orden (1=Pendiente, 2=En preparación, 3=Listo, 4=Entregado, 5=Cancelado)";
                            break;
                    }
                }
            }

            // Ejemplos de respuesta de error
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["invalid_date_range"] = new OpenApiExample
                    {
                        Summary = "Rango de fechas inválido",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("Rango de fechas inválido")
                        }
                    },
                    ["invalid_status"] = new OpenApiExample
                    {
                        Summary = "Estado inválido",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El estado especificado no es válido")
                        }
                    }
                };
            }
        }

        private void AddOrderGetByIdExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"].Content["application/json"].Example = new OpenApiObject
                {
                    ["message"] = new OpenApiString("Orden no encontrada")
                };
            }
        }

        private void AddOrderUpdateExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["order_in_progress"] = new OpenApiExample
                    {
                        Summary = "Orden en preparación",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("No se puede modificar una orden que ya está en preparación")
                        }
                    },
                    ["invalid_dish"] = new OpenApiExample
                    {
                        Summary = "Plato no disponible",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El plato especificado no está disponible")
                        }
                    }
                };
            }
        }

        private void AddOrderItemUpdateExamples(OpenApiOperation operation)
        {
            if (operation.Responses.ContainsKey("400"))
            {
                operation.Responses["400"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["invalid_status"] = new OpenApiExample
                    {
                        Summary = "Estado inválido",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("El estado especificado no es válido")
                        }
                    },
                    ["invalid_transition"] = new OpenApiExample
                    {
                        Summary = "Transición no permitida",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("No se puede cambiar de 'Entregado' a 'En preparación'")
                        }
                    }
                };
            }

            if (operation.Responses.ContainsKey("404"))
            {
                operation.Responses["404"].Content["application/json"].Examples = new Dictionary<string, OpenApiExample>
                {
                    ["order_not_found"] = new OpenApiExample
                    {
                        Summary = "Orden no encontrada",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("Orden no encontrada")
                        }
                    },
                    ["item_not_found"] = new OpenApiExample
                    {
                        Summary = "Item no encontrado",
                        Value = new OpenApiObject
                        {
                            ["message"] = new OpenApiString("Item no encontrado en la orden")
                        }
                    }
                };
            }
        }

        private void AddOrderCreateRequestExamples(OpenApiOperation operation)
        {
            if (operation.RequestBody?.Content?.ContainsKey("application/json") == true)
            {
                operation.RequestBody.Content["application/json"].Example = new OpenApiObject
                {
                    ["items"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["id"] = new OpenApiString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
                            ["quantity"] = new OpenApiInteger(0),
                            ["notes"] = new OpenApiString("string")
                        }
                    },
                    ["delivery"] = new OpenApiObject
                    {
                        ["id"] = new OpenApiInteger(0),
                        ["to"] = new OpenApiString("string")
                    },
                    ["notes"] = new OpenApiString("string")
                };
            }
        }

        private void AddOrderUpdateRequestExamples(OpenApiOperation operation)
        {
            if (operation.RequestBody?.Content?.ContainsKey("application/json") == true)
            {
                operation.RequestBody.Content["application/json"].Example = new OpenApiObject
                {
                    ["items"] = new OpenApiArray
                    {
                        new OpenApiObject
                        {
                            ["id"] = new OpenApiString("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
                            ["quantity"] = new OpenApiInteger(0),
                            ["notes"] = new OpenApiString("string")
                        }
                    }
                };
            }
        }
    }
}