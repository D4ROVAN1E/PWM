import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import cryptoUtils from '../utils/crypto';
import Spinner from '../components/Spinner';

// Функция строгой валидации мастер-пароля
const validateMasterPassword = (password) => {
    // Минимум 8 символов
    // (?=.*[a-z]) - хотя бы одна строчная буква
    // (?=.*[A-Z]) - хотя бы одна заглавная буква
    // (?=.*\d) - хотя бы одна цифра
    // (?=.*[\W_]) - хотя бы один спецсимвол (не буква и не цифра)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
};

const AuthPage = () => {
    const { login } = useContext(AuthContext);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState(''); // Отдельный стейт для ошибок валидации
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordError('');
        
        // ПРОВЕРКА КРИПТОСТОЙКОСТИ ПРИ РЕГИСТРАЦИИ
        if (isRegisterMode && !validateMasterPassword(password)) {
            setPasswordError(
                'Пароль слишком слабый. Он должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и спецсимволы (например, !@#$%^&*).'
            );
            return; // Прерываем отправку
        }

        setIsLoading(true);

        try {
            if (isRegisterMode) {
                // РЕГИСТРАЦИЯ
                const salt = cryptoUtils.generateSalt();
                const hash = await cryptoUtils.hashPassword(password, salt);
                const key = await cryptoUtils.deriveKey(password, salt);
                
                const { token } = await api.register({ username, masterHash: hash, salt });
                login(key, token);
            } else {
                // ЛОГИН
                const { salt } = await api.getSalt(username);
                const hash = await cryptoUtils.hashPassword(password, salt);
                
                const { token } = await api.login({ username, masterHash: hash });
                const key = await cryptoUtils.deriveKey(password, salt);
                
                login(key, token);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Spinner />;

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{marginTop: 0}}>
                {isRegisterMode ? 'Регистрация' : 'Вход в Хранилище'}
            </h2>
            <p style={{color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px'}}>
                {isRegisterMode 
                    ? 'Придумайте сложный мастер-пароль. Восстановить его будет невозможно!' 
                    : 'Ваш ключ шифрования вычисляется локально.'}
            </p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        type="text" 
                        className="form-control"
                        placeholder="Имя пользователя..."
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group" style={{marginTop: '10px'}}>
                    <input 
                        type="password" 
                        className="form-control"
                        placeholder="Мастер-пароль..."
                        value={password}
                        onChange={e => {
                            setPassword(e.target.value);
                            setPasswordError(''); // Убираем ошибку при вводе
                        }}
                        required
                    />
                </div>
                
                {/* Вывод ошибки валидации пароля */}
                {passwordError && (
                    <div className="error-text" style={{margin: '10px 0', fontSize: '0.85rem', textAlign: 'left'}}>
                        {passwordError}
                    </div>
                )}
                
                {/* Вывод ошибок от API */}
                {error && <div className="error-text" style={{margin: '10px 0'}}>{error}</div>}
                
                <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '10px'}}>
                    {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
                </button>
            </form>
            
            <div style={{marginTop: '15px'}}>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{background: 'none', color: '#3498db', border: 'none'}}
                    onClick={() => { 
                        setIsRegisterMode(!isRegisterMode); 
                        setError(''); 
                        setPasswordError('');
                    }}
                >
                    {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;