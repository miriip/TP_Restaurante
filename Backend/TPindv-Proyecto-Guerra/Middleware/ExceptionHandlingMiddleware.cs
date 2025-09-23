using Application.Models.Response;
using Application.Exceptions;
using System.Net;
using System.Text.Json;

namespace TPindv_Proyecto_Guerra.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ApiError("Error interno del servidor");
            var statusCode = HttpStatusCode.InternalServerError;

            switch (exception)
            {
                case DishNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case DishNameAlreadyExistsException:
                    statusCode = HttpStatusCode.Conflict;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case CategoryNotFoundException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case CategoryNameNotFoundException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidDishDataException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidPriceException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidSortOrderException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidDishNameException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidDishDescriptionException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidImageUrlException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case DishNameTooLongException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidCategoryIdException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case NoDishesFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case NoDishesInCategoryException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case NoDishesInCategoryByNameException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                // Order exceptions
                case OrderNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case OrderItemNotFoundException:
                    statusCode = HttpStatusCode.NotFound;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderDataException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderStatusException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderStatusTransitionException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case OrderInProgressException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case OrderClosedException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderItemQuantityException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case DishNotAvailableException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidDeliveryTypeException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case EmptyOrderItemsException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderIdFormatException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidOrderItemIdFormatException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case OrderCannotBeDeletedException:
                    statusCode = HttpStatusCode.Conflict;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case DishHasDependenciesException:
                    statusCode = HttpStatusCode.Conflict;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidDateRangeException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                case InvalidSearchParametersException:
                    statusCode = HttpStatusCode.BadRequest;
                    errorResponse = new ApiError(exception.Message);
                    break;
                default:
                    _logger.LogError(exception, "Error no manejado: {Message} - Tipo: {ExceptionType}", exception.Message, exception.GetType().Name);
                    break;
            }

            response.StatusCode = (int)statusCode;
            var result = JsonSerializer.Serialize(errorResponse);
            await response.WriteAsync(result);
        }
    }
}
