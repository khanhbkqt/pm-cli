import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Overview } from './pages/Overview';
import { AgentsPage } from './pages/AgentsPage';
import { ContextPage } from './pages/ContextPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { PhasesPage } from './pages/PhasesPage';
import { PlansPage } from './pages/PlansPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { BoardPage } from './pages/BoardPage';
import { BugsPage } from './pages/BugsPage';

function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/milestones" element={<MilestonesPage />} />
                        <Route path="/milestones/:milestoneId/phases" element={<PhasesPage />} />
                        <Route path="/phases/:phaseId/plans" element={<PlansPage />} />
                        <Route path="/plans/:planId" element={<PlanDetailPage />} />
                        <Route path="/agents" element={<AgentsPage />} />
                        <Route path="/context" element={<ContextPage />} />
                        <Route path="/board" element={<BoardPage />} />
                        <Route path="/bugs" element={<BugsPage />} />
                    </Routes>
                </Layout>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;

