import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (regPassword !== regConfirmPassword) {
      return setError('Passwords do not match');
    }
    setIsLoading(true);
    try {
      await register(regUsername, regEmail, regPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '60px', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', backgroundColor: '#0d0d0d' }}>
        
        <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)' }}>
          <button 
            onClick={() => { setActiveTab('login'); setError(null); }}
            style={{
              flex: 1, padding: '12px', background: 'transparent', border: 'none',
              color: activeTab === 'login' ? '#e5195e' : 'var(--text-secondary)',
              borderBottom: activeTab === 'login' ? '2px solid #e5195e' : '2px solid transparent',
              fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => { setActiveTab('register'); setError(null); }}
            style={{
              flex: 1, padding: '12px', background: 'transparent', border: 'none',
              color: activeTab === 'register' ? '#e5195e' : 'var(--text-secondary)',
              borderBottom: activeTab === 'register' ? '2px solid #e5195e' : '2px solid transparent',
              fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: 'rgba(229, 25, 94, 0.1)', borderLeft: '4px solid #e5195e', color: '#e5195e', marginBottom: '20px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#e5195e', backgroundImage: 'none' }} disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="johndoe"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <CheckCircle size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ paddingLeft: '40px' }} 
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#e5195e', backgroundImage: 'none' }} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
