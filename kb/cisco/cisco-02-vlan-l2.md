---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: VLAN 与二层交换
devices: Catalyst 2960/3560/9300 等交换机
keywords: [VLAN, vlan, switchport mode access, switchport access vlan, trunk, allowed vlan, native vlan, show vlan brief, show interfaces trunk, mac address-table, STP]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-15/configuration_guide/vlan/b_1715_vlan_9300_cg/configuring_vlans.html
verified: high
updated: 2026-10-24
---

# 思科 · VLAN 与二层交换

> 适用于 Catalyst 交换机的 VLAN 划分、Access/Trunk 端口配置与二层状态查看。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 创建 VLAN | vlan 10 | 全局配置 | 进入 VLAN 配置模式，可加 `name OFFICE` |
| 批量创建 | vlan 10,20,30 | 全局配置 | 逗号分隔，也支持 `vlan 10-20` 范围 |
| 删除 VLAN | no vlan 10 | 全局配置 | 端口会自动落回 VLAN 1 |
| Access 端口 | switchport mode access → switchport access vlan 10 | 接口配置 | 接 PC/服务器 |
| Trunk 端口 | switchport mode trunk → switchport trunk allowed vlan 10,20 | 接口配置 | 互联口放行多 VLAN |
| 追加放行 VLAN | switchport trunk allowed vlan add 30 | 接口配置 | 不加 add 会整条覆盖 |
| 移除放行 VLAN | switchport trunk allowed vlan remove 30 | 接口配置 | 按需剔除 |
| 设置 Native VLAN | switchport trunk native vlan 99 | 接口配置 | 两端必须一致，否则 CDP 报错 |
| 关闭 DTP 协商 | switchport nonegotiate | 接口配置 | 生产环境建议显式指定模式 |
| 查看 VLAN | show vlan brief | 特权模式 | VLAN 列表与端口归属 |
| 查看 Trunk | show interfaces trunk | 特权模式 | 放行列表、Native VLAN、封装 |
| 查看 MAC 表 | show mac address-table | 特权模式 | 可加 `vlan 10` 过滤 |
| 查看 STP | show spanning-tree vlan 10 | 特权模式 | 根桥、端口角色与状态 |

## 典型示例

```
SW-ACCESS-01# configure terminal
SW-ACCESS-01(config)# vlan 10
SW-ACCESS-01(config-vlan)# name OFFICE
SW-ACCESS-01(config-vlan)# vlan 20
SW-ACCESS-01(config-vlan)# name GUEST
SW-ACCESS-01(config-vlan)# exit
SW-ACCESS-01(config)# interface GigabitEthernet1/0/1
SW-ACCESS-01(config-if)# switchport mode access
SW-ACCESS-01(config-if)# switchport access vlan 10
SW-ACCESS-01(config-if)# exit
SW-ACCESS-01(config)# interface GigabitEthernet1/0/24
SW-ACCESS-01(config-if)# switchport mode trunk
SW-ACCESS-01(config-if)# switchport trunk allowed vlan 10,20
SW-ACCESS-01(config-if)# switchport trunk native vlan 99
SW-ACCESS-01(config-if)# end
SW-ACCESS-01# show interfaces trunk
```

## 陷阱与版本差异

- ⚠️ `switchport trunk allowed vlan 10,20` 是**整条覆盖**：已有 10、20 时再敲 `... allowed vlan 30`，结果只剩 30，链路立刻少放行两个 VLAN。追加必须用 `add`。
- 思科端口默认是 `dynamic auto`（DTP 协商），对端不回 DTP 时会停在非转发状态；对接华为/新华三 Trunk 前先 `switchport mode trunk` 并 `switchport nonegotiate`。
- 部分低端机型（如 2960 非 Plus 版）只支持 802.1Q，不需要 `switchport trunk encapsulation dot1q`；3560/3750 等旧款则必须先敲这句才能设 trunk。
- Native VLAN 两端不一致时，STP 会报 `%CDP-4-NATIVE_VLAN_MISMATCH`，且该 VLAN 流量可能串到错误广播域。
- 删 VLAN 前先确认没有 SVI 或端口引用，否则接口会进入 down 状态。

## 高危操作 ⚠️

- 远端在管理 VLAN 的 Trunk 上执行 `switchport trunk allowed vlan` 覆盖式修改，会立刻失去管理通道。
- `no vlan 10` 会让该 VLAN 的所有端口落回 VLAN 1，等于把隔离拆掉。
- `switchport trunk native vlan` 改动不同步对端，会造成流量黑洞与环路告警。

## 参考来源

1. [VLAN 配置指南，Cisco IOS XE 17.15（Catalyst 9300，cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-15/configuration_guide/vlan/b_1715_vlan_9300_cg/configuring_vlans.html)
