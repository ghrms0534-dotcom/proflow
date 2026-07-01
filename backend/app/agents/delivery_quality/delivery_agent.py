from app.agents.core.base_agent import MockAgent


class DeliveryAgent(MockAgent):
    name = "Delivery Agent"
    description = "Coordinates quality, defect, document, and delivery output status."
