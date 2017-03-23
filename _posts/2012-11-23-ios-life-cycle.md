---
layout: post
title: iOS的init、loadView、viewDidLoad、viewDidUnload的关系
date: 2012-11-23 16:03
categories: []
tags: []
---

原帖地址：[http://www.cocoachina.com/applenews/devnews/2012/1120/5134.html](http://www.cocoachina.com/applenews/devnews/2012/1120/5134.html)
init方法
在init方法中实例化必要的对象（遵从LazyLoad思想）
init方法中初始化ViewController本身

loadView方法
当view需要被展示而它却是nil时，viewController会调用该方法。不要直接调用该方法。
如果手工维护views，必须重写该方法。
如果使用IB维护views，必须不能重写该方法。
loadView和IB构建view

viewDidLoad方法
重写该方法以进一步定制view。
在iPhone OS 3.0及之后的版本中，还应该重写viewDidUnload来释放对view的任何索引。
viewDidLoad后调用数据Model。

viewDidUnload方法
当系统内存吃紧的时候会调用该方法（注：viewController没有被dealloc）。
内存吃紧时，在iPhone OS 3.0之前didReceiveMemoryWarning是释放无用内存的唯一方式，但是OS 3.0及以后viewDidUnload方法是更好的方式。
在该方法中将所有IBOutlet（无论是property还是实例变量）置为nil（系统release view时已经将其release掉了）。
在该方法中释放其他与view有关的对象、其他在运行时创建（但非系统必须）的对象、在viewDidLoad中被创建的对象、缓存数据等。
release对象后，将对象置为nil（IBOutlet只需要将其置为nil，系统release view时已经将其release掉了）。
一般认为viewDidUnload是viewDidLoad的镜像，因为当view被重新请求时，viewDidLoad还会重新被执行。
viewDidUnload中被release的对象必须是很容易被重新创建的对象（比如在viewDidLoad或其他方法中创建的对象），不要release用户数据或其他很难被重新创建的对象。

dealloc方法
viewDidUnload和dealloc方法没有关联，dealloc还是继续做它该做的事情。
举例：

```cpp
- (void)viewDidUnload

{   

self.startButton = nil;  

[setupViewController release];

  setupViewController = nil;

}

- (void)dealloc

{  

[startButton release];

  [setupViewController release];

  [super dealloc];

}
```


loadView 手动加载view
viewDidLoad用于nib文件加载后，进一步处理
viewDidUnload是viewDidLoad的镜像
参考官方文档，我给出纠正：

一、loadView

永远不要主动调用这个函数。view controller会在view的property被请求并且当前view值为nil时调用这个函数。如果你手动创建view，你应该重载这个函数。如果你用IB创建view并初始化view controller，那就意味着你使用initWithNibName:bundle:方法，这时，你不应该重载loadView函数。

这个方法的默认实现是这样：先寻找有关可用的nib文件的信息，根据这个信息来加载nib文件，如果没有有关nib文件的信息，默认实现会创建一个空白的UIView对象，然后让这个对象成为controller的主view。所以，重载这个函数时，你也应该这么做。并把子类的view赋给view属性(property)（你create的view必须是唯一的实例，并且不被其他任何controller共享），而且你重载的这个函数不应该调用super。

如果你要进行进一步初始化你的views，你应该在viewDidLoad函数中去做。在iOS 3.0以及更高版本中，你应该重载viewDidUnload函数来释放任何对view的引用或者它里面的内容（子view等等）。这个网上的资料都说的很不全面，尤其是蓝色字部分。

二、viewDidLoad

这个函数在controller加载了相关的views后被调用，而不论这些views存储在nib文件里还是在loadView函数中生成。而多数情况下是做nib文件的后续工作。网上资料对这个函数的描述则完全不对。

三、viewDidUnload

这个函数是viewDidLoad的对立函数。在程序内存欠缺时，这个函数被controller调用（）。由于controller通常保存着与view（这里黑体的view指controller的view属性）相关的对象（一般是view的子view）或者其他运行时创建的对象的引用，所以你必须使用这个函数来放弃这些对象的所有权以便内存回收。但不要释放那些难以重建的数据（不要在这个函数中释放view）。

通常controller会保存nib文件建立的views的引用，但是也可能会保存着loadView函数创建的对象的引用。最完美的方法是使用合成器方法：
self.myCertainView = nil;

这样合成器会release这个view，如果你没有使用property，那么你得自己显式释放这个view。网上对这个函数的描述含含糊糊，看了等于没看。

另外：如果controller存储了其他object和view的引用，你还得在dealloc方法中释放这些内存。对于iOS2.x，你还必须在调用super dealloc方法前将这些引用置为nil。

四、结论

所以流程应该是这样：
(loadView/nib文件)来加载view到内存 ——>viewDidLoad函数进一步初始化这些view ——>内存不足时，调用viewDidUnload函数释放views
—->当需要使用view时有回到第一步
