/* ==========================================================================
   Bilingual dictionary (English default / 中文)
   --------------------------------------------------------------------------
   Usage in HTML:
     <h2 data-i18n="papers.heading"></h2>            -> textContent
     <input data-i18n-placeholder="submit.title_ph">  -> placeholder
     <button data-i18n-aria="common.menu">            -> aria-label
   Anything not found in the dictionary is left untouched.
   ========================================================================== */

(function () {
  "use strict";

  var DICT = {

    /* ---------------------------------------------------------- brand/nav */
    "brand.title":    { en: "Transactions on Decarbonization Frontiers",
                        zh: "脱碳前沿汇刊" },
    "brand.subtitle": { en: "Electric Mobility · Renewable Energy · Smart Grids · Artificial Intelligence",
                        zh: "电动汽车 · 可再生能源 · 智慧电网 · 人工智能" },

    "nav.home":      { en: "Home",            zh: "首页" },
    "nav.papers":    { en: "Papers",          zh: "论文" },
    "nav.submit":    { en: "Submit",          zh: "投稿" },
    "nav.review":    { en: "Review process",  zh: "评审流程" },
    "nav.about":     { en: "About",           zh: "关于" },
    "nav.signin":    { en: "Sign in",         zh: "登录" },
    "nav.register":  { en: "Register",        zh: "注册" },
    "nav.dashboard": { en: "My submissions",  zh: "我的投稿" },
    "nav.signout":   { en: "Sign out",        zh: "退出" },
    "nav.skip":      { en: "Skip to content", zh: "跳到正文" },

    /* ------------------------------------------------------------- common */
    "common.email":         { en: "Email address",   zh: "邮箱" },
    "common.password":      { en: "Password",        zh: "密码" },
    "common.loading":       { en: "Loading…",        zh: "加载中…" },
    "common.optional":      { en: "optional",        zh: "选填" },
    "common.required":      { en: "required",        zh: "必填" },
    "common.save":          { en: "Save",            zh: "保存" },
    "common.cancel":        { en: "Cancel",          zh: "取消" },
    "common.close":         { en: "Close",           zh: "关闭" },
    "common.learnMore":     { en: "Learn more",      zh: "了解更多" },
    "common.viewAll":       { en: "View all",        zh: "查看全部" },
    "common.comingSoon":    { en: "Coming soon",     zh: "即将开放" },
    "common.working":       { en: "Working…",        zh: "处理中…" },

    /* ---------------------------------------------------------- home page */
    "home.eyebrow": { en: "Open access · No author charges", zh: "开放获取 · 不向作者收费" },
    "home.title":   { en: "A student-run open review platform for the decarbonization transition",
                      zh: "一个由学生运营的脱碳转型开放评审平台" },
    "home.lede":    { en: "TDF organises open peer review for research on electric mobility, renewable energy, smart grids and their intersection with artificial intelligence. Accepted work is archived on Zenodo with a DOI; review records are published openly alongside it.",
                      zh: "TDF 为电动汽车、可再生能源、智慧电网及其与人工智能交叉方向的研究组织开放同行评审。通过评审的论文将存档于 Zenodo 并获得 DOI，评审记录同时公开。" },

    "home.meta.scope":   { en: "Scope",     zh: "范围" },
    "home.meta.scope_v": { en: "Electric mobility, renewables, smart grids, AI", zh: "电动汽车、可再生能源、智慧电网、人工智能" },
    "home.meta.model":   { en: "Model",     zh: "模式" },
    "home.meta.model_v": { en: "Diamond open access — no fees, either side", zh: "钻石开放获取 —— 双向免费" },
    "home.meta.status":  { en: "Status",    zh: "状态" },
    "home.meta.status_v":{ en: "Student-run, accepting submissions", zh: "学生运营，接受投稿中" },

    "home.how.heading": { en: "How it works", zh: "运作方式" },
    "home.how.lede":    { en: "Four steps, no publication charges, and a public record at every stage.",
                          zh: "四步完成，全程不收费，每个环节都有公开记录。" },

    "home.step1.t": { en: "You deposit the preprint", zh: "作者存交预印本" },
    "home.step1.d": { en: "Upload your manuscript to Zenodo. It receives a DOI immediately — it is citable from day one, while review is still running.",
                      zh: "将稿件上传至 Zenodo，立即获得 DOI —— 从第一天起即可被引用，此时评审仍在进行。" },
    "home.step2.t": { en: "We assign reviewers", zh: "编辑部指派评审人" },
    "home.step2.d": { en: "Two reviewers are invited. Their reports are posted openly, with the manuscript and your responses, in a public review thread.",
                      zh: "邀请两位评审人。评审意见与稿件、作者答复一并公开发布在评审记录中。" },
    "home.step3.t": { en: "You revise", zh: "作者修改" },
    "home.step3.d": { en: "Revisions are handled in the same public thread, so the history of the paper is legible to anyone who reads it later.",
                      zh: "修改在同一公开记录中完成，论文的完整历史对后来的读者清晰可见。" },
    "home.step4.t": { en: "We index it", zh: "平台收录" },
    "home.step4.d": { en: "Accepted papers get a TDF number and appear in the index here, linked to their DOI. Authors may still submit to a journal elsewhere.",
                      zh: "通过的论文获得 TDF 编号并收录于本站索引，链接至其 DOI。作者仍可另行投稿至其他期刊。" },

    "home.scope.heading": { en: "Scope", zh: "征稿范围" },
    "home.scope.lede": { en: "We consider work in the following areas. Interdisciplinary submissions are welcome.",
                         zh: "我们接受以下方向的稿件，尤其欢迎交叉研究。" },
    "home.scope.a.t": { en: "Electric mobility",   zh: "电动汽车" },
    "home.scope.a.d": { en: "Vehicle-grid integration, charging infrastructure, powertrain electrification, fleet operation.",
                        zh: "车网互动、充电基础设施、动力系统电动化、车队运营。" },
    "home.scope.b.t": { en: "Renewable energy",    zh: "可再生能源" },
    "home.scope.b.d": { en: "Solar, wind, storage, hydrogen, and the system-level problems that come with scaling them.",
                        zh: "光伏、风电、储能、氢能，以及规模化带来的系统级问题。" },
    "home.scope.c.t": { en: "Smart grids",         zh: "智慧电网" },
    "home.scope.c.d": { en: "Dispatch, stability, demand response, market design, distribution-level operation.",
                        zh: "调度、稳定性、需求响应、市场设计、配电网运行。" },
    "home.scope.d.t": { en: "AI in energy systems", zh: "能源系统中的人工智能" },
    "home.scope.d.d": { en: "Forecasting, control, optimisation and data-driven methods applied to the grid.",
                        zh: "应用于电网的预测、控制、优化与数据驱动方法。" },

    "home.cta.heading": { en: "Submit a manuscript", zh: "投稿" },
    "home.cta.body":    { en: "There is no submission fee and no article processing charge. If you are unsure whether your work fits, write to us before submitting.",
                          zh: "不收取投稿费，也不收取版面费。若不确定选题是否合适，欢迎先来信询问。" },

    /* -------------------------------------------------------- papers page */
    "papers.title": { en: "Indexed papers", zh: "收录论文" },
    "papers.lede":  { en: "Every paper listed here has completed open review. Each links to its archived copy and DOI.",
                      zh: "以下每篇论文均已完成公开评审，链接至存档版本与 DOI。" },
    "papers.th.no":      { en: "No.",     zh: "编号" },
    "papers.th.title":   { en: "Title",   zh: "标题" },
    "papers.th.date":    { en: "Date",    zh: "日期" },
    "papers.th.doi":     { en: "DOI",     zh: "DOI" },
    "papers.th.review":  { en: "Review",  zh: "评审记录" },
    "papers.empty":      { en: "No papers have been indexed yet. The first call for submissions is open.",
                           zh: "暂无收录论文。第一期征稿正在进行中。" },

    /* -------------------------------------------------------- submit page */
    "submit.title": { en: "Submit a manuscript", zh: "投稿" },
    "submit.lede":  { en: "Two ways in. If you have an account, use the form — it keeps your submission history in one place. Otherwise, email the editorial office.",
                      zh: "两种方式。有账号请用下方表单，便于统一管理投稿记录；没有账号也可直接邮件投稿。" },

    "submit.tab.form":  { en: "Online form",   zh: "在线表单" },
    "submit.tab.email": { en: "By email",      zh: "邮件投稿" },

    "submit.before.heading": { en: "Before you submit", zh: "投稿前请确认" },
    "submit.before.1": { en: "The manuscript is not under consideration elsewhere.",
                         zh: "稿件未在其他刊物审稿中。" },
    "submit.before.2": { en: "All authors have agreed to the submission and to open review.",
                         zh: "全部作者同意投稿并同意公开评审。" },
    "submit.before.3": { en: "You are willing to deposit the preprint on Zenodo (we will walk you through it).",
                         zh: "愿意将预印本存交至 Zenodo（我们会协助操作）。" },

    "submit.f.title":       { en: "Manuscript title",      zh: "论文标题" },
    "submit.f.title_ph":    { en: "Full title of the manuscript", zh: "请输入论文完整标题" },
    "submit.f.authors":     { en: "Authors",               zh: "作者" },
    "submit.f.authors_ph":  { en: "Zhang San, Li Si, Wang Wu", zh: "张三，李四，王五" },
    "submit.f.affil":       { en: "Affiliation",           zh: "作者单位" },
    "submit.f.affil_ph":    { en: "School of Electrical and Automation Engineering, …", zh: "电气与自动化工程学院，……" },
    "submit.f.email":       { en: "Corresponding author email", zh: "通信作者邮箱" },
    "submit.f.abstract":    { en: "Abstract",              zh: "摘要" },
    "submit.f.abstract_ph": { en: "Paste the abstract here (150–250 words).", zh: "请粘贴摘要（150–250 词）" },
    "submit.f.keywords":    { en: "Keywords",              zh: "关键词" },
    "submit.f.keywords_ph": { en: "Electric vehicles; smart grid; low-carbon dispatch", zh: "电动汽车；智慧电网；低碳调度" },
    "submit.f.link":        { en: "Manuscript link",       zh: "稿件链接" },
    "submit.f.link_hint":   { en: "Zenodo, OSF, or a shared drive link. PDF preferred.", zh: "Zenodo、OSF 或网盘链接，建议 PDF。" },
    "submit.f.link_ph":     { en: "https://zenodo.org/records/…", zh: "https://zenodo.org/records/……" },
    "submit.f.submit":      { en: "Submit manuscript",     zh: "提交稿件" },

    "submit.authNeeded": { en: "Sign in to submit through the form. Without an account you can still submit by email.",
                           zh: "登录后可使用在线表单投稿。没有账号也可通过邮件投稿。" },
    "submit.ok":   { en: "Received. The editorial office will acknowledge within {days} working days.",
                     zh: "已收到。编辑部将在 {days} 个工作日内回复确认。" },
    "submit.fail": { en: "Could not submit. Please try again, or email the editorial office.",
                     zh: "提交失败，请重试，或直接邮件联系编辑部。" },

    "submit.email.heading": { en: "Submitting by email", zh: "邮件投稿" },
    "submit.email.body":    { en: "Send the manuscript as a PDF attachment, with a short covering message giving the title, authors, affiliations and a contact address.",
                              zh: "请将稿件以 PDF 附件发送，并在正文中简要说明标题、作者、单位及联系方式。" },

    /* -------------------------------------------------------- review page */
    "review.title": { en: "Review process", zh: "评审流程" },
    "review.lede":  { en: "What happens between submission and a decision, and what we expect from reviewers.",
                      zh: "从投稿到决定之间会发生什么，以及我们对评审人的要求。" },

    "review.model.heading": { en: "Open review", zh: "公开评审" },
    "review.model.body": { en: "Reports are published with the paper and the authors' responses. Reviewers may choose to remain anonymous to the authors during the process; their reports are public either way. We think this makes reports more careful and gives reviewers something they can point to.",
                           zh: "评审意见与论文、作者答复一并公开。评审人在过程中可选择对作者匿名，但评审意见无论如何都会公开。我们认为这能让评审更审慎，也让评审人的工作有据可查。" },

    "review.timeline.heading": { en: "Timeline", zh: "时间安排" },
    "review.tl1.t": { en: "Editorial screening",     zh: "编辑部初筛" },
    "review.tl1.d": { en: "Within 3 working days. We check scope, completeness and that the work is not under consideration elsewhere. Manuscripts out of scope are returned without review.",
                      zh: "3 个工作日内。检查选题范围、完整性，以及是否一稿多投。超出范围的稿件直接退回，不进入评审。" },
    "review.tl2.t": { en: "Reviewer assignment",     zh: "指派评审人" },
    "review.tl2.d": { en: "Two reviewers are invited, normally one student and one faculty member. Reviewers declare any conflict of interest before accepting.",
                      zh: "邀请两位评审人，通常为一名学生和一名教师。评审人须在应允前声明利益冲突。" },
    "review.tl3.t": { en: "Reports",                 zh: "出具评审意见" },
    "review.tl3.d": { en: "Reviewers are asked to return reports within 14 days. If a reviewer is late, we will tell the authors rather than leave them waiting.",
                      zh: "评审人应在 14 天内返回意见。若评审延迟，我们会告知作者，而非让其空等。" },
    "review.tl4.t": { en: "Decision",                zh: "决定" },
    "review.tl4.d": { en: "Accept, minor revision, major revision, or decline. Every decision is accompanied by the reviewers' reports and a short editorial note.",
                      zh: "录用、小修、大修或退稿。每项决定都附评审意见及一段编辑说明。" },
    "review.tl5.t": { en: "Publication and archiving", zh: "发布与存档" },
    "review.tl5.d": { en: "The final version is deposited on Zenodo, receives a DOI and a TDF number, and is listed in the index.",
                      zh: "最终版本存交 Zenodo，获得 DOI 与 TDF 编号，并收录于本站索引。" },

    "review.criteria.heading": { en: "What reviewers are asked to judge", zh: "评审标准" },
    "review.c1": { en: "Is the claim clearly stated and is the evidence adequate for it?", zh: "论点是否表述清晰，证据是否足以支撑？" },
    "review.c2": { en: "Can a reader reproduce the method from what is written?", zh: "读者能否根据文中的描述复现方法？" },
    "review.c3": { en: "Are the limitations stated honestly?", zh: "是否诚实说明了局限性？" },
    "review.c4": { en: "Is the presentation clear enough to be read without undue effort?", zh: "表述是否足够清晰，无需费力就能读懂？" },
    "review.c5": { en: "Does the work belong in this scope?", zh: "选题是否属于本刊范围？" },

    "review.become.heading": { en: "Become a reviewer", zh: "成为评审人" },
    "review.become.body": { en: "We welcome graduate students, faculty and advanced undergraduates with relevant expertise. No prior reviewing experience is required — we will send a short guide and pair new reviewers with an experienced one. Reviewing here is public, unpaid and citable.",
                            zh: "欢迎具有相关方向的研究生、教师及高年级本科生加入。无需评审经验 —— 我们会提供简短指南，并安排资深评审人带教。本平台的评审工作公开、无报酬、可被引用。" },

    /* --------------------------------------------------------- about page */
    "about.title": { en: "About TDF", zh: "关于 TDF" },
    "about.lede":  { en: "TDF is a student-run open review platform based at Nanjing Normal University. It is not a registered journal and does not claim to be one.",
                     zh: "TDF 是依托南京师范大学的学生运营开放评审平台。它不是注册期刊，也不冒充期刊。" },

    "about.what.heading": { en: "What TDF is, and is not", zh: "TDF 是什么，不是什么" },
    "about.is.heading":   { en: "It is",   zh: "它是" },
    "about.is.1": { en: "An organising body for open peer review.", zh: "一个组织开放同行评审的机构。" },
    "about.is.2": { en: "A public archive of review records.",      zh: "一个公开的评审记录存档。" },
    "about.is.3": { en: "A citable index of accepted preprints.",   zh: "一份可引用的收录预印本索引。" },
    "about.is.4": { en: "Run by students, advised by faculty.",     zh: "由学生运营，教师指导。" },
    "about.isnot.heading": { en: "It is not", zh: "它不是" },
    "about.isnot.1": { en: "A journal with an ISSN or CN number.",  zh: "不是拥有 ISSN 或 CN 号的期刊。" },
    "about.isnot.2": { en: "Indexed in Web of Science or Scopus.",  zh: "未被 Web of Science 或 Scopus 收录。" },
    "about.isnot.3": { en: "A substitute for peer-reviewed publication elsewhere.", zh: "不能替代在其他期刊的正式发表。" },
    "about.isnot.4": { en: "A venue that charges authors or readers.", zh: "不向作者或读者收取任何费用。" },

    "about.disclaimer.t": { en: "Note for authors and readers",
                            zh: "作者与读者须知" },
    "about.disclaimer.d": { en: "TDF has no ISSN or CN number and is not indexed in Web of Science or Scopus. A TDF listing is not a journal publication and should not be presented as one on a CV, in a degree application, or in a funding report.",
                            zh: "TDF 没有 ISSN 或 CN 号，也未被 Web of Science 或 Scopus 收录。TDF 的收录不等同于期刊发表，不应在简历、升学申请或项目结题材料中按期刊论文填报。" },

    "about.board.heading": { en: "Editorial board", zh: "编委会" },
    "about.board.lede":    { en: "Names and affiliations are listed once the board is confirmed.",
                             zh: "编委会确认后，此处列出成员姓名与单位。" },
    "about.board.empty":   { en: "The editorial board is being constituted. Expressions of interest are welcome.",
                             zh: "编委会正在组建中，欢迎来信表达意向。" },
    "about.board.role_editor":   { en: "Editor-in-Chief",       zh: "主编" },
    "about.board.role_assoc":    { en: "Associate Editors",     zh: "副主编" },
    "about.board.role_advisor":  { en: "Faculty Advisers",      zh: "学术顾问" },
    "about.board.role_managing": { en: "Managing Editors",      zh: "责任编辑" },
    "about.board.tbd":           { en: "To be confirmed",       zh: "待确认" },

    "about.ethics.heading": { en: "Publication ethics", zh: "出版伦理" },
    "about.ethics.lede": { en: "TDF follows the COPE core practices on authorship, conflicts of interest, data integrity and handling of misconduct. In outline:",
                           zh: "TDF 遵循 COPE（出版伦理委员会）关于署名、利益冲突、数据完整性与不端行为处理的核心规范，要点如下：" },
    "about.eth.1": { en: "Authorship is limited to those who made a substantive contribution. Gift and ghost authorship are not accepted.",
                     zh: "署名限于有实质性贡献者。不接受挂名与代笔。" },
    "about.eth.2": { en: "Plagiarism, data fabrication and duplicate submission lead to rejection, and the decision is recorded publicly.",
                     zh: "抄袭、数据捏造与一稿多投将导致退稿，且该决定会被公开记录。" },
    "about.eth.3": { en: "Conflicts of interest must be declared by authors and reviewers alike.",
                     zh: "作者与评审人均须申报利益冲突。" },
    "about.eth.4": { en: "Reviewers may not use unpublished manuscripts for their own work.",
                     zh: "评审人不得使用未发表稿件中的内容。" },
    "about.eth.5": { en: "Complaints may be sent to the editorial office; we will respond in writing.",
                     zh: "投诉可发送至编辑部，我们将书面答复。" },

    "about.contact.heading": { en: "Contact", zh: "联系方式" },

    /* ------------------------------------------------------------ accounts */
    "auth.signin":        { en: "Sign in",                 zh: "登录" },
    "auth.signup":        { en: "Create account",          zh: "注册账号" },
    "auth.tab.signin":    { en: "Sign in",                 zh: "登录" },
    "auth.tab.signup":    { en: "Register",                zh: "注册" },
    "auth.email_ph":      { en: "you@example.com",         zh: "you@example.com" },
    "auth.password_ph":   { en: "At least 8 characters",   zh: "至少 8 位" },
    "auth.password2":     { en: "Confirm password",        zh: "确认密码" },
    "auth.name":          { en: "Your name",               zh: "姓名" },
    "auth.name_ph":       { en: "Zhang San",               zh: "张三" },
    "auth.affil":         { en: "Institution",             zh: "所在单位" },
    "auth.role":          { en: "You are",                 zh: "您的身份" },
    "auth.role.student":  { en: "Student",                 zh: "学生" },
    "auth.role.faculty":  { en: "Faculty",                 zh: "教师" },
    "auth.role.reviewer": { en: "Reviewer",                zh: "评审人" },
    "auth.role.other":    { en: "Other",                   zh: "其他" },

    "auth.needSignin":  { en: "You need to sign in to see this page.", zh: "请先登录后再访问本页。" },
    "auth.notConfigured": { en: "Accounts are not enabled on this deployment yet. Set supabaseUrl and supabaseAnonKey in assets/js/config.js to switch them on. Meanwhile, you can submit by email.",
                            zh: "本站尚未启用账号功能。在 assets/js/config.js 中填入 supabaseUrl 与 supabaseAnonKey 即可开启。当前可通过邮件投稿。" },
    "auth.signinOk":    { en: "Signed in.",   zh: "已登录。" },
    "auth.signoutOk":   { en: "Signed out.",  zh: "已退出。" },
    "auth.signupOk":    { en: "Account created. Check your email if confirmation is required.",
                          zh: "账号已创建。若需邮箱确认，请查收邮件。" },
    "auth.pwMismatch":  { en: "The two passwords do not match.", zh: "两次输入的密码不一致。" },
    "auth.pwShort":     { en: "Password must be at least 8 characters.", zh: "密码至少 8 位。" },
    "auth.badCreds":    { en: "Incorrect email or password.", zh: "邮箱或密码不正确。" },
    "auth.emailTaken":  { en: "That email is already registered.", zh: "该邮箱已注册。" },
    "auth.signout":     { en: "Sign out", zh: "退出登录" },

    /* --------------------------------------------------------- dashboard */
    "dash.title":  { en: "My submissions", zh: "我的投稿" },
    "dash.lede":   { en: "Manuscripts submitted under your account.", zh: "您账号下提交的稿件。" },
    "dash.signedInAs": { en: "Signed in as", zh: "当前登录" },
    "dash.new":    { en: "Submit a manuscript", zh: "投新稿" },
    "dash.th.title":  { en: "Title",   zh: "标题" },
    "dash.th.status": { en: "Status",  zh: "状态" },
    "dash.th.date":   { en: "Submitted", zh: "提交时间" },
    "dash.empty":  { en: "You have not submitted anything yet.", zh: "您还没有投过稿。" },
    "dash.loadFail": { en: "Could not load your submissions.", zh: "无法加载投稿记录。" },

    "status.submitted": { en: "Submitted",      zh: "已提交" },
    "status.screening": { en: "Screening",      zh: "初筛中" },
    "status.review":    { en: "Under review",   zh: "评审中" },
    "status.revision":  { en: "Revision",       zh: "退修中" },
    "status.accepted":  { en: "Accepted",       zh: "已录用" },
    "status.rejected":  { en: "Declined",       zh: "已退稿" },

    /* ------------------------------------------------------------ footer */
    "footer.about":   { en: "TDF is a student-run open review platform. It is not a registered journal and makes no claim to be one. No fees are charged to authors or readers.",
                        zh: "TDF 是由学生运营的开放评审平台，不是注册期刊，也不作此声称。不向作者或读者收取任何费用。" },
    "footer.nav":     { en: "Navigate",  zh: "导航" },
    "footer.legal":   { en: "Policies",  zh: "规范" },
    "footer.ethics":  { en: "Publication ethics", zh: "出版伦理" },
    "footer.license": { en: "Licensing",  zh: "许可协议" },
    "footer.licenseText": { en: "Papers are published under CC BY 4.0 unless stated otherwise.",
                            zh: "除另有说明外，论文采用 CC BY 4.0 许可协议。" },
    "footer.rights":  { en: "Student-run editorial office", zh: "学生编辑部" },
  };

  /* ------------------------------------------------------------- engine -- */

  var STORAGE_KEY = "tdf.lang";

  function normalise(lang) {
    return (lang || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }

  function pick(entry, lang) {
    return entry[lang] || entry.en || "";
  }

  /** Translate a key. Returns the key itself if unknown, so gaps are visible. */
  function t(key, vars) {
    var entry = DICT[key];
    if (!entry) { return key; }
    var out = pick(entry, I18N.lang);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        out = out.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
      });
    }
    return out;
  }

  /** Apply translations to everything in `root` that carries a data-i18n* attr. */
  function apply(root) {
    var scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var entry = DICT[key];
      if (!entry) { return; }
      // Preserve inline markup if the page supplied a data-i18n-html flag.
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = pick(entry, I18N.lang);
      } else {
        el.textContent = pick(entry, I18N.lang);
      }
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var entry = DICT[el.getAttribute("data-i18n-placeholder")];
      if (entry) { el.setAttribute("placeholder", pick(entry, I18N.lang)); }
    });

    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var entry = DICT[el.getAttribute("data-i18n-aria")];
      if (entry) { el.setAttribute("aria-label", pick(entry, I18N.lang)); }
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var entry = DICT[el.getAttribute("data-i18n-title")];
      if (entry) { el.setAttribute("title", pick(entry, I18N.lang)); }
    });
  }

  var I18N = {
    lang: "en",
    t: t,
    apply: apply,

    set: function (lang) {
      this.lang = normalise(lang);
      document.documentElement.setAttribute("lang", this.lang === "zh" ? "zh-CN" : "en");
      try { localStorage.setItem(STORAGE_KEY, this.lang); } catch (e) { /* private mode */ }
      apply();
      document.dispatchEvent(new CustomEvent("tdf:langchange", { detail: { lang: this.lang } }));
    },

    toggle: function () {
      this.set(this.lang === "zh" ? "en" : "zh");
    },

    /** Read the stored choice, else the configured default. */
    initial: function () {
      var stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      return normalise(stored || (window.TDF_CONFIG && window.TDF_CONFIG.defaultLang) || "en");
    },
  };

  window.I18N = I18N;
})();
