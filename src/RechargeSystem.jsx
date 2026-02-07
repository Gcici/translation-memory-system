import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 用户充值页面
export function UserRecharge({ user }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // 加载充值套餐
    const { data: plansData } = await supabase
      .from('recharge_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });
    setPlans(plansData || []);

    // 加载支付二维码
    const { data: configData } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_qrcode')
      .single();
    setQrCode(configData?.value);

    // 加载充值历史
    const { data: historyData } = await supabase
      .from('recharge_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRechargeHistory(historyData || []);

    // 加载用户信息
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setUserProfile(profileData);

    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setProofImage(base64);
      setProofPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const submitRecharge = async () => {
    if (!selectedPlan) {
      alert('请选择充值套餐');
      return;
    }

    if (!proofImage) {
      alert('请上传支付凭证截图');
      return;
    }

    const { error } = await supabase
      .from('recharge_records')
      .insert([{
        user_id: user.id,
        amount: selectedPlan.price,
        plan_type: selectedPlan.name,
        payment_proof: proofImage,
        status: 'pending'
      }]);

    if (error) {
      alert('提交失败: ' + error.message);
    } else {
      alert('充值申请已提交!管理员审核后将自动到账');
      setSelectedPlan(null);
      setProofImage(null);
      setProofPreview(null);
      loadData();
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#fef3c7', color: '#92400e', text: '⏳ 审核中' },
      approved: { bg: '#d1fae5', color: '#065f46', text: '✅ 已到账' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: '❌ 已拒绝' }
    };
    const c = config[status] || config.pending;
    return (
      <span style={{ background: c.bg, color: c.color, padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>
        {c.text}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', marginBottom: '24px' }}>
          💳 账户充值
        </h2>

        {/* 用户余额卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>当前套餐</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
            {userProfile?.plan_type === 'free' ? '免费版' : userProfile?.plan_type}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>AI翻译剩余</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>{userProfile?.ai_quota || 0} 次</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8' }}>人工翻译剩余</div>
              <div style={{ fontSize: '24px', fontWeight: '600' }}>{userProfile?.human_quota || 0} 次</div>
            </div>
            {userProfile?.plan_expires_at && (
              <div>
                <div style={{ fontSize: '13px', opacity: 0.8' }}>到期时间</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {new Date(userProfile.plan_expires_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 充值套餐 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
            选择充值套餐
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  border: selectedPlan?.id === plan.id ? '3px solid #8b5cf6' : '2px solid #e2e8f0',
                  boxShadow: selectedPlan?.id === plan.id ? '0 10px 30px rgba(139, 92, 246, 0.2)' : '0 2px 10px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s'
                }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#2d3748', marginBottom: '8px' }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#8b5cf6', marginBottom: '12px' }}>
                  ¥{plan.price}
                  <span style={{ fontSize: '14px', color: '#718096' }}>/{plan.duration_days}天</span>
                </div>
                <div style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.6', marginBottom: '12px' }}>
                  {plan.description}
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '13px', color: '#718096' }}>
                  ✅ {plan.ai_quota} 次 AI翻译<br/>
                  ✅ {plan.human_quota} 次 人工翻译
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 支付流程 */}
        {selectedPlan && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
              完成支付
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* 支付二维码 */}
              <div>
                <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>
                  <strong>步骤1:</strong> 扫码支付 ¥{selectedPlan.price}
                </div>
                {qrCode ? (
                  <div style={{
                    background: '#f7fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <img
                      src={qrCode}
                      alt="支付二维码"
                      style={{
                        maxWidth: '250px',
                        width: '100%',
                        borderRadius: '8px'
                      }}
                    />
                    <p style={{ fontSize: '13px', color: '#718096', marginTop: '12px' }}>
                      请使用微信/支付宝扫码支付
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: '#fee2e2',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: '#991b1b'
                  }}>
                    ⚠️ 管理员尚未设置支付二维码
                  </div>
                )}
              </div>

              {/* 上传凭证 */}
              <div>
                <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '12px' }}>
                  <strong>步骤2:</strong> 上传支付凭证截图
                </div>
                <div style={{
                  background: '#f7fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e0',
                  textAlign: 'center'
                }}>
                  {proofPreview ? (
                    <div>
                      <img
                        src={proofPreview}
                        alt="支付凭证"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '300px',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}
                      />
                      <div>
                        <label style={{ cursor: 'pointer', color: '#4299e1', textDecoration: 'underline' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          重新上传
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                      <div style={{ color: '#4299e1', fontWeight: '500' }}>
                        点击上传支付截图
                      </div>
                      <div style={{ fontSize: '13px', color: '#718096', marginTop: '8px' }}>
                        支持 JPG、PNG 格式
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={submitRecharge}
              disabled={!proofImage}
              style={{
                width: '100%',
                marginTop: '24px',
                background: proofImage ? '#8b5cf6' : '#cbd5e0',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: proofImage ? 'pointer' : 'not-allowed'
              }}>
              提交充值申请
            </button>
          </div>
        )}

        {/* 充值历史 */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
            充值记录
          </h3>
          {rechargeHistory.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#718096',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}>
              暂无充值记录
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rechargeHistory.map(record => (
                <div
                  key={record.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    border: '2px solid #e2e8f0'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                        {record.plan_type}
                      </div>
                      <div style={{ fontSize: '13px', color: '#718096' }}>
                        {new Date(record.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
                        ¥{record.amount}
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                  {record.admin_note && (
                    <div style={{
                      background: '#f7fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#4a5568'
                    }}>
                      <strong>管理员备注:</strong> {record.admin_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 管理员充值审核页面
export function AdminRechargeApproval({ user }) {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadRecords();
    
    // 实时订阅
    const subscription = supabase
      .channel('recharge_records_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recharge_records' },
        () => loadRecords()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [filter]);

  const loadRecords = async () => {
    setLoading(true);
    let query = supabase
      .from('recharge_records')
      .select(`
        *,
        user_profiles!recharge_records_user_id_fkey(email, plan_type)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setRecords(data || []);
    setLoading(false);
  };

  const handleApprove = async (recordId, approve, note = '') => {
    const { error } = await supabase.rpc('approve_recharge', {
      p_record_id: recordId,
      p_admin_id: user.id,
      p_approve: approve,
      p_note: note || null
    });

    if (error) {
      alert('操作失败: ' + error.message);
    } else {
      alert(approve ? '充值已通过!' : '充值已拒绝');
      setSelectedRecord(null);
      loadRecords();
    }
  };

  const stats = {
    pending: records.filter(r => r.status === 'pending').length,
    approved: records.filter(r => r.status === 'approved').length,
    rejected: records.filter(r => r.status === 'rejected').length
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', marginBottom: '24px' }}>
          💳 充值审核
        </h2>

        {/* 统计卡片 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>待审核</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>{stats.pending}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>已通过</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.approved}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>已拒绝</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>{stats.rejected}</div>
          </div>
        </div>

        {/* 筛选 */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: '12px'
        }}>
          {[
            { value: 'pending', label: '⏳ 待审核' },
            { value: 'approved', label: '✅ 已通过' },
            { value: 'rejected', label: '❌ 已拒绝' },
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

        {/* 充值记录列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : records.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', color: '#718096' }}>暂无记录</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {records.map(record => (
              <div
                key={record.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  border: '2px solid #e2e8f0'
                }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>
                    用户: {record.user_profiles?.email}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                    {record.plan_type}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
                    ¥{record.amount}
                  </div>
                  <div style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>
                    {new Date(record.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>

                {record.payment_proof && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '6px' }}>支付凭证:</div>
                    <img
                      src={record.payment_proof}
                      alt="支付凭证"
                      onClick={() => window.open(record.payment_proof)}
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: '#f7fafc'
                      }}
                    />
                  </div>
                )}

                {record.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const note = prompt('通过审核,备注(可选):');
                        if (note !== null) handleApprove(record.id, true, note);
                      }}
                      style={{
                        flex: '1',
                        background: '#10b981',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                      ✅ 通过
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('拒绝原因(必填):');
                        if (reason) handleApprove(record.id, false, reason);
                      }}
                      style={{
                        flex: '1',
                        background: '#ef4444',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                      ❌ 拒绝
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: record.status === 'approved' ? '#d1fae5' : '#fee2e2',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: record.status === 'approved' ? '#065f46' : '#991b1b'
                  }}>
                    <strong>{record.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝'}</strong>
                    {record.admin_note && `: ${record.admin_note}`}
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

// 管理员二维码设置
export function AdminQRCodeSettings({ user }) {
  const [qrCode, setQrCode] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'payment_qrcode')
      .single();
    
    if (data?.value) {
      setQrCode(data.value);
      setQrCodePreview(data.value);
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setQrCode(base64);
      setQrCodePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const saveQRCode = async () => {
    if (!qrCode) {
      alert('请先上传二维码图片');
      return;
    }

    const { error } = await supabase
      .from('system_config')
      .upsert({
        key: 'payment_qrcode',
        value: qrCode,
        description: '支付二维码',
        updated_by: user.id
      });

    if (error) {
      alert('保存失败: ' + error.message);
    } else {
      alert('支付二维码已更新!');
      loadQRCode();
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>加载中...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d3748', marginBottom: '24px' }}>
          💳 支付二维码设置
        </h2>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
              当前支付二维码
            </h3>
            {qrCodePreview ? (
              <div style={{
                background: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <img
                  src={qrCodePreview}
                  alt="支付二维码"
                  style={{
                    maxWidth: '300px',
                    width: '100%',
                    borderRadius: '8px'
                  }}
                />
              </div>
            ) : (
              <div style={{
                background: '#f7fafc',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#718096'
              }}>
                暂未设置支付二维码
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '12px' }}>
              上传新二维码
            </h3>
            <label style={{
              display: 'block',
              background: '#f7fafc',
              padding: '32px',
              borderRadius: '12px',
              border: '2px dashed #cbd5e0',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e0'}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>📷</div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#4299e1', marginBottom: '8px' }}>
                点击上传二维码图片
              </div>
              <div style={{ fontSize: '13px', color: '#718096' }}>
                支持微信、支付宝收款码<br/>
                建议尺寸: 500x500px,支持JPG、PNG格式
              </div>
            </label>
          </div>

          <div style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              <strong>💡 提示:</strong>
              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                <li>建议使用微信或支付宝的固定收款码</li>
                <li>二维码会显示在用户充值页面</li>
                <li>请确保收款账户正常,避免用户支付失败</li>
                <li>定期检查收款记录,及时审核充值申请</li>
              </ul>
            </div>
          </div>

          <button
            onClick={saveQRCode}
            style={{
              width: '100%',
              background: '#8b5cf6',
              color: 'white',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
            💾 保存二维码
          </button>
        </div>
      </div>
    </div>
  );
}
