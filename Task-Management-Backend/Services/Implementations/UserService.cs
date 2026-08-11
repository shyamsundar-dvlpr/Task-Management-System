using StudentAPI.Repositories.Interfaces;
using StudentAPI.Services.Interfaces;
using StudentAPI.DTOs.User;
using StudentAPI.Exceptions;
using StudentAPI.Helpers;
using StudentAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using StudentAPI.DTOs.Common;

namespace StudentAPI.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly PasswordHasher _passwordHasher;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, PasswordHasher passwordHasher, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Role = u.Role
            }).ToList();
            _logger.LogInformation("Retrieved all users");
            return userDtos;
        }
        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException($"User with id {id} not found");
            }
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Role = user.Role
            };
        }
        public async Task<UserDto> GetCurrentUserAsync(string username)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if(user == null)
            {
                throw new NotFoundException($"User with username {username} not found");
            }
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Role = user.Role
            };
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto dto)
        {
            var user = new User
            {
                Name = dto.Name,
                Role = dto.Role,
                PasswordHash = _passwordHasher.Hash(dto.Password)
            };
            await _userRepository.AddAsync(user);
            
            _logger.LogInformation($"Created new user with id {user.Id}");
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Role = user.Role
            };

        }
        public async Task DeleteUser(int id)
        {
            await _userRepository.DeleteAsync(id);
            _logger.LogInformation($"Deleted user with id {id}");
        }
        public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto dto)
        {
            var existingUser = await _userRepository.GetByIdAsync(id);
            if (existingUser == null)
            {
                throw new NotFoundException($"User with id {id} not found");
            }
            existingUser.Name = dto.Name;
            existingUser.Role = dto.Role;
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                existingUser.PasswordHash = _passwordHasher.Hash(dto.Password);
            }
            await _userRepository.UpdateAsync(existingUser);
            
            _logger.LogInformation($"Updated user with id {id}");
            return new UserDto
            {
                Id = existingUser.Id,
                Name = existingUser.Name,
                Role = existingUser.Role
            };

        }
        public async Task<List<UserDto>> GetUsersByRoleAsync(string role)
        {
            var users = await _userRepository.GetAllAsync();
            return users
                .OrderBy(u => u.Name)
                .Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase))
                .Select(u => new UserDto { Id = u.Id, Name = u.Name, Role = u.Role })
                .ToList();
        }

        public async Task<PagedResult<UserDto>> GetUsersPagesAsync(int page, int pageSize, string? search = null)
        {
            var itemsTask =  _userRepository.GetPagesAsync(page, pageSize, search);
            var totalTask =  _userRepository.GetCountAsync(search);

            await Task.WhenAll(itemsTask, totalTask);

            return new PagedResult<UserDto>
            {
                Items = itemsTask.Result.Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Role = u.Role
                }).ToList(),
                Total = totalTask.Result
            };
        }
    }
}
