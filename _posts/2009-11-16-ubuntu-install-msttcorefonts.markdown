---
layout: post
title: Ubuntu安装msttcorefonts
categories:
- Linux
---
前一段时间装了N次Ubuntu，又回到了8.04版本。不过每次在安装msttcorefonts的时候都会失败，原因是家里的网络不好，而ubuntu下载字体的timeout又很小，所以每次肯定是失败了。

怎么办呢？只能上http://sourceforge.net/projects/corefonts/files/把所有的字体都手动下载下来，为每个字体的.exe文件都对应创建一个.done文件。然后sudo apt-get install msttcorefonts，同时复制所有的字体.exe和.done文件到/tmp/msttcorefonts-xxx目录下面（其中xxx可能是任意字符），这样就完成了msttcorefonts的安装了。

