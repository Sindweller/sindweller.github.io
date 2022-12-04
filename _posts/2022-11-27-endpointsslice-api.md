---
layout: default
title: 2022/11/27 大规模pod实践 【阅读笔记】
author: sindweller <sindweller5530@gmail.com>
tags: [云原生]
---

原文地址： https://mp.weixin.qq.com/s/hgU0Y7t-Bmt4MaHsKyEfSw 

本文是学习该文过程中的笔记。

## 概述

K8s中，pod是最小的**调度单元**，应用程序在pod中运行。在资源分配方面，一般只会给pod设置有限的资源。当大流量来临时，通过水平扩容（增加pod数量）的方法来进行应对。  
网络方面，每个pod都有自己唯一的ip，但pod的ip也不固定。如何及时追踪到pod的ip从而实现负责均衡？在k8s的Endpoints Api中提供了一种跟踪网络端点的方法。  
但若是数量过大，endpoints api与pod数量不断增加，endpoints api会成为性能瓶颈。  
为了解决这个问题，在k8s v1.21版本中，采用切片的方式，引入对Endpointslice api的支持，来解决endpoints api在处理大量网络端点时的局限性。并提供可扩展和可伸缩能力。  

### endpoint成为性能瓶颈的原因

pod数量越多，endpoints api这个资源也会越大，在pod变化时，会传递整个endpoints api资源。

### endpointslice如何解决性能瓶颈

假设pod扩容至1000个，那么将其伸缩为10个endpointslice，每个endpointslice存放100个网络端点，pod变化时只会传递一小块endpointslice api资源。
## k8s中如何访问应用
应用跑在pod里，每个pod都有自己唯一的ip地址。一般会为一组pod建立一个service，该service通过selector与该组pod相关联，提供相同的DNS名，这样就可以在pod间负载均衡。k8s集群内不同的app之间可以通过DNS相互访问。

如果在service创建时，没有定义selector字段，就不会自动创建endpoints。

> selector可以用于指定k8s资源的标签从而实现过滤、关联指定的pod等功能。


## Endpoints概念
与service的关联：k8s中的一个资源对象，存储在etcd中，记录一个service对应一组pod的访问地址。service和endpoint资源是一对一的。
endpoints的功能：endpoints资源负责观测pod集合，只要service中的某个pod发生变更，endpoint也会同步更新。

示例：

```
$ kubectl get endpoints httpbin
NAME      ENDPOINTS                                      AGE
httpbin   10.1.36.125:80,10.1.36.131:80,10.1.36.133:80   23d
```

这个endpoints资源就记录了3个pod分别对应的ip。

endpoints存在的一些问题：
1. 容量限制，如果ep资源中的端口个数超过1000，则ep会通过控制器将其截断为1000
2. ep存储了每个pod的ip等网络信息，多个pod导致ep资源变得非常巨大，且其中一个端点变更，整个ep资源都要做更新。如果更新非常频繁，就会导致到处传递一个非常巨大的api资源，产生大量网络流量和额外处理消耗，降低了k8s组件的性能。
   
### Endpointslices概念

endpointslices是对ep的扩展，同时可以代替ep，缓解处理大量网络端点带来的问题。（在k8s v1.21+ 版本支持）

eps将对ep进行切分，一般单个eps资源最多只包含100个端点，这个最大值可以通过 `kube-controller-manager` 的 `--max-endpoints-per-slice` 标志来设置，最大是1000，等同于eps。

假设后端有2000个pod，如果设置为每个endpointslices存储100端点，最终将得到2000/100=20个eps。pod进行增删变动时，只需要更新其中1个eps的资源即可。不需要消耗传递包含1000个端点的巨大资源。

同时，也不需担心etcd存储中对对象的大小限制。

## 对比总结

Endpoints适用于：
- pod数量较少的弹性伸缩场景，传递ep不会消耗过多网络资源和额外处理。
- 没有弹性伸缩需求，pod数量也不多的场景。因为即使pod数量固定，也会在更新或故障时更新ep资源。

Endpointslice适用于：
- pod数量较多（>10^2+)且有弹性伸缩的场景。
- pod数量非常多，超过1000部分的后端必须用eps

## APISIX实践

APISIX Ingress Controller 可以将用户配置的crd路由规则转换为Apache APISIX中的规则。通过这种方式，用户配置crd后使用APISIX完成具体的流量分割。

其具体实现过程：
- 创建一个 httpbin app，并为其创建20个pod副本。具体deploy文件如下：(htppbin-deploy.yaml)
  
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin-deployment
spec:
  replicas: 20
  selector:
    matchLabels:
      app: httpbin-deployment
  strategy:
    rollingUpdate:
      maxSurge: 50%
      maxUnavailable: 1
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: httpbin-deployment
    spec:
      terminationGracePeriodSeconds: 0
      containers:
        - livenessProbe:
            failureThreshold: 3
            initialDelaySeconds: 2
            periodSeconds: 5
            successThreshold: 1
            tcpSocket:
              port: 80
            timeoutSeconds: 2
          readinessProbe:
            failureThreshold: 3
            initialDelaySeconds: 2
            periodSeconds: 5
            successThreshold: 1
            tcpSocket:
              port: 80
            timeoutSeconds: 2
          image: "kennethreitz/httpbin:latest"
          imagePullPolicy: IfNotPresent
          name: httpbin-deployment
          ports:
            - containerPort: 80
              name: "http"
              protocol: "TCP"

---

apiVersion: v1
kind: Service
metadata:
  name: httpbin
spec:
  selector:
    app: httpbin-deployment
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 80
  type: ClusterIP
```

可以看到 `replicas: 20` 这个配置指定了副本的数量。而Service资源中的
```
selector:
    app: httpbin-deployment
```
则对应上节所述的使用selector关联service与pod。这样就将这个service指向对应app的deploy。
- 启动APISIX（推荐通过helm chart）时，通过 `--set ingress-controller.config.kubernetes.watchEndpointSlice=true` 来开启对eps特性的支持。（这样就不用关注`--max-endpoints-per-slice`所设定的值，也可以避免etcd无法存储过大的配置而造成配置丢失）
- 配置一个ApisixRoute类型的资源让APISIX进行代理，例如如下这个配置（无论是ep还是eps都是同样的配置）

```
apiVersion: apisix.apache.org/v2
kind: ApisixRoute
metadata:
  name: httpbin-route
spec:
  http:
  - name: rule
    match:
      hosts:
      - httpbin.org
      paths:
      - /get
    backends:
       - serviceName: httpbin
         servicePort: 80
```
- 使用apisix的pod，通过admin api请求来验证APISIX的upstream对象确实包含这20个pod的ip地址
```
kubectl exec -it ${Pod for APISIX} -n ingress-apisix -- curl "http://127.0.0.1:9180/apisix/admin/upstreams" -H 'X-API-KEY: edd1c9f034335f136f87ad84b625c8f1'
```
得到的json中重点查看nodes.nodes字段：
```
"nodes": [
            {
                "weight": 100,
                "host": "10.1.36.100",
                "priority": 0,
                "port": 80
            },
            {
                "weight": 100,
                "host": "10.1.36.101",
                "priority": 0,
                "port": 80
            },
            ...
            ]
```
nodes里面的信息与eps中的网络端点相对应，如下。

eps里的信息：
```
addressType: IPv4
apiVersion: discovery.k8s.io/v1
endpoints:
- addresses:
  - 10.1.36.92
  ...
kind: EndpointSlice
metadata:
  labels:
    endpointslice.kubernetes.io/managed-by: endpointslice-controller.k8s.io
    kubernetes.io/service-name: httpbin
  name: httpbin-dkvtr
  namespace: default
ports:
- name: http
  port: 80
  protocol: TCP
```
