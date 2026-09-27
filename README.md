# Transactions on Decarbonization Frontiers (TDF)

一个学生运营的**开放同行评审平台**网站。电动车、可再生能源、智慧电网、能源 AI 方向。

纯静态站点，**零成本**，可直接部署到 GitHub Pages / Cloudflare Pages。

> **TDF 不是期刊**，没有 ISSN/CN 号，也不声称自己是期刊。它做的是：组织公开同行评审、公开评审记录、把通过评审的论文索引进一个可引用的列表。
> 详见站内 [about.html](about.html)。

---

## 快速开始

```powershell
# 本地预览（任意一个都行）
python -m http.server 8000
# 然后浏览器打开 http://localhost:8000
```

> ⚠️ 不要直接双击 `index.html` 打开。`papers.html` 用 `fetch` 读 JSON，`file://` 协议下会被浏览器拦截。

---

## 目录结构

```
Publish/
├── index.html              首页
├── papers.html             论文索引
├── submit.html             投稿（在线表单 + 邮件）
├── review.html             评审流程
├── about.html              关于 / 编委会 / 出版伦理
├── login.html              登录 / 注册
├── dashboard.html          我的投稿（需登录）
│
├── assets/
│   ├── css/style.css       全部样式（一个文件）
│   ├── js/
│   │   ├── config.js       ★ 你要改的配置都在这里
│   │   ├── i18n.js         中英文字典
│   │   ├── site.js         页头 / 导航 / 页脚
│   │   ├── auth.js         账号系统（Supabase）
│   │   ├── submit.js       投稿表单
│   │   ├── dashboard.js    我的投稿
│   │   ├── login.js        登录 / 注册
│   │   └── papers.js       论文索引渲染
│   └── data/papers.json    ★ 收录论文的数据
│
├── templates.html          论文模板页（导航栏「Templates」）
├── templates/              ★ 供作者下载的论文模板
│   ├── tdf-manuscript.docx  Word（学生最常用）
│   ├── tdf-manuscript.tex   LaTeX
│   └── tdf-manuscript.typ   Typst（免安装，浏览器可用）
│
├── posters/                ★ 征稿海报（HTML 源文件 + 渲染好的 PNG/PDF）
│   ├── call-for-papers-zh.*   中文版
│   ├── call-for-papers-en.*   英文版
│   ├── poster.css             共用样式，改一处两个版本都变
│   └── qr.svg / qr.png        指向本站的二维码
│
├── .github/ISSUE_TEMPLATE/submission.yml   GitHub 投稿表单
├── supabase/functions/notify-submission/   投稿邮件提醒的 Edge Function
├── docs/
│   ├── supabase-setup.md   ★ 开启注册功能的完整步骤
│   ├── submission-alerts.md ★ 配好投稿邮件提醒（不配就收不到通知）
│   ├── review-form.md      评审意见表模板
│   └── deploy.md           部署到 GitHub Pages
├── tools/                  生成与回归脚本（见下）
└── README.md
```

## 常用脚本

```powershell
python tools\render_check.py       # 本地渲染全部页面 + 抓控制台错误 + 截图
python tools\live_check.py         # 对线上站点做同样的事
python tools\auth_check.py         # 验证登录/注册接线和导航布局
python tools\e2e_check.py          # 端到端：注册 → 投稿 → 读取

python tools\make_word_template.py # 重新生成 Word 模板
python tools\make_qr.py            # 重新生成二维码
python tools\make_header_art.py    # 重新生成海报头图（矢量）
python tools\render_poster.py      # 海报 HTML → PNG + PDF
python tools\check_qr.py           # 解码海报上的二维码，确认扫出来是对的
```

> 跑需要联网的脚本前先设代理：`$env:HTTPS_PROXY = "http://127.0.0.1:7890"`

---

## 你要改的三样东西

### 1️⃣ `assets/js/config.js` —— 基本信息

```js
name:         "Transactions on Decarbonization Frontiers",
contactEmail: "tdf.editorial@example.com",   // ← 换成你真正会看的邮箱
githubRepo:   "https://github.com/你的组织/tdf",
zenodoCommunity: "https://zenodo.org/communities/tdf",
defaultLang:  "en",                          // 默认英文；改成 "zh" 默认中文
```

### 2️⃣ 开启注册与在线投稿 —— 跟着 [docs/supabase-setup.md](docs/supabase-setup.md) 走

5 分钟，免费。填完这两个字段，导航栏立刻出现「登录 / 注册」：

```js
supabaseUrl:     "",
supabaseAnonKey: "",
```

**不填也能用** —— 网站会自动降级为「邮件投稿」。

### 3️⃣ `assets/data/papers.json` —— 收录论文

每收录一篇，往 `papers` 数组里加一个对象：

```json
{
  "no":      "TDF-2026-01",
  "title":   "考虑电动汽车参与的配电网低碳调度方法",
  "authors": "张三, 李四, 王五",
  "date":    "2026-09-27",
  "doi":     "10.5281/zenodo.1234567",
  "review":  "https://github.com/你的组织/tdf/issues/3"
}
```

`doi` 和 `review` 可留空。**排序不用管**，页面会自动按日期倒序。

---

## 两种投稿方式

| 方式 | 适合 | 需要数据库? |
|---|---|---|
| **GitHub Issue** | 公开发起，评审记录天然留档 | ❌ 不需要 |
| **在线表单** | 作者管理自己的投稿历史 | ✅ 需要 Supabase |

**建议先用 GitHub Issue 跑起来**，它零配置，而且 Issue 页面本身就是最好的公开评审记录 —— 这正好符合 TDF 的定位。

在线表单是给不熟悉 GitHub 的作者准备的，配置好 Supabase 后自动可用。

---

## 部署

见 [docs/deploy.md](docs/deploy.md)。一句话版本：

```powershell
git init
git add .
git commit -m "Initial site"
git remote add origin https://github.com/你的组织/tdf.git
git push -u origin main
```

然后在仓库 Settings → Pages → Source 选 `main` / `root`，约 1 分钟后上线，地址形如
`https://你的组织.github.io/tdf/`。

---

## 设计说明

界面刻意做得克制：白底、衬线标题、细分割线，参考 Copernicus / ACP 那一类正经学术期刊的排法。

**没有**渐变大标题、玻璃拟态、动效轰炸 —— 那些会让人一眼觉得"这是个学生做的花架子"。学术站点靠信息密度和秩序感建立可信度，不靠视觉冲击。

想改配色，只动 `assets/css/style.css` 顶部那一组 CSS 变量即可，全站自动跟着变。

---

## 语言

默认英文，右上角按钮切换中文，选择记在浏览器里。

要加/改文案，编辑 `assets/js/i18n.js` 里的字典：

```js
"nav.papers": { en: "Papers", zh: "论文" },
```

页面里用 `data-i18n="nav.papers"` 引用。找不到的 key 会原样显示，方便你发现漏翻的地方。

---

## 现在的状态

- [x] 七个页面 + 响应式样式
- [x] 中英双语切换
- [x] 论文索引（读 JSON）
- [x] 投稿表单（Supabase 存储 + 邮件降级）
- [x] 注册 / 登录 / 我的投稿
- [x] GitHub Issue 投稿模板
- [ ] **填 `config.js` 的联系邮箱** ← 现在就做
- [ ] **建 Zenodo 社区**
- [ ] **录第一篇论文进 `papers.json`**
- [ ] 部署上线
