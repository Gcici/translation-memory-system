import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HumanTranslationRequests, AdminTranslationQueue } from './HumanTranslation.jsx';
import { UserRecharge, AdminRechargeApproval, AdminQRCodeSettings } from './RechargeSystem.jsx';

// 初始化Supabase客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TranslationMemoryApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('translations'); // translations, admin
  
  // 检查用户登录状态
  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminStatus(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await checkAdminStatus(session.user.id);
    }
    setLoading(false);
  };

  const checkAdminStatus = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setIsAdmin(data.is_admin || false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef6e4 0%, #f5e6d3 100%)' }}>
      <Navigation 
        user={user} 
        isAdmin={isAdmin}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
      
      {currentView === 'translations' && <TranslationMemory user={user} />}
      {currentView === 'human-requests' && <HumanTranslationRequests user={user} />}
      {currentView === 'recharge' && <UserRecharge user={user} />}
      {currentView === 'admin' && <AdminPanel user={user} />}
      {currentView === 'admin-queue' && <AdminTranslationQueue user={user} />}
      {currentView === 'admin-recharge' && <AdminRechargeApproval user={user} />}
      {currentView === 'admin-qrcode' && <AdminQRCodeSettings user={user} />}
    </div>
  );
}

// 导航栏组件
function Navigation({ user, isAdmin, currentView, setCurrentView }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '16px 24px',
      marginBottom: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#2d3748' }}>翻訳メモリ</h2>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('translations')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: currentView === 'translations' ? '#4299e1' : '#e2e8f0',
                color: currentView === 'translations' ? 'white' : '#4a5568',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
              📚 我的翻译
            </button>

            <button
              onClick={() => setCurrentView('human-requests')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: currentView === 'human-requests' ? '#8b5cf6' : '#e2e8f0',
                color: currentView === 'human-requests' ? 'white' : '#4a5568',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
              👨‍💼 人工翻译
            </button>

            <button
              onClick={() => setCurrentView('recharge')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: currentView === 'recharge' ? '#10b981' : '#e2e8f0',
                color: currentView === 'recharge' ? 'white' : '#4a5568',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
              💳 账户充值
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentView('admin-queue')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentView === 'admin-queue' ? '#f59e0b' : '#e2e8f0',
                    color: currentView === 'admin-queue' ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                  📋 翻译队列
                </button>

                <button
                  onClick={() => setCurrentView('admin-recharge')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentView === 'admin-recharge' ? '#10b981' : '#e2e8f0',
                    color: currentView === 'admin-recharge' ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                  💰 充值审核
                </button>

                <button
                  onClick={() => setCurrentView('admin-qrcode')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentView === 'admin-qrcode' ? '#8b5cf6' : '#e2e8f0',
                    color: currentView === 'admin-qrcode' ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                  📱 二维码设置
                </button>
                
                <button
                  onClick={() => setCurrentView('admin')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentView === 'admin' ? '#ed8936' : '#e2e8f0',
                    color: currentView === 'admin' ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                  🔑 管理后台
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#718096', fontSize: '14px' }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#e2e8f0',
              color: '#4a5568',
              cursor: 'pointer',
              fontWeight: '500'
            }}>
            退出登录
          </button>
        </div>
      </div>
    </nav>
  );
}

// 加载屏幕
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef6e4 0%, #f5e6d3 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #e2e8f0',
          borderTop: '5px solid #4299e1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#718096', fontSize: '16px' }}>加载中...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// 认证屏幕(登录/注册)
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '注册成功!请检查邮箱验证链接' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef6e4 0%, #f5e6d3 100%)',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          翻訳メモリ
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          {isLogin ? '登录您的账号' : '创建新账号'}
        </p>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
            color: message.type === 'success' ? '#22543d' : '#742a2a',
            fontSize: '14px'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568'
            }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4a5568'
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#cbd5e0' : '#4299e1',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#e2e8f0',
              color: '#4a5568',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
            {isLogin ? '还没有账号?点击注册' : '已有账号?点击登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 翻译记忆主界面(用户视图)
function TranslationMemory({ user }) {
  const [translations, setTranslations] = useState([]);
  const [inputText, setInputText] = useState('');
  const [matches, setMatches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJapanese, setNewJapanese] = useState('');
  const [newChinese, setNewChinese] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiTranslation, setAiTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    provider: 'gemini', // 'gemini' or 'deepl'
    geminiKey: '',
    deeplKey: ''
  });

  useEffect(() => {
    loadTranslations();
    loadApiSettings();
  }, []);

  // 加载API设置
  const loadApiSettings = () => {
    const saved = localStorage.getItem(`api_settings_${user.id}`);
    if (saved) {
      try {
        setApiSettings(JSON.parse(saved));
      } catch (e) {
        console.error('加载API设置失败', e);
      }
    }
  };

  // 保存API设置
  const saveApiSettings = (settings) => {
    localStorage.setItem(`api_settings_${user.id}`, JSON.stringify(settings));
    setApiSettings(settings);
  };

  // 使用Gemini API翻译
  const translateWithGemini = async (text) => {
    if (!apiSettings.geminiKey) {
      throw new Error('请先设置Gemini API密钥');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiSettings.geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `请将以下日文翻译成中文,只返回翻译结果,不要任何解释:\n\n${text}`
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API调用失败');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  };

  // 使用DeepL API翻译
  const translateWithDeepL = async (text) => {
    if (!apiSettings.deeplKey) {
      throw new Error('请先设置DeepL API密钥');
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        auth_key: apiSettings.deeplKey,
        text: text,
        source_lang: 'JA',
        target_lang: 'ZH'
      })
    });

    if (!response.ok) {
      throw new Error('DeepL API调用失败');
    }

    const data = await response.json();
    return data.translations[0].text;
  };

  // 执行AI翻译
  const handleAiTranslate = async () => {
    if (!inputText.trim()) {
      showNotificationMessage('请输入需要翻译的日文', 'error');
      return;
    }

    setTranslating(true);
    setAiTranslation(null);

    try {
      let result;
      if (apiSettings.provider === 'gemini') {
        result = await translateWithGemini(inputText);
      } else {
        result = await translateWithDeepL(inputText);
      }
      
      setAiTranslation(result);
      showNotificationMessage('AI翻译完成', 'success');
    } catch (error) {
      showNotificationMessage(error.message, 'error');
    } finally {
      setTranslating(false);
    }
  };

  // 保存AI翻译结果
  const saveAiTranslation = async () => {
    if (!aiTranslation) return;

    const { data, error } = await supabase
      .from('user_translations')
      .insert([{
        user_id: user.id,
        japanese: inputText.trim(),
        chinese: aiTranslation.trim()
      }])
      .select();

    if (error) {
      showNotificationMessage('保存失败', 'error');
    } else {
      setTranslations([data[0], ...translations]);
      setAiTranslation(null);
      showNotificationMessage('翻译已保存', 'success');
    }
  };

  const loadTranslations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_translations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('加载失败:', error);
    } else {
      setTranslations(data || []);
    }
    setLoading(false);
  };

  const calculateSimilarity = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 100 : ((1 - distance / maxLen) * 100);
  };

  const handleSearch = (text) => {
    setInputText(text);
    
    if (!text.trim()) {
      setMatches([]);
      return;
    }

    const results = translations
      .map(trans => ({
        ...trans,
        similarity: calculateSimilarity(text, trans.japanese)
      }))
      .filter(trans => trans.similarity >= 70)
      .sort((a, b) => b.similarity - a.similarity);

    setMatches(results);
  };

  const handleAdd = async () => {
    if (!newJapanese.trim() || !newChinese.trim()) {
      showNotificationMessage('请输入日文和中文内容', 'error');
      return;
    }

    const { data, error } = await supabase
      .from('user_translations')
      .insert([{
        user_id: user.id,
        japanese: newJapanese.trim(),
        chinese: newChinese.trim()
      }])
      .select();

    if (error) {
      showNotificationMessage('添加失败', 'error');
    } else {
      setTranslations([data[0], ...translations]);
      setNewJapanese('');
      setNewChinese('');
      setShowAddForm(false);
      showNotificationMessage('翻译已添加', 'success');
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('user_translations')
      .delete()
      .eq('id', id);

    if (error) {
      showNotificationMessage('删除失败', 'error');
    } else {
      setTranslations(translations.filter(t => t.id !== id));
      showNotificationMessage('翻译已删除', 'success');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target.result;
        let imported = [];

        try {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            imported = jsonData.filter(item => item.japanese && item.chinese);
          }
        } catch {
          const lines = content.split('\n').filter(line => line.trim());
          imported = lines.map(line => {
            const parts = line.includes('|||') ? line.split('|||') : line.split('\t');
            if (parts.length >= 2) {
              return {
                japanese: parts[0].trim(),
                chinese: parts[1].trim()
              };
            }
            return null;
          }).filter(Boolean);
        }

        if (imported.length > 0) {
          const records = imported.map(item => ({
            user_id: user.id,
            japanese: item.japanese,
            chinese: item.chinese
          }));

          const { data, error } = await supabase
            .from('user_translations')
            .insert(records)
            .select();

          if (error) {
            showNotificationMessage('导入失败', 'error');
          } else {
            setTranslations([...data, ...translations]);
            showNotificationMessage(`成功导入 ${imported.length} 条翻译记录`, 'success');
          }
        } else {
          showNotificationMessage('未找到有效的翻译记录', 'error');
        }
      } catch (error) {
        showNotificationMessage('文件解析失败', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    if (translations.length === 0) return;

    const exportData = translations.map(({ japanese, chinese }) => ({
      japanese,
      chinese
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-translations-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotificationMessage('数据已导出', 'success');
  };

  const showNotificationMessage = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
      `}</style>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {notification.message}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 工具栏 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <label style={{ flex: '1', minWidth: '200px', cursor: 'pointer' }}>
            <input type="file" accept=".txt,.json" onChange={handleImport} style={{ display: 'none' }} />
            <div style={{
              background: '#4299e1',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              📤 导入历史记录
            </div>
          </label>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              flex: '1',
              minWidth: '200px',
              background: '#48bb78',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
            ➕ 添加翻译对
          </button>

          <button
            onClick={handleExport}
            disabled={translations.length === 0}
            style={{
              flex: '1',
              minWidth: '200px',
              background: translations.length === 0 ? '#cbd5e0' : '#ed8936',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '500',
              cursor: translations.length === 0 ? 'not-allowed' : 'pointer'
            }}>
            💾 导出数据
          </button>

          <button
            onClick={() => setShowApiSettings(!showApiSettings)}
            style={{
              flex: '1',
              minWidth: '200px',
              background: '#9f7aea',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
            🤖 AI翻译设置
          </button>
        </div>

        {/* API设置面板 */}
        {showApiSettings && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#2d3748' }}>
              AI翻译API设置
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                选择翻译服务
              </label>
              <select
                value={apiSettings.provider}
                onChange={(e) => saveApiSettings({ ...apiSettings, provider: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}>
                <option value="gemini">Google Gemini (免费额度)</option>
                <option value="deepl">DeepL (付费,更准确)</option>
              </select>
            </div>

            {apiSettings.provider === 'gemini' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                  Gemini API密钥
                </label>
                <input
                  type="password"
                  value={apiSettings.geminiKey}
                  onChange={(e) => saveApiSettings({ ...apiSettings, geminiKey: e.target.value })}
                  placeholder="输入你的Gemini API密钥..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
                  获取密钥: <a href="https://makersuite.google.com/app/apikey" target="_blank" style={{ color: '#4299e1' }}>https://makersuite.google.com/app/apikey</a>
                </p>
              </div>
            )}

            {apiSettings.provider === 'deepl' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                  DeepL API密钥
                </label>
                <input
                  type="password"
                  value={apiSettings.deeplKey}
                  onChange={(e) => saveApiSettings({ ...apiSettings, deeplKey: e.target.value })}
                  placeholder="输入你的DeepL API密钥..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
                  获取密钥: <a href="https://www.deepl.com/pro-api" target="_blank" style={{ color: '#4299e1' }}>https://www.deepl.com/pro-api</a> (需要付费)
                </p>
              </div>
            )}

            <div style={{
              background: '#f7fafc',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4a5568'
            }}>
              <strong>💡 提示:</strong>
              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>Gemini提供免费额度,适合个人使用</li>
                <li>DeepL翻译质量更高,但需要付费</li>
                <li>API密钥仅保存在本地浏览器,不会上传到服务器</li>
              </ul>
            </div>
          </div>
        )}

        {/* 添加表单 */}
        {showAddForm && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#2d3748' }}>
              添加新翻译
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                日文
              </label>
              <textarea
                value={newJapanese}
                onChange={(e) => setNewJapanese(e.target.value)}
                placeholder="输入日文文本..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontFamily: '"Noto Sans JP", sans-serif',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                中文
              </label>
              <textarea
                value={newChinese}
                onChange={(e) => setNewChinese(e.target.value)}
                placeholder="输入中文翻译..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontFamily: '"Noto Sans SC", sans-serif',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAdd}
                style={{
                  flex: '1',
                  background: '#48bb78',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                确认添加
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewJapanese('');
                  setNewChinese('');
                }}
                style={{
                  flex: '1',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                取消
              </button>
            </div>
          </div>
        )}

        {/* 搜索框 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <textarea
            value={inputText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="输入日文文本进行模糊匹配..."
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              fontSize: '18px',
              fontFamily: '"Noto Sans JP", sans-serif',
              resize: 'vertical',
              minHeight: '100px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{
            marginTop: '12px',
            fontSize: '14px',
            color: '#718096',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span>相似度阈值: ≥70%</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>记忆库: {translations.length} 条</span>
              {inputText.trim() && (
                <button
                  onClick={handleAiTranslate}
                  disabled={translating || (!apiSettings.geminiKey && !apiSettings.deeplKey)}
                  style={{
                    background: translating ? '#cbd5e0' : '#9f7aea',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    cursor: translating || (!apiSettings.geminiKey && !apiSettings.deeplKey) ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}>
                  {translating ? '🔄 翻译中...' : '🤖 AI翻译'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI翻译结果 */}
        {aiTranslation && (
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(159, 122, 234, 0.2)',
            border: '2px solid #9f7aea'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                🤖 AI翻译结果 ({apiSettings.provider === 'gemini' ? 'Gemini' : 'DeepL'})
              </h3>
              <button
                onClick={() => setAiTranslation(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#718096'
                }}>
                ✕
              </button>
            </div>

            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '8px' }}>
                日文原文
              </div>
              <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans JP", sans-serif', lineHeight: '1.6', marginBottom: '12px' }}>
                {inputText}
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '8px' }}>
                  中文翻译
                </div>
                <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans SC", sans-serif', lineHeight: '1.6' }}>
                  {aiTranslation}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={saveAiTranslation}
                style={{
                  flex: '1',
                  background: '#48bb78',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                ✅ 保存到记忆库
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiTranslation);
                  showNotificationMessage('已复制到剪贴板', 'success');
                }}
                style={{
                  flex: '1',
                  background: '#4299e1',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                📋 复制翻译
              </button>
            </div>
          </div>
        )}

        {/* 匹配结果 */}
        {inputText && matches.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
              找到 {matches.length} 条匹配结果
            </h2>
            
            {matches.map(match => (
              <div
                key={match.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: '2px solid ' + (match.similarity >= 95 ? '#48bb78' : match.similarity >= 85 ? '#4299e1' : '#ed8936'),
                  position: 'relative'
                }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: match.similarity >= 95 ? '#48bb78' : match.similarity >= 85 ? '#4299e1' : '#ed8936',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {Math.round(match.similarity)}%
                </div>

                <div style={{ paddingRight: '80px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '4px' }}>
                    日文
                  </div>
                  <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans JP", sans-serif', lineHeight: '1.6' }}>
                    {match.japanese}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '4px' }}>
                    中文
                  </div>
                  <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans SC", sans-serif', lineHeight: '1.6' }}>
                    {match.chinese}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {inputText && matches.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: '#718096',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: '18px', margin: 0 }}>
              未找到相似度≥70%的匹配结果
            </p>
          </div>
        )}

        {/* 所有翻译列表 */}
        {!inputText && translations.length > 0 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
              翻译记忆库 ({translations.length})
            </h2>
            
            {translations.map(trans => (
              <div
                key={trans.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: '2px solid #e2e8f0',
                  position: 'relative'
                }}>
                <button
                  onClick={() => handleDelete(trans.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#fed7d7',
                    color: '#e53e3e',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer'
                  }}>
                  ❌
                </button>

                <div style={{ paddingRight: '40px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '4px' }}>
                    日文
                  </div>
                  <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans JP", sans-serif', lineHeight: '1.6' }}>
                    {trans.japanese}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '4px' }}>
                    中文
                  </div>
                  <div style={{ fontSize: '16px', color: '#2d3748', fontFamily: '"Noto Sans SC", sans-serif', lineHeight: '1.6' }}>
                    {trans.chinese}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!inputText && translations.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            color: '#718096',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📤</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#4a5568', marginBottom: '12px' }}>
              开始添加翻译记录
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '24px', lineHeight: '1.6' }}>
              导入您的历史翻译记录,或手动添加翻译对
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 管理员面板
function AdminPanel({ user }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);

    // 加载所有用户
    const { data: usersData } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // 加载翻译统计
    const { data: translationsData } = await supabase
      .from('user_translations')
      .select('user_id');

    if (usersData && translationsData) {
      const translationCounts = {};
      translationsData.forEach(t => {
        translationCounts[t.user_id] = (translationCounts[t.user_id] || 0) + 1;
      });

      const enrichedUsers = usersData.map(u => ({
        ...u,
        translationCount: translationCounts[u.id] || 0
      }));

      setUsers(enrichedUsers);
      setStats({
        totalUsers: usersData.length,
        totalTranslations: translationsData.length,
        activeUsers: Object.keys(translationCounts).length
      });
    }

    setLoading(false);
  };

  const toggleAdmin = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !currentStatus } : u
      ));
    }
  };

  const exportAllData = async () => {
    const { data } = await supabase
      .from('user_translations')
      .select('*, user_profiles!inner(email)');

    if (data) {
      const exportData = data.map(t => ({
        email: t.user_profiles.email,
        japanese: t.japanese,
        chinese: t.chinese,
        created_at: t.created_at
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-translations-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 统计卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>总用户数</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#4299e1' }}>
              {stats?.totalUsers || 0}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>活跃用户</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#48bb78' }}>
              {stats?.activeUsers || 0}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>总翻译条数</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#ed8936' }}>
              {stats?.totalTranslations || 0}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <button
            onClick={exportAllData}
            style={{
              background: '#4299e1',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
            💾 导出所有用户数据
          </button>
        </div>

        {/* 用户列表 */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2d3748', marginBottom: '20px' }}>
            用户列表
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>邮箱</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>翻译数</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>管理员</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>注册时间</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px', color: '#2d3748' }}>{u.email}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#2d3748' }}>{u.translationCount}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {u.is_admin ? (
                        <span style={{
                          background: '#48bb78',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          是
                        </span>
                      ) : (
                        <span style={{
                          background: '#e2e8f0',
                          color: '#718096',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          否
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#718096', fontSize: '14px' }}>
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          style={{
                            background: u.is_admin ? '#fed7d7' : '#c6f6d5',
                            color: u.is_admin ? '#e53e3e' : '#22543d',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}>
                          {u.is_admin ? '取消管理员' : '设为管理员'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}