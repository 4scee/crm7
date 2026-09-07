import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import ContactsPage from './pages/ContactsPage';
import DealsPage from './pages/DealsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/cuentas" element={<AccountsPage />} />
      <Route path="/cuentas/:id" element={<AccountDetailPage />} />
      <Route path="/contactos" element={<ContactsPage />} />
      <Route path="/oportunidades" element={<DealsPage />} />
    </Routes>
  );
}
