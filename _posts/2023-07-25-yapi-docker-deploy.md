---
layout: default
title: 2023/07/25 yapi docker部署过程
author: sindweller <sindweller5530@gmail.com>
tags: [工具]
---

## 概述

通过docker形式部署yapi，需要准备一个mongodb，然后直接在一个空文件夹里写好Dockerfile，其中通过wget下载yapi的zip包。

基本按照这篇文章：https://www.modb.pro/db/149666 来处理即可

## 1. 准备mongodb

首先创建MongoDB的数据卷

`docker volumn create mongo_data`

把mongodb的docker 跑起来, --auth 表示需要密码才能访问

```shell
docker run -d --name mongo -p 27017:27017 -v mongo_data:/data mongo:4.2 --auth
```

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
MAINTAINER clouditera@clouditera.com
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
