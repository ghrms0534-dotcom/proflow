class AgentNotFoundError(ValueError):
    """Raised when an unsupported Agent is requested."""


class ProjectAccessError(PermissionError):
    """Raised when a user cannot access a project."""
