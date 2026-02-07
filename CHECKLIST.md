# 🎯 部署检查清单

## 📝 开始前准备
- [ ] 注册GitHub账号 (https://github.com)
- [ ] 注册Supabase账号 (https://supabase.com)
- [ ] 注册Vercel账号 (https://vercel.com)

## 🗄️ Supabase设置(15分钟)

### 创建项目
- [ ] 登录Supabase
- [ ] 点击"New Project"
- [ ] 填写项目信息:
  - [ ] Project name: `translation-memory`
  - [ ] Database Password: _____________ (请记住!)
  - [ ] Region: Northeast Asia (Tokyo)
- [ ] 等待项目创建完成(2-3分钟)

### 配置数据库
- [ ] 点击左侧"SQL Editor"
- [ ] 点击"New query"
- [ ] 复制`deployment-guide.md`中的SQL代码
- [ ] 点击"Run"执行
- [ ] 看到"Success. No rows returned"

### 获取API密钥
- [ ] 点击左侧"Settings"
- [ ] 点击"API"
- [ ] 复制并保存:
  - [ ] Project URL: _________________________________
  - [ ] anon public key: _________________________________

## 💻 代码准备(5分钟)

### GitHub仓库
- [ ] 创建新的GitHub仓库
- [ ] 将项目文件上传到GitHub:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin [你的仓库地址]
  git push -u origin main
  ```

## 🚀 Vercel部署(5分钟)

### 导入项目
- [ ] 访问 https://vercel.com
- [ ] 点击"New Project"
- [ ] 选择你的GitHub仓库
- [ ] 点击"Import"

### 配置环境变量
- [ ] 在"Environment Variables"添加:
  - [ ] Name: `VITE_SUPABASE_URL`
    - [ ] Value: [你的Supabase Project URL]
  - [ ] Name: `VITE_SUPABASE_ANON_KEY`
    - [ ] Value: [你的Supabase anon key]
- [ ] 点击"Deploy"
- [ ] 等待部署完成(2-3分钟)

### 获取网站地址
- [ ] 部署成功后,复制网站地址: _________________________________
- [ ] 访问网站测试

## 👤 设置管理员(2分钟)

### 注册账号
- [ ] 访问你的网站
- [ ] 点击"注册"
- [ ] 填写邮箱和密码
- [ ] 注册成功

### 设置管理员权限
- [ ] 返回Supabase控制台
- [ ] 点击左侧"Table Editor"
- [ ] 选择`user_profiles`表
- [ ] 找到你的账号(通过邮箱)
- [ ] 双击`is_admin`列,改为`true`
- [ ] 点击保存

### 验证管理员权限
- [ ] 返回网站,重新登录
- [ ] 看到"🔑 管理后台"按钮
- [ ] 点击进入,能看到用户列表

## ✅ 最终测试

### 基本功能
- [ ] 用户可以注册
- [ ] 用户可以登录
- [ ] 可以添加翻译对
- [ ] 可以导入JSON文件
- [ ] 可以进行模糊搜索
- [ ] 可以导出数据

### 管理员功能
- [ ] 可以查看用户列表
- [ ] 可以查看统计数据
- [ ] 可以设置其他管理员
- [ ] 可以导出所有数据

## 🎉 完成!

恭喜!你的翻译记忆系统已经成功上线!

**你的网站地址:** _________________________________

**下一步可以做什么:**
- [ ] 分享网站给其他用户
- [ ] 自定义域名(在Vercel设置中)
- [ ] 设置邮件模板(在Supabase Authentication中)
- [ ] 添加网站分析(Google Analytics)
- [ ] 定期备份数据

## 🆘 遇到问题?

### 常见问题解决

**问题1: 无法连接到Supabase**
- 检查环境变量是否正确填写
- 确认Supabase项目已创建成功
- 检查API密钥是否复制完整

**问题2: 注册后无法登录**
- 检查邮箱是否需要验证
- 在Supabase -> Authentication -> Providers 确认Email已启用
- 可以临时禁用邮箱验证测试

**问题3: 看不到管理后台**
- 确认已在Supabase中设置`is_admin`为`true`
- 重新登录
- 清除浏览器缓存

**问题4: Vercel部署失败**
- 检查package.json格式是否正确
- 确认所有文件都已上传到GitHub
- 查看Vercel的部署日志

**问题5: 模糊匹配不工作**
- 确认有翻译数据
- 尝试更短的搜索词
- 检查浏览器控制台错误(F12)

## 📞 获取帮助

如果遇到无法解决的问题:
1. 检查Supabase日志: Project -> Logs
2. 检查浏览器控制台: F12
3. 查看Vercel部署日志
4. 参考详细文档: deployment-guide.md

---

**预计总时间:** 25-30分钟(首次)  
**更新时间:** 2-3分钟

祝你使用愉快! 🎊
