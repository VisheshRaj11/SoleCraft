
import { useState, useEffect } from 'react';
import axios from 'axios';

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: New password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resetToken, setResetToken] = useState(''); // Store token from OTP verification

  // Start timer for OTP resend
  const startTimer = () => {
    setTimer(60);
    setResendAvailable(false);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendAvailable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Request OTP
      const response = await axios.post('/api/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      
      if (response.data.success) {
        setStep(2);
        startTimer();
        setSuccess('OTP sent to your email');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/verify-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: otpString
      });
      
      if (response.data.success) {
        // Store the reset token for the final step
        if (response.data.resetToken) {
          setResetToken(response.data.resetToken);
        }
        
        setStep(3);
        setSuccess('OTP verified successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password with OTP
  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Use the new unified reset password endpoint
      const response = await axios.post('/api/auth/reset-password', {
        email: email.trim().toLowerCase(),
        resetToken: resetToken,
        password: newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password reset successful! You can now login with your new password.');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!resendAvailable) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      
      if (response.data.success) {
        setResendAvailable(false);
        startTimer();
        setSuccess('New OTP sent to your email');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close modal on background click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-6 md:mx-auto overflow-hidden">
        {/* Modal Container with responsive padding */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'Reset Password'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Step 1: Enter email for OTP */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enter your email address and we'll send you a 6-digit OTP to reset your password.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <p className="text-gray-500 text-xs">
                We will send a 6-digit OTP to your email. It expires in 10 minutes.
              </p>

              <button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enter the 6-digit OTP sent to <span className="font-semibold text-gray-900 break-all">{email}</span>
              </p>
              
              <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                ))}
              </div>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in {timer} seconds
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={!resendAvailable || isLoading}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full sm:flex-1 py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full sm:flex-1 py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Create your new password
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter new password"
                />
                <div className="mt-2 space-y-1">
                  <p className={`text-xs ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ At least 8 characters
                  </p>
                  <p className={`text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ Contains uppercase letter
                  </p>
                  <p className={`text-xs ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    ✓ Contains number
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-full sm:flex-1 py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full sm:flex-1 py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;