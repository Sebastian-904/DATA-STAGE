import React, { useState, useCallback, useRef } from 'react';
import { MONTH_NAMES } from '../constants';

interface UploadSectionProps {
    onFileSelect: (file: File) => void;
    selectedMonth: string;
    selectedYear: number;
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ 
    onFileSelect,
    selectedMonth,
    selectedYear,
    onMonthChange,
    onYearChange
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + 1 - i);

    const handleFile = useCallback((file: File | undefined) => {
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            setSelectedFile(file);
        } else {
            alert('Por favor, seleccione un archivo ZIP (.zip).');
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [handleFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };
    
    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    const dropzoneClasses = `border-2 dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ease-in-out ${
        isDragging ? 'border-green-500 bg-green-50' : 'border-blue-500 hover:border-blue-700 hover:bg-blue-50'
    }`;

    const handleContinue = () => {
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    const handleCancelSelection = () => {
        setSelectedFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <section className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Carga de Archivo ZIP</h2>
                <p className="text-gray-600 mb-6">Seleccione el periodo y suba el archivo ZIP que contiene sus archivos de datos (.asc) para procesarlos.</p>

                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Periodo del Reporte</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="month-select" className="block text-sm font-medium text-gray-600 mb-1">Mes</label>
                            <select
                                id="month-select"
                                value={selectedMonth}
                                onChange={(e) => onMonthChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {MONTH_NAMES.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="year-select" className="block text-sm font-medium text-gray-600 mb-1">Año</label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => onYearChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {!selectedFile ? (
                    <>
                        <div
                            className={dropzoneClasses}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={onButtonClick}
                        >
                            <i className="fas fa-file-archive text-5xl text-blue-500 mb-4"></i>
                            <p className="text-lg font-medium text-gray-700">Arrastre y suelte su archivo ZIP aquí</p>
                            <p className="text-gray-500">o</p>
                            <button type="button" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition">
                                Seleccionar archivo
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".zip"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-4">El archivo debe contener archivos de datos con extensión .asc.</p>
                    </>
                ) : (
                     <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 text-center">
                        <i className="fas fa-file-zipper text-5xl text-blue-600 mb-4"></i>
                        <p className="text-lg font-medium text-gray-800">Archivo listo para procesar:</p>
                        <p className="text-md text-gray-600 font-mono mb-6 break-all">{selectedFile.name}</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button 
                                onClick={handleCancelSelection} 
                                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg transition"
                                aria-label="Cambiar el archivo seleccionado"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cambiar Archivo
                            </button>
                            <button 
                                onClick={handleContinue} 
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-lg transition"
                                aria-label="Continuar y procesar el archivo"
                            >
                                <i className="fas fa-arrow-right mr-2"></i>
                                Continuar y Procesar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};