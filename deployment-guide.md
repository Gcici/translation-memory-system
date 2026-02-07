# 翻译记忆系统 - 完整部署指南(新手版)

## 📋 目录
1. [准备工作](#准备工作)
2. [创建Supabase项目](#创建supabase项目)
3. [配置数据库](#配置数据库)
4. [部署前端网站](#部署前端网站)
5. [管理员设置](#管理员设置)
6. [日常使用](#日常使用)

---

## 1️⃣ 准备工作

### 需要注册的免费账号:
1. **Supabase** (后端数据库) - https://supabase.com
2. **Vercel** (网站托管) - https://vercel.com
3. **GitHub** (代码托管) - https://github.com

### 预计时间:
- 首次部署: 15-20分钟
- 以后更新: 2-3分钟

---

## 2️⃣ 创建Supabase项目

### 步骤:

1. **注册Supabase**
   - 访问 https://supabase.com
   - 点击 "Start your project"
   - 使用GitHub账号登录(推荐)

2. **创建新项目**
   - 点击 "New Project"
   - 填写:
     - Organization: 选择你的组织(默认即可)
     - Project name: `translation-memory` (或任意名称)
     - Database Password: 设置一个强密码(请记住!)
     - Region: 选择 `Northeast Asia (Tokyo)` (日本,速度快)
   - 点击 "Create new project"
   - 等待2-3分钟项目创建完成

3. **获取API密钥**
   - 项目创建完成后,点击左侧 "Settings" (设置)
   - 点击 "API"
   - 复制以下两个值(稍后会用到):
     - `Project URL` (项目URL)
     - `anon public` key (公开密钥)

---

## 3️⃣ 配置数据库

### 步骤:

1. **打开SQL编辑器**
   - 点击左侧 "SQL Editor"
   - 点击 "New query"

2. **创建数据表**
   - 复制以下SQL代码,粘贴到编辑器中:

```sql
-- 创建用户翻译表
CREATE TABLE user_translations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  japanese TEXT NOT NULL,
  chinese TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX idx_user_translations_user_id ON user_translations(user_id);
CREATE INDEX idx_user_translations_japanese ON user_translations USING gin(to_tsvector('simple', japanese));

-- 创建用户个人资料表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建人工翻译请求表
CREATE TABLE translation_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  japanese_text TEXT NOT NULL,
  context TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  human_translation TEXT,
  translator_id UUID REFERENCES auth.users(id),
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_translation_requests_user_id ON translation_requests(user_id);
CREATE INDEX idx_translation_requests_status ON translation_requests(status);
CREATE INDEX idx_translation_requests_translator_id ON translation_requests(translator_id);

-- 启用行级安全(RLS)
ALTER TABLE user_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

-- 用户只能看到自己的翻译
CREATE POLICY "Users can view own translations"
  ON user_translations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own translations"
  ON user_translations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own translations"
  ON user_translations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own translations"
  ON user_translations FOR DELETE
  USING (auth.uid() = user_id);

-- 管理员可以查看所有数据
CREATE POLICY "Admins can view all translations"
  ON user_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 用户个人资料策略
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 人工翻译请求策略
CREATE POLICY "Users can view own requests"
  ON translation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
  ON translation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests"
  ON translation_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON translation_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all requests"
  ON translation_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 创建触发器:注册时自动创建用户资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建触发器:自动更新translation_requests时间戳
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
```

3. **执行SQL**
   - 点击右下角 "Run" 按钮
   - 看到 "Success. No rows returned" 即表示成功

4. **启用邮箱认证**(可选,建议启用)
   - 点击左侧 "Authentication" → "Providers"
   - 找到 "Email" 
   - 确保已启用
   - 可以自定义邮件模板(在 "Email Templates" 中)

---

## 4️⃣ 部署前端网站

### 方法一:使用Vercel部署(推荐,最简单)

1. **准备代码**
   - 将项目文件上传到GitHub(我会提供完整代码)

2. **连接Vercel**
   - 访问 https://vercel.com
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在 "Environment Variables" 部分添加:
     - `VITE_SUPABASE_URL`: 你的Supabase项目URL
     - `VITE_SUPABASE_ANON_KEY`: 你的Supabase公开密钥
   - 点击 "Deploy"

4. **等待部署**
   - 2-3分钟后,网站就上线了!
   - 获得免费域名,如: `your-app.vercel.app`

### 方法二:使用Netlify部署(备选)

1. 访问 https://netlify.com
2. 拖拽项目文件夹到Netlify
3. 在设置中添加环境变量
4. 部署完成!

---

## 5️⃣ 管理员设置

### 设置第一个管理员账号:

1. **注册账号**
   - 访问你部署好的网站
   - 注册一个账号(使用你的邮箱)

2. **在Supabase中设置为管理员**
   - 回到Supabase控制台
   - 点击左侧 "Table Editor"
   - 选择 `user_profiles` 表
   - 找到你的账号(通过邮箱)
   - 双击 `is_admin` 列,改为 `true`
   - 保存

3. **验证管理员权限**
   - 刷新网站,重新登录
   - 应该能看到"管理后台"入口

### 管理员功能:
- ✅ 查看所有用户列表
- ✅ 查看每个用户的翻译数量
- ✅ 禁用/删除用户账号
- ✅ 导出所有用户数据
- ✅ 查看系统统计信息

---

## 6️⃣ 日常使用

### 用户使用流程:
1. 访问网站
2. 注册/登录账号
3. 导入历史翻译记录
4. 输入日文进行模糊匹配
5. 添加新翻译对
6. 导出个人数据

### 管理员日常操作:
1. 登录管理后台
2. 查看用户活跃度
3. 管理用户账号
4. 定期导出数据备份

### 数据安全:
- ✅ Supabase自动每日备份
- ✅ 用户数据加密存储
- ✅ 支持手动导出备份
- ✅ 可设置数据保留策略

---

## 🎉 完成!

现在你拥有了一个:
- ✅ 完全免费的多用户翻译记忆系统
- ✅ 自动运维,无需管理服务器
- ✅ 支持最多5万用户(Supabase免费版)
- ✅ 专业的管理后台
- ✅ 安全可靠的数据存储

---

## 📞 需要帮助?

如果遇到问题:
1. 检查Supabase控制台的 "Logs" 查看错误
2. 检查浏览器控制台(F12)查看前端错误
3. 确认环境变量配置正确
4. 确认数据库表已正确创建

---

## 🔄 更新网站

当需要更新功能时:
1. 更新GitHub代码
2. Vercel会自动重新部署
3. 2-3分钟后更新生效

---

## 💰 费用说明

**完全免费版本限制:**
- Supabase: 500MB数据库 + 1GB文件存储 + 50,000用户
- Vercel: 100GB流量/月 + 无限次部署
- 对于小型到中型团队完全够用!

**如果超过免费额度:**
- Supabase Pro: $25/月(200万用户)
- Vercel Pro: $20/月(1TB流量)

---

## 🔐 安全建议

1. **定期备份数据**
   - 在Supabase设置自动备份
   - 定期导出用户数据

2. **强密码策略**
   - 要求用户使用强密码
   - 启用邮箱验证

3. **监控使用情况**
   - 定期检查Supabase的使用统计
   - 警惕异常访问

4. **更新依赖**
   - 定期更新前端依赖包
   - 关注Supabase的安全公告
