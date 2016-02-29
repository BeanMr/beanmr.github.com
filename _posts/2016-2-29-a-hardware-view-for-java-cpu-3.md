---
layout: post
title: "Java工程师要懂的硬件知识-CPU-3-Java与分支预测"
categories:
- Fundamental
tags:
- Hardware
- CPU
- Instruction-PipeLine
- Branch-Prediction
---
本文将按照从整体到局部的顺序一步步深入介绍现代CPU的结构组成；然后再在CPU简化结构的基础上，根据指令执行的过程一步步的分析CPU的执行阶段，并着重介绍指令流水线、乱序执行和分支预测这些广泛应用的优化技术及这些优化造成的冒险(Hazards)；最后再通过一段Java代码去印证所介绍的内容，去体会Java中的`Mechanical Sympathy`。



Java中的分支预测
=================
本系列之前文章介绍了Java工程师应该了解的CPU相关的一些内容。本文将用一段Java代码去印证、分析上文中介绍的`分支预测`对Java程序的影响，去体会Java中的`Mechanical Sympathy`。

如下代码，准备一个随机数组成的数组作为测试对象，遍历数组并判断如果元素的值大于128则将此元素累加到sum之上。这样的场景在日常开发中非常常见，比如对某一批订单数据需要根据订单的来源和订单的类型的采用不同的流程分支去处理的需求。

演示程序将分别采用`直接遍历`，`排序后遍历`，`条件分支语句代替if判断`三种方式实现，并在`Intel Core i7`的`Mac OS 10.11.3`下采用默认安装的`JDK1.8`运行。本文将结合之前的内容分析耗时结果，希望各位也在自己的设备上加以验证并在评论中与大家分享自己的结果数据。

{% highlight java%}
package com.beanmr.blog.javase.jvm.pipeline;

import java.util.Arrays;
import java.util.Random;

/**
 * Desc:Branch-Prediction In Java Demo
 * ------------------------------------
 * Author:beanmr
 * Date:16/2/20
 * Time:下午11:04
 */
public class BranchPredictionTest {
    public static void main(String[] args)
    {
        // Generate data
        int arraySize = 32768;
        int data[] = new int[arraySize];

        Random rnd = new Random();
        for (int idx = 0; idx < arraySize; idx++)
            data[idx] = rnd.nextInt(256);
        //do Sum without sort
        long start = System.nanoTime();
        doSum(arraySize, data);
        long end = System.nanoTime();
        System.out.println("Sum Without Sort : " + (end - start) / 1000000000.0);

        long sortStart = System.nanoTime();
        Arrays.sort(data);

        long sumStart = System.nanoTime();
        doSum(arraySize, data);
        end = System.nanoTime();
        System.out.println("Sort Cost : " + (sumStart - sortStart) / 1000000000.0);
        System.out.println("Sum Cost : " + (end - sumStart) / 1000000000.0);
        System.out.println("Sort&Sum Cost : " + (end - sortStart) / 1000000000.0);

        start = System.nanoTime();
        doSumWithConditionalOp(arraySize, data);
        end = System.nanoTime();
        System.out.println("Sum With ConditionalOp : " + (end - start) / 1000000000.0);

    }

    private static void doSum(int arraySize, int[] data) {
        long sum = 0;
        for (int i = 0; i < 100000; ++i) {//amplify loop
            // Primary loop
            for (int idx = 0; idx < arraySize; ++idx) {
                if (data[idx] >= 128)
                    sum += data[idx];
            }
        }
        System.out.println("sum = " + sum);
    }

    private static void doSumWithConditionalOp(int arraySize, int[] data) {
        long sum = 0;
        for (int i = 0; i < 100000; ++i) {//amplify loop
            // Primary loop
            for (int idx = 0; idx < arraySize; ++idx) {
                sum += (data[idx] >= 128 ? data[idx] : 0);
            }
        }
        System.out.println("sum = " + sum);
    }


}
{% endhighlight %}


敬请期待以下内容：
=================

结果解读
=================

分支预测
-----------------

条件语句
-----------------
