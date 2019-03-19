---
layout: post
title: "[实践]使用JarJar优雅的发布依赖包"
categories:
- Tools
tags:
- JarHell
- Gracefully
---
作为服务需求方每次在项目中添加一个依赖都提心吊胆，怕新依赖会引入Jar包冲突、ClassNotFound问题。甚至有时新依赖使用的第三方包与项目中已有的版本完全不兼容，这就迫使需求方或冲突方不得不重新修改项目。因此如何为使用者发布一个第三方依赖尽可能少的包，体现了一个服务提供者的友好态度。



使用JarJar重封装减少发布包的依赖
--------------------
Spring框架体积庞大、功能繁杂但是它的第三方依赖仅仅只有`Commons Log`这是如何做到的呢？

其实在Spring的实现中也大量了使用`cglib`，`asm`等工具包，但是 Spring 并没有直接引入依赖，而是采用将某个版本的 Jar 重新打包到自己的 package 之下的方式引入依赖。这相当于将工具包的代码拷贝到自己的项目中，使工具包里面所有类的包名都在自己的命名空间之下，从而避免了自己和其它依赖共同工具包项目之间的冲突。如果真的通过拷贝源文件实现重新发包，恐怕这个修改会非常繁琐而且容易出错。

通过 Spring 的 API 文档可以清楚的看到这一点：
![](/images/2015-1-08-Export-Jar-Gracefully-1.png)

Spring使用了 [Jar Jar Links](https://github.com/shevek/jarjar) 实现这个功能。

> build.gradle
{% codeblock lang:groovy %}
task cglibRepackJar(type: Jar) { repackJar ->
  repackJar.baseName = "spring-cglib-repack"
  repackJar.version = cglibVersion

  doLast() {
    project.ant {
      taskdef name: "jarjar", classname: "com.tonicsystems.jarjar.JarJarTask",
        classpath: configurations.jarjar.asPath
      jarjar(destfile: repackJar.archivePath) {
        configurations.cglib.each { originalJar ->
          zipfileset(src: originalJar)
        }
        // repackage net.sf.cglib => org.springframework.cglib
        rule(pattern: "net.sf.cglib.**", result: "org.springframework.cglib.@1")
        // as mentioned above, transform cglib"s internal asm dependencies from
        // org.objectweb.asm => org.springframework.asm. Doing this counts on the
        // the fact that Spring and cglib depend on the same version of asm!
        rule(pattern: "org.objectweb.asm.**", result: "org.springframework.asm.@1")
      }
    }
  }
}
{% endcodeblock %}

JarJar介绍
--------------------
`JarJarLinks`可以很方便的重新打包并封装到自己的发布中，这样做有两大好处：

* 便捷的创建一个无依赖的单一文件的发布
* 避免自身对特定版本包的依赖造成的与其它程序冲突

`JarJar`包含一个继承于内建`jar`任务的`Ant Task`完成代码正常的打包工作，通过`zipfileset`元素指定内嵌的jar 文件，另外添加了一个新的规则配置用来描述内嵌 jar 文件的重命名规则。JarJar使用`ASM`进行`bytecode`转换方式来实现变更`reference`操作，并且提供一个特殊的`handling`来迁移资源文件和进行字符串字面量的转换工作。

JarJar应用示例
--------------------

### 基于Ant使用JarJar

一般情况下我们在`Ant`会引入如下的`task`
{% codeblock lang:xml %}
<target name="jar" depends="compile">
    <jar jarfile="dist/example.jar">
        <fileset dir="build/main"/>
    </jar>
</target>
{% endcodeblock %}
使用`JarJarLinks`我们可以使用以下配置代替上面功能，因为`jarjar``task`本身继承于内建的`jar`任务。通过fileset指定的`class`文件可以被打包起来，如果仅仅将其它项目的`class`文件内嵌到自己的项目中并不能解决`Jar Hell`问题，因为此时类文件依旧保持着原有的名字。
我们可以通过 zipfileset 指定将其它项目的文件包含到自己的项目发布中，为了描述重命名的需求`JarJar`提供了一个Pattern配置来实现。
{% codeblock lang:xml %}
<target name="jar" depends="compile">
    <taskdef name="jarjar" classname="com.tonicsystems.jarjar.JarJarTask"
        classpath="lib/jarjar.jar"/>
    <jarjar jarfile="dist/example.jar">
        <fileset dir="build/main"/>
        <!-- 包含一个第三方 jar 到项目中 -->
        <zipfileset src="lib/jaxen.jar"/>
        <!-- JarJar 提供了一个Pattern配置用来描述重命名-->
        <rule pattern="org.jaxen.**" result="org.example.@1"/>
    </jarjar>
</target>
{% endcodeblock %}
在上述的实例中我们将jaxen.jar 打包到自己的发布中，并且将以 `org.jaxen`为开头的*包及其子包*的内容重命名到`org.example`之下。Pattern 中的`**`匹配`任意有效包的子字符串`，如果匹配单一的子包可以使用`*`表示并且通过`.`来分隔。`@1`表示第一个匹配，`@2`依次排列，`@0`可以用来表示整个匹配串。(这一块该怎么解释更明白呢？看Spring的配置吧！)

### 基于Gradle使用JarJar 
{% codeblock lang:groovy %}
dependencies {
    // Use jarjar.repackage in place of a dependency notation.
    compile jarjar.repackage {
        from 'com.google.guava:guava:18.0'

        classDelete "com.google.common.base.**"

        classRename "com.google.**" "org.private.google.@1"
    }
}
{% endcodeblock %}

### 基于命令行使用JarJar
>command-line
{% codeblock lang:bash %}
java -jar jarjar.jar [help]
{% endcodeblock %}
>help
{% codeblock lang:bash %}
java -jar jarjar.jar strings <cp>
{% endcodeblock %}
>Dumps all string literals in classpath
{% codeblock lang:bash %}
java -jar jarjar.jar find <level> <cp1> [<cp2>]
{% endcodeblock %}
这个命令可以用来构建两个classpath 之间的依赖关系，`level`可以使`class`或者`jar`。如果不存在`cp2`，则表示使用`cp1`代替。
>转换Jar
{% codeblock lang:bash %}
java -jar jarjar.jar process <rulesFile> <inJar> <outJar>
{% endcodeblock %}
这个命令可以讲`inJar`中的内容转移到`outJar`中，`outJar`内容将全部被删除。

`classpath`属性是一组冒号或者分号分隔的文件夹、jar、zip文件。rules支持[Mustang-style](http://bugs.java.com/bugdatabase/view_bug.do?bug_id=6268383)通配符描述。

### 在Maven中实现JarJar功能
Maven提供了一个 Plugin 来实现JarJar功能
{% codeblock lang:xml %}
<dependency>
  <groupId>org.sonatype.plugins</groupId>
  <artifactId>jarjar-maven-plugin</artifactId>
  <version>${jarjar-version}</version>
</dependency>
<!-- ...... -->
<plugin>
<groupId>org.sonatype.plugins</groupId>
<artifactId>jarjar-maven-plugin</artifactId>
<executions>
  <execution>
    <phase>package</phase>
    <goals>
      <goal>jarjar</goal>
    </goals>
    <configuration>
      <includes>
        <include>asm:asm</include>
        <include>org.sonatype.sisu.inject:cglib</include>
      </includes>
      <rules>
        <rule>
          <pattern>org.objectweb.asm.**</pattern>
          <result>com.google.inject.internal.asm.@1</result>
        </rule>
        <rule>
          <pattern>net.sf.cglib.**</pattern>
          <result>com.google.inject.internal.cglib.@1</result>
        </rule>
        <keep>
          <pattern>com.google.inject.**</pattern>
        </keep>
      </rules>
    </configuration>
  </execution>
</executions>
</plugin>
{% endcodeblock %}


