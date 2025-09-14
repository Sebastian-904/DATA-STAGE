import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadSection } from './components/UploadSection';
import { ProcessingSection } from './components/ProcessingSection';
import { ResultsSection } from './components/ResultsSection';
import { AnnualUploadSection } from './components/AnnualUploadSection';
import { AppState, ProcessedData, ProgressState, ReportMode } from './types';
import { processZipFile, consolidateAnnualData } from './services/fileService';
import { MONTH_NAMES } from './constants';

const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') {
        return 'light';
    }
    
    const storedPrefs = window.localStorage.getItem('theme');
    if (storedPrefs === 'dark' || storedPrefs === 'light') {
        return storedPrefs;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    return 'light';
};

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    const [reportMode, setReportMode] = useState<ReportMode>(ReportMode.MONTHLY);
    const [progress, setProgress] = useState<ProgressState>({ total: 0, file: 0, fileName: '' });
    const [logs, setLogs] = useState<string[]>(['Esperando archivos para procesar...']);
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_NAMES[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [annualFiles, setAnnualFiles] = useState<Record<string, File | null>>({});

    const cancellationRef = useRef(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

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

    const handleProcessAnnualReport = useCallback(async () => {
        cancellationRef.current = false;
        setAppState(AppState.PROCESSING);
        setLogs(['Iniciando procesamiento de reporte anual...']);
        setProgress({ total: 0, file: 0, fileName: '' });
        setProcessedData(null);

        const monthlyData: { month: string, data: ProcessedData }[] = [];
        const filesToProcess = Object.entries(annualFiles).filter(([, file]) => file !== null);
        let overallFileIndex = 0;

        try {
            for (const [month, file] of filesToProcess) {
                if (cancellationRef.current) throw new Error('Operation cancelled by user.');
                if (!file) continue;

                overallFileIndex++;
                const overallProgress = Math.round((overallFileIndex / filesToProcess.length) * 100);
                setProgress(prev => ({ ...prev, total: overallProgress, fileName: `Mes: ${month}`}));
                addLog(`--- Procesando mes: ${month} (${file.name}) ---`);

                const data = await processZipFile(
                    file,
                    addLog,
                    (fileProgress) => setProgress({ total: overallProgress, file: fileProgress.file, fileName: fileProgress.fileName }),
                    cancellationRef
                );
                monthlyData.push({ month, data });
            }

            if (!cancellationRef.current) {
                addLog('Todos los meses procesados. Consolidando datos anuales...');
                const consolidated = consolidateAnnualData(monthlyData, addLog);
                setProcessedData(consolidated);
                setAppState(AppState.RESULTS);
                addLog('¡Reporte Anual Listo! Puede revisar los resultados y descargar el reporte consolidado.');
            }
        } catch (error) {
             const isCancellation = error instanceof Error && error.message === 'Operation cancelled by user.';
            if (!isCancellation) {
                const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
                addLog(`❌ Error crítico durante el proceso anual: ${errorMessage}`);
                setAppState(AppState.UPLOAD);
            }
        }
    }, [addLog, annualFiles]);
    
    const handleCancel = useCallback(() => {
        cancellationRef.current = true;
        setAppState(AppState.UPLOAD);
        setLogs(['Proceso cancelado. Puede seleccionar nuevos archivos.']);
    }, []);

    const handleReset = useCallback(() => {
        setAppState(AppState.UPLOAD);
        setLogs(['Esperando archivos para procesar...']);
        setProgress({ total: 0, file: 0, fileName: '' });
        setProcessedData(null);
        setAnnualFiles({});
    }, []);

    const renderUploadContent = () => {
        if (reportMode === ReportMode.MONTHLY) {
            return (
                <UploadSection 
                    onFileSelect={handleFileSelect}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={(year) => setSelectedYear(Number(year))}
                />
            );
        }
        if (reportMode === ReportMode.ANNUAL) {
            return (
                <AnnualUploadSection
                    selectedYear={selectedYear}
                    onYearChange={(year) => setSelectedYear(Number(year))}
                    files={annualFiles}
                    onFilesChange={setAnnualFiles}
                    onProcess={handleProcessAnnualReport}
                />
            );
        }
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {appState === AppState.UPLOAD && (
                    <div>
                        <div className="mb-6 flex justify-center border-b border-gray-300 dark:border-gray-700">
                            <button
                                onClick={() => setReportMode(ReportMode.MONTHLY)}
                                className={`px-6 py-3 font-medium text-lg transition-colors duration-200 ${reportMode === ReportMode.MONTHLY ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <i className="fas fa-calendar-day mr-2"></i>
                                Reporte Mensual
                            </button>
                            <button
                                onClick={() => setReportMode(ReportMode.ANNUAL)}
                                className={`px-6 py-3 font-medium text-lg transition-colors duration-200 ${reportMode === ReportMode.ANNUAL ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                            >
                                <i className="fas fa-calendar-alt mr-2"></i>
                                Reporte Anual
                            </button>
                        </div>
                        {renderUploadContent()}
                    </div>
                )}
                {appState === AppState.PROCESSING && <ProcessingSection progress={progress} logs={logs} onCancel={handleCancel} />}
                {appState === AppState.RESULTS && processedData && (
                    <ResultsSection 
                        data={processedData} 
                        onReset={handleReset} 
                        month={reportMode === ReportMode.MONTHLY ? selectedMonth : 'Anual'}
                        year={selectedYear}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default App;