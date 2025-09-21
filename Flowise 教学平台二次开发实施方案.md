

# **Flowise 教学平台二次开发实施方案**

本文档为基于开源项目 FlowiseAI 进行二次开发，构建一个多租户智能体教学平台的精简实施指南。

---

### **阶段一：项目初始化与版本控制设置**

状态：已完成

此阶段的目标是建立一个规范的开发环境，确保所有后续工作都能与上游（FlowiseAI 官方）的更新保持同步。

1. **Fork 官方仓库**：在 GitHub 上，Fork FlowiseAI/Flowise 仓库到您的组织或个人账户下。  
2. **克隆您的 Fork**：将您自己 Fork 的仓库克隆到本地开发环境。  
   Bash  
   git clone git@github.com:YOUR-USERNAME/Flowise.git  
   cd Flowise

3. **配置上游远程源 (Upstream)**：将原始的 FlowiseAI 仓库添加为一个名为 upstream 的远程源。这是保持与官方同步的关键步骤 。  
   Bash  
   git remote add upstream git@github.com:FlowiseAI/Flowise.git  
   git remote \-v \# 验证是否添加成功

4. **创建开发分支**：基于 main 分支创建一个新的长期开发分支，例如 edu-platform。**所有定制化修改都将在此分支上进行**。

---

### **阶段二：核心架构改造 \- 多租户用户体系**

状态：已完成

此阶段是整个项目的核心，旨在实现用户数据的完全隔离。

1. **实现用户认证系统**：  
   * 在 packages/server/src/database/entities/ 目录下，使用 TypeORM 创建一个新的 User.ts 实体，包含 id, username, password (哈希存储) 和 isAdmin 等字段。  
   * 在 packages/server/src/routes/ 目录下创建新的认证路由（如 auth.ts），实现用户注册和登录 API。  
   * 登录成功后，使用 jsonwebtoken 库生成并返回包含 userId 的 JWT (JSON Web Token)。  
   * 为所有需要保护的 API 路由添加一个 Express 中间件，用于校验 JWT 并将用户信息附加到请求对象上。  
2. **修改数据库 Schema**：  
   * 为以下核心数据实体添加 userId 外键，并建立与 User 实体的多对一关系：  
     * ChatFlow (智能体流程)  
     * ApiKey (用户 API 密钥)  
     * Credential (用户凭证)  
     * ChatMessage (聊天记录)  
     * DocumentStore (知识库文档)  
   * 使用 TypeORM 的 migration 功能生成并执行数据库迁移脚本，以安全地更新数据库结构。  
3. **重构数据访问层**：  
   * 系统性地审查并修改 packages/server/src/services/ 目录下的所有服务函数。  
   * 将所有数据查询和操作函数（如 getChatFlowById(id)) 重构为需要接收 userId 参数的形式（如 getChatFlowById(id, userId))。  
   * 在所有数据库查询中加入 userId 作为过滤条件，例如 this.chatFlowRepository.findOneBy({ id, userId })。这是确保数据隔离的最后一道防线。

---

### **阶段三：功能开发与平台定制**

在核心架构稳定后，开始实现面向教学场景的各项功能。

1. **界面国际化 (i18n) \- 简体中文支持**：  
   * 在 packages/ui/ 模块中，安装 react-i18next 和 i18next-browser-languagedector 1。  
   * 在 packages/ui/src/ 下创建 i18n.ts 配置文件并初始化 i18next。  
   * 在 packages/ui/public/ 目录下创建 locales/zh/translation.json 文件用于存放中文翻译。  
   * 遍历所有 React 组件，将界面上的硬编码英文字符串替换为 useTranslation 钩子提供的 t('key') 函数。  
   * 在导航栏或设置中添加一个语言切换组件。  
2. **精简连接器 (Nodes)**：  
   * 采用**非破坏性**的过滤方法，避免直接修改 packages/components 目录下的文件。  
   * 在 packages/server/ 的 .env 文件中，定义一个环境变量，如 DISABLED\_NODES="Airtable,GoogleDrive"。  
   * 修改服务器端加载所有节点的逻辑：在将节点列表发送给前端之前，读取该环境变量，并过滤掉列表中指定的节点。  
3. **开发后台管理功能**：  
   * **后端 API**：在 packages/server/src/routes/ 下创建新的管理员路由 (admin.ts)，并添加权限中间件（检查 isAdmin 标志）。  
     * POST /api/v1/admin/users: 创建单个用户。  
     * POST /api/v1/admin/users/import: 批量导入用户 (例如，通过 CSV 文件)。  
     * GET /api/v1/admin/users: 获取用户列表。  
   * **前端 UI**：在 packages/ui/ 中创建一个新的、受路由保护的管理页面 (/admin)，提供创建和批量导入用户的界面。

---

### **阶段四：部署与长期维护**

1. **部署**：  
   * 根据学校的基础设施，选择合适的数据库（如 PostgreSQL）。  
   * 配置生产环境的环境变量。  
   * 构建生产版本的应用 (pnpm build) 并部署到服务器或云平台。  
2. **长期维护 \- 与上游同步**：  
   * 这是一个需要**定期执行**的关键流程，以确保平台能获得 FlowiseAI 的新功能和安全更新。  
   * **核心命令序列** ：  
     Bash  
     \# 1\. 获取上游最新代码  
     git fetch upstream

     \# 2\. 确保本地 main 分支与上游 main 完全同步  
     git checkout main  
     git pull upstream main

     \# 3\. 切换到你的开发分支，并将其“变基”到最新的 main 分支之上  
     git checkout edu-platform  
     git rebase main

     \# 4\. (如果 rebase 成功) 强制推送更新到你的 Fork 仓库  
     git push origin edu-platform \--force-with-lease

   * 在 rebase 过程中，如果遇到冲突，需要手动解决，然后使用 git rebase \--continue 继续。  
   * **强烈建议使用 rebase 而非 merge**，以保持一个清晰、线性的提交历史，极大地方便未来的维护工作。

#### **Works cited**

1. How to Easily Add Internationalization (i18n) to Your New Software Project \- Locize, accessed September 21, 2025, [https://www.locize.com/blog/how-to-easily-add-i18n-to-your-software](https://www.locize.com/blog/how-to-easily-add-i18n-to-your-software)  
2. Add or Load Translations \- i18next documentation, accessed September 21, 2025, [https://www.i18next.com/how-to/add-or-load-translations](https://www.i18next.com/how-to/add-or-load-translations)  
3. Building Node | FlowiseAI \- Flowise documentation, accessed September 21, 2025, [https://docs.flowiseai.com/contributing/building-node](https://docs.flowiseai.com/contributing/building-node)