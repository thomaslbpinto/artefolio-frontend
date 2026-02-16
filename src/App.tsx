import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/auth.context';
import { ThemeProvider } from './contexts/theme.context';
import { ProtectedRoute } from './components/routes/protected.route';
import { PublicRoute } from './components/routes/public.route';
import { Layout } from './components/layout';

import SignInPage from './pages/sign-in/sign-in.page';
import SignUpPage from './pages/sign-up/sign-up.page';
import CompleteGoogleSignUpPage from './pages/complete-google-sign-up/complete-google-sign-up.page';
import LinkGoogleAccountPage from './pages/link-google-account/link-google-account.page';
import VerifyEmailPage from './pages/verify-email/verify-email.page';
import EmailVerificationRequiredPage from './pages/email-verification-required/email-verification-required.page';
import ForgotPasswordPage from './pages/forgot-password/forgot-password.page';
import ResetPasswordPage from './pages/reset-password/reset-password.page';
import HomePage from './pages/home/home.page';
import NotFoundPage from './pages/not-found.page';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/sign-in"
              element={
                <PublicRoute>
                  <SignInPage />
                </PublicRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <PublicRoute>
                  <SignUpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/complete-google-sign-up"
              element={
                <PublicRoute>
                  <CompleteGoogleSignUpPage />
                </PublicRoute>
              }
            />
            <Route
              path="/link-google-account"
              element={
                <PublicRoute>
                  <LinkGoogleAccountPage />
                </PublicRoute>
              }
            />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/email-verification-required" element={<EmailVerificationRequiredPage />} />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
