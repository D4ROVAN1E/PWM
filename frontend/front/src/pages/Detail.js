import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import cryptoUtils from '../utils/crypto';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const Detail = () => {
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

    if (isLoading) {
        return <Spinner />;
    }

    if (apiError && !accountData) {
        return (
            <div>
                <h2 style={{color: 'red'}}>Ошибка</h2>
                <p>{apiError}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>Вернуться на главную</button>
            </div>
        );
    }

    if (!accountData) return null;

    return (
        <div className="card">
            <h1>Детали записи</h1>
            
            <div style={{ margin: '20px 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
                <p><strong>Сервис:</strong> {accountData.service}</p>
                <p><strong>Логин (Email):</strong> {accountData.login}</p>
                <p><strong>Пароль:</strong> {accountData.password}</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Link to={`/edit/${id}`} className="btn btn-primary">
                    Перейти к редактированию
                </Link>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    Вернуться к списку
                </button>
            </div>
        </div>
    );
};

export default Detail;