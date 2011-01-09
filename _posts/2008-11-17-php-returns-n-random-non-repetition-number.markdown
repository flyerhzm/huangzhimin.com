---
layout: post
title: php返回N个不重复的随机数
categories:
- php
---
应用场景：需要从数据库中随机查询多条数据，mysql反对使用order by rand()，因为效率太差。也看到通过子查询来模拟的，不过还是麻烦。最简单的方法，就是读取数据表中的max(id)，然后在程序中生成N个随机数，然后应用where id in (?)来获取数据。

php程序生成N个随机数的思想就是定义一个N大小的数组用来存放随机数，每次生成一个随机数都遍历一遍数组，如果已经存在就丢弃，如果不存在就插入到数组中，直到数组的随机数已满。

程序如下：

{% highlight php %}
/**
 * 获取$num个不重复的随机数数组
 *
 * @param $min integer 随机数的最小值
 * @param $max integer 随机数的最大值
 * @param $num integer 随机数的数量
 * @return array $num个随机数
 */
function random_numbers($min, $max, $num) {
    if ($num > $max - $min + 1  $num  1) {
        return null;
    }

    $numbers = array();
    $numbers[] = rand($min, $max);
    $tempnum = 1;

    while ($tempnum  $num) {
        $new_num = rand($min, $max);
        $is_repeat = false;
        foreach ($numbers as $number) {
            if ($number == $new_num) {
                $is_repeat = true;
                break;
            }
        }
        if (!$is_repeat) {
            $tempnum++;
            $numbers[] = $new_num;
        }
    }
    return $numbers;
}
{% endhighlight %}

其他语言的实现方式也类似。

