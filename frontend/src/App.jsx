import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

import HomePage from './pages/HomePage';
import PetDetailPage from './pages/PetDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PublishPetPage from './pages/PublishPetPage';
import EditPetPage from './pages/EditPetPage';
import MyListingsPage from './pages/MyListingsPage';
import AdoptedPage from './pages/AdoptedPage';
import FavoritesPage from './pages/FavoritesPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="mascotas/:id" element={<PetDetailPage />} />
                <Route path="ingresar" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="verificar-email" element={<VerifyEmailPage />} />
                <Route path="olvide-password" element={<ForgotPasswordPage />} />
                <Route path="restablecer-password" element={<ResetPasswordPage />} />

                <Route path="publicar" element={<ProtectedRoute><PublishPetPage /></ProtectedRoute>} />
                <Route path="mascotas/:id/editar" element={<ProtectedRoute><EditPetPage /></ProtectedRoute>} />
                <Route path="mis-publicaciones" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                <Route path="adoptadas" element={<ProtectedRoute><AdoptedPage /></ProtectedRoute>} />
                <Route path="favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="mensajes" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="mensajes/:conversationId" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="notificaciones" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
