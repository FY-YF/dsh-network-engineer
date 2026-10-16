---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: 远程管理与 DHCP
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, SSH, Telnet, DHCP, dhcp-relay, dhcp-snooping, 端口镜像, mirror]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://www.zhihu.com/question/496917264
  - https://www.dptech.com
verified: medium
updated: 2026-10-15
---

# 迪普 · 远程管理与 DHCP

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 开启 SSH 服务 | `ssh enable` | 配置模式 `[DPTECH]` | 详见知乎问答（vty 视图下 SSH/Telnet 认证配置同步） |
| 开启 Telnet 服务 | `telnet enable` | 配置模式 `[DPTECH]` | Telnet 为明文协议，优先用 SSH |
| vty 认证配置 | vty 视图下 SSH/Telnet 认证配置同步 | vty 视图 | 具体命令公开素材未完整给出（以官方手册/售后确认为准） |
| 创建 DHCP 地址池 | `dhcp server pool <名称>` | 配置模式 `[DPTECH]` | 创建并进入地址池视图 |
| 配置分配网段 | `address range 192.168.1.1 192.168.1.200 24` | DHCP 地址池视图 | 起始地址 + 结束地址 + 前缀长度 |
| 配置网关 | `default-router 192.168.1.1` | DHCP 地址池视图 | 下发给客户端的网关 |
| 配置 DNS | `dns-server 222.222.222.222` | DHCP 地址池视图 | 可配置多个（数量限制以手册为准） |
| 绑定接口 | `binding interface vlan-if2` | DHCP 地址池视图 | 地址池与三层 VLANIF 接口关联 |
| 配置租期 | `lease 1 3 5` | DHCP 地址池视图 | 参数依次为 天 时 分 |
| 静态绑定 | `static-bind ip-address x.x.x.x mac-address <MAC> client-name <名>` | DHCP 地址池视图 | 按客户端 MAC 固定分配 |
| 使能 DHCP 服务器 | `dhcp server enable` | 配置模式 `[DPTECH]` | 全局开关 |
| 查看地址池 | `show dhcp server pool <名称>` | 用户/配置视图 | 核对分配情况与配置 |
| DHCP 中继：指定服务器 | `dhcp relay server-address x.x.x.x` | VLAN 接口视图（素材原文为 interface vlan 3 下） | 指向 DHCP 服务器 |
| DHCP 中继：使能 | `dhcp relay enable` | VLAN 接口视图 | 与 server-address 同时配置 |
| DHCP Snooping 信任口 | `dhcp snooping trust` | 接口视图 | 上联合法 DHCP 服务器的端口设为信任 |
| DHCP Snooping 使能 | `dhcp snooping enable` | 接口视图 | 下联口保持非信任，拦截私接 DHCP |
| 查看 Snooping | `show dhcp snooping` | 用户/配置视图 | 核对信任口与绑定表 |
| 端口镜像：定义源 | `mirror <ID> source <源端口> both/tx/rx` | 配置模式 `[DPTECH]` | 方向可选双向/发送/接收 |
| 端口镜像：定义目的 | `mirror <ID> destination <目的端口>` | 配置模式 `[DPTECH]` | 抓包分析口接在目的端口 |
| 查看镜像 | `show mirror <ID>` / `show mirror local` | 用户/配置视图 | 核对镜像组状态 |
| 查看版本等信息 | `show version` 等通用查看命令 | 用户视图 | 通用查看命令的完整清单以官方手册为准 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] ssh enable
[DPTECH] telnet enable
[DPTECH] dhcp server pool office
[DPTECH-dhcp-office] address range 192.168.1.1 192.168.1.200 24
[DPTECH-dhcp-office] default-router 192.168.1.1
[DPTECH-dhcp-office] dns-server 222.222.222.222
[DPTECH-dhcp-office] binding interface vlan-if2
[DPTECH-dhcp-office] lease 1 3 5
[DPTECH-dhcp-office] static-bind ip-address 192.168.1.88 mac-address <MAC> client-name printer
[DPTECH-dhcp-office] quit
[DPTECH] dhcp server enable
```

## 陷阱与差异

- SSH/Telnet 服务开关为 `ssh enable`/`telnet enable`（配置模式），认证部分需在 vty 视图下同步配置；具体认证命令公开素材未完整给出（以官方手册/售后确认，迪普公开资料有限）。
- DHCP 地址池用 `address range <起> <止> <前缀长度>`，租期 `lease <天> <时> <分>` 三段参数，与华为/思科的租期写法不同。
- DHCP 中继在 VLAN 接口视图下需要 `dhcp relay server-address` 与 `dhcp relay enable` 两条同时配置，漏一条中继不生效。
- DHCP Snooping 的信任口（trust）必须只配在朝向合法 DHCP 服务器的上联口，下联口保持非信任。
- 端口镜像通过 `mirror <ID>` 组编号组织，源端口带 `both/tx/rx` 方向参数；地址池等子视图提示符以实际输出为准。
- `show version`、`show dhcp server pool` 等查看命令的输出字段以实际型号为准。

## 高危操作 ⚠️

- 修改 SSH/Telnet 及 vty 认证配置可能远程自锁管理通道，⚠️ 保留 Console 或带外管理路径后再操作。
- Telnet 明文传输凭据，⚠️ 生产环境优先关闭 `telnet enable` 仅保留 SSH。
- DHCP Snooping 信任口配置错误会导致客户端拿不到地址，⚠️ 变更后用 `show dhcp snooping` 与终端续租验证。
- 端口镜像会产生额外流量与数据合规风险，⚠️ 只在必要口镜像、目的口妥善管控，用后及时删除镜像组。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普交换机 SSH/Telnet 认证配置相关问答（知乎）](https://www.zhihu.com/question/496917264)
3. [迪普科技官网（产品与资料入口）](https://www.dptech.com)
