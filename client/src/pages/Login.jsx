import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useStore from '../store/useStore';
import { authService } from '../services/api';
import AuthBackground from '../components/auth/AuthBackground';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import PasswordInput from '../components/auth/PasswordInput';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

export const Login = ({ initialMode = 'login' }) => {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/profile';

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Form Field States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-redirect authenticated users away from auth screen
  useEffect(() => {
    if (user && localStorage.getItem('paceforge_token')) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  // Keep mode in sync if URL location changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const switchMode = (newMode) => {
    setError('');
    setValidationErrors({});
    setMode(newMode);
    const targetUrl = newMode === 'signup' ? '/register' : '/login';
    window.history.replaceState(null, '', location.search ? `${targetUrl}${location.search}` : targetUrl);
  };

  // Validation Logic
  const validateLoginForm = () => {
    const errors = {};
    if (!loginForm.email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Enter a valid email address';
    if (!loginForm.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const errors = {};
    if (!signupForm.name.trim()) errors.name = 'Full athlete name is required';
    if (!signupForm.email.trim()) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errors.email = 'Enter a valid email address';
    if (!signupForm.password) errors.password = 'Password is required';
    else if (signupForm.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!termsAgreed) {
      errors.terms = 'You must agree to the Terms & Privacy Policy';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setError('');
    try {
      const response = await authService.login(loginForm);
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
      navigate(redirectPath);
    } catch (err) {
      if (!err.response) {
        setError('Backend server on port 5000 is unreachable. Make sure your backend server is running (npm start in server directory).');
      } else {
        setError(err.response?.data?.msg || 'Invalid credentials. Check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setLoading(true);
    setError('');
    try {
      const response = await authService.register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        membershipStatus: 'FREE'
      });
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
      navigate(redirectPath);
    } catch (err) {
      if (!err.response) {
        setError('Backend server on port 5000 is unreachable. Make sure your backend server is running (npm start in server directory).');
      } else {
        setError(err.response?.data?.msg || 'Unable to create account. Email may already be registered.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const token = credentialResponse.credential;
      let email = 'google.athlete@paceforge.com';
      let name = 'Google Athlete';

      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          if (payload.email) email = payload.email;
          if (payload.name) name = payload.name;
        } catch (e) {
          console.error('JWT Parse Error:', e);
        }
      }

      const response = await authService.googleAuth({ email, name });
      localStorage.setItem('paceforge_token', response.data.token);
      setUser(response.data.user);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.msg || 'Google Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 font-ironman overflow-hidden">
      {/* Layered Cinematic Background */}
      <AuthBackground />

      {/* Main Glass Card Wrapper */}
      <div className="flex-1 flex items-center justify-center my-auto py-6">
        <AuthCard>
          {/* Logo Brand Header */}
          <div className="text-center mb-8 sm:mb-10">
            <Link to="/" className="inline-flex items-center space-x-3 group mb-2">
              <img
                src="/logo.png"
                alt="PaceForge Logo"
                className="h-9 sm:h-11 w-auto group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic">
                PACE<span className="text-primary">FORGE</span>
              </div>
            </Link>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-primary/90">
              Train. Track. Conquer.
            </p>
          </div>

          {/* Mode Tabs Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black/60 border border-white/10 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,6,0,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] rounded-lg transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,6,0,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Server Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-primary/15 border border-primary/40 rounded-xl text-primary text-[11px] font-black uppercase tracking-widest text-center shadow-[0_0_25px_rgba(225,6,0,0.2)]"
            >
              {error}
            </motion.div>
          )}

          {/* Animated Mode Container */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              /* LOGIN FORM */
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">
                    Welcome <span className="text-primary">Back</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Ready to push your limits?
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
                  <AuthInput
                    id="login-email"
                    name="email"
                    label="Email Identity"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value });
                      if (validationErrors.email) setValidationErrors({ ...validationErrors, email: null });
                    }}
                    placeholder="ATHLETE@PACEFORGE.COM"
                    icon={Mail}
                    error={validationErrors.email}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />

                  <PasswordInput
                    id="login-password"
                    name="password"
                    label="Security Key"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (validationErrors.password) setValidationErrors({ ...validationErrors, password: null });
                    }}
                    placeholder="••••••••"
                    error={validationErrors.password}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-black border-white/20 text-primary focus:ring-primary focus:ring-offset-black"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Remember Me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
                    >
                      Forgot Key?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="hero-button w-full py-4 text-xs sm:text-sm font-black tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={18} />
                        <span>SIGNING IN...</span>
                      </>
                    ) : (
                      <>
                        <span>SIGN IN</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative bg-[#0A0A0A] px-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                    OR CONTINUE WITH
                  </span>
                </div>

                {/* Google Sign-In */}
                <div className="w-full flex justify-center py-1">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Sign-In was cancelled or failed.')}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                  />
                </div>

                {/* Switch to Signup */}
                <div className="text-center pt-2">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-primary font-black hover:text-white transition-colors underline underline-offset-4"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* SIGNUP FORM */
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">
                    Create Your <span className="text-primary">Account</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Start your performance journey.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
                  <AuthInput
                    id="signup-name"
                    name="name"
                    label="Full Name"
                    value={signupForm.name}
                    onChange={(e) => {
                      setSignupForm({ ...signupForm, name: e.target.value });
                      if (validationErrors.name) setValidationErrors({ ...validationErrors, name: null });
                    }}
                    placeholder="FULL ATHLETE NAME"
                    icon={User}
                    error={validationErrors.name}
                    autoComplete="name"
                    required
                    disabled={loading}
                  />

                  <AuthInput
                    id="signup-email"
                    name="email"
                    label="Email Identity"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => {
                      setSignupForm({ ...signupForm, email: e.target.value });
                      if (validationErrors.email) setValidationErrors({ ...validationErrors, email: null });
                    }}
                    placeholder="ATHLETE@PACEFORGE.COM"
                    icon={Mail}
                    error={validationErrors.email}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <PasswordInput
                      id="signup-password"
                      name="password"
                      label="Security Key"
                      value={signupForm.password}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, password: e.target.value });
                        if (validationErrors.password) setValidationErrors({ ...validationErrors, password: null });
                      }}
                      placeholder="••••••••"
                      error={validationErrors.password}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />

                    <PasswordInput
                      id="signup-confirm-password"
                      name="confirmPassword"
                      label="Confirm Key"
                      value={signupForm.confirmPassword}
                      onChange={(e) => {
                        setSignupForm({ ...signupForm, confirmPassword: e.target.value });
                        if (validationErrors.confirmPassword) setValidationErrors({ ...validationErrors, confirmPassword: null });
                      }}
                      placeholder="••••••••"
                      error={validationErrors.confirmPassword}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => {
                          setTermsAgreed(e.target.checked);
                          if (validationErrors.terms) setValidationErrors({ ...validationErrors, terms: null });
                        }}
                        className="w-4 h-4 mt-0.5 rounded bg-black border-white/20 text-primary focus:ring-primary focus:ring-offset-black"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        I agree to the <span className="text-white underline">Terms of Service</span> & <span className="text-white underline">Privacy Policy</span>
                      </span>
                    </label>
                    {validationErrors.terms && (
                      <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-wider">
                        {validationErrors.terms}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="hero-button w-full py-4 text-xs sm:text-sm font-black tracking-widest flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin text-white" size={18} />
                        <span>CREATING ACCOUNT...</span>
                      </>
                    ) : (
                      <>
                        <span>CREATE ACCOUNT</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Switch to Login */}
                <div className="text-center pt-2">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-primary font-black hover:text-white transition-colors underline underline-offset-4"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AuthCard>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
};

export default Login;
