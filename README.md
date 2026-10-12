# DappNav

面向 Sui 生态的响应式 DApp 导航。使用提供的 DappNav Logo，内置 NAVI、Suilend、Cetus 等 9 个项目。

纯 HTML / CSS / JavaScript，无运行时依赖、数据库或管理后台。全站项目内容来自 GitHub 中的 JSON 文件，部署后所有访客看到同一份目录。页面顶部仅展示 Logo、X 和 TG 链接，下面直接排列 DApp 卡片，支持手机、平板和桌面自适应。

## 在 GitHub 添加或修改项目

1. 打开 [data/dapps.json](data/dapps.json)，点击铅笔编辑。
2. 修改已有对象，或复制以下对象添加到数组中。相邻对象用逗号分隔，最后一个对象后不要加逗号。
3. 上传项目图标到 [public/logos](public/logos)，并填写对应路径。
4. 提交到 `main`，检查 Actions 中的校验结果。连接了自动部署的平台会重新发布；手动部署需要重新上传构建文件。

```json
{
  "id": "my-dapp",
  "name": "My DApp",
  "category": "tools",
  "description": "这里填写项目简介。",
  "url": "https://example.com/",
  "logo": "public/logos/my-dapp.png",
  "tags": ["工具", "Sui"],
  "featured": false,
  "order": 10,
  "addedAt": "2026-10-12"
}
```

| 字段 | 说明 |
| --- | --- |
| id | 唯一标识，只能包含小写字母、数字和连字符 |
| name | 项目名称，最多 80 字符 |
| description | 简介，最多 240 字符 |
| category | `lending` 借贷、`trading` 交易、`staking` 质押、`wallet` 钱包、`tools` 基础设施、`navigation` 导航 |
| url | 项目 HTTPS 地址，点击后在新标签页打开 |
| logo | `public/logos/文件名.png` 或 `public/文件名.png`，支持 PNG/JPG/SVG/WebP/ICO，也支持 HTTPS 图片地址 |
| tags | 最多 4 个标签，每个最多 20 字符 |
| featured | `true` 为编辑精选，展示动态渐变边框、光晕和精选徽标，默认排序靠前；`false` 为普通卡片 |
| order | 数字，越小越靠前（精选优先） |
| addedAt | 添加日期 `YYYY-MM-DD`，用于记录收录时间 |

删除项目时删除整个对象即可。添加新分类时，同时修改 [assets/catalog.mjs](assets/catalog.mjs) 中的 `categories`。

## 网站配置

编辑 [data/site.json](data/site.json) 修改 Telegram、X、网页标题名称及 SEO 简介。`logo` 指向 `public/` 下的图片，默认是 [public/logo.png](public/logo.png)。页面可见品牌和宣传文字在 [index.html](index.html) 中修改，配色和布局在 [assets/styles.css](assets/styles.css) 中修改。

- Telegram：https://t.me/Sui_Nav
- X：https://x.com/SuiSgGame
- 网站不展示 GitHub 链接，项目内容仍在本仓库统一维护。

## 本地运行与验证

需要 Node.js 22 或更高版本，无需 `npm install`。

```sh
npm run dev
# 浏览器打开 http://127.0.0.1:5174/
npm test
npm run build
```

构建会校验项目数据、社交链接和本地图标是否存在，然后将网站复制到 `dist/`。请通过 HTTP 服务器预览，直接双击 HTML 的 file:// 模式无法正常读取 JSON。

## 部署

- **Vercel**：导入本仓库，Framework 选 Other，Build Command 为 `npm run build`，Output Directory 为 `dist`；仓库已包含 `vercel.json`。无需环境变量。
- **GitHub Pages**：在仓库 Settings → Pages 中选择从分支部署，分支 `main`、目录 `/ (root)`。全部资源使用相对路径，兼容 `/Sui_Dapp_All/` 子目录。
- **其他静态服务器**：将 `dist/` 内全部文件上传到网站目录；保持 `data/` 的缓存可及时更新。

当前仓库的 Actions 只做测试、构建并保存静态产物，不会自动启用 GitHub Pages。JSON 修改需重新部署后才会反映到线上。

## 资源来源

DappNav Logo 由仓库所有者提供。各项目图标来自其官方站点 favicon / app icon，商标归各项目所有：
[NAVI](https://naviprotocol.io/)、[Suilend](https://suilend.fi/)、[Cetus](https://www.cetus.zone/)、[Scallop](https://app.scallop.io/)、[Aftermath](https://aftermath.finance/)、[Bluefin](https://bluefin.io/)、[SuiNS](https://suins.io/)、[Slush](https://slush.app/)、[SuiVision](https://suivision.xyz/)。

应用信息和链接均可在 JSON 中维护；导航本身不连接钱包、不发起交易、不依赖 Sui JSON-RPC。
