-- 人工翻译请求表
CREATE TABLE translation_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  japanese_text TEXT NOT NULL,
  context TEXT,  -- 上下文说明
  priority VARCHAR(20) DEFAULT 'normal',  -- normal, urgent
  status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, cancelled
  human_translation TEXT,  -- 人工翻译结果
  translator_id UUID REFERENCES auth.users(id),  -- 处理的客服ID
  rating INTEGER,  -- 用户评分 1-5
  feedback TEXT,  -- 用户反馈
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_translation_requests_user_id ON translation_requests(user_id);
CREATE INDEX idx_translation_requests_status ON translation_requests(status);
CREATE INDEX idx_translation_requests_translator_id ON translation_requests(translator_id);

-- 启用行级安全
ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的请求
CREATE POLICY "Users can view own requests"
  ON translation_requests FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建请求
CREATE POLICY "Users can create requests"
  ON translation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的请求(评分、反馈)
CREATE POLICY "Users can update own requests"
  ON translation_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- 管理员可以查看所有请求
CREATE POLICY "Admins can view all requests"
  ON translation_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 管理员可以更新所有请求(处理翻译)
CREATE POLICY "Admins can update all requests"
  ON translation_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 创建触发器:自动更新 updated_at
CREATE OR REPLACE FUNCTION update_translation_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER translation_request_updated
  BEFORE UPDATE ON translation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_translation_request_timestamp();

-- 创建统计视图(方便管理员查看统计)
CREATE OR REPLACE VIEW translation_request_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as completed_today,
  AVG(rating) FILTER (WHERE rating IS NOT NULL) as average_rating,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE status = 'completed') as avg_hours_to_complete
FROM translation_requests;
