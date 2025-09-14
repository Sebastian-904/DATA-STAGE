import React from 'react';
import { MONTH_NAMES } from '../constants';

interface AnnualUploadSectionProps {
    selectedYear: number;
    onYearChange: (year: string) => void;
    files: Record<string, File | null>;
    onFilesChange: (files: Record<string, File | null>) => void;
    onProcess: () => void;
}

const MonthUploadSlot: React.FC<{
    month: string;
    file: File | null;
    onFileSelect: (month: string, file: File | null) => void;
}> = ({ month, file, onFileSelect }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].name.toLowerCase().endsWith('.zip')) {
                onFileSelect(month, e.target.files[0]);
            } else {
                alert('Por favor, seleccione un archivo ZIP (.zip).');
            }
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(month, null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div 
            className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${file ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700/50'}`}
        >
            <div className="flex items-center overflow-hidden">
                <i className={`fas fa-calendar-alt mr-3 ${file ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}></i>
                <div className="flex-1 min-w-0">
                     <p className="font-semibold text-gray-800 dark:text-gray-100">{month}</p>
                     {file ? (
                        <p className="text-sm text-green-700 dark:text-green-300 truncate font-mono" title={file.name}>
                           {file.name}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pendiente</p>
                    )}
                </div>
            </div>
            <div className="flex items-center ml-2">
                {!file ? (
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm py-1 px-3 rounded-md transition"
                        aria-label={`Cargar archivo para ${month}`}
                    >
                         <i className="fas fa-upload mr-1"></i> Cargar
                    </button>
                ) : (
                    <button 
                        onClick={handleRemoveFile} 
                        className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1 px-3 rounded-md transition"
                        aria-label={`Quitar archivo de ${month}`}
                    >
                        <i className="fas fa-times mr-1"></i> Quitar
                    </button>
                )}
                <input type="file" ref={inputRef} accept=".zip" className="hidden" onChange={handleFileChange} />
            </div>
        </div>
    );
};


export const AnnualUploadSection: React.FC<AnnualUploadSectionProps> = ({
    selectedYear,
    onYearChange,
    files,
    onFilesChange,
    onProcess
}) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => currentYear + 1 - i);

    const handleFileSelect = (month: string, file: File | null) => {
        onFilesChange({ ...files, [month]: file });
    };

    const uploadedFilesCount = Object.values(files).filter(f => f !== null).length;

    return (
        <section className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-100">Carga de Archivos para Reporte Anual</h2>
                <p className="text-gray-600 mb-6 dark:text-gray-300">Seleccione el año y suba un archivo ZIP por cada mes que desee incluir en el reporte consolidado anual.</p>
                
                <div className="mb-6 max-w-xs">
                    <label htmlFor="year-select-annual" className="block text-sm font-medium text-gray-600 mb-1 dark:text-gray-300">Año del Reporte</label>
                    <select
                        id="year-select-annual"
                        value={selectedYear}
                        onChange={(e) => onYearChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {MONTH_NAMES.map(month => (
                        <MonthUploadSlot
                            key={month}
                            month={month}
                            file={files[month] || null}
                            onFileSelect={handleFileSelect}
                        />
                    ))}
                </div>

                <div className="border-t pt-6 text-center dark:border-gray-700">
                     <button 
                        onClick={onProcess}
                        disabled={uploadedFilesCount === 0}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 dark:disabled:bg-gray-600"
                        aria-label="Generar el reporte anual consolidado"
                    >
                        <i className="fas fa-cogs mr-2"></i>
                        Generar Reporte Anual ({uploadedFilesCount} {uploadedFilesCount === 1 ? 'mes' : 'meses'})
                    </button>
                    {uploadedFilesCount === 0 && (
                        <p className="text-sm text-gray-500 mt-3 dark:text-gray-400">Cargue al menos un archivo para poder generar el reporte.</p>
                    )}
                </div>
            </div>
        </section>
    );
};
