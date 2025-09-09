
import React, { useEffect, useRef } from 'react';
import { ProgressState } from '../types';

interface ProcessingSectionProps {
    progress: ProgressState;
    logs: string[];
    onCancel: () => void;
}

export const ProcessingSection: React.FC<ProcessingSectionProps> = ({ progress, logs, onCancel }) => {
    const logPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logPanelRef.current) {
            logPanelRef.current.scrollTop = logPanelRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <section className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Procesando archivos</h2>
                
                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-blue-700">Progreso general</span>
                        <span className="text-sm font-medium text-blue-700">{progress.total}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress.total}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                            {progress.fileName ? `Procesando: ${progress.fileName}` : 'Archivo actual: Ninguno'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{progress.file}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.file}%` }}></div>
                    </div>
                </div>
                
                <div ref={logPanelRef} className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm text-gray-700 border mb-6">
                    {logs.map((log, index) => (
                        <p key={index} className="break-words">&gt; {log}</p>
                    ))}
                </div>

                <div className="text-center">
                    <button 
                        onClick={onCancel} 
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition"
                        aria-label="Cancelar el proceso de carga"
                    >
                        <i className="fas fa-times mr-2"></i>
                        Cancelar Proceso
                    </button>
                </div>
            </div>
        </section>
    );
};
