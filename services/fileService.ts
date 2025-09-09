import { ProgressState, ProcessedData } from '../types';
import { FILE_NAMES } from '../constants';

declare const JSZip: any;
declare const XLSX: any;

export const processZipFile = async (
    file: File,
    onLog: (message: string) => void,
    onProgress: (progress: ProgressState) => void,
    cancellationSignal: { current: boolean }
): Promise<ProcessedData> => {
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library not found. Please ensure it is loaded.');
    }

    onLog('Iniciando análisis del archivo ZIP...');
    const zip = await JSZip.loadAsync(file);
    const files = Object.keys(zip.files).filter(name => !zip.files[name].dir && name.toLowerCase().endsWith('.asc'));
    
    onLog(`Archivos .asc encontrados en el ZIP (${files.length}): ${files.join(', ')}`);

    if (files.length === 0) {
        throw new Error('No se encontraron archivos .asc en el ZIP. Asegúrese que el ZIP contiene archivos con extensión .asc (501.asc, etc.)');
    }

    const processedData: ProcessedData = {};
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
        if (cancellationSignal.current) {
            throw new Error('Operation cancelled by user.');
        }

        const fileName = files[i];
        
        const nameWithoutExtension = fileName.split('.')[0];
        const parts = nameWithoutExtension.split('_');
        const fileNumber = parts[parts.length - 1];

        try {
            onProgress({ total: Math.round(((i + 1) / totalFiles) * 100), file: 0, fileName });
            onLog(`[${i + 1}/${totalFiles}] Procesando ${fileName}...`);
            
            const content = await zip.file(fileName).async('text');
            onProgress({ total: Math.round(((i + 1) / totalFiles) * 100), file: 50, fileName });

            if (!content) {
                onLog(`Advertencia: ${fileName} está vacío - Saltando...`);
                continue;
            }

            const lines = content.split('\n').filter(line => line.trim() !== '');
            if (lines.length > 0 && !lines[0].includes('|')) {
                onLog(`Error de formato: El archivo ${fileName} no parece estar separado por pipes '|'.`);
                continue;
            }

            processedData[fileNumber] = lines.map(line => line.split('|'));
            onLog(`✅ ${fileName} procesado correctamente con ${lines.length} registros.`);
            onProgress({ total: Math.round(((i + 1) / totalFiles) * 100), file: 100, fileName });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            onLog(`❌ Error procesando ${fileName}: ${errorMessage}`);
            console.error(`Error processing ${fileName}:`, error);
        }
    }
    
    if (Object.keys(processedData).length === 0 && !cancellationSignal.current) {
        throw new Error('No se pudo procesar ningún archivo .asc correctamente.');
    }

    return processedData;
};

export const generateSeparateSheetsExcelReport = (data: ProcessedData, month: string, year: number) => {
    if (typeof XLSX === 'undefined') {
        alert('XLSX library not found. Cannot generate Excel file.');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        const sectionsToExport = Object.keys(data);
        
        sectionsToExport.forEach(section => {
            if (data[section]) {
                const ws = XLSX.utils.aoa_to_sheet(data[section]);
                const sheetName = FILE_NAMES[section] || section;
                XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
            }
        });

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Reporte_Consolidado_${month}_${year}.xlsx`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error('Error generating consolidated report:', error);
        alert('Ocurrió un error al generar el reporte consolidado. Revise la consola para más detalles.');
    }
};

export const generateIndividualExcelFiles = async (data: ProcessedData, month: string, year: number) => {
    if (typeof XLSX === 'undefined' || typeof JSZip === 'undefined') {
        alert('Librerías (XLSX o JSZip) no encontradas. No se pueden generar los archivos.');
        return;
    }

    try {
        const zip = new JSZip();
        const sectionsToExport = Object.keys(data);

        sectionsToExport.forEach(section => {
            if (data[section]) {
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(data[section]);
                const sheetName = FILE_NAMES[section] || section;
                
                XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); 
                
                const fileName = `Reporte_${section}.xlsx`;
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                zip.file(fileName, excelBuffer);
            }
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `Reportes_Individuales_${month}_${year}.zip`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error generating individual reports ZIP:', error);
        alert('Ocurrió un error al generar el archivo ZIP. Revise la consola para más detalles.');
    }
};