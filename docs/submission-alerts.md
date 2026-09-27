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

## 第 2 步：拿到 service_role key

Supabase → **Project Settings** → **API** → 找到 **`service_role`** 那个 key
（不是 `anon`）→ 复制。

> ⚠️ **`service_role` key 是数据库的主钥匙**，能读写所有数据、绕过所有权限限制。
> 它**只能放进 GitHub Secrets**，绝对不能出现在任何文件里、也不能发给任何人。
>
> 这和 `anon` key 完全不同 —— `anon` 是设计成公开的，`service_role` 不是。

---

## 第 3 步：填 GitHub Secrets（5 分钟）

打开 <https://github.com/yangran12/YRpublish/settings/secrets/actions>

点 **New repository secret**，一个一个加：

| Name | Secret 值 |
|---|---|
| `SUPABASE_URL` | `https://eaueuxvizikfepbfponj.supabase.co` |
| `SUPABASE_SERVICE_KEY` | 第 2 步复制的 `service_role` key |
| `MAIL_USER` | `18755246110@163.com` |
| `MAIL_PASS` | 你的 163 **授权码**（不是登录密码） |
| `MAIL_TO` | `18755246110@163.com` |
| `MAIL_HOST` | `smtp.163.com` |
| `SITE_URL` | `https://yangran12.github.io/YRpublish` |

`MAIL_PORT` 不用填，默认 465。

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

换 QQ 邮箱最省事 —— **只改 3 个 Secret，代码一个字不动**：

| Secret | 改成 |
|---|---|
| `MAIL_HOST` | `smtp.qq.com` |
| `MAIL_USER` | 你的QQ号@qq.com |
| `MAIL_PASS` | QQ邮箱的授权码（设置 → 账户 → POP3/SMTP → 生成授权码） |

**`MAIL_TO` 保持 `18755246110@163.com` 不变** —— 提醒照样发到你 163。

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
