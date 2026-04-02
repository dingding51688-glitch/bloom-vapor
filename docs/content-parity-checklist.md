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
| Product detail | Hero / weight picker / curated picks | ✅ 顶部大图+评分/价格 / 新 weight picker + 数量步进器 / “Curated picks” 列表 | `/products/[slug]` hero 使用 coverImage + fallback，`purchase-panel` 复刻重量卡片与 Locker ETA 链接，底部 related products 用 `ProductCard`。 | 2026-04-02 |
| Product detail | Strapi fallback | ✅ serverFetch 失败时使用 fixtures/productListingFallbacks + meta | `getProduct` / `getRelatedProducts` 包装 try/catch 并回退 mock 数据（含 coverImage、rating、origin）；doc 记录 fallback 图源。 | 2026-04-02 |
| Register | Form + Strapi register | ✅ /register 使用 RHF + zod + /api/auth/register proxy 完成注册并存储 JWT | React Hook Form 验证邮件/密码/Telegram/phone，成功后显示 CTA；API 代理读取 `NEXT_PUBLIC_AUTH_BASE_URL`，`AuthProvider` 持久化 token/email。 | 2026-04-02 |
| Admin | Product upload (`/admin/products/*`) | ✅ 新建/编辑 UI 与需求一致，集成 Strapi create/update + upload | `ProductEditor` + `lib/admin-api.ts`；参见 `docs/admin-product.md` 运行说明（JWT 共用、Save draft=publish 提示）。 | 2026-04-02 |

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
