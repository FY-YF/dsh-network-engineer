---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: 链路聚合
devices: Catalyst 交换机
keywords: [EtherChannel, channel-group, port-channel, LACP, active, passive, PAgP, show etherchannel summary, load-balance]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/etherchannels.html
verified: high
updated: 2026-10-24
---

# 思科 · 链路聚合

> 适用于 Catalyst 交换机的 EtherChannel（手工 / LACP / PAgP）配置与状态排查。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 加入聚合组（LACP） | channel-group 1 mode active | 接口配置 | active 主动发起协商，passive 被动应答 |
| 加入聚合组（PAgP） | channel-group 1 mode desirable | 接口配置 | 思科私有，对接他厂商不要用 |
| 手工聚合 | channel-group 1 mode on | 接口配置 | 不协商，两端必须同时配 |
| 配置聚合口 | interface Port-channel1 | 全局配置 | 业务配置写在这里，不写在成员口 |
| 聚合口 Trunk | switchport mode trunk → switchport trunk allowed vlan 10,20 | 接口配置 | 成员口会继承 |
| 查看汇总 | show etherchannel summary | 特权模式 | `SU` 表示已聚合且可用 |
| 查看 LACP 邻居 | show lacp neighbor | 特权模式 | 对端系统 ID、端口号 |
| 查看负载分担 | show etherchannel load-balance | 特权模式 | 默认 src-dst-ip（因平台而异） |
| 设置负载分担 | port-channel load-balance src-dst-ip | 全局配置 | 按业务流量模型选择 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# interface range GigabitEthernet1/0/1-2
SW-CORE-01(config-if-range)# switchport mode trunk
SW-CORE-01(config-if-range)# switchport trunk allowed vlan 10,20
SW-CORE-01(config-if-range)# channel-group 1 mode active
SW-CORE-01(config-if-range)# exit
SW-CORE-01(config)# interface Port-channel1
SW-CORE-01(config-if)# description LACP-TO-CORE
SW-CORE-01(config-if)# switchport mode trunk
SW-CORE-01(config-if)# switchport trunk allowed vlan 10,20
SW-CORE-01(config-if)# end
SW-CORE-01# show etherchannel summary
```

## 陷阱与版本差异

- 成员口的速率、双工、VLAN 模式必须一致，否则聚合口会进入 `suspended`，`show etherchannel summary` 显示 `s`。
- 端口在加入 channel-group 前应保持默认配置；已有 `switchport access vlan` 等差异配置的端口直接加入，往往协商失败。
- 对接华为 / 新华三 / 锐捷时用 LACP（`active`），不要用 PAgP；对端需配置对应的 Eth-Trunk / Bridge-Aggregation / AggregatePort。
- 三层聚合口需在 Port-channel 上 `no switchport` 后配 IP，成员口不要配地址。
- 部分平台更换成员口后需要重新协商，业务会有秒级中断。

## 高危操作 ⚠️

- 在已承载业务的聚合口上删除成员，可能瞬间超带宽并触发 STP 收敛。
- `no interface Port-channel1` 会连带删除成员口的聚合配置，业务中断。
- 两端 LACP 模式一边 active 一边 on，会导致端口被挂起且不报错，排查时容易误判为物理故障。

## 参考来源

1. [EtherChannel 配置指南，Cisco IOS XE 17（cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/lyr2-fwd/etherchannel/etherchannel-configuration-guide/etherchannels.html)
