import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import cryptoUtils from '../utils/crypto';
import { AuthContext } from '../context/AuthContext';
import AccountForm from '../components/AccountForm';
import Spinner from '../components/Spinner';

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cryptoKey } = useContext(AuthContext);
    
    const [accountData, setAccountData] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                setIsLoading(true);
                setApiError(null);
                const encryptedData = await api.getAccountById(id);
                const plainData = await cryptoUtils.decryptData(cryptoKey, encryptedData.blob);
                setAccountData(plainData);
            } catch (error) {
                setApiError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAccount();
    }, [id, cryptoKey]);

    const handleUpdate = async (formData) => {
        try {
            setIsLoading(true);
            setApiError(null);
            // Зашифровываем форму перед отправкой
            const encryptedBlob = await cryptoUtils.encryptData(cryptoKey, formData);
            // Формируем объект для сохранения в базе
            const payload = { blob: encryptedBlob };
            
            await api.updateAccount(id, payload);
            navigate(`/detail/${id}`);
        } catch (error) {
            setApiError(error.message);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (apiError && !accountData) {
        return (
            <div className="card error-card">
                <h2 style={{ marginTop: 0 }}>Ошибка</h2>
                <p>{apiError}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>Вернуться на главную</button>
            </div>
        );
    }

    return (
        <div>
            <div className="header-actions">
                <h1 style={{ margin: 0, color: '#2c3e50' }}>Редактирование записи</h1>
            </div>
            {apiError && <div className="card error-card" style={{ marginBottom: '15px' }}>{apiError}</div>}
            
            <AccountForm 
                initialData={accountData} 
                onSubmit={handleUpdate} 
                submitText="Сохранить изменения"
                onCancel={() => navigate(`/detail/${id}`)}
            />
        </div>
    );
};

export default Edit;