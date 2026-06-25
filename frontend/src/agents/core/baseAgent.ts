import type { AgentRequest, AgentResponse } from './agent.types';

export interface BaseAgent<TRequest extends AgentRequest = AgentRequest, TResponse extends AgentResponse = AgentResponse> {
  name: string;
  analyze: (request: TRequest) => TResponse;
}
