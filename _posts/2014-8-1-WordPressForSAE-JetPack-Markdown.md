---
layout: post
title: "WordPress for SAE安装JetPack使用Markdown"
categories:
- Blog
tags:
- WordPress
- SAE
- JetPack
- Markdown
- Troubleshooting
---
WordPress for SAE安装JetPack使用Markdown
======================
至于说为什么选Wordpress而且是WordPress for SAE做个人的博客，答案就一个字“省事”。

PS：现在在GitHub上了“省事” “省钱” “貌似很拽”！

想用Markdown写东西，网上有WP的Markdown支持方法，他们需要考虑老数据转换的问题，所以看上去挺繁琐的。我的新博虽然没有老数据转换的问题，但也不想那么弄。毕竟每个解析程序生成的HTML都会有大大小小的差异，如果文章固定在WP的Markdown上如果以后转换也是麻烦。

就还用Stackedit写Markdown然后直接用它将转换成HTML往博客里面发布，又省事又不用老开着博客。
这个功能其实Stackedit本身就有的，但是在折腾的时候也有点小问题所以就记录在这里。

实现
=============
使用Stackedit自身的发布到WP的功能

问题
=============
1. Stackedit的发布需要WP有[Jetpack plugin](http://jetpack.me/ 'Jetpack')的支持
2. 当前的Jetpack默认要求Wordpress 3.5以上
3. WordPress for SAE的WP是3.4.1而且不能升级WP
4. WP被墙着呢

解决
=============
解决方案很简单那就是找个能适用于3.4.1的Jetpack就可以了。我尝试了几个版本最后发现2.2版本就可以用，但是发行包估计找不到了在这里给打架贡献一下地址。在Jetpack的SVN的[这里](http://plugins.svn.wordpress.org/jetpack/branches/2.2)签出就搞定了。因为WP被墙着开始配置的时候大家自行解决就好了。