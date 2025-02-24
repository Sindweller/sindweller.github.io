---
layout: default
title: 2025/02/06 飞书机器人接入Deepseek和Dify API制作问答机器人
author: sindweller <sindweller5530@gmail.com>
tags: [A工具]
---

## 准备工作
1. 开通了接收消息权限的飞书机器人，例如我希望用户跟飞书机器人私聊，就需要开通这个权限：读取用户发给机器人的单聊消息 im:message.p2p_msg:readonly
2. 准备好飞书机器人的API key 和Secret
3. deepseek-v3的api key+secret：https://platform.deepseek.com/api_keys 这里获取，一开始有10元的免费额度，趁能充多充点，经常不让充值。
4. 自己部署一下dify，推荐使用docker-compose方式，这个有很多教程就不赘述了

## 飞书机器人通过长连接获取用户私聊发的消息
我们使用长连接的方式接收用户消息，需要在飞书开发者后台中配置一下应用，见
[配置回调订阅方式](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/configure-callback-request-address)
代码如下：
```golang
import(
	larkevent "github.com/larksuite/oapi-sdk-go/v3/event"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	"github.com/larksuite/oapi-sdk-go/v3/service/auth/v3"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	larkws "github.com/larksuite/oapi-sdk-go/v3/ws"
)
var sent map[string]struct{} // 这里简单去个重 实际使用要自己再写去重部分
// 飞书消息过来Content字段值是{\"text\":\"早上好～\"}这样的，需要再解析一下
type Text struct {
	Text string `json:"text"`
}
// 处理接收到用户消息的事件
func callback() {
	sent = make(map[string]struct{})
	// 注册事件回调，OnP2MessageReceiveV1 为接收消息 v2.0；OnCustomizedEvent 内的 message 为接收消息 v1.0。NewEventDispatcher()里的两个参数都填空字符串
	eventHandler := dispatcher.NewEventDispatcher("", "").
		OnP2MessageReceiveV1(func(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
			// messageid简单去重
			if _, ok := sent[*event.Event.Message.MessageId]; ok {
				return nil
			} else {
				sent[*event.Event.Message.MessageId] = struct{}{}
			}
			fmt.Printf("[ OnP2MessageReceiveV1 access ], data: %s\n", larkcore.Prettify(event))
			fmt.Println(event.Event.Message.Content) // content中就是用户发过来的消息内容
			var text Text
			json.Unmarshal([]byte(*event.Event.Message.Content), &text)
			fmt.Println(text.Text)
			// 这里可以把用户输入发给deepseek或者dify并接收其响应，具体实现后面讲
			//resp, e := deepseek.CallDeepSeekAPI(text.Text)
			//if e != nil {
			//	return e
			//}
			resp := dify.ChatMessages(text.Text)
			fmt.Println(resp)
			// 这里组织飞书机器人发送消息的content格式，跟接收到消息的一样，也是{\"text\":\"say something\"}
			var contentStruct struct {
				Text string `json:"text"`
			}
			contentStruct.Text = resp
			content, _ := json.Marshal(contentStruct)
			// 这个messages是机器人发送消息函数，见下方
			messages(getTernantAccessToken(), *event.Event.Sender.SenderId.OpenId, *event.Event.Message.MessageType, string(content))
			return nil
		}).
		//im:message.p2p_msg:readonly 这个先不用管
		OnCustomizedEvent("", func(ctx context.Context, event *larkevent.EventReq) error {
			fmt.Printf("[ OnCustomizedEvent access ], type: message, data: %s\n", string(event.Body))
			return nil
		})
	// 创建Client
	cli := larkws.NewClient(AppID, AppSecret,
		larkws.WithEventHandler(eventHandler),
		larkws.WithLogLevel(larkcore.LogLevelDebug),
	)
	// 启动客户端 保持一个长链接
	err := cli.Start(context.Background())
	if err != nil {
		panic(err)
	}
}

//发送消息
func messages(token, receiveID, msgType, content string) {
	// 创建 Client
	client := lark.NewClient(AppID, AppSecret)
	// 创建请求对象
	receiveIDType := "open_id"
	if strings.HasPrefix(receiveID, "oc") { // 这里我简单区分了一下群聊和个人
		receiveIDType = "chat_id"
	}
	req := larkim.NewCreateMessageReqBuilder().
		ReceiveIdType(receiveIDType).
		Body(larkim.NewCreateMessageReqBodyBuilder().
			ReceiveId(receiveID).
			MsgType(msgType).
			Content(content).
			Build()).
		Build()

	// 发起请求
	resp, err := client.Im.Message.Create(context.Background(), req, larkcore.WithTenantAccessToken(token))

	// 处理错误
	if err != nil {
		fmt.Println(err)
		return
	}

	// 服务端错误处理
	if !resp.Success() {
		fmt.Println(resp.Code, resp.Msg, resp.RequestId())
		return
	}

	// 业务处理
	//fmt.Println(larkcore.Prettify(resp))
	fmt.Println(string(resp.RawBody))
}

```

tips: 获取的用户消息长这样：
```go
{
  EventV2Base: {
    Schema: "2.0",
    Header: {
      EventID: "xx",
      EventType: "im.message.receive_v1",
      AppID: "xx",
      TenantKey: "xx",
      CreateTime: "1738892348642",
      Token: ""
    }
  },
  EventReq: {
    Body: <binary> len 672,
    RequestURI: ""
  },
  Event: {
    Sender: {
      SenderId: {
        UserId: "xx",
        OpenId: "xx",
        UnionId: "xx"
      },
      SenderType: "user",
      TenantKey: "xx"
    },
    Message: {
      MessageId: "xx",
      CreateTime: "1738892348363",
      UpdateTime: "1738892348363",
      ChatId: "xx",
      ChatType: "p2p",
      MessageType: "text",
      Content: "{\"text\":\"早上好～\"}"
    }
  }
}
```

接下来就是实现调用deepseek或dify的api的逻辑了

## Deepseek-v3 API调用代码

```golang
package deepseek

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
)
var (
	// DeepSeek-R1 API 的配置
	DeepSeekAPIURL = "https://api.deepseek.com/chat/completions" // 直接用这个就行
	DeepSeekAPIKey = "你的key"
)
// DeepSeek-R1 API 请求数据结构
type DeepSeekRequest struct {
	Model    string        `json:"model"`
	Messages []RoleContent `json:"messages"`
	Stream   bool          `json:"stream"`
}
type RoleContent struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// DeepSeek-R1 API 响应数据结构
type DeepSeekResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

// 调用 DeepSeek-R1 API
func CallDeepSeekAPI(msg string) (string, error) {
	requestBody := DeepSeekRequest{
		Model: "deepseek-chat",
		Messages: []RoleContent{
			{Role: "system", Content: "You are a helpful assistant."}, // 这里可以自行修改
			{Role: "user", Content: msg}, // msg就是用户发的消息
		},
		Stream: false, // 这里先不用流式输出
	}
	requestBytes, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", DeepSeekAPIURL, bytes.NewBuffer(requestBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+DeepSeekAPIKey)
	req.Header.Set("Content-Type", "application/json")
	// 这里我dump了一下请求看发的是否正确 可以删掉
	dump, _ := httputil.DumpRequest(req, true)
	fmt.Println(string(dump))
	// 发请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	// 解析响应
	var deepSeekResponse DeepSeekResponse
	if err := json.Unmarshal(body, &deepSeekResponse); err != nil {
		return "", err
	}
	// 拿content返回
	if len(deepSeekResponse.Choices) > 0 {
		return deepSeekResponse.Choices[0].Message.Content, nil
	}
	return "", fmt.Errorf("no response from DeepSeek API")
}

```

## Dify api调用方法
如何在dify中接入大模型并制作一个问答机器人参考：https://docs.dify.ai/zh-hans/guides/application-orchestrate/conversation-application
点击【发布】之后，去【访问api】页面，右上角有一个![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/023e97f5b9594de39fa524684a6ac707.png)
点击这个API密钥保存下来

调用代码如下：
```golang
package dify

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"strconv"
	"strings"
)

type ChatMessageRequest struct {
	Inputs         map[string]interface{} `json:"inputs"`
	Query          string                 `json:"query"`
	ResponseMode   string                 `json:"response_mode"`
	ConversationID string                 `json:"conversation_id,omitempty"`
	User           string                 `json:"user"`
}

type ChatMessageResponse struct {
	ID             string `json:"id"`
	Answer         string `json:"answer"`
	ConversationID string `json:"conversation_id"`
	CreatedAt      int    `json:"created_at"`
}

const (
	DifyBaseURL = "http://192.168.xx.xx:12345/v1" // 这里是你的dify服务地址
	DifyApiKey  = "app-xxxx" // dify提供的api密钥
	ChatMsgPath = "/chat-messages"
)

func ChatMessages(msg string) string {
	requestData := ChatMessageRequest{
		Query:        msg,
		ResponseMode: "blocking", // 我们先选择阻塞模式，就是等回答全部生成后发回来，而不是sse那种模拟打字输出的形式（streaming)
		User:         "abc123",
	}
	// 将请求数据序列化为 JSON
	requestBody, err := json.Marshal(requestData)
	if err != nil {
		fmt.Errorf("failed to marshal request data: %v", err)
	}

	// 创建 HTTP 请求
	req, err := http.NewRequest("POST", DifyBaseURL+ChatMsgPath, bytes.NewBuffer(requestBody))
	if err != nil {
		log.Fatalf("Failed to create request: %v", err)
	}

	// 设置请求头
	req.Header.Set("Authorization", "Bearer "+DifyApiKey)
	req.Header.Set("Content-Type", "application/json")

	// 发送请求
	client := &http.Client{}
	// 这里dump了一下看发送请求是否正确，可以删掉
	dump, _ := httputil.DumpRequest(req, true)
	fmt.Println(string(dump))
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Failed to send request: %v", err)
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Failed to read response body: %v", err)
	}

	// 输出响应
	fmt.Println("Response Status:", resp.Status)
	fmt.Println("Response Body:", string(body))
	var res ChatMessageResponse
	if err := json.Unmarshal(body, &res); err != nil {
		fmt.Errorf("Failed to unmarshal response body: %v", err)
		return ""
	}
	fmt.Println("Answer:", res.Answer)
	return res.Answer // 这个就是dify调大模型获得的返回内容
}

```
## 效果
如此这般就可以让飞书机器人接收消息->调用dify或者deepseek的api获得回答->把回答发给用户了
![dify&lark](/assets/dify+lark.png)
