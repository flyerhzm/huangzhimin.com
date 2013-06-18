---
layout: post
title: How to render, upload and download large files on heroku with s3
categories:
- rails
- heroku
- s3
---
I'm consulting on a rails project on heroku, it involves generating a
large pdf for customer, so you must already guess it leads to 30s
timeout on heroku.

At first, I handled it with common sense, moving pdf render to a
background job, in the client side, it polls the status of bj, if job is
complete, then render the pdf.

Everything works fine on my laptop, but after pushing to heroku, it
succeed to running then job, polling the status, but finally it can't
find the generated pdf. Then I realized web dyno and worker dyno are
running on different servers, that means web dyno can't find the pdfs
which are generated on worker dyno. Okay, we need a cloud storage
service, of course, s3 is the first choice.

I used aws-sdk as the s3 client, it's pretty easy to upload pdf to s3,
as pdfs are private on s3, it has to download pdf and render to client
after polling successfully. The timeout problem still exists if the pdf
file is large or the network is not good. (take a long time to render
pdf content to client)

After googling some solutions, I decided to use [S3 Temporary Security
Credentials][1], it creates a resource url with a temporary credential,
you can set the expire date for the resource, it sacrifices some
privacy, the resources are still private, but they can be accessed by
the url with a temporary credential, we set the expire date to 1 hour
later, so it's not a big deal.

Resource url with temporary security credential doens't exist in aws-sdk
gem, so I have to implement it by myself.

{% highlight ruby %}
require 'openssl'
require 'digest/sha1'
require 'base64'

def signed_url(path, expire_date)
  digest = OpenSSL::Digest::Digest.new('sha1')
  string_to_sign = "GET\n\n\n#{expire_date}\n/#{S3_BUCKET}/#{path}"
  hmac = OpenSSL::HMAC.digest(digest, S3_SECRET_ACCESS_KEY, string_to_sign)
  signature = CGI.escape(Base64.encode64(hmac).strip)
  "https://#{S3_BUCKET}.s3.amazonaws.com/#{path}?AWSAccessKeyId=#{S3_ACCESS_KEY_ID}&Expires=#{expire_date}&Signature=#{signature}"
end
{% endhighlight %}

It can generate signed url for different resources with different expire
date, now I just tell client the signed_url and the client just render
the pdf from s3 rather than heroku, so no timeout anymore, awesome!

So the whole process is as follows

1. Client clicks "Print PDF" button, it sends a request to web dyno.
2. Web dyno asks worker dyno render pdf. i
3. Client keeps polling the job status.
3. Worker dyno render the pdf and uploads to s3, generates a signed url.
4. Client gets the jos complete message with s3 signed url.
5. Client print the pdf from s3.

[1]: http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html
