// cspell: disable
import api from "../services/api";

// Definindo tipos para ajudar no desenvolvimento
export interface ApiIntegration {
  id: number;
  name: string;
  projectName: string;
  jsonContent: string;
  url: string;
  apikey: string;
  language: string;
  status: string; // ex: 'CONNECTED', 'DISCONNECTED'
  companyId: number;
}

const apiIntegrationService = {
  // GET /api-integrations
  list: async (params?: { searchParam?: string; pageNumber?: string }) => {
    const { data } = await api.get("/api-integrations", { params });
    return data;
  },

  // POST /api-integrations
  store: async (data: Partial<ApiIntegration>) => {
    const { data: responseData } = await api.post("/api-integrations", data);
    return responseData;
  },

  // GET /api-integrations/:integrationId
  get: async (id: number | string) => {
    const { data } = await api.get(`/api-integrations/${id}`);
    return data;
  },

  // PUT /api-integrations/:integrationId
  update: async (id: number | string, data: Partial<ApiIntegration>) => {
    const { data: responseData } = await api.put(
      `/api-integrations/${id}`,
      data
    );
    return responseData;
  },

  // DELETE /api-integrations/:integrationId
  delete: async (id: number | string) => {
    const { data } = await api.delete(`/api-integrations/${id}`);
    return data;
  },

  // GET /api-integrations/:integrationId/qrcode
  getQrCode: async (id: number | string) => {
    const { data } = await api.get(`/api-integrations/${id}/qrcode`);
    return data; // Deve retornar o base64 ou link do QR
  },

  // POST /api-integrations/:integrationId/connection-status
  getConnectionStatus: async (id: number | string) => {
    const { data } = await api.post(
      `/api-integrations/${id}/connection-status`
    );
    return data;
  },
};

export default apiIntegrationService;
