import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

const pageTitles: Record<string, string> = {
    '/': 'Project Overview',
    '/tasks': 'Tasks Board',
};

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname] || 'PM Dashboard';

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
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">📊</span>
                        Overview
                    </NavLink>
                    <NavLink
                        to="/tasks"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">📋</span>
                        Tasks
                    </NavLink>
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
                    <h1 className="main__title">{pageTitle}</h1>
                </header>
                <div className="main__content">
                    {children}
                </div>
            </main>
        </div>
    );
}
