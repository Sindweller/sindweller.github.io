---
layout: default
title: 2022/12/05 LeetCode 23. 合并k个升序列表
author: sindweller <sindweller5530@gmail.com>
tags: [LeetCode]
---

# 题目
## 思路1 
写一个合并两个链表的函数，不断地与后一个列表合并。  
结果：超出时间限制  
```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func mergeKLists(lists []*ListNode) *ListNode {
    if len(lists) == 0{
        return nil
    }
    if len(lists) == 1{
        return lists[0]
    }
    res := merge2(lists[0], lists[1])
    for i:=2;i<len(lists);i++{
        res = merge2(res, lists[i])
    }
    return res
}
func merge2(a,b *ListNode) *ListNode{
    dummy := new(ListNode)
    res := dummy
    for a != nil ||b != nil{
        if a !=nil && b!=nil{
            fmt.Println(a.Val, b.Val)
            if a.Val <= b.Val{
                res.Next = a
                a = a.Next
            }else{
                res.Next = b
                b = b.Next
            }
        }else if a != nil{
            res.Next = a
            a = a.Next
        }else{
            res.Next = b
            b = b.Next
        }
        res = res.Next
    }
    return dummy.Next
}
```

## 思路2
如果针对两个链表，还是使用刚才的merge2函数来合并。  
如果是一个链表数组，类似自顶而下归并排序方法，采用分治思想将其从中间切分为left 和 right 两个切片（lists[:mid] list[mid:])，然后采取递归的方法，继续分别对左右两个切片视为初始切片进行划分（merge其实改名为partition可能更好）。当长度为1时，进行merge2的合并两个链表操作，并在这里返回结果  
最后在上层把左右两边merge的结果再次merge2就可以了。  
写完之后一把梭哈，通过了。这种感觉还是很神奇的。  
![提交记录](/_posts/assets/20221205mergeklistsubmit.png)
```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func mergeKLists(lists []*ListNode) *ListNode {
    if len(lists) == 0{
        return nil
    }
    if len(lists) == 1{
        return lists[0]
    }
    res := merge2(lists[0], lists[1])
    for i:=2;i<len(lists);i++{
        res = merge2(res, lists[i])
    }
    return res
}
func merge(left, right []*ListNode)*ListNode{
    if len(left) ==1 && len(right) ==1{
        return merge2(left[0], right[0])
    }else if len(left) == 1{
        return left[0]
    }else{
        return right[0]
    }

    mid := len(left) /2
    var leftStart, leftEnd []*ListNode
    leftEnd = left[mid:]
    leftStart = left[:mid]

    mid = len(right)/2
    rightStart, rightEnd := right[:mid], right[mid:]
    return merge2(merge(leftStart,leftEnd), merge(rightStart, rightEnd))
}
func merge2(a,b *ListNode) *ListNode{
    dummy := new(ListNode)
    res := dummy
    for a != nil ||b != nil{
        if a !=nil && b!=nil{
            if a.Val <= b.Val{
                res.Next = a
                a = a.Next
            }else{
                res.Next = b
                b = b.Next
            }
        }else if a != nil{
            res.Next = a
            a = a.Next
        }else{
            res.Next = b
            b = b.Next
        }
        res = res.Next
    }
    return dummy.Next
}
```

分治部分其实写的不是很好，参考其他提交记录可以优化如下：
```go
/**
 * Definition for singly-linked list.
 * type ListNode struct {
 *     Val int
 *     Next *ListNode
 * }
 */
func mergeKLists(lists []*ListNode) *ListNode {
    if len(lists) == 0{
        return nil
    }
    if len(lists) == 1{
        return lists[0]
    }
    left := mergeKLists(lists[:len(lists)/2])
    right := mergeKLists(lists[len(lists)/2:])
    return merge2(left, right)
}
func merge2(left, right *ListNode)*ListNode{
    if left == nil{
        return right
    }
    if right == nil{
        return left
    }
    dummy := new(ListNode)
    p := dummy
    for left != nil && right != nil{
        if left.Val < right.Val{
            p.Next = left
            left = left.Next
        }else{
            p.Next = right
            right = right.Next
        }
        p = p.Next
    }
    if left!=nil{
        p.Next = left
    }else if right != nil{
        p.Next = right
    }
    return dummy.Next
}
```
## 思路3 优先队列
由于golang没有内置优先队列的实现，所以就先不操作了。主要思路是通过一个优先队列保存每个链表的当前头节点（也就是最小的值），然后每次从优先队列取队首元素放入结果集中，并补充该节点的Next到队列中。队列大小为k（链表数组长度）。  
