---
layout: default
title: 2022/12/05 LeetCode 2. 两数相加
author: sindweller <sindweller5530@gmail.com>
tags: [LeetCode]
---

# 题目
https://leetcode.cn/problems/add-two-numbers/description/
## 思路
题目给出的其实已经是倒序了，方便我们从头节点开始遍历，然后相加算进位。于是按部就班地遍历，同时carry变量记录进位的数值

```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func addTwoNumbers(l1 *ListNode, l2 *ListNode) *ListNode {
   res := new(ListNode)
	tail := res
	ll1 := l1
	ll2 := l2
	carry := 0
	for ll1 != nil || ll2 != nil {
		sum := 0
		if ll1 != nil {
			sum += ll1.Val
			ll1 = ll1.Next
		}
		if ll2 != nil {
			sum += ll2.Val
			ll2 = ll2.Next
		}
		sum += carry
		sum, carry = sum%10, sum/10
		fmt.Println(sum, carry)
		tail.Next = &ListNode{Val: sum}
		tail = tail.Next
	}
	if carry > 0 {
		tail.Next = &ListNode{Val: carry}
	}
	return res.Next
}
```

虽然提交通过了，但是显示用时和存储空间都很差劲，看了一下别人的代码，思路基本也就是这样。  
于是重新提交了几次，发现每次的用时还不一样，很迷惑。有的时候20ms，有的时候8ms。
