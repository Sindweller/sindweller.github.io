---
layout: default
title: 2022/11/04 LeetCode 754. 到达重点数字
author: sindweller <sindweller5530@gmail.com>
tags: [LeetCode]
---

## **754. 到达终点数字**

[https://leetcode.cn/problems/reach-a-number/](https://leetcode.cn/problems/reach-a-number/)

> 在一根无限长的数轴上，你站在0的位置。终点在target的位置。
> 你可以做一些数量的移动 numMoves :
> - 每次你可以选择向左或向右移动。
> - 第 i 次移动（从  i == 1 开始，到 i == numMoves ），在选择的方向上走 i 步。
> 给定整数 target ，返回 _到达目标所需的 **最小 **移动次数(即最小 numMoves ) _。

> **输入:** target = 2 **输出:** 3 **解释:** 第一次移动，从 0 到 1 。 第二次移动，从 1 到 -1 。 第三次移动，从 -1 到 2 。

## 思路

首先统一向左还是向右，将target转为绝对值，一律按数轴向右移动处理： `t := int(math.Abs(float64(targer)))`

每次移动i步，即第一次移动1步，第二次移动2步……那么大概率累加i之后会超出target，很难正好累加就是target。

那么如何通过往回走n步（进退调整）来抵达target？

先设累加i之后一共走了moved步，如果将其中的一次移动改为回退，+i变成-i，那么相对于累加，回退一个i会导致最后moved结果相差 `-2*i`（因为由+变-，损失+的i和-的i一共两个）。

无论需要回退几个i才能抵达target，target都会与累加的moved差出 2*n 步（n就是多次回撤的步数总和）。

我们的i从1开始累加，第一次达到 `moved>=target`或是 moved比target多一个偶数  （即 `(moved-target) % 2 == 0`)时，就说明通过我们**进退调整**成功抵达了target。返回当前i，即是**最小移动次数**。

## 代码

```go
func reachNumber(target int) int {
    moved := 0
    i := 0
    t := int(math.Abs(float64(target)))
    for moved < t || (moved - t) % 2 != 0{
        i++
        moved = moved + i
    }
    return i
}
```
