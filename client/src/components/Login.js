import React,{useState} from 'react';

export default function Login({onLogin,switchSignup}){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e)=>{
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try{
            const res = await fetch('http://localhost:3001/api/auth/login',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password})
            });
            const data = await res.json();
            if(res.ok) onLogin(data.user);
            else setError(data.msg);
        }catch(err){
            setError('Server error');
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
            {/* Left side - Hero */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-950/30 via-transparent to-transparent"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 max-w-md text-left">
                    <h2 className="text-6xl font-light text-white mb-6 tracking-tight">
                        Discover Cinema
                    </h2>
                    <p className="text-lg text-slate-300 mb-12 leading-relaxed font-light">
                        Experience an expertly curated collection of films from around the world. Connect with a community of cinema enthusiasts.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-8 bg-teal-600 mt-1"></div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Personalized Picks</h3>
                                <p className="text-sm text-slate-400">Recommendations tailored to your taste</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-8 bg-teal-600 mt-1"></div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Your Library</h3>
                                <p className="text-sm text-slate-400">Build and manage your watchlist</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-8 bg-teal-600 mt-1"></div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Connect & Share</h3>
                                <p className="text-sm text-slate-400">Share reviews with fellow cinephiles</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-light text-white mb-2 tracking-tight">MovieHive</h1>
                        <p className="text-slate-400 text-sm font-light">Sign in to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">Email</label>
                            <input 
                                type="email" 
                                placeholder="name@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-800/50 text-white placeholder-slate-500 rounded-sm border border-slate-700/50 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition font-light"
                            />
                        </div>

                        {error && <div className="bg-red-950/40 border border-red-800/50 text-red-300 px-4 py-3 rounded-sm text-sm font-light">{error}</div>}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-3 rounded-sm transition duration-200 text-sm tracking-wide"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <p className="text-center text-slate-400 text-sm font-light">
                            Don't have an account? {' '}
                            <button 
                                onClick={switchSignup}
                                className="text-teal-500 hover:text-teal-400 font-medium cursor-pointer transition"
                            >
                                Create one
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}