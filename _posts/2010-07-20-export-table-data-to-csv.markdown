---
layout: post
title: 将table的数据导出为csv
categories:
- Rails
---
项目中经常会有这样的usecase，把一个table中的数据导出为csv，用fastercsv这个gem可以快速完成这个功能。

首先放一个导出csv的链接

{% highlight ruby %}
= link_to 'Export to CSV', participants_path(:format => :csv)
{% endhighlight %}

然后在controller中生成相应的csv，并发送给用户

{% highlight ruby %}
def index
  @participants = Participant.all

  respond_to do |format|
    format.csv {
      participants_csv = FasterCSV.generate do |csv|
        csv  ["First Name", "Last Name", "Age", "Gender", "Address", "Phone", "Email"]
        @participants.each do |p|
          csv  [p.first_name, p.last_name, p.age, p.gender, p.address, p.phone, p.email]
        end
      end
      send_data participants_csv, :type => 'text/csv', :filename => 'participants.csv'
    }
  end
end
{% endhighlight %}

其中用FasterCSV快速创建好csv数据，再通过send_data发送给客户端就可以了

