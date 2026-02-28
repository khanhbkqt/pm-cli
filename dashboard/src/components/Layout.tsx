import { useState, type ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__logo">
                        <span className="sidebar__logo-icon">◈</span>
                        <span className="sidebar__logo-text">PM Dashboard</span>
                    </div>
                    <button
                        className="sidebar__close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        ✕
                    </button>
                </div>
                <nav className="sidebar__nav">
                    <a href="#" className="sidebar__link sidebar__link--active">
                        <span className="sidebar__link-icon">📊</span>
                        Overview
                    </a>
                    <a href="#" className="sidebar__link sidebar__link--disabled">
                        <span className="sidebar__link-icon">📋</span>
                        Tasks
                    </a>
                    <a href="#" className="sidebar__link sidebar__link--disabled">
                        <span className="sidebar__link-icon">👥</span>
                        Agents
                    </a>
                    <a href="#" className="sidebar__link sidebar__link--disabled">
                        <span className="sidebar__link-icon">📦</span>
                        Context
                    </a>
                </nav>
                <div className="sidebar__footer">
                    <span className="sidebar__version">v1.1.0</span>
                </div>
            </aside>

            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

            <main className="main">
                <header className="main__header">
                    <button
                        className="main__hamburger"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>
                    <h1 className="main__title">Project Overview</h1>
                </header>
                <div className="main__content">
                    {children}
                </div>
            </main>
        </div>
    );
}
