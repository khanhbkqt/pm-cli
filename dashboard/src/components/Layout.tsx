import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

const pageTitles: Record<string, string> = {
    '/': 'Project Overview',
    '/milestones': 'Milestones',
    '/board': 'Plans Board',
    '/agents': 'Agents',
    '/bugs': 'Bugs',
    '/context': 'Context',
};

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
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
                        to="/milestones"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">🎯</span>
                        Milestones
                    </NavLink>
                    <NavLink
                        to="/board"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">📋</span>
                        Plans Board
                    </NavLink>
                    <NavLink
                        to="/agents"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">👥</span>
                        Agents
                    </NavLink>
                    <NavLink
                        to="/bugs"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">🐛</span>
                        Bugs
                    </NavLink>
                    <NavLink
                        to="/context"
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sidebar__link-icon">📦</span>
                        Context
                    </NavLink>
                </nav>
                <div className="sidebar__footer">
                    <button
                        className="sidebar__theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                    </button>
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
