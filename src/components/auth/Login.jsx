import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
 const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  // Handle form submission
    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Login successful!');
    } catch (err) {
      console.log(err);
      
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Brand & Features */}
        <div className="lg:w-1/2 bg-gradient-to-br from-teal-500 to-blue-600 text-white p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SecureAuth</h1>
              <p className="text-sm text-white/80">Enterprise Security Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Enterprise Security</h3>
                <p className="text-white/80 mt-1">Bank-level encryption and multi-factor authentication</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4"
            >
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                <p className="text-white/80 mt-1">Monitor access patterns and security events</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-4"
            >
              <div className="mt-1 p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Single Sign-On</h3>
                <p className="text-white/80 mt-1">Integrate with your existing identity providers</p>
              </div>
            </motion.div>
          </div>

        
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            {/* Social Login Options */}
          
          

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                    placeholder="name@company.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-teal-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

            

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : loginSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Success! Redirecting...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Error Message */}
              <AnimatePresence>
                {errors.submit && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Keyboard Shortcut Hint */}
              <p className="text-xs text-center text-gray-500 mt-4">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl/Cmd</kbd> +{' '}
                <kbd className="px-2 py-1 bg-gray-100 rounded border">Enter</kbd> to submit
              </p>
            </form>

            

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center gap-6 text-xs text-gray-500">
                <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Security</a>
                <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;