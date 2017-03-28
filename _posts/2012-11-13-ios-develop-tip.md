---
layout: post
title: ios开发剪辑集锦
date: 2012-11-13 11:51
categories: []
tags: iOS
---
#iOS 声明属性关键字:

atomic:


原子操作（原子性是指事务的一个完整操作，操作成功就提交，反之就回滚. 原子操作就是指具有原子性的操作）在objective-c 属性设置里面默认的就是atomic，意思就是setter/getter函数是一个原子操作，如果多线程同时调用setter时，不会出现某一个线程执行完setter所有语句之前，另一个线程就开始执行setter，相当于函数头尾加了锁. 这样的话并发访问性能会比较低.
nonatomic:
非原子操作 一般不需要多线程支持的时候就用它，这样在并发访问的时候效率会比较高. 在objective-c里面通常对象类型都应该声明为非原子性的. iOS中程序启动的时候系统只会自动生成一个单一的主线程.程序在执行的时候一般情况下是在同一个线程里面对一个属性进行操作. 如果在程序中我们确定某一个属性会在多线程中被使用，并且需要做数据同步，就必须设置成原子性的，但也可以设置成非原子性的，然后自己在程序中用加锁之类的来做数据同步.
在头文件中声明属性的时候使用atomic 和 nonatomic等价于在头文件里面添加2个函数一个是用于设置这个属性的，一个是用于读取这个属性，例如：- (nsstring *)name; - (void)setName:(NSString *)str;
atomic / nonatomic 需要和@synthesize/@dynamic配和使用才有意义.
@synthesize
如果没有实现setter和getter方法，编译器将会自动在生产setter和getter方法。
@dynamic
表示变量对应的属性访问器方法,是动态实现的,你需要在 NSObject中继承而来的+(BOOL) resolveInstanceMethod:(SEL) sel 方法中指定动态实现的方法或者函数。
##
@synchronized
作用：保证此时没有其他线程对self对象进行修改




属性修饰其他关键字：
getter=getterName
指定get方法，并需要实现这个方法。必须返回与声明类型相同的变量，没有参数
setter=setterName
指定set方法，并需要实现这个方法。带一个与声明类型相同的参数，没有返回值（返回空值）
当声明为readonly的时候，不能指定set方法
readwrite
如果没有声明成readonly，那就默认是readwrite。可以用来赋值，也可以被赋值
readonly
不可以被赋值
assign
所有属性都默认assign，通常用于标量（简单变量 int， float，CGRect等）
一种典型情况是用在对对象没有所有权的时候，通常是delegate，避免造成死循环（如果用retain的话会死循环）
retain
属性必须是objc对象，拥有对象所有权，必须在dealloc中release一次。
copy
属性必须是objc对象，拥有对象所有权，必须在dealloc中release一次。且属性必须实现NSCopying协议
一般常用于NSString类型
                                             ---------------------参考自：[http://www.linuxidc.com/Linux/2012-07/66793.htm](http://www.linuxidc.com/Linux/2012-07/66793.htm)



#ios delegate你必須知道的事情
當你開始寫iOS程式不久，應該開始面對到很多的delegate，
不管是用別人的library或是自己寫library，可能都逃不了delegate。
為了怕有些人不知道什麼是delegate，在這邊簡單的介紹一下，
delegate中文叫做委託，通常會用在class內部把一些事件處理"委託"給別人去完成。
舉個例子，XML Parser可能他知道怎麼parse xml，但是parse到的東西要怎麼處理xml parser可能不知道。
所以NSXMLParser就提供了一個NSXMLParserDelegate給client去實作，
當parse到某個element的時候，就callback delegate所定義的message，
讓他client自己去決定怎麼去處理這個element。
好吧，我承認我解釋的很模糊，不過我這篇本來就不是要你搞懂什麼是delegate，
而是針對使用或是設計delegate的時候，可能會要注意的事情。

在我們的class中設計delegate的時候，我們通常會有幾個注意事項。
假設我的class叫做MyClass，那我們可能會有定義一個MyClassDelegate這個protocol當作我的delegate protocol。
而MyClass中我們可能是這樣寫。
	@protocol MyClassDelegate <NSObject>
	- (void) myClassOnSomeEvent:(MyClass*)myClass;[@end](http://my.oschina.net/u/567204)[@interface](http://my.oschina.net/interface)  MyClass
	{
	    id<MyClassDelegate> _delegate;
	}
	@property (nonatomic, assign) delegate;[@end](http://my.oschina.net/u/567204)
上面的code我們注意到 delegate此property是定義為 @property (assign)。
為什麼我們不用retain而要用assign呢?
原因就是在於iOS的reference counting的環境中，我們必須解決circular count的問題。
讓我們來寫寫我們平常都怎麼用delegate的，下面的code我想大家應該不陌生
	- (void)someAction
	{
	   myClass = [MyClass new];
	   myClass.delegate = self;
	   ....
	}
這邊很快的就出現circular reference了
假設上面的code是寫在一個myViewController的物件當中，
之後一旦myViewController的reference count變成1的時候，
myViewController跟myClass這兩個兄弟兩只剩下互相retain，那就變成了孤島，也就因此造成了memory leak!!! 

也因為這樣，iOS官方文件才會要建議我們所以的delegate都要用assign property。
也就是所謂"weak reference"的property，他的特色就是雖然會持有對方的reference，但是不會增加retain count。
如此下來，當myViewController的retain count變成0，則會dealloc。
同時在dealloc中，也一併把myClass release，則myClass也跟著被release。
	- (void)dealloc
	{
	   [myClass release];
	   [super dealloc];
	}


事情就結束了嗎? 還沒有唷...
這邊還有一個大家常常忘記的重點，那就是上面的dealloc這樣寫會有潛在危險。
應該要改成這樣
	- (void)dealloc
	{
	   myClass.delegate = nil;    [myClass release];
	   [super dealloc];
	}
你可能會很納悶，myClass不是馬上就會被release了嗎? 幹嘛要先把他的delegate設成nil?
那是因為我們假設myClass會馬上會被dealloc，但是現實狀況這個是不一定的，
有可能裡面內部有建個NSURLConnection，或是正在做某件事情而讓其他物件也retain myClass。
如果myClass沒有馬上dealloc，那他的 myClass.delegate不就正指向一個不合法的位置了嗎? (此種pointer稱作dangling pointer)


解決方法是在MyViewController的dealloc中，在release myClass之前，
要先把原本指向自己的delegate改設成nil，這樣才可以避免crash發生。
在我之前寫的project，很大一部份的crash都是這樣造成的，因為這個問題通常不是每次都發生，
但是發生的時候確很難在重新複製，所以不可不慎啊。


但是很興奮的是到了iOS5中的 [Automatic Reference Counting](http://popcornylu.blogspot.com/2011/06/arc-automatic-reference-counting.html)這個問題可以有所改善。
在ARC中提出了一個新的weak reference的概念來取代原本的assign，
weak reference指到的物件若是已經因retain count歸零而dealloc了，則此weak reference也自動設成nil。
而原本舊的這種assign的作法，在ARC中叫做__unsafe_unretained，這只是為了相容iOS4以下的版本。

回顧重點:
如果你是寫library給別人用的，記得把你的delegate設成assign property，這樣才不會造成circular reference
當你是要始用別人的library，記得在你自己dealloc的時候，把delegate設成nil，以避免crash的事情發生。
                                                                                                     -------------------------------------------------------摘抄自：[http://popcornylu.blogspot.com/2011/07/delegate.html](http://popcornylu.blogspot.com/2011/07/delegate.html)

#将UIView转成UIImage


```cpp
- (UIImage*) imageWithUIView:(UIView*) view{
    // 创建一个bitmap的context  
    // 并把它设置成为当前正在使用的context  
    UIGraphicsBeginImageContext(view.bounds.size);  
    CGContextRef currnetContext = UIGraphicsGetCurrentContext();
    //[view.layer drawInContext:currnetContext];
    [view.layer renderInContext:currnetContext];
    // 从当前context中创建一个改变大小后的图片  
    UIImage* image = UIGraphicsGetImageFromCurrentImageContext();  
    // 使当前的context出堆栈  
    UIGraphicsEndImageContext();  
    return image;

}
```


                                                                                                     -------------------------------------------------------摘抄自：[http://blog.csdn.net/iukey/article/details/7662612](http://blog.csdn.net/iukey/article/details/7662612)
