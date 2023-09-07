---
layout: default
title: 2023/09/05 k8s statefulset概念
author: sindweller <sindweller5530@gmail.com>
tags: [工具]
---

## 有状态服务和无状态服务的区别

- 无状态服务：
  - 不需要本地持久化数据
  - 多个实例对于同一个请求的响应结果相同
  - 可以用deployment类型的对象来编排
- 有状态服务：
  - 需要在本地存储持久化数据
  - 有状态分布式组件，需要预定义启动顺序（分布式其实不该这样）、集群要求、点对点TCP连接、唯一的网络标识符、正常启动和终止，需求比较复杂

## StatefulSet的额外功能

- 可以处理Pod的启动顺序
- 设置唯一标识
  - 稳定、唯一的网络标识符
  - 稳定、持久化存储
  - 有序、优雅的部署和扩缩容
  - 有序、优雅的删除终止
  - 有序、自动滚动更新
  
## 预备知识：headless service

Service是应用服务的抽象，通过labels提供负载均衡和服务发现，每个Service分配一个cluster ip和DNS名，**集群内部** 通过地址或FDQN（全域名）来访问服务。

headless就是没有clusterip(cluster ip = none) 然后直接用pod1.my-svc.<ns>.svc.cluster.local访问，这样访问的addr就固定了，pod重启可能ip会变，通过dns访问，就可以了。
  
## 实际操作

如果是用kind部署的集群，会有一个自动的pv provisoner。

> 每个StorageClass都包含provisioner parameters reclaimPolicy字段，会在动态创建pv时使用。
> provisioner是制备器，用来决定使用哪个卷插件来制备pv，例如NFS Local CephFS等。

使用 `kubectl explain sts`  可以看到使用指南

可以通过 `volumeClaimTemplates` 来指定存储卷