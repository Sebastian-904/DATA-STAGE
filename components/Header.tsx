import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <header className="bg-blue-800 text-white shadow-lg dark:bg-gray-900 dark:border-b dark:border-gray-700">
            <div className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <i className="fas fa-layer-group text-3xl mr-3"></i>
                        <div>
                            <h1 className="text-2xl font-bold">Data Stage Consolidado</h1>
                            <p className="text-blue-200 dark:text-gray-400">Herramienta de Procesamiento y Consolidación de Datos</p>
                        </div>
                    </div>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    );
};