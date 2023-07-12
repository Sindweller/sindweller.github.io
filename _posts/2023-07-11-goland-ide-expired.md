---
layout: default
title: 2023/07/11 IDE 过期问题
author: sindweller <sindweller5530@gmail.com>
tags: [工具]
---
报错： `This build of IntelliJ IDEA has expired" when running`

问题表现：
![problem](assets/757b3abd-352d-4a76-9113-ae5b2d9329c3.jpeg)

参考：https://intellij-support.jetbrains.com/hc/en-us/community/posts/360004306500-Getting-This-build-of-IntelliJ-IDEA-has-expired-when-running-buildSearchableOptions-

原因是选择了EAP，换成别的release版本就可以了

![eap](assets/eap.jpeg)