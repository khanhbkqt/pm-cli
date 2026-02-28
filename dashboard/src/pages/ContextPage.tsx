import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { fetchContext, searchContext } from '../api/client';
import { relativeTime } from '../utils';
import type { ContextEntry } from '../api/types';
import './ContextPage.css';

type CategoryFilter = 'all' | 'decision' | 'spec' | 'note' | 'constraint';

const CATEGORIES: { value: CategoryFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '📋' },
    { value: 'decision', label: 'Decisions', icon: '⚖️' },
    { value: 'spec', label: 'Specs', icon: '📄' },
    { value: 'note', label: 'Notes', icon: '📝' },
    { value: 'constraint', label: 'Constraints', icon: '🔒' },
];

function formatValue(value: string): string {
    try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
    } catch {
        return value;
    }
}

function isJson(value: string): boolean {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

export function ContextPage() {
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce search input
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    // Fetch data based on search or category
    const fetcher = useCallback(() => {
        if (debouncedSearch.trim()) {
            return searchContext(debouncedSearch.trim());
        }
        const filters: Record<string, string> = {};
        if (category !== 'all') filters.category = category;
        return fetchContext(filters);
    }, [debouncedSearch, category]);

    const { data: entries, loading, error } = useApi(fetcher);

    const handleToggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="context-page">
                <div className="context-page__toolbar">
                    <div className="context-page__search-wrap">
                        <span className="context-page__search-icon">🔍</span>
                        <input
                            className="context-page__search"
                            placeholder="Search context entries…"
                            disabled
                        />
                    </div>
                </div>
                <div className="context-page__categories">
                    {CATEGORIES.map((c) => (
                        <button key={c.value} className="context-page__cat-btn" disabled>
                            {c.icon} {c.label}
                        </button>
                    ))}
                </div>
                <div className="context-page__list">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="context-entry context-entry--skeleton">
                            <div className="context-entry__row">
                                <div className="skeleton" style={{ width: '30%', height: 16 }} />
                                <div className="skeleton" style={{ width: '15%', height: 14 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="context-page">
                <div className="context-page__error">
                    <span className="context-page__error-icon">⚠️</span>
                    <p>Failed to load context entries: {error}</p>
                </div>
            </div>
        );
    }

    const allEntries = entries || [];

    return (
        <div className="context-page">
            <div className="context-page__toolbar">
                <div className="context-page__search-wrap">
                    <span className="context-page__search-icon">🔍</span>
                    <input
                        className="context-page__search"
                        placeholder="Search context by key or value…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="context-page__search-clear"
                            onClick={() => setSearch('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="context-page__categories">
                {CATEGORIES.map((c) => (
                    <button
                        key={c.value}
                        className={`context-page__cat-btn ${category === c.value ? 'context-page__cat-btn--active' : ''}`}
                        onClick={() => { setCategory(c.value); setExpandedId(null); }}
                        disabled={!!debouncedSearch.trim()}
                    >
                        {c.icon} {c.label}
                    </button>
                ))}
            </div>

            {allEntries.length === 0 ? (
                <div className="context-page__empty">
                    <span className="context-page__empty-icon">📦</span>
                    <p className="context-page__empty-text">
                        {debouncedSearch
                            ? 'No context entries match your search'
                            : 'No context entries found'}
                    </p>
                </div>
            ) : (
                <div className="context-page__list">
                    <div className="context-page__list-header">
                        <span className="context-page__col-key">Key</span>
                        <span className="context-page__col-category">Category</span>
                        <span className="context-page__col-author">Author</span>
                        <span className="context-page__col-date">Updated</span>
                        <span className="context-page__col-expand" />
                    </div>
                    {allEntries.map((entry: ContextEntry) => (
                        <div
                            key={entry.id}
                            className={`context-entry ${expandedId === entry.id ? 'context-entry--expanded' : ''}`}
                        >
                            <button
                                className="context-entry__row"
                                onClick={() => handleToggleExpand(entry.id)}
                            >
                                <span className="context-entry__key">{entry.key}</span>
                                <span className={`context-entry__badge context-entry__badge--${entry.category}`}>
                                    {entry.category}
                                </span>
                                <span className="context-entry__author">{entry.created_by}</span>
                                <span className="context-entry__date">{relativeTime(entry.updated_at || entry.created_at)}</span>
                                <span className="context-entry__chevron">
                                    {expandedId === entry.id ? '▼' : '▶'}
                                </span>
                            </button>
                            {expandedId === entry.id && (
                                <div className="context-entry__detail">
                                    <div className="context-entry__value-wrap">
                                        <span className="context-entry__value-label">Value</span>
                                        <pre className={`context-entry__value ${isJson(entry.value) ? 'context-entry__value--json' : ''}`}>
                                            {formatValue(entry.value)}
                                        </pre>
                                    </div>
                                    <div className="context-entry__meta">
                                        <div className="context-entry__meta-item">
                                            <span className="context-entry__meta-label">Created by</span>
                                            <span className="context-entry__meta-val">{entry.created_by}</span>
                                        </div>
                                        <div className="context-entry__meta-item">
                                            <span className="context-entry__meta-label">Created</span>
                                            <span className="context-entry__meta-val">
                                                {new Date(entry.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        {entry.updated_at && entry.updated_at !== entry.created_at && (
                                            <div className="context-entry__meta-item">
                                                <span className="context-entry__meta-label">Updated</span>
                                                <span className="context-entry__meta-val">
                                                    {new Date(entry.updated_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
