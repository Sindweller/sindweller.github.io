---
layout: default
title: 2022/12/04 golang基础 【学习笔记】
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---

## Go的优势
- 编译高效
- 支持高并发
- 面向垃圾回收
- 依赖管理清晰
- 不支持继承，无需定义不同类型之间的关系
- 协程可以充分利用多核计算机性能

## Go不支持的特性

- 不支持函数重载（免去比对参数），操作符重载
- 不支持隐式转换，必须显式转换，避免类似导致b站崩溃的lua语言bug
- 没有类的概念，没有继承，支持接口抽象
- 不支持动态加载代码
- 不支持动态链接库，一个程序编译出来就不需要依赖而运行，包会大一些（所有依赖编译进同一个二进制文件），也就是用空间换时间。
- 没有异常机制，不需要考虑exception之间的继承关系，有recover和panic（恢复和崩溃）机制

## Go的环境

- goroot go的安装目录
- gopath 存放代码的路径
   - src 源码
   - pkg 依赖包
- GOOS GOARCH, go支持交叉编译，指定是为哪个系统编译

## Go的指令

- fmt 代码风格应该是一致的，使用go fmt格式化代码
- build 编译，一般需要指定输出目录： `go build -o bin/mybin .`
- 编译时使用环境变量设置编译操作系统和CPU架构： `GOOS=linux GOARCH=amd64 go build`如果编译linux但用mac执行编译出来的二进制文件，会显示错误： `zsh: exec format error: ./bin/helloworld`
- 整个程序的入口： package main 的main方法。构建时会去寻找这个方法。
- test Go原生自带测试 使用go test ./... -v 执行所有指定目录下的测试。`go test`命令会扫描所有 `*_test.go`（也就是所有以 `_test`结尾的go文件）并执行,这样可以验证各种场景下（各种测试用例）函数功能是否正常。
   - 一般把test和正式代码放在相同的目录下，这样私有变量（小写）都可以访问到
   - test function的入参规定为 `(t *testing.T)`
- vet 代码静态检查，提前发现潜在的bug或者可疑的构造，例如类型不匹配、冗余表达式、无法被执行的代码、没有及时检查err导致defer的对象为空。能检查出来可以编译通过的错误。
## 控制语句

- switch中的fallthrough 当满足这个case时，执行下一个case，如果不写这个，不会自动执行下一个case
- for 中如果遍历元素：for _, v := range arr 变量v的内存地址不变；
- 如果用for range遍历指针数组，则value取出的指针地址为原指针地址的拷贝。
## 切片
切片是对数组连续片段的引用，相当于数组的子集。  
不定义长度的数组定义就是切片 如 var aaa []type  
切片未初始化之前为nil，长度为0  
从切片中删除一个元素： 需要自己写一个方法，把指定下标之前的切片和之后的切片拿出来并重新组合  
如果用_, v:=range arr遍历，修改v的值，是不会反映到arr上的。需要通过下标修改  
索引范围：左包围右部包围  
1.18之前的切片扩容机制与之后的有所不同  
1.18之后 growth factor是从2.0往下降的，主要为了节省内存  
## make new
new 返回指针地址
make 可预设内存空间 避免未来的内存拷贝 返回第一个元素
## map
函数可以作为变量在map定义的时候作为value给出，如：
```
map[string]func()int{"funcA": func() int{return 1}}
f := f["funcA"]
fmt.Println(f()) // 调用这个函数
```
## 结构体与指针
指针：指向内存地址  
结构体标签：tag可选，例如 `json:"name"` 用 ``括起来；  
使用场景：k8s APIServer对资源的定义都有json标签和protobuf标签
```shell
NodeName string `json:"nodeName,omitempty" protobuf:"bytes,10,opt,name=nodeName"`
```
通过反射机制来获取某一个变量的tag
```shell
mt := MyType{Name: "test"}
myType := reflect.TypeOf(mt) // 获取类型
name := myType.Field(0) // 获取结构体第一个属性
tag := name.Tag.Get("json") // 获取tag中json对应的值
```
实现枚举变量：
类型重命名 
```go
type ServiceType string
const(
    ServiceTypeClusterIPS ServiceType = "ClusterIP"
    ServiceTypeNodePort ServiceType = "NodePort"
    )
```
通过反射机制返回被检查对象的值：
```go
v := reflect.ValueOf(myStruct)
//遍历对象属性
for i := 0; i<v.NumField();i++{
    // 直接打印的话是指针地址
    }
//遍历对象方法
for i:=0;i<v.NumMethod();i++{
    }
// 调用方法
v.Method(0).Call()
```
## 入参
go的main函数没有类似java的[]string args参数，是通过os或者flag来获取
获取参数的方法：
```go
fmt.Println(os.Args())
```
或者
```go
name := flag.String("name", "value", "usage xxx") // --name xxx
flag.Parse()
fmt.Println(*name)
```
## init 函数
会在包初始化时运行，执行顺序是const->var->init()->main()  
先从main包中找import pkg1就会跳到pkg1上把所有import的init()都给初始化完。  
如果多个依赖项引用同一项目，被引用项目的初始化在init()中完成，且不可重复运行时，会导致启动错误。  
被依赖的包重的init()只会执行一次，如果多个包引用同一包，也只会执行一次  
## 传参可变长度
类型前加...即是可变长度
```go
func A(a int, b ...int){
    }
```
典型例子：
```go
func append(slice []Type, elems ...Type) []Type
myarr := []string{}
myarr = append(myarr, "a", "b", "c") // 这里可以加多个
```

## 回调函数
应用：函数作为参数传入其他函数，其他函数内部调用这个函数并执行
## 闭包
匿名函数，没有声明部分，不能独立存在，一般在其他函数内部声明，可以赋值给其他的变量，在定义时后面()直接运行。
应用：
```go
defer func(){
    if r := recover();r != nil{
        println("recovered")
        }()
```
## 方法
作用在接受者上的函数，例如定义一些对象的行为。函数需要的上下文保存在recv中，通过定义recv方法，直接访问recv的属性，减少在入参部分传递参数。
```go
func (recv receiverType) methodName(params)(returnValueList)
```
## 函数调用传值
go都是传值，如果传指针变量，在函数内部修改指针变量的值，那么外部也会跟着变。go会复制这个指针地址，指向同一块内存，其实是修改了内存，外面来看也是发生了变化。  
传递指针地址不涉及值拷贝，性能高一些。  
如果传递struct，那么临时变量在函数结束后就可以被回收了。对gc更友好。
## 接口
struct无需显式声明实现interface，只需要实现它的方法。struct还可以实现其他方法。  
go的多重继承：一个类型可以实现多个接口。  
go的接口里面没有属性  
接口可以嵌套  
应用：  
例如定义一个接口数组 []IF{}  
那么实现了这个接口的方法的struct都可以放进去，go可以判断接口数组里的元素类型，可以调用对应struct的方法  
注意interface可以为nil所以针对interface的使用一定要判空，否则会引起panic  
struct初始化意味着空间分配，对struct的引用不会出现空指针。

## 可见性控制
大写开头变量 常量 函数 接口 结构等 可以被其他包引用  
小写开头只能当前包引用 所以单测代码跟主代码要放在一起  
## 继承
可以组合，嵌套struct来继承
## 多态
定义接口，可以塞不同的struct，调用元素函数时可以调用对应struct的具体方法实现。
## json编解码

- Unmarshal string到struct 反序列化
- Marshal struct到string 序列化

这个包本身使用map[string]interface{}和[]interface{}类型保存任意对象，所以反序列化完了可以断言为.(map[string]interface{})
## 错误处理
利用error接口定义错误，没有exception机制。  
app自定义error归类，例如，k8s定义了与apiserver交互的不同类型错误：
```go
type StatusError struct{
    ErrStatus metav1.Status // 错误码+错误信息等在这个结构体里维护
    }
var _error = &StatusError{}

// 实现Error方法
func (e *StatusError) Error() string{
    return e.ErrStatus.Message // 返回结构体里面的err信息
}
```

## defer
遇到defer会压栈，是倒序出的。当函数结束时defer生效。  
所以如果在for循环里加解锁，建议将for循环内的执行语句写为闭包（匿名函数），这样让每次循环到下一个之前就执行defer。避免defer lock.Unlock()一直没执行导致死锁。
```go
func main() {
	lock := sync.Mutex{}
	for i := 0; i < 3; i++ {
		go func(i int) {
			lock.Lock()
			defer lock.Unlock()
			fmt.Println(i)
		}(i)
	}
	time.Sleep(time.Second)
}
```
另外上面这段代码因为起协程并发了，所以哪个协程先完成是不一定的，返回的顺序也是不一的。  
例如0 1 2 / 0 2 1等输出结果都可能出现。  
defer常用场景：（有点像java里的final）

- file.Close()
- mu.Unlock()
- println("log") 打印日志
## 异常的处理

- panic 必须终止，不可恢复的错误时主动调用，panic会crash线程，panic后的所有逻辑都执行不了，但defer可以执行
- defer: 如果panic了，先执行defer内的函数，在defer的func里进行recover来恢复程序
- recover: 将函数从panic或错误场景中恢复

示例：
```go
defer func(){
    fmt.Println("defer func is called") //告诉你调用了这个defer的func
    if err := recover();err != nil{ // 如果成功恢复就没err，如果有err就恢复不起来了
        fmt.Println(err)
        }
    }() // 一个闭包，让defer在后面的代码执行前执行
panic("a panic is triggered") // 一个panic
```
## 并发和并行

- 并发 concurrency 多个事件 在同一 **时间间隔** 发生，交替运行；go可以通过轻量级线程-协程，完成高并发。
- 并行 parallellism 多个事件 在同一 **时刻** 发生

线程：共享进程内存空间：打开的文件和文件信息，地址空间和信号处理函数
go在runtime和系统调用等方面对goroutine的调度进行了封装和处理，当长时间执行或者遇到系统调用时，会主动将当前g所在p（cpu时间片）转让出去，让其他goroutine能被调度并执行。从语言层面支持协程。
### CSP模型
Communicating Sequential Process - 描述两个独立的并发实体通过共享的通讯channel进行通信的并发模型  
go协程：只在用户态维护，将一个操作系统线程分段使用，通过调度器实现协作式调度；发现堵塞后可以启动新的协程  
通道channel：免去加解锁，提升效率，通过channel（本身有加锁机制），类似unix系统的pipe，用于协程间通讯和同步。
### 协程的优势
- 协程默认占用内存比线程少（2KB vs 8MB）
- 切换开销小，线程切换涉及： 用户态->内核态，16个寄存器，PC SP等寄存器的刷新；Go只有三个寄存器修改：PC/SP/DX
- 可以控制并行线程数量：GOMAXPROCS
### 多线程通信：channel

- 有方向，一端发送，一端接收
- 同一时间只有一个协程可以访问数据，没有共享内存模式可能出现的内存竞争
```go
var chann chan dataType
// 写入
chann <- 0
// 读出
i := <-chann
```
### 通道缓冲

- channel通信是同步的
- 缓冲区满，数据写入阻塞
- 缓冲区无，数据读取阻塞 （因此可以当锁用）
- 如果缓冲区为0，则必须两边都就绪才能写入读取
- 定义单向通道（只读或只写）
```go
var sendOnly chan <- int

var readOnly <- chan int
```
通道转换：(生产者消费者）
```go
var c = make(chan int)
go prod(c)

go consume(c)

// c变成只写
func prod(ch chan <- int){
    for {
        ch <- 1
    }
}

func consume(ch <- chan int){
    for {
        <- ch
        }
    }

```
通道不需要关闭，不会泄漏资源。但是关闭通道可以告诉接受者，已经没有新数据发送。
### 遍历通道缓冲区
```go
for v := range ch{
    fmt.Println(v)
}
```
记得写入的函数要在其中关闭通道 `close(ch)`
### 多个通道（多个线程）同时运行
不知道哪个线程会就绪，需要查询哪个就绪了，轮询判断
```go
select{
    // 不断轮询是否有数据读取
    case v:= <- ch1:
        ...
    case v:= <- ch2:
        ...
    default:
        ...
}
```
如果多个通道都就绪，那么是随机选择的
## 定时器Timer
应用：为协程设置超时时间
time.Ticker以指定时间间隔向通道发送时间值
```go
timer := time.NewTimer(time.Second) // 超时为1s
	select {
	//检查普通ch是否有数据
	case <-ch:
		fmt.Println("received from ch")
	case <-timer.C:
		// 如果没有走上面而是走到这里，则说明超时
		fmt.Println("timeout")
	}
```
## 上下文Context
一些高级用法，例如超时、取消操作或一些异常情况，需要抢占操作或者中断后续操作
Context是设置截止日期、同步信号，传递请求相关值的结构体。

- context.Background 最顶层的context，常用于main init和test
- context.WithDeadline 超时时间
- context.WithValue 添加键值对
- context.WithCancel 创建一个可以取消的context
- context.WithTimeout 超时后ctx.Done()这个通道里就 有数据了
### 基于context停止子协程
```go
ctx, cancel := context.WithTimeout(context.Background(),time.Second)
defer cancel()
go process(ctx, 100*time.Millisecond)
<- ctx.Done()
fmt.Println("main: ", ctx.Err())
```
