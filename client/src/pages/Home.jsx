import React from 'react';
import { Link } from 'react-router-dom';

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

const CloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const MobileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="md:flex md:items-center md:space-x-8">
              <div className="md:w-1/2 text-white mb-10 md:mb-0">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Digitizing Healthcare Records for Rural India
                </h1>
                <p className="mt-6 text-lg md:text-xl text-blue-50">
                  Simple, secure, and accessible digital health records for Primary Health Centers across India
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-800 hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700">
                    Get Started
                  </Link>
                  <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Learn More
                  </a>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative h-64 sm:h-72 md:h-80 rounded-lg shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-700 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="px-6 py-4 bg-white bg-opacity-90 rounded-lg shadow-lg max-w-sm">
                      <div className="flex items-center justify-center mb-4">
                        <QrCodeIcon />
                        <span className="ml-2 text-xl font-semibold text-gray-800">HealthScan QR</span>
                      </div>
                      <div className="bg-gray-200 rounded-lg p-4 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-32 h-32">
                          <path d="M30,30 L30,45 L45,45 L45,30 L30,30" fill="#000" />
                          <path d="M55,30 L55,45 L70,45 L70,30 L55,30" fill="#000" />
                          <path d="M30,55 L30,70 L45,70 L45,55 L30,55" fill="#000" />
                          <rect x="55" y="55" width="5" height="5" fill="#000" />
                          <rect x="65" y="55" width="5" height="5" fill="#000" />
                          <rect x="55" y="65" width="5" height="5" fill="#000" />
                          <rect x="65" y="65" width="5" height="5" fill="#000" />
                          <rect x="50" y="30" width="3" height="3" fill="#000" />
                          <rect x="50" y="40" width="3" height="3" fill="#000" />
                          <rect x="30" y="50" width="3" height="3" fill="#000" />
                          <rect x="40" y="50" width="3" height="3" fill="#000" />
                          <rect x="50" y="50" width="3" height="3" fill="#000" />
                        </svg>
                      </div>
                      <p className="mt-3 text-center text-sm text-gray-600">
                        Scan to access patient records
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies health record management for PHCs across India
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-5">
                <ScanIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scan Documents</h3>
              <p className="text-gray-600">
                Easily scan patient records, prescriptions, test results, and medical histories using your smartphone or scanner.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-5">
                <QrCodeIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate QR Codes</h3>
              <p className="text-gray-600">
                Our system automatically generates secure QR codes linked to the patient's digital health record.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white mb-5">
                <MobileIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Anywhere</h3>
              <p className="text-gray-600">
                Healthcare providers can instantly access patient records by scanning the QR code with any smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Benefits for Indian PHCs
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Our solution addresses the unique challenges faced by Primary Health Centers in rural and urban India.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Reduced Paperwork</h4>
                    <p className="mt-1 text-gray-600">Minimize the burden of physical record-keeping and storage space requirements.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Improved Patient Care</h4>
                    <p className="mt-1 text-gray-600">Quick access to complete patient histories enables better diagnosis and treatment.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Works Offline</h4>
                    <p className="mt-1 text-gray-600">Designed to function in areas with limited internet connectivity.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Multilingual Support</h4>
                    <p className="mt-1 text-gray-600">Available in Hindi, English, and major regional languages across India.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 lg:ml-10">
              <div className="bg-indigo-50 p-6 rounded-lg">
                <blockquote>
                  <div className="text-xl font-medium text-gray-900">
                    "This system has transformed how we manage patient records at our PHC. What used to take hours now takes seconds."
                  </div>
                  <footer className="mt-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-full bg-indigo-200 h-12 w-12 flex items-center justify-center text-indigo-500 font-bold text-xl">
                        DR
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-medium text-gray-900">Dr. Rajesh Sharma</div>
                        <div className="text-sm text-gray-500">PHC Medical Officer, Uttar Pradesh</div>
                      </div>
                    </div>
                  </footer>
                </blockquote>
                
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <div className="text-center">
                    <h4 className="text-lg font-medium text-gray-900">Our impact in numbers</h4>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">500+</p>
                        <p className="text-sm text-gray-500">PHCs served</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">2M+</p>
                        <p className="text-sm text-gray-500">Patient records</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">14</p>
                        <p className="text-sm text-gray-500">States</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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