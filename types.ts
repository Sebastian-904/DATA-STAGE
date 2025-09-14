export enum AppState {
    UPLOAD = 'UPLOAD',
    PROCESSING = 'PROCESSING',
    RESULTS = 'RESULTS',
}

export enum ReportMode {
    MONTHLY = 'MONTHLY',
    ANNUAL = 'ANNUAL',
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