import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import cryptoUtils from '../utils/crypto';
import { AuthContext } from '../context/AuthContext';
import AccountForm from '../components/AccountForm';
import Spinner from '../components/Spinner';

const Form = () => {
    const navigate = useNavigate();
    const { cryptoKey } = useContext(AuthContext);
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (formData) => {
        try {
            setApiError(null);
            // Зашифровываем данные
            const encryptedBlob = await cryptoUtils.encryptData(cryptoKey, formData);
            const payload = { blob: encryptedBlob };

            await api.createAccount(payload);
            navigate('/');
        } catch (error) {
            setApiError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="header-actions" style={{ marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>Добавить новую запись</h1>
            </div>
            {apiError && <div className="card error-card" style={{ marginBottom: '10px' }}>{apiError}</div>}
            
            {isLoading ? (
                <Spinner />
            ) : (
                <AccountForm 
                    onSubmit={handleCreate} 
                    submitText="Добавить в менеджер" 
                    onCancel={() => navigate('/')}
                />
            )}
        </div>
    );
};

export default Form;