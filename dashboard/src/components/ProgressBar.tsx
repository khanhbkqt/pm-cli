import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
    progress: number; // 0 to 100
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, size = 'sm', className = '' }) => {
    // Ensure progress is between 0 and 100
    const clampledProgress = Math.max(0, Math.min(100, Math.round(progress)));

    return (
        <div className={`progress-bar-container size-${size} ${className}`} title={`${clampledProgress}%`}>
            <div
                className="progress-bar-fill"
                style={{ width: `${clampledProgress}%` }}
                role="progressbar"
                aria-valuenow={clampledProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    );
};
