import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ form: 'Please fill in all fields' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }, { withCredentials: true });

      if (response.data.success) {
        if (onLoginSuccess) onLoginSuccess(response.data.user);
        navigate('/profile');
      } else {
        setErrors({ form: response.data.message || 'Login failed' });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Invalid email or password' });
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem('pendingVerificationEmail', formData.email.trim().toLowerCase());
        navigate('/otp-verification', { replace: true });
      } else {
        setErrors({ form: response.data.message || 'Registration failed' });
        setIsLoading(false);
      }
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Registration failed' });
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => activeTab === 'login' ? handleLogin(e) : handleSignup(e);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:block space-y-12 pr-12">
          <div>
            <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              SHOECREATIFY.
            </h1>
            <p className="text-xl text-gray-400">Design the future of footwear in high-fidelity 3D.</p>
          </div>

          <div className="space-y-8">
            <Feature icon="👟" title="3D Design Studio" desc="Professional grade editor for custom silhouettes." />
            <Feature icon="🎨" title="Smart Texturing" desc="Apply premium materials and AI-generated patterns." />
            <Feature icon="⚡" title="Instant Preview" desc="Real-time ray-traced rendering of your designs." />
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-gray-500 text-sm">
              {activeTab === 'login' ? 'Continue your creative journey' : 'Join the community of 3D designers'}
            </p>
          </div>

          {/* Custom Dark Tabs */}
          <div className="flex mb-8 bg-white/5 rounded-2xl p-1.5 border border-white/5">
            {['login', 'signup'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
              </div>
            )}

            <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="name@domain.com" />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="••••••••" />

            {activeTab === 'signup' && (
              <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" />
            )}

            {activeTab === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">
                  Forgot Password?
                </button>
              </div>
            )}

            {errors.form && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <span className="text-red-500 text-sm">{errors.form}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#111111] px-4 text-gray-500 font-bold">Or</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" className="opacity-70" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" className="opacity-50" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" className="opacity-80" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
};

/* Helper Components */
const Feature = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">{icon}</div>
    <div>
      <h3 className="font-bold text-white uppercase tracking-wider text-sm">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">{label}</label>
    <input
      {...props}
      className={`w-full bg-white/5 border rounded-2xl px-5 py-4 focus:outline-none transition-all placeholder:text-gray-700 text-sm ${
        error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500'
      }`}
    />
    {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
);

export default Login;