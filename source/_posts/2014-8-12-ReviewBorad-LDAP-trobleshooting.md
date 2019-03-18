---
layout: post
title: "ReviewBoard LDAP 配置 验证失败 python-ldap安装失败"
categories:
- Tools
tags:
- ReviewBoard
- LDAP
- python-ldap
---
ReviewBoard配置LDAP无效
======================
之前配置代码评审工具选定了淘宝的[Tao-ReviewBoard](http://code.taobao.org/p/tao-reviewboard/wiki/index/)，配合使用Reviewboard 1.6.19的版本。（当前Tao-ReviewBoard发布v1.1.0支持ReviewBoard 1.7）

系统运行在Centos 5.8之上；系统自带Python2.4 升级为Python2.7.

`openldap`直接通过`yum`安装版本为2.3.43，依赖包及devel全部安装（`opnldap` `openldap24-libs` `openldap-clients` `openldap-devel` `openssl-devel` `libgsasl` `libgsasl-devel`,本机LDAP Server有`openldap-servers`）。

最近整合LDAP真是各种闹心，但是一旦配置完成的确是很便捷。

配置LDAP过程历经磨难，先后出现了3个问题，记录于此以备后查：

1. python-ldap安装失败
2. ReviewBoard绑定LDAP失败(问题有点蠢)
3. ReviewBoard验证LDAP信息失败

调试过程[开启openldap日志功能](http://www.cnblogs.com/moonson/archive/2009/11/06/1597302.html)

-------------------------------------------------

1. python-ldap安装失败，一直报错头文件异常

    使用`yum info python-ldap`可以看到系统为python2.4安装了python-ldap，但是在python2.7的site-packages中没有。

{% codeblock lang:bash %}
    easy_install-2.7 install python-ldap
{% endcodeblock %}

    安装一直失败，也参照了网上同学的一些[办法](http://nilm61.iteye.com/blog/1779136)依旧无解，大致的异常如下：

{% codeblock lang:bash %}
    extra_compile_args: 
    extra_objects: 
    include_dirs: /opt/openldap-RE24/include /usr/include/sasl /usr/include
    library_dirs: /opt/openldap-RE24/lib /usr/lib
    libs: ldap_r
    file Lib/ldap.py (for module ldap) not found
    file Lib/ldap/controls.py (for module ldap.controls) not found
    file Lib/ldap/extop.py (for module ldap.extop) not found
    file Lib/ldap/schema.py (for module ldap.schema) not found
    warning: no files found matching 'Makefile'
    warning: no files found matching 'Modules/LICENSE'
    file Lib/ldap.py (for module ldap) not found
    file Lib/ldap/controls.py (for module ldap.controls) not found
    file Lib/ldap/extop.py (for module ldap.extop) not found
    file Lib/ldap/schema.py (for module ldap.schema) not found
    file Lib/ldap.py (for module ldap) not found
    file Lib/ldap/controls.py (for module ldap.controls) not found
    file Lib/ldap/extop.py (for module ldap.extop) not found
    file Lib/ldap/schema.py (for module ldap.schema) not found
    In file included from Modules/LDAPObject.c:18:
    /usr/include/sasl/sasl.h:349: 警告：函数声明不是一个原型
    Modules/ldapcontrol.c: In function ‘encode_assertion_control’:
    Modules/ldapcontrol.c:352: 警告：隐式声明函数 ‘ldap_create_assertion_control_value’
    Modules/constants.c: In function ‘LDAPinit_constants’:
    Modules/constants.c:155: 错误：‘LDAP_OPT_DIAGNOSTIC_MESSAGE’ 未声明 (在此函数内第一次使用)
    Modules/constants.c:155: 错误：(即使在一个函数内多次出现，每个未声明的标识符在其
    Modules/constants.c:155: 错误：所在的函数内只报告一次。)
    Modules/constants.c:365: 错误：‘LDAP_CONTROL_RELAX’ 未声明 (在此函数内第一次使用)
    error: Setup script exited with error: command 'gcc' failed with exit status 1
{% endcodeblock %}

    也有网上的童鞋直接修改报错的头文件声明一个变量，虽然编译安装通过但是在实际调用`pytho-ldap`模块过程报错。
    最后在Stack Overflow看到[类似问题](http://stackoverflow.com/questions/19311933/redhat-5-4-python-ldap-run-error-python2-7/25199930#25199930)受评论启发，安装python-ldap失败原因是因为`easy_install`自动选择的版本比较新与`CentOS5.8`的`OpenLDAP`不兼容。

    解决：
    从`python-ldap`的[CVS](http://python-ldap.cvs.sourceforge.net/viewvc/python-ldap/python-ldap/?pathrev=PYLDAP_REL_2_2_1)下载较老的版本，编译安装OK~~~

2. 按照表单填写了ReviewBoard的LDAP认证信息，无法通过认证

    从`openlad`的日志信息来看是ReviewBoard使用了一个错误的用户名密码进行第一次绑定（内网LDAP服务器允许匿名绑定），但是实际我使用的就是匿名绑定，后来发现是浏览器自动缓存了我的ReviewBoard管理员用户名密码用在这里了。很坑爹的故障~~~
    

3. LDAP认证正常，依旧无法登陆，报错`need more than one value to unpack`

    问题出在老外的习惯上，ReviewBoard的`FullName`默认LDAP的attr为displayName，我的服务器的确也是这个规则。最后查询源码发现老外默认从fullname中去解析 `sn（surname）`和`cn（commonname）`，而且还是用一个空格分隔。故障[accounts/backends.py源码](https://github.com/reviewboard/reviewboard/blob/b23dd1f809583f02a5062778ecf0955b8ed9a299/reviewboard/accounts/backends.py)如下，注意中间的注释。PS：在这里告诉我，这个小的问题LDAP管理员应该能搞定~~还（KENG）好（DIE）
	
	解决：删除fullName的配置或者告诉LDAP管理员在displayName中添加空格
    
{% codeblock lang:python %}
        def get_or_create_user(self, username):
            username = username.strip()

            try:
                user = User.objects.get(username=username)
                return user
            except User.DoesNotExist:
                try:
                    import ldap
                    ldapo = ldap.initialize(settings.LDAP_URI)
                    ldapo.set_option(ldap.OPT_REFERRALS, 0)
                    ldapo.set_option(ldap.OPT_PROTOCOL_VERSION, 3)
                    if settings.LDAP_TLS:
                        ldapo.start_tls_s()
                    if settings.LDAP_ANON_BIND_UID:
                        ldapo.simple_bind_s(settings.LDAP_ANON_BIND_UID,
                                            settings.LDAP_ANON_BIND_PASSWD)

                    passwd = ldapo.search_s(settings.LDAP_BASE_DN,
                                            ldap.SCOPE_SUBTREE,
                                            settings.LDAP_UID_MASK % username)

                    user_info = passwd[0][1]

                    given_name_attr = getattr(settings, 'LDAP_GIVEN_NAME_ATTRIBUTE',
                                              'givenName')
                    first_name = user_info.get(given_name_attr, [username])[0]

                    surname_attr = getattr(settings, 'LDAP_SURNAME_ATTRIBUTE', 'sn')
                    last_name = user_info.get(surname_attr, [''])[0]

                    # If a single ldap attribute is used to hold the full name of
                    # a user, split it into two parts.  Where to split was a coin
                    # toss and I went with a left split for the first name and
                    # dumped the remainder into the last name field.  The system
                    # admin can handle the corner cases.
                    try:
                        if settings.LDAP_FULL_NAME_ATTRIBUTE:
                            full_name = user_info[settings.LDAP_FULL_NAME_ATTRIBUTE][0]
                            first_name, last_name = full_name.split(' ', 1)
                    except AttributeError:
                        pass

                    if settings.LDAP_EMAIL_DOMAIN:
                        email = u'%s@%s' % (username, settings.LDAP_EMAIL_DOMAIN)
                    elif settings.LDAP_EMAIL_ATTRIBUTE:
                        email = user_info[settings.LDAP_EMAIL_ATTRIBUTE][0]
                    else:
                        logging.warning("LDAP: email for user %s is not specified",
                                        username)
                        email = ''

                    user = User(username=username,
                                password='',
                                first_name=first_name,
                                last_name=last_name,
                                email=email)
                    user.is_staff = False
                    user.is_superuser = False
                    user.set_unusable_password()
                    user.save()
                    return user
                except ImportError:
                    pass
                except ldap.INVALID_CREDENTIALS:
                    # FIXME I'd really like to warn the user that their
                    # ANON_BIND_UID and ANON_BIND_PASSWD are wrong, but I don't
                    # know how
                    pass
                except ldap.NO_SUCH_OBJECT, e:
                    logging.warning("LDAP error: %s settings.LDAP_BASE_DN: %s "
                                    "settings.LDAP_UID_MASK: %s" %
                                    (e, settings.LDAP_BASE_DN,
                                     settings.LDAP_UID_MASK % username))
                except ldap.LDAPError, e:
                    logging.warning("LDAP error: %s" % e)

            return None
{% endcodeblock %}