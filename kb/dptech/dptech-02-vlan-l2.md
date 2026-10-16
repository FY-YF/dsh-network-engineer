---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: VLAN 与二层特性
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, VLAN, trunk, access, hybrid, port-security, 端口隔离, 端口安全]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://blog.csdn.net/huainingning/article/details/161947174
verified: medium
updated: 2026-10-15
---

# 迪普 · VLAN 与二层特性

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 批量创建 VLAN | `vlan 10 20` | 配置模式 `[DPTECH]` | 空格分隔一次创建多个（以官方手册/售后确认为准） |
| VLAN 视图添加端口 | `port gige0_1` | VLAN 视图 | 从 VLAN 侧把端口加入该 VLAN |
| 接口划入 Access | `switch access vlan 10` | 接口视图 | 也见 `switchport access vlan 10` 写法，两种并存以版本为准 |
| 配置 Trunk 模式 | `switchport mode trunk` | 接口视图 | 思科风格关键字，非华为 `port link-type trunk` |
| Trunk 放行 VLAN | `switchport trunk allowed vlan 10,20` | 接口视图 | 逗号分隔 VLAN 列表；是否覆盖式以手册为准 |
| 配置 Hybrid 模式 | 与 Trunk 同风格 | 接口视图 | 素材仅说明"同风格"，具体子命令以官方手册/售后确认为准 |
| 开启端口隔离 | `switchport protected` | 接口视图 | 隔离口之间二层互访被阻断 |
| 关闭端口隔离 | `no switchport protected` | 接口视图 | `no` 前缀取消，思科风格 |
| 端口安全静态绑定 | `switchport port-security mac-address <MAC> vlan <id>` | 接口视图 | MAC+VLAN 绑定 |
| 粘贴学习 MAC | `switchport port-security mac-address sticky` | 接口视图 | 动态学习转粘贴 |
| 限制最大 MAC 数 | `switchport port-security maximum <数>` | 接口视图 | 超限触发违规动作 |
| 配置违规动作 | `switchport port-security violation <动作>` | 接口视图 | 动作取值以官方手册/售后确认为准 |
| 查看端口安全 | `show port-security [interface]` | 用户/配置视图 | 可带接口参数过滤 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] vlan 10 20
[DPTECH-vlan10] port gige0_1
[DPTECH-vlan10] quit
[DPTECH] interface gige0_2
[DPTECH-gige0_2] switchport mode trunk
[DPTECH-gige0_2] switchport trunk allowed vlan 10,20
[DPTECH-gige0_2] quit
[DPTECH] interface gige0_3
[DPTECH-gige0_3] switch access vlan 10
[DPTECH-gige0_3] switchport port-security maximum 5
[DPTECH-gige0_3] switchport port-security mac-address sticky
[DPTECH-gige0_3] switchport port-security violation <动作>
```

## 陷阱与差异

- 迪普同时存在 `switch access vlan 10` 与 `switchport access vlan 10` 两种写法，属版本差异，落地前先核对现网配置风格保持一致。
- Trunk/Hybrid 用思科风格的 `switchport` 关键字，与华为的 `port link-type trunk` 完全不同。
- 取消配置用 `no` 前缀（思科风格），不是华为的 `undo`；其他命令的取消形式需对照手册。
- 端口隔离 `switchport protected` 类似思科 protected port，上行/级联互联口不要误配隔离。
- `switchport port-security violation` 的动作枚举值公开素材未列出（以官方手册/售后确认为准）。

## 高危操作 ⚠️

- `switchport port-security violation` 触发后可能丢弃流量或关闭端口，⚠️ 在上行/级联口误配端口安全会中断业务。
- 修改 Trunk 放行 VLAN 列表时，⚠️ 若该命令为覆盖式而非追加式，漏写现网 VLAN 会直接切断该 VLAN 全部流量，变更前确认语义。
- 配合 `interface range` 做批量端口变更会放大上述风险，⚠️ 必须在变更窗口内操作并逐口验证。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普设备配置公开实践资料（CSDN 博客）](https://blog.csdn.net/huainingning/article/details/161947174)
