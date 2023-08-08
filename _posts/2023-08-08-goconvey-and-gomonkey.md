---
layout: default
title: 2023/08/08 Go单元测试优化与函数打桩
author: sindweller <sindweller5530@gmail.com>
tags: [编程语言]
---

## 思路

使用Convey分割多个测试用例，使用go-monkey对不需要真正执行的（例如，sql）函数/方法进行打桩，在测试时直接返回确定的对象而不是去真正调用函数

## 方法打桩例子

这是一个service层的函数，其中调用了2个repo层的curd方法

```go
// 启用驱动
func EnableDrive(id string) error {
	// 要求只有验证通过的驱动才能启用
	td, err := repo.GetDriveCtl().GetItemByID(id) // 第一个repo层方法
	if err != nil {
		return err
	}
	if td.Status != api.DRIVE_STATUS_SUCC {
		return errors.New("drive invalid")
	}
	return repo.GetDriveCtl().EnableByID(id) // 第二个repo层方法
}
```

单测如下：

```go
package service

import (
	"xxx/api"
	"xxx/yy/repo"
	. "github.com/agiledragon/gomonkey/v2"
	. "github.com/smartystreets/goconvey/convey"
	"gorm.io/gorm"
	"testing"
)

func TestEnableDrive(t *testing.T) {
	var ctl *repo.DriveCtl // 这里声明一个方法所属的struct，后面ApplyMethod的时候用
	Convey("TestEnableDrive", t, func() {
    // 第一个测试用例
		Convey("已经过验证的驱动", func() {
      // 注意这里打桩的时候，后面的func不仅仅是方法签名，还要在入参部分加入这个ctl接收器
			patches := ApplyMethod(ctl, "GetItemByID", func(_ *repo.DriveCtl, id string) (repo.Drive, error) {
				return repo.Drive{
					ID:            "verified",
					Status:        api.DRIVE_STATUS_SUCC, // 验证成功
					Enable:        false,
				}, nil
			})
			defer patches.Reset()

			// 一律返回ok
			patches.ApplyMethod(ctl, "EnableByID", func(_ *repo.DriveCtl, id string) error { return nil })

			err := EnableDrive("verified")
			So(err, ShouldEqual, nil) // So是类似于assert，用来断言返回值是否正确
		})
    // 第二个测试用例
		Convey("未验证的驱动", func() {
			patches := ApplyMethod(ctl, "GetItemByID", func(_ *repo.DriveCtl, id string) (repo.Drive, error) {
				return repo.Drive{
					ID:            "verified",
					Status:        api.Drive_STATUS_UNKNOWN, // 未验证
					Enable:        false,
				}, nil
			})
			defer patches.Reset()

			// 一律返回ok
			patches.ApplyMethod(ctl, "EnableByID", func(_ *repo.DriveCtl, id string) error { return nil })

			err := EnableDrive("verified")
			So(err.Error(), ShouldEqual, "test drive invalid")
		})
    // 第三个测试用例
		Convey("不存在的驱动", func() {
			patches := ApplyMethod(ctl, "GetItemByID", func(_ *repo.DriveCtl, id string) (repo.Drive, error) {
				return repo.Drive{}, gorm.ErrRecordNotFound
			})
			defer patches.Reset()

			// 一律返回ok
			patches.ApplyMethod(ctl, "EnableByID", func(_ *repo.DriveCtl, id string) error { return nil })

			err := EnableDrive("notexists")
			So(err, ShouldEqual, gorm.ErrRecordNotFound)
		})
	},
	)
}

```

Convey的好处之一就是能输出很可爱的结算界面

```shell
=== RUN   TestEnableDrive

  TestEnableTestDrive 
    已经过验证的驱动 ✔
    未验证的驱动 ✔
    不存在的驱动 ✔
```

或者

```shell
  TestEnableDrive 
    已经过验证的驱动 🔥
    未验证的驱动 🔥
    不存在的驱动 🔥
```

## grpc客户端（也是函数打桩）单测例子

主要完成以下步骤：
- 函数打桩
- 启动grpc客户端
- 启动服务端（根据需求）

```go
package yyy

import (
	"xx/pkg/yyy/proto"
	"context"
	"github.com/agiledragon/gomonkey"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"testing"
)

// 这个init是起grpc服务端，但是很难搞，必须以协程形式启动，如果直接go test 全部，这样写是可以的。但是如果单独测试一个case，就需要先手动启动server，把这个init注释掉，然后再跑
func init() {
	go Init()
}

func TestInsertLogService_InsertAAA(t *testing.T) {
	// 创建 gRPC 客户端连接
	conn, err := grpc.Dial(":50052", grpc.WithInsecure())
	assert.NoError(t, err)
	defer conn.Close()

	// 创建服务客户端
	client := proto.NewInsertLogServiceClient(conn)

	// 构造测试输入
	req := &proto.InsertAAAReq{
		// 设置请求参数
		ID:      "id111",
		Addr: "addr111",
		Line:    "d======",
		AAA:    "fudawe2341",
	}

	// 创建打桩函数，直接返回 handlerAAA就是原函数中调用的函数，但是我们测试的时候不希望真的去调用它
	patches := gomonkey.ApplyFunc(handlerAAA, func(taskID string, data AAAdata) {
		// 直接返回，不执行真正的处理逻辑
		return
	})

	// 在测试完成后恢复原始函数
	defer patches.Reset()

	// 调用服务方法
	resp, err := client.InsertAAA(context.Background(), req)

	// 断言期望的结果
	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Equal(t, int32(1001), resp.ErrCode)
	assert.Empty(t, resp.Msg)
}
```

## ref

1. https://www.liwenzhou.com/posts/Go/unit-test-5/ go-convey的指南 包含断言教程
2. https://juejin.cn/post/6986220337536958495 可以看他的业务测试思路
3. https://github.com/agiledragon/gomonkey/blob/master/test/apply_method_test.go gomonkey官方给的例子
4. https://juejin.cn/post/7133520098123317256 也是gomonkey的教程