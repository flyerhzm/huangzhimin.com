---
layout: post
title: android初始化时反射读取所有的drawable
categories:
- Java
- Android
---
刚开始写android app，需要做一个图片浏览的Activity，本来应该是用一个数组来列出所有的drawable，不过drawable实在太多了，一个个列出来还是件体力活，只能搬出java reflection。代码如下：

{% highlight java %}
try {
    Class klazz = Class.forName("com.huangzhimin.android.R$drawable");
    Field[] fields = klazz.getFields();
    mImageIds = new int[fields.length - 1];
    int i = 0;
    for (Field field : fields) {
    	if (!field.getName().equals("icon")) {
    	    mImageIds[i] = field.getInt(klazz);
    	    i++;
    	}
    }
} catch (Exception e) {
    e.printStackTrace();
}
{% endhighlight %}

注意drawable是R的内嵌静态类，所以要写成com.huangzhimin.android.R$drawable。

