using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentAPI.Data;
using StudentAPI.Helpers;
using StudentAPI.Interfaces;
using StudentAPI.Middleware;
using StudentAPI.Repositories.Implementations;
using StudentAPI.Repositories.Interfaces;
using StudentAPI.Services;
using StudentAPI.Services.Implementations;
using StudentAPI.Services.Interfaces;
using System.Text;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();
try
{

    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container.

    builder.Services.AddControllers();
    // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
    builder.Services.AddOpenApi();
    builder.Services.AddSwaggerGen();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddSingleton<PasswordHasher>();
    builder.Services.AddScoped<JwtHelper>();
    builder.Services.AddScoped<ITaskRepository, TaskRepository>();
    builder.Services.AddScoped<ITaskService, TaskService>();
    builder.Services.AddScoped<IUserService, UserService>();

    builder.Host.UseSerilog((context, services, config) =>
        config
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
    );

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var jwtKey = jwtSettings["Key"];
    if (string.IsNullOrEmpty(jwtKey))
    {
        throw new InvalidOperationException(
            "JWT signing key is not configured. Set 'Jwt:Key' via User Secrets or environment variables.");
    }

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngular",
            policy =>
            {
                policy.WithOrigins("http://localhost:4200")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
    });

    var app = builder.Build();
    app.UseSerilogRequestLogging();
    app.UseMiddleware<ExceptionMiddleware>();

    // Seed default users at startup
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        var adminPassword = config["SeedPasswords:Admin"];
        var userPassword = config["SeedPasswords:User"];

        if (!string.IsNullOrEmpty(adminPassword) && !db.Users.Any(u => u.Name == "admin"))
        {
            db.Users.Add(new StudentAPI.Models.User
            {
                Name = "admin",
                Role = "Admin",
                PasswordHash = hasher.Hash(adminPassword)
            });
        }
        if (!string.IsNullOrEmpty(userPassword) && !db.Users.Any(u => u.Name == "user"))
        {
            db.Users.Add(new StudentAPI.Models.User
            {
                Name = "user",
                Role = "User",
                PasswordHash = hasher.Hash(userPassword)
            });
        }
        db.SaveChanges();
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowAngular");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
