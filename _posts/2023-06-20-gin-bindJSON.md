---
layout: default
title: 2023/06/20 Go语言多态实践以及json序列化遇到的坑
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---

## 遇到的问题

如果定义的接收结构体字段是interface{}，在调用gin的 c.BindJSON 方法后会直接转为map， 导致无法断言为其他类型



## 场景

在创建工程请求中，根据工程类别的不同会有多种创建参数，比如

```go
// A 类型需要编译 所以有这些字段
type ProjTypeA struct{
  buildCmd string `json:"build_cmd"` // 编译命令
  buildScript string `json:"build_script"` // 编译脚本
}

// B 类型直接执行，需要这些字段
type ProjTypeB struct{
  ExecCmd string `json:"exec_cmd"` // 执行命令
}

```

因为以后可能会扩展出更多类型的工程，所以考虑用多态来实现对工程子参数的处理，这样以后新增工程类型只需要新类型实现TypePara接口即可，尽量减少对主干代码的修改。甚至无需修改creatproj函数，只要修改接口里的判断方法就行（因为前端请求过来的json要通过业务逻辑判断后才能知道反序列化为哪个工程类型）

前端传请求体时会把这些不同的结构统一写入TypePara这个字段中，这里的处理有两种情况：

1. 在后端接收时这个字段设为interface{}，用下方定义的PostProjReq来接收。

```go
type PostProjReq struct {
	Name string `json:"name"`
	Desc string `json:"desc"`

	TypePara interface{} `json:"type_para"`
}
```

此时再通过c.BindJSON接收

```go
	pp := new(api.PostProjReq)
	if err := c.BindJSON(*pp); err != nil {
		log.Println("json unmarshal error: ", err)
		c.JSON(http.StatusOK, api.HttpRespBody{
			Code: 400,
			Msg:  "",
			Data: "",
		})
		return
	}
```

可以通过，这里是因为interface{}(包含TypePara是interface{}的情况，就是空接口，没有实现方法) 就会自动转为map

```shell
 TypePara:map[arch:3 file_id: 1 os:3 envi:envi1 exec_cmd:mycmd]
```

但问题是，map无法再被断言为具体的ProjPara类型

2. 如果改成自己定义的接口类型TypePara

```go
// 统一接口
type TypePara interface {
	typePara2json() []byte
	getTarget() string
	unmarshalJSON(data []byte)
	handlerFile(item *repo.Proj, target string)
}
```

并且用TypePara来接收：

```go
type PostProjReq struct {
	Name string `json:"name"`
	Desc string `json:"desc"`

	TypePara TypePara `json:"type_para"`
}


就会直接在c.BindJSON这一步报错：

```shell
json: cannot unmarshal object into Go struct field PostProjReq.type_para of type service.TypePara
```

这个可能的原因有：

由于接口类型的动态类型是在运行时才能确定的，而 JSON 解析需要在编译时确定数据类型和结构，因此无法直接将 JSON 解析到接口类型上

处理方式：先将一个字段设置为json.RawMessage暂存，然后根据其他条件推断

只要将json转换为了typepara，不管是哪种类型，都能够进行switch断言判断，可以不用ifelse了。

> 如果一定想要以interface{}接收并不转为map，除非自己实现UnmarshalJSON，但是接口类型不能作为接收器，这个思路还没有走通。

最后的实现方式：对于前端传过来的请求体，先用一个TypeParaJSON字段，json.RawMessge类型来接收，

```go
// 前端传入创建工程表单
type PostProjReq struct {
	Name string `json:"name"`
	Desc string `json:"desc"`

    ProjType string `json:"proj_type"` // 指明这是什么类型的工程

	TypePara        TypePara        // 不需要请求体直接unmarshal进来
	TypeParaJSON    json.RawMessage `json:"type_para"` // 单独解析
}
```

然后在TypePara2JSON()函数中根据其他条件判断类型（代替直接断言），判断好了之后调相应类型的方法来完成构造工作：

```go
// 将req转换为存库的json
func TypePara2JSON(pp *PostProjReq) []byte {
	if pp.ProjType == "A" { // A类型的工程
		p := &ProjTypeParaA{}
		p.unmarshalJSON(pp.TypeParaJSON)
		pp.TypePara = p // 赋值给这个结构，供后续处理使用，后续可以直接断言这个字段了 pp.TypePara.(*ProjTypeParaA)
		return p.typePara2json() // 这里是业务逻辑有需求要再次处理成json，如果没有需求，那么可以直接返回TypePara 后面会写
	} else if pp.ProjType == "B" { // B类型的工程
		p := &ProjTypeParaB{}
		p.unmarshalJSON(pp.TypeParaJSON)
		pp.TypePara = p // 赋值
		return p.typePara2json()
	} else if pp.ProjType == "C" { // C类型的工程
		p := &ProjTypeParaC{}
		p.unmarshalJSON(pp.TypeParaJSON)
		pp.TypePara = p
		return p.typePara2json()
	} else {
		logrus.Error(" unsupport type")
	}
	return []byte{}
}
```

另外解释下为啥要继续处理成json，因为存入数据库的json字段类型是datatypes.JSON 而请求解析过来的是json.RawMessage，这两个类型不能直接赋值

`SubProjPara: dto.TypeParaJSON // 不能直接赋值`

如果把TypePara改为[]byte也不行，会显示： 

`json: cannot unmarshal object into Go struct field PostProjReq.type_para of type []uint8 `

所以还需要这么json.RawMessage->ProjTypeX->datatypes.JSON的转换流程

数据库表结构：

```go
type Proj struct{
    ID string
    Name string
    Desc string
    SubProjPara datatypes.JSON `gorm:"type:json;"` // 就是TypePara
}
```

从数据库获取数据并转成相应的TypePara子类型的方法：

```go
// 将数据库中获取的json转为typepara
func ConstructSubPara(pp *models.Proj) TypePara {
	if pp.ProjType == "A" { // A类型的工程
		p := &ProjTypeParaA{}
		p.unmarshalJSON(pp.SubProjPara)
		return p
	} else if pp.ProjType == "B" { // B类型的工程
		p := &ProjTypeParaB{}
		p.unmarshalJSON(pp.SubProjPara)
		return p
	} else if pp.ProjType == "C" { // C类型的工程
		p := &ProjTypeParaC{}
		p.unmarshalJSON(pp.SubProjPara)
		return p
	} else {
		logrus.Error(" unsupport type")
	}
	return nil
}
```

此后就可以直接调用这个接口的其他方法了，比如还有一个方法 handleFile，那么直接

```go
ty:=ConstructSubPara(item) // item就是Proj对象
HandleFile(tp) // 
```

```go
func HandleFile(tp TypePara){
    tp.handleFile() // 这里就是调每个类型自己的handleFile实现了，而且也不用手动处理是什么类型 完全利用到了多态
}
```