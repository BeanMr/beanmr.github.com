---
layout: post
title: "SVNManager用户和组权限报错"
categories:
- Tools
tags:
- SCM
- SVNManager
- Troubleshooting
---
SVNManager用户和组权限报错
==========================
SVNManager是非常受大家欢迎的一个SVN管理工具。

今天在帮朋友搭建时用户和组权限设定的功能不能正常工作，出现空白页面，查看后台Apache的日志发现报错如下：

{% highlight php %}
PHP Fatal error:  Class 'PEAR_ErrorStack' not found in 
/var/www/html/svnmanager/svnmanager/RepositoryModule/UserPrivilegesEditPage.php on line 203
{% endhighlight %}
问题出现在VersionControl_SVN版本不兼容问题，主要是默认的PHP版本太老了。
{% highlight bash %}
# pear list
VersionControl_SVN 0.5.1   alpha
{% endhighlight %}
需要依赖如下,各个版本的依赖情况可以到[这个][1]查看。

{% highlight php %}
pear/VersionControl_SVN requires PHP (version >= 5.3.0), installed version is 5.1.6
pear/VersionControl_SVN requires PEAR Installer (version >= 1.9.4), installed version is 1.4.9
pear/VersionControl_SVN requires package "pear/PEAR" (version >= 1.9.4), installed version is 1.4.9
{% endhighlight %}
替换老的版本，当然也可以升级PHP。

{% highlight bash %}
pear install VersionControl_SVN-0.3.4
{% endhighlight %}


[1]: http://pear.php.net/package/VersionControl_SVN/download/All
