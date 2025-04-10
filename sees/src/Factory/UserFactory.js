// ./Factory/UserFactory.js

class BaseUser {
    constructor(userData) {
      this.name = userData.name;
      this.email = userData.email;
      this.role = userData.role || 'attendee';
      this.isLoggedIn = userData.isLoggedIn ?? false;
    }
  
    getPermissions() {
      return ['view_events'];
    }
  }
  
  class AttendeeUser extends BaseUser {
    constructor(userData) {
      super(userData);
    }
  
    getPermissions() {
      return ['view_events', 'register'];
    }
  }
  
  class SponsorUser extends BaseUser {
    constructor(userData) {
      super(userData);
    }
  
    getPermissions() {
      return ['view_events', 'register', 'sponsor', 'isVIP', 'analytics'];
    }
  }
  
  class OrganizerUser extends BaseUser {
    constructor(userData) {
      super(userData);
    }
  
    getPermissions() {
      return ['view_events', 'register', 'create_events', 'edit_events', 'manage_users', 'isVIP', 'analytics'];
    }
  }
  
  export const UserFactory = (userData) => {
    switch (userData.role) {
      case 'organizer':
        return new OrganizerUser(userData);
      case 'sponsor':
        return new SponsorUser(userData);
      case 'attendee':
        return new AttendeeUser(userData);
      default:
        return new BaseUser(userData);
    }
  };