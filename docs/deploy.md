# 部署上线

三种方式，按省事程度排。**都免费。**

---

## 方式 A：GitHub Pages（推荐）

### 1. 建仓库

到 <https://github.com/new>：

- Repository name：`tdf`
- 选 **Public**（Pages 免费版要求公开仓库）
- **不要**勾 Add a README / .gitignore（我们已经有了）

### 2. 推代码

在本目录打开终端：

```powershell
git init
git add .
git commit -m "Initial TDF site"
git branch -M main
git remote add origin https://github.com/你的用户名/tdf.git
git push -u origin main
```

> 如果 `git push` 要求登录：GitHub 已不接受密码，需要 **Personal Access Token**。
> Settings → Developer settings → Personal access tokens → Tokens (classic) → 勾 `repo` → 生成后用 token 当密码。

### 3. 开启 Pages

仓库 → **Settings** → 左侧 **Pages**：

- **Source**：`Deploy from a branch`
- **Branch**：`main` / `/ (root)`
- **Save**

等 1–2 分钟，地址是：

```
https://你的用户名.github.io/tdf/
```

### 4. 绑定自己的域名（可选）

想用 `tdf.example.com` 这种地址：

1. 买域名（约 50–80 元/年，Namecheap / Cloudflare / 阿里云都行）
2. 在 DNS 加一条 CNAME 记录，指向 `你的用户名.github.io`
3. 仓库 Settings → Pages → Custom domain 填进去
4. 勾上 **Enforce HTTPS**

> 这一步是**唯一可能要花钱的地方**。不买也完全能用，只是地址长一点。

---

## 方式 B：Cloudflare Pages

比 GitHub Pages 快（国内访问尤其明显），操作更简单：

1. <https://pages.cloudflare.com> → **Create a project**
2. 选 **Direct Upload**，把整个 `Publish` 文件夹拖进去
3. 完成，立刻给你一个 `xxx.pages.dev` 地址

**好处**：国内访问比 `github.io` 顺畅得多。
**代价**：每次更新要重新拖一次（或者连 GitHub 仓库做自动部署）。

---

## 方式 C：只在本地跑

如果暂时不想公开：

```powershell
python -m http.server 8000
```

打开 <http://localhost:8000>。局域网内其他人也能通过你的 IP 访问。

---

## 部署之后要做的三件事

### 1. 改 `assets/js/config.js` 里的链接

```js
githubRepo: "https://github.com/你的用户名/tdf",        // ← 换成真实仓库
contactEmail: "你的邮箱",                                // ← 换成真实邮箱
zenodoCommunity: "https://zenodo.org/communities/tdf",  // ← 建完 Zenodo 社区后换
```

### 2. 在仓库里开 Issue 模板

`.github/ISSUE_TEMPLATE/submission.yml` 推上去后，别人在你仓库点 **New issue** 就会看到「投稿 / Manuscript submission」表单。**这个不需要额外配置，推上去就有。**

### 3. 建 Zenodo 社区

1. <https://zenodo.org> 用 GitHub 或 ORCID 登录
2. 右上角头像 → **Communities** → **New community**
3. 填名称 `Transactions on Decarbonization Frontiers`、描述、上传 logo
4. 建好后把 URL 填回 `config.js` 的 `zenodoCommunity`

> **重要**：Zenodo 社区可以设置**是否需要审核**。建议开启审核，这样别人提交的论文不会直接进你的社区 —— 这就是你的"编辑部权限"。

---

## 更新网站

改完文件后：

```powershell
git add .
git commit -m "描述你改了什么"
git push
```

GitHub Pages 会在 1 分钟内自动重新部署。

---

## 国内访问的提醒

`*.github.io` 在国内访问**时好时坏**。如果主要面向国内作者：

- 用 **Cloudflare Pages**（方式 B），国内访问明显更稳
- 或者两个都部署，GitHub 给国际作者，Cloudflare 给国内作者
- 最稳的长期方案是买个域名 + Cloudflare CDN，但那要花钱

**起步阶段不用纠结这个** —— 先把内容做出来，访问速度是有人来看之后才需要解决的问题。
