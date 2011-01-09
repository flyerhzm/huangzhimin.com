---
layout: post
title: contact-list类库依赖包之msnmlib
categories:
- contact-list
- msn
- Java
---
msnmlib是韩国人写的一个msn的java客户端，提供了完整的api，很好用的，唯一的缺陷就是javadoc使用韩文写的，看不懂。

对于contact-list类库来说，完全是基于msnmlib来提供对msn联系人列表的导入。

1. 登录msn

{% highlight java %}
private void login() {
    msn.setInitialStatus(UserStatus.OFFLINE);
    msn.login(username, password);
}
{% endhighlight %}

设置初始登录状态为OFFLINE，可以防止被误以为是用户登录，影响用户之间的联系。

2. 获取联系人列表

{% highlight java %}
public List<Contact> getContacts() throws ContactsException {
    try {
        login();
        List<Contact> contacts = new ArrayList<Contact>();
        BuddyList list = msn.getBuddyGroup().getAllowList();
        for (Iterator iter = list.iterator(); iter.hasNext();) {
            MsnFriend friend = (MsnFriend) iter.next();
            contacts.add(new Contact(new String(friend.getFriendlyName().getBytes(), "UTF-8"), friend.getLoginName()));
        }
        logout();
        return contacts;
    } catch (Exception e) {
        throw new ContactsException("msn protocol has changed", e);
    }
}
{% endhighlight %}

3. 登出msn

{% highlight java %}
private void logout() {
    fixedLogout(msn);
}

public void fixedLogout(MSNMessenger messenger) {
    if (messenger != null) {
        Thread leakedThread = null;
        try {
            leakedThread = getLeakedThread(messenger);
            messenger.logout();
        } catch (Exception ignore) {
        } finally {
            if (leakedThread != null) {
                if (!leakedThread.isInterrupted()) {
                    leakedThread.interrupt();
                }
            }
        }
    }
}

private Thread getLeakedThread(MSNMessenger messenger) {
    try {
        Field nsField = MSNMessenger.class.getDeclaredField("ns");
        nsField.setAccessible(true);
        NotificationProcessor ns = (NotificationProcessor) nsField.get(messenger);
        if (ns == null)
            return null;
        Field callbackField = NotificationProcessor.class.getDeclaredField("callbackCleaner");
        callbackField.setAccessible(true);
        return (Thread) callbackField.get(ns);
    } catch (SecurityException e) {
        throw new RuntimeException("unexpected", e);
    } catch (NoSuchFieldException e) {
        throw new RuntimeException("unexpected", e);
    } catch (IllegalAccessException e) {
        throw new RuntimeException("unexpected", e);
    }
}
{% endhighlight %}

msnmlib默认的logout方法总是无法正常登出，导致线程被挂死。google了一下才找到上面的解决方法。

由于msnmlib良好的api接口，使得导入msn联系人列表也变得非常简单了。

