const UserService = require('../users/UserService');
const TokenService = require('../services/TokenService');

class AuthService {
  constructor() {
    this.userService = new UserService();
    this.tokenService = new TokenService();
  }

  login(username, password) {
    if (!username || !password) {
      return { error: 'Missing credentials' };
    }
    return this.userService.getUser(username);
  }
}

module.exports = AuthService;
