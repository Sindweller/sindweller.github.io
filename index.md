# Sindweller

## 标签分类

{% for tag in site.tags %}
  <h3>{{ tag[0] }}</h3>
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}

```
The final element.
```
## 文章目录

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

## 分类
- 计算机基础
  - 操作系统
  - 组成原理
  - 计算机网络
- 项目经验
  - OpenVPN
  - 基于Go+Gin的curd框架
  - 监控系统
  - 混合云平台
  - 监控系统
- 基础与技巧
  - 并发
  - 数据库
  - Golang
- k8s相关
  - ingress
  - operator
- 算法
  - LeetCode每日一题
  - LeetCode专项
