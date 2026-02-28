import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    message?: string;
    inline?: boolean;
}

export function LoadingSpinner({ message, inline }: LoadingSpinnerProps) {
    return (
        <div className={`loading-spinner ${inline ? 'loading-spinner--inline' : ''}`}>
            <div className="loading-spinner__ring" />
            {message && <p className="loading-spinner__message">{message}</p>}
        </div>
    );
}
