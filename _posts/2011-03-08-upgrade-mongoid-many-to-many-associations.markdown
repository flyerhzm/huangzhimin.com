---
layout: post
title: Upgrade Mongoid - Many to many association
categories:
- mongoid
- Ruby
---
Before mongoid 2.0.0.rc1, there is no default support for many to many association. So we use join document (aka join table in relational database) to implement the many to many association.

For example, we have two documents users and accounts, one user has many accounts and one account contains many users, to establish the many to many relationship between users and accounts, we create a new document named user_accounts, the document looks like

{% highlight javascript %}
{'_id': '4d76d3a70bdb822d08000001', 'user_id': BSON::ObjectId('4d76d3b80bdb822d080015b3'), 'account_id': BSON::ObjectId('4d76d3b90bdb822d080015b7')}
{% endhighlight %}

and the models are defined as follows

{% highlight ruby %}
class User
  include Mongoid::Document
  references_many :user_accounts
end

class Account
  include Mongoid::Document
  references_many :user_accounts
end

class UserAccount
  include Mongoid::Document
  referenced_in :user
  referenced_in :account
end
{% endhighlight %}

Are you familiar with it, it's what activerecord did for many to many association.

I'm glad that mongoid began to support many to many association after mongoid 2.0.0.rc1, the new syntax is "referenes_and_referenced_in_many".

{% highlight ruby %}
class User
  include Mongoid::Document
  references_and_referenced_in_many :accounts
end

class Account
  include Mongoid::Document
  references_and_referenced_in_many :users
end
{% endhighlight %}

We don't need the join document any more. The implementation of mongoid is different with activerecord, it uses array attribute to store the relationship at both sides. Like

These are user documents

{% highlight javascript %}
{'_id': '4d76d3a90bdb822d08000009', account_ids: [BSON::ObjectId('4d76d3aa0bdb822d0800001b'), BSON::ObjectId('4d76d3aa0bdb822d0800001d'), BSON::ObjectId('4d76d3aa0bdb822d08000017')]}
{'_id': '4d76d3a80bdb822d08000005', account_ids: [BSON::ObjectId('4d76d3aa0bdb822d08000017'), BSON::ObjectId('4d76d3a90bdb822d08000015')]}
{% endhighlight %}

And these are account documents

{% highlight javascript %}
{'_id': '4d76d3aa0bdb822d08000017', user_ids: [BSON::ObjectId('4d76d3a80bdb822d08000005'), BSON::ObjectId('4d76d3a90bdb822d08000009'), BSON::ObjectId('4d76d3a90bdb822d0800000d')]}
{'_id': '4d76d3aa0bdb822d0800001b', user_ids: [SON::ObjectId('4d76d3a90bdb822d08000009'), BSON::ObjectId('4d76d3a90bdb822d08000011')]}
{% endhighlight %}

As mongodb support the Array type, it is really easy to maintain the many to many relationship.

Btw, if you use

{% highlight ruby %}
references_many :name, :stored_as => :array
{% endhighlight %}

before, you will receive a runtime error. You should use

{% highlight ruby %}
references_and_referenced_in_many :name
{% endhighlight %}

instead.
