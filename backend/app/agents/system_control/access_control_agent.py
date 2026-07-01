from app.agents.core.base_agent import MockAgent


class AccessControlAgent(MockAgent):
    name = "Access Control Agent"
    description = "Checks user access and authorization status."
