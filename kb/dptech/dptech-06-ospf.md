---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: OSPF 动态路由
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, OSPF, router-ospf, router-id, area, network宣告, clear-ospf]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://www.dptech.com
verified: medium
updated: 2026-10-15
---

# 迪普 · OSPF 动态路由

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 启动 OSPF 进程 | `router ospf 1` | 配置模式 `[DPTECH]` | 思科风格 `router ospf <进程号>`，非华为 `ospf 1` |
| 配置 Router ID | `router-id 1.2.3.4` | OSPF 进程视图 | 建议手工规划，全网唯一 |
| 宣告网段 | `network 1.1.1.1/24 area 0` | OSPF 进程视图 | 迪普用前缀长度（/24），不是华为/思科的反掩码，一条命令同时完成宣告与指定区域 |
| 重启 OSPF 进程 | `clear ospf 1` ⚠️ | 视图未核实（以官方手册/售后确认为准） | 重启进程，邻居全部重建 |
| 查看 OSPF 状态 | 公开素材未给出具体命令 | — | show ospf 系列的准确形式以官方手册/售后确认为准 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] router ospf 1
[DPTECH-ospf-1] router-id 1.2.3.4
[DPTECH-ospf-1] network 1.1.1.1/24 area 0
[DPTECH-ospf-1] network 10.1.1.0/24 area 0
```

## 陷阱与差异

- `network` 宣告使用前缀长度（如 `1.1.1.1/24`）后直接跟 `area 0`，与华为（点分掩码）和思科（反掩码 + `network ... area ...`）均不同，迁移配置时必须改写。
- 进程启动命令为 `router ospf <进程号>`（思科风格），不是华为全局下的 `ospf <进程号>`。
- OSPF 进程视图提示符（示例中 `[DPTECH-ospf-1]`）仅为示意，准确格式以实际输出为准。
- 查看/调试类命令（邻居、LSDB、路由引入等）公开素材未覆盖（以官方手册/售后确认，迪普公开资料有限）。
- 修改 `router-id` 是否需要重启进程生效、以及引入/开销等高级参数均未核实，需对照官方手册。

## 高危操作 ⚠️

- `clear ospf 1` 会重启 OSPF 进程，⚠️ 邻居关系全部重建、路由短暂震荡，业务可能闪断，禁止在业务高峰执行。
- `router-id` 冲突会导致路由计算异常，⚠️ 修改 router-id 前确认全网无冲突，并评估重启进程的影响。
- 宣告了不该宣告的网段会把错误路由扩散到全网，⚠️ 上线前核对 network 列表与区域规划。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普科技官网（产品与资料入口）](https://www.dptech.com)
