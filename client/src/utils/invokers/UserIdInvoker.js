class UserIdInvoker {
  constructor(userId) {
    this.userId = userId;
  }

  equals(other) {
    if (this === other) return true;
    return this.userId.equals(other.userId);
  }
}

export { UserIdInvoker };
