# 网络工程师知识库（随 dsh-network-engineer 插件分发）

供「网络工程师助手」Agent 及各类 RAG 平台使用的四厂商交换机/路由器命令知识库。资料来源：Tavily 搜集的官方手册与高可信技术社区页面（每篇文档末尾附来源链接），整理日期 2026-10-15。

## 目录结构

```
kb/
├── huawei/    华为（VRP）
├── h3c/       新华三（Comware V5/V7）
├── ruijie/    锐捷（RGOS，Cisco 风格）
├── dptech/    迪普（DPtech 自有 CLI）
└── README.md
```

每厂商 8 篇，按主题编号：

| 编号 | 文件后缀 | 主题 |
|---|---|---|
| 01 | -system | 系统管理与视图（视图切换、保存/回滚、AAA、NTP） |
| 02 | -vlan-l2 | VLAN 与二层（Access/Trunk/Hybrid、MAC 表、STP） |
| 03 | -interface | 接口配置（IP、速率双工、VLANIF/SVI） |
| 04 | -link-aggregation | 链路聚合（手工/LACP） |
| 05 | -static-route | 静态路由（默认路由、浮动静态、黑洞） |
| 06 | -ospf | OSPF |
| 07 | -acl | ACL（与 NAT，视厂商） |
| 08 | -remote-diagnostics | 远程管理与诊断（Telnet/SSH、show/display 排障） |

完整文件名格式：`<厂商>-<编号>-<主题>.md`，如 `kb/huawei/huawei-06-ospf.md`。

## 文档格式

每篇文档含 YAML frontmatter，供 RAG 检索与元数据过滤：

| 字段 | 说明 |
|---|---|
| `vendor` / `os` | 厂商与操作系统，检索时可做过滤条件 |
| `topic` / `devices` | 主题与适用设备系列 |
| `keywords` | 检索关键词（中文为主，含易混词） |
| `sources` | 整理时的参考来源 URL |
| `verified` | `high` = 有官方手册来源佐证；`medium` = 公开实践资料整理（迪普各篇均为 medium） |
| `updated` | 最后整理日期 |

正文结构：命令速查表（功能/命令/视图/说明）→ 典型示例 → 陷阱与版本差异 → 高危操作 ⚠️ → 参考来源。

## 导入 RAG 平台

- **通用**：直接导入 Markdown；建议按标题（`##`）分块，chunk 长度 500–1000 字，保留来源链接与 frontmatter 元数据。
- **Dify**：知识库 → 导入 Markdown，分段标识符选 `##`，检索时可用 metadata 过滤 `vendor`。
- **Coze / 扣子**：知识库 → 上传文档（.md）；表格内容建议保留原表格，检索命中率更好。
- **RAGFlow**：支持 Markdown 解析，开启表格解析与标题分块。
- **无文件检索能力的平台**：将本目录整体上传为知识附件，或在系统提示词中声明"优先引用知识库文档内容"。

## 检索与使用建议

1. Agent 回答前先按「厂商 + 主题」定位文件，再按关键词跨文件检索。
2. 跨厂商对照类问题，同时召回 2–4 篇同名主题文档（如四家的 `*-05-static-route.md`）。
3. `verified: medium` 的文档（尤其 dptech/）仅作参考方向，关键配置务必引导用户以官方手册为准。

## 已知限制与更新

- 迪普公开资料有限，dptech/ 各篇不确定处均标注「以官方手册/售后确认」。
- 各厂商不同型号/版本存在命令差异，文档已标注主要版本差异点，但无法覆盖全部型号。
- 新增主题：按 `<厂商>-<两位序号>-<主题>.md` 命名并在本 README 补充索引；更新用 Tavily 重新搜集后修订对应文档并更新 `updated` 字段。
