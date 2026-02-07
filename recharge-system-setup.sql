-- 充值记录表
CREATE TABLE recharge_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,  -- 充值金额
  plan_type VARCHAR(50),  -- 套餐类型: basic, standard, pro
  payment_proof TEXT,  -- 支付凭证图片(base64或URL)
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
  admin_note TEXT,  -- 管理员备注
  approved_by UUID REFERENCES auth.users(id),  -- 审核管理员
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- 用户余额和配额表
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0,  -- 账户余额
ADD COLUMN IF NOT EXISTS ai_quota INTEGER DEFAULT 0,  -- AI翻译次数
ADD COLUMN IF NOT EXISTS human_quota INTEGER DEFAULT 5,  -- 人工翻译次数(每月)
ADD COLUMN IF NOT EXISTS quota_reset_date DATE DEFAULT CURRENT_DATE,  -- 配额重置日期
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'free',  -- free, basic, standard, pro
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;  -- 套餐到期时间

-- 充值套餐配置表
CREATE TABLE recharge_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,  -- 套餐名称
  price DECIMAL(10,2) NOT NULL,  -- 价格
  ai_quota INTEGER DEFAULT 0,  -- AI翻译次数
  human_quota INTEGER DEFAULT 0,  -- 人工翻译次数
  duration_days INTEGER DEFAULT 30,  -- 有效期(天)
  description TEXT,  -- 套餐描述
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统配置表(存储支付二维码等)
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 插入默认充值套餐
INSERT INTO recharge_plans (name, price, ai_quota, human_quota, duration_days, description) VALUES
('基础版', 19.00, 100, 20, 30, '适合个人用户,每月100次AI翻译+20次人工翻译'),
('标准版', 49.00, 500, 100, 30, '适合小团队,每月500次AI翻译+100次人工翻译'),
('专业版', 99.00, 2000, 500, 30, '适合企业用户,每月2000次AI翻译+500次人工翻译'),
('年费会员', 499.00, 10000, 5000, 365, '年付优惠,10000次AI翻译+5000次人工翻译');

-- 创建索引
CREATE INDEX idx_recharge_records_user_id ON recharge_records(user_id);
CREATE INDEX idx_recharge_records_status ON recharge_records(status);

-- 启用行级安全
ALTER TABLE recharge_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的充值记录
CREATE POLICY "Users can view own recharge records"
  ON recharge_records FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建充值记录
CREATE POLICY "Users can create recharge records"
  ON recharge_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有充值记录
CREATE POLICY "Admins can view all recharge records"
  ON recharge_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 管理员可以更新充值记录(审核)
CREATE POLICY "Admins can update recharge records"
  ON recharge_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 所有人可以查看充值套餐
CREATE POLICY "Anyone can view recharge plans"
  ON recharge_plans FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- 管理员可以管理充值套餐
CREATE POLICY "Admins can manage recharge plans"
  ON recharge_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 所有人可以查看系统配置(如支付二维码)
CREATE POLICY "Anyone can view system config"
  ON system_config FOR SELECT
  TO authenticated
  USING (TRUE);

-- 管理员可以管理系统配置
CREATE POLICY "Admins can manage system config"
  ON system_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 创建函数:自动重置每月配额
CREATE OR REPLACE FUNCTION reset_monthly_quota()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET 
    human_quota = CASE 
      WHEN plan_type = 'basic' THEN 20
      WHEN plan_type = 'standard' THEN 100
      WHEN plan_type = 'pro' THEN 500
      ELSE 5
    END,
    ai_quota = CASE 
      WHEN plan_type = 'basic' THEN 100
      WHEN plan_type = 'standard' THEN 500
      WHEN plan_type = 'pro' THEN 2000
      ELSE 0
    END,
    quota_reset_date = CURRENT_DATE
  WHERE quota_reset_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 创建函数:处理充值审核
CREATE OR REPLACE FUNCTION approve_recharge(
  p_record_id BIGINT,
  p_admin_id UUID,
  p_approve BOOLEAN,
  p_note TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_plan_type VARCHAR(50);
  v_ai_quota INTEGER;
  v_human_quota INTEGER;
  v_duration_days INTEGER;
BEGIN
  -- 获取充值记录信息
  SELECT r.user_id, p.plan_type, p.ai_quota, p.human_quota, p.duration_days
  INTO v_user_id, v_plan_type, v_ai_quota, v_human_quota, v_duration_days
  FROM recharge_records r
  LEFT JOIN recharge_plans p ON r.plan_type = p.name
  WHERE r.id = p_record_id;

  IF p_approve THEN
    -- 审核通过,增加用户配额
    UPDATE user_profiles
    SET 
      ai_quota = ai_quota + COALESCE(v_ai_quota, 0),
      human_quota = human_quota + COALESCE(v_human_quota, 0),
      plan_type = COALESCE(v_plan_type, plan_type),
      plan_expires_at = CURRENT_TIMESTAMP + (v_duration_days || ' days')::INTERVAL
    WHERE id = v_user_id;

    -- 更新充值记录状态
    UPDATE recharge_records
    SET 
      status = 'approved',
      approved_by = p_admin_id,
      approved_at = NOW(),
      admin_note = p_note
    WHERE id = p_record_id;
  ELSE
    -- 审核拒绝
    UPDATE recharge_records
    SET 
      status = 'rejected',
      approved_by = p_admin_id,
      approved_at = NOW(),
      admin_note = p_note
    WHERE id = p_record_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
