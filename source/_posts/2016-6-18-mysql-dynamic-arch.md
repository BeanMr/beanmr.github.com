---
layout: post
title: "[回顾MySQL]体系结构-动态结构"
categories:
- MySQL
tags:
- MySQL
- Architecture
---
上一个章节从静态组成角度分析了MySQL服务器的组成部分；本章节从一个SQL执行的过程分析MySQL各个组件之间的协作和作用。


简单的说MySQL服务器正常启动以后，开始监听客户端的请求。客户端发送请求与服务器建立连接，之后客户端发送请求、接收返回。

# 服务器启动阶段

系统初始化模块会负责读取配置文件、初始化系统、申请内存创建系统需要的各种Cache、Buffer，这部分属于管理服务及工具组件，系统正常启动以后网络交互模块将监听指定的服务端口等待客户端的连接。

# 服务器与客户端建立连接

网络交互组件负责着监听客户端请求、交互协议处理；MySQL服务器与客户端之间采用[MySQL Client/Server Protocol](https://dev.mysql.com/doc/internals/en/client-server-protocol.html)进行交互，从5.7.12开始支持了新的交互协议[`X Procotol`](https://dev.mysql.com/doc/internals/en/x-protocol.html)这里有一篇[博文](http://mysqlserverteam.com/mysql-5-7-12-part-2-improving-the-mysql-protocol/)对其进行了介绍。

服务器与客户端之间建立连接的过程就是由这个协议规定的，如下图所示。在建立连接以后在ConnectionPool中就有一个独立的线程与客户端保持联系，并负责初期请求的转发、结果集的包装与发送。

> query_slow_log的时间包含网络发送的时间 结果集的大小、发送方式都会影响此数值

{% asset_img /connection-phase.png %}




## MySQL Client/Server Protocol

协议的设计上支持了以下特性：

1. SSL加密传输
2. 内容压缩传输
3. 用于交互功能(capabilities)和认证数据的连接阶段
4. 用于`Prepared Statments`和存储过程的[`command-phase`](https://dev.mysql.com/doc/internals/en/command-phase.html)

以下组件都是[MySQL Client/Server Protocol](https://dev.mysql.com/doc/internals/en/client-server-protocol.html)的实现，当前它们根据目的不同可能实现的是协议的不同子集：

1. Connectors (比如JDBC、ODBC等)
2. MySQL Proxy(比如`MySQL Proxy`/`360 Atlas`等代理服务机制)
3. [主从复制 Replication Protocol](https://dev.mysql.com/doc/internals/en/replication-protocol.html)

[MySQL Client/Server Protocol](https://dev.mysql.com/doc/internals/en/client-server-protocol.html)有以下协议子集：

1. Text Protocol
2. Prepared Statements
3. Stored Procedures
4. Replication Protocol
5. Row-Based Replication
6. Semi-Synchronous Replication

## Prepared Statements Protocol

Prepared Statements Protocol就是处理我们开发中最常用的PreparedStatement的协议。它的核心理念其实就是采用预编译或者参数化的手段来提升需要重复执行的语句总效率，当然还有另外一个选择PreparedStatement的核心理由那就是参数化的模板可以有效的防范SQL注入攻击。

其一般的工作流程成如下：

1. Prepare：应用程序创建Statement模板发送到DBMS，使用占位符来代替具体的数值。
2. DBMS对模板进行解析、编译、进行查询优化、执行计划制定等操作，并将结果暂存到服务器中。
3. 在Client调用Statement的时候，DBMS执行之前的计划并返回结果。
4. 另外因为语句进行过预编译所以服务器可以提前告知结果集的格式；那么采用Binary方式返回数据可以进一步提高信息熵，减少网络负载提高系统速度。

但是并不是所有的SQL语句都可以Prepared，这里有个[表格](http://dev.mysql.com/worklog/task/?id=2871)可以浏览一下。

## Text Protocol

相对而言Text Protocol更利于我们学习和分析，从它的定义中我们可以找到如下一系列的命令，这就是在后续CS交互过程中服务器要处理的命令。

<table>
	<tr><td>
		<li>COM_SLEEP</li>
		<li>COM_QUIT</li>
		<li>COM_INIT_DB</li>
		<li>COM_QUERY</li>
		<li>COM_FIELD_LIST</li>
		<li>COM_CREATE_DB</li>
		<li>COM_DROP_DB</li>
		<li>COM_REFRESH</li>
		<li>COM_SHUTDOWN</li>
		<li>COM_STATISTICS</li>
	</td><td>
		<li>COM_PROCESS_INFO</li>
		<li>COM_CONNECT</li>
		<li>COM_PROCESS_KILL</li>
		<li>COM_DEBUG</li>
		<li>COM_PING</li>
		<li>COM_TIME</li>
		<li>COM_DELAYED_INSERT</li>
		<li>COM_CHANGE_USER</li>
		<li>COM_RESET_CONNECTION</li>
		<li>COM_DAEMON</li>
	</td></tr>
</table>

# 请求分发

客户端与服务器建立连接以后，即可以向服务器发送请求。不同的请求类型将会被`dispatch_command`分发到不同的处理模块进行处理。


{% codeblock lang:c%}
/**
  Perform one connection-level (COM_XXXX) command.

  @param command         type of command to perform
  @param thd             connection handle
  @param packet          data for the command, packet is always null-terminated
  @param packet_length   length of packet + 1 (to show that data is
                         null-terminated) except for COM_SLEEP, where it
                         can be zero.

  @todo
    set thd->lex->sql_command to SQLCOM_END here.
  @todo
    The following has to be changed to an 8 byte integer

  @retval
    0   ok
  @retval
    1   request of thread shutdown, i. e. if command is
        COM_QUIT/COM_SHUTDOWN
*/
bool dispatch_command(enum enum_server_command command, THD *thd,
		      char* packet, uint packet_length)

		      ......

  case COM_STMT_EXECUTE:
  {
    mysqld_stmt_execute(thd, packet, packet_length);
    break;
  }
  case COM_STMT_FETCH:
  {
    mysqld_stmt_fetch(thd, packet, packet_length);
    break;
  }
  case COM_STMT_SEND_LONG_DATA:
  {
    mysql_stmt_get_longdata(thd, packet, packet_length);
    break;
  }
  case COM_STMT_PREPARE:
  {
    mysqld_stmt_prepare(thd, packet, packet_length);
    break;
  }
  case COM_STMT_CLOSE:
  {
    mysqld_stmt_close(thd, packet);
    break;
  }

{% endcodeblock %}

请求被分发到对应的处理模块后，返回的结果集合再由连接线程构建成相应的协议返回结果，基础的流程如下：
{% asset_img /connection-level-command.png %}

# 命令的解析与执行

在Connection-Level的command_dispath之后，各个命令会到达相应的模块。这些模块会对请求进行解析、之后开始调用各个底层接口方法完成命令。

另外各个模块收到请求后，首先会通过访问控制模块检查连接用户是否有访问目标表以及目标字段的权限。如果用户拥有相应的权限，那么就会向表管理的模块请求相应的表及对应的锁。

表管理模块首先会检查表是否打开、是否存在于Table Cache之中；如果表没有被打开则打开相应的表然后继续后续的所操作。当表打开后表管理模块就可以根据表的meta信息，判断表的存储引擎等信息；根据表的存储引擎，命令执行模块就可以将需要的请求提交给存储引擎对应的实例接口进行处理。

如同上文提到的MySQL的存储引擎插件是基于表层面的，所以对于表变更管理模块来说，可见的仅是存储引擎接口模块所提供的一系列“标准”接口。底层存储引擎实现模块的具体实现，对于表变更管理模块来说是透明的。他只需要调用对应的接口，并指明表类型，接口模块会根据表类型调用正确的存储引擎来进行相应的处理。

在处理过程中产生的数据库的变化及数据库中数据的变化将会被相应的信息收集服务感知，进而动态的为数据库的运行优化及查询执行计划决策提供数据支持。

另外为了提升性能数据库还会在这个过程中有大量的优化，比如针对SELECT语句解析器会首先查询Query Cache之中是否已经存在可靠的预编译结果、解析结果、执行结果，如果命中缓存则可以简化相应的步骤。

# 其它辅助模块

相关模块使数据库中的数据发生了变化，而且MySQL 打开了binlog功能，则对应的处理模块还会调用日志处理模块将相应的变更语句以更新事件的形式记录到相关参数指定的二进制日志文件中。在上面各个模块的处理过程中，各自的核心运算处理功能部分都会高度依赖整个MySQL的核心API 模块，比如内存管理，文件I/O，数字和字符串处理等等。

最后分享网上一个小伙伴的图片

{% asset_img /arch-dy.jpg %}

> 本人是一名应用开发工程师并非DBA
>
> 所述内容大多来自对网上小伙伴的分享学习理解 以及MySQL手册
>
> 如果纰漏或者理解有误之处 万望各位小伙伴不吝赐教


> 参考资料：
>
>https://dev.mysql.com/doc/internals/en/overview.html
>
>https://dev.mysql.com/doc/refman/5.7/en/
>
>http://tigerlchen.iteye.com/blog/1770518
>
>http://www.orczhou.com/index.php/tag/mysql/



