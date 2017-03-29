---
layout: post
title: Linux环境配置问题汇总
date: 2016-06-16 15:25
categories: []
tags: Linux
---

#Linux环境配置问题汇总

###NOKEY, key ID*****
在`CentOS`或者`Fedora`下有时候用`yum`安装软件的时候最后会提示：

```
warning: rpmts_HdrFromFdno: Header V3 DSA signature: NOKEY, key ID*****

```

这是由于`yum`安装了旧版本的`GPG keys`造成的，解决办法就是

```
rpm --import /etc/pki/rpm-gpg/RPM*
```

###Centos用 yum 方式安装 nodejs 和 npm
要通过 `yum` 来安装 `nodejs` 和 `npm` 需要先给 `yum` 添加 `epel` 源

```
rpm -ivh http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
```

导入`key`

```
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6
```

安装完成后,执行

```
yum -y install nodejs npm --enablerepo=epel
```

###sudo：yum-config-manager：找不到命令
这个是因为系统默认没有安装这个命令，这个命令在`yum-utils` 包里，可以通过命令安装

```
yum -y install yum-utils

```


###Centos设置定点重启

```
yum install vixie-cron crontabs
chkconfig crond on
service crond start

```

`crontab -e`
编辑文件写入：
`0 1 * * * /sbin/reboot`

`/etc/rc.d/init.d/crond stop`
