const AuthService = require('../auth/AuthService');

class Dashboard {
  constructor() {
    this.auth = new AuthService();
  }

  render() {
    return { status: 'ready', modules: ['AuthService', 'UserService'] };
  }
}

module.exports = Dashboard;
