class CommandBoundary {
  constructor(
    commandId,
    command,
    targetObject,
    invokedBy,
    commandAttributes,
    invocationTimestamp
  ) {
    this.commandId = commandId;
    this.command = command;
    this.targetObject = targetObject;
    this.invokedBy = invokedBy;
    this.commandAttributes = commandAttributes;
    this.invocationTimestamp = invocationTimestamp;
  }

  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.commandId.equals(other.commandId);
  }
}

export { CommandBoundary };
