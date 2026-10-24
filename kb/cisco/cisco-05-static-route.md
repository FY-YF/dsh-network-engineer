---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: 静态路由
devices: Catalyst 三层交换机与 ISR 路由器
keywords: [ip route, 默认路由, 浮动静态, 管理距离, distance, Null0, 黑洞路由, show ip route, ip routing]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg/b_165_rtng_9300_cg_chapter_0101.html
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg.pdf
verified: high
updated: 2026-10-24
---

# 思科 · 静态路由

> 适用于三层交换机与路由器的静态路由、默认路由、浮动静态与黑洞路由。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 开启三层转发 | ip routing | 全局配置 | 三层交换机必须开启 |
| 默认路由 | ip route 0.0.0.0 0.0.0.0 192.168.1.1 | 全局配置 | 出口网关 |
| 明细静态 | ip route 10.1.0.0 255.255.0.0 192.168.1.2 | 全局配置 | 目的网段 + 掩码 + 下一跳 |
| 出接口写法 | ip route 10.1.0.0 255.255.0.0 GigabitEthernet1/0/24 | 全局配置 | 点到点链路可用 |
| 浮动静态 | ip route 0.0.0.0 0.0.0.0 192.168.1.2 250 | 全局配置 | 管理距离大于主路由，主路由失效才生效 |
| 黑洞路由 | ip route 10.99.0.0 255.255.0.0 Null0 | 全局配置 | 汇总防环，丢弃未匹配明细 |
| 删除路由 | no ip route 10.1.0.0 255.255.0.0 192.168.1.2 | 全局配置 | 必须整条匹配 |
| 查看路由表 | show ip route | 特权模式 | `S` 静态、`S*` 默认、`O` OSPF |
| 只看静态 | show ip route static | 特权模式 | 排障时快速过滤 |
| 查明细 | show ip route 10.1.0.0 | 特权模式 | 最长匹配命中的条目 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# ip routing
SW-CORE-01(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.1
SW-CORE-01(config)# ip route 10.1.0.0 255.255.0.0 192.168.1.2
SW-CORE-01(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.3 250
SW-CORE-01(config)# ip route 10.99.0.0 255.255.0.0 Null0
SW-CORE-01(config)# end
SW-CORE-01# show ip route
```

## 陷阱与版本差异

- 静态路由的默认管理距离是 1，浮动静态要显式给更大的值（如 250），否则两条同目的路由会互相覆盖。
- 只配出接口（不配下一跳）时，路由器会对每个目的地址做 ARP，产生大量 ARP 表项；点到点链路才建议这么写。
- 三层交换机如果忘了 `ip routing`，SVI 之间不通、路由表为空，现象像"路由没生效"。
- `no ip route` 必须完整匹配前缀、掩码与下一跳，少一个参数就删不掉。
- 汇总静态指向 Null0 是防环手段，但掩码写错会把正常流量也丢进黑洞。

## 高危操作 ⚠️

- 远程修改默认路由的下一跳写错，会立刻失去到管理网段的可达性。
- 用 `ip route 0.0.0.0 0.0.0.0 Null0` 做"断网测试"，等于主动黑洞全部未知流量。
- 在承载业务的设备上 `no ip routing`，所有跨网段转发立即停止。

## 参考来源

1. [路由配置指南（协议无关特性），Cisco IOS XE 16.5（Catalyst 9300，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg/b_165_rtng_9300_cg_chapter_0101.html)
2. [IP 路由配置指南，Cisco IOS XE 16.5（PDF，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg.pdf)
