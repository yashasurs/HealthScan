import RegisterForm from '../components/RegisterForm';

// Pre-define SVG to reduce render work
const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
  </svg>
);

const Register = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-8 px-4 bg-gray-50">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 rounded-full bg-black flex items-center justify-center mb-3">
                        <UserPlusIcon />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Create an account
                    </h1>
                    <p className="text-sm text-gray-500">Join us today and get started</p>
                </div>

                <div className="p-6 shadow-md rounded-lg bg-white border border-gray-100">
                    <RegisterForm />
                </div>
                
                <div className="text-center text-xs text-gray-500">
                    By creating an account, you agree to our <a href="#" className="underline hover:text-gray-700">Terms</a> and <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default Register;