---
layout: post
title: Upgrade Mongoid - Write Tests First
categories:
- mongoid
- Ruby
---
Mongoid is one of the popular Object Document Mappings between Ruby and Mongo, and it is still evolving. We began to use mongoid 2.0.0.beta.20 several weeks ago, the author of mongoid @durran said he wanted to release the 2.0.0 last week (As you know 2.0.0 is still not released yet, but he really did a lot of awesome work), so we tried the version 2.0.0.rc.6 to prepare upgrading to final 2.0.0.

I'm working on upgrading mongoid from 2.0.0.beta.20 to 2.0.0.rc.6 these days. I'm willing to write several posts to share my experience about upgrading.

At the first post, I just want you keep in mind that **don't do any upgrading before you write tests for your models**. There are many api changes between mongoid 2.0.0.beta.20 and 2.0.0.rc.6, I can't imagine how to upgrade without tests, as our project has almost 30 models and 100 view pages, I can't check the models and views one by one. Luckily, we have built many rspec tests for models and cucumber tests.

It's expected that many test failures raised after upgrading, if I fixed all the failures, the job to upgrade is complete.

I have to say I like such upgrading job, I read the source codes of mongoid, checked git logs, sometimes thought why they made such changes, and always learned a lot from reading source codes. :-)
