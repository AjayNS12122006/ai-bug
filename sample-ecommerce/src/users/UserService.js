const ProfileService = require('../profile/ProfileService');

class UserService {
  constructor() {
    this.profileService = new ProfileService();
  }

  getUser(username) {
    return { username, profile: this.profileService.getProfile(username) };
  }
}

module.exports = UserService;
