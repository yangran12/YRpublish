# 投稿邮件提醒

**没有这个，你收不到任何通知。** 在线表单投稿是直接写进 Supabase 数据库的，
不配置的话你不主动去后台看，就不知道有人投稿了 —— 而我们对外承诺"初筛 3 个工作日"。

配好之后的效果：**每收到一篇投稿，你的 163 邮箱立刻收到一封邮件**，里面带标题、
作者、单位、通信邮箱、摘要和稿件链接。

---

## 原理（一句话）

```
作者提交 → 写进 Supabase 的 submissions 表
              ↓（数据库触发器）
       调用 notify-submission 这个函数
              ↓
        用你的 163 邮箱发一封邮件给你自己
```

投稿人的信息只经过**你自己的邮箱**，不经过任何第三方服务。

---

## 第 1 步：拿到 163 的 SMTP 授权码

⚠️ **授权码不是你的登录密码**，是专门给程序用的一串字符。

1. 浏览器登录 <https://mail.163.com>
2. 顶部 **设置** → **POP3/SMTP/IMAP**
3. 找到 **SMTP服务**，点 **开启**
4. 按提示用手机发一条短信验证
5. 验证通过后会给你一串**授权码**（形如 `ABCDEFGHIJKLMNOP`）

**把这串码复制下来**，下一步要用。它只显示一次，关掉页面就看不到了
（看不到可以重新生成一个）。

---

## 第 2 步：在 Supabase 建函数

1. 打开你的 Supabase 项目 → 左侧 **Edge Functions**
2. 点 **Create a new function**（或 Deploy a new function）
3. 名字填：`notify-submission`
4. 把仓库里 `supabase/functions/notify-submission/index.ts` 的**全部内容**粘贴进去
5. 点 **Deploy**

> 如果你看到 "Deploy via CLI" 的提示，找找页面上有没有 **Via Editor** / 浏览器内编辑的入口。
> Supabase 一直在改界面，**能用浏览器编辑就别装 CLI**。

---

## 第 3 步：填配置（Secrets）

在 **Edge Functions → Secrets**（有的版本在 Project Settings → Edge Functions）：

| 名称 | 填什么 | 必填 |
|---|---|---|
| `MAIL_USER` | `18755246110@163.com` | ✅ |
| `MAIL_PASS` | 第 1 步拿到的**授权码** | ✅ |
| `MAIL_TO` | `18755246110@163.com`（不填就发给自己） | 可选 |
| `SITE_URL` | `https://yangran12.github.io/YRpublish` | 可选 |
| `HOOK_SECRET` | 随便编一串随机字符，比如 `tdf-hook-8f3k2m9x` | 建议填 |

⚠️ **`MAIL_PASS` 一定填授权码，不要填登录密码** —— 填错了会一直报认证失败。

填完**重新 Deploy 一次函数**，Secrets 才会生效。

---

## 第 4 步：建数据库触发器

左侧 **Database** → **Webhooks** → **Create a new hook**

| 字段 | 填什么 |
|---|---|
| Name | `notify-submission` |
| Table | `submissions` |
| Events | 只勾 **Insert** |
| Type | **Supabase Edge Function** |
| Edge Function | `notify-submission` |
| Method | `POST` |
| HTTP Headers | `x-tdf-secret` : 你在第 3 步填的那串 |

点 **Create webhook**。

---

## 第 5 步：测试

用你自己的账号在网站上走一遍投稿：<https://yangran12.github.io/YRpublish/submit.html>

**1 分钟内**你的 163 邮箱应该收到邮件。

没收到就往下看。

---

## 没收到？按顺序排查

### ① 先看函数日志

Supabase → **Edge Functions** → `notify-submission` → **Logs**

那里会打印具体错误。对着下表看：

| 日志里的错误 | 原因 | 怎么办 |
|---|---|---|
| `535 Authentication failed` | 授权码填错，或 Secrets 没生效 | 回第 1 步重新生成授权码；改完 Secret 后**重新 Deploy** |
| `Connection refused` / `timeout` | **163 拒绝了海外服务器的连接** | 见下方「换发信邮箱」 |
| `getaddrinfo ENOTFOUND` | `MAIL_HOST` 拼错 | 应该是 `smtp.163.com` |
| 日志里什么都没有 | Webhook 没触发 | 回第 4 步检查 Table 是不是 `submissions`、Events 是不是 `Insert` |
| `bad secret` | 两边 secret 不一致 | Webhook 里的 header 和 Secret 必须一模一样 |

### ② 换发信邮箱（如果 163 拒了海外连接）

**这是最可能遇到的问题** —— 163 对境外 IP 的 SMTP 连接管得比较严，而
Supabase 的服务器在境外。

换一个邮件服务商就行，**只改 Secret，代码一个字不用动**：

| 邮箱 | `MAIL_HOST` | `MAIL_PORT` | 备注 |
|---|---|---|---|
| QQ 邮箱 | `smtp.qq.com` | `465` | 同样要开 SMTP 并拿授权码 |
| Outlook / Hotmail | `smtp-mail.outlook.com` | `587` | 用应用密码；587 需要把代码里 `tls: true` 改一下 |
| Gmail | `smtp.gmail.com` | `465` | 用应用专用密码；国内访问不稳定 |

**建议先试 QQ 邮箱** —— 同样在国内、同样免费、对境外连接比 163 宽松一些。
把 `MAIL_USER` 换成 QQ 地址、`MAIL_PASS` 换成 QQ 的授权码、`MAIL_HOST` 改成
`smtp.qq.com`，重新 Deploy 即可。**收件地址 `MAIL_TO` 仍然可以是你的 163。**

### ③ 检查 163 的发信限额

163 免费邮箱每日发信有上限（约 200 封）。我们这个场景一学期也就几十封，
远够用。但如果日志提示超限，等第二天。

---

## 几个要知道的限制

- **Webhook 没有重试机制。** 发信失败就丢了。所以**函数里发信失败会返回 500
  并在日志里留记录** —— 偶尔去 Logs 看一眼，别完全不管。
- **邮件不是投稿成功的必要条件。** 投稿**已经存进数据库**了，邮件只是提醒。所以
  即使邮件挂了，稿件也不会丢，你手动去 Supabase 后台照样能看到。
- **想知道有没有漏的投稿**：Supabase → **Table Editor** → `submissions`，
  按 `created_at` 倒序就是最新的。

---

## 如果你不想配這一套

那至少做到这一点：**每隔一两天登录 Supabase 后台看一眼 Table Editor**。

不要既不配提醒、又不看后台 —— 那等于对外承诺了"3 个工作日初筛"，实际上没人看。

---

## 附：留一份"手动检查"的底线方案

```sql
-- 在 Supabase SQL Editor 里跑，看最近 30 天的投稿
select created_at, title, authors, contact_email, status
from public.submissions
order by created_at desc
limit 50;
```
