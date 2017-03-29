---
layout: post
title: NSXMLParser 解析 XML
date: 2012-11-10 15:14
categories: []
tags: iOS
---
本文参考自iOS_Cookbook（下面只列出关键代码，如果看不懂有什么建议希望大家能提出来）

创建一个简单的 XML文件,包含如下内容(把他命名为 xmlFile.xml,然后添加到你的工程中):

```csharp
<?xml version="1.0" encoding="UTF-8"?>
<root>
    <person id="1">
        <firstName>Anthony</firstName>
        <lastName>Robbins</lastName>
        <age>51</age>
    </person>
    <person id="2">
        <firstName today="just study">Richard</firstName>
        <lastName words="This is just a joke">Branson</lastName>
        <age>61</age>
    </person>
</root>
```


为 XML对象创建一个对象模型。下面我们定义一个对象来代表 XML element,类名叫做 XMLElement

```csharp
#import <Foundation/Foundation.h>

@interface XMLElement : NSObject

@property (nonatomic,retain) NSString *name;
@property (nonatomic,retain) NSString *text;
@property (nonatomic,retain) NSDictionary *attributes;
@property (nonatomic,retain) NSMutableArray *subElements;
@property (nonatomic,retain) XMLElement *parent;
@end
```



实现 XMLElement类:

```csharp
#import "XMLElement.h"

@implementation XMLElement
@synthesize name;
@synthesize text;
@synthesize attributes;
@synthesize subElements;
@synthesize parent;

- (void)dealloc
{
    [name release];
    [text release];
    [attributes release];
    [subElements release];
    [parent release];
    [super dealloc];
}

/*
    我只想当访问 subElements 数组的时候,如果该数组是 nil,才进行初始化。因此我把这 个属性的内存分配和初始化代码放到了它的 getter 方法中。如果说一个 XML element 没有子 elements,那么我们永远都不会使用到这个属性,因此这里也就不会为那个 element 分配内 存和进行初始化工作。这种技术叫做 lazy allocation。
 */
- (NSMutableArray *)subElements
{
    if (subElements == nil) {
        subElements = [[NSMutableArray alloc] init];
    }
    return subElements;
}
@end
```

 
新建一个类，通过实现 NSXMLParser的协议来进行 XML内容的解析
在.h文件中添加一下属性：

```csharp
//定义一个 NSXMLParser 类型的属性
@property (nonatomic,retain) NSXMLParser *xmlParser;

/*
    currentElementPoint 代表此刻在 XML 文件结构中,正在解析的 XML element,因此, 可以上移或者下移这个结构,来当做我们解析的文件内容。它是一个简单的指针,反之, rootElement 总是指向 XML 文件的 root element
 */
@property (nonatomic,retain) XMLElement *currentElementPoint;

@property (nonatomic,retain) XMLElement *rootElement;
```

 
在.m文件中实现:

```Objective-C
@synthesize xmlParser;
@synthesize window = _window;
@synthesize currentElementPoint;
@synthesize rootElement;
- (void)dealloc
{
    [_window release];
    [xmlParser release];
    [currentElementPoint release];
    [rootElement release];
    [super dealloc];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]] autorelease];
    // Override point for customization after application launch.
    self.window.backgroundColor = [UIColor whiteColor];

    /*
        把文件内容读取到一个 NSData 实例对象中,然后使用 initWithData:来初始化我们 的 XML parser,并把我们从 xml 文件中读取出来的数据传递进去。之后我们可以调用 XML parser 的 parse 方法来开始解析处理。这个方法会阻塞当前线程,直至解析处理结束。如果 你需要解析的 XML 文件非常大,强烈建议使用一个全局的 dispatch 队列来进行解析。
     */
    NSString *xmlPath = [[NSBundle mainBundle] pathForResource:@"xmlFile" ofType:@"xml"];
    NSData *data = [[NSData alloc] initWithContentsOfFile:xmlPath];
    xmlParser = [[NSXMLParser alloc] initWithData:data];
    [data release];
    self.xmlParser.delegate = self;
    if ([self.xmlParser parse]) {
        NSLog(@"The xml is parsed!");
    }else
    {
        NSLog(@"The xml is not parsed!");
    }
    [self.window makeKeyAndVisible];
    return YES;
}

/*
 parserDidStartDocument:
 解析开始的时候调用该方法。
 parserDidEndDocument:
 解析结束的时候调用该方法。
 parser:didStartElement:namespaceURI:qualifiedName:attributes:
 在 XML document 中,当解析器在解析的时候遇到了一个新的 element 时会被调用该
 方法。
 parser:didEndElement:namespaceURI:qualifiedName:
 当前节点结束之后会调用。
 parser:foundCharacters:
 当解析器在解析文档内容的时候被调用。
 */

- (void)parserDidStartDocument:(NSXMLParser *)parser
{
    //重置属性
    self.currentElementPoint = nil;
    self.rootElement = nil;
}

- (void)parser:(NSXMLParser *)parser didStartElement:(NSString *)elementName namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qName attributes:(NSDictionary *)attributeDict
{
    //如果 root element 没有被创建,会被创建,并且开始解析一个新的 element,我 们会计算它在 XML 结构中的位置,并在当前 element 中添加一个新的 element。
    if (self.rootElement == nil) {
        self.rootElement = [[XMLElement alloc] init];
        self.currentElementPoint = self.rootElement;
    }else
    {
        XMLElement *newElement = [[XMLElement alloc] init];
        newElement.parent = self.currentElementPoint;
        [self.currentElementPoint.subElements addObject:newElement];
        self.currentElementPoint = newElement;
        [newElement release];
    }
    self.currentElementPoint.name = elementName;
    self.currentElementPoint.attributes = attributeDict;
    NSLog(@"!!!!!!!!!!!!!%@ = %@",elementName,attributeDict);
}

/*
    这个方法将会在解析 element 的时 候调用多次,因此我们需要确保已经为多次进入该方法做好了准备。例如,如果一个 element 的文本有 4000 个字符长度,解析器在第一次解析时,最多只能解析 1000 个字符, 之后在解析当前 element 时,调用 parser:foundCharacters:方法,每次都是 1000,因此需要 4 次
 */

- (void) parser:(NSXMLParser *)parser foundCharacters:(NSString *)string
{
    if ([self.currentElementPoint.text length] > 0) {
        self.currentElementPoint.text = [self.currentElementPoint.text stringByAppendingString:string];
    }else
    {
        self.currentElementPoint.text = string;
    }
    NSLog(@"~~~~~~~~~~%@",string);
}

/*
    当 解析至某个 element 尾部时,会调用该方法。在这里,我们只需要把当前 element 指针指向 当前 element 的上一级
 */
- (void) parser:(NSXMLParser *)parser didEndElement:(NSString *)elementName namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qName
{
    self.currentElementPoint = self.currentElementPoint;
}

- (void) parserDidEndDocument:(NSXMLParser *)parser
{
    NSLog(@"<<<<<<<<<<<<<<<<%@",self.currentElementPoint.text);
    NSLog(@"<<<<<<<<<<<<<<<<%@",self.currentElementPoint);
    NSLog(@"<<<<<<<<<<<<<<<<%@",self.currentElementPoint.parent.subElements);
    NSLog(@"<<<<<<<<<<<<<<<<%@",self.rootElement.text);
    NSLog(@"<<<<<<<<<<<<<<<<%@",self.rootElement.subElements);


    NSLog(@"<<<<<<<<<<<<<<<<%@",self.currentElementPoint.parent.text);

}
```

 
