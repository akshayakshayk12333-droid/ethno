
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Stethoscope, MessageSquare, Ear } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Breaking Communication <br className="hidden md:block"/> Barriers Through Technology
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Simple, accessible communication between patients and doctors. Designed specifically for deaf, hard-of-hearing, and non-speaking patients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')} className="shadow-lg shadow-blue-500/30">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="bg-white">
              Login to Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-100 text-primary rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">For Patients</h3>
            <p className="text-gray-600">Type your questions and symptoms easily in a familiar chat interface.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Stethoscope className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">For Doctors</h3>
            <p className="text-gray-600">Speak naturally using your microphone. Our AI handles the transcription instantly.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border text-center flex flex-col items-center">
            <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Ear className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Accessible Design</h3>
            <p className="text-gray-600">High contrast, large typography, and simple navigation designed for everyone.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
