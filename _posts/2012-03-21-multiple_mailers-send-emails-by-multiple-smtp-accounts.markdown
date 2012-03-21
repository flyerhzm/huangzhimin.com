---
layout: post
title: multiple_mailers - send emails by different smtp accounts
categories:
- rails
- actionmailer
---
I use gmail to send email notifications on my website, it's really easy
to build based on actionmailer

{%highlight ruby%}
ActionMailer::Base.smtp_settings = {
  :address => 'smtp.gmail.com',
  :port => 587,
  :domain => 'railsbp.com',
  :authentication => :plain,
  :user_name => 'notification@railsbp.com',
  :password => 'password'
}
{%endhighlight%}

But I found it does not allow to setup 2 different smtp accounts, e.g. I
want to send notification email with notification@railsbp.com and send
exception notifier email with exception.notifier@railsbp.com, after
googling, I hacked my mailer classes with

{%highlight ruby%}
class NotificationMailer < ActionMailer::Base
  if Rails.env.production?
    class <<self
      def smtp_settings
        options = YAML.load_file("#{Rails.root}/config/mailers.yml")[Rails.env]['exception_notifier']
        @@smtp_settings = {
          :address              => options["address"],
          :port                 => options["port"],
          :domain               => options["domain"],
          :authentication       => options["authentication"],
          :user_name            => options["user_name"],
          :password             => options["password"]
        }
      end
    end
  end
end
{%endhighlight%}

then add a new config file config/mailers.yml

{%highlight yaml%}
production:
  common: &common
    address: 'smtp.gmail.com'
    port: 587
    domain: 'rails-bestpractices.com'
    authentication: 'plain'

  notification:
    <<: *common
    user_name: 'notification@rails-bestpractices.com'
    password: 'password'

  exception.notifier:
    <<: *common
    user_name: 'exception.notifier@rails-bestpractices.com'
    password: 'password'
{%endhighlight%}

that allows me to setup one smtp account per actionmailer class, keep in
mind that you should only hack smtp_settings for what environment you
really want to send emails (here is production), if you don't check
Rails.env, it will send email even in development and test environments.

Now it works fine, I can send emails by as many smtp accounts as I like, but
it looks ugly, I don't like hacking codes all over my mailer classes. So I
abstract it to a new gem [multiple_mailers][1], like the hack above, you
should define config file config/mailers.yml and for each mail class,
what you only need is to declare its mailer account name

{%highlight ruby%}
class NotificationMailer < ActionMailer::Base
  mailer_account "notification"
end

class ExceptionNotifier
  class Notifier < ActionMailer::Base
    mailer_account "exception.notifier"
  end
end
{%endhighlight%}

[1]:https://github.com/flyerhzm/multiple_mailers
