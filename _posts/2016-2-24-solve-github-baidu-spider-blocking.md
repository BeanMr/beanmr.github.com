---
layout: post
title: "解决GitHub Pages屏蔽百度爬虫的方法"
categories:
- Jekyll
tags:
- github
- seo
---
Github屏蔽百度爬虫导致在Github Pages上托管的博客、网站都无法被百度索引到，但对于国内的小伙伴尤其是还在上学的未来的程序员们百度还是一个重要的检索渠道。已经有小伙伴在这方面做了尝试并且进行了全面的分析，这里我仅仅介绍一下个人的做法。这个博客也托管在Github Pages上，个人没有虚拟主机、域名也懒得备案，主要就是通过SAE的免费主机加智能DNS解决的。


> 新浪云开始征收每天10云豆（一毛钱）的最低租金，此方案不再严格完全免费。
>
> 但充值200元可以在新浪云代办网站备案，之后采用七牛方案也是个不错的选择。
>
> 文章关键点在于智能DNS的应用故保留此文章于此

可行性及原理分析
---------------
已经有小伙伴在这方面做了尝试，[文章](http://jerryzou.com/posts/feasibility-of-allowing-baiduSpider-for-Github-Pages/?utm_source=tuicool)从原理到实践写的很详尽。其主要思路是，希望通过CDN的缓存拦截百度爬虫访问Github服务器，防止百度爬虫到Github服务器被暴揍。但是从CDN的角度，各个厂商还专门发展`搜索引擎自动回源`所以人家本身就不是准备干这活的。最后小伙伴也采用了个人虚拟主机的方案而且提供了Github的Webhook自动部署实践的介绍。这位叫Jerry的小伙伴棒棒嗒！

另外也有一部分使用七牛存储的小伙伴，尝试通过在七牛上保存网站的静态文件镜像来服务百度爬虫。主要的优势是七牛的流量和空间很足，只要充值10元就可以绑定自定义域名；但是死穴在于像我这种懒得备案的域名七牛不允许绑定。

小站最后采用了新浪云主机(SAE)+智能DNS(本人万网)+百度云CDN解决。思路上还是智能DNS针对来自百度解析线路的请求指向SAE服务器，SAE服务器保存Jekyll生成的静态文件当镜像。使用百度CDN的原因并不是为了加速，而是因为百度爬虫机器好像几乎不鸟万网的智能DNS，也就是说万网经常错误返回给百度默认的结果，但所幸对百度CDN的DNS同步做的很好所以加了这个中间层。

如果万网智能DNS很好用理想的路径如下：

![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-1.png'}} )

添加了百度CDN以后的路径如下：

![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-2.png'}} )

有趣的是百度云CDN有两个而且两个都是真的，一个是我用的免费的[百度云加速](http://su.baidu.com/)另一个是百度云CDN。

操作手册
----------------
1. 注册SAE的账号并创建一个`PHP空应用`；因为PHP的应用收费最低基本每天几个云豆，点我的连接注册送1000云豆够用好久了，我们只拿它当是一个Nginx服务器用。》》》[点我注册啊](http://t.cn/RGKjo3K)《《《
![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-3.png'}} )
2. 从应用后台获取代码管理地址，我选用的是git仓库方式。用Github Pages的朋友没有不会的吧，注意因为SAE支持多版本部署所以push的时候要指定。

	```
	git remote add sae https://git.sinacloud.com/应用名
	```

	```
	git push sae master:1
	```
3. `jekyll clean` `jekyll build` 拷贝`_site`到SAE的git然后push
4. 通过SAE的提供的应测试你的站点 http://应用名.applinzi.com/
5. 到百度云加速添加自己的网站
![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-4.png'}} )
6. 配置你的DNS服务并测试
![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'-5.png'}} )
7. 手工同步部分：因为我做了文章和Jekyll源码的分离发布文章总要执行命令所以写了脚本