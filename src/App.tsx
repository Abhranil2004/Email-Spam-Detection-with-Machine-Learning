import React, { useState } from 'react';
import { Mail, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

function App() {
  const [emailText, setEmailText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSpamCheck = async () => {
    if (!emailText.trim()) {
      alert('Please enter an email to check');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailText })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();

      if (typeof data.isSpam === 'boolean' && typeof data.confidence === 'number') {
        setResult({
          isSpam: data.isSpam,
          confidence: data.confidence
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error checking spam:", error);
      alert("Error checking spam. The machine learning model is not running or not connected to the backend. Please make sure your backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailText('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Email Spam Detection</h1>
              <p className="text-sm text-gray-600">Emphasizes spam detection with ML</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center text-sm text-gray-600 space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Spam Detection Model Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Protect Your Inbox with ML
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter email content below and our trained model will analyze it for spam patterns.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <label htmlFor="email-text" className="block text-sm font-semibold text-gray-700 mb-3">
              <Mail className="inline w-4 h-4 mr-2" />
              Email Content
            </label>
            <textarea
              id="email-text"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Paste your email content here..."
              className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              disabled={isLoading}
            />
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>Enter the email content you want to analyze</span>
              <span>{emailText.length} characters</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleSpamCheck}
              disabled={isLoading || !emailText.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Check for Spam</span>
                </>
              )}
            </button>
            {(emailText || result) && (
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 flex items-center space-x-3 justify-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <div>
                <p className="text-blue-700 font-medium">Analyzing Email Content</p>
                <p className="text-blue-600 text-sm">Please wait...</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className={`rounded-xl p-6 border-2 ${result.isSpam ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${result.isSpam ? 'bg-red-100' : 'bg-green-100'}`}>
                  {result.isSpam ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${result.isSpam ? 'text-red-800' : 'text-green-800'}`}>
                    {result.isSpam ? 'This is a Spam Email' : 'This is Not a Spam Email'}
                  </h3>
                  <p className={`text-sm mt-1 ${result.isSpam ? 'text-red-600' : 'text-green-600'}`}>
                    Confidence: {result.confidence.toFixed(2)}%
                  </p>
                  <p className={`text-sm mt-2 ${result.isSpam ? 'text-red-700' : 'text-green-700'}`}>
                    {result.isSpam
                      ? 'Spam indicators detected. Be cautious with suspicious content, links, or requests.'
                      : 'This email appears to be safe and contains no major spam patterns.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ML-Powered Detection </h3>
            <p className="text-gray-600 text-sm">Trained on thousands of real-world spam and legitimate emails.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-Time Analysis</h3>
            <p className="text-gray-600 text-sm">Instant results with accuracy and confidence scoring.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">No data is stored or shared. Your content is safe.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 Email Spam Detection. Built with ❤️ by Abhranil.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;



