---
layout: post
title: "[JVM]从硬件看Java系列"
categories:
- JVM
tags:
- JVM
- Hardware
---
`Mechanical Sympathy`这个短语描述了一种车手对汽车天生的感觉，也是[Martin Thompson大牛的博客](http://mechanical-sympathy.blogspot.sg/)标题。从[并发编程网Disruptor](http://ifeve.com/disruptor-cacheline-padding/)的介绍中注意到这个短语，再去品位Martin对它的简短阐述'Hardware and software working together in harmony'的确很有道理。在对任何语言的深入学习研究中，总逃不过对底层硬件的了解与学习，很多语言的特性、行为在硬件的角度去观察就很容易解释了；另外在追求语言的更高性能的过程中，也要更多去了解硬件的知识，让软件更加匹配硬件的特性、更好利用硬件的优化才能获得更高的优化效果。



硬件工程师的杰作
--------------------
今天互联网的繁荣是站在硬件工程师的伟大杰作之上的。使硬件更加高效一个途径是提高硬件的运行速度，另外一个途径就是让可以任务并行起来。随之而来的就是缓存、并发、同步等一些列设计和优化，现代计算机的异步特性加之这些优化使得软件系统在多线程的情况下常常出现背离`程序直觉`的情况。作为一个高级语言开发者了解硬件就是为去体味`Mechanical Sympathy`，去了解硬件工程师的用心良苦让软件与硬件更加匹配。

很早很早以前图灵先生画了一个盒子把人们圈到了现在。

![Turing Machine]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-1.jpg' }} )

这个盒子有一条纸带和一个规则表格还有一个内部状态存储，当然还有一个用来读、写纸带的读写头。整个过程模拟了人类在算草纸进行运算的过程：在纸上写或擦除一个符号；将注意力从一个位置转移到另外一个位置。

言归正传虽然现代计算器体系还在这个圈圈之中，但是整体的结构已经变得极度复杂了。
下图是一个CPU的逻辑组成，貌似简单几个框框其实涵盖了很多内容。

![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-cpu.jpg'}} )

CPU作为整个计算机系统的大脑，它负责处理所有类型数据的运算工作(其实还有各式各样的协处理器帮忙)。

内存和存储单元(MU)负责保存数据、中间结果、程序指令。


It stores data, intermediate results and instructions(program).

It controls the operation of all parts of computer.

CPU itself has following three components.

Memory or Storage Unit
Control Unit
ALU(Arithmetic Logic Unit)

Memory or Storage Unit
This unit can store instructions, data and intermediate results. This unit supplies information to the other units of the computer when needed. It is also known as internal storage unit or main memory or primary storage or Random access memory(RAM).

Its size affects speed, power and capability. Primary memory and secondary memory are two types of memories in the computer. Functions of memory unit are:

It stores all the data and the instructions required for processing.

It stores intermediate results of processing.

It stores final results of processing before these results are released to an output device.

All inputs and outputs are transmitted through main memory.

Control Unit
This unit controls the operations of all parts of computer but does not carry out any actual data processing operations.

Functions of this unit are:

It is responsible for controlling the transfer of data and instructions among other units of a computer.

It manages and coordinates all the units of the computer.

It obtains the instructions from the memory, interprets them, and directs the operation of the computer.

It communicates with Input/Output devices for transfer of data or results from storage.

It does not process or store data.

ALU(Arithmetic Logic Unit)
This unit consists of two subsections namely

Arithmetic section
Logic Section
Arithmetic Section
Function of arithmetic section is to perform arithmetic operations like addition, subtraction, multiplication and division. All complex operations are done by making repetitive use of above operations.

Logic Section
Function of logic section is to perform logic operations such as comparing, selecting, matching and merging of data.


缓存系统
====================

并行-位并行
====================

并行-指令并行
====================

并行-数据并行
====================











