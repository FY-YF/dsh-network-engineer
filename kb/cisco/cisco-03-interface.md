---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: 接口配置
devices: Catalyst 交换机与 ISR 路由器
keywords: [interface, description, speed, duplex, no shutdown, shutdown, SVI, interface Vlan, ip address, show ip interface brief, show interfaces status]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9600/software/release/17-13/configuration_guide/int_hw/b_1713_int_and_hw_9600_cg.pdf
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg.pdf
verified: high
updated: 2026-10-24
---

# 思科 · 接口配置

> 适用于 Catalyst 交换机的物理口、SVI（VLAN 接口）与路由器三层口的地址、速率双工和状态管理。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 进入接口 | interface GigabitEthernet1/0/1 | 全局配置 | 简写 `int gi1/0/1` |
| 批量进入 | interface range GigabitEthernet1/0/1-8 | 全局配置 | 支持 `-` 范围与 `,` 列表 |
| 接口描述 | description UPLINK-TO-CORE | 接口配置 | 上联、对端信息写在这里 |
| 启用接口 | no shutdown | 接口配置 | 新接口默认 `administratively down` |
| 关闭接口 | shutdown | 接口配置 | 变更前先关，改完再开 |
| 强制速率 | speed 1000 | 接口配置 | `auto` 为默认，光口一般不协商 |
| 强制双工 | duplex full | 接口配置 | 速率双工两端不一致会报错包 |
| 三层口 | no switchport → ip address 10.1.1.1 255.255.255.0 | 接口配置 | 仅三层交换机支持 |
| 配置 SVI | interface Vlan10 → ip address 192.168.10.1 255.255.255.0 | 全局配置 | 交换机管理地址或网关 |
| 管理网关 | ip default-gateway 192.168.1.1 | 全局配置 | 仅二层机型使用 |
| 查看接口状态 | show ip interface brief | 特权模式 | `up/up`、IP、方法 |
| 查看速率双工 | show interfaces status | 特权模式 | 端口 VLAN、双工、速率 |
| 查看详细计数 | show interfaces GigabitEthernet1/0/1 | 特权模式 | 错误包、CRC、丢弃计数 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# interface GigabitEthernet1/0/24
SW-CORE-01(config-if)# description UPLINK-TO-CORE
SW-CORE-01(config-if)# switchport mode trunk
SW-CORE-01(config-if)# no shutdown
SW-CORE-01(config-if)# exit
SW-CORE-01(config)# interface Vlan10
SW-CORE-01(config-if)# description OFFICE-GATEWAY
SW-CORE-01(config-if)# ip address 192.168.10.1 255.255.255.0
SW-CORE-01(config-if)# no shutdown
SW-CORE-01(config-if)# end
SW-CORE-01# show ip interface brief
```

## 陷阱与版本差异

- SVI 要 `up` 需要两个条件：VLAN 已创建，且至少有一个处于转发状态的端口属于该 VLAN；只建 VLAN 不接端口，SVI 会一直是 `down`。
- 二层机型（如 2960）不能给物理口配 IP，只能用 `interface Vlan1` 做管理；三层机型则必须先 `no switchport`。
- 光口 `speed`/`duplex` 强制后若对端不匹配，端口会进入 err-disabled，需要 `shutdown`/`no shutdown` 或 `errdisable recovery` 恢复。
- `interface range` 里的成员必须都已存在且同类型，否则命令整条被拒绝。
- 部分 IOS XE 版本 `show interfaces status` 输出列宽不同，脚本解析建议用 `show ip interface brief`。

## 高危操作 ⚠️

- 远程管理口上执行 `shutdown` 会立即断连，且无法远程恢复。
- 修改上联口速率双工前未确认对端，可能导致整段链路 err-disable。
- 在承载业务的 SVI 上直接改掩码或地址，会瞬断该网段所有主机。

## 参考来源

1. [接口与硬件配置指南，Cisco IOS XE 17.13（Catalyst 9600，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9600/software/release/17-13/configuration_guide/int_hw/b_1713_int_and_hw_9600_cg.pdf)
2. [IP 路由配置指南，Cisco IOS XE 16.5（Catalyst 9300，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/16-5/configuration_guide/rtng/b_165_rtng_9300_cg.pdf)
