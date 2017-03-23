---
layout: post
title: C++笔记
date: 2012-11-18 09:34
categories: []
tags: []
---

inline函数（内联函数）和define（预定义）的作用相似，但却有不同之处：
比如，预定义一个求平方的方法：（编译环境是Xcode）


```cpp
#include <iostream>
using namespace std;
#define SQUARE(x) x*x
int main (int argc, const char * argv[])
{
    //内联函数，在成员函数里不含有循环体，则默认为内联函数
    int theSquare (int a);
    // 从下面可以看出预定义与内联函数作用的区别
    cout<<SQUARE(1+2)<<endl;
    cout<<theSquare(1+2)<<endl;
    return 0;
}
inline int theSquare (int a)
{
    return a*a;
}
```

输出结果：


```cpp
[Switching to process 1394 thread 0x0]
5
9
Program ended with exit code: 0
```

与预定义不同的是，内联函数在运算时先把参数计算出来再代入算法之中。

在C++中可以用class和struct声明一个类：
用struct声明


```cpp
struct function
{
    int firstNumber;
    int secondNumber;

    int sum(int a,int b)
    {
        return a+b;
    }
};

```


```cpp
    cout<<f1.sum(5, 8)<<endl<<f1.firstNumber<<endl;

```
输出结果：
```cpp
13
0
```
用class声明


```cpp
class function
{
    public:
    int firstNumber;
    int secondNumber;
    public:
    int sum(int a,int b)
    {
        return a+b;
    }
};

```

输出结果与上面一样，那么两者有什么区别呢？
用struct声明的类中如果不写public、private的话，系统默认里面的变量和成员函数是公用的
而用class声明的类中默认为私有变量和私有成员函数
