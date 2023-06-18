---
layout: default
title: 2023/06/16 Golang内存管理
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---

# Golang 逃逸分析

由编译器决定变量分配在栈上还是堆上，它的判断操作就叫【逃逸分析】。

- 变量在退出函数后如果没有使用，就分配到栈上
- 变量在退出函数之后如果还有使用（被其他地方引用），就分配到堆上。这里的通常情况就是函数返回了对一个变量的引用，那么这个变量就会分配到堆上。但是如果没人用这个引用，编译器还是能分析出来可以分配到栈上的。
- 如果栈空间不够，还是会放到堆上
  
优先分配到栈上，因为栈上内存分配很快。栈内分配内存只需要PUSH指令，并且会自动释放。  
堆的分配速度较慢，堆分配内存需要先找到一个大小合适的内存块，还会形成【内存碎片】。另外，堆上的分配内存需要垃圾回收才能释放，并不会像栈里面的内存一样自动释放。

逃逸分析的目标就是尽量分配到栈上，减轻堆上内存分配的开销和垃圾回收的压力。

实际操作如何查看程序里的变量如何分配？ 使用 `go build -gcflags '-m -l' main.go` 命令来查看。其中：

- -m 输出编译器优化细节（包括逃逸分析）
- -N 关闭编译器优化
- -l 禁用【内联（inline）】优化，防止逃逸被编译器通过内联彻底抹除。

## 例子

```go
package main

import "fmt"

// 逃逸分析验证
func main() {
	foo()
}

func foo() *int {
	t := 3
	return &t // 返回int指针 是一个引用
}
```

输出：

```shell
sindweller@xindeweiladeMacBook-Pro escape % go build -gcflags '-m -l' main.go
# command-line-arguments
./main.go:9:2: moved to heap: t
```

这说明t一开始就被分配到了堆上，因为函数foo()返回了对t的引用。即使main函数中没有去真的使用这个返回值，编译器仍然无法确定这个函数在调用之后是否会使用，因此如果把t放在栈上，就会发生栈上的内存泄漏。

```go
package main

import "fmt"

// 逃逸分析验证
func main() {
	s := foo()
	fmt.Println(*s)
}

func foo() *int {
	t := 3
	return &t // 返回int指针 是一个引用
}
```

输出：

```shell
sindweller@xindeweiladeMacBook-Pro escape % go build -gcflags '-m -l' main.go
# command-line-arguments
./main.go:22:2: moved to heap: t
./main.go:13:13: ... argument does not escape
./main.go:13:14: *s escapes to heap
```

使用 `go tool compile -S main.go` 也可以看出newobject被使用了，这个函数是用来在堆上分配一块内存，所以也说明了t被放到了堆上

```shell
"".foo STEXT size=61 args=0x0 locals=0x18 funcid=0x0 align=0x0
        # 定义函数foo的入口点，函数名称为"".foo, ABI（Application Binary Interface）是指应用程序二进制接口
        # ABI 定义了应用程序和操作系统或者库之间的接口协议，包括函数调用规则、参数传递方式、返回值处理方式等等
        # 简而言之就是告诉操作系统如何与应用程序交互
        # 24是指函数栈的大小为24字节
        0x0000 00000 (main.go:21)       TEXT    "".foo(SB), ABIInternal, $24-0
        # 比较栈指针(SP)和R14寄存器中的值加上16的值的大小。x86-64的ABI规范中栈是由高地址向低地址增长，这次增长了16
        0x0000 00000 (main.go:21)       CMPQ    SP, 16(R14)
        # 指示PC寄存器的值和当前堆栈帧的大小。
        0x0004 00004 (main.go:21)       PCDATA  $0, $-2
        # 如果栈指针小于R14+16，则跳转到54行。
        0x0004 00004 (main.go:21)       JLS     54
        # 指示PC寄存器的值和当前堆栈帧的大小。
        0x0006 00006 (main.go:21)       PCDATA  $0, $-1
        # 在堆栈上分配24字节的空间。
        0x0006 00006 (main.go:21)       SUBQ    $24, SP
        # 将堆栈上偏移量为16的位置的值复制到基指针(BP)中。
        0x000a 00010 (main.go:21)       MOVQ    BP, 16(SP)
        0x000f 00015 (main.go:21)       LEAQ    16(SP), BP
        0x0014 00020 (main.go:21)       FUNCDATA        $0, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
        0x0014 00020 (main.go:21)       FUNCDATA        $1, gclocals·33cdeccccebe80329f1fdbee7f5874cb(SB)
        0x0014 00020 (main.go:22)       LEAQ    type.int(SB), AX
        # PC寄存器的值和当前栈帧的大小
        0x001b 00027 (main.go:22)       PCDATA  $1, $0
        0x001b 00027 (main.go:22)       NOP
        # 调用runtime.newobject函数，为int类型的变量分配内存空间。
        0x0020 00032 (main.go:22)       CALL    runtime.newobject(SB)
        # 将值3存储在AX寄存器指向的内存空间中。
        0x0025 00037 (main.go:22)       MOVQ    $3, (AX)
        # 将堆栈上偏移量为16的位置的值复制到基指针(BP)中。
        0x002c 00044 (main.go:23)       MOVQ    16(SP), BP
        # 释放堆栈上的空间。
        0x0031 00049 (main.go:23)       ADDQ    $24, SP
        # 函数返回。
        0x0035 00053 (main.go:23)       RET
        0x0036 00054 (main.go:23)       NOP
        0x0036 00054 (main.go:21)       PCDATA  $1, $-1
        0x0036 00054 (main.go:21)       PCDATA  $0, $-2
        0x0036 00054 (main.go:21)       CALL    runtime.morestack_noctxt(SB)
        0x003b 00059 (main.go:21)       PCDATA  $0, $-1
        0x003b 00059 (main.go:21)       JMP     0
        # 代码的机器码
        0x0000 49 3b 66 10 76 30 48 83 ec 18 48 89 6c 24 10 48  I;f.v0H...H.l$.H
        0x0010 8d 6c 24 10 48 8d 05 00 00 00 00 0f 1f 44 00 00  .l$.H........D..
        0x0020 e8 00 00 00 00 48 c7 00 03 00 00 00 48 8b 6c 24  .....H......H.l$
        0x0030 10 48 83 c4 18 c3 e8 00 00 00 00 eb c3           .H...........
        rel 23+4 t=14 type.int+0
        rel 33+4 t=7 runtime.newobject+0
        rel 55+4 t=7 runtime.morestack_noctxt+0
```

## go的堆栈和系统的堆栈

程序堆栈本身是操作系统层级的概念，程序会有自己的内存地址空间。栈中的自动释放其实意思是那个位置上的内存可以在下一次函数调用压栈的时候被无条件覆盖。  
对于Go程序来说，传统意义上的栈已经被运行时（调度器、垃圾回收、系统调用）消耗完了，那么对于用户态的代码来说，消耗的其实都是堆内存，构建了一个逻辑上的栈，这也造成了Go的栈内存近乎无限大（c/c++是1MB，但是Go是1GB）。  
为了解决堆上内存碎片化的问题，对于用户态go代码的栈，会在适当时候对整个栈进行深拷贝，整个复制到另一块内存区域。  
也因为这个深拷贝的操作，指针就不能进行算术运算了，因为无法确定前后指针指向的地址是否被Go运行时移动。

## Go 内联inline

inline是一个编译器优化的概念，可以将函数调用的代码直接嵌入到代码中，而不是通过函数调用来执行。

这样减少函数调用可以降低开销（栈帧的分配与回收，参数传递与返回值处理），但也会导致逃逸被抹除。

如果上面的代码inline执行，会变成这样：

```shell
sindweller@xindeweiladeMacBook-Pro escape % go build -gcflags '-m' main.go 
# command-line-arguments
./main.go:21:6: can inline foo
./main.go:12:10: inlining call to foo
./main.go:13:13: inlining call to fmt.Println
./main.go:13:13: ... argument does not escape
./main.go:13:14: *s escapes to heap
./main.go:22:2: moved to heap: t
```

## 为什么堆会有内存碎片？

