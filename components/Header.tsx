import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-blue-800 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-center md:justify-start items-center">
                    <div className="flex items-center">
                        <i className="fas fa-layer-group text-3xl mr-3"></i>
                        <div>
                            <h1 className="text-2xl font-bold">Data Stage Consolidado</h1>
                            <p className="text-blue-200">Herramienta de Procesamiento y Consolidación de Datos</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};