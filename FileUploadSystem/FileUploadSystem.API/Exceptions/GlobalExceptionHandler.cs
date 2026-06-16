using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FileUploadSystem.API.Exceptions 
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Sistemde yakalanmayan bir hata oluştu: {Message}", exception.Message);

            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Sunucu Hatası",
                Detail = "İşleminiz sırasında beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
                Instance = httpContext.Request.Path
            };

            if (exception is UnauthorizedAccessException)
            {
                problemDetails.Status = StatusCodes.Status401Unauthorized;
                problemDetails.Title = "Yetkisiz Erişim";
                problemDetails.Detail = "Bu işlemi yapmak için yetkiniz bulunmuyor.";
            }
            else if (exception is KeyNotFoundException)
            {
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Title = "Kayıt Bulunamadı";
                problemDetails.Detail = exception.Message;
            }

            httpContext.Response.StatusCode = problemDetails.Status.Value;
            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}