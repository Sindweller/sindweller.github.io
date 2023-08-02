---
layout: default
title: 2023/08/02 系统内存管理
author: sindweller <sindweller5530@gmail.com>
tags: [操作系统]
---

# 虚拟内存

虚拟内存的出现是为了隔离程序和物理内存，以防止两个程序同时读写同一块内存。操作系统负责管理虚拟地址和物理地址的映射，程序只操作自己所拥有的那一部分虚拟内存。

硬件上，是通过CPU芯片中的内存管理单元（MMU）存储映射关系。