---
layout: post
title: Move google svn to github git
categories:
- Git
- contact-list
---
之前contactlist这个项目一直放在google code上面，今天把contactlist移植到了github上。记录下移植的过程：

首先是用git-svn把googlecode上的项目checkout出来

{% highlight bash %}
git svn clone https://contact-list.googlecode.com/svn -T trunk -b branches -t tags
{% endhighlight %}

之后就是push到github了

{% highlight bash %}
git remote add origin git@github.com:flyerhzm/contactlist.git
git push origin master
{% endhighlight %}

相当简单，这下我的项目就都搬到github上面去了

