---
layout: default
title: 2022/12/11 net/http/pprof路由多重注册问题
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---

## 概述
有这样一段代码：

```go
package main

import (
	"log"
	"net/http"
	"net/http/pprof"
)

func main() {
	http.HandleFunc("/", index)
	http.HandleFunc("/debug/pprof/", pprof.Index)
	http.HandleFunc("/debug/pprof/profile", pprof.Profile)
	http.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	http.HandleFunc("/debug/pprof/trace", pprof.Trace)
	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal(err)
	}
}
func index(w http.ResponseWriter, r *http.Request) {
	return
}
```

在执行时会报错：

```shell
panic: http: multiple registrations for /debug/pprof/
```

表明是同一个路由注册了多次，但是main函数中确实只注册了一次。在debug的时候发现：

首先这个 `http: multiple registrations for /debug/pprof/` 报错是来源于：
```shell
http.(*ServeMux).Handle (server.go:2503) net/http
```

这里的这段代码：

```go
	if _, exist := mux.m[pattern]; exist {
		panic("http: multiple registrations for " + pattern)
	}
```

检查mux.m变量的值：

![debug](/assets/debug1.png)

发现这些路由已经注册好了（此时断点打在/debug/pprof/的这行注册代码上，后面的还没有执行）。那么一定是除main函数之外已经做了这些路由的注册操作，而且在函数调用中没有找到，大概率是import包时的init操作。

进一步进入net/http/pprof包查看，发现以下代码：

```go
func init() {
	http.HandleFunc("/debug/pprof/", Index)
	http.HandleFunc("/debug/pprof/cmdline", Cmdline)
	http.HandleFunc("/debug/pprof/profile", Profile)
	http.HandleFunc("/debug/pprof/symbol", Symbol)
	http.HandleFunc("/debug/pprof/trace", Trace)
}
```

而我们的main函数也确实引用了这个包 
```go
import (
	"log"
	"net/http"
	"net/http/pprof"
)
```
所以在引入包时已经init了一遍，我们main函数中又注册了一遍路由，属于重复注册。

解决方案：只要引入这个包就好了，不需要额外注册：

```go
import "net/http/pprof"
var _ = pprof.Index
```

这里还发现了一个挺有意思的文章，说init中的pprof相关路由被干掉了：
https://juejin.cn/post/6959781724985229326