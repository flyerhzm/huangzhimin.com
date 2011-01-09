---
layout: post
title: 给javadoc增加uml类图
categories:
- maven
- uml
- Java
---
今天准备开始写点介绍我的contact-list jar包的文章，自然要放些直观的UML图看看，google了一下，找到了一个名叫apiviz的maven插件，可以为javadoc生成uml类图。用起来也很方便，首先安装graphviz包

{% highlight bash %}
sudo apt-get install graphviz
{% endhighlight %}

然后修改pom.xml文件

1. 增加jboss的repository

{% highlight xml %}
<repositories>
    <repository>
        <id>jboss.releases</id>
        <name>JBosss releases</name>
        <url>http://repository.jboss.org/maven2 </url>
        <releases>
            <enabled>true</enabled>
        </releases>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
{% endhighlight %}

2. 修改maven-java-doc的配置

{% highlight xml %}
<reporting>
    <plugins>
        <plugin>
            <groupid>org.apache.maven.plugins</groupid>
            <artifactid>maven-javadoc-plugin</artifactid>
            <version>2.5</version>
            <configuration>
                <doclet>org.jboss.apiviz.APIviz</doclet>
                <docletartifact>
                    <groupid>org.jboss.apiviz</groupid>
                    <artifactid>apiviz</artifactid>
                    <version>1.3.0.GA</version>
                </docletartifact>
                <usestandarddocletoptions>true</usestandarddocletoptions>
                <charset>UTF-8</charset>
                <encoding>UTF-8</encoding>
                <docencoding>UTF-8</docencoding>
                <breakiterator>true</breakiterator>
                <version>true</version>
                <author>true</author>
                <keywords>true</keywords>
                <additionalparam>
                    -sourceclasspath ${project.build.outputDirectory}
                </additionalparam>
            </configuration>
        </plugin>
    </plugins>
</reporting>
{% endhighlight %}

最后，在生成javadoc之前必须先compile

{% highlight bash %}
mvn compile javadoc:javadoc
{% endhighlight %}

再看看新生成的javadoc吧，头部都有一张类图的哦

