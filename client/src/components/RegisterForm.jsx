import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Pre-define SVG components to reduce render work
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const BloodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
  </svg>
);

const IdIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zM6.606 9.81a1 1 0 011.11-.81 1 1 0 01.81 1.11 1 1 0 11-1.92-.3z" clipRule="evenodd" />
  </svg>
);

const MedicalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [allergies, setAllergies] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        
        if (!bloodGroup) {
            setError("Please select your blood group");
            return;
        }
        
        setIsLoading(true);
        
        try {
            const userData = {
                username: username,
                email: email,
                password: password,
                blood_group: bloodGroup,
                aadhar: aadhar || null,
                allergies: allergies || null,
                doctor_name: doctorName || null,
                visit_date: visitDate ? new Date(visitDate).toISOString() : null
            };
            
            await register(userData);
            navigate('/home');
            
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred during registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full">
            {error && (
                <div className="bg-red-50 border-l-2 border-red-400 p-3 rounded mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <EmailIcon />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                            Blood Group *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <BloodIcon />
                            </div>
                            <select
                                id="bloodGroup"
                                name="bloodGroup"
                                required
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-8 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm bg-white"
                            >
                                <option value="">Select your blood group</option>
                                {bloodGroupOptions.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">
                            Aadhar Number (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IdIcon />
                            </div>
                            <input
                                id="aadhar"
                                name="aadhar"
                                type="text"
                                maxLength="12"
                                pattern="[0-9]{12}"
                                value={aadhar}
                                onChange={(e) => setAadhar(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Enter 12-digit Aadhar number"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                            Allergies (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                                <MedicalIcon />
                            </div>
                            <textarea
                                id="allergies"
                                name="allergies"
                                rows="2"
                                value={allergies}
                                onChange={(e) => setAllergies(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm resize-none"
                                placeholder="List any allergies you may have"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
                            Doctor Name (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon />
                            </div>
                            <input
                                id="doctorName"
                                name="doctorName"
                                type="text"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Enter your doctor's name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Visit Date (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon />
                            </div>
                            <input
                                id="visitDate"
                                name="visitDate"
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Create a password"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon />
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full appearance-none rounded border border-gray-300 pl-10 pr-3 py-2 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full rounded border border-transparent bg-black py-2 px-4 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Creating account..." : "Create account"}
                </button>

                <div className="mt-4 text-center">
                    <div className="text-xs text-gray-600">
                        Already have an account?{" "}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
