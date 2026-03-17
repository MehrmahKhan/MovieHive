import React,{useState} from 'react';
import './Login.css';

export default function Login({onLogin,switchSignup}){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');

    const handleLogin = async (e)=>{
        e.preventDefault();
        try{
            const res = await fetch('http://localhost:3001/api/auth/login',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password})
            });
            const data = await res.json();
            if(res.ok) onLogin(data.user);
            else alert(data.msg);
        }catch(err){
            alert('Server error');
        }
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button type="submit">Login</button>
                <p>Don't have account? <span className="link" onClick={switchSignup}>Sign Up</span></p>
            </form>
        </div>
    )
}