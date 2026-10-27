class TokenService {
  generateToken(user) {
    return `token-${user.username}`;
  }
}

module.exports = TokenService;
