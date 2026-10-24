---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: OSPF
devices: Catalyst 三层交换机与 ISR 路由器
keywords: [OSPF, router ospf, network, area, router-id, passive-interface, default-information originate, show ip ospf neighbor, cost, reference-bandwidth]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9600/software/release/17-18/configuration_guide/rtng/b_1718_rtng_9600_cg/configuring_ospf.html
verified: high
updated: 2026-10-24
---

# 思科 · OSPF

> 适用于 IOS/IOS XE 的 OSPFv2 单区域与多区域基础配置、邻居与路由排查。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 启动进程 | router ospf 1 | 全局配置 | 进程号本地有效，两端可不同 |
| 设置 Router ID | router-id 1.1.1.1 | 路由进程 | 建议手工指定，避免选到 Loopback 以外地址 |
| 宣告网段 | network 10.0.0.0 0.0.0.255 area 0 | 路由进程 | 反掩码写法，不是子网掩码 |
| 被动接口 | passive-interface Vlan10 | 路由进程 | 只宣告不发 Hello，接主机的网段必配 |
| 下发默认路由 | default-information originate | 路由进程 | 本机需已有默认路由，或加 `always` |
| 调整接口开销 | ip ospf cost 10 | 接口配置 | 影响选路 |
| 参考带宽 | auto-cost reference-bandwidth 10000 | 路由进程 | 千兆以上链路需统一修改 |
| 查看邻居 | show ip ospf neighbor | 特权模式 | 状态应为 FULL / 2WAY |
| 查看接口 | show ip ospf interface brief | 特权模式 | 区域、开销、邻居数 |
| 查看 OSPF 路由 | show ip route ospf | 特权模式 | 标记为 `O` / `O IA` |
| 查看数据库 | show ip ospf database | 特权模式 | LSA 类型与链路状态 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# router ospf 1
SW-CORE-01(config-router)# router-id 1.1.1.1
SW-CORE-01(config-router)# network 10.0.0.0 0.0.0.255 area 0
SW-CORE-01(config-router)# network 192.168.10.0 0.0.0.255 area 0
SW-CORE-01(config-router)# passive-interface Vlan10
SW-CORE-01(config-router)# default-information originate
SW-CORE-01(config-router)# end
SW-CORE-01# show ip ospf neighbor
```

## 陷阱与版本差异

- `network` 后面是**反掩码**：`0.0.0.255` 对应 /24，写成 `255.255.255.0` 会宣告错误范围。
- 邻居卡在 `EXSTART` 多为 MTU 不一致；卡在 `INIT` 多为单向可达或 ACL 拦了组播 224.0.0.5。
- 两端 area 号不一致不会建立邻居，且不会有明显报错，只能靠 `show ip ospf interface` 核对。
- 忘记 `passive-interface` 会把 Hello 发到接主机的网段，既无意义又暴露拓扑。
- 千兆以上链路默认开销都是 1，不改参考带宽会导致选路失真。

## 高危操作 ⚠️

- 在承载业务的设备上 `no router ospf 1` 会瞬间清空 OSPF 路由，若没有静态兜底即断网。
- 修改 `router-id` 需要重启 OSPF 进程（`clear ip ospf process`）才生效，重启期间邻居全部重建。
- 大范围改 `network` 语句可能把管理网段也宣告出去，形成次优路径或环路。

## 参考来源

1. [OSPF 配置指南，Cisco IOS XE 17.18（Catalyst 9600，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9600/software/release/17-18/configuration_guide/rtng/b_1718_rtng_9600_cg/configuring_ospf.html)
