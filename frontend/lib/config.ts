export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const API_ROUTES = {
  websiteAnalysis: `${API_BASE_URL}/website-analysis`,
  performance: (id) => `${API_BASE_URL}/performance/${id}/analyze`,
  security: (id) => `${API_BASE_URL}/security/${id}/analyze`,
  seo: (id) => `${API_BASE_URL}/seo/${id}/analyze`,
  accessibility: (id) => `${API_BASE_URL}/accessibility/${id}/analyze`,
  uptime: `${API_BASE_URL}/uptime`,
  aiInsights: (id) => `${API_BASE_URL}/ai-insights/${id}/analyze`,
};
