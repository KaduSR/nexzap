// cspell: disable
import api from "./api";

export interface Queue {
  id: number;
  name: string;
  color: string;
  greetingMessage?: string;
  count?: number;
}

interface QueueListParams {
  searchParams?: string;
  pageNumber?: string;
}

const queueService = {
  list: async (params?: QueueListParams) => {
    const { data } = await api.get("/queues", { params });
    return data;
  },
  store: async (data: {
    name: string;
    color: string;
    greetingMessage?: string;
  }) => {
    const { data: responseData } = await api.post("/queues", data);
  },

  update: async (
    queueId: number | string,
    data: { name?: string; color?: string; greetingMessage?: string }
  ) => {
    const { data: responseData } = await api.put<Queue>(
      `/queues/${queueId}`,
      data
    );
    return responseData;
  },

  delete: async (queueId: number | string) => {
    const { data } = await api.delete<{ message: string }>(
      `/queues/${queueId}`
    );
    return data;
  },
};
