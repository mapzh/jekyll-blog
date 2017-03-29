---
layout: post
title: iOS系统新特性
date: 2016-04-19 13:20
categories: []
tags: server
---

#iOS系统新特性

##iOS 9

`NSString`的实例方法`stringByApplyingTransform`可以将字符串转化为各国语言或`unicode`编码

`CLLocationManager`的实例方法`requestLocation`用来单次获取用户位置信息。`requestLocation()` 使用和连续更新一样的代理方法，在发送完期望精度的位置信息后，会自动将自己关闭

##iOS 8

####NSProcessInfo
设备版本号可以通过
`[NSProcessInfo processInfo].operatingSystemVersion`
获取

####NSFormatter
增加`NSFormatter`的子类：
`NSEnergyFormatter`使用焦作为能量的原始单位，当处理健康信息时，则使用卡
`NSMassFormatter`物质质量, 在`HealthKit`中，它主要指的是身体重量
`NSLengthFormatter`

####CMStepCounter
`CMStepCounter `跟踪脚步和距离，甚至计算总共爬了多少级楼梯

####CLFloor
`CLFloor`楼层信息（说明苹果可能要进军室内导航）

####HealthKit
`HealthKit`心率，卡路里摄入量，血氧等通过统一的API聚合在一起

####CTRubyAnnotationRef
`CTRubyAnnotationRef`用来给亚洲文字添加注音符号

####NSURLCredentialStorage
`NSURLCredentialStorage`异步非闭包的方式获取和存储密码

####LocalAuthentication TouchID验证

####WKWebView  WKWebView 继承了 UIWebView 大部分的接口


##iOS 7

####base64
`NSData`直接支持`base64`：`base64EncodedStringWithOptions`

####NSURLComponents
增加了`NSURLComponents`，可以理解为`NSMutableUrl`
用法：

```
NSURLComponents *components = [NSURLComponents componentsWithString:@"http://nshipster.com"];
components.path = @"/iOS7";
components.query = @"foo=bar";
NSLog(@"%@", components.scheme); // @"http"
NSLog(@"%@", [components URL]); // @"http://nshipster.com/iOS7?foo=bar"

```

####NSArray
`NSArray`增加`firstObject` API

####CIDetectorSmile
`CIDetectorSmile` & `CIDetectorEyeBlink`
`iOS5 Core Image`框架提供了通过`CIDetector`类可实现的面部监测与识别功能，在iOS 7中可以识别这张脸是在微笑还是闭眼睛了

####AVCaptureMetaDataOutput
可以通过`AVCaptureMetaDataOutput`扫瞄各式各样的`UPC`，`QR`码和条形码

####AVSpeechSynthesizer
Siri 说/拼写功能API

####MKDistanceFormatter
将距离通过英制或者公制单位转换成为本地字符串
