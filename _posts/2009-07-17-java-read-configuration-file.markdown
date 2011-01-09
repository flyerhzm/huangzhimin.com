---
layout: post
title: java读取配置文件
categories:
- Java
---
最近在完善contact-list项目，打算把一些配置写配置文件里，就像log4j的做法一样，代码如下：

{% highlight java %}
package com.huangzhimin.contacts.utils;

import java.net.URL;
import java.util.Properties;

public class SystemConfig {

    private static Properties props = null;

    static {
        try {
            props = new Properties();
            URL url = Thread.currentThread().getContextClassLoader().getResource("contactlist.properties");
            if (url != null) {
                props.load(url.openStream());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String getProperty(String key) {
        return getProperty(key, "");
    }

    public static String getProperty(String key, String defaultValue) {
        if (props != null && props.getProperty(key) != null) {
            return props.getProperty(key);
        }
        return defaultValue;
    }
}
{% endhighlight %}

在类加载的时候，读取classpath中的contactlist.properties文件，然后通过getProperty方法获取配置的值。

