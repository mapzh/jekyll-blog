---
layout: post
title: 与并发和多线程有关的那些事
date: 2012-11-10 19:23
categories: []
tags: iOS
---
#并发：

      “当两个或两个以上的任务同时执行时就发生了并发。即使只有一个 CPU,现代操作系统也能够在同时执行多个任务。要实现这一点,它们需要给每个任务从 CPU 中分配一定的时间片。例如,要在 1 秒钟内执行 10 个同样优先级的任务,操作系统会用 10(任务)来平均分配 1000 毫秒(每秒钟有 1000 毫秒),那么每个任务就会有
 100 毫秒的 CPU 时间。这就意味着所以的任务会在同一秒钟内执行,也就是并发执行。
       然而,随着技术进步,现在我们的 CPU 有不止一个内核。这就意味着 CPU 真正具备了同时执行多个任务的能力。操作系统将任务分配到 CPU 并等到任务执行完成。就是这么简单!
       Grand Central Dispatch,或者简称 GCD,是一个与 Block Object产生工作的低级的 CAPI。GCD 真正的用途是将任务分配到多个核心又不让程序员担心哪个内核执行哪个任务。在 Max OS X 上,多内核设备,包括笔记本,用户已经使用了相当长的时间。通过多核设备比如
 iPad2 的介绍,程序员能为 iOS 写出神奇的多核多线程 APP。
       GCD的核心是分派队列。不论在 iOS 还是 Max OS X 分派队列,正如我们快看到的是由位于主操作系统的 GCD 来管理的线程池。你不会直接与线程有工作关系。你只在分派队列上工作,将任务分派到这个队列上并要求队列来调用你的任务。GCD 为运行任务提供了几个选择:同步执行、异步执行和延迟执行等。
      要在你的 APP 开始使用 GCD,你没有必要将任何特殊库导入你的项目。Apple 已经在GCD 中纳入了各种框架,包括 Core Foundation 和 Cocoa/Cocoa Touch。GCD 中的所有方法和数据类型都以 dispatch_关键词开头。例如,dispatch_async 允许你在一个队列上分派任务来异步执行,而
 dispatch_after 允许你在一个给定的延迟之后运行一个 block。传统上,程序员必须创建自己的线程来并行执行任务。”
                                                                                                                                                                                      
 -----------摘自iOS_Cookbook_第五章

先看下面这段代码：


```cpp
- (void)doSomethingThreadEntry
{
    [[NSThread currentThread] setName:@"doSomething"];
    @autoreleasepool {
        NSInteger counter = 0;
        while (![[NSThread currentThread] isCancelled]) {
            NSLog(@"%d<---->%@",counter,[NSThread currentThread]);

            counter++;
            if (counter>=1000)
            {
                break;
            }
        }
    }
}
```



接下来这样调用：


```cpp
[NSThread detachNewThreadSelector:@selector(doSomethingThreadEntry) toTarget:self withObject:nil];
```



平时我们必须手动写线程然后为线程创建要求的结构(切入点,autorelease pool 和线程的主循环)。当我们在 GCD 写同样的代码时,就没有必要做这么多事情:



```cpp
dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);

    size_t numberOfIterations = 1000;
    dispatch_async(queue, ^{
        dispatch_apply(numberOfIterations, queue, ^(size_t iteration) {
            NSLog(@"nice-%@",[NSThread currentThread]);
        });
    });
```


对于dispatch_queue_t（调度队列），苹果API中这样解释：一个调度队列是一个轻量级的对象,您的应用程序提交块后续执行。

#有3 种调度队列:
Main Queue
这个队列在主线程上执行它的所有任务,Cocoa 和 Cocoa Touch 允许程序员在主线程上调用一切 UI-related 方法。使用 dispatch_get_main_queue 函数检索到主队列的句柄。

Concurrent Queues
为了执行异步和同步任务,你可以在 GCD 中检索到这写队列。多个并发队列能够轻而易举的并行执行多个任务,没有更多的线程管理,酷!使用 dispatch_get_global_queue 函数检索一个并发队列的句柄。


*Serial Queues*

无论你提交同步或者异步任务,这些队列总是按照先入先出(FIFO)的原则来执行任务,这就意味着它们一次执行一个 Block Object。然而,他们不在主线程上运行,所以对于那些要按照严格顺序执行并不阻塞主线程的任务而言是一个完美的选择。使用dispatch_queue_create 函数创建一个串行队列。一旦你使用完整队列,必须使用dispatch_release
 函数释放它。

在 APP 生命周期内的任何时刻,你可以同时使用多个分派队列。你的系统只有一个主队列,但是你可以创建多个串行队列来实现任何你需要 APP 实现的功能,当然是在合理的范围内。你也可以检索多个并发队列并将任务分派给它们,任务可以通过 2 种方式传递分派队列:Block Objects 和 C 函数


#Main Queue

##用 GCD 执行 UI-Related 任务

UI-Related:一个 APP 的主线程是处理 UI 事件的线程。如果你在主线程执行一个长时间运行的任务,就要注意 APP 的 UI 会没有响应或者响应缓慢。

有 2 种向主队列分派任务的方法,两者都是异步的,即使在任务没有执行的时候也让你
的程序继续:
dispatch_async function在分派队列上执行一个 Block Object。
dispatch_async_f function在分派队列上执行一个 C 函数。

Dispatch_sync 方法不能在主队列中调用,因为无限期的阻止线程并会导致你的应用死锁。所有通过 GCD 提交到主队列的任务必须异步提交。
示例代码：


```cpp
dispatch_queue_t mainQueue = dispatch_get_main_queue();
    dispatch_async(/*在这调度队列上任务将被执行;*/mainQueue,/*为了异步执行 Block Object 会被发送到调度队列*/ ^{
        [[[UIAlertView alloc] initWithTitle:@"GCD"
                                    message:@"GCD is amazing!"
                                   delegate:nil cancelButtonTitle:@"OK"
                          otherButtonTitles:nil, nil] show];
        NSLog(@"~~~~~~~~~~~~%@",[NSThread currentThread]);
    });
```







#Concurrent Queues
##用 GCD 同步执行 Non-UI-Related 任务

你可以使用下面这些值作为 Dispatch_get_global_queue 函数的第一个参数:

DISPATCH_QUEUE_PRIORITY_LOW:您的任务比正常任务用到更少的 Timeslice。
DISPATCH_QUEUE_PRIORITY_DEFAULT:执行代码的默认系统优先级将应用于您的任务。
DISPATCH_QUEUE_PRIORITY_HIGH 和正常任务相比,更多的 Timeslices 会应用到你的任务中。
 Dispatch_get_global_queue 函数的第二个参数已经保存了,你只要一直给它输入数值 0就可以了。


示例代码：



```cpp
void(^printFrom1TO1000)(void) = ^{
    NSInteger counter = 0;
    for (counter = 1;counter <= 1000;counter++)
    {
        NSLog(@"Counter = %lu - Thread = %@",(unsigned long)counter, [NSThread currentThread]);
    }
};
```




```cpp
 /*你会发现下面这段代码计数发生在主线程,即使你已经要求过并发队列执行这 个任务。事实证明这是 GCD 的优化。Dispatch_sync 函数将使用当前线程——你分配任务 时使用的线程——任何可能的情况下,作为优化的一部分会被编程到 GCD。*/
    dispatch_queue_t concurrentQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_sync(concurrentQueue, printFrom1TO1000);
```



#Serial Queues
##用 GCD构建自己的调度队列

串行调度队列按照先入先出(FIFO)的原则运行它们的任务。然而,串行队列上的异步任务不会在主线程上执行,这就使得串行队列极需要并发 FIFO 任务。所有提交到一个串行队列的同步任务会在当前线程上执行,在任何可能的情况下这个线程会被提交任务的代码使用。但是提交到串行队列的异步任务总是在主线程以外的线程上执行。

我们将使用 dispatch_queue_create 函数创建串行队列。这个函数的第一个参数是 C 字符串(char *),它将唯一标识系统中的串行队列。
示例代码：


```cpp
dispatch_queue_t firstSerialQueue = dispatch_queue_create("com.pixolity.GCD.serialQueue1", 0); dispatch_async(firstSerialQueue, ^{
NSUInteger counter = 0;
for (counter = 0; counter < 5; counter++){
NSLog(@"First iteration, counter = %lu", (unsigned long)counter); }
}); dispatch_async(firstSerialQueue, ^{
NSUInteger counter = 0; for (counter = 0;
counter < 5;
counter++){
NSLog(@"Second iteration, counter = %lu", (unsigned long)counter);
} });
dispatch_async(firstSerialQueue, ^{ NSUInteger counter = 0;
for (counter = 0;
counter < 5;
counter++){
NSLog(@"Third iteration, counter = %lu", (unsigned long)counter);
} });
dispatch_release(firstSerialQueue);
```
