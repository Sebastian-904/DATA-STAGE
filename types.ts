export enum AppState {
    UPLOAD = 'UPLOAD',
    PROCESSING = 'PROCESSING',
    RESULTS = 'RESULTS',
}

export interface ProgressState {
    total: number;
    file: number;
    fileName: string;
}

export type ProcessedData = Record<string, string[][]>;

// Fix: Add missing KpiCardProps interface
export interface KpiCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
}
