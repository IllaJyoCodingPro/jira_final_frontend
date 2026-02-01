import api from './apiClient';

export const epicService = {
    // Create a new Epic
    create: async (data) => {
        const response = await api.post('/epics/', data);
        return response.data;
    },

    // Get all Epics for a project
    getByProject: async (projectId) => {
        const response = await api.get(`/epics/project/${projectId}`);
        return response.data;
    },

    // Get a single Epic by ID (if needed later)
    getById: async (id) => {
        const response = await api.get(`/epics/${id}`);
        return response.data;
    }
};
