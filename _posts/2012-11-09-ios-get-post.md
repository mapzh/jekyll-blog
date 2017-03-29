---
layout: post
title: 同步异步与post、get简解
date: 2012-11-09 19:53
categories: []
tags: iOS
---

**一、http编程其实就是http请求。http请求最长用的方法是 get 和 post 方法。**==》get方法和post方法相比理解起来比较简单，get方法可以直接请求一个url，也可以url后面拼接上参数作为一个新的url地址进行请求。get方法后面的value要经过unicode编码。form的enctype属性默认为application/x-www-form-urlencoded。不能发送二进制文件。
==》post方法相对要复杂一些。首先post方法要设置key和value ，所有的key和value都会拼接成 key1=value1&key2=value2的样式的字符串，然后这个字符串转化为二进制放到 http请求的body中。当请求发送的时候，也就跟随body一起传给服务器。http请求Content-Type设置为：application/x-www-form-urlencoded。这里讲的只是简单的post请求，一般发送文件不会选择这种方式（从技术方面考虑也可以发送文件，就是把文件以 key 和 value的方式放入）。下面我们再讨论一下post发送二进制文件更加普遍的方法。
**二、HTTP协议是什么？**
简单来说，就是一个基于应用层的通信规范：双方要进行通信，大家都要遵守一个规范，这个规范就是HTTP协议。
HTTP协议能做什么？
很多人首先一定会想到：浏览网页。没错，浏览网页是HTTP的主要应用，但是这并不代表HTTP就只能应用于网页的浏览。HTTP是一种协议，只要通信的双方都遵守这个协议，HTTP就能有用武之地。比如咱们常用的QQ，迅雷这些软件，都会使用HTTP协议(还包括其他的协议)。
HTTP协议如何工作？
大家都知道一般的通信流程：首先客户端发送一个请求(request)给服务器，服务器在接收到这个请求后将生成一个响应(response)返回给客户端。
在这个通信的过程中HTTP协议在以下4个方面做了规定：
1.         Request和Response的格式（）
2.         建立连接的方式（1、非持久连接 2、持久连接）
3.         缓存的机制
4.         响应授权激发机制（应用场合）
5.        基于HTTP的应用（1、 HTTP代理 2、多线程下载 3、 HTTPS传输协议原理 4、开发web程序时常用的Request Methods 5、用户与服务器的交互）                    
       ——————————————参考自：http://ioswiki.sinaapp.com/index.php?edition-view-45-5#3


同步get访问方式：


```cpp
- (IBAction)SynGet:(id)sender //第一步，第二步跟YiBuGet相同
{
    //从网络获取
    //第一步，设置访问的URL
    NSURL *url = [NSURL URLWithString:@"http://api.hudong.com/iphonexml.do?type=focus-c"];//多个之间用&隔开，如：do?type=focus-c&sdef=hnulik   
    //第二步，创建请求
    NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    //第三步，连接服务器
    NSURLResponse *response = nil;
    NSError *err = nil;
    NSData *received =
    [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&err];
    NSString *str = [[NSString alloc]initWithData:received encoding:NSUTF8StringEncoding];
    NSLog(@"%@",str);
}


```

同步post访问方式：

```cpp
- (IBAction)SynPOST:(id)sender
{
    //POST方式，把URL和参数分开，参数作为PostBody发给服务器
    //第一步，设置访问的URL
    NSURL *url = [[NSURL alloc]initWithString:@"http://api.hudong.com/iphonexml.do"];
    //第二步，创建请求
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    [request setHTTPMethod:@"POST"];//设置请求方式POST，默认是GET
    NSString *str = @"type=focus-c";//参数
    NSData *data = [str dataUsingEncoding:NSUTF8StringEncoding];
    [request setHTTPBody:data];
    //第三步，连接服务器
    NSURLResponse *response = nil;
    NSError *err = nil;
    NSData *received =
    [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&err];
    NSString *str1 = [[NSString alloc]initWithData:received encoding:NSUTF8StringEncoding];
    NSLog(@"%@",str1);    
 }

```

异步get访问方式：

```cpp
- (IBAction)AsynGet:(id)sender //异步GET方式请求数据
{
    //GET方式 把参数以key/value形式直接拼接到URL后面，参数之间用&分离
    //第一步，设置访问的URL
    NSURL *url = [NSURL URLWithString:@"http://api.hudong.com/iphonexml.do"];//多个之间用&隔开，如：do?type=focus-c&sdef=hnulik
    //第二步，创建请求
    NSURLRequest *request = [[NSURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    //第三步，连接服务器
    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
}

```

异步post访问方式：


```cpp
- (IBAction)AsynPOST:(id)sender//异步POST方式请求数据
{
    //POST方式，把URL和参数分开，参数作为PostBody发给服务器
    //第一步，设置访问的URL
    NSURL *url = [[NSURL alloc]initWithString:@"http://api.hudong.com/iphonexml.do"];
    //第二步，创建请求
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc]initWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    [request setHTTPMethod:@"POST"];//设置请求方式POST，默认是GET
    NSString *str = @"type=focus-c";//参数
    NSData *data = [str dataUsingEncoding:NSUTF8StringEncoding];
    [request setHTTPBody:data];

    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];


}

```

异步连接的代理方法：NSURLConnectionDataDelegate


```cpp
- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    NSHTTPURLResponse *res = (NSHTTPURLResponse *)response;
    NSLog(@"%@",[res allHeaderFields]);
    self.receivedData = [NSMutableData data];
}


-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [self.receivedData appendData:data];//拼接数据，要在上边有self.receivedData = [NSMutableData data];这句话    
}


-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    NSString *receivedStr = [[NSString alloc]initWithData:self.receivedData encoding:NSUTF8StringEncoding];
    NSLog(@"%@",receivedStr);
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"%@",[error localizedDescription]);
}

```
