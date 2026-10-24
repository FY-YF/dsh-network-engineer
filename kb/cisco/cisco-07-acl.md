---
vendor: 思科（Cisco）
os: IOS / IOS XE
topic: ACL
devices: Catalyst 交换机与 ISR 路由器
keywords: [ACL, access-list, 标准ACL, 扩展ACL, 命名ACL, ip access-group, permit, deny, 通配符, show access-lists]
sources:
  - https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/security/acls/acls-configuration-guide/access-control-lists.html
verified: high
updated: 2026-10-24
---

# 思科 · ACL

> 适用于 IOS/IOS XE 的标准、扩展与命名 IP ACL，含应用位置与通配符写法。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 标准 ACL | access-list 10 permit 192.168.10.0 0.0.0.255 | 全局配置 | 只匹配源地址，编号 1–99 |
| 扩展 ACL | access-list 100 permit tcp 192.168.10.0 0.0.0.255 host 10.1.1.1 eq 80 | 全局配置 | 匹配源/目的/协议/端口，编号 100–199 |
| 末尾拒绝 | access-list 100 deny ip any any log | 全局配置 | 显式拒绝并记日志，便于验证 |
| 命名 ACL | ip access-list extended WEB-FILTER | 全局配置 | 进入命名 ACL 配置模式 |
| 命名条目 | permit tcp any host 10.1.1.1 eq 443 | 命名 ACL 配置 | 按顺序匹配，先匹配先生效 |
| 应用到接口 | ip access-group 100 in | 接口配置 | in/out 方向相对路由器 |
| 应用到 SVI | ip access-group WEB-FILTER in | SVI 配置 | 交换机常用在 SVI 上做 VLAN 间过滤 |
| 查看 ACL | show access-lists | 特权模式 | 每条命中计数 |
| 查看应用点 | show ip interface Vlan10 | 特权模式 | 显示 inbound/outbound ACL |
| 通配符说明 | 0.0.0.255 表示前 24 位必须匹配 | — | 通配符是掩码取反 |

## 典型示例

```
SW-CORE-01# configure terminal
SW-CORE-01(config)# ip access-list extended GUEST-FILTER
SW-CORE-01(config-ext-nacl)# permit udp any any eq 53
SW-CORE-01(config-ext-nacl)# permit tcp any any eq 53
SW-CORE-01(config-ext-nacl)# permit tcp any host 10.1.1.1 eq 80
SW-CORE-01(config-ext-nacl)# deny ip any 192.168.10.0 0.0.0.255
SW-CORE-01(config-ext-nacl)# permit ip any any
SW-CORE-01(config-ext-nacl)# exit
SW-CORE-01(config)# interface Vlan20
SW-CORE-01(config-if)# ip access-group GUEST-FILTER in
SW-CORE-01(config-if)# end
SW-CORE-01# show access-lists
```

## 陷阱与版本差异

- ACL 末尾默认隐含 `deny ip any any`，只写 permit 条目等于把其余流量全挡掉。
- 标准 ACL 只能匹配源地址，应尽量放在靠近**目的**的接口；扩展 ACL 靠近**源**，否则会误伤其他方向的流量。
- 命名 ACL 插入条目不能调整顺序，后加的在末尾；要改顺序只能重建。
- `ip access-group` 在 SVI 上的 `in` 是"从该 VLAN 进入交换机"的方向，方向选反会完全不起作用或误封。
- 部分平台 `log` 会产生大量日志，生产上建议配合 `logging rate-limit` 或只在排障时开启。

## 高危操作 ⚠️

- 在管理 VLAN 的 SVI 上用 `in` 方向应用只放行业务的 ACL，会把 SSH/Telnet 一起挡掉，只能到现场恢复。
- 删除 ACL 条目时用 `no access-list 100` 会整体清空，顺序与计数一并丢失。
- 通配符写反（把 `0.0.0.255` 写成 `255.255.255.0`）会让匹配范围变成"任意地址"，等于全放行或全拒绝。

## 参考来源

1. [ACL 配置指南，Cisco IOS XE 17（cisco.com）](https://www.cisco.com/c/en/us/td/docs/switches/lan/c9000/security/acls/acls-configuration-guide/access-control-lists.html)
