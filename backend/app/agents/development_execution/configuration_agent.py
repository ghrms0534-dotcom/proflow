from app.agents.core.base_agent import MockAgent


class ConfigurationAgent(MockAgent):
    name = "Configuration Agent"
    description = "Checks development and deployment environment configuration."
