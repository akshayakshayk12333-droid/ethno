import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../hooks/useAccessibility';
import { Settings, LogOut, Waves } from 'lucide-react';
import { Button } from '../components/Button';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useAccessibility();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(user ? `/${user.role.toLowerCase()}` : '/')}>
            <Waves className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-gray-900">VOICEBRIDGE</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Accessibility Settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {user.name} ({user.role})
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Accessibility Panel */}
      {showSettings && (
        <div className="absolute right-4 top-20 bg-white p-4 rounded-xl shadow-xl border z-50 w-80">
          <h3 className="font-semibold mb-4 text-gray-900">Accessibility Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Size</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ fontSize: 'normal' })}
                  className={`px-3 py-1 text-sm border rounded ${settings.fontSize === 'normal' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  A
                </button>
                <button 
                  onClick={() => updateSettings({ fontSize: 'large' })}
                  className={`px-3 py-1 text-lg border rounded ${settings.fontSize === 'large' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  A
                </button>
                <button 
                  onClick={() => updateSettings({ fontSize: 'extra-large' })}
                  className={`px-3 py-1 text-xl border rounded ${settings.fontSize === 'extra-large' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  A
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">High Contrast</label>
              <button 
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.highContrast ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};
