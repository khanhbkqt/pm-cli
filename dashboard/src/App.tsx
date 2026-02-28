import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { TasksBoard } from './pages/TasksBoard';
import { AgentsPage } from './pages/AgentsPage';
import { ContextPage } from './pages/ContextPage';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/tasks" element={<TasksBoard />} />
                    <Route path="/agents" element={<AgentsPage />} />
                    <Route path="/context" element={<ContextPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
