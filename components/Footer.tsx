import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Data Stage Consolidado</h3>
                    <p className="text-gray-400">Simplificando la consolidación de datos desde múltiples archivos.</p>
                </div>
                <div className="border-t border-gray-700 pt-6 text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Data Stage Consolidado. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};