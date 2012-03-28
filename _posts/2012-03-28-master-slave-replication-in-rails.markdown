---
layout: post
title: master slave replication in rails
categories:
- rails
- mysql
---
### Introduction ###
By default activerecord works well with single db, it's applicable for
most of websites with small/medium traffic, but if you website grows
fast and gets much more reads than writes, you should definitly set up
master slave replication for your databse. All inserts/updates are sent
to master db, and reads are sent to slave db, it will reduce read load
on your master db.

Master slave replication allows to set up as many slave dbs as you need,
it's scalable, that means you can easily increase you db read throughput
by adding more slave dbs. It also allows you to move some tasks like
analytics on slave db without affecting your master db.

### Replication in rails ###
How do we config master slave replication in rails app? There are a lot
of [choices][1], pick up one and setup according to its document. I
don't want to discuss about these tools here, I will tell you how to use
master slave replication in rails above these tools.

### Problems ###
Master slave replication looks well, but it has a big problem in
practice - replication lag. There is a lag between data inserted in
master db and sync to slave db, let's see a case.

1. a user create a post on your application.

2. the post is inserted to master db.

3. your application redirects user to post show page.

4. your application read from slave db, but the post is not sync yet.

5. a 404 page is shown. :-(

6. the post is sync to slave db. (too late)

Lots of similar issues will raise after you applying master slave
replication, how to solve them?

### Solution ###
The solution is send some reads to master db to promise get fresh data.

By default all reads will be sent to master db in one db transaction,
like

{% highlight sql %}
BEGIN
SELECT * from users where id = 1;
INSERT INTO posts(title, user_id) VALUES('test', 1);
COMMIT
{% endhighlight %}

In the following cases I will send reads to master db as well

* queries in background job, like delayed_job, resque, workling, etc.

{% highlight ruby %}
clas Post < ActiveRecord::Base
  after_create :notify

  protected
  def notify
    Delayed::Job.enqueue(DelayedJob::NotifyAdmin.new(self.id))
  end
end

class DelayedJob::NotifyAdmin < Struct.new(:post_id)
  def perform
    post = Post.find(post_id)
    ......
  end
end
{% endhighlight %}

It's probably the post does not exist when reading it from slave db in
background job.

* queries in the request which follows a redirect reponse

{% highlight ruby %}
class PostsController < ApplicationController
  def show
    @post = Post.find(params[:id])
  end

  def create
    @post = Post.new(params[:post])
    if @post.save
      redirect_to post_path(@post)
    else
      render :new
    end
  end
end
{% endhighlight %}

This case is too common, creating/updating then redirecting, if the
resource is not sync to slave db before next request, user will get a
404 page or get some fake data.

We know when we should explictly send reads to master db, but how can we
do that. It's

{% highlight ruby %}
ActiveRecord::Base.with_master {
  User.find(post.user_id)
}
{% endhighlight %}

Almost all of replication gem provide with_master method, any queries in
the block will be sent to master db. I added a monkey patch to background
job, wrapping it with with_master.

I added add a monkey patch to action controller as well, adding a parameter
if the response is a redirect, then add a around_filter to controller to
check if the reads in such request should be sent to master or slave db.

{% highlight ruby %}
class ApplicationController < ActionController::Base
  around_filter :manage_slaving

  def manage_slaving
    if force_master?
      ActiveRecord::Base.with_master { yield }
    else
      yield
    end
  end
end
{% endhighlight %}

force_master? is a convenient way to manage your master/slave db on
controller levels, you can also enable/disalbe master/slave for some
specfied requests.

Finally test your application and add ActiveRecord::Base.with_mater {}
if necessary.

[1]:https://www.ruby-toolbox.com/categories/Active_Record_Sharding
