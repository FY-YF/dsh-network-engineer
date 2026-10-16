---
name: network-command-kb
description: 四厂商交换机/路由器命令知识库（迪普/新华三/华为/锐捷，32 篇）。回答配置命令、跨厂商语法对照、排障分析前必须先检索本知识库；也用于核对命令语法、默认值与版本差异。
---

# 网络命令知识库使用说明

本技能基础目录下的 `kb/` 子目录是随 `dsh-network-engineer` 插件分发的 32 篇命令知识库，每篇文档头部 frontmatter 含 vendor/os/topic/devices/keywords/sources/verified/updated 元数据。

## 目录结构

- `kb/huawei/`（华为 VRP）、`kb/h3c/`（新华三 Comware）、`kb/ruijie/`（锐捷 RGOS）、`kb/dptech/`（迪普自有 CLI）
- 文件名：`<厂商>-<两位序号>-<主题>.md`；主题序号：01 系统管理、02 VLAN 与二层、03 接口、04 链路聚合、05 静态路由、06 OSPF、07 ACL、08 远程管理与诊断
- `kb/README.md` 为总览、来源说明与 RAG 导入指南

## 检索方法（用 read/glob/grep 工具）

1. 按「厂商 + 主题」定位文件，例如查华为 OSPF 读 `kb/huawei/huawei-06-ospf.md`。
2. 跨厂商对照问题同时读多家同名主题文档（如四家的 `*-05-static-route.md`）。
3. 序号主题之外的细节用 grep 按命令关键字跨目录检索（如 grep "port trunk" kb/）。

## 使用规则

- 回答注明来源篇目；frontmatter `sources` 是整理依据，`verified: high` 表示有官方手册来源佐证，`medium` 表示公开实践资料整理。
- `verified: medium` 的篇目（全部 dptech/）只作方向参考，必须提示用户以官方手册或厂商售后确认为准。
- 知识库未覆盖的主题再联网检索官方文档；任何情况下不编造命令、参数与默认值。
- 文档内标注 ⚠️ 的高危命令（reboot/format/erase/恢复出厂等）在回答中出现时必须附带风险提示。
