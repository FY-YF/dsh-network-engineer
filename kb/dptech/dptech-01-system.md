---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: 系统管理与模式切换
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, conf-mode, hostname, lldp, snmp-agent, 用户视图, 配置模式, 系统管理]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://www.dptech.com
verified: medium
updated: 2026-10-15
---

# 迪普 · 系统管理与模式切换

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 识别用户视图 | 提示符 `<DPTECH>` | 用户视图 | 登录后默认视图，主要执行查看类命令 |
| 进入配置模式 | `conf-mode`（可缩写 `con`） | 用户视图 | 等价于华为 `system-view`，进入后提示符变为 `[DPTECH]` |
| 设备命名 | `hostname 1F-SW` | 配置模式 `[DPTECH]` | 关键字同思科 `hostname`，与华为 `sysname` 不同 |
| 全局启用 LLDP | `lldp enable` | 配置模式 `[DPTECH]` | LLDP 必须全局与接口同时启用才生效 |
| 接口启用 LLDP | `lldp enable` | 接口视图 | 与全局 `lldp enable` 配套，缺一不可 |
| 配置 SNMP 版本 | `snmp-agent version 2c` | 配置模式 `[DPTECH]` | 对接网管平台的基础配置 |
| 配置 SNMP 团体名 | `snmp-agent community <字符串>` | 配置模式 `[DPTECH]` | 团体名即凭据，避免 public/private 等弱口令 |
| 返回上级视图 | `quit` | 各视图 | 公开素材未逐一核实，以官方手册确认为准 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] hostname 1F-SW
[DPTECH] lldp enable
[DPTECH] interface gige0_1
[DPTECH-gige0_1] lldp enable
[DPTECH-gige0_1] quit
[DPTECH] snmp-agent version 2c
[DPTECH] snmp-agent community Dptech@Ro2024
```

## 陷阱与差异

- 进入配置模式的命令是 `conf-mode`（缩写 `con`），不是华为的 `system-view`，也不是思科的 `configure terminal`。
- 设备命名用 `hostname`（同思科），不是华为的 `sysname`。
- LLDP 需要全局与接口同时配置，只配一处不生效，这是排障时最容易漏掉的点。
- 子视图提示符（如 `[DPTECH-gige0_1]`）的准确格式公开素材未完整给出，以实际型号输出为准。
- SNMP 命令族与华为 `snmp-agent` 风格相似，但 v3 认证/加密等参数未在公开素材中出现（以官方手册/售后确认，迪普公开资料有限）。

## 高危操作 ⚠️

- 配置保存/回滚/恢复出厂：迪普公开资料未核实到统一命令，⚠️ 是否保存决定重启后配置是否保留，恢复出厂会清除全部业务配置，操作前务必以官方手册/售后确认（迪普公开资料有限）。
- 设备重启属高危操作，⚠️ 中断全部业务，执行前确认维护窗口、确认配置已保存，具体命令与确认机制以官方手册为准。
- 修改 SNMP 团体名前先与网管侧同步，⚠️ 弱团体名会导致设备信息泄露，错改会造成网管采集中断。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普科技官网（产品与资料入口）](https://www.dptech.com)
