---
layout: post
title: railsrumble 2013 - designapis
categories:
- railsrumble
---

I took part in this railsrumble last weekend, my entry is
[designapis.com][1].

Why did I built it? It comes from my working experience, I worked on
serveral projects that needs to design http apis for ios clients, as we
worked remotely, we have to write down the apis so that ios developers
and ruby developers can work independently.

Before we used google docs and github gists, they are both good to share
between team, but they don't provide any style/format, I have to set the
format by myself, it's not convenient, I have to remember all formats
for requests, responses and parameters, otherwise they will generate
wrong styles.

So I decided to build a service to simplify apis design/documentation,
as railsrumble last only 2 days, I just implemented a small set of
features I wanted, currently you can generate CRUD apis from a template
(inspired from rails generator), you can add any request, response and
parameter, it also gives you some hints that you should take care of
error responses like 404 and 422.

Feel free to try it without registration and any feedback is welcome.

[1]: http://designapis.com
