/* ============================================================
   TaskFlow – Root App component: Providers + Router
   ============================================================ */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

/* Styles */
import './styles/variables.css';
import './styles/global.css';

/* Providers */
import { AuthProvider }         from './context/AuthContext.jsx';
import { ThemeProvider }        from './context/ThemeContext.jsx';
import { SocketProvider }       from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

/* Route guards */
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute    from './routes/PublicRoute.jsx';

/* Layout */
import AppLayout  from './components/layout/AppLayout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

/* Pages */
import Landing     from './pages/Landing.jsx';
import Login       from './pages/Login.jsx';
import Register    from './pages/Register.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import Applications from './pages/Applications.jsx';
import Tasks       from './pages/Tasks.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import Analytics   from './pages/Analytics.jsx';
import Profile     from './pages/Profile.jsx';
import Settings    from './pages/Settings.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import NotFound    from './pages/NotFound.jsx';

import { ROUTES } from './utils/constants.js';

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background:   'var(--bg-card)',
                    color:        'var(--text-primary)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow:    'var(--shadow-lg)',
                    fontFamily:   'var(--font-body)',
                    fontSize:     '0.875rem',
                  },
                  success: { iconTheme: { primary: '#10b981', secondary: '#fff' }, duration: 3000 },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' }, duration: 4000 },
                }}
              />

              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public routes */}
                  <Route
                    path={ROUTES.HOME}
                    element={
                      <PublicRoute>
                        <Landing />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.LOGIN}
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path={ROUTES.REGISTER}
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* Protected app routes (all share AppLayout) */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path={ROUTES.DASHBOARD}    element={<Dashboard />}   />
                    <Route path={ROUTES.APPLICATIONS} element={<Applications />} />
                    <Route path={ROUTES.TASKS}        element={<Tasks />}       />
                    <Route path={ROUTES.CALENDAR}     element={<CalendarPage />} />
                    <Route path={ROUTES.ANALYTICS}    element={<Analytics />}   />
                    <Route path={ROUTES.PROFILE}      element={<Profile />}     />
                    <Route path={ROUTES.SETTINGS}     element={<Settings />}    />
                    <Route path="/activity"           element={<ActivityLog />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
