import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const App = () => {
  const [appDetails, setAppDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setTimer(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('Starting generation...');
    startTimer();

    try {
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appDetails })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      setMessage('App files generated successfully! Check your downloads folder.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setIsLoading(false);
      stopTimer();
    }
  };

  const getStatusMessage = () => {
    if (timer < 30) return "Analyzing requirements...";
    if (timer < 60) return "Generating code structure...";
    if (timer < 90) return "Creating implementation...";
    return "Almost done...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Business App Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform your ideas into code with AI
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Textarea Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your app requirements in detail:
              </label>
              <textarea
                value={appDetails}
                onChange={(e) => setAppDetails(e.target.value)}
                className="w-full h-48 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                placeholder="Example: I need an e-commerce app with user authentication, product catalog, shopping cart, and payment integration..."
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-200 ease-in-out
                ${isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              <span className="flex items-center justify-center">
                {isLoading && (
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                )}
                {isLoading ? 'Generating...' : 'Generate App'}
              </span>
            </button>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-700 font-medium">
                  Generation in progress
                </span>
                <span className="text-blue-600">
                  {timer} seconds
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-blue-100 rounded-full mb-4">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((timer / 90) * 100, 100)}%` }}
                />
              </div>
              
              {/* Status Message */}
              <p className="text-blue-600 text-sm">
                {getStatusMessage()}
              </p>
            </div>
          )}

          {/* Result Message */}
          {message && !isLoading && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('Error')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}>
              <p className="text-center font-medium">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Generation typically takes 1-2 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default App;