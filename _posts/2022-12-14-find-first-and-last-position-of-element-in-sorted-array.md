---
layout: default
title: 2022/12/14 LeetCode 34. 在排序数组中查找元素的第一个和最后一个位置
author: sindweller <sindweller5530@gmail.com>
tags: [LeetCode]
---

# 34. 在排序数组中查找元素的第一个和最后一个位置

[https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

题目要求时间复杂度为O(log n)

| 顺序查找 | O(n) |
| --- | --- |
| 二分查找（折半查找） | O(logn) |
| 二叉排序树查找 | O(logn) |
| 哈希表法（散列表） | O(1) |
| 分块查找 | O(logn) |

考虑二分查找

这个数组是非递减的，有可能出现重复数字。

第一个思路是先用二分查找找到一个下标，然后从这个下标往前后查找重复数字从而确定起止位置

```go
func searchRange(nums []int, target int) []int {
    t := binary(0, len(nums)-1, target, nums)
    fmt.Println("---")
    fmt.Println(t)
	if t < 0 {
		return []int{-1, -1}
	}
	i := t-1
	for i >= 0 &&nums[t] == nums[i] {
		fmt.Println(i)
		i--
	}
    i++
    
	res := []int{}
	res = append(res, i)
	fmt.Println(res)
	j := t+1
	for j < len(nums) && nums[t] == nums[j] {
		fmt.Println(j)
        j++
	}
    j--
	res = append(res, j)
	return res
}

func binary(left, right, target int, nums []int) int{
    fmt.Println(left, right, target)
    if left >=right{
        if left < len(nums) && nums[left] == target{
            return left
        }else{
            return -1
        }
    }

    mid := (left + right) /2
    if nums[mid] == target{
        return mid
    }else if nums[mid] > target{
        return binary(left, mid-1, target, nums)
    }else{
        return binary(mid+1, right, target, nums)
    }
    return -1
}
```

二分查找是logn 然后前后查找是n 所以这种解法的事件复杂度是O(n)（尤其是最坏情况数组全是一个数字需要扩散，但是可以优化，优化方法是继续用二分查找，利用好数组有序性） 不符合题目要求

官方题解使用的是golang的sort包..震惊

```go
leftmost := sort.SearchInts(nums, target)
```

但是分为两种情况，ans数组的第一位是左侧第一个符合条件的元素下标，第二位是右侧第一个符合条件的元素下标，那么就是第一个符合target+1的元素的下标（但是target+1也不一定存在，这里如果使用sort.SearchInt的话，这个函数是能返回不存在的数应该插在哪个位置的，例如：）

```go
Element 40 not found, it can inserted at index 5 in [10 20 25 27 30]
// 返回5
sort.SearchInts(nums, 40)
```

mid可以写为l+r >> 1

如果使用自己写的二分查找的话，可以是这样的：

```go
func searchRange(nums []int, target int) []int {
    leftmost := binarySearch(nums, target, true)
    rightmost := binarySearch(nums, target, false) - 1
    // 检验合法
    if leftmost <= rightmost && rightmost < len(nums) && nums[leftmost]==target && nums[rightmost]==target{
        return []int{leftmost, rightmost}
    }
    return []int{-1,-1}
}

func binarySearch(nums []int, target int, lower bool) int{
    // 这个二分查找算法是迭代不是递归，一次跑完
    left, right, ans := 0, len(nums)-1, len(nums)
    for left <= right{
        mid := (left + right) >> 1
        // 当中间数比target大，或者要查leftmost且中间数可以等于target，需要继续在左侧查找
        if nums[mid]>target || (lower && nums[mid] >= target){
            right = mid -1
            ans = mid // 记录当前结果，如果后一次循环没有结果了，就用这次的结果
            
        }else{
            // 中间数<=target 无脑往右查就ok了，这样获得的最后结果就是最右的。如果相等，继续往右边找
            left = mid +1
        }
    }
    return ans // 这样返回的答案是最接近（或等于）的，如果没有也会返回一个值
}
```

注意这个二分查找算法如果值不存在，是返回最接近的位置的。
