---
layout: post
title: contact-list类库依赖包之gdata
categories:
- contact-list
- Java
---
gdata是google提供的获取其数据的api，analytics, calender, contacts, webmastertools, youtube等等。

对于contact-list从1.7.0开始，放弃原来通过模拟用户登录并爬取网页数据的做法，改用gdata api，使得获取google联系人列表变得简单了许多，同时使用api也保证联系人的获取不会因为网页的变动而失败。

contact-list使用gdata有一点小问题，那就是gdata没有maven repository，我不得不手动下载gdata的jar包，并手动安装到本地的maven类库中。下面是安装这些jar包的ruby脚本（shell脚本不熟）

{% highlight ruby %}
[
  ['analytics', 2.0],
  ['appsforyourdomain', 1.0],
  ['base', 1.0],
  ['blogger', 2.0],
  ['books', 1.0],
  ['calendar', 2.0],
  ['client', 1.0],
  ['codesearch', 2.0],
  ['contacts', 3.0],
  ['core', 1.0],
  ['docs', 3.0],
  ['finance', 2.0],
  ['health', 2.0],
  ['maps', 2.0],
  ['media', 1.0],
  ['photos', 2.0],
  ['spreadsheet', 3.0],
  ['webmastertools', 2.0],
  ['youtube', 2.0]
].each do |pair|
  name, version = *pair
  system "mvn install:install-file -DgroupId=com.google.gdata -DartifactId=gdata-#{name} -Dversion=#{version} -Dfile=/home/flyerhzm/downloads/gdata/java/lib/gdata-#{name}-#{version}.jar -Dpackaging=jar -DgeneratePom=true"
  unless ['base', 'core', 'media'].include? name
    system "mvn install:install-file -DgroupId=com.google.gdata -DartifactId=gdata-#{name}-meta -Dversion=#{version} -Dfile=/home/flyerhzm/downloads/gdata/java/lib/gdata-#{name}-meta-#{version}.jar -Dpackaging=jar -DgeneratePom=true"
  end
end

{% endhighlight %}

接下来就可以在pom.xml下面指定依赖的gdata类库了

{% highlight xml %}
<dependency>
    <groupid>com.google.collections</groupid>
    <artifactid>google-collections</artifactid>
    <version>1.0-rc2</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-base</artifactid>
    <version>1.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-core</artifactid>
    <version>1.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-core</artifactid>
    <version>1.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-client</artifactid>
    <version>1.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-client-meta</artifactid>
    <version>1.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-contacts</artifactid>
    <version>3.0</version>
</dependency>
<dependency>
    <groupid>com.google.gdata</groupid>
    <artifactid>gdata-contacts-meta</artifactid>
    <version>3.0</version>
</dependency>
{% endhighlight %}

最后就是在java代码中调用gdata api来获取google联系人列表了

{% highlight java %}
package com.huangzhimin.contacts.google;

import com.google.gdata.client.Query;
import com.google.gdata.client.contacts.ContactsService;
import com.google.gdata.data.contacts.ContactEntry;
import com.google.gdata.data.contacts.ContactFeed;
import com.google.gdata.data.extensions.Email;
import com.google.gdata.util.AuthenticationException;
import com.huangzhimin.contacts.Contact;
import com.huangzhimin.contacts.ContactsImporter;
import com.huangzhimin.contacts.exception.ContactsException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author flyerhzm
 */
public class GoogleImporter implements ContactsImporter {

    // 用户名
    private String email

    // 密码
    private String password

    public GoogleImporter(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public List getContacts() throws ContactsException {
        ContactsService service = new ContactsService("contactlist");
        try {
            service.setUserCredentials(email, password);
        } catch (AuthenticationException e) {
            throw new ContactsException("login failed", e);
        }
        try {
            URL feedUrl = new URL("http://www.google.com/m8/feeds/contacts/" + email + "/full");
            Query query = new Query(feedUrl);
            query.setMaxResults(Integer.MAX_VALUE);
            ContactFeed resultFeed = service.query(query, ContactFeed.class);
            List contacts = new ArrayList();
            for (ContactEntry entry : resultFeed.getEntries()) {
                for (Email email : entry.getEmailAddresses()) {
                    String address = email.getAddress();
                    String name = null;
                    if (entry.hasName()) {
                        name = entry.getName().getFullName().getValue();
                    } else {
                        name = getUsername(address);
                    }
                    contacts.add(new Contact(name, address));
                }
            }
            return contacts;
        } catch (Exception e) {
            throw new ContactsException("gmail protocol has changed", e);
        }
    }

    private String getUsername(String email) {
        return email.split("@")[0];
    }

}
{% endhighlight %}

其中需要注意的是，默认只能获取25个联系人信息，所以需要设置query.setMaxResults(int)为一个非常大的数值，来获取所有的联系人列表。

