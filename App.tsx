import React, { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <span className="font-bold text-lg md:text-xl text-blue-900 truncate">สหกรณ์เคหสถานบ้านมั่นคงชุมชนตะอาวุน จำกัด</span>
            </div>
            <div className="flex items-center space-x-4 flex-shrink-0">
              <button 
                onClick={() => setIsAdmin(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${!isAdmin ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                แจ้งเหตุ
              </button>
              <button 
                onClick={() => setIsAdmin(true)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isAdmin ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-700'}`}
              >
                เจ้าหน้าที่ (Admin)
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-fade-in-up">
          {isAdmin ? (
            isAuthenticated ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard ข้อมูลผู้ประสบภัย</h1>
                    <p className="text-slate-500">ภาพรวมสถานการณ์และความช่วยเหลือ</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-sm text-slate-400">
                      อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
                    </div>
                    <button 
                      onClick={() => { setIsAuthenticated(false); setPassword(''); }}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
                <AdminDashboard />
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">เข้าสู่ระบบเจ้าหน้าที่</h2>
                  <p className="text-slate-500 text-sm">กรุณากรอกรหัสผ่านเพื่อเข้าถึงข้อมูล</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="รหัสผ่าน"
                      autoFocus
                    />
                    {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md"
                  >
                    เข้าสู่ระบบ
                  </button>
                </form>
              </div>
            )
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border-2 border-blue-500 rounded-lg p-6 text-center mb-6 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">ลงทะเบียนผู้ประสบภัยน้ำท่วม</h1>
                <p className="text-slate-600">ระบบรวบรวมข้อมูลเพื่อประสานงานความช่วยเหลือให้ทั่วถึง</p>
              </div>
              <SurveyForm />
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} สหกรณ์เคหสถานบ้านมั่นคงชุมชนตะอาวุน จำกัด. เชื่อมต่อฐานข้อมูล Google Sheets
        </div>
      </footer>
    </div>
  );
};

export default App;