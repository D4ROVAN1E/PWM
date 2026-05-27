import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import cryptoUtils from '../utils/crypto';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const Home = () => {
    const { cryptoKey } = useContext(AuthContext);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setApiError(null);
                const encryptedAccounts = await api.getAccounts();
                
                // Расшифровываем каждую запись на лету
                const decryptedAccounts = await Promise.all(
                    encryptedAccounts.map(async (acc) => {
                        // Здесь acc.blob содержит iv и cipher
                        const plain = await cryptoUtils.decryptData(cryptoKey, acc.blob);
                        return { id: acc.id, ...plain };
                    })
                );
                setData(decryptedAccounts);
            } catch (error) {
                setApiError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [cryptoKey]);

    const deleteItem = async (id) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту запись?")) return;
        
        try {
            setIsLoading(true);
            setApiError(null);
            await api.deleteAccount(id);
            setData(prevData => prevData.filter(item => item.id !== id));
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="header-actions">
                <h1>Менеджер паролей</h1>
                <Link to="/add" className="btn btn-primary">
                    Добавить запись
                </Link>
            </div>
            
            {apiError && <div className="card error-card">{apiError}</div>}
            
            {isLoading ? (
                <Spinner />
            ) : (
                <ul className="no-bullets">
                    {data.map(item => (
                        <li key={item.id} className="card">
                            <Link to={`/detail/${item.id}`} className="service-link">
                                {item.service}
                            </Link>
                            <div style={{ color: '#7f8c8d', marginTop: '5px' }}>
                                Логин: {item.login}
                            </div>
                            <button className="btn btn-danger" onClick={() => deleteItem(item.id)}>Удалить</button>
                        </li>
                    ))}
                </ul>
            )}
            
            {data.length === 0 && !isLoading && !apiError && <div className="card">Записей пока нет. Создайте первую!</div>}
        </div>
    );
};

export default Home;