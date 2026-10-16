---
vendor: 迪普（DPtech）
os: DPtech 自有 CLI
topic: ACL 与 NAT
devices: LSW 系列交换机（LSW6600/5662/5620/3620/3600/3000 等）、XR 系列路由器
keywords: [迪普, DPtech, ACL, ingress, egress, NAT, source-nat, destination-nat, address-object]
sources:
  - https://zhuanlan.zhihu.com/p/1947252969780277295
  - https://blog.csdn.net/huainingning/article/details/161947174
verified: medium
updated: 2026-10-15
---

# 迪普 · ACL 与 NAT

> ⚠️ 迪普公开资料有限，以下命令整理自公开实践资料，与华为/思科风格部分相似但不完全相同，所有配置请以实际型号的官方手册或迪普售后确认为准。

## 命令速查

| 功能 | 命令 | 视图 | 说明 |
|---|---|---|---|
| 创建/进入 ACL（入方向） | `acl mode ipv4 ingress` | 配置模式 `[DPTECH]` | 方向随 ACL 自身声明，与思科/华为"接口调用时指定方向"不同 |
| 创建/进入 ACL（出方向） | `acl mode ipv4 egress` | 配置模式 `[DPTECH]` | 同上 |
| 配置规则（丢包） | `rule <名称> source host x.x.x.x destination host y.y.y.y action drop` | ACL 视图 | rule 用名称标识，动作为 drop 丢包 |
| 配置规则（统计） | `rule <名称> source host x.x.x.x destination host y.y.y.y action counter` | ACL 视图 | counter 动作做计数统计 |
| 源 NAT：绑定出接口 | `nat source-nat <名称> interface gige0_4` | 配置模式 `[DPTECH]` | 指定源转换的出接口 |
| 源 NAT：匹配源地址 | `nat source-nat <名称> src-address address-object <对象>/any` | 配置模式 `[DPTECH]` | 基于地址对象匹配，也见 any 取值 |
| 源 NAT：目的地址/服务/动作 | `nat source-nat <名称> dst-address ... / service ... / action use-interface` | 配置模式 `[DPTECH]` | 素材仅给出要素，子命令完整语法以官方手册/售后确认为准 |
| 目的 NAT（端口映射） | `nat destination-nat <名称> interface gige0_6 global-address x.x.x.x service tcp <端口范围> local-address <内网地址> local-port <端口>` | 配置模式 `[DPTECH]` | 一条命令完成公网地址/端口到内网地址/端口的映射 |

## 典型示例

```
<DPTECH> conf-mode
[DPTECH] acl mode ipv4 ingress
[DPTECH-acl] rule block-server source host 192.168.1.100 destination host 10.0.0.8 action drop
[DPTECH-acl] rule count-web source host 172.16.0.0/16 destination host 10.0.0.8 action counter
[DPTECH-acl] quit
[DPTECH] nat source-nat snat-1 interface gige0_4
[DPTECH] nat source-nat snat-1 src-address address-object any
[DPTECH] nat source-nat snat-1 action use-interface
[DPTECH] nat destination-nat dnat-1 interface gige0_6 global-address 202.10.1.10 service tcp 8080 local-address 192.168.1.10 local-port 80
```

## 陷阱与差异

- ACL 方向写在 ACL 本身上（`acl mode ipv4 ingress/egress`），而不是在接口引用时指定；这与华为/思科的习惯差异最大，排查策略不生效时先核对方向。
- 规则用 `rule <名称>` 命名，不依赖编号排序；规则匹配顺序与是否需要逐条排队未在素材中给出（以官方手册/售后确认为准）。
- 动作内联在 rule 中：`action drop`（丢包）/`action counter`（统计），与常见 ACL"deny/permit"命名不同。
- NAT 采用地址对象体系（`address-object <对象>`），需要先有对象概念；`/any` 表示任意地址的用法见公开样例。
- 源 NAT 的 `dst-address`、`service` 子命令完整语法未在素材中完整出现（以官方手册/售后确认，迪普公开资料有限）。
- ACL 与接口/安全策略的引用方式素材未覆盖，不要照搬思科 `ip access-group`。

## 高危操作 ⚠️

- `action drop` 规则写错源/目的地址会直接丢弃正常业务流量，⚠️ 下发前逐条核对五元组，先小范围验证。
- 目的 NAT 把内网服务暴露到公网地址端口，⚠️ 收紧 service/端口范围，避免整段端口映射造成暴露面过大。
- 源 NAT 出接口（如 `interface gige0_4`）绑错会导致外网访问异常，⚠️ 变更后立即验证内外双向连通性。
- 删除/修改 NAT 规则可能瞬断相关会话，⚠️ 在变更窗口操作并保留回退配置。

## 参考来源

1. [迪普 DPtech 设备命令公开实践整理（知乎专栏）](https://zhuanlan.zhihu.com/p/1947252969780277295)
2. [迪普设备配置公开实践资料（CSDN 博客）](https://blog.csdn.net/huainingning/article/details/161947174)
