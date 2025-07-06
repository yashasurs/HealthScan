import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pre-defined SVG components for performance
const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const ScanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const MobileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {/* Phone outline */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" />
    {/* Screen */}
    <rect x="8" y="5" width="8" height="11" rx="1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} fill="currentColor" fillOpacity="0.1" />
    {/* Home button */}
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
    {/* Screen content lines representing health records */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 7h4M10 9h3M10 11h4" stroke="currentColor" opacity="0.6" />
  </svg>
);

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
              <div className="lg:col-span-6 text-white mb-12 lg:mb-0">
                <div className="max-w-lg lg:max-w-none">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                    Digitizing Healthcare
                    <span className="block text-blue-200">Records for India</span>
                  </h1>
                  <p className="mt-6 text-xl lg:text-2xl text-blue-100 leading-relaxed">
                    Simple, secure, and accessible digital health records for Primary Health Centers across India
                  </p>
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Get Started
                    </Link>
                    <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-200 text-lg font-medium rounded-lg text-blue-100 hover:bg-blue-50 hover:text-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-30"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm transform hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <QrCodeIcon />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">HealthScan</span>
                      </div>                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                        <img
                          src="/QR.svg"
                          alt="QR Code for HealthScan"
                          className="w-40 h-40 mx-auto"
                        />
                      </div>
                      <p className="text-gray-600 font-medium">
                        Scan to access patient records instantly
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>{/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform simplifies health record management for PHCs across India with a simple three-step process
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300"></div>

            <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 mx-auto relative z-10">
                <ScanIcon />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Scan Documents</h3>
                <p className="text-gray-600 leading-relaxed">
                  Easily scan patient records, prescriptions, test results, and medical histories using your smartphone or scanner.
                </p>
              </div>
            </div>

            <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 mx-auto relative z-10">
                <QrCodeIcon />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Generate QR Codes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our system automatically generates secure QR codes linked to the patient's digital health record.
                </p>
              </div>
            </div>

            <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 mx-auto relative z-10">
                <MobileIcon />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Access Anywhere</h3>
                <p className="text-gray-600 leading-relaxed">
                  Healthcare providers can instantly access patient records by scanning the QR code with any smartphone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Benefits for Indian PHCs
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Our solution addresses the unique challenges faced by Primary Health Centers in rural and urban India.
              </p>
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Reduced Paperwork</h4>
                    <p className="text-gray-600 leading-relaxed">Minimize the burden of physical record-keeping and storage space requirements.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Improved Patient Care</h4>
                    <p className="text-gray-600 leading-relaxed">Quick access to complete patient histories enables better diagnosis and treatment.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Works Offline</h4>                    <p className="text-gray-600 leading-relaxed">Designed to function in areas with limited internet connectivity.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Multilingual Support</h4>
                    <p className="text-gray-600 leading-relaxed">Available in Hindi, English, and major regional languages across India.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-10"></div>                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      Empowering Healthcare Digitization
                    </div>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                      Our platform is designed to bridge the digital divide in healthcare record management, 
                      specifically addressing the unique challenges faced by Primary Health Centers across India.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-blue-600">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Secure</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium">Fast</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium">Reliable</span>
                      </div>
                    </div>
                  </div>                  <div className="mt-10 pt-8 border-t border-blue-200">
                    <div className="text-center">
                      <h4 className="text-xl font-semibold text-gray-900 mb-6">Platform Features</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">📱</div>
                          <p className="text-sm text-gray-600 font-medium mt-2">Mobile Friendly</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">🔒</div>
                          <p className="text-sm text-gray-600 font-medium mt-2">Secure Storage</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">⚡</div>
                          <p className="text-sm text-gray-600 font-medium mt-2">Quick Access</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Doctor Registration Section - Only show for authenticated users who aren't doctors yet */}
      {isAuthenticated && user?.role !== 'DOCTOR' && (
        <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2m14 0H5m9-16l3 3m-3-3v12" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Are You a Medical Professional?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join our platform as a verified doctor to access patient records and provide better healthcare services
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Doctor Registration Benefits</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Access Patient Records</h4>
                        <p className="text-gray-600">View complete medical histories of your assigned patients</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Professional Dashboard</h4>
                        <p className="text-gray-600">Manage your practice with our comprehensive doctor portal</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Verified Credentials</h4>
                        <p className="text-gray-600">Build trust with patients through verified medical credentials</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Simple Registration Process</h4>
                    <p className="text-gray-600 mb-6">Upload your medical credentials for quick verification</p>
                    <Link 
                      to="/doctor/register"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Register as Doctor
                    </Link>
                    <p className="text-xs text-gray-500 mt-3">
                      Verification typically takes 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to transform your PHC?</span>
            <span className="block text-indigo-200">Start digitizing health records today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a href="#contact" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800" id="contact">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                About Us
              </h3>
              <p className="mt-4 text-base text-gray-300">
                We're committed to modernizing healthcare infrastructure in India through accessible digital solutions.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Contact
              </h3>
              <ul className="mt-4 space-y-2">
                <li className="text-base text-gray-300">
                  Email: contact@healthscan.in
                </li>
                <li className="text-base text-gray-300">
                  Phone: +91 98765 43210
                </li>
                <li className="text-base text-gray-300">
                  Address: Bengaluru, Karnataka
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Supported By
              </h3>
              <ul className="mt-4 space-y-2">
                <li className="text-base text-gray-300">
                  Ministry of Health & Family Welfare
                </li>
                <li className="text-base text-gray-300">
                  National Health Mission
                </li>
                <li className="text-base text-gray-300">
                  Digital India Initiative
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 HealthScan India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;