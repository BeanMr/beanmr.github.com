---
layout: post
title: "SublimeText自定义代码片段"
categories:
- Tools
tags:
- SublimeText
---
写文章或者写代码时常常要输入一些模板型的代码片段。模块代码片段有的已经在IDE中内嵌，但是像下面这种自定义的规则就需要自己定制了。比如下面这个语句就是我自定义的在文章中插入图片的片段；我没有使用固定的路径；我与自己约定，文章的图片存放在`/{media_repos}/文章文件名/图片文件`位置上。

{% raw %}
    ![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'/1.png'}} )
{% endraw %}

在SublimeText中自定代码片段的方法如下：

1. 找到Package文件夹
![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'/1.png'}} )
2. 进入Package>User>新建文件  文件名为 `tag_name.sublime-snippet`
![img]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'/2.png'}} )
3. 文件内容如下，保存并重启Sublime即可
{% codeblock lang:xml %}{% raw %}
<snippet>
	<content><![CDATA[
![${2:img}]({{ page.path|remove:'_posts/'|remove:'.md'|prepend:site.media_repos|append:'/${1:1}.png'}} ${3})
]]></content>
	<!-- 可选: 键入以下内容按Tab触发片段替换 -->
	<tabTrigger>postimg</tabTrigger>
	<!-- 可选: 在哪类文件中生效 -->
	<!-- <scope>source.md</scope> -->
</snippet>
{% endraw%}{% endcodeblock %}


>自定义代码片段支持变量替换其中`${2:img}`代表变量替换；其中2代表片段替换后光标定位顺序，img代表此变量默认值。片段替换以后按Tab即可以进行光标依次定位。

>{%raw%}{%raw%}标签 使liquid不渲染其内部内容{%endraw%}