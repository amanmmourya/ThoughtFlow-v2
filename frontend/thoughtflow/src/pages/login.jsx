import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, MessageCircle, Sparkles, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login process
        const VITE_BACKEND_URL =import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'; 
        const response=await fetch(`${VITE_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        if(response.ok) {
            const data = await response.json();
    
            console.log('Login successful:', data);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in local storage
            toast.success('Login successful!');
            navigate('/chatoptions'); // Redirect to chat options page
        }else{
            const errorData = await response.json();
            toast.error(errorData.message || 'Login failed. Please try again.');
        }
    };

    const handleGoogleLogin = () => {
        // Google OAuth logic would go here
        console.log('Google login clicked');
    };

    return (
        <div className="min-h-screen bg-[#18181b] flex">
          
            {/* Right Panel - Login Form */}
            <div className="w-full flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#bd34fe] to-blue-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                            <p className="text-gray-400">Access your account to continue</p>
                        </div>

                        <div className="space-y-6">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium text-gray-300">
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-[#bd34fe] focus:outline-none focus:ring-2 focus:ring-[#bd34fe]/20 transition-all"
                                        placeholder="Enter your username or email"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-400 focus:border-[#bd34fe] focus:outline-none focus:ring-2 focus:ring-[#bd34fe]/20 transition-all"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#bd34fe] bg-gray-800 border-gray-600 rounded focus:ring-[#bd34fe] focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm text-gray-300">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-[#bd34fe] hover:text-blue-400 transition-colors">
                                    Forgot password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[#bd34fe] to-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#bd34fe]/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>

                        

                        {/* Sign Up Link */}
                        <p className="mt-6 text-center text-gray-400">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-[#bd34fe] hover:text-blue-400 font-medium transition-colors">
                                Create account
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;