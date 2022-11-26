---
layout: default
title: 2022/11/25 curve tools-v2 开发测试流程
author: sindweller <sindweller5530@gmail.com>
tags: [存储]
---

## 开发测试流程概述
开发任务：[https://github.com/opencurve/curve/issues/2038](https://github.com/opencurve/curve/issues/2038)

为curve的tool提供一个查询dir的命令

我提交的pr见： [feat: [curve/toos-v2] add bs list dir ](https://github.com/opencurve/curve/pull/2082)

测试流程：

1. 运行curve bs playground

```shell
curveadm playground run --kind curvebs --container_image harbor.cloud.netease.com/curve/curvebs:playground
```

这会拉起一个curve-playground的docker

2. 检查是否成功
   
```shell
[root@curveadm ~]# docker ps -a
CONTAINER ID   IMAGE                                      COMMAND            CREATED       STATUS       PORTS     NAMES
de7603f17cf9   opencurvedocker/curvebs-playground:v1.2    "/entrypoint.sh"   2 weeks ago   Up 2 weeks             playground-curvebs-1668242182
```

3. 将编译好的 curve文件（在tools-v2下执行 `make`）拷贝进docker
   
```shell
docker cp /sbin/curve de7603f17cf9:/
```

4. 进入对应的docker
   
```shell
[root@curveadm ~]# docker exec -it de7603f17cf9 bash
root@de7603f17cf9:/# ls
aws_sdk_2022-11-12-08.log  boot  curve		 curvebs  dlv		 etc   lib    media  opt   root  sbin  sys  usr
bin			   core  curve_ops_tool  dev	  entrypoint.sh  home  lib64  mnt    proc  run	 srv   tmp  var
```

5. 执行命令（可以加上--verbose来查看日志输出）
   
```shell
root@de7603f17cf9:/# ./curve bs list dir --verbose
2022/11/26 21:08:30.110863 base.go:296: 127.0.0.1:6702: start to dial
2022/11/26 21:08:30.110910 base.go:296: 127.0.0.1:6700: start to dial
2022/11/26 21:08:30.110923 base.go:296: 127.0.0.1:6701: start to dial
2022/11/26 21:08:30.112811 base.go:311: 127.0.0.1:6700: start to rpc [ListDir]
2022/11/26 21:08:30.117807 base.go:328: 127.0.0.1:6700: get rpc[ListDir] request successfully
...
+------+-------------+----------+-----------------+------------+---------------------+---------------+----------+
|  ID  |  FILENAME   | PARENTID |    FILETYPE     |   OWNER    |        CTIME        | ALLOCATEDSIZE | FILESIZE |
+------+-------------+----------+-----------------+------------+---------------------+---------------+----------+
| 3    | /playground | 0        | INODE_PAGEFILE  | playground | 2022-06-27 17:35:28 | 0 B           | 10 GiB   |
+------+-------------+          +-----------------+------------+---------------------+---------------+----------+
| 1    | /RecycleBin |          | INODE_DIRECTORY | root       | 2022-11-12 16:38:25 | 0 B           | 0 B      |
+------+-------------+          +-----------------+------------+---------------------+---------------+----------+
| 1004 | /dir11      |          | INODE_PAGEFILE  | test       | 2022-11-18 14:39:30 | 0 B           | 20 GiB   |
+------+-------------+          +                 +            +---------------------+---------------+----------+
| 1005 | /dir12      |          |                 |            | 2022-11-18 14:44:00 | 0 B           | 20 GiB   |
+------+-------------+          +                 +            +---------------------+---------------+----------+
| 1003 | /test       |          |                 |            | 2022-11-18 14:36:17 | 0 B           | 20 GiB   |
+------+-------------+          +                 +            +---------------------+---------------+----------+
| 1006 | /test22     |          |                 |            | 2022-11-18 14:44:12 | 0 B           | 10 GiB   |
+------+-------------+----------+-----------------+------------+---------------------+---------------+----------+
```

至此，成功验证新增的 `curve bs list dir`功能。

## git相关问题
显示头指针分离，搞不清楚这是哪个branch，并且需要合并上游仓库的更新，操作如下：

首先查看一下 `git status`

```
sindweller@xindeweiladeMacBook-Pro curve % git status
头指针分离自 16b42fc6
无文件要提交，干净的工作区
sindweller@xindeweiladeMacBook-Pro curve % git push origin master
To https://github.com/Sindweller/curve.git
 ! [rejected]          master -> master (non-fast-forward)
error: 推送一些引用到 'https://github.com/Sindweller/curve.git' 失败
提示：更新被拒绝，因为推送的一个分支的最新提交落后于其对应的远程分支。
提示：检出该分支并整合远程变更（如 'git pull ...'），然后再推送。详见
提示：'git push --help' 中的 'Note about fast-forwards' 小节。
```

问题是这个时候如果merge master的话会显示已经是最新的，因为我们这次提交（commit）并不在master本地分支上。

```
sindweller@xindeweiladeMacBook-Pro curve % git fetch origin
sindweller@xindeweiladeMacBook-Pro curve % git merge origin/master
已经是最新的。
sindweller@xindeweiladeMacBook-Pro curve % git push origin master
To https://github.com/Sindweller/curve.git
 ! [rejected]          master -> master (non-fast-forward)
error: 推送一些引用到 'https://github.com/Sindweller/curve.git' 失败
提示：更新被拒绝，因为推送的一个分支的最新提交落后于其对应的远程分支。
提示：检出该分支并整合远程变更（如 'git pull ...'），然后再推送。详见
提示：'git push --help' 中的 'Note about fast-forwards' 小节。
```

> 关于头指针分离的具体解释可以查看：[https://blog.csdn.net/start_mao/article/details/94722393](https://blog.csdn.net/start_mao/article/details/94722393)

合并远程分支：

```shell
sindweller@xindeweiladeMacBook-Pro curve % git merge dev2
更新 f856f13e..443ac8bd
Fast-forward
 tools-v2/go.mod                                  |   2 ++
 tools-v2/internal/utils/row.go                   |   3 +++
 tools-v2/pkg/cli/command/curvebs/list/dir/dir.go | 162 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 tools-v2/pkg/cli/command/curvebs/list/list.go    |   2 ++
 tools-v2/pkg/config/bs.go                        |   6 ++++++
 5 files changed, 175 insertions(+)
 create mode 100644 tools-v2/pkg/cli/command/curvebs/list/dir/dir.go
sindweller@xindeweiladeMacBook-Pro curve % git status
位于分支 master
您的分支领先 'origin/master' 共 1 个提交。
  （使用 "git push" 来发布您的本地提交）
```

然后再push就可以了

```
sindweller@xindeweiladeMacBook-Pro curve % git push origin master
枚举对象中: 31, 完成.
对象计数中: 100% (31/31), 完成.
使用 12 个线程进行压缩
压缩对象中: 100% (16/16), 完成.
写入对象中: 100% (17/17), 3.44 KiB | 3.44 MiB/s, 完成.
总共 17（差异 10），复用 0（差异 0），包复用 0
remote: Resolving deltas: 100% (10/10), completed with 10 local objects.
To https://github.com/Sindweller/curve.git
   f856f13e..443ac8bd  master -> master
```

curve项目要求在git时为本次提交（commit）签名：

> To avoid having PRs blocked in the future, always include Signed-off-by: Author Name <authoremail@example.com> in _every_ commit message. You can also do this automatically by using the -s flag (i.e., git commit -s).

所以命令是这样的：

```
 git commit -m "feat: add bs list dir cmd with flag & replace in go.mod" -s
```

## 编译curve核心过程中遇到的问题与解决方案

> 注意curve对机器要求是要有nbd模块，我在阿里云ecs实例上看到了nbd，但是阿里云的机器执行lsscsi这个命令看不到盘，不知道为什么。
> 
> curve的ansible安装sh脚本中有一行 `lsscsi |grep ATA|awk '{print $7}'|awk -F/ '{print $3}'`，查不到盘，导致ansible方式安装失败。curve官方也不维护ansible方式了，所以还是采用curveadm的方式部署curve。

### 安装bazel（要求是4.2.2）
下载地址：
[https://github.com/bazelbuild/bazel/releases/tag/4.2.2](https://github.com/bazelbuild/bazel/releases/tag/4.2.2)
```shell
wget https://github.com/bazelbuild/bazel/releases/download/4.2.2/bazel-4.2.2-installer-linux-x86_64.sh
# output
Make sure you have "/usr/local/bin" in your path.

For bash completion, add the following line to your ~/.bashrc:
source /usr/local/lib/bazel/bin/bazel-complete.bash
```

验证bazel版本
```go
[root@curveadm curve]# bazel version
Extracting Bazel installation...
Starting local Bazel server and connecting to it...
Build label: 4.2.2
Build target: bazel-out/k8-opt/bin/src/main/java/com/google/devtools/build/lib/bazel/BazelServer_deploy.jar
Build time: Thu Dec 2 18:15:58 2021 (1638468958)
Build timestamp: 1638468958
Build timestamp as int: 1638468958
```
> 下面这个方法同样可以下载bazel，但版本一般比较落后，仅供参考。

1. 添加repo
```shell
dnf config-manager --add-repo https://copr.fedorainfracloud.org/coprs/vbatts/bazel/repo/epel-8/vbatts-bazel-epel-8.repo
```

2. 然后 dnf install bazel
### 安装gcc
dnf install gcc
### 编译 curvebs 中遇到的问题记录
cd curve && make build dep=1
一定加上dep=1不然会报错
报错：
```shell
Error
Unrecognized option: --incompatible_blacklisted_protos_requires_proto_info=false
```
解决方案：
```shell
wget https://curve-build.nos-eastchina1.126.net/bazel-0.17.2-installer-linux-x86_64.sh
bash bazel-0.17.2-installer-linux-x86_64.sh
```
> 我这里还需要安装unzip来解压

报错：
```shell
CMake Error at CMakeLists.txt:152 (project):
  No CMAKE_CXX_COMPILER could be found.

ERROR: /root/.cache/bazel/_bazel_root/6c21b8ebf1f705e1db35b57fa8432459/external/com_google_protobuf/BUILD:69:11: Compiling src/google/protobuf/arenastring.cc failed: (Exit 1): gcc failed: error executing command /usr/bin/gcc -U_FORTIFY_SOURCE -fstack-protector -Wall -Wunused-but-set-parameter -Wno-free-nonheap-object -fno-omit-frame-pointer -g0 -O2 '-D_FORTIFY_SOURCE=1' -DNDEBUG -ffunction-sections ... (remaining 32 argument(s) skipped)
```
解决方案：
重新安装gcc及相关工具
```shell
sudo dnf group install "Development Tools"
```
再次验证
```shell
[root@curveadm curve]# gcc --version
gcc (GCC) 8.5.0 20210514 (Red Hat 8.5.0-15)
Copyright (C) 2018 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```
报错：有关bazel 和protoc
```shell
ERROR: /home/curve/source-curve/curve/proto/BUILD:46:14: Generating C++ proto_library //proto:topology_proto failed: (Exit 1): protoc failed: error executing command bazel-out/k8-opt-exec-2B5CBBC6/bin/external/com_google_protobuf/protoc '--cpp_out=bazel-out/k8-dbg/bin' '-Iproto/topology.proto=proto/topology.proto' '-Iproto/common.proto=proto/common.proto' ... (remaining 4 argument(s) skipped)
```
尝试安装下protobuf
```shell
dnf install protobuf
```
但依然没有protoc
直接安装protoc
```shell
wget https://github.com/protocolbuffers/protobuf/releases/download/v21.9/protoc-21.9-linux-x86_64.zip
```
```shell
proto/common.proto: warning: directory does not exist.
proto/common.proto: No such file or directory
Target //tools:curvefsTool failed to build
```

```
[root@curveadm curve]# gcc --version
gcc (GCC) 8.5.0 20210514 (Red Hat 8.5.0-15)
Copyright (C) 2018 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```
继续报错protoc
```
ERROR: /home/curve/work/curve/proto/BUILD:17:14: Generating C++ proto_library //proto:common_proto failed: (Exit 1): protoc failed: error executing command bazel-out/k8-opt-exec-2B5CBBC6/bin/external/com_google_protobuf/protoc '--cpp_out=bazel-out/k8-dbg/bin' '-Iproto/common.proto=proto/common.proto' --direct_dependencies proto/common.proto ... (remaining 2 argument(s) skipped)

Use --sandbox_debug to see verbose messages from the sandbox
proto/common.proto: warning: directory does not exist.
proto/common.proto: No such file or directory
Target //tools:curvefsTool failed to build
Use --verbose_failures to see the command lines of failed build steps.
```
cd 到proto文件夹之后 chmod 755 ./*
该问题仍未解决，于是我提了个issue：
[https://github.com/opencurve/curve/issues/2086](https://github.com/opencurve/curve/issues/2086)

之后想的方法是直接从tools-v2下编译这个tool，而不是编译整个curve。
## 编译tools-v2（开发后调试）
安装golang，参考以下文章：
```shell
https://blog.csdn.net/qq_34499205/article/details/119707403
```

> 2次编译时可以将 [https://github.com/opencurve/curve/blob/master/build.sh#L94](https://github.com/opencurve/curve/blob/master/build.sh#L94) 的 make clean 和 make all 注释掉，这部分 libetcdclient.so 已经编译完成后无需重新编译。


开发完成后，在tools-v2下编译
```shell
make
```
成功之后，会生成一个/sbin/curve二进制文件，需要拷贝到curve-playgorund的docker里
```shell
docker cp /sbin/curve <container id>:/
```
然后进入该playground容器里
```shell
docker exec -it <container id> bash
```
进入docker之后，使用命令curve bs list xxx做测试，可以将tools-v2/pkg/config/template.yaml拷贝到容器中的/etc/curve/curve.yaml完成配置，也可以手动指定mdsaddr这个flag，如果是playground，就是6700端口为mds。
```shell
./curve bs list client --mdsaddr 127.0.0.1:6700
```
template.yaml内容：（如果是起的playground，不需要修改内容，直接cp到容器里的/etc/curve/curve.yaml即可）
```shell
global:
  httpTimeout: 500ms
  rpcTimeout: 500ms
  rpcRetryTimes: 1
  maxChannelSize: 4
  showError: false

curvefs:
  mdsAddr: 127.0.0.1:6700,127.0.0.1:6701,127.0.0.1:6702
  mdsDummyAddr: 127.0.0.1:7700,127.0.0.1:7701,127.0.0.1:7702
  etcdAddr: 127.0.0.1:23790,127.0.0.1:23791, 127.0.0.1:23792
  s3:
    ak: ak
    sk: sk
    endpoint: http://localhost:9000
    bucketname: bucketname
    blocksize: 4 mib
    chunksize: 64 mib
curvebs:
  mdsAddr: 127.0.0.1:6700,127.0.0.1:6701,127.0.0.1:6702
  mdsDummyAddr: 127.0.0.1:7700,127.0.0.1:7701,127.0.0.1:7702
  etcdAddr: 127.0.0.1:23790,127.0.0.1:23791, 127.0.0.1:23792
  root:
    user: root
    password: root_password
```
调试也可以直接run main，但是要加参数
```shell
/usr/local/go/bin/go build -o /private/var/folders/xd/d7cbtfq171bbt2zndtwzm57c0000gn/T/GoLand/___go_build_github_com_opencurve_curve_tools_v2_cmd_curvecli github.com/opencurve/curve/tools-v2/cmd/curvecli #gosetup
/private/var/folders/xd/d7cbtfq171bbt2zndtwzm57c0000gn/T/GoLand/___go_build_github_com_opencurve_curve_tools_v2_cmd_curvecli bs list dir --fileName=/test --mdsaddr 127.0.0.1:6700
```
但同时官方也推荐使用gdb或者delve来调试二进制文件，时间关系还没有深入学习如何使用。
## curve tool rpc 错误
```
// owner认证失败
	StatusCode_kOwnerAuthFail StatusCode = 111
```
```
// 文件不存在
	StatusCode_kFileNotExists StatusCode = 102
```
常见的rpc错误：
[statusCode:kOwnerAuthFail] 就是配置的user和password不对，可以手动指定--user xxx --password yyy也可以不指定，直接会使用curve.yaml中的root
## tools-v2的其他命令用法
```
https://github.com/opencurve/curve/tree/master/tools-v2
```
由于list dir的同时要列出其下文件的信息，因此除了调用rpc 的 `ListDir`之外，还需要对文件进行查询。在/curvefs下找到了query file的代码，照抄来再次调用rpc查询size即可。
遇到报错：（没有指定path）
```
2022/11/18 16:02:06.303711 dir.go:161: -------
2022/11/18 16:02:06.303818 dir.go:165: id:1 fileName:"RecycleBin" parentId:0 fileType:INODE_DIRECTORY owner:"root" ctime:1668242305081423
2022/11/18 16:02:06.303834 dir.go:168: /
Error: get file info fail, the error is: required flag(s) "path" not set
```
正确的命令应该是这样的：
```shell
./curve bs query file --path /RecycleBin --user root --password root_password
```

> go项目结构参考：[https://github.com/golang-standards/project-layout/blob/master/README_zh.md](https://github.com/golang-standards/project-layout/blob/master/README_zh.md)

## docker操作
docker从宿主机拷贝文件到容器
```go
docker cp /opt/test/file.txt mycontainer:/opt/testnew/
```
进入容器（进入后exit不会导致容器退出）
```go
docker exec -it <容器id> bash
```
docker中的root没有密码
## curve_ops_tool (旧的tool）
添加一个dir([https://github.com/opencurve/curve/pull/2078](https://github.com/opencurve/curve/pull/2078))
```go
./curve_ops_tool create -dirName=/dir12 -fileName=/test -userName=test -password=123
```
配置文件：[https://github.com/opencurve/curve/blob/master/conf/tools.conf](https://github.com/opencurve/curve/blob/master/conf/tools.conf)
## curve fs 问题（暂未解决）
```
root@de7603f17cf9:/# ./curve fs create fs --fsname test3
Error: dial to rpc server 127.0.0.1:6702 failed, the error is: context deadline exceeded
dial to rpc server 127.0.0.1:6701 failed, the error is: context deadline exceeded
rpc[CreateFs] is fail, the error is: rpc error: code = Internal desc = grpc: failed to unmarshal the received message proto: required field curvefs.mds.CreateFsResponse.statusCode not set
```
```
root@de7603f17cf9:/# ./curve fs list copyset
Error: rpc[ListCopysetInfo] is fail, the error is: rpc error: code = Unimplemented desc = [172.17.0.2:6700][E1002]Fail to find method on `/curvefs.mds.topology.TopologyService/ListCopysetInfo'
```
