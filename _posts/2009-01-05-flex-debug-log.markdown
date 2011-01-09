---
layout: post
title: flex的调试日志
categories:
- flex
---
Flash的debug是个头疼的问题，最好的方法是使用flash的logging来做日志调试。

要使用Flash的debug，首先要安装adobe的debug版flash，然后要配置mm.cfg，具体路径和配置方式见以下链接：[http://livedocs.adobe.com/blazeds/1/blazeds_devguide/help.html?content=services_logging_2.html][1]，之后就可以使用Flash的logging。

下面给个实例吧：

{% highlight actionscript %}
import mx.logging.*;
import mx.logging.targets.*;

private var myLogger : ILogger;
public function printLog(level:Number):void {
    if(level ==2) myLogger.debug("This is debug click");
    if(level == 4) myLogger.info("This is info click");
    if(level == 6) myLogger.warn("This is warn click");
    if(level == 8) myLogger.error("This is error click");
    if(level ==1000) myLogger.fatal("This is fatal click");
}

private function initLog():void {
    // Create a target.
    var logTarget:TraceTarget = new TraceTarget();
    logTarget.filters=["*"];
    logTarget.level = LogEventLevel.ALL;
    // Add date, time, category, and log level to the output.
    logTarget.includeDate = true;
    logTarget.includeTime = true;
    logTarget.includeCategory = true;
    logTarget.includeLevel = true;
    // Begin logging.
    Log.addTarget(logTarget);
    myLogger = Log.getLogger("test");
}
{% endhighlight %}

点击之后的结果如下：

{% highlight bash %}
1/4/2009 20:04:41.149 [FATAL] test This is fatal click
1/4/2009 20:04:41.740 [ERROR] test This is error click
1/4/2009 20:04:42.695 [WARN] test This is warn click
1/4/2009 20:04:43.283 [INFO] test This is info click
1/4/2009 20:04:44.056 [DEBUG] test This is debug click
{% endhighlight %}


  [1]: http://livedocs.adobe.com/blazeds/1/blazeds_devguide/help.html?content=services_logging_2.html

