import { Link } from 'react-router-dom';
import logo from '@/assets/logo/logo.png';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={logo} 
              alt="Fingnet Logo" 
              className="w-8 h-8 object-contain"
            />
            <div className="text-xl font-outfit text-gray-900">
              Fingnet
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-outfit font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            This is privacy
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;

