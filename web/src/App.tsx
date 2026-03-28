import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import UploadScreen from './pages/UploadScreen';
import ReviewScreen from './pages/ReviewScreen';
import PayrollSummaryScreen from './pages/PayrollSummaryScreen';
import SettingsScreen from './pages/SettingsScreen';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<UploadScreen />} />
            <Route path="/review/:id" element={<ReviewScreen />} />
            <Route path="/payroll" element={<PayrollSummaryScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
