---
layout: default
title: 2022/12/06 LeetCode 32. 最长有序括号
author: sindweller <sindweller5530@gmail.com>
tags: [LeetCode]
---

# 题目
https://leetcode.cn/problems/longest-valid-parentheses
## 思路1 栈
类似校验括号合法性，使用一个栈来保存左括号，当遍历到右括号时，消耗栈中的左括号。计算长度时，直接选取出消耗掉的左括号的前一个仍在栈中的左括号（也有可能是为了方便计算边界的栈底右括号）的下标
- 如果是左括号 压栈
- 如果是右括号 为了避免将栈底的右括号错误视为能匹配的左括号，需要先出栈栈顶元素，再做以下操作：
  - 如果栈为空 则表明刚才出栈的是栈底的右括号，将此右括号的下标放入，成为栈底元素（新的开端）
  - 栈不空，则刚才一定是出栈了左括号，那么计算从i到此刻栈顶元素的距离，更新max值
  
```go
func longestValidParentheses(s string) int {
    stack := []int{}
    max := 0
    l := 0
    stack = append(stack, -1)
    for i := range s{
        if s[i] == ')'{
            stack = stack[:len(stack)-1] // 直接出栈左括号
            if len(stack) == 0{
                stack = append(stack, i) // 栈底为最后一个没被匹配到的右括号
            }else{
                if i-stack[len(stack)-1] > max{ // 栈顶是前一个左括号的位置
                    max = i-stack[len(stack)-1]
                }
            }
        }else{
            stack = append(stack, i)
        }
    }
    if len(stack) > 0{
        l = stack[len(stack)-1] + 1
    }
    if len(s) - l > max{
        max = len(s) - l
    }
    
    return max
}
```

## 思路2 动态规划
dp[i]：i位置的字符作为结尾的有效子串长度
- 所有'('左括号的dp[i]都是0，因为以左括号作为结尾是没有合法子串的。
- 当前元素')'右括号，则考察其之前的那个元素i-1 
  - 如果s[i-1]为左括号，那么就是直接成对出现，s[i]和s[i-1]给当前字符为结尾的子串提供2个长度。那么再加上左括号前一个元素的dp值（其之前的最大合法长度）即可得到当前最大长度。
  - 如果s[i-1]为右括号，即....))，那么考察以s[i-1]为结尾的最长合法子串再往前一个位置(s[i-dp[i-1]-1])，如果是右括号，那么不合法，当前dp[i]为0;如果是左括号，那么正好和i位置的右括号配对成功，那么就沿用上一段所说的，“s[i]和s[i-1]给当前字符为结尾的子串提供2个长度,再加上左括号前一个元素（s[i-dp[i-1]-2]）的dp值”，得到dp[i]=dp[i-1]+dp[s[i-dp[i-1]-2]]+2，也就是总共由s[i]与s[i-dp[i-1]-1]提供的两个长度+dp[i-1]提供的长度+s[i-dp[i-1]-2]提供的长度

```go
func longestValidParentheses(s string) int {
    dp := make([]int, len(s))
    for i := range s{
        if s[i] == ')'{
            if i-1<0{
                continue
            }
            if s[i-1] == '('{
                //提供+2长度
                dp[i] = 2
                if i-2 >=0{
                    dp[i] += dp[i-2]
                }
            }else{
                // 为')' 则继续考察
                // 这里i-2不能等于0 否则后面减不动
                if i-dp[i-1] >0 && s[i-dp[i-1]-1] == '('{
                    // 三段+
                    if i-dp[i-1]-2 >=0{
                        dp[i] = dp[i-dp[i-1]-2] + 2 + dp[i-1]
                    }else{
                        dp[i] = dp[i-1] + 2
                    }
                }
            }
        }
    }
    fmt.Println(dp)
    max := 0
    for i := range dp{
        if dp[i] > max{
            max = dp[i]
        }
    }
    return max
}
```
## 思路3 双指针，贪心

优化了存储，只是采用两个计数器来记录左括号和右括号的数量。这种情况下时间复杂度为O(n)，空间复杂度为O(1)  
当left=right时，记录当前有效字符串长度。如果right比left大，则清零。  
但是如果左括号始终比右括号多，例如((()这种情况，使用上面的遍历方法时求不出来的。因为没有left=right就不会有计算有效长度这个操作。  
解决办法是从右往左遍历，同时也变换一下判断思路
- left > right 没有有效子串，清零
- left = right 记录  

等于是跑了两遍for循环来补足两种情况  

```go
func longestValidParentheses(s string) int {
    left, right := 0,0
    max := 0
    for i := range s{
        if s[i] == '('{
            left ++
        }else{
            right ++
        }
        if right > left{
            right, left = 0,0
        }else if left == right{
            // 长度为2 * left 或者说是left+right
            if left + right > max{
                max = left + right
            }
        }
    }
    left,right = 0,0
    for i:=len(s)-1;i>=0;i--{
        if s[i] == '('{
            left ++
        }else{
            right ++
        }
        if left > right{
            right, left = 0,0
        }else if left == right{
            // 长度为2 * left 或者说是left+right
            if left + right > max{
                max = left + right
            }
        }
    }
    return max
}
```