---
layout: default
title: 2024/05/24 虚拟内存和物理内存
author: sindweller <sindweller5530@gmail.com>
tags: [操作系统]
---

## 杂谈

距离上一次写文章已经过去半年多了，上一篇还是在代码随想录刷题中。因为重心转移到工作内容上来了，基本是在搭建一下好用的研发提效工具和业务需求实现，针对自我基础能力的提升暂时放置了。不过在工作中也遇到了很多实际的问题，有的是按照以前经验解决了有的是现学的，现在重心从功能开发转移到性能优化，有许多值得记录的踩坑经验和尝试结果。故而重启这个个人博客，记录下自己关于技术方面的小心得，以备来时查阅。

## 遇到问题

我们需要在工作节点上启动很多docker，每个docker会分配一定内存，假设我们是4c32g的机器，每个容器分配8g内存，那么再算上一些预留资源，实际只能跑不到4个容器。这显然是不太符合我们的业务需求的，产品表现也不好。


## 内存使用

输入free -h之后会看到一些列

```shell
               total        used        free      shared  buff/cache   available
Mem:            19Gi       6.0Gi       841Mi       1.0Mi        12Gi        13Gi
Swap:           42Gi        60Mi        42Gi
```

- total 物理内存总量
- used 已使用的物理内存量
- free 空闲，可用的物理内存量
- shared 被共享的物理内存量（很少用）
- buff/cache **缓冲缓存** 被用来当作缓冲和缓存的物理内存量

一般跑着跑着，buff/cache会变得很高，此时会发现free就变得很少，total=used+buff/cache，如果容器里的程序在读free，就会发现不可用。

时间证明，容器能够看到的free是宿主机的free值，容器设定limit> free但小于buff/cache，也能跑起来并且在跑完之后释放buff/cache.

buff是缓冲区，用于暂时存储正在进行的IO操作的数据，读取数据->暂存缓冲区->输出到磁盘。这样可以减少对磁盘的频繁访问。

cache是存储最近访问过的数据的内存区域。

buff/cache的使用量，是动态分配的，需要时可以释放。

### 交换空间swap space

使用交换空间可以扩展可用内存，当物理内存不够的时候，交换空间可以提供额外的存储空间。当我们要在节点上分配非常多的容器，每个容器都要求分配内存时，可以使用这一临时的方式来提升分配的数量。但是跟物理内存相比，交换空间提供的存储空间访问速度要慢很多，数据要在磁盘和内存之间频繁读写。

配置示例：

```
#!/bin/bash

amp=2 # 一般推荐虚拟内存为物理内存的1倍至2倍

total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2 / 1024}')
swap_size=$(echo "$total_mem * $amp / 1024" | bc)
swap_size_gb=$(printf "%.0f" $swap_size)
echo "Creating a swap file of size ${swap_size_gb}G..."
fallocate -l ${swap_size_gb}G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "Swap file created and turned on successfully."
```

检查是否生效

```
sudo swapon --show
```

在/etc/fstab中添加以下内容，保证重启后依然有效

```
/swapfile none swap sw 0 0
```

通过这一方式（设置交换空间为物理内存的2倍），极大地提升了可运行容器的量：
- 历史版本 只能支持 【 19GB * 内存分配规划比例  /  10GB  】个 业务任务同时运行
- 新版本 能支持 个数为 【 (19 GB + 38 GB) / 10 GB  * 内存分配规划比例  】的业务任务同时运行