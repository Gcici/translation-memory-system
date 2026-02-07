# 🔰 新手专用部署指南 - 零服务器,超安全

## 📖 阅读须知

**本指南特点:**
- ✅ 完全免费,不需要信用卡(Vercel部分除外,但也免费)
- ✅ 不需要购买服务器
- ✅ 不需要编程知识
- ✅ 每一步都有详细说明
- ✅ 预计时间:30-40分钟

**安全承诺:**
- 🔒 使用业界顶级安全平台
- 🔒 数据加密存储
- 🔒 自动防护攻击
- 🔒 符合国际安全标准

---

## 🎯 我们要用什么?

### 三个免费平台(都是世界顶级)

**1. GitHub** - 代码存储
- 作用: 存放你的网站代码
- 类比: 就像百度网盘,但专门存代码
- 安全性: ⭐⭐⭐⭐⭐ 微软旗下
- 费用: 完全免费

**2. Supabase** - 数据库
- 作用: 存储用户账号和翻译数据
- 类比: 就像Excel,但更专业更安全
- 安全性: ⭐⭐⭐⭐⭐ PostgreSQL企业级数据库
- 费用: 免费版支持5万用户

**3. Vercel** - 网站托管
- 作用: 让全世界都能访问你的网站
- 类比: 就像把你的网站"挂"在互联网上
- 安全性: ⭐⭐⭐⭐⭐ HTTPS加密,自动防护
- 费用: 免费版支持100GB流量/月

**为什么这个方案最安全?**
1. 三家都是顶级公司,安全团队24小时监控
2. 自动更新安全补丁
3. 自动防御黑客攻击
4. 比自己买服务器安全100倍!

---

## 🚀 开始部署(分5个阶段)

### 📍 阶段1: 准备工作(5分钟)

#### 步骤1.1: 注册GitHub账号

**为什么需要?**
- 存放代码
- 连接Vercel部署

**操作:**
1. 打开浏览器,访问: https://github.com
2. 点击右上角 "Sign up"(注册)
3. 填写:
   - 邮箱(推荐QQ邮箱或Gmail)
   - 密码(至少8位,包含字母+数字)
   - 用户名(随意,比如: zhang-san-123)
4. 完成人机验证
5. 验证邮箱(打开邮件,点击链接)

**安全建议:**
- ✅ 使用强密码(大小写+数字+符号)
- ✅ 启用两步验证(Settings → Password and authentication)
- ✅ 不要使用生日、姓名做密码

#### 步骤1.2: 下载项目文件

1. 下载我给你的 `translation-memory-system` 文件夹
2. 解压到桌面(方便找到)
3. 记住这个文件夹位置

#### 步骤1.3: 安装Git(Windows用户)

**为什么需要?**
- 把代码上传到GitHub

**如果你用Windows:**
1. 访问: https://git-scm.com/download/win
2. 下载安装包(选默认选项即可)
3. 一路"下一步"安装

**如果你用Mac:**
- Mac已经自带Git,跳过这步

**验证安装:**
1. 按 `Win + R`,输入 `cmd`,回车
2. 输入: `git --version`
3. 看到版本号就成功了

---

### 📍 阶段2: 上传代码到GitHub(10分钟)

#### 步骤2.1: 创建GitHub仓库

**什么是仓库?**
- 就是GitHub上的一个文件夹,专门存你的项目

**操作:**
1. 登录 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写:
   - Repository name(仓库名): `translation-memory`
   - Description(描述): `日中翻译记忆系统`
   - 选择: **Public**(公开) ← 重要!Vercel只能访问公开仓库
   - ❌ **不要**勾选 "Add a README file"
4. 点击 "Create repository"(创建仓库)

**安全提示:**
- 选Public是安全的,不用担心
- 代码公开没关系,重要的是API密钥不要上传
- 我已经在 `.gitignore` 文件中排除了敏感信息

#### 步骤2.2: 上传代码

**方法A: 使用Git命令(推荐)**

1. 打开命令提示符(CMD)或终端
2. 进入项目文件夹:
   ```bash
   cd Desktop\translation-memory-system
   ```
   (如果文件在桌面,Mac用户把 `\` 改成 `/`)

3. 依次执行以下命令:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/translation-memory.git
   git push -u origin main
   ```

4. 输入GitHub用户名和密码
   - **注意**: 密码可能需要用Personal Access Token
   - 获取Token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

**方法B: 使用GitHub网页上传(更简单)**

1. 进入你刚创建的仓库页面
2. 点击 "uploading an existing file"
3. 把整个 `translation-memory-system` 文件夹拖进去
4. 等待上传完成
5. 点击 "Commit changes"

**❗ 重要安全检查:**
上传前,确保没有以下文件:
- ❌ `.env` 文件(包含API密钥)
- ❌ 任何包含密码的文件
- ✅ `.gitignore` 文件存在(它会自动排除敏感文件)

---

### 📍 阶段3: 配置Supabase数据库(15分钟)

#### 步骤3.1: 注册Supabase

1. 访问: https://supabase.com
2. 点击 "Start your project"
3. 选择: "Continue with GitHub"(用GitHub登录,更方便)
4. 授权Supabase访问(这是安全的)

#### 步骤3.2: 创建项目

1. 点击 "New Project"
2. 填写:
   - **Organization**: 选择你的组织(默认即可)
   - **Project name**: `translation-memory`
   - **Database Password**: 
     - 点击 "Generate a password"(自动生成强密码)
     - **立即复制并保存这个密码!**
     - 保存到记事本或密码管理器
   - **Region**: 选择 `Northeast Asia (Tokyo)`(日本,速度快)
   - **Pricing Plan**: Free(免费版)

3. 点击 "Create new project"
4. 等待2-3分钟(会显示进度条)

**安全提示:**
- ✅ 数据库密码务必保存好
- ✅ 不要使用简单密码
- ✅ 不要分享给别人
- ✅ 如果忘记可以重置,但会影响现有数据

#### 步骤3.3: 创建数据表

1. 项目创建完成后,点击左侧 "SQL Editor"
2. 点击 "New query"
3. 打开我给你的 `deployment-guide.md` 文件
4. 找到"创建数据表"部分,复制所有SQL代码
5. 粘贴到Supabase的SQL编辑器中
6. 点击右下角 "Run"(运行)
7. 看到 "Success. No rows returned" 就成功了!

**这一步做了什么?**
- 创建了用户表(存储用户信息)
- 创建了翻译表(存储翻译记录)
- 设置了安全策略(用户只能看自己的数据)
- 创建了管理员权限系统

**安全措施:**
- ✅ 行级安全(RLS) - 用户数据完全隔离
- ✅ 密码加密存储
- ✅ 自动防SQL注入
- ✅ 符合GDPR等国际标准

#### 步骤3.4: 获取API密钥

1. 点击左侧 "Settings"(设置图标⚙️)
2. 点击 "API"
3. 复制并保存以下两个值:

**Project URL:**
```
https://xxxxx.supabase.co
```
**复制到记事本,标注"Supabase URL"**

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```
**复制到记事本,标注"Supabase Key"**

**安全说明:**
- `anon public` 密钥是公开的,可以放心使用
- 它只能做用户被允许的操作
- Supabase的行级安全会保护数据
- **不要**泄露 `service_role` 密钥(那个有完全权限)

---

### 📍 阶段4: 部署到Vercel(5分钟)

#### 步骤4.1: 注册Vercel

1. 访问: https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"(推荐)
4. 授权Vercel访问GitHub

**为什么用GitHub登录?**
- ✅ 自动连接你的代码仓库
- ✅ 代码更新后自动重新部署
- ✅ 不需要额外记密码

#### 步骤4.2: 导入项目

1. 登录后,点击 "New Project"
2. 在 "Import Git Repository" 中找到你的仓库:
   - `你的用户名/translation-memory`
3. 点击 "Import"

#### 步骤4.3: 配置环境变量(关键!)

**什么是环境变量?**
- 就是配置信息,告诉网站去哪找数据库

**操作:**
在 "Configure Project" 页面:

1. 展开 "Environment Variables"(环境变量)
2. 添加第一个:
   - Name(名称): `VITE_SUPABASE_URL`
   - Value(值): 粘贴你刚才保存的Supabase URL
   - 点击 "Add"

3. 添加第二个:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: 粘贴你的Supabase anon key
   - 点击 "Add"

**❗ 非常重要:**
- 名称必须**完全一致**,包括大小写
- `VITE_SUPABASE_URL` 
- `VITE_SUPABASE_ANON_KEY`
- 值不要有多余空格

#### 步骤4.4: 部署!

1. 检查配置:
   - Framework Preset: Vite(应该自动识别)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. 点击 "Deploy"(部署)
3. 等待2-3分钟(会显示部署进度)
4. 看到 "🎉 Congratulations!" 就成功了!

#### 步骤4.5: 获取网站地址

1. 部署成功后,会显示你的网站地址:
   ```
   https://translation-memory-xxxxx.vercel.app
   ```

2. 点击 "Visit"(访问)
3. 看到登录注册页面就成功了!

**你的网站已经上线了!** 🎉

**安全特性:**
- ✅ 自动HTTPS加密(🔒绿锁)
- ✅ 全球CDN加速
- ✅ DDoS攻击防护
- ✅ 自动扩展,不怕流量大

---

### 📍 阶段5: 设置管理员账号(2分钟)

#### 步骤5.1: 注册第一个账号

1. 访问你的网站
2. 点击 "注册"
3. 填写:
   - 邮箱: 你的真实邮箱
   - 密码: 强密码(至少6位)
4. 注册成功!

**如果启用了邮箱验证:**
- 去邮箱查收验证邮件
- 点击链接验证

#### 步骤5.2: 设置为管理员

1. 返回Supabase控制台: https://supabase.com
2. 选择你的项目
3. 点击左侧 "Table Editor"(表格编辑器)
4. 选择 `user_profiles` 表
5. 找到你的账号(通过邮箱识别)
6. 双击 `is_admin` 列
7. 改为 `true`
8. 回车保存

#### 步骤5.3: 验证管理员权限

1. 返回你的网站
2. 刷新页面(F5)
3. 重新登录
4. 应该能看到 "🔑 管理后台" 按钮
5. 点击进入,能看到用户列表

**恭喜!完成!** 🎊

---

## 🔒 安全加固建议

### 必做项(强烈建议)

**1. 启用两步验证**
- GitHub: Settings → Password and authentication → Two-factor authentication
- 推荐使用Google Authenticator或Microsoft Authenticator

**2. 定期检查访问日志**
- Vercel: 项目 → Analytics → 查看访问统计
- Supabase: 项目 → Logs → 查看操作日志

**3. 设置备份**
- Supabase自动每日备份
- 建议每月手动导出一次数据备份

**4. 使用强密码**
- 数据库密码: 至少16位,随机生成
- 管理员密码: 至少12位,大小写+数字+符号
- 推荐使用密码管理器(如1Password、Bitwarden)

### 可选项(进阶安全)

**1. 自定义域名**
- 在Vercel中设置: Settings → Domains
- 使用HTTPS更安全
- 看起来更专业

**2. 限制API访问**
- 在Supabase中设置IP白名单
- 限制API调用频率

**3. 监控告警**
- 设置异常登录提醒
- 设置数据库容量告警
- 设置流量异常提醒

**4. 定期安全审计**
- 每月检查一次用户列表
- 查看是否有异常账号
- 检查翻译数据是否正常

---

## 🆘 常见问题与解决

### Q1: 部署后网站打不开

**可能原因:**
1. Vercel部署失败
2. 环境变量配置错误
3. DNS还在生效中

**解决方法:**
1. 检查Vercel部署日志:
   - 项目 → Deployments → 点击最新一次
   - 查看是否有错误
2. 检查环境变量:
   - Settings → Environment Variables
   - 确认名称和值都正确
3. 等待5-10分钟再试

### Q2: 注册后无法登录

**可能原因:**
1. 邮箱验证未完成
2. 密码输入错误
3. Supabase连接问题

**解决方法:**
1. 检查邮箱,完成验证
2. 尝试重置密码
3. 在Supabase → Authentication → Users 检查用户是否创建成功

### Q3: 看不到管理后台

**可能原因:**
1. 未设置 `is_admin = true`
2. 浏览器缓存
3. 未重新登录

**解决方法:**
1. 在Supabase检查 `user_profiles` 表
2. 清除浏览器缓存或用无痕模式
3. 退出登录再重新登录

### Q4: 数据丢失了

**不要慌!**
1. Supabase有自动备份(保留7天)
2. 进入Supabase → Database → Backups
3. 可以恢复到之前任意时间点

**预防措施:**
- 定期手动导出数据
- 不要随意删除数据库表
- 重要操作前先备份

### Q5: 网站被攻击怎么办?

**Vercel和Supabase有自动防护:**
- DDoS攻击:自动过滤
- SQL注入:Supabase自动防御
- XSS攻击:React自动转义

**如果发现异常:**
1. 立即在Supabase中禁用可疑用户
2. 检查访问日志
3. 联系Supabase/Vercel支持

---

## 📊 费用说明

### 完全免费配置

**Supabase Free:**
- 500MB 数据库
- 1GB 文件存储
- 50,000 月活用户
- **足够个人和小团队使用!**

**Vercel Free:**
- 100GB 流量/月
- 无限次部署
- **足够中等规模网站!**

**GitHub Free:**
- 无限公开仓库
- 2GB 存储
- **完全够用!**

**总计: $0/月** 🎉

### 如果超出免费额度

**Supabase Pro: $25/月**
- 8GB 数据库
- 100GB 文件存储
- 200万 月活用户

**Vercel Pro: $20/月**
- 1TB 流量/月
- 更快的构建速度
- 团队协作功能

**何时需要升级?**
- 用户数 > 5万
- 数据库 > 500MB
- 流量 > 100GB/月

---

## ✅ 部署完成检查表

在继续使用前,请确认:

- [ ] 能访问网站(有绿锁🔒)
- [ ] 能注册新账号
- [ ] 能登录
- [ ] 能添加翻译对
- [ ] 能进行模糊搜索
- [ ] 能导入/导出数据
- [ ] 能看到管理后台(如果是管理员)
- [ ] API翻译功能可用(配置后)

**全部完成?恭喜!** 🎊

---

## 🎯 下一步做什么?

### 1. 配置AI翻译(可选)

参考 `API-GUIDE.md`:
- 获取Gemini免费API
- 或购买DeepL API
- 5分钟配置完成

### 2. 邀请用户使用

- 分享网站链接给同事/朋友
- 每个人有独立账号
- 数据完全隔离

### 3. 定期维护

- 每周查看一次管理后台
- 每月导出一次数据备份
- 每季度检查一次安全设置

### 4. 自定义域名(可选)

- 购买域名(如 `translate.com`)
- 在Vercel中绑定
- 更专业!

---

## 🔐 最终安全总结

**你的系统现在有:**

1. ✅ **企业级数据库** - Supabase PostgreSQL
2. ✅ **自动HTTPS加密** - Vercel提供
3. ✅ **数据隔离** - 每个用户只能看自己的数据
4. ✅ **密码加密** - Supabase自动处理
5. ✅ **DDoS防护** - Vercel自动过滤
6. ✅ **自动备份** - 每天自动备份
7. ✅ **全球CDN** - 快速+安全
8. ✅ **安全更新** - 平台自动更新

**比自己买服务器安全多了!**

---

## 📞 需要帮助?

**遇到问题:**
1. 查看本文档的"常见问题"章节
2. 检查Vercel部署日志
3. 检查Supabase日志
4. 清除浏览器缓存重试

**平台官方文档:**
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- React: https://react.dev

**记住:**
- 不要分享数据库密码
- 不要分享 `service_role` 密钥
- 定期检查访问日志
- 定期备份数据

---

**祝你使用愉快!** 🎉

这是一个完全**专业级**、**安全**、**免费**的翻译记忆系统!
