---
layout: post
title: Migrate rails-bestpractices.com to rails4
categories:
- rails
---

These 2 weeks I migrated [rails-bestpractices.com][1] to rails 4 from
rails 3.2.13. Here are some experience I'd like to share with you.

### Make sure you have good test code

rails-bestpractices.com has many rspec and cucumber test code, they can
find out most of warnings and errors after migration.

### Update Gems

First, update rails to 4.0.0 in Gemfile, but soon you will find you have
to update many gems, devise, compass-rails, cucumber-rails, etc., some
are rc version or raisl4 branch,

You also need to remove some gems, like strong_parameters and
turbo-sprockets-rails3.

### Update bin executables

Rails 4 app finds executables in bin/ directory, run

{% highlight ruby %}
rake rails:update:bin
{% endhighlight %}

to get bin/bundle, bin/rails and bin/rake

### Remove unused configs

{% highlight ruby %}
config.whiny_nils
config.active_record.mass_assignment_sanitize
config.active_record.auto_explain_threshold_in_seconds
{% endhighlight %}

### Add new configs

{% highlight ruby %}
config.eager_load = false
{% endhighlight %}

to config/environments/development.rb and config/environments/test.rb

{% highlight ruby %}
config.eager_load = true
{% endhighlight %}

to config/environments/production.rb

### New secret_token

Rails 4 encrypts the contents of cookie-based sessions, need to use
secret_key_base instead of secret_token.

{% highlight ruby %}
Application.config.secret_token = 'xxx'
# =>
Application.config.secret_key_base = 'yyy'
{% endhighlight %}

### Remove assets group

Rails 4 has removed assets group, you should remove it from Gemfile and
config/application.rb

{% highlight ruby %}
# Gemfile
group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'
  gem 'uglifier'
end
# =>
gem 'sass-rails'
gem 'coffee-rails'
gem 'uglifier'

# config/application.rb
if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development test)))
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end
# =>
Bundler.require(:default, Rails.env)
{% endhighlight %}

### Filter parameters in initializer

Rails 4 prefer setting filter_parameter in initializer.

{% highlight ruby %}
# config/application.rb
config.filter_parameters += [:password]
# =>
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [:password]
{% endhighlight %}

### Fix routes

Rails 4 doesn't allow using match (without setting via get or post), should
use get or post instead, like

{% highlight ruby %}
match '/auth/failure' => redirect('/')
# =>
get '/auth/failure' => redirect('/')
{% endhighlight %}

### New scope syntax

Rails 4 only allows scopes as a proc

{% highlight ruby %}
scope :published, where(:published => true)
# =>
scope :published, -> { where(:published => true) }
{% endhighlight %}

### Enable turbolinks

Assume you are not using any client side MVC framework, like Backbone or
Ember, turbolinks can speed up your web pages initialization.

1\. add turbolinks gem in Gemfile

{% highlight javascript %}
gem "turbolinks"
{% endhighlight %}

2\. require turbolinks in application.js

{% highlight javascript %}
//= require turbolinks
{% endhighlight %}

Please let me know if you have any problems to migrate to rails 4 :-)

[1]: http://rails-bestpractces.com
