---
layout: default
title: 2023/07/25 yapi docker部署过程与mongo持久化挂载问题
author: sindweller <sindweller5530@gmail.com>
tags: [A工具]
---

## 概述

通过docker形式部署yapi，需要准备一个mongodb，然后直接在一个空文件夹里写好Dockerfile，其中通过wget下载yapi的zip包。

基本按照这篇文章：https://www.modb.pro/db/149666 来处理即可

## 1. 准备mongodb

首先创建MongoDB的数据卷

`docker volumn create mongo_data`

把mongodb的docker 跑起来, --auth 表示需要密码才能访问

```shell
docker run -d --name mongodb -p 27017:27017 -v /usr/local/mongo_data/db:/data/db -v /usr/local/mongo_data/configdb:/data/configdb mongo:4.2 --auth
```


> 注意 原文中启动mongo的容器是这样的
> ```shell
> docker run -d --name mongo -p 27017:27017 -v mongo_data:/data mongo:4.2 --auth
> ```  
> 但是这并不能让data中的文件持久化到宿主机上，原因见后节分析。


这个mongo:4.2就是镜像名+tag，也可以直接写mongo，就是拉取最新latest。

然后进入mongodb的docker进行一些admin的用户配置：（以下全部照抄前文所述的文章里的步骤）

`docker exec -it <docker-id> mongo admin`

创建一个用户admin

`db.createUser({user:'admin',pwd:'123456',roles:[{role:'userAdminAnyDatabase',db:'admin'}]});`

登陆db

`db.auth("admin","123456")`

授予root角色

`db.grantRolesToUser("admin", [{role:"root",db:"admin"}])`

然后mongodb的操作就结束了，接下来是准备部署yapi


## Docker部署yapi

现在开始打镜像！找到一个空文件夹里写一个Dockerfile即可，如下。

```yaml
FROM node:12-alpine as builder
WORKDIR /yapi
RUN apk add --no-cache wget make
ENV VERSION=1.12.0
RUN wget https://github.com/YMFE/yapi/archive/refs/tags/v${VERSION}.zip
RUN unzip v${VERSION}.zip && mv yapi-${VERSION} vendors
RUN cd /yapi/vendors && npm install --production --registry https://registry.npm.taobao.org

FROM node:12-alpine
ENV TZ="Asia/Shanghai"
WORKDIR /yapi/vendors
COPY --from=builder /yapi/vendors /yapi/vendors
RUN mv /yapi/vendors/config_example.json /yapi/config.json
EXPOSE 3000
ENTRYPOINT ["node"]
```

构建镜像

`docker build -t harbor.xxx.com/yapi:v1.0 .`

推送镜像(如果仅需在本地跑不需要，建议备份)

`docker push harbor.xxx.com/yapi:v1.0`

本地准备好一个配置文件config.json，待会儿会挂载到容器里使用，这样比打进镜像里来说更灵活一些。

(这个db的servername最好写成具体的ip，起码是网络里能连接到的，直接写127.0.0.1好像有问题)

另外就是mongodb的用户名和密码跟前边设定的保持一致。

```json
{
  "port": "3000",
  "adminAccount": "admin@admin.com",
  "timeout":120000,
  "db": {
    "servername": "127.0.0.1",
    "DATABASE": "yapi",
    "port": 27017,
    "user": "admin",
    "pass": "123456",
    "authSource": "admin"
  },
  "mail": {
    "enable": true,
    "host": "abc.com",
    "port": 465,
    "from": "abc@abc.com",
    "auth": {
      "user": "abc@abc.com",
      "pass": "abc"
    }
  }
}
```

注意在config.json的当前文件夹下执行（因为命令里会包括$PWD）：

首先初始化

```shell
docker run -it --rm \
--entrypoint npm \
--workdir /yapi/vendors \
-v $PWD/config.json:/yapi/config.json \
yapi run install-server
```

会看到以下内容：

```shell
....
初始化管理员账号成功,账号名："admin@admin.com"，密码："ymfe.org"
```

然后启动yapi，尽量换个名字，可能yapi这个名字冲突了

```shell
docker run -d --name yapi-server \
--workdir /yapi/vendors \
-p 5000:3000 \
-v $PWD/config.json:/yapi/config.json \
yapi server/app.js
```

可以看到以下日志输出

```shell
log: -------------------------------------swaggerSyncUtils constructor-----------------------------------------------
log: 服务已启动，请打开下面链接访问:
http://127.0.0.1:3000/
log: mongodb load success...
```

然后访问3000即可。

## 持久化mongo数据

### 以下操作不能同步/data/db内的文件到宿主机

挂载卷

```shell
-> # docker volume inspect mongo_data
[
    {
        "CreatedAt": "2023-07-25T17:36:05+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/mongo_data/_data",
        "Name": "mongo_data",
        "Options": null,
        "Scope": "local"
    }
]
```

可以发现这个用的宿主机路径为/var/lib/docker/volumes/mongo_data/_data

切换到路径上，可以看到确实有两个跟mongo的/data相同的文件夹

```shell
root@cloud-virtual-machine [11:30:46 AM] [/var/lib/docker/volumes/mongo_data/_data]
-> # pwd
/var/lib/docker/volumes/mongo_data/_data
root@cloud-virtual-machine [11:30:47 AM] [/var/lib/docker/volumes/mongo_data/_data]
-> # ls
configdb/  db/
```

但是进入子目录会发现什么都没有

```shell
root@cloud-virtual-machine [11:30:48 AM] [/var/lib/docker/volumes/mongo_data/_data]
-> # cd db
root@cloud-virtual-machine [11:31:13 AM] [/var/lib/docker/volumes/mongo_data/_data/db]
-> # ls -l
total 0
```

但是挂载了该卷的容器内是有东西的

```shell
-> # docker exec -it 97f6c5df69db bash
root@97f6c5df69db:/# cd /data/
root@97f6c5df69db:/data# ls
configdb  db
root@97f6c5df69db:/data# cd db/
root@97f6c5df69db:~# ls
WiredTiger				collection-17--2171366465605763899.wt  collection-76--2171366465605763899.wt  index-107--2171366465605763899.wt  index-3--2171366465605763899.wt   index-50--2171366465605763899.wt  index-69--2171366465605763899.wt  index-91--2171366465605763899.wt
WiredTiger.lock				collection-19--2171366465605763899.wt  collection-77--2171366465605763899.wt  index-12--2171366465605763899.wt	 index-30--2171366465605763899.wt  index-53--2171366465605763899.wt  index-73--2171366465605763899.wt  index-92--2171366465605763899.wt
WiredTiger.turtle			collection-2--2171366465605763899.wt   collection-8--2171366465605763899.wt   index-13--2171366465605763899.wt	 index-31--2171366465605763899.wt  index-54--2171366465605763899.wt  index-75--2171366465605763899.wt  index-93--2171366465605763899.wt
WiredTiger.wt				collection-4--2171366465605763899.wt   collection-88--2171366465605763899.wt  index-15--2171366465605763899.wt	 index-33--2171366465605763899.wt  index-55--2171366465605763899.wt  index-78--2171366465605763899.wt  index-96--2171366465605763899.wt
WiredTigerLAS.wt			collection-45--2171366465605763899.wt  diagnostic.data			      index-20--2171366465605763899.wt	 index-36--2171366465605763899.wt  index-56--2171366465605763899.wt  index-79--2171366465605763899.wt  index-97--2171366465605763899.wt
_mdb_catalog.wt				collection-46--2171366465605763899.wt  index-1--2171366465605763899.wt	      index-21--2171366465605763899.wt	 index-38--2171366465605763899.wt  index-59--2171366465605763899.wt  index-80--2171366465605763899.wt  journal
collection-0--2171366465605763899.wt	collection-49--2171366465605763899.wt  index-10--2171366465605763899.wt       index-22--2171366465605763899.wt	 index-40--2171366465605763899.wt  index-6--2171366465605763899.wt   index-82--2171366465605763899.wt  mongod.lock
collection-100--2171366465605763899.wt	collection-51--2171366465605763899.wt  index-101--2171366465605763899.wt      index-23--2171366465605763899.wt	 index-42--2171366465605763899.wt  index-60--2171366465605763899.wt  index-84--2171366465605763899.wt  sizeStorer.wt
collection-103--2171366465605763899.wt	collection-52--2171366465605763899.wt  index-102--2171366465605763899.wt      index-25--2171366465605763899.wt	 index-47--2171366465605763899.wt  index-63--2171366465605763899.wt  index-85--2171366465605763899.wt  storage.bson
collection-11--2171366465605763899.wt	collection-72--2171366465605763899.wt  index-105--2171366465605763899.wt      index-26--2171366465605763899.wt	 index-48--2171366465605763899.wt  index-64--2171366465605763899.wt  index-86--2171366465605763899.wt
collection-16--2171366465605763899.wt	collection-74--2171366465605763899.wt  index-106--2171366465605763899.wt      index-29--2171366465605763899.wt	 index-5--2171366465605763899.wt   index-68--2171366465605763899.wt  index-9--2171366465605763899.wt
```

也就是说，挂载卷与对应容器路径内的文件并不同步。

## 问题分析与解决

考虑两个方向，一是权限问题，无法写入，而是挂载点冲突，导致挂载configdb和db之后，宿主机目录和docker内的目录其实是两个不相干的环境。

1. 考虑是否是权限问题？

```shell
root@cloud-virtual-machine [11:38:24 AM] [/var/lib/docker/volumes/mongo_data]
-> # ls -l
total 4.0K
drwxr-xr-x 4 root root 4.0K 2023-08-01 11:14 _data/
```

但是docker容器是root启动的啊。

2. 考虑挂载点冲突问题
   
找到了一个非常类似的问题：https://forums.balena.io/t/container-volume-can-not-in-sync-with-host-os-volume/17339

根据这个问题中的解决思路，去dockerhub查找一下mongo4.2的Dockerfile：

https://hub.docker.com/layers/arm64v8/mongo/4.2.6/images/sha256-25821e16c7c401986caa09fba3be08b103203a1599edaba8cd34366903b4b3e6?context=explore

可以看到其中有一层是这个挂载：

```yaml
VOLUME [/data/db /data/configdb]
```

跟回答问题的老哥说的比较相符：

> it seems like you define /data/db and /data/configdb as volumes (https://github.com/andresvidal/rpi3-mongodb3/blob/master/Dockerfile#L28 11). This means that docker will create a new volume on run that holds the data that was specified in the Dockerfile (https://docs.docker.com/engine/reference/#volume 5). So the resin-data volume is mounted at /data and there are two new mount points at /data/db and /data/configdb.
>
也就是说，在Dockerfile中，已经指定了/data/db和/data/configdb作为卷（volume），docker在运行容器的时候会为此创建一个新的卷，用于存储这两个目录，因此我们设定的mongo_data卷会被挂载到data，而其下的db和configdb是两个与此有别的挂载点。

表现为mongo_data中只包含/data下的configdb和db文件夹，而这两个文件夹中的内容已经被挂载到了另外的卷上，所以并不会同步到mongo_data中。

综上所述，如果要挂载到本地的话，就直接指定/data/db和/data/configdb，不要指定/data。

查看原mongo容器的挂载点：

```shell
 "Mounts": [
            {
                "Type": "volume",
                "Name": "mongo_data",
                "Source": "/var/lib/docker/volumes/mongo_data/_data",
                "Destination": "/data",
                "Driver": "local",
                "Mode": "z",
                "RW": true,
                "Propagation": ""
            },
            {
                "Type": "volume",
                "Name": "438a9fc537cfcf0848c57ef695a48212660c204738ebfd9dd9f2b5c30b1880a6",
                "Source": "/var/lib/docker/volumes/438a9fc537cfcf0848c57ef695a48212660c204738ebfd9dd9f2b5c30b1880a6/_data",
                "Destination": "/data/configdb",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            },
            {
                "Type": "volume",
                "Name": "1204f82b87721509bfb996e36b0d0ab6e9cd1a37fe81ec78284fa50c6f369f43",
                "Source": "/var/lib/docker/volumes/1204f82b87721509bfb996e36b0d0ab6e9cd1a37fe81ec78284fa50c6f369f43/_data",
                "Destination": "/data/db",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            }
        ],
```

可以验证除了mongo_data外还分别挂载了/db和/configdb到两个其他的地方。



## mongodb操作

mongodb数据备份 注意要指定--authenticationDatabase，否则默认的是什么SHA256的方式，会报错。

```shell
mongodump --username admin --password mypassword --authenticationDatabase admin --db mydatabase --out ./backup
```

mongo备份还原

```shell
mongorestore -u admin --password 123456 --authenticationDatabase admin --db yapi /backup1053/yapi
```
