# 投稿邮件提醒（GitHub Actions 版）

**没有这个，你收不到任何通知。** 在线表单投稿是直接写进 Supabase 数据库的，
不配置的话你不主动去后台看，就不知道有人投稿了 —— 而我们对外承诺"初筛 3 个工作日"。

**效果**：每收到一篇投稿，**10 分钟内**你的 163 邮箱收到一封邮件，带标题、作者、
单位、通信邮箱、摘要和稿件链接。

---

## 为什么用这个方案而不是 Supabase 的 Webhook

Supabase 的界面改过很多轮，"Database Webhooks" 在不同版本里位置不一样（有的在
`Database → Webhooks`，有的挪到了 `Integrations → Webhooks`），免费版能不能用也
不一定。

**这个方案只依赖三样已经验证过能用的东西：**

| 用到的东西 | 状态 |
|---|---|
| GitHub 仓库 + Actions | ✅ 已经在用 |
| Python 标准库（urllib / smtplib） | ✅ 脚本已验证 |
| 你的 163 SMTP 授权码 | ✅ 已验证登录成功 |

**完全不碰 Supabase 的界面功能**，只用它的 REST 接口。

---

## 原理

```
GitHub Actions 每 10 分钟跑一次
        ↓
查 Supabase：有没有 notified_at 还是空的投稿？
        ↓  有
用你的 163 邮箱发一封邮件给自己
        ↓  发信成功
把这条记录的 notified_at 打上时间戳
        ↓
下次就不会重复发了
```

**关键设计**：只有**发信成功**才打时间戳。如果发信失败，这条记录会被下一轮
重新捡起来重发 —— 所以**不会漏，也不会重复**。

---

## 第 1 步：给数据库加一列（1 分钟）

Supabase → **SQL Editor** → New query → 粘贴 → **Run**：

```sql
alter table public.submissions
  add column if not exists notified_at timestamptz;

comment on column public.submissions.notified_at is
  'Set by tools/check_submissions.py once the alert email has gone out.';
```

这一列就是"有没有通知过"的标记。**不加这一列，脚本会报错。**

---

## 第 2 步：拿到密钥（1 分钟）

Supabase 改过密钥体系，你的界面可能是下面两种之一 —— **两种都能用。**

**路径**：Supabase 左侧最下面点 **⚙️ Project Settings** → **API Keys**

### 情况 A：看到「Publishable and secret API keys」标签页

1. 点进这个标签页
2. 如果页面上有 **Create new API keys** 按钮 → 先点它
   （会生成 publishable 和 secret 两个新 key，**旧的 key 依然有效**，不影响网站运行）
3. 复制 **Secret key**，形如 `sb_secret_xxxxxxxx`

> ⚠️ **新密钥只显示一次**，创建后立刻复制，关掉就看不到了（看不到就再建一个）。

### 情况 B：只看到旧的 anon / service_role

1. 找 **Legacy API Keys** 标签页（有些版本直接就在页面上）
2. 复制 **`service_role`** 那个，形如 `eyJhbGciOi...`
3. **不要复制 `anon`**

### 怎么区分你拿到的是哪种

| 样子 | 类型 |
|---|---|
| `eyJhbGciOi...` 很长一串 | 旧格式 `service_role` |
| `sb_secret_...` | 新格式 secret key |

**两种脚本都支持，不用管是哪一种。**

### ⚠️ 千万别弄混（这一条最容易出事）

| 密钥 | 能不能公开 |
|---|---|
| `anon` / `sb_publishable_...` | ✅ **本来就公开**，已经在网站代码里了 |
| `service_role` / `sb_secret_...` | ❌ **机密**，只能贴进 GitHub Secrets |

**复制的时候看清是哪个。** 抄错成 anon 的话脚本读不到数据（只能看到自己那条）；
抄错方向更糟 —— 把 service_role 贴到公开地方，数据库就等于交出去了。

---

## 第 3 步：填 GitHub Secrets（2 分钟）

打开 <https://github.com/yangran12/YRpublish/settings/secrets/actions>

点 **New repository secret**，**只需要加 2 个**：

| Name | Secret 值 |
|---|---|
| `SUPABASE_SERVICE_KEY` | 第 2 步复制的 `service_role` key |
| `MAIL_PASS` | 你的 163 **授权码**（不是登录密码） |

**其余的值不用填** —— 它们本来就已经公开在网站上（`assets/js/config.js` 和页脚里都有），
直接写在 `.github/workflows/submission-alerts.yml` 里了。

要改的话（比如换邮箱）**直接编辑那个 yml 文件**，改这几行：

```yaml
SUPABASE_URL: "https://eaueuxvizikfepbfponj.supabase.co"
MAIL_HOST:    "smtp.163.com"
MAIL_USER:    "18755246110@163.com"
MAIL_TO:      "18755246110@163.com"
SITE_URL:     "https://yangran12.github.io/YRpublish"
```

改完 commit + push 即可生效。

---

## 第 4 步：跑一次

1. 打开 <https://github.com/yangran12/YRpublish/actions>
2. 左边选 **Submission alerts**
3. 右边点 **Run workflow** → **Run workflow**
4. 等约 20 秒，点进这次运行看日志

**日志里会直接告诉你结果：**

| 日志 | 含义 |
|---|---|
| `no new submissions` | 一切正常，只是现在还没人投 |
| `1 new submission(s)` + `mailed ...` | ✅ 成功，去查你 163 收件箱 |
| `FAILED ...` | 见下面的排查表 |

---

## 第 5 步：真投一篇试试

自己走一遍：<https://yangran12.github.io/YRpublish/submit.html>

10 分钟内收邮件。

> 想立刻看到效果，投完手动点一次 **Run workflow** 就行，不用等。

---

## 没收到？看这里

先看 **Actions 运行日志里的报错**，对着下表：

| 报错 | 原因 | 怎么办 |
|---|---|---|
| `535 Authentication failed` | 授权码错 | 重新生成 163 授权码，更新 `MAIL_PASS` |
| `timeout` / `Connection refused` / `Network is unreachable` | **163 拒绝了 GitHub 服务器的连接**（境外 IP） | 见下方「换发信邮箱」 |
| `HTTP 401: Invalid API key` | `service_role` key 填错 | 回第 2 步重新复制 |
| `column ... notified_at does not exist` | 第 1 步的 SQL 没跑 | 回第 1 步 |
| 日志空白 / 工作流没跑 | Actions 被禁用 | 见下方「60 天限制」 |

### 换发信邮箱（如果 163 拒了境外连接）

**这是最可能遇到的问题。** 163 对境外 IP 管得严，而 GitHub 的服务器在境外。

换 QQ 邮箱最省事，**改两个地方就行**：

**① 改 `.github/workflows/submission-alerts.yml` 里的两行：**

```yaml
MAIL_HOST:    "smtp.qq.com"
MAIL_USER:    "你的QQ号@qq.com"
```

存盘 → `git add . && git commit -m "Switch to QQ mail" && git push`

**② 改 GitHub 的 `MAIL_PASS` Secret：**

换成 QQ 邮箱的授权码（QQ邮箱网页版 → 设置 → 账户 → POP3/SMTP服务 → 生成授权码）

**`MAIL_TO` 保持不变** —— 提醒照样发到你 163。

> 别忘了 QQ 邮箱也要先去设置里**开启 SMTP 服务**，否则拿不到授权码。

### ⚠️ 60 天限制（重要）

**GitHub 会在仓库连续 60 天没有提交时，自动停掉定时任务。**

你的仓库平时不怎么提交，所以这条**一定会触发**。停掉之后**不会有任何提示**，
提醒就悄悄失效了。

**两个应对办法：**

1. **手动跑** —— 投稿量不大的阶段最实用：
   去 <https://github.com/yangran12/YRpublish/actions> 点一次 **Run workflow**。
   比如每周一点一次，就补上了。
2. **定期推一次代码** —— 随便改个文件推上去，60 天计时就重置了。

> 我会在下面附一个「手动检查」的本地脚本，双保险。

---

## 本地手动跑（不依赖 GitHub，双保险）

同样的脚本，在你电脑上直接跑：

```powershell
$env:SUPABASE_URL           = "https://eaueuxvizikfepbfponj.supabase.co"
$env:SUPABASE_SERVICE_KEY   = "你的 service_role key"
$env:MAIL_USER              = "18755246110@163.com"
$env:MAIL_PASS              = "你的授权码"
$env:MAIL_TO                = "18755246110@163.com"

python tools\check_submissions.py
```

想先看看会发什么、不真发：

```powershell
$env:DRY_RUN = "1"
python tools\check_submissions.py
```

---

## 最后兜底：直接看数据库

无论邮件通不通，**投稿都已经存进数据库了，不会丢**。

Supabase → **SQL Editor**：

```sql
select created_at, title, authors, contact_email, status, notified_at
from public.submissions
order by created_at desc
limit 50;
```

`notified_at` 是空的 = 那篇还没通知过。
