---
layout: default
title: 2023/05/05 KubeVirt备份与还原方案【翻译】
author: sindweller <sindweller5530@gmail.com>
tags: [云原生]
---

# KubeVirt备份与还原方案【翻译】

ref:[https://github.com/kubevirt/kubevirt/blob/main/docs/backup-restore-integration.md](https://github.com/kubevirt/kubevirt/blob/main/docs/backup-restore-integration.md)

## 备份

1. 为所有必需的k8s资源构建依赖关系图
2. 冻结应用程序
3. pvc数据快照
4. 解冻应用程序
5. 将所有必需的k8s资源定义拷贝到一个共享的存储位置
6. （可选）将PVC数据快照导出到一个共享存储位置

步骤3、5、6不在本文档讨论范围之内

## 恢复

1. 使用快照数据填充PVC
2. 清理并应用所有相关的k8s资源定义

步骤1超出本文档讨论范围

# 现有的Kubevirt备份解决方案

## velero 插件

Velero是用来备份/迁移k8s集群的。kubevirt团队积极维护了一个用于velero的插件。这个插件实现了不少本文档所描述的逻辑。

## VirtualMachineSnapshot + VirtualMachineExport API

vm快照和vm导出api

vm snapshot api为kubevirt用户提供了一种快捷的方式来在集群中备份vm。它本身不适合异地备份或灾难恢复。但是跟vm export api一起使用，vm的存储卷就可以被用来拷贝数据到远程位置。

# 建立kubevirt对象图

[!backup-graph.png](https://github.com/kubevirt/kubevirt/blob/main/docs/backup-graph.png)

（主要就是vm-vmi-pod，以及datavolume-pvc）

对象图中的节点格式：APIGroup-Kind-namespace-name

## VM 对象图

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: vm1
  namespace: ns1
...
```

- ("kubevirt.io", "VirtualMachine", "ns1", "vm1")

（apigroup 是 [kubevirt.io](http://kubevirt.io)，kind是VM，在ns1命名空间下，名字叫做vm1)

## spec

（spec是kubevirt的crd中自定义内容较多的一个部分）

### spec.instancetype

```yaml
...
spec:
  instancetype:
    kind: VirtualMachineInstancetype
    name: small
...
```

- ("instancetype.kubevirt.io", "VirtualMachineInstancetype", "ns1", "small")

### spe.preference

```yaml
...
spec:
  preference:
    kind: VirtualMachinePreference
    name: windows
...
```

- ("instancetype.kubevirt.io", "VirtualMachinePreference", "ns1", "windows")

### **spec.template**

```yaml
见vmi的对象图
```

## VMI 对象图

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachineInstance
metadata:
  name: vmi1
  namespace: ns1
...
```

- ("kubevirt.io", "VirtualMachineInstance", "ns1", "vmi1")
- ("", "Pod", "ns1", "virt-launcher-vmi1-XXXXX") *

*每个VMI有一个关联的唯一命名的pod，备份过程可以通过使用 [kubevirt.io/created-by=<](http://kubevirt.io/created-by=<UID)vmi uid>来寻找这个pod的名称

### **spec.volumes[*].persistentVolumeClaim**

```yaml
...
spec:
  volumes:
  - name: v1
    persistentVolumeClaim:
      claimName: pvc1
...
```

- ("", "PersistentVolumeClaim", "ns1", "pvc1")
- ("cdi.kubevirt.io", "DataVolume", "ns1", "pvc1")

### **spec.volumes[*].dataVolume**

```yaml
...
spec:
  volumes:
  - name: v1
    dataVolume:
      name: dv1
...
```

- ("", "PersistentVolumeClaim", "ns1", "dv1")
- ("cdi.kubevirt.io", "DataVolume", "ns1", "dv1")

### **spec.volumes[*].configMap**

```yaml
...
spec:
  volumes:
  - name: v1
    configMap:
      name: cm1
...
```

- ("", "ConfigMap", "ns1", "cm1")****

（剩下的就不一一复制粘贴了）

- ("", "Secret", "ns1", "s1")
- ("", "ServiceAccount", "ns1", "sa1")
- ("", "PersistentVolumeClaim", "ns1", "pvc1")
- • ("", "Secret", "ns1", "my-pub-key")
- • ("", "Secret", "ns1", "my-user-password")

## VMI ReplicaSet

- ("kubevirt.io", "VirtualMachineInstanceReplicaSet", "ns1", "vmirs1")
- ("kubevirt.io", "VirtualMachineInstance", "ns1", "vmirs1XXXX1") *
- ("kubevirt.io", "VirtualMachineInstance", "ns1", "vmirs1XXXX2") *

*一般都有多个VMI关联在一个VMIReplicaSet中，备份过程可以搜寻[kubevirt.io/vmReplicaSet=](http://kubevirt.io/vmReplicaSet=)<name of VirtualMachineInstanceReplicaSet> 作为标签选择器。

# 备份动作

用户文件系统冻结/解冻hook

# 还原动作

## VM还原

如果还原到不同的集群，并且明确设置了mac地址或bios序列号，需要确保不会发生冲突，在这里设置：

```yaml
/spec/template/spec/domain/devices/interfaces/<index>/macAddress
/spec/template/spec/domain/firmware/serial
```

## VMI还原

如果一个VMI归属于一个VM，则这个VMI不应该被还原。kubevirt controller会根据VM定义重建VMI。否则，VMI定义有可能以VM相同预配置的Mac/bios进行恢复（可能导致重复）。

## virt-launcher pod 还原

属于一个VMI，带有”virt-launcher-”前缀的pod不应该被还原。

## DataVolume还原

在succeeded阶段的datavolumes需要在还原期间设置以下annotation。否则关联的pvc可能有损坏。除了Succeeded之外任何阶段的datavolumes都不需要注释。

```yaml
cdi.kubevirt.io/storage.prePopulated: <datavolume name>
```

## PVC还原

归属于DataVolumes的PVC必须在备份/还原时加annotation

```yaml
cdi.kubevirt.io/storage.populatedFor: <datavolume name>
```