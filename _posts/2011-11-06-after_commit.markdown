---
layout: post
title: after_commit
categories:
- Rails
---
We are using RabbitMQ as our message queue system, ruby client is
workling. This week we encountered a strange issue, we create a
notification, and define an after_create callback to ask workling to
find that notification and then push the notification to twitter or
facebook, it works fine except that sometimes it will raise an error
said "can't find the notification with the specified ID"

{% highlight ruby %}
class Notification < ActiveRecord::Base
  after_create :asyns_send_notification
  ......
  def async_send_notification
    NotificationWorker.async_send_notification({:notification_id => id})
  end
end

class NotificationWorker < Workling::Base
  def send_notification(params)
    notification = Notification.find(params[:notification_id])
    ......
  end
end
{% endhighlight %}

It's wierd the notification_id is passed to NotificationWorker, that
means the notification is already created, the notification is supposed
to be existed.

After talking with MySQL DBA, we find the problem is the find sql is
executed before insert transaction is committed.

Let me describe it step by step.

1. Notification sends "Transaction Begin" command
2. Notification sends "INSERT" command
3. Notification gets "next sequence value" as new object id
4. Notification sends "new object id" to NotificationWorker
5. NotificationWorker sends "SELECT" command to find notification object
6. Notification sends "Transaction Commit" command

As you seen, at step 5, the new notification is not existed in the mysql
database yet, so the error "Not found" will be raised.

To solve this issue, we can use after_commit callback.

In rails 2.x, we should install after_commit gem, in rails 3.x,
after_commit callback is supported by default.

{% highlight ruby %}
class Notification < ActiveRecord::Base
  after_commit_on_create :asyns_send_notification
  ......
  def async_send_notification
    NotificationWorker.async_send_notification({:notification_id => id})
  end
end
{% endhighlight %}

So Notification asks NotificationWorker to run only after the
transaction is committed.
