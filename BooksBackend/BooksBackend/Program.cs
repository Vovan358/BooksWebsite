// Привет! Этот файл настраивает и запускает ASP.NET Core backend для BooksWebsite.
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using Prometheus;
using System;
using System.Diagnostics.Metrics;
using System.Text;

namespace BooksBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Подключаем контроллеры
            builder.Services.AddControllers();

            builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();

                    //.AddPrometheusExporter();
            });

            builder.Services.AddResponseCaching(); // 17
            builder.Services.AddMemoryCache(); // 17
            builder.Services.AddStackExchangeRedisCache(options => // 17
            {
                options.Configuration = "localhost:6379";
                options.InstanceName = "BooksRedis_";
            });

            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

                options.IdleTimeout = TimeSpan.FromMinutes(30);
            });

            // Swagger (для тестов)
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Вставь JWT так: Bearer {твой токен}"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            var jwtKey = builder.Configuration["Jwt:Key"];
            var key = Encoding.UTF8.GetBytes(jwtKey);

            // Подключаем БД
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                ));

            // 🔥 CORS — чтобы фронт мог стучаться
            builder.Services.AddCors(options =>
            {
                // 1. Полный доступ (для разработки)
                options.AddPolicy("DevPolicy", policy =>
                    policy
                        .WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());

                // 2. Ограниченный доступ только для фронта
                options.AddPolicy("FrontendPolicy", policy =>
                    policy
                        .WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());

                // 3. Тестовая строгая политика (GET-only)
                options.AddPolicy("ReadOnlyPolicy", policy =>
                    policy
                        .WithOrigins("http://localhost:5173")
                        .WithMethods("GET")
                        .WithHeaders("Content-Type"));
            });

            builder.Services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });
            

            var app = builder.Build();
            app.UseStaticFiles();
            // Swagger
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();

            app.UseResponseCaching(); //17

            app.UseSession();
            // CORS
            app.UseCors("DevPolicy");

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseHttpMetrics(); // 18

            app.MapControllers();

            app.MapMetrics(); //18
    
            app.Run();
        }
    }
}
