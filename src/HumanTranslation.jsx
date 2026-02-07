import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 从App.jsx获取supabase实例
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 人工翻译请求组件 - 用户视图
export function HumanTranslationRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    japanese_text: '',
    context: '',
    priority: 'normal'
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('translation_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('加载请求失败:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!newRequest.japanese_text.trim()) {
      alert('请输入需要翻译的日文');
      return;
    }

    const { data, error } = await supabase
      .from('translation_requests')
      .insert([{
        user_id: user.id,
        japanese_text: newRequest.japanese_text.trim(),
        context: newRequest.context.trim(),
        priority: newRequest.priority
      }])
      .select();

    if (error) {
      alert('提交失败');
    } else {
      setRequests([data[0], ...requests]);
      setNewRequest({ japanese_text: '', context: '', priority: 'normal' });
      setShowRequestForm(false);
      alert('翻译请求已提交!客服会尽快处理');
    }
  };

  const rateTranslation = async (requestId, rating, feedback) => {
    const { error } = await supabase
      .from('translation_requests')
      .update({ rating, feedback })
      .eq('id', requestId);

    if (error) {
      alert('评分失败');
    } else {
      loadRequests();
      alert('感谢您的反馈!');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ 待处理' },
      processing: { bg: '#dbeafe', color: '#1e3a8a', text: '🔄 处理中' },
      completed: { bg: '#d1fae5', color: '#065f46', text: '✅ 已完成' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', text: '❌ 已取消' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        {config.text}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', margin: 0 }}>
            👨‍💼 人工翻译请求
          </h2>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
            + 新建请求
          </button>
        </div>

        {/* 提交请求表单 */}
        {showRequestForm && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#2d3748' }}>
              新建翻译请求
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                日文原文 *
              </label>
              <textarea
                value={newRequest.japanese_text}
                onChange={(e) => setNewRequest({ ...newRequest, japanese_text: e.target.value })}
                placeholder="输入需要人工翻译的日文..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  fontFamily: '"Noto Sans JP", sans-serif',
                  resize: 'vertical',
                  minHeight: '120px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                上下文说明(可选)
              </label>
              <textarea
                value={newRequest.context}
                onChange={(e) => setNewRequest({ ...newRequest, context: e.target.value })}
                placeholder="提供上下文可以帮助获得更准确的翻译..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  resize: 'vertical',
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#4a5568' }}>
                优先级
              </label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}>
                <option value="normal">普通</option>
                <option value="urgent">紧急</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={submitRequest}
                style={{
                  flex: '1',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                提交请求
              </button>
              <button
                onClick={() => {
                  setShowRequestForm(false);
                  setNewRequest({ japanese_text: '', context: '', priority: 'normal' });
                }}
                style={{
                  flex: '1',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                取消
              </button>
            </div>
          </div>
        )}

        {/* 请求列表 */}
        {requests.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍💼</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#4a5568', marginBottom: '8px' }}>
              还没有翻译请求
            </h3>
            <p style={{ fontSize: '14px', color: '#718096' }}>
              当AI翻译不满意时,可以请求专业客服提供人工翻译
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map(req => (
              <div
                key={req.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: req.priority === 'urgent' ? '2px solid #f59e0b' : '2px solid #e2e8f0'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    {getStatusBadge(req.status)}
                    {req.priority === 'urgent' && (
                      <span style={{
                        marginLeft: '8px',
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        🔥 紧急
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', color: '#718096' }}>
                    {new Date(req.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                    日文原文
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#2d3748',
                    fontFamily: '"Noto Sans JP", sans-serif',
                    lineHeight: '1.6',
                    background: '#f7fafc',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    {req.japanese_text}
                  </div>
                </div>

                {req.context && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                      上下文说明
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#4a5568',
                      lineHeight: '1.6',
                      background: '#f7fafc',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      {req.context}
                    </div>
                  </div>
                )}

                {req.status === 'completed' && req.human_translation && (
                  <>
                    <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                        ✅ 人工翻译结果
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#2d3748',
                        fontFamily: '"Noto Sans SC", sans-serif',
                        lineHeight: '1.6',
                        background: '#d1fae5',
                        padding: '12px',
                        borderRadius: '8px'
                      }}>
                        {req.human_translation}
                      </div>
                    </div>

                    {!req.rating && (
                      <div style={{ marginTop: '16px', padding: '16px', background: '#f7fafc', borderRadius: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                          对翻译质量满意吗?
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => {
                                const feedback = prompt('请留下您的反馈(可选):');
                                rateTranslation(req.id, star, feedback || '');
                              }}
                              style={{
                                fontSize: '24px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}>
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {req.rating && (
                      <div style={{ marginTop: '12px', fontSize: '14px', color: '#718096' }}>
                        您的评分: {'⭐'.repeat(req.rating)}
                        {req.feedback && ` - ${req.feedback}`}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 管理员翻译队列组件
export function AdminTranslationQueue({ user }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending, processing, completed, all
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    loadRequests();
    
    // 设置实时订阅
    const subscription = supabase
      .channel('translation_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'translation_requests' },
        () => loadRequests()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    let query = supabase
      .from('translation_requests')
      .select(`
        *,
        user_profiles!translation_requests_user_id_fkey(email)
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('加载失败:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (requestId, status, translatorId = null) => {
    const updates = { status };
    if (translatorId) updates.translator_id = translatorId;

    const { error } = await supabase
      .from('translation_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      alert('更新失败');
    } else {
      loadRequests();
    }
  };

  const submitTranslation = async (requestId, translation) => {
    if (!translation.trim()) {
      alert('请输入翻译内容');
      return;
    }

    const { error } = await supabase
      .from('translation_requests')
      .update({
        human_translation: translation.trim(),
        status: 'completed',
        translator_id: user.id
      })
      .eq('id', requestId);

    if (error) {
      alert('提交失败');
    } else {
      setProcessingRequest(null);
      loadRequests();
      alert('翻译已提交!');
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', marginBottom: '24px' }}>
          👨‍💼 人工翻译队列
        </h2>

        {/* 统计卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>待处理</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
              {stats.pending}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>处理中</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
              {stats.processing}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>已完成</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
              {stats.completed}
            </div>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { value: 'pending', label: '⏳ 待处理' },
            { value: 'processing', label: '🔄 处理中' },
            { value: 'completed', label: '✅ 已完成' },
            { value: 'all', label: '📋 全部' }
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: filter === item.value ? '#8b5cf6' : '#e2e8f0',
                color: filter === item.value ? 'white' : '#4a5568',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* 请求列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : requests.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', color: '#718096' }}>暂无{filter === 'all' ? '' : filter === 'pending' ? '待处理' : filter === 'processing' ? '处理中' : '已完成'}的请求</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map(req => (
              <div
                key={req.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: req.priority === 'urgent' ? '2px solid #f59e0b' : '2px solid #e2e8f0'
                }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#718096' }}>
                      用户: {req.user_profiles?.email}
                    </span>
                    {req.priority === 'urgent' && (
                      <span style={{
                        marginLeft: '12px',
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        🔥 紧急
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', color: '#718096' }}>
                    {new Date(req.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                    日文原文
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#2d3748',
                    fontFamily: '"Noto Sans JP", sans-serif',
                    lineHeight: '1.6',
                    background: '#f7fafc',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    {req.japanese_text}
                  </div>
                </div>

                {req.context && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                      上下文
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#4a5568',
                      background: '#fef3c7',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      {req.context}
                    </div>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setProcessingRequest(req);
                        updateStatus(req.id, 'processing', user.id);
                      }}
                      style={{
                        flex: '1',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                      开始处理
                    </button>
                  </div>
                )}

                {req.status === 'processing' && processingRequest?.id === req.id && (
                  <div style={{ marginTop: '16px' }}>
                    <textarea
                      placeholder="输入中文翻译..."
                      defaultValue={req.human_translation || ''}
                      id={`translation-${req.id}`}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #e2e8f0',
                        fontSize: '16px',
                        fontFamily: '"Noto Sans SC", sans-serif',
                        resize: 'vertical',
                        minHeight: '120px',
                        boxSizing: 'border-box',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => {
                          const translation = document.getElementById(`translation-${req.id}`).value;
                          submitTranslation(req.id, translation);
                        }}
                        style={{
                          flex: '1',
                          background: '#10b981',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                        ✅ 提交翻译
                      </button>
                      <button
                        onClick={() => setProcessingRequest(null)}
                        style={{
                          flex: '1',
                          background: '#e2e8f0',
                          color: '#4a5568',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {req.status === 'completed' && (
                  <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096', fontWeight: '500', marginBottom: '6px' }}>
                      ✅ 翻译结果
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#2d3748',
                      fontFamily: '"Noto Sans SC", sans-serif',
                      lineHeight: '1.6',
                      background: '#d1fae5',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      {req.human_translation}
                    </div>
                    {req.rating && (
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        用户评分: {'⭐'.repeat(req.rating)}
                        {req.feedback && ` - ${req.feedback}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
