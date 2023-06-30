---
layout: default
title: 2023/06/28 pprof检测go程序运行状态
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---


```shell
goroutine 20 [chan send]:
main.funcB(0x0?)
	/Users/sindweller/Documents/work/isMemoryLeak/main.go:27 +0x9c
created by main.main
	/Users/sindweller/Documents/work/isMemoryLeak/main.go:36 +0x76
```

对应代码

```go
func funcB(ch chan int) {
	defer fmt.Println("funcB is over")
	time.Sleep(10 * time.Second)
	for i := 0; i < 6; i++ {
		ch <- i // 这是27行
	}
}
```

```go
func main() {
	go http.ListenAndServe("0.0.0.0:6060", nil)

	ch := make(chan int)
	// 启动 funcB 协程
	go funcB(ch) // 这是36行

	// 启动 3 个 funcA 协程
	for i := 0; i < 3; i++ {
		go funcA(ch)
	}

	// 等待所有协程结束
	//time.Sleep(15 * time.Second)
	select {}
}
```


# pprof

```shell
sindweller@xindeweiladeMacBook-Pro myworks % go tool pprof -http=:6888 p
prof.___go_build_AAaaaa.goroutine.001.pb.gz
Serving web UI on http://localhost:6888
Failed to execute dot. Is Graphviz installed?
exec: "dot": executable file not found in $PATH
Failed to execute dot. Is Graphviz installed?
exec: "dot": executable file not found in $PATH
```

# 可视化工具

`brew install graphviz`

