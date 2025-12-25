import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const loading = isVerifying || isResending;
  const [message, setMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Initialize component
  useEffect(() => {
    console.log('🚀 OTP Verification component mounted');

    // Get email from location state or localStorage
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    const storedTimestamp = localStorage.getItem('otpSentTimestamp');

    console.log('📧 Stored email:', storedEmail);
    console.log('📍 Location state:', location.state);

    const emailFromState = location.state?.email;
    const finalEmail = emailFromState || storedEmail;

    if (!finalEmail) {
      console.log('❌ No email found, redirecting to login');
      navigate('/login', {
        state: {
          message: 'Please register first to verify your email.',
          type: 'error'
        }
      });
      return;
    }

    setEmail(finalEmail);
    console.log('✅ Email set:', finalEmail);

    // Check registration success
    if (location.state?.registrationSuccess || location.state?.message?.includes('success')) {
      setRegistrationSuccess(true);
      console.log('✅ Registration success flag found');
    }

    // Check for stored timestamp
    if (storedTimestamp) {
      const timeElapsed = Date.now() - parseInt(storedTimestamp, 10);
      const remainingTime = Math.max(0, 600 - Math.floor(timeElapsed / 1000));

      console.log('⏰ Time elapsed:', timeElapsed, 'Remaining:', remainingTime);

      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setCanResend(false);
      } else {
        setCanResend(true);
      }
    } else {
      setCanResend(true);
    }

    // Focus on first input
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
        console.log('🎯 Focused on first OTP input');
      }
    }, 300);

  }, [location, navigate]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => {
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }, 10);
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    console.log('📋 Pasted data:', pastedData, 'Digits:', digits);

    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus on last filled input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    setTimeout(() => {
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    }, 10);
  };

  // Handle verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    console.log('🔐 Verifying OTP:', otpValue, 'for email:', email);

    if (otpValue.length !== 6) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit OTP'
      });
      return;
    }

    setIsVerifying(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🌐 Calling /api/auth/verify-registration-otp');

      const response = await axios.post('/api/auth/verify-registration-otp', {
        email,
        otp: otpValue
      }, {
        withCredentials: true,
        timeout: 10000
      });

      console.log('✅ OTP verification response:', response.data);

      if (response.data.success) {
        // Clear OTP data
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('otpSentTimestamp');

        // Get redirect path from backend or default to profile
        const redirectTo = response.data.redirectTo || '/profile';
        const successMessage = response.data.message || 'Email verified successfully!';

        console.log('🔄 Redirecting to:', redirectTo);

        // Navigate immediately
        navigate(redirectTo, {
          replace: true,
          state: {
            message: successMessage,
            type: 'success',
            email: response.data.user?.email || email
          }
        });

      } else {
        // Handle backend failure
        setMessage({
          type: 'error',
          text: response.data.message || 'OTP verification failed.'
        });
        setIsVerifying(false);
      }

    } catch (error) {
      console.error('❌ OTP verification error:', error);

      let errorMessage = 'OTP verification failed. Please try again.';

      if (error.response) {
        console.error('📡 Server response:', error.response.data);
        console.error('📊 Status:', error.response.status);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('🌐 No response received');
        errorMessage = 'Network error. Please check your connection.';
      } else {
        console.error('⚙️ Error setting up request:', error.message);
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 10);
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔄 Calling /api/auth/resend-registration-otp for:', email);

      const response = await axios.post('/api/auth/resend-registration-otp', {
        email
      }, {
        withCredentials: true,
        timeout: 10000
      });

      console.log('✅ Resend response:', response.data);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || 'Verification code sent to your email!'
        });

        // Start countdown
        setCountdown(600);
        setCanResend(false);

        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);

        // Store timestamp
        localStorage.setItem('otpSentTimestamp', Date.now().toString());

        // Focus on first input
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);

      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to send verification code.'
        });
        setCanResend(true);
      }

    } catch (error) {
      console.error('❌ Resend OTP error:', error);

      let errorMessage = 'Failed to send verification code. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many resend attempts. Please wait before trying again.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  // Start over
  const handleStartOver = () => {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('otpSentTimestamp');
    navigate('/login', {
      state: {
        message: 'Please register again to receive a new verification code.',
        type: 'info'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/login"
            onClick={handleStartOver}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
          <div className="text-xs text-gray-500">
            {countdown > 0 && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Expires in {formatTime(countdown)}
              </span>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {registrationSuccess ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-2">
            Registration successful! We sent a 6-digit code to:
          </p>
          <p className="font-medium text-gray-800 text-lg mb-4 break-all bg-gray-50 p-2 rounded">
            {email || 'Loading...'}
          </p>

          {countdown > 0 ? (
            <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
              <Clock className="w-4 h-4 mr-1" />
              <span>Code expires in {formatTime(countdown)}</span>
            </div>
          ) : (
            <div className="text-sm text-blue-600 mb-2">
              {canResend ? 'Click below to receive your verification code' : 'Code has expired'}
            </div>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <div className="flex items-start">
              <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`} />
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* OTP Input Section - ALWAYS SHOW */}
        <form onSubmit={handleVerify} className="mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter 6-digit code
            </label>
            <div
              className="flex justify-between gap-2 mb-2"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  inputMode="numeric"
                  disabled={loading}
                  placeholder="•"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Tip: You can paste the code (Ctrl+V)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        {/* Resend Button */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${canResend
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : canResend ? (
              'Send Verification Code'
            ) : (
              `Resend code in ${formatTime(countdown)}`
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Didn't receive the email?</span> Check your spam folder or try a different email.
            </p>
            <div className="text-center">
              <button
                onClick={handleStartOver}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Try with a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;