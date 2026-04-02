# Content Parity Checklist

| 页面 | 区块 | 状态 | 备注 | 日期 |
| --- | --- | --- | --- | --- |
| Home | Hero | ✅ 与 https://greenhub420.co.uk/ 移动端文案/CTA 对齐 | `HeroClassic` 支持左对齐 + bullet 列表，复刻旧站 “Shop now / How it works” CTA。 | 2026-04-02 |
| Home | Featured products | ✅ Flowers / Pre-rolls / Vapes 卡片顺序、文案、CTA 与旧站一致 | 使用 `featuredCollectionsContent` fixture + 旧站图片链接。 | 2026-04-02 |
| Home | How it works | ✅ 3 步「Place order / We dispatch / Collect locker」文案沿用旧站 | `HowItWorksLocker` 数据与旧站一致，无额外样式差异。 | 2026-04-02 |
| Contact | Hero / Channels | ✅ HOME / CONTACT 面包屑、文案、Email/Telegram CTA、营业时间与旧站一致 | Hero 使用 `tone="soft"` + `contactHeroDetails` 重现 Email / Secure chat / Operating hours；`contactChannels` fixtures 覆盖 Telegram/Email/SMS。 | 2026-04-02 |
| FAQ | Hero / Groups | ✅ HOME / FAQ 文案、Contact/Support CTA、分组问答与旧站一致 | `faqGroups` fixtures 按 Lockers/Payments/Support 分组，`HeroClassic` soft 变体 + details 手风琴复制旧站展开样式。 | 2026-04-02 |
| Terms | Hero / TOC / Sections | ✅ UI 已对齐，文案为占位待 Legal 提供正式稿 | `termsSections` 存占位段落 + 注释；收到新条款后更新 fixtures 并 rerun lint/test。 | 2026-04-02 |
| Shipping | Hero / Timeline / Locker tips / Refund & Support CTA | ✅ 复刻旧站 timeline、locker etiquette、refund policy、support CTA | `shippingTimeline`、`lockerUsageTips`、`returnPolicies`、`supportSteps` 数据逐字；`ShippingPage` 增加 breadcrumb + soft tone hero。 | 2026-04-02 |
| How it works? | Hero / Locker steps / FAQ / Payment CTA | ✅ Hero breadcrumb + steps + FAQ + PaymentRecommendation 与旧站同步 | `HowItWorksPage` 使用 `HeroClassic` soft 变体、`HowItWorksLocker` 默认数据、`howItWorksFaq` 与旧站 copy 一致。 | 2026-04-02 |
| Shop All | Hero / Category tabs / Filters / Cards | ✅ Breadcrumb + tabs + strain 筛选 + 新卡片布局 | `/products` 使用 category+strain query，同步 Strapi 请求并 fallback mock；`ProductCard` 复刻图片/评分/THC/CTA。 | 2026-04-02 |
| Flowers | Hero / Category tabs / Cards | ✅ `/products?category=flowers` 继承 Shop All 结构 & 花类说明 copy | Category filter 绑定 `filters[category]=$eq=flowers`；无数据时回退 mock。 | 2026-04-02 |
| Pre-rolls | Hero / Category tabs / Cards | ✅ `/products?category=pre-rolls` 复刻预卷说明 & 卡片 | 同步 query param + fallback 文案。 | 2026-04-02 |
| Vapes | Hero / Category tabs / Cards | ✅ `/products?category=vapes` 复刻 vape 文案 & 卡片 | 数据缺失时展示 mock cart，等待 Strapi 图。 | 2026-04-02 |
| Home | Removed sections | ✅ 客户指定的 Featured products / How lockers work / Recommended payment 已隐藏 | `/app/page.tsx` 仅保留 Hero + FeaturedCollections，便于与旧站结构一致。 | 2026-04-02 |
| Home | Hero copy / bullets / CTA / stats | ✅ HeroClassic 呈现 HOME 面包屑、3 条 bullet、SHOP NOW/ HOW IT WORKS CTA 及 3 组统计 | `homeHeroContent` 与截图一致（全部大写文案+24/7 / 3.1k / 4.9/5 stats），`HeroClassic` 新增 bullets 渲染。 | 2026-04-02 |
| Product detail | Hero / weight picker / curated picks | ✅ 顶部大图+评分/价格 / 新 weight picker + 数量步进器 / “Curated picks” 列表 | `/products/[slug]` hero 使用 coverImage + fallback，`purchase-panel` 复刻重量卡片与数量步进器，底部 related products 用 `ProductCard`。 | 2026-04-02 |
| Product detail | Strapi fallback | ✅ serverFetch 失败时使用 fixtures/productListingFallbacks + meta | `getProduct` / `getRelatedProducts` 包装 try/catch 并回退 mock 数据（含 coverImage、rating、origin）；doc 记录 fallback 图源。 | 2026-04-02 |
| Register | Form + Strapi register | ✅ /register 使用 RHF + zod + /api/auth/register proxy 完成注册并存储 JWT | React Hook Form 验证邮件/密码/Telegram/phone，成功后显示 CTA；API 代理读取 `NEXT_PUBLIC_AUTH_BASE_URL`，`AuthProvider` 持久化 token/email。 | 2026-04-02 |
| Login / Account | Hooked to Strapi | ✅ /login 走 /api/auth/login，新 AuthProvider 管理 JWT + profile，/account 展示 Profile + Wallet | RHF + zod 登录表单（含 toast），`AuthProvider` 存 JWT 于 localStorage+cookie 并通过 `/api/auth/me` 刷新 profile，/account 顶部显示 email/phone/telegram。 | 2026-04-02 |
| Checkout / Orders | Stepper + Strapi订单 | ✅ /checkout 使用 Stepper + RHF/Zod + `createOrder`，/orders/[reference] 调用 tracking | `lib/orders-api.ts` 封装 checkout/list/tracking，checkout 汇总 slug/weight/qty→payload，确认页展示 locker ETA + concierge CTA。 | 2026-04-02 |
| Orders | History + filters | ✅ `/orders` 显示 summary、筛选 tabs、列表卡片、Load more、空状态 | `listMyOrders` + `useSWRInfinite`；离线 fallback `ordersFixture`；文档见 `docs/orders.md`。 | 2026-04-02 |
| Notifications | Bell + Drawer + Inbox | ✅ 新增 SWR Provider、导航铃铛、/notifications 列表（筛选/分页/批量已读） | `lib/notifications-api.ts` 封装 list/count/mark*，`NotificationProvider` 轮询 60s，Drawer + 页面 CTA 与 Strapi metadata 对齐。 | 2026-04-02 |
| Account profile edit | Phone/Telegram/Locker 保存 | ✅ /account 提供 RHF 表单 + /api/account/profile (GET/PUT) | proxy 调 Strapi customers/me，Zod 校验 phone/telegram，保存后刷新 SWR + AuthProvider profile。 | 2026-04-02 |
| Referral dashboard | Code / Stats / History | ✅ /referral 卡片展示邀请链接、统计、历史（Invites / Commission） | `lib/referral-api.ts` 封装 summary/events/transactions，页面含复制/分享 CTA、fallback mock、FAQ CTA。 | 2026-04-02 |
| Support hub | Channels + FAQ + Ticket | ✅ /support 集中客服渠道、FAQ、ticket 表单 + checkout/account 引用 | 复用 marketing fixtures、Clipboard toast、RHF + zod 表单（暂 mock 提交），Checkout/Account 改为链接 support hub。 | 2026-04-02 |
| Customer dashboard | Wallet / Orders / Referrals | ✅ /dashboard 汇总钱包、最近订单、通知、support/referral 快捷入口 | SWR 复用 wallet balance + orders + notifications + referral summary，withdrawal 暂用 mock，CTA 跳转相关页面。 | 2026-04-02 |
| Referral analytics tier-2 | Click/CTR/Commission | ✅ /referral + /dashboard 展示 clicks/CTR/转化率/点击佣金拆分 + commission history | `getReferralSummary()` 扩展字段，Commission history 表格、新规则文案、dashboard 卡展示 CTR & 本月佣金。 | 2026-04-02 |
| Referral anti-fraud | Turnstile + fingerprint | ✅ Turnstile token + fingerprint 注入 referral click API，UI 提示异常点击暂停奖励 | `ReferralTrackingProvider` + `/api/referral/click` 增 token/fingerprint，docs 更新流程。 | 2026-04-02 |
| Notification preferences | Email/Telegram/SMS | ✅ /account/notifications 管理渠道开关 + Quiet hours，落到 Strapi preferences | `/api/account/notifications` 代理 GET/PUT，RHF + optimistic update，docs/notifications.md 记录。 | 2026-04-02 |
| Account security | Password/Devices | ✅ /account/security 含改密、2FA 提醒、近期设备列表 | 改密 POST 代理 `/api/auth/change-password`，设备 API 用 fixtures，docs/account.md 增 Security 章节。 | 2026-04-02 |
| Telegram linking | Bot approvals | ✅ /account/telegram 指引绑定 bot、提示倒计时 + 解绑操作 | `/api/account/telegram` GET/DELETE + request-code/confirm 代理 Strapi，docs(account/notifications) 更新。 | 2026-04-02 |
| Product search | Keyword/filters | ✅ /search 支持关键词 + strain/THC/potency 筛选、最近搜索、ProductCard 结果 | `lib/search-api.ts` 调 Strapi filters + fallback，导航入口跳转 /search，docs/search.md 记录。 | 2026-04-02 |
| Product favorites | Heart/save | ✅ 收藏按钮 + /favorites 列表，状态同步 metadata | `/api/account/favorites` 代理 metadata，AuthProvider 提供 favorites + optimistic update，文档更新。 | 2026-04-02 |
| Admin | Product upload (`/admin/products/*`) | ✅ 新建/编辑 UI 与需求一致，集成 Strapi create/update + upload | `ProductEditor` + `lib/admin-api.ts`；参见 `docs/admin-product.md` 运行说明（JWT 共用、Save draft=publish 提示）。 | 2026-04-02 |
| Wallet | Balance + Top-up | ✅ `/wallet` 展示余额/历史，`/wallet/topup` 串联 tier + NowPayments + 指南 | `lib/wallet-api.ts` + `docs/wallet-topup.md` 记录流程，支持 NowPayments / bank / crypto 指南（bank/crypto 暂手动）。 | 2026-04-02 |
| Wallet | Withdrawal | ✅ `/wallet/withdraw` 表单 + `/wallet/withdraw/history` 列表 | `lib/withdrawal-api.ts` + `docs/wallet-withdrawal.md`；Amount/Payout/Review stepper + 历史筛选/分页 + fixtures fallback。 | 2026-04-02 |
| Wallet | Compliance update | ✅ Transfer ID banner + £20 最低限额 | `TransferIdNotice` + `deriveTransferId`，同时更新 `/wallet` / `/wallet/topup` / `/wallet/withdraw` 校验与文档。 | 2026-04-02 |
| Referral | Landing page | ✅ `/invite` public funnel | Hero/Rewards/Steps/FAQ + query param detection + copy link CTA；详见 `docs/referral.md`。 | 2026-04-02 |
| Referral | Poster generator | ✅ `/referral/poster` 可导出海报 | html-to-image + qrcode.react 生成 PNG/JPEG，模板/配色/自定义文案在 `docs/referral.md` 记录。 | 2026-04-02 |
| Referral | Leaderboard | ✅ `/referral/leaderboard` 展示达人榜 | Hero/Range tabs/Top 10 + Rising stars + 规则 FAQ；数据暂用 fixtures，接口 TODO 记于 `docs/referral.md`。 | 2026-04-02 |
| Guide | Locker onboarding | ✅ `/guide/locker` 交互式流程+FAQ | 链接已嵌入 checkout/support/how-it-works；详见 `docs/how-it-works.md`。 | 2026-04-02 |
| Guide | Payment guide | ✅ `/guide/payment` 付款教程 | Wallet/NowPayments/Manual transfer 步骤 + FAQ；链接嵌入 wallet/topup/support。 | 2026-04-02 |
| FAQ | Refresh | ✅ `/faq` 搜索+分类 | 统一 Locker/Payment/Orders/Wallet/Referral 数据源，支持 query tab + 搜索；详见 `docs/faq.md`。 | 2026-04-02 |

## FE-PARITY-PLAN（关键页面状态）

| 页面 | 状态 | 参考素材 | 备注 |
| --- | --- | --- | --- |
| Home | Done | 待提供（需 mobile hero + featured 截图） | Hero/Featured/How it works 已 1:1 替换，文案来自 2026-04-02 旧站；截图待抓取后放入 `docs/frontend-shots/2026-04-02/home-hero.png` 等。 |
| Shop All | Done | 待提供（参考图待上传） | `/products` hero + category tabs + strain filters + 新卡片布局完成，文案基于 2026-04-02 参考稿；等待官方截图存档。 |
| Flowers | Done | 待提供（参考图待上传） | `/products?category=flowers` 文案、筛选、卡片继承 Shop All 结构并使用花类 copy；待截图。 |
| Pre-rolls | Done | 待提供（参考图待上传） | `/products?category=pre-rolls` hero + 卡片 parity，Mock 数据说明已写入 fixtures，待 Strapi 正式字段。 |
| Vapes | Done | 待提供（参考图待上传） | `/products?category=vapes` hero + 卡片 parity，缺少官方图像时使用 cms 远程图；待截图。 |
| How it works? | Done | 待提供（建议保存 how-it-works-hero.png） | `/how-it-works` Hero breadcrumb、Locker steps、FAQ、Payment CTA 已 parity；待抓移动端截图后补入 `docs/frontend-shots/2026-04-02/`。 |
| Contact | Done | 待提供（建议保存 contact-hero.png） | HeroClassic + channels + InPost Flow 已 parity；截图未存档，后续可抓移动端截屏入库。 |

| Products | Hero + imagery | ✅ 新 hero tabs + 1:1 方图 | /products 顶部 tabs 使用浅色卡片，卡片/详情图像改为 aspect-square object-contain。 | 2026-04-02 |
| Products | Hero simplified | ✅ Breadcrumb-only copy | /products 顶部仅保留 HOME / SHOP ALL / {category} 面包屑，tabs 直接跟随，其余提示容器已移除。 | 2026-04-02 |
| Footer removed | Layout cleanup | ✅ Locker collective footer removed per client request | Header now ends page; policy links to be revisited on /about as needed. | 2026-04-02 |
| Cereal Milk imagery | Product media | ✅ Kush Mintz photo set as Cereal Milk fallback | `/public/images/products/cereal-milk.jpg` + fixtures meta ensure consistent image sitewide. | 2026-04-02 |

| Product detail | Image zoom | ✅ Full-screen modal | /products/[slug] 主图支持 tap + CTA 打开全屏 lightbox，含拖拽/双击缩放与 ESC 关闭。 | 2026-04-02 |

| Product detail | Copy update | ✅ WHERE WE SHIP + CTA removed | 主描述替换为“WHERE WE SHIP” 段落并删除 View strain info 按钮。 | 2026-04-02 |

| Product detail | Weight cards parity | ✅ White card weight selector + Qty CTA | 4x weight tiers (3.5g / 7g / 14g / 28g) + MOST CHOSEN + quantity + CTA 1:1 with legacy shop. | 2026-04-02 |

| Locker ETA | Reference page | ⛔ Removed | Locker ETA sheet 页面与入口已撤回，等待新需求再重新设计。 | 2026-04-02 |
| Product detail contrast | Weight cards / CTA | ✅ Color palette updated for weight cards, badges, quantity, CTA per spec | purchase-panel.tsx now uses #0B0F0D text, #23A26D borders/badges, lighter steppers. | 2026-04-02 |
| Product detail color reset | Dark theme | ✅ Purchase panel back to black base with high-contrast text | purchase-panel.tsx uses #050708 bg, dark stepper, green CTA with border, white shipping copy. | 2026-04-02 |

| Product detail | Dark weight cards | ✅ Dark variant cards with 4 tiers | 3.5g/7g/14g/28g 黑色卡片 + 绿色选中边框，与夜间主题一致。 | 2026-04-02 |
