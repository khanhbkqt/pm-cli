import './ErrorMessage.css';

interface ErrorMessageProps {
    message: string;
    onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="error-message">
            <div className="error-message__content">
                <span className="error-message__icon">⚠</span>
                <div className="error-message__text">
                    <p className="error-message__title">Something went wrong</p>
                    <p className="error-message__detail">{message}</p>
                </div>
            </div>
            <button className="error-message__retry" onClick={onRetry}>
                Retry
            </button>
        </div>
    );
}
