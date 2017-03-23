---
layout: post
title: C++编写数据结构中的二叉树(前序，中序，后序遍历)
date: 2014-04-04 19:02
categories: []
tags: []
---
编译环境xCode 5.1
Two.h:


```cpp
#ifndef __OK__Two__
#define __OK__Two__

#include <iostream>
typedef struct List{
    char name[20];
    char desc[200];
    int num;
    List *next;
}List;


typedef struct myTree{
    int data;
    char stu_name[20];
    char desc[200];
    int num;
    myTree *lChild;
    myTree *rChild;
}tree;


class listtree {

public:
    void createTree(int,int[],char*[]);
    void preOrder(tree *);//前序遍历
    void inOrder(tree *);//中序遍历
    void postOrder(tree *);//后序遍历
    myTree *rootNode;
};


#endif /* defined(__OK__Two__) */

```

Two.cpp

```cpp
#include "Two.h"
void listtree::createTree(int count,int num[],char *names[]){
    int index = count;
    tree *currentNode = NULL;
    while (index) {
        tree *node = new tree;
        int id = count-index;
        node->data = num[id];
        strcpy(node->stu_name, names[id]);
        node->lChild = NULL;
        node->rChild = NULL;
        if (rootNode==NULL) {
            rootNode = node;

        }else{
            currentNode = rootNode;
            tree *thisNode = NULL;
            while (currentNode!=NULL) {
                thisNode = currentNode;
                if (currentNode->data>node->data) {
                    currentNode = currentNode->lChild;
                }else {
                    currentNode = currentNode->rChild;
                }
            }
            if(node->data>thisNode->data){
                thisNode->rChild = node;
            }else{
                thisNode->lChild = node;
            }
            currentNode = node;
        }
        index--;
    }
}
void listtree::preOrder(tree *node){
    if (node==NULL) {
        return;
    }
    std::cout<<node->data<<"++"<<node->stu_name<<"++"<<"\n";
    preOrder(node->lChild);
    preOrder(node->rChild);
}
void listtree::inOrder(tree *node){
    if (node==NULL) {
        return;
    }
    inOrder(node->lChild);
    std::cout<<node->data<<"++"<<node->stu_name<<"++"<<"\n";
    inOrder(node->rChild);
}
void listtree::postOrder(tree *node){
    if (node==NULL) {
        return;
    }
    postOrder(node->lChild);
    postOrder(node->rChild);
    std::cout<<node->data<<"++"<<node->stu_name<<"++"<<"\n";
}
```
