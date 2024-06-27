class UserBoundary {
  constructor(userId, role, userDetails, username) {
    this.userId = userId;
    this.role = role;
    this.userDetails = userDetails;
    this.username = username;
  }

  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.userId.equals(other.userId);
  }
}

export { UserBoundary };
