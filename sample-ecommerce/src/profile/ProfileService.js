const Dashboard = require('../dashboard/Dashboard');

class ProfileService {
  constructor() {
    this.dashboard = new Dashboard();
  }

  getProfile(username) {
    return { username, layout: this.dashboard.render() };
  }
}

module.exports = ProfileService;
