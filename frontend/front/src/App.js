import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Edit from './pages/Edit';
import Form from './pages/Form';
import AuthPage from './pages/AuthPage';
import { toggleSlowMode, getSlowModeStatus } from './api/api';
import { AuthContext, AuthProvider } from './context/AuthContext';

const AppContent = () => {
    const { isLoggedIn, logout } = useContext(AuthContext);
    const [isSlow, setIsSlow] = useState(getSlowModeStatus());

    const handleToggleSlowMode = () => {
        setIsSlow(toggleSlowMode());
    };

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h2>Crypto Пароли 🔒</h2>
                    </Link>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <button 
                            className={`btn ${isSlow ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={handleToggleSlowMode}
                            title="Включает задержку пакетов для проверки работы спиннеров"
                        >
                            {isSlow ? "🐢 Задержка (ВКЛ)" : "⚡ Обычная скорость"}
                        </button>
                        
                        {/* Кнопка выхода появляется только если авторизован */}
                        {isLoggedIn && (
                            <button className="btn btn-secondary" style={{background: '#34495e'}} onClick={logout}>
                                Выйти
                            </button>
                        )}
                    </div>
                </header>

                {/* Система роутинга: если не вошел - показываем только окно пароля */}
                {!isLoggedIn ? (
                    <AuthPage />
                ) : (
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/detail/:id" element={<Detail />} />
                        <Route path="/edit/:id" element={<Edit />} />
                        <Route path="/add" element={<Form />} />
                    </Routes>
                )}
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;