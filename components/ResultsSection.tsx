import React from 'react';
import { ProcessedData } from '../types';
import { generateSeparateSheetsExcelReport, generateIndividualExcelFiles } from '../services/fileService';
import { FILE_NAMES } from '../constants';
import { KpiCard } from './KpiCard';

interface ResultsSectionProps {
    data: ProcessedData;
    onReset: () => void;
    month: string;
    year: number;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ data, onReset, month, year }) => {
    const processedFiles = Object.keys(data);
    const totalFiles = processedFiles.length;
    const totalRecords = Object.values(data).reduce((acc, records) => acc + records.length, 0);

    return (
        <section className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center">
                    <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Archivos Procesados Exitosamente</h2>
                    <p className="text-gray-600 mb-6">El archivo ZIP ha sido descomprimido y los datos están listos para ser descargados.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <KpiCard 
                        title="Archivos Procesados" 
                        value={totalFiles} 
                        icon="fas fa-file-zipper" 
                        color="border-blue-500" 
                    />
                    <KpiCard 
                        title="Registros Consolidados" 
                        value={totalRecords} 
                        icon="fas fa-list-ol" 
                        color="border-purple-500" 
                    />
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-2">Desglose de Archivos:</h3>
                    <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-md border">
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {processedFiles.map(fileKey => (
                                <li key={fileKey}>
                                    <span className="font-semibold">{fileKey}.asc</span> ({FILE_NAMES[fileKey] || 'Desconocido'}) - {data[fileKey].length.toLocaleString()} registros.
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Opciones de Descarga</h3>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button 
                            onClick={() => generateSeparateSheetsExcelReport(data, month, year)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
                            title="Genera un único archivo de Excel con todos los datos en hojas separadas."
                        >
                            <i className="fas fa-file-excel mr-2"></i>
                            Reporte Consolidado
                        </button>
                        <button 
                            onClick={() => generateIndividualExcelFiles(data, month, year)} 
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
                            title="Genera un archivo ZIP con un Excel por cada archivo .asc procesado."
                        >
                            <i className="fas fa-file-archive mr-2"></i>
                            Reportes Individuales (ZIP)
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 text-center border-t pt-6">
                     <button 
                        onClick={onReset}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-transform transform hover:scale-105 w-full sm:w-auto"
                    >
                        <i className="fas fa-upload mr-2"></i>
                        Cargar otro archivo
                    </button>
                </div>
            </div>
        </section>
    );
};