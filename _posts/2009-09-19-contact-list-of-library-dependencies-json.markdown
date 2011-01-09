---
layout: post
title: contact-list类库依赖包之json
categories:
- contact-list
- Java
---
json类库为java提供了方便地在json和string之间的转换和对json数据的操作。

对于contact-list类库来说，有些联系人信息是通过json来传输的，所以利用json类库来处理数据。

1\. 从String转换为JSON对象

{% highlight java %}
protected JSONObject parseJSON(String content, String startTag) throws JSONException {
    String json = content.substring(content.indexOf(startTag) + startTag.length());
    JSONTokener jsonTokener = new JSONTokener(json);
    Object o = jsonTokener.nextValue();
    return (JSONObject) o;
}

protected JSONObject parseJSON(String content, String startTag, String endTag) throws JSONException {
    String sub_content = content.substring(content.indexOf(startTag) + startTag.length());
    String json = sub_content.substring(0, sub_content.indexOf(endTag));
    JSONTokener jsonTokener = new JSONTokener(json);
    Object o = jsonTokener.nextValue();
    return (JSONObject) o;
}
{% endhighlight %}

传入一个String，同时传入其中json的start tag和end tag，来划定这个json string。

2\. 读取json数据中的值

{% highlight java %}
JSONArray jsonContacts = jsonObj.getJSONArray("Contacts");
for (int i = 0; i  jsonContacts.length(); i++) {
    JSONObject jsonContact = (JSONObject) jsonContacts.get(i);
    String username = jsonContact.getString("c");
    String eamil = jsonContact.getString("y");
    contacts.add(new Contact(username, email));
}
{% endhighlight %}

getJSONArray获取一个json array

getJSONObect获取一个json object

jsonObject.getString(key)获取json object的string值

