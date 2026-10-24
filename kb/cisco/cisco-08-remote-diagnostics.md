---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: 远程管理与诊断
devices: Catalyst 交换机与 ISR 路由器
keywords: [SSH, Telnet, line vty, transport input, crypto key generate rsa, username, login local, show ip ssh, show version, show interfaces, debug, traceroute]
sources:
  - https://www.cisco.com/c/en/us/support/docs/security-vpn/secure-shell-ssh/4145-ssh.html
  - https://www.cisco.com/c/en/us/td/docs/switches/campus-lan-switches-access/Catalyst-1200-and-1300-Switches/Administration-Guide/catalyst-1200-admin-guide/administration.html
verified: high
updated: 2026-10-24
---

# 思科 · 远程管理与诊断

> 适用于 IOS/IOS XE 的 SSH/Telnet 登录配置，以及版本、接口、日志、抓包类排障命令。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 设置域名 | ip domain-name lab.local | 全局配置 | 生成 RSA 密钥的前置条件 |
| 创建本地用户 | username admin privilege 15 secret Cisco@123 | 全局配置 | privilege 15 为最高权限 |
| 生成 RSA 密钥 | crypto key generate rsa modulus 2048 | 全局配置 | 至少 768 位，建议 2048 |
| 指定 SSH 版本 | ip ssh version 2 | 全局配置 | 只允许 v2，禁用 v1 |
| 配置 VTY | line vty 0 4 | 全局配置 | 允许 5 个并发会话 |
| 仅允许 SSH | transport input ssh | line 配置 | 同时禁止 Telnet |
| 本地认证 | login local | line 配置 | 使用 username 本地库 |
| 空闲超时 | exec-timeout 10 0 | line 配置 | 10 分钟无操作自动断开 |
| 查看 SSH 状态 | show ip ssh | 特权模式 | 版本、超时、认证重试次数 |
| 查看在线会话 | show users | 特权模式 | 谁在登录、从哪个地址 |
| 查看版本 | show version | 特权模式 | 型号、IOS 版本、运行时间、重启原因 |
| 查看接口 | show interfaces | 特权模式 | 错误包、CRC、双工状态 |
| 查看日志 | show logging | 特权模式 | 缓冲日志与日志主机 |
| 路由跟踪 | traceroute 10.1.1.1 | 特权模式 | 逐跳定位断点 |
| 清计数器 | clear counters | 特权模式 | 重新统计错误包 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# ip domain-name lab.local
SW-CORE-01(config)# username admin privilege 15 secret Cisco@123
SW-CORE-01(config)# crypto key generate rsa modulus 2048
SW-CORE-01(config)# ip ssh version 2
SW-CORE-01(config)# line vty 0 4
SW-CORE-01(config-line)# transport input ssh
SW-CORE-01(config-line)# login local
SW-CORE-01(config-line)# exec-timeout 10 0
SW-CORE-01(config-line)# end
SW-CORE-01# show ip ssh
```

## 陷阱与版本差异

- 生成 RSA 密钥前必须先有 `hostname` 和 `ip domain-name`，否则命令直接报错。
- `transport input ssh` 只允许 SSH，若密钥未生成成功，会把自己彻底锁在外面；改动前先确认 `show ip ssh` 正常。
- 新版本 IOS XE 默认已禁用 SSHv1，`ip ssh version 2` 只是显式声明。
- `show logging` 的缓冲区大小有限，排障前先 `logging buffered 64000` 之类调大，否则关键日志会被冲掉。
- 部分平台 `show interfaces` 的 `input errors` 包含 CRC、帧、溢出三类，需要看子项区分物理层与配置问题。

## 高危操作 ⚠️

- 在只开 Telnet 的线路上直接 `transport input ssh`，若密钥未就绪会导致远程无法登录。
- `reload`、`erase startup-config`、`delete flash:` 会中断业务或清空配置，远程执行前必须确认现场有人。
- `debug all` 会瞬间打满 CPU 与日志，生产设备上应使用精确的 `debug` 条件并及时 `undebug all`。
- 修改管理 VLAN 或 SVI 地址而未同步调整网关，会丢失远程管理通道。

## 参考来源

1. [在路由器与交换机上配置 SSH（cisco.com）](https://www.cisco.com/c/en/us/support/docs/security-vpn/secure-shell-ssh/4145-ssh.html)
2. [Catalyst 1200 管理指南（cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/campus-lan-switches-access/Catalyst-1200-and-1300-Switches/Administration-Guide/catalyst-1200-admin-guide/administration.html)
