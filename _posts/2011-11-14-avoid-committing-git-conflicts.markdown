---
layout: post
title: avoid committing git conflicts
categories:
- git
---
I made a mistake when merging branch last week, I forgot to remove a
conflict syntax "<<<<<< HEAD" and push it to remote repository. It
breaks other one's development. So stupid to make such mistake.

To avoid making such mistake anymore, I write a git hook
.git/hooks/pre-commit to check conflict syntax "<<<<<<" and ">>>>>>"

{% highlight ruby %}
#!/usr/bin/env ruby

`git diff-index --name-status HEAD`.split("\n").each do
|status_with_filename|
  status, filename = status_with_filename.split(/\s+/)
  next if status == 'D'
  File.open(filename) do |file|
    while line = file.gets
      if line.include?("<<<<<<<") || line.include?(">>>>>>>")
        puts "ERROR: #{filename} is conflict"
        exit(1)
      end
    end
  end
end
{% endhighlight %}

It will prevent you from committing conflicts.
