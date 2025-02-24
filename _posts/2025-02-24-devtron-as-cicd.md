---
layout: default
title: 2025/02/24 部署Devtron成为你的专属云原生CICD工具，附http的gitlab仓库接入修改
author: sindweller <sindweller5530@gmail.com>
tags: [A工具]
---
![devtron](/assets/devtron.png)

基于gitops，配置好如上流水线之后就可以在git push或合并时根据分支名称来触发对应流水线，自动构建自动部署。
这样比较快速地修改上线，在联调的时候也非常快速。


以下修改和解决方案基于0.6.26版本的devtron： [https://github.com/devtron-labs/devtron](https://github.com/devtron-labs/devtron)
## helm安装命令（目前先以nodeport形式暴露服务） 注意选项中一定要有argo-cd.enabled和installer.modules={cicd}才能进行持续集成和部署
```
helm repo add devtron https://helm.devtron.ai

helm install devtron devtron/devtron-operator \
--create-namespace --namespace devtroncd \
--set installer.modules={cicd} \
--set argo-cd.enabled=true \
--set minio.enabled=true \
--set volumePermissions.enabled=true \
--set components.devtron.service.type=NodePort
```
minio.enabled=true 是让他构建镜像的时候使用缓存，缓存存在minio里。
## Helm 卸载命令
```
helm uninstall devtron --namespace devtroncd

kubectl delete -n devtroncd -f https://raw.githubusercontent.com/devtron-labs/charts/main/charts/devtron/crds/crd-devtron.yaml

kubectl delete -n argo -f https://raw.githubusercontent.com/devtron-labs/devtron/main/manifests/yamls/workflow.yaml

kubectl delete ns devtroncd devtron-cd devtron-ci devtron-demo argo

```
## 部署之后检查和访问 
部署好之后查看devtron dashboard暴露出来的端口
```
export nodeport=$(kubectl get svc -n devtroncd devtron-service -o jsonpath="{.spec.ports[0].nodePort}")
echo http://HOST_IP:$nodeport/dashboard
```
这个HOST_IP就是pod所在node节点ip
看一下helmchart的安装进度 Applied就是完成了
```
kubectl -n devtroncd get installers installer-devtron -o jsonpath='{.status.sync.status}'
```
查看devtron的管理员密码
```
sindweller@xindeweiladeMacBook-Pro kubeyamls % kubectl -n devtroncd get secret devtron-secret \
-o jsonpath='{.data.ADMIN_PASSWORD}' | base64 -d
```

devtron有一个k8s资源看板的功能，如果要接入自己的k8s集群，需要给他一个用户权限。因此，在自己的k8s集群上创建sa并绑定角色和secret： admin-user.yaml
```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
---
apiVersion: v1
kind: Secret
metadata:
  name: k8s-api-admin-token
  namespace: kube-system
  annotations:
    kubernetes.io/service-account.name: admin-user
type: kubernetes.io/service-account-token
```
获取api token（需要base64解码）
```
sindweller@xindeweiladeMacBook-Pro kubeyamls % k get secret k8s-api-admin-token -n kube-system -o yaml
```
获得其中的token字段值即可。
查看状态 kubectl get po -n devtroncd看看devtron是不是所有组件都running了
```
sindweller@xindeweiladeMacBook-Pro kubeyamls % k get po -n devtroncd
NAME                                       READY   STATUS      RESTARTS      AGE
app-sync-job-9ipqc-77vfp                   0/1     Completed   0             31m
argo-rollouts-7d449895c-jn9j5              1/1     Running     0             28m
argocd-application-controller-0            1/1     Running     0             31m
argocd-dex-server-5f95dbbcc7-6qh6g         1/1     Running     0             31m
argocd-redis-6b7c9978bd-d9sbh              1/1     Running     0             31m
argocd-repo-server-584975856-s779d         1/1     Running     0             31m
argocd-server-5bdd7946b6-2ggmr             1/1     Running     0             31m
dashboard-79c5774b94-dw28r                 1/1     Running     0             31m
devtron-6b4bf86c76-fm4rx                   1/1     Running     7 (20m ago)   27m
devtron-housekeeping-fvchr                 0/1     Completed   0             25m
devtron-nats-0                             3/3     Running     0             27m
devtron-nats-test-request-reply            0/1     Completed   0             27m
git-sensor-0                               1/1     Running     7 (20m ago)   26m
inception-67d96dc64f-n7dmd                 1/1     Running     0             31m
kubelink-669d5fb54b-fblrf                  1/1     Running     0             30m
kubewatch-74675b7879-p426w                 1/1     Running     0             26m
lens-98bdd89f7-sfmrr                       1/1     Running     7 (20m ago)   26m
postgresql-migrate-casbin-dvjph-pmrx6      0/1     Completed   0             31m
postgresql-migrate-devtron-9otxi-xqjft     0/1     Completed   3             31m
postgresql-migrate-gitsensor-j2bzq-zgtpn   0/1     Completed   3             31m
postgresql-migrate-lens-abpqu-g67db        0/1     Completed   2             31m
postgresql-postgresql-0                    2/2     Running     0             19m
```
## 自签证书的harbor镜像仓库怎么在devtron中使用
因为我们k8s用的containerd，有如下修改：
首先在/etc/containerd/certs.d/myharbor.com下添加harbor仓库的ca.crt，并且加一个host.toml，为了快速走通我跳过了tls验证
```
server = "https://myharbor.com"

[host."https://myharbor.com"]
  capabilities = ["pull", "resolve"]
  ca = "ca.crt"
 
```
并采取了另一种推荐的方式 https://blog.nuvotex.de/kubernetes-private-registry/ 双管齐下（注意这两个方式都要在所有k8s-node节点上操作）
```
# ca.crt拷贝到这里
/usr/local/share/ca-certificates
# 更新一下
update-ca-certificates
# 重启containerd
systemctl restart containerd
```
## http方式访问gitlab需要对代码进行修改：
因为devtron本身只允许https的gitlab地址访问，但有的内部gitlab可能没有https，你可以参考https://github.com/Sindweller/devtron/tree/my-0.6.26 我的提交来修改代码重新构建devtron
除了devtron，git-sensor组件也需要修改，参考我的提交
https://github.com/Sindweller/git-sensor/tree/my-0.6.26
## 问题记录
### git-sensor容器无法访问gitlab
一般无法拉取仓库代码就是git-sensor这个组件的问题，可以看到报错
```
[Oct 14 2023 10:11:04 GMT+0800] git-sensor-0: {"level":"error","ts":1697249464.4460576,"caller":"git/GitCliUtil.go:62","msg":"error in git cli operation","msg":"Warning: Permanently added 'gitlab.xxx.com,192.168.xx.xx' (ECDSA) to the list of known hosts.\r\nPermission denied, please try again.\r\nPermission denied, please try again.\r\ngit@gitlab.xxx.com: Permission denied (publickey,password).\r\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.\n","err":"exit status 128","stacktrace":"github.com/devtron-labs/git-sensor/pkg/git.(*GitUtil).runCommand\n\t/go/src/github.com/devtron-labs/git-sensor/pkg/git/GitCliUtil.go:62\ngithub.com/devtron-labs/git-sensor/pkg/git.(*GitUtil).runCommandWithCred\n\t/go/src/github.com/devtron-labs/git-sensor/pkg/git/GitCliUtil.go:55\ngithub.com/devtron-labs/git-sensor/pkg/git.(*GitUtil).Fetch\n\t/go/src/github.com/devtron-labs/git-sensor/pkg/git/GitCliUtil.go:36\ngithub.com/devtron-labs/git-
...
```
exit status 128一般就是权限有问题，检查一下你自己gitlab的token能不能用或者重启一下git-sensor可解决。
