import React from 'react';
import LoginForm from '../components/LoginForm';

// Pre-define SVG to reduce render work
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const Login = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-8 px-4 bg-gray-50">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 rounded-full bg-black flex items-center justify-center mb-3">
                        <UserIcon />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Welcome back
                    </h1>
                    <p className="text-sm text-gray-500">Sign in to your account</p>
                </div>

                <div className="p-6 shadow-md rounded-lg bg-white border border-gray-100">
                    <LoginForm />
                </div>
                
                <div className="text-center text-xs text-gray-500">
                    By signing in, you agree to our <a href="#" className="underline hover:text-gray-700">Terms</a> and <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default Login;