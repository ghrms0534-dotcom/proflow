import api from './api';

export type RequirementInput = { requirement_key: string; title: string; status?: string; priority?: string; owner?: string };
export type DevelopmentTaskInput = { task_key: string; title: string; status?: string; priority?: string; owner?: string };
export type QualityResultInput = { result_key: string; title: string; status?: string; score?: number; risk_level?: string };
export type PlanningItemInput = { title: string; status?: string; priority?: string; owner?: string };
export type ScheduleInput = PlanningItemInput & { schedule_key: string };
export type WbsInput = PlanningItemInput & { wbs_key: string };
export type DesignInput = PlanningItemInput & { design_key: string };
export type UnitTestInput = { title: string; target_module?: string; status?: string; pass_count?: number; fail_count?: number; coverage?: number; owner?: string; memo?: string };
export type IntegrationTestInput = { title: string; target_scope?: string; status?: string; scenario_count?: number; passed_scenarios?: number; failed_scenarios?: number; owner?: string; memo?: string };
export type CodeReviewInput = { title: string; repository?: string; branch?: string; reviewer?: string; status?: string; issue_count?: number; resolved_count?: number; memo?: string };
export type DeploymentInput = { title: string; environment?: string; version?: string; status?: string; deployed_at?: string | null; owner?: string; memo?: string };
export type DefectInput = { title: string; severity?: string; status?: string; source?: string; owner?: string; detected_at?: string | null; resolved_at?: string | null; memo?: string };
export type DocumentInput = { title: string; document_type?: string; version?: string; status?: string; owner?: string; file_name?: string; file_path?: string; memo?: string };
export type OutputInput = { title: string; output_type?: string; version?: string; status?: string; owner?: string; submitted_at?: string | null; approved_at?: string | null; memo?: string };

export const ProjectService = {
  requirements: {
    list: (projectId: number | string) => api.get(`/projects/${projectId}/requirements`).then(({ data }) => data.requirements),
    create: (projectId: number | string, input: RequirementInput) => api.post(`/projects/${projectId}/requirements`, input).then(({ data }) => data),
    update: (projectId: number | string, id: number, input: Partial<RequirementInput>) => api.put(`/projects/${projectId}/requirements/${id}`, input).then(({ data }) => data),
    remove: (projectId: number | string, id: number) => api.delete(`/projects/${projectId}/requirements/${id}`),
  },
  developmentTasks: {
    list: (projectId: number | string) => api.get(`/projects/${projectId}/development-tasks`).then(({ data }) => data.development_tasks),
    create: (projectId: number | string, input: DevelopmentTaskInput) => api.post(`/projects/${projectId}/development-tasks`, input).then(({ data }) => data),
    update: (projectId: number | string, id: number, input: Partial<DevelopmentTaskInput>) => api.put(`/projects/${projectId}/development-tasks/${id}`, input).then(({ data }) => data),
    remove: (projectId: number | string, id: number) => api.delete(`/projects/${projectId}/development-tasks/${id}`),
  },
  qualityResults: {
    list: (projectId: number | string) => api.get(`/projects/${projectId}/quality-results`).then(({ data }) => data.quality_results),
    create: (projectId: number | string, input: QualityResultInput) => api.post(`/projects/${projectId}/quality-results`, input).then(({ data }) => data),
    update: (projectId: number | string, id: number, input: Partial<QualityResultInput>) => api.put(`/projects/${projectId}/quality-results/${id}`, input).then(({ data }) => data),
    remove: (projectId: number | string, id: number) => api.delete(`/projects/${projectId}/quality-results/${id}`),
  },
  schedules: crudApi<ScheduleInput>('schedules', 'schedules'),
  wbs: crudApi<WbsInput>('wbs', 'wbs_items'),
  uiDesigns: crudApi<DesignInput>('ui-designs', 'ui_designs'),
  databaseDesigns: crudApi<DesignInput>('database-designs', 'database_designs'),
  apiDesigns: crudApi<DesignInput>('api-designs', 'api_designs'),
  unitTests: crudApi<UnitTestInput>('unit-tests', 'unit_tests'),
  integrationTests: crudApi<IntegrationTestInput>('integration-tests', 'integration_tests'),
  codeReviews: crudApi<CodeReviewInput>('code-reviews', 'code_reviews'),
  deployments: crudApi<DeploymentInput>('deployments', 'deployments'),
  defects: crudApi<DefectInput>('defects', 'defects'),
  documents: crudApi<DocumentInput>('documents', 'documents'),
  outputs: crudApi<OutputInput>('outputs', 'outputs'),
};

function crudApi<T>(path: string, responseKey: string) {
  return {
    list: (projectId: number | string) => api.get(`/projects/${projectId}/${path}`).then(({ data }) => data[responseKey]),
    create: (projectId: number | string, input: T) => api.post(`/projects/${projectId}/${path}`, input).then(({ data }) => data),
    update: (projectId: number | string, id: number, input: Partial<T>) => api.put(`/projects/${projectId}/${path}/${id}`, input).then(({ data }) => data),
    remove: (projectId: number | string, id: number) => api.delete(`/projects/${projectId}/${path}/${id}`),
  };
}
