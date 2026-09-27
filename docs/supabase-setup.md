# 开启账号与在线投稿功能（Supabase）

本站是纯静态站点，**本身没有后端**。要让"注册 / 登录 / 在线投稿 / 我的投稿"真正能用，需要一个数据库和账号服务。

本方案用 **Supabase**，理由：

- 免费额度：**5 万月活用户 + 500MB 数据库 + 1GB 文件存储**，永久免费
- 支持邮箱密码注册、OAuth（GitHub / ORCID 等）
- 直接从静态网页调用，**不需要自己写服务器**
- 自带行级安全（RLS），别人看不到你的数据

没配置也能用 —— 网站会自动降级为"邮件投稿"。

---

## 第一步：建项目

1. 打开 <https://supabase.com>，用 GitHub 或邮箱注册
2. **New project**
   - Name：`tdf`
   - Database Password：随便设一个，**记下来**
   - Region：选 **Southeast Asia (Singapore)**，国内访问最快
3. 等 1–2 分钟项目初始化完成

---

## 第二步：建数据表

左侧 **SQL Editor** → **New query** → 把下面整段粘进去 → **Run**。

```sql
-- ============================================================
--  TDF 投稿表
-- ============================================================

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,

  title         text not null,
  authors       text not null,
  affiliation   text,
  contact_email text,
  abstract      text not null,
  keywords      text,
  file_url      text,

  -- submitted | screening | review | revision | accepted | rejected
  status        text not null default 'submitted',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists submissions_user_id_idx
  on public.submissions (user_id, created_at desc);

-- ============================================================
--  行级安全：投稿人只能看到和创建自己的记录
-- ============================================================

alter table public.submissions enable row level security;

drop policy if exists "insert own submissions" on public.submissions;
create policy "insert own submissions"
  on public.submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "read own submissions" on public.submissions;
create policy "read own submissions"
  on public.submissions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 编辑部（service_role）绕过 RLS，直接在后台改 status，
-- 所以这里不需要给普通用户开放 update / delete 权限。

-- ============================================================
--  自动更新 updated_at
-- ============================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists submissions_touch_updated_at on public.submissions;
create trigger submissions_touch_updated_at
  before update on public.submissions
  for each row execute function public.touch_updated_at();
```

---

## 第三步：拿到两个 key

左侧 **Project Settings** → **API**：

| 复制这个 | 粘到 config.js 的哪个字段 |
|---|---|
| **Project URL** | `supabaseUrl` |
| **anon / public** key | `supabaseAnonKey` |

> ⚠️ **只复制 `anon public` 那个。**
> `service_role` key 是管理员密钥，**绝对不能放进前端代码**，放进去等于把数据库交出去。编辑部改稿件状态时才用它，在 Supabase 后台手动操作即可。

---

## 第四步：填进配置文件

打开 `assets/js/config.js`：

```js
supabaseUrl:     "https://xxxxxxxxxxxx.supabase.co",
supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
```

保存、刷新页面。**导航栏右下角会立刻出现「登录 / 注册」。**

---

## 第五步（可选，但建议）：关掉邮箱确认

默认情况下，注册后要收邮件点确认链接才能登录。学生邮箱经常收不到。

**开发阶段**：Authentication → Sign In / Providers → Email → 关掉 **Confirm email** → Save

**正式运营**：建议保持开启，防止垃圾注册。也可以接自己的 SMTP（Authentication → Emails → SMTP Settings）。

---

## 编辑部怎么改稿件状态

Supabase 后台没有现成的界面，三个办法：

**办法 1（最简单）**：Table Editor → `submissions` → 直接双击 `status` 单元格改。

**办法 2（批量）**：SQL Editor 里执行

```sql
update public.submissions
set status = 'review'
where id = '改成那篇的id';
```

`status` 可用的值：`submitted` / `screening` / `review` / `revision` / `accepted` / `rejected`
（这六个值前端已经有对应的中文标签和颜色，不用改代码）

**办法 3（以后升级）**：Supabase 的 Table Editor 可以生成 REST 接口，配合 Retool / Appsmith 做一个编辑部后台。等工作量上来了再说。

---

## 常见问题

**Q：注册后登录不了，提示邮箱未确认？**
A：见第五步。要么关掉 Confirm email，要么去 Authentication → Users 手动点确认。

**Q：投稿后"我的投稿"里是空的？**
A：说明 RLS 策略没建成功。回第二步重跑一遍那两段 `create policy`。

**Q：能否不用 Supabase，用 Firebase / 自建后端？**
A：可以。只要改 `assets/js/auth.js` 和 `assets/js/submit.js` 里的调用，接口保持 `TDF_AUTH.signIn / signUp / signOut / client` 这几个方法就行。

**Q：免费额度会不会突然收费？**
A：Supabase 的免费层是**永久免费**（不是试用）。超出后项目会被暂停，不会自动扣费。5 万月活对一个学生平台来说，短期内远远用不到。
