import React, { useState } from "react";

function Signup({ onSignup, switchLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setTimeout(() => {
          onSignup({ name: username, email: email });
        }, 1500);
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/30 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-md text-left">
          <h2 className="text-6xl font-light text-white mb-6 tracking-tight">
            Join us today
          </h2>
          <p className="text-lg text-slate-300 mb-12 leading-relaxed font-light">
            Become part of a passionate community of cinephiles. Build your watchlist, rate films, and discover your next favorite movie.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-1 h-8 bg-teal-600 mt-1"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Free to Start</h3>
                <p className="text-sm text-slate-400">Create your account instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1 h-8 bg-teal-600 mt-1"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Your Taste</h3>
                <p className="text-sm text-slate-400">We learn from your preferences</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-1 h-8 bg-teal-600 mt-1"></div>
              <div>
                <h3 className="font-semibold text-white mb-1">Community First</h3>
                <p className="text-sm text-slate-400">Engage with genuine film lovers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-4xl font-light text-white mb-2 tracking-tight">MovieHive</h1>
            <p className="text-slate-400 text-sm font-light">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Username</label>
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 text-white placeholder-slate-500 rounded-sm border border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition font-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 text-white placeholder-slate-500 rounded-sm border border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition font-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 text-white placeholder-slate-500 rounded-sm border border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition font-light"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-3 rounded-sm transition duration-200 text-sm tracking-wide"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-sm text-center text-sm font-light ${isSuccess ? 'bg-teal-950/40 border border-teal-800/50 text-teal-300' : 'bg-red-950/40 border border-red-800/50 text-red-300'}`}>
              {message}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="text-center text-slate-400 text-sm font-light">
              Already have an account? {' '}
              <button 
                onClick={switchLogin}
                className="text-teal-500 hover:text-teal-400 font-medium cursor-pointer transition"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;