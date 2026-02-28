import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { TasksBoard } from './pages/TasksBoard';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/tasks" element={<TasksBoard />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
