import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadSection } from './components/UploadSection';
import { ProcessingSection } from './components/ProcessingSection';
import { ResultsSection } from './components/ResultsSection';
import { AppState, ProcessedData, ProgressState } from './types';
import { processZipFile } from './services/fileService';
import { MONTH_NAMES } from './constants';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    const [progress, setProgress] = useState<ProgressState>({ total: 0, file: 0, fileName: '' });
    const [logs, setLogs] = useState<string[]>(['Esperando archivos para procesar...']);
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const cancellationRef = useRef(false);

    const addLog = useCallback((message: string) => {
        setLogs(prevLogs => [...prevLogs, message]);
    }, []);

    const handleFileSelect = useCallback(async (file: File) => {
        cancellationRef.current = false;
        setAppState(AppState.PROCESSING);
        setLogs([`Archivo seleccionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`]);
        setProgress({ total: 0, file: 0, fileName: '' });
        setProcessedData(null);

        try {
            const data = await processZipFile(
                file,
                addLog,
                (progressState) => setProgress(progressState),
                cancellationRef
            );
            if (!cancellationRef.current) {
                setProcessedData(data);
                setAppState(AppState.RESULTS);
                addLog('¡Listo! Puede revisar los resultados y descargar los reportes.');
            }
        } catch (error) {
            const isCancellation = error instanceof Error && error.message === 'Operation cancelled by user.';
            if (!isCancellation) {
                const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
                addLog(`❌ Error crítico: ${errorMessage}`);
                setAppState(AppState.UPLOAD);
            }
        }
    }, [addLog]);
    
    const handleCancel = useCallback(() => {
        cancellationRef.current = true;
        setAppState(AppState.UPLOAD);
        setLogs(['Proceso cancelado. Puede seleccionar un nuevo archivo.']);
    }, []);

    const handleReset = useCallback(() => {
        setAppState(AppState.UPLOAD);
        setLogs(['Esperando archivos para procesar...']);
        setProgress({ total: 0, file: 0, fileName: '' });
        setProcessedData(null);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {appState === AppState.UPLOAD && (
                    <UploadSection 
                        onFileSelect={handleFileSelect}
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        onMonthChange={setSelectedMonth}
                        onYearChange={(year) => setSelectedYear(Number(year))}
                    />
                )}
                {appState === AppState.PROCESSING && <ProcessingSection progress={progress} logs={logs} onCancel={handleCancel} />}
                {appState === AppState.RESULTS && processedData && (
                    <ResultsSection 
                        data={processedData} 
                        onReset={handleReset} 
                        month={selectedMonth}
                        year={selectedYear}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default App;