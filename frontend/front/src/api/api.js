import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

let isSlowMode = false;

export const toggleSlowMode = () => {
    isSlowMode = !isSlowMode;
    return isSlowMode;
};

export const getSlowModeStatus = () => isSlowMode;

axios.interceptors.request.use(async (config) => {
    if (isSlowMode) {
        const delay = Math.floor(Math.random() * 1500) + 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const handleApiError = (error) => {
    if (error.response) {
        const status = error.response.status;
        let explanation = error.response.data?.message || 'Неизвестная ошибка сервера';

        if (status === 401) {
            // Если токен истек или невалиден, очищаем сессию и выбрасываем на главную
            localStorage.removeItem('token');
            if (window.location.pathname !== '/') {
                window.location.href = '/'; 
            }
        }
        throw new Error(`Код ${status}: ${explanation}`);
    } else if (error.request) {
        throw new Error('Код ERR_NETWORK: Сбой соединения. Сервер не отвечает.');
    } else {
        throw new Error(`Внутренняя ошибка React: ${error.message}`);
    }
};

const api = {
    // --- Auth API ---
    getSalt: async (username) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/salt/${username}`);
            return response.data;
        } catch (error) { throw handleApiError(error); }
    },
    register: async (authData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, authData);
            return response.data; // Возвращает { token }
        } catch (error) { throw handleApiError(error); }
    },
    login: async (authData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, authData);
            return response.data; // Возвращает { token }
        } catch (error) { throw handleApiError(error); }
    },

    // --- Accounts API ---
    getAccounts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts`);
            return response.data;
        } catch (error) { throw handleApiError(error); }
    },
    getAccountById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/accounts/${id}`);
            return response.data;
        } catch (error) { throw handleApiError(error); }
    },
    createAccount: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/accounts`, data);
            return response.data;
        } catch (error) { throw handleApiError(error); }
    },
    updateAccount: async (id, data) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/accounts/${id}`, data);
            return response.data;
        } catch (error) { throw handleApiError(error); }
    },
    deleteAccount: async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/accounts/${id}`);
        } catch (error) { throw handleApiError(error); }
    }
};

export default api;