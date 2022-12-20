---
layout: default
title: 2022/12/20 Docker容器技术 【学习笔记】
author: sindweller <sindweller5530@gmail.com>
tags: [云原生]
---
# Docker容器技术学习笔记

## 微服务改造的思路

- 可以用静态代码分析工具进行代码扫描，寻找有哪些包是隔离的，代码间很少调用的
- 不同并发规模、不同内存需求的模块都可以分离出来做不同的微服务，提高资源利用率

## 微服务间通信

API网关

- 基于一个轻量级message gateway
- 新API通过注册到gateway，api网关做转发
- 整合实现Common Function
- 可以做监控、认证、审计

## Docker容器技术

容器技术是利用基于Linux的Cgroup（隔离物理资源） Namespace（隔离网络资源）把进程模拟成虚拟机，属于操作系统层面的虚拟化技术，隔离的进程独立于宿主机其他运行的进程。

Docker为容器进行了进一步的封装

- 文件系统
- 网络
- 进程隔离

从而简化了容器的创建和维护，使docker比虚拟机更轻便快捷。

因为虚拟机虚拟出来需要有内核，要占cpu，也要占内存。

虚拟机比起进程要慢很多。还需要额外有一个Guest OS 和Hypevisor。

对于docker来说，省略了这两部分， 直接在HostOS上起Docker Engine。

## Docker常用操作

- 启动部分
    - - it 交互模式
    - -d 后台运行
    - -p 端口映射 把容器的端口映射到主机端口上
    - -v 磁盘挂载 把主机的磁盘挂到容器里
- 启动已终止的容器
    - docker start
- 停止容器
    - docker stop
- 查看容器进程
    - docker ps
- 进入容器
    - docker exec -it xxx ls 进入容器执行ls命令 如果有这个命令就会得到返回
    - docker attach： 通过nsenter 先获取pid nsenter说明要进入哪个process的namespace
        
        ```bash
        PID=$(docker inspect --format "{{.state.Pid}}" (<container>)
        $nsenter --target $PID --mount --uts --ipc --net --pid
        ```
        

```bash
# docker inspect --format "{{.State.Pid}}" 66f8492d
50910
root@nahida13-node1:/home/chenjh03/go-practice/http-server# nsenter --target 50910 --mount --uts --ipc --net --pid
66f8492da10b:/# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
16: eth0@if17: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue state UP
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

- docker push

```bash
docker push sindweller/httpserver:v1.0.0
```

- 拷贝文件到容器

```bash
  `docker cp file1 <containerid>:/file-to-docker-path` 

```

## Dockerfile

- FROM xxx 在哪个基础镜像
- ENTRYPOINT /main 启动时应该启动哪个程序

打包镜像命令

```bash
docker build -t abc/httpserver:${tag} . # 注意后面有个点 基于当前目录
docker push abc/httpserver:v1.0
```

基于镜像运行容器

```bash
docker run -d abc/httpserver:v1.0
```

## namespace隔离性

- mnt namespace 不同ns的进程看到的文件结构不同
- UTS ns （UNIX Time-sharing System）允许每个container拥有独立的hostname和domain name，可以在网络上被视作一个独立的节点，而不是host上的一个进程。
- user ns 每个container可以有不同的user 和 group id, 可以在container内部用container内部的用户来执行程序，而不是直接用host上的用户

### linux 系统上 ns的常用操作

每一个进程都会在/proc目录下有自己对应的目录， 可以进入/proc/488583/ns来查看命名空间。

使用nsenter可以进入ns，例如查看ns的网卡：

```bash
nsenter -t <pid> -n ip a
```

返回的网卡结果跟主机的网卡结果是不一样的，就是容器进程的网卡

## cgroup

cgroups实现对资源的配额和度量

cgroup的存储结构是层级树 

## linux 调度器

内核默认提供五个，其中比较重要的两个

- real time 实时调度器
- cfs completely fair scheduler 完全公平调度器，算法：完全公平调度；引入虚拟运行时间概念
    - 进程权重越大，虚拟时间跑的越慢，获取的vruntime时间越长
    - 维护一个以虚拟运行时间为顺序的红黑树
        - 自平衡，树上的路径不回比其他路径长出两倍
        - O(log n)时间复杂度，能快速插入和删除，以及查找
- Stop
- Deadline
- IDLE-Task 空闲调度器 每个cpu都会有一个idle线程

### 如何限制一个程序使用的资源？

 参考资料： [https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/resource_management_guide/sec-cpu](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/resource_management_guide/sec-cpu)

假设现在有一个go程序，里面main是一个for循环，同时还开了一个go func()也是for循环。启动之后，查看cpu利用率约200%，因为在两个系统线程上在执行for循环。

先创建一个cgroup：

```bash
# 在/sys/fs/cgroup/cpu下
root@nahida13-node1:/sys/fs/cgroup/cpu# pwd
/sys/fs/cgroup/cpu
root@nahida13-node1:/sys/fs/cgroup/cpu# mkdir cpudemo
root@nahida13-node1:/sys/fs/cgroup/cpu# cd cpudemo/
root@nahida13-node1:/sys/fs/cgroup/cpu/cpudemo# ls
cgroup.clone_children  cpu.uclamp.max        cpuacct.usage_percpu_sys
cgroup.procs           cpu.uclamp.min        cpuacct.usage_percpu_user
cpu.cfs_period_us      cpuacct.stat          cpuacct.usage_sys
cpu.cfs_quota_us       cpuacct.usage         cpuacct.usage_user
cpu.shares             cpuacct.usage_all     notify_on_release
cpu.stat               cpuacct.usage_percpu  tasks
```

会发现mkdir之后，这些会自动创建在里面。

现在需要让给你cgroup来限制这个go程序的资源，先假设这个进程的pid是588679，则执行：

```bash
echo 588679 > cgroup.procs # 定义有哪些线程被cgroup控制
```

```bash
root@nahida13-node1:/sys/fs/cgroup/cpu/cpudemo# cat cpu.shares
1024
# 指定微秒级的时间，配合下面的配额表示：cpu资源应该每period秒中有quota秒是给这个cgroup使用。默认是1s
root@nahida13-node1:/sys/fs/cgroup/cpu/cpudemo# cat cpu.cfs_period_us
100000
# cpu的配额，-1就是不限制
root@nahida13-node1:/sys/fs/cgroup/cpu/cpudemo# cat cpu.cfs_quota_us
-1
```

修改限制

```bash
echo 100000 > cpu.cfs_quota_us
```

此时quota和就和cfs_period_us一样了，那么就会降成100%，一个cpu

### memory子系统

- memory.limit_in_bytes 设置Cgroup下进程最多能使用的内存。-1则不作限制
- memory.oom_control 设置是否使用oom killer，默认使用，当属于该cgroup的进程使用的内存超过最大的限定值时，会立刻oom killer处理

cpu是可压缩资源，只给0.1cpu还能执行，只不过很慢。但是内存不可，申请不到内存程序就会出问题。

## cgroup驱动

操作系统使用systemd

- init进程生成一个根cgroup目录结构并作为cgrou管理器
- 为每个systemd unit 分配cgroup

docker使用cgroupfs

存在问题：

- 有两套group 驱动
- docker和kubelet管理的进程被cgroupfs驱动管理，systemd拉起的服务由systemd驱动管理，cgroup管理混乱，容易在资源紧张时分配出问题。同一套资源被两套系统往外划分。@

解决方案：kubelet会默认—cgroup-driver=systemd，如果运行时的cgroup不一致，kubelet就会报错。

## 文件系统

基于UnionFS生成镜像 

- 不同目录挂在到同一个虚拟文件系统下

## 容器镜像

Dockerfile中的每一个命令都会构建成一个镜像层。

对于通用的镜像层，例如两个dockerfile都写了

```bash
RUN apt install -y default-jre
```

那么这一层就会被2个不同的容器镜像里面共享。事实上只保存了一份。能够提高复用，减少对硬盘占用。

## Docker 的文件系统

docker通过OverlayFS来模拟一个完整的文件系统

典型Linux文件系统组成：

- Bootfs
    - Bootloader 引导加载kernel
    - Kernel 当kernel被加载到内存中后， umount bootfs
- rootfs
    - /dev /proc /bin /etc等标准目录和文件
    - 不同的linux发行版，bootfs基本一致，但rootfs会有差别

## Docker启动

linux：在启动后，先将rootfs设置为readonly，进行一系列检查，将其切换为readwrite供用户使用

docker（分层文件系统）： 初始化时，rootfs以readonly方式加载并检查，而后利用union mount的方式将一个readwrite文件系统挂载到readonly的rootfs（没有把rootfs直接变可写而是加一层）上；允许再次将下层的fs设定为readonly并向上叠加；一组readonly和一个writeable结构构成一个container的运行时态，每个fs被称作一个fs层。

所以针对容器的文件修改都是在最上面一层的修改。下面的层都是readonly。

## 写操作

写时复制，一个镜像被多个镜像使用，不同层被共享，所以保证基础镜像不会修改。如果要改，则需要写时复制，在加一层文件层，对其进行覆盖。

用时分配，而不是提前分配，一个文件被创建出来后，才会分配空间，有效地节省主机磁盘空间。

如何实现？

### 容器的存储驱动

- OverlayFS 常用
- Device Mapper
- Btrfs

### OverlayFS

与AUFS相似的联合文件系统（多个目录组织到一个虚拟目录里，虚拟目录作为rootfs供容器使用），属于文件级的存储驱动。

- upper层 容器可写层
- lower层 镜像层

写一个同名文件，上层会覆盖掉下层的已存在的文件。

## OCI容器标准

## Docker构建上下文

首先会拷贝所有当前路径的文件到docker daemon

## 容器网络

模式：

- Null —net=None 容器放入独立的网络空间不做任何网络配置，可以交由k8s来控制。用户也可以通过运行docker network命令来完成网络配置
- Host 直接复用主机网络，但这种模式下，可以通过修改容器网络去修改主机网络，除非是系统管理员，否则不推荐（然而我确实有在用）
- Container 重用其他容器的网络，共享同一个网络的namespace，可以通过localhost互相调用
- Bridge —net=bridge 默认的桥接

### 跨主机的容器如何互相通信

通常容器网络和基础架构是两个网络，容器子网不能在基础架构网络中路由。

- Overlay 容器里面的数据包出来，在主机封一层，根据协议加包头，将当前主机地址做源地址，封装好数据包就可以在基础架构网络中传输。对端主机收到后，解包，剩下容器的数据包头。封包解包的技术就是Overlay
- Remote underlay 容器网络和主机网络相同，容器ip段在基础架构处也知道怎么路由。劣势在于，容器对ip消耗很大，需要规划好网段分配。

### 单机互联互通

```bash
brctl show # bridge ctl
# 保存网络namespace和容器的关系
mkdir -p /var/run/netns
# 通过null模式启动docker进程
docker run --network=none -d nginx
# 获取容器的pid信息
docker inspect 8e90782dbf35|grep -i pid
# 进入该容器的网络ns
root@nahida13-node1:~# nsenter -t 55189 -n ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
# 手动配网络
# 把pid和刚才创建的network ns软链接一下
root@nahida13-node1:~# ip netns list
root@nahida13-node1:~# ln -s /proc/$pid/ns/net /var/run/netns/$pid
root@nahida13-node1:~# ip netns list
55189
# 可以看到这个进程跟ns有存储关系
# 新建链路，类型是 veth virtual ethernet，虚拟以太网 创建一个虚拟链路 从A口到B口，可以理解为一个网线
ip link add A type veth peer name B
# 把这个虚拟网线的A口插到docker0处
brctl addif docker0 A
# 启动A
ip link set A
# 以上都是在主机的网络中操作

# 配置B 容器的网关是172.17.0.1（就是bridge）， 假设给他10为ip
# 先设置好环境变量 包括ip 子网掩码 网关
SETIP=172.17.0.10
SETMASK=16
GATEWAY=172.17.0.1
# 把网线另外一端放到这个进程的ns里
# 此后都是在容器ns里配置
ip link set B netns $pid
# 先重命名一下
ip netns exec $pid ip link set dev B name eth0
# 启动
ip netns exec $pid ip link set eth0 up
# 设置网络和默认路由
ip netns exec $pid ip addr add $SETIP/$SETMASK dev eth0
ip netns exec $pid ip route add default via $GATEWAY
# 接下来这个10的ip就可以访问了
root@nahida13-node1:~# curl 172.17.0.10
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

在curl 10的请求时，这个请求就被转发到了容器内部的网络ns里，被nginx的processor接收。

看下网络配置变成什么样子了

```bash

# 原来：
root@nahida13-node1:~# nsenter -t 55189 -n ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
# 现在
root@nahida13-node1:~# nsenter -t $pid -n ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
18: eth0@if19: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether a2:00:6a:43:e6:10 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.10/16 scope global eth0
       valid_lft forever preferred_lft forever
```

这样配好了eth0，默认路由也配好了。主机的网络和容器内部的网络已经互通。

docker的桥接就是自动做好以上步骤。

docker默认在主机起一个docker0，将172.17.0.0/16配置在上面，起容器的时候会从这个网段中选取ip分配给新容器。像手动操作时一样，创建一个虚拟链路veth pair。A口在docker0上，B口在容器的ns里（配给eth0）。

bridge（docker0）上插着的虚拟链路默认互通。

但此时容器和外部网络是不互通的！例如容器内部程序想要访问另一个机器上的kafka，是失败的。

如果想把容器ip暴露到主机外，供其他主机访问，可以在容器启动的时候加参数：-p 把容器内部的端口映射到主机的端口，可以用主机ip:port访问。这个操作的实现是用主机iptables做端口转发

```bash

PREROUTIG -A DOCKER ! -i docker0 -p tcp -m tcp --dport 2333 -j DNAT --to-destination 172.17.0.2:22
```

### Underlay相关概念（跨主机容器互通）

- linux网桥设备 sbrctl 通过物理网络联通容器
- 新的网桥设备mydr0
- 将主机网卡加入网桥
- 将主机网卡的地址直接配置到网桥，把默认路由规则转移到网桥mydr0
- 启动容器
- 创建veth对 把一个peer添加到网桥mydr0
- 配置容器把veth另一个peer分配给容器网卡
- 主机eth0不配ip，主机网卡地址直接配置到mydr0上

整个基础架构网络中的路由认识这个配置到mydr0上的ip段，所以在这个ip段里面选ip去配置容器，容器的ip就跟主机的ip一样了。

但这要求精确的ip规划，避免ip冲突或浪费。

### Overlay相关概念

VXLAN工作模式 

主机上的虚拟机的包往外发的时候有一个VTEP设备去做封包，VTEP设备知道主机A的IP，也知道对端B的ip。所以在原始包外面加VXLAN的包头（UDP协议加VXLAN id）。这样路由就知道应该转发到B（源ip是个虚拟机， 目的ip也是个虚拟机）。

经过B的VTEP时，它会发现这是一个VXLAN的包，就会拆掉最外层。B主机校验目标ip是自己的某个虚拟机。

- Flannel Calico都支持Overlay
    
    

容器网络在基础架构网络不可路由。包从容器网络出来，在Flannel设备加一个UDP包头，其source和dest是主机地址。传到对端主机并由Flannel设备拆包，交由容器处理。

## 容器Build Cache

如何复用相同的镜像层？通过计算checksum

- ADD COPY命令，Docker 判断该镜像每一个文件的内容生成checksum，比较现有镜像
- 其他指令如RUN apt-get -y update, 只需要简单比较现存镜像中的指令字串
- 如果底层cache失效，会引发上层cache连锁失效

## 多级构建

尽量减少镜像层级：

```yaml
FROM golang:1.16 AS build

…

RUN go build -o /bin/project
```

先把程序构建出来

```yaml
FROM scratch
COPY --from=build /bin/project /bin/project # 把上面构建的拷贝进来
ENTRYPOINT ["/bin/project"]
CMD ["--help"]
```

这样下一层就免去了变异过程中的中间状态的文件

## Dockerfile常用指令

- FROM 选择基础镜像，一般选择alpine。因为直接选用操作系统，会占很多空间，如果里面有工具含有安全漏洞，修复成本很高。FROM scratch即是空，不需要系统。如果要进容器里做调试，可以选择alpine，再装其他工具。
- LABEL 按标签组织项目，比如author org
- EXPOSE 发布端口，更多的是约定，比如其他人看到dockerfile能知道应该访问哪个端口。在docker run -P时，docker会自动映射expose的端口到主机的一个高端口。
- ENV 设置环境变量
- ADD 从源地址复制文件到目标路径，可以在过程中改变权限 —chown；ADD很灵活，可以使用go风格的通配符。ADD有一些附加动作，比如如果是压缩文件，会直接解压。尽量少通过ADD URL添加remote文件，应该使用curl 或wget && untar.【不推荐使用ADD 容易误用】
- COPY 比较简单 只能复制本地文件，不能url；
- ENTRIPOINT 定义可以执行的容器镜像入口命令
    - docker run 参数追加模式 [”executable”, “param1”,”param2”]
    - 参数替换模式 command param1 param2
    - 等同于docker run —entrypoing， 命令可替换文件中的ep
    - 一般实践中用ENTRYPOINT定义镜像主命令，通过CMD定义主要参数，例如
    
    ```yaml
    ENTRYPOINT ["s3cmd"]
    CMD ["--help"]
    ```
    
- VOLUME 指定外挂存储卷 Dockfile该指令之后对这个目录所做的修改都无效，因为外挂了。k8s对这个容器自己定义的volume缺乏管理，所以一般不用。等同于命令： docker run -v /data
- USER 默认以root运行，但一般希望容器有访问限制，要以non-root身份启动。
- WORKDIR 等价于cd 切换工作目录

## 一些tips

- 参数按字母排序 减少可能的重复参数
- 层数减少，只有RUN COPY ADD创建新层 多条RUN可以&链接为一个
- 如果确实需要多个进程放在一个容器里，那就需要对init进程进行修改，需要捕获SIGTERM信号，以免init吃掉了k8s的优雅退出机制终止信号，把信号传递给其他进程，避免出现僵尸进程。
- 可以把commit和容器tag对应起来 v1.1.1, github中保存release代码快照： git tag v1.1.1 使cicd流程顺利。