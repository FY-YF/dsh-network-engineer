---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: 系统管理与视图
devices: Catalyst 2960/3560/9300 等交换机、ISR 路由器
keywords: [enable, configure terminal, hostname, enable secret, banner, copy running-config startup-config, write memory, reload, show running-config, show version, clock, no ip domain-lookup, logging]
sources:
  - https://www.cisco.com/en/US/docs/switches/lan/catalyst3850/software/release/3.2_0_se/multibook/configuration_guide/b_consolidated_config_guide_3850_chapter_011.html
  - https://www.cisco.com/c/en/us/td/docs/switches/campus-lan-switches-access/Catalyst-1200-and-1300-Switches/Administration-Guide/catalyst-1200-admin-guide/administration.html
verified: high
updated: 2026-10-24
---

# 思科 · 系统管理与视图

> 适用于 Catalyst 交换机的 IOS/IOS XE 命令行：视图切换、基础参数、配置保存与回滚、时间与日志。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 进入特权模式 | enable | 用户模式 `>` | 提示符 `>` 变 `#` |
| 进入全局配置 | configure terminal | 特权模式 | 简写 `conf t`，提示符变 `(config)#` |
| 设置主机名 | hostname SW-CORE-01 | 全局配置 | 立即生效，提示符同步变化 |
| 设置特权密码 | enable secret Cisco@123 | 全局配置 | 密文存储，优先级高于 `enable password` |
| 设置标语 | banner motd #Authorized access only# | 全局配置 | 分隔符不能出现在正文中 |
| 关闭域名解析等待 | no ip domain-lookup | 全局配置 | 敲错命令时不再卡住解析 |
| 保存配置 | copy running-config startup-config | 特权模式 | 简写 `copy run start`；`write memory` 等价 |
| 查看当前配置 | show running-config | 特权模式 | `show run`，可加 `interface` 过滤 |
| 查看版本与型号 | show version | 特权模式 | 序列号、IOS 版本、启动镜像 |
| 重启设备 | reload | 特权模式 | 会中断业务，先保存 |
| 设置时钟 | clock set 10:00:00 24 Oct 2026 | 特权模式 | 或配置 NTP |
| 查看日志 | show logging | 特权模式 | 含缓冲日志与日志主机配置 |
| 关闭分页 | terminal length 0 | 特权模式 | 一次性会话有效，便于抓全量输出 |

## 典型示例

```
Switch> enable
Switch# configure terminal
Switch(config)# hostname SW-ACCESS-01
SW-ACCESS-01(config)# enable secret Cisco@123
SW-ACCESS-01(config)# banner motd #Authorized access only#
SW-ACCESS-01(config)# no ip domain-lookup
SW-ACCESS-01(config)# interface Vlan1
SW-ACCESS-01(config-if)# ip address 192.168.1.10 255.255.255.0
SW-ACCESS-01(config-if)# no shutdown
SW-ACCESS-01(config-if)# exit
SW-ACCESS-01(config)# ip default-gateway 192.168.1.1
SW-ACCESS-01(config)# exit
SW-ACCESS-01# copy running-config startup-config
```

## 陷阱与版本差异

- ⚠️ `enable secret` 与 `enable password` 同时存在时只有 secret 生效；secret 一旦遗忘只能走密码恢复流程（需重启并中断引导）。
- 只改了 running-config 没保存，重启即丢失；`write memory` 在部分新版本被标记为旧写法，`copy run start` 更通用。
- 新设备首次登录会进入 `--More--` 分页，脚本抓取前先 `terminal length 0`。
- Catalyst 2960 等二层机型没有 `ip routing`，`ip default-gateway` 才是管理网关；三层机型相反。
- 部分 IOS XE 版本 `show running-config` 输出带 `!` 分组注释，解析脚本需忽略注释行。

## 高危操作 ⚠️

- `reload` 与 `erase startup-config` 会清空配置或重启设备，远程执行前必须确认有人能到现场。
- `no enable secret` 会让特权模式失去密码保护。
- `banner` 分隔符选择不当会吞掉后续命令，导致配置被截断。

## 参考来源

1. [Catalyst 3850 系统管理配置指南（cisco.com）](https://www.cisco.com/en/US/docs/switches/lan/catalyst3850/software/release/3.2_0_se/multibook/configuration_guide/b_consolidated_config_guide_3850_chapter_011.html)
2. [Catalyst 1200 管理指南（cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/campus-lan-switches-access/Catalyst-1200-and-1300-Switches/Administration-Guide/catalyst-1200-admin-guide/administration.html)
