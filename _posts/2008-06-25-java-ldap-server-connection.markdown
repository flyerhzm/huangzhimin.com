---
layout: post
title: Java连接LDAP服务器
categories:
- Java
- Ldap
---
LDAP是轻量目录访问协议，是一个用来发布目录信息到许多不同资源的协议。通常它都作为一个集中的地址本使用。 LDAP是一个比关系数据库抽象层次更高的存贮概念，与关系数据库的查询语言SQL属同一级别。LDAP最基本的形式是一个连接数据库的标准方式。该数据库为读查询作了优化。因此它可以很快地得到查询结果，不过在其它方面，例如更新，就慢得多。

Java连接LDAP服务器可以通过JDK的Context接口。下面定义了两种Context，env是直接查询referral指向的目标，而envIgnoreReferral则忽略referral，可以用来修改referral的值。我用的ldap服务器是openldap

{% highlight java %}
private static Hashtable env = new Hashtable();
private static Hashtable envIgnoreReferral = new Hashtable();

static {
    env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
    env.put(Context.PROVIDER_URL, "ldap://localhost:389");
    env.put("java.naming.ldap.version", "3");
    env.put(Context.SECURITY_AUTHENTICATION, "simple");
    env.put(Context.SECURITY_PRINCIPAL, "cn=Root, c=GB");
    env.put(Context.SECURITY_CREDENTIALS, "pwd");
    env.put("com.sun.jndi.ldap.connect.pool", "true");
    env.put("com.sun.jndi.ldap.connect.pool.prefsize", "50");
    env.put("com.sun.jndi.ldap.connect.pool.maxsize", "100");
    env.put(Context.REFERRAL, "follow");
    env.put("java.naming.ldap.attributes.binary", "userCertificate");

    envIgnoreReferral.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
    envIgnoreReferral.put(Context.PROVIDER_URL, "ldap://localhost:389");
    envIgnoreReferral.put("java.naming.ldap.version", "3");
    envIgnoreReferral.put(Context.SECURITY_AUTHENTICATION, "simple");
    envIgnoreReferral.put(Context.SECURITY_PRINCIPAL, "cn=Root, c=GB");
    envIgnoreReferral.put(Context.SECURITY_CREDENTIALS, "pwd");
    envIgnoreReferral.put("com.sun.jndi.ldap.connect.pool", "true");
    envIgnoreReferral.put("com.sun.jndi.ldap.connect.pool.prefsize", "50");
    envIgnoreReferral.put("com.sun.jndi.ldap.connect.pool.maxsize", "100");
    envIgnoreReferral.put(Context.REFERRAL, "ignore");
    envIgnoreReferral.put("java.naming.ldap.attributes.binary", "userCertificate");
}
{% endhighlight %}

同样地道理，我们需要定义两种到ldap服务器的连接

{% highlight java %}
public static LdapContext getContext() throws NamingException {
    LdapContext context = null;
    try {
        context = new InitialLdapContext(env, null);
    } catch (NamingException e) {
    	logger.error("Error creating Ldap DirContext");
    	throw e;
    }
    return context;
}

public static LdapContext getContextIgnoreReferral() throws NamingException {
    LdapContext context = null;
    try {
        context = new InitialLdapContext(envIgnoreReferral, null);
    } catch (NamingException e) {
        logger.error("Error creating Ldap DirContext");
        throw e;
    }
    return context;
}
{% endhighlight %}

同数据库连接一样，必须定义关闭连接的接口，以及时释放系统资源

{% highlight java %}
public static void close(LdapContext context) throws NamingException {
    if (context != null) {
        context.close();
    }
}
{% endhighlight %}

测试连接的代码如下，

{% highlight java %}
public static boolean testConnect() {
    LdapContext context = null;
    try {
        context = getContext();
        return true;
    } catch (NamingException e) {
        return false;
    } finally {
        try {
            close(context);
        } catch (NamingException e) {
            return false;
        }
    }
}
{% endhighlight %}

具体的增删改查方法就留待下次在讲吧

