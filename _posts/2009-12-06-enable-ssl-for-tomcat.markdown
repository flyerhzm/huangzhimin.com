---
layout: post
title: enable ssl for tomcat
categories:
- Java Web
---
昨天参加barcamp会议，介绍了contactlist，有不少人质疑服务的安全性，希望使用https来增强安全性。

想起研究生阶段研究的就是web service安全，https属于最简单的实现，赶紧加上吧。

首先是在本地生成keystore，

{% highlight bash %}
keytool -genkey -alias tomcat -keyalg RSA

{% endhighlight %}

按照提示，输入密码，姓名等等信息，就会在HOME目录下生成.keystore文件，其中包括了你的公私钥。

接下来，就是开启tomcat的8443端口，

{% highlight xml %}
<connector port="8443" protocol="HTTP/1.1" sslenabled="true" maxthreads="150" scheme="https" secure="true" keystorefile="/home/flyerhzm/.keystore" keystorepass="changeit" clientauth="false" sslprotocol="TLS"></connector>
{% endhighlight %}

最后重启tomcat，并将访问地址由原来的http://mysite.com:8080改成https://mysite.com:8443即可。

