import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.101:8000/api/v1",
});

export const investmentsService = {
  api: api,

  // --- Calculadoras ---
  simulateFixedIncome: async (params) => {
    const response = await api.post("/calculator/simulate", null, { params });
    return response.data;
  },
  simulateSimpleInterest: async (data) => {
    const response = await api.post("/calculator/simple_interest", data);
    return response.data;
  },
  simulateFirstMillion: async (data) => {
    const response = await api.post("/calculator/first_million", data);
    return response.data;
  },
  simulateEmergencyFund: async (data) => {
    const response = await api.post("/calculator/emergency_fund", data);
    return response.data;
  },
  compareScenarios: async (data) => {
    const response = await api.post("/calculator/compare", data);
    return response.data;
  },
  simulateCDI: async (data) => {
    const response = await api.post("/calculator/cdi", data);
    return response.data;
  },
  projectAsset: async (data) => {
    const response = await api.post("/calculator/project_asset", data);
    return response.data;
  },
  simulateQuickRF: async (data) => {
    const response = await api.post("/calculator/quick_rf", data);
    return response.data;
  },

  // --- Ativos ---
  getAssets: async () => {
    const response = await api.get("/investments/assets");
    return response.data;
  },
  getAssetById: async (id) => {
    const response = await api.get(`/investments/assets/${id}`);
    return response.data;
  },
  createAsset: async (assetData) => {
    const response = await api.post("/investments/assets", assetData);
    return response.data;
  },
  deleteAsset: async (id) => {
    const response = await api.delete(`/investments/assets/${id}`);
    return response.data;
  },
  refreshPrices: async () => {
    const response = await api.post("/investments/assets/refresh");
    return response.data;
  },

  // --- Históricos ---
  getHistory: async () => {
    const response = await api.get("/history/");
    return response.data;
  },

  // --- Transações ---
  createTransaction: async (transactionData) => {
    const response = await api.post(
      "/investments/transactions",
      transactionData
    );
    return response.data;
  },
  deleteTransaction: async (id) => {
    const response = await api.delete(`/investments/transactions/${id}`);
    return response.data;
  },

  // --- Passivos ---
  getPassivos: async () => {
    const response = await api.get("/investments/passivos");
    return response.data;
  },
  createPassivo: async (data) => {
    const response = await api.post("/investments/passivos", data);
    return response.data;
  },
  deletePassivo: async (id) => {
    const response = await api.delete(`/investments/passivos/${id}`);
    return response.data;
  },
};

export default api;
