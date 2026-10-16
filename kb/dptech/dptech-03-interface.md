---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: 接口配置（物理口/VLANIF/IPv6）
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, interface, gige, tengige, vlanif, 接口配置, IPv6, 掩码, secondary]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://blog.csdn.net/huainingning/article/details/161947174
verified: medium
updated: 2026-10-15
---

# 迪普 · 接口配置（物理口/VLANIF/IPv6）

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 进入千兆接口 | `interface gige0_1` | 配置模式 `[DPTECH]` | 编号用下划线 `gige0_1`，是迪普特色写法 |
| 进入万兆接口 | `interface tengige0_23` | 配置模式 `[DPTECH]` | 同样带下划线编号 |
| 批量进入接口 | `interface range gige0_1-XX` | 配置模式 `[DPTECH]` | 范围用连字符，批量配置注意波及面 |
| 创建三层 VLAN 接口 | `interface vlanif 10` | 配置模式 `[DPTECH]` | 也见 `interface vlan-if2` 写法，两种并存以型号/版本为准 |
| 配置 IPv4 地址 | `ip address 192.168.1.1/24` | VLANIF/三层接口视图 | 迪普常用斜线掩码（/24）写法 |
| 点分掩码写法 | `ip address <ip> <点分掩码>` | VLANIF/三层接口视图 | 公开资料中也见点分掩码写法（以官方手册/售后确认，迪普公开资料有限） |
| 配置从地址 | `ip address x.x.x.x/24 secondary` | VLANIF/三层接口视图 | 一个接口挂多个网段时使用 |
| 配置 IPv6 地址 | `ipv6 address 2411:8104:8:400::1:1/112` | 接口视图 | IPv6 同样用前缀长度写法 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] interface gige0_1
[DPTECH-gige0_1] ip address 192.168.1.1/24
[DPTECH-gige0_1] quit
[DPTECH] interface vlanif 10
[DPTECH-vlanif10] ip address 10.1.10.1/24
[DPTECH-vlanif10] ip address 10.1.10.254/24 secondary
[DPTECH-vlanif10] quit
[DPTECH] interface tengige0_23
[DPTECH-tengige0_23] ipv6 address 2411:8104:8:400::1:1/112
```

## 陷阱与差异

- 接口编号带下划线（`gige0_1`、`tengige0_23`），对应华为的 `GigabitEthernet0/0/1`、思科的 `Gi0/1`，RAG 检索与脚本改配时务必按迪普写法匹配。
- 三层 VLANIF 两种写法并存：`interface vlanif 10` 与 `interface vlan-if2`，不同型号/版本不同（以官方手册/售后确认为准）。
- IP 掩码以斜线写法 `/24` 为主，公开资料中也见点分掩码，二者并存时以设备版本为准。
- 从地址用 `secondary` 关键字（思科风格），华为为 `sub` 关键字。
- 子视图提示符（`[DPTECH-gige0_1]` 等）的准确格式以实际输出为准，示例中的提示符仅为示意。

## 高危操作 ⚠️

- 修改现网三层接口 IP 地址会瞬断该网段业务，⚠️ 远程改配时优先确认仍存在可达的其他管理路径，防止自锁。
- `interface range` 批量改配波及多个端口，⚠️ 一条错误命令会同时作用于整段接口，务必先核对范围再下发。
- 删除/覆盖 VLANIF 地址会中断该 VLAN 的网关功能，⚠️ 变更前记录原配置并准备回退方案。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普设备配置公开实践资料（CSDN 博客）](https://blog.csdn.net/huainingning/article/details/161947174)
