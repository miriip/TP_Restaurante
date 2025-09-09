using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

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

            foreach (var kvp in operation.Responses)
            {
                var statusCode = kvp.Key;
                var response = kvp.Value;

                // Asegurar que exista application/json en la respuesta
                if (response.Content == null)
                {
                    response.Content = new Dictionary<string, OpenApiMediaType>();
                }
                if (!response.Content.TryGetValue("application/json", out var mediaType))
                {
                    mediaType = new OpenApiMediaType();
                    response.Content["application/json"] = mediaType;
                }

                string? exampleMessage = null;

                if (path.StartsWith("api/v1/dish"))
                {
                    if (method == "POST")
                    {
                        if (statusCode == "400") exampleMessage = "El precio debe ser mayor a cero";
                        if (statusCode == "409") exampleMessage = "Ya existe un plato con ese nombre";
                    }
                    else if (method == "GET")
                    {
                        if (statusCode == "400") exampleMessage = "Parámetros de ordenamiento inválidos";
                    }
                    else if (method == "PUT")
                    {
                        if (statusCode == "400") exampleMessage = "El precio debe ser mayor a cero";
                        if (statusCode == "404") exampleMessage = "Plato no encontrado";
                        if (statusCode == "409") exampleMessage = "Ya existe un plato con ese nombre";
                    }
                }

                if (!string.IsNullOrWhiteSpace(exampleMessage))
                {
                    mediaType.Example = new OpenApiObject
                    {
                        ["message"] = new OpenApiString(exampleMessage)
                    };
                }
            }
        }
    }
}


