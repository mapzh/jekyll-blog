---
layout: post
title: 九宫图、四四图、五五图and so on
date: 2012-11-25 11:12
categories: []
tags: []
---


参考自百度百科

n行n列的纵横图又称为幻方。

九宫图：
在射雕里面，黄蓉对瑛姑说的一段口诀很好记忆：“九宫之义，法以灵龟。二四为肩，六八为足，左三右七，戴九履一，五居中央。”
![](http://img.blog.csdn.net/20140408114737812?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbXB6MTI5/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
最简单的幻方就是平面幻方，还有立体幻方、高次幻方等。对于立体幻方、高次幻方目前世界上很多数学家仍在研究，现在只讨论平面幻方。　　
对平面幻方的构造，分为三种情况：N为奇数、N为4的倍数、N为其它偶数(4n+2的形式）　
1、 N 为奇数时，最简单：　
　⑴ 将1放在第一行中间一列；　
　⑵ 从2开始直到n×n止各数依次按下列规则存放：　　按 45°方向行走，如向右上　　每一个数存放的行比前一个数的行数减1，列数加1
　⑶ 如果行列范围超出矩阵范围，则回绕。　　例如1在第1行，则2应放在最下一行，列数同样加1;　　
  ⑷ 如果按上面规则确定的位置上已有数，或上一个数是第1行第n列时，　　则把下一个数放在上一个数的下面。　　
2、N为4的倍数时　　采用对称元素交换法。　
　  首先把数1到n×n按从上至下，从左到右顺序填入矩阵　　然后将方阵的所有4×4子方阵中的两对角线上位置的数关于方阵中心作对　　称交换，即a(i,j）与a(n+1-i,n+1-j）交换，所有其它位置上的数不变。　　（或者将对角线不变，其它位置对称交换也可）　　
3、 N 为其它偶数时　　当n为非4倍数的偶数（即4n+2形）时：
首先把大方阵分解为4个奇数(2n+1阶）子方阵。　　按上述奇数阶幻方给分解的4个子方阵对应赋值　　上[左子](http://baike.baidu.com/view/3661848.htm)阵最小（i），下右子阵次小（i+v），下左子阵最大（i+3v），上右子阵次大（i+2v)　　即4个子方阵对应元素相差v，其中v=n*n/4　　四个子矩阵由小到大排列方式为

① ③　　
④ ②　　
然后作相应的元素交换：a(i,j）与a(i+u,j）在同一列做对应交换（j<t或j>n-t+2),　　a(t-1,0）与a(t+u-1,0）；a(t-1,t-1)与a(t+u-1,t-1)两对元素交换　　其中u=n/2，t=(n+2)/4 上述交换使每行每列与两对角线上元素之和相等。