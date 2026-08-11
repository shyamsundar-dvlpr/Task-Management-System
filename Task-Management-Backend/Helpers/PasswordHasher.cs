using Microsoft.AspNetCore.Identity;
using StudentAPI.Models;

namespace StudentAPI.Helpers
{
    public class PasswordHasher
    {
        private readonly PasswordHasher<User> _hasher = new();
        public string Hash(string password)
        {
            return _hasher.HashPassword(null, password);
        }

        public bool Verify(string hash,string password)
        {
            var result = _hasher.VerifyHashedPassword(null, hash, password);
            return result == PasswordVerificationResult.Success;
        }

    }
}
