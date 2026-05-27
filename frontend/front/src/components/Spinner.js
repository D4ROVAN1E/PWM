import React from 'react';

const Spinner = () => {
    const spinnerImageUrl = "https://i.gifer.com/ZKZg.gif"; 

    return (
        <div className="spinner-container">
            <img src={spinnerImageUrl} alt="Загрузка..." className="spinner-image" />
            <div className="spinner-text">Идёт загрузка данных...</div>
        </div>
    );
};

export default Spinner;