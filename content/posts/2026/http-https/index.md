---
title: HTTP 与 HTTPS：请求报文、Cookie 与加密机制
description: 从自定义应用层协议出发，结合抓包示例梳理 URL、HTTP 请求方法与报头、Cookie 和 Session，再理解 HTTPS 的加密、证书与中间人攻击。
date: 2026-10-09
published: 2026-10-13
updated: 2026-10-13
categories:
  - 技术
  - 计算机网络
tags:
  - 计算机网络
  - HTTP
  - HTTPS
  - Cookie
  - TLS
type: story
image: /article-assets/2026/http-https/images/cover.webp
---

::quote
#icon
[HTTP & HTTPS]{style="color: var(--c-primary)"}
#default
请求报文 · Cookie · 加密机制
::

## 1.自定义协议
首先，程序猿在 TCP/IP 五层网络模型中，最主要打交道的就是应用层~

应用层是应用程序直接相关的部分。程序员写的代码，只要是涉及到网络通信的，就都可以视为应用层的一部分~

然后，应用层中也涉及到一些网络通信协议，这里的协议就需要区分两种：

1. **标准应用层协议**：HTTP、FTP、DNS、SMTP，这些由标准组织或相关社区制定的，供不同的软件共同遵循；
2. **自定义应用层协议**：程序猿会根据业务需求，自行规定客户端与服务端之间如何传递、解析以及处理数据；

另外，**自定义应用层协议不等于自定义 HTTP 协议**。

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/01-application-protocol.webp)

虽然，TCP 已经能帮助我们解决了可靠传输、有序传输等问题。但是，TCP 并不知道应用程序传输的数据代表什么~

就比如，客户端通过 TCP 连接服务器发送了：`1001,zhangsan,20`

服务器一脸懵逼~当然不知道这些字符串和数字代表什么，所以这些内容的定义就需要到应用层指定规则。

所以，自定义应用层协议，本质上就是程序员约定客户端与服务器如何组织、传输和理解应用数据。

### 1.1 消息内容格式
**消息内容格式**是自定义应用层协议的其中一个概念，另一个就是**消息边界格式**

假设客户端向服务器发送该信息：

```java
用户ID：1001
用户名：zhangsan
年龄：20
```

1. **行文本格式**

```java
1001,zhangsan,20
```

这样的话，客户端会和服务器事先约定好：

+ 第一个字段表示用户 ID
+ 第二个字段表示用户名
+ 第三个字段表示年龄
+ 字段之间使用英文逗号分隔

这种方法，其实比较土\~说实话我第一次看见就觉得很 low，因为学校的小作业一般就是这种...足以说明使用这种方案的年代多久远\~

特点就是，实现简单，但需要考虑分隔符出现在数据中的情况，例如用户名本身包含逗号时，需要额外制定转义规则。



2. **XML 格式**

```java
<user>
    <id>1001</id>
    <name>zhangsan</name>
    <age>20</age>
</user>
```

通过 XML 格式来约定请求和响应的数据。它看起来就和 HTML 很像，都是成对标签构成的键值对结构。但关键是 HTML 标签内容是固定的（H5 可以自定义了），而 XML 标签内容是自定义的。

另外，XML 还可以用于很多场景，组织一段格式化数据。可以将数据用来网络传输，作为配置文件...都可以~

现在也是很少使用到 XML 方案了。

但它的优点是可读性好，你可以一下知道这个元素对应是什么含义

缺点就是，冗余信息多，网络传输中，消耗更多带宽（带宽在服务器里是真的贵，用过云服务器的，选购一下就知道几千几千就上去了）



3. **json 格式**

```java
{
  "id": 1001,
  "name": "zhangsan",
  "age": 20
}
```

json 是当下最流行的网络格式组织的方案。我看 VScode 里的配置文件也是使用 json。

它的优点就是可读性很好，消耗的带宽也比 XML 更节省

而缺点就是，还是存在冗余



4. **Protocol Buffers（Protobuf）格式**

Protobuf 首先需要定义 `.proto`文件：

```java
syntax = "proto3";

message User {
    int32 id = 1;
    string name = 2;
    int32 age = 3;
}
```

然后将数据序列化成二进制字节

二进制结果（十六进制表示）：08 E9 07 12 08 7A 68 61 6E 67 73 61 6E 18 14

这些字节包含字段编号、字段类型相关信息以及实际数值。接收方依据约定的 Schema 进行解析。

这是基于二进制的格式，对数据进行压缩。不涉及到 json/xml 冗余信息了。带宽消耗最少，但可读性就变差了

后面还有 `MessagePack` 以及`自定义二进制`的格式了~

## 2. HTTP 请求
应用层处，除了自定义协议之外，还有我们上面提到的“**标准应用层协议**：HTTP、FTP、DNS、SMTP，这些由标准组织或相关社区制定的，供不同的软件共同遵循”

其中 HTTP 是每一位开发者都需要着重了解的~这也是当前 web 开发中最核心的协议

当前 HTTP 最新版本是 HTTP3。但因为 HTTP1.1 的广泛性 目前就以 HTTP 的经典 1.1 版本展开。

后续我直接以重点解释，基础概念性的就直接跳过~

### 2.1 初始请求包
要学习 HTTP 请求就得从请求包开始了解。这里我用的工具是 **BurpSuite**，就还是之前网安的小基础留下的\~如果有需要可以留下评论我会单独发\~另外也可以使用**费德勒 fiddler**

假设我当前在浏览器访问 baidu.com

得到请求包为：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/02-http-request-capture.webp)

响应包还不是我当前要讲的，所以就留到后面~

HTTP 协议是一个“文本格式的协议”（HTTP1.1 下）

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/03-http-message-structure.webp)

但这里需要先了解 URL

### 2.2 URL
URL（Uniform Resource Locator，统一资源定位符），是用于标识互联网上某个资源的位置以及访问方式的一种地址。

你也可以通俗的理解，URL 就是我们通常所说的网址~

但 URL 不仅可以定位网页，也可以定位图片、视频、文件、API 接口等

一个长剑 URL 表示为：

```bash
协议://主机名:端口号/路径?查询参数#片段标识符
```

当然，`主机名:端口号`这部分通常也会用域名来代替，毕竟背一串数字还蛮难的

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/04-url-components.webp)

```nginx
server {
    listen 443 ssl;
    server_name www.example.com;

    # HTTPS 证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

nginx 的配置文件通常这样写

1. 端口一般都在 Nginx 或者 Apache 这样一个服务器软件绑定好的，像 http 通常绑定的是 80 端口，https 绑定的是 443 端口。这些需要自己玩一下服务器就会明白~
2. 域名背后其实还是服务器的 IP 地址，当然，域名和 IP 地址也可以相互转换一下~这个过程通过 DNS 域名解析系统来完成（DNS 即是一套服务器系统，也是一种应用层协议）
3. 关于路径 Path，它可以是一个硬盘上的文件，也可以是虚拟的资源（通过一段代码逻辑来生成的数据）我的博客就是第二种。
4. 查询参数 Query 这部分就是对访问的资源补充说明。此处的键值对能咋写都是程序猿自定义的
5. 片段标识符 Fragment 是用来区分当前这个页面的哪个部分的。多出现在文档类网站

你也可以这样生动理解一下：

就拿我们学校校区的四食堂举个例子

```bash
https://四餐厅.example.com:8443/肉夹馍/猪肉夹馍?葱=少放&香菜=不要&辣椒=微辣#评价
```

| URL 组成 | 示例 | 对应的含义 |
| :---: | :---: | :---: |
| 协议（Scheme） | `https://` | 使用什么通信协议 |
| 主机名（Host） | `六餐厅.example.com` | 去哪家餐厅 |
| 端口（Port） | `:8443` | 从哪个服务窗口进入 |
| 路径（Path） | `/肉夹馍/猪肉夹馍` | 找到肉夹馍分类下的猪肉夹馍 |
| 查询参数（Query） | `?葱=少放&香菜=不要&辣椒=微辣` | 告诉厨师具体的口味要求 |
| 片段标识符（Fragment） | `#评价` | 定位到页面中的评价部分 |




| 符号 | 作用 | 举例 |
| :---: | :---: | :---: |
| `://` | 分隔协议和后续地址 | `https://` |
| `:` | 分隔主机名与端口 | `:8443` |
| `/` | 分隔路径层级 | `/肉夹馍/猪肉夹馍` |
| `?` | 表示查询参数的开始 | `?葱=少放` |
| `=` | 分隔参数名和参数值 | `辣椒=微辣` |
| `&` | 分隔多个查询参数 | `葱=少放&香菜=不要` |
| `#` | 引出片段标识符 | `#评价` |


以上就是对所举的 URL 解释。

另外，URL 中的**查询参数（Query）**这部分通常都进行加密，目的是**将特殊字符、中文等非 ASCII 字符转换为符合 URL 语法的表示形式，避免字符产生歧义，确保参数能够被正确传输和解析**。

假如我搜索不孕不育：

```bash
https://www.bing.com/search?q=%E4%B8%8D%E5%AD%95%E4%B8%8D%E8%82%B2
```

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/05-url-percent-encoding.webp)

像 / ? : 等这样的字符，已经被url当做特殊意义理解了。因此这些字符不能随意出现。

比如，某个参数中需要带有这些特殊字符，就必须先对特殊字符进行转义。

> 一个中文字符由 UTF-8 或者 GBK 这样的编码方式构成，虽然在 URL 中没有特殊含义，但是仍然需要进行转义。否则浏览器可能把 UTF-8/GBK 编码中的某个字节当做 URL 中的特殊符号。
>

转义的规则为，**将需要转码的字符转为16进制，然后从右到左，取4位（不足4位直接处理），每2位做一位，前面加上%，编码成%XY格式**。

### 2.3 请求方法
| **请求方法** | **主要作用** | **典型使用场景** |
| :---: | :---: | :---: |
| GET | 获取资源 | 查询用户、获取文章 |
| POST | 提交数据供服务器处理 | 登录、注册、创建订单 |
| PUT | 创建或整体替换目标资源 | 替换用户资料 |
| PATCH | 对资源进行部分修改 | 修改用户昵称 |
| DELETE | 删除指定资源 | 删除用户、删除订单 |
| HEAD | 获取响应元信息，不返回响应体 | 检查资源信息 |
| OPTIONS | 查询目标资源支持的通信选项 | CORS 预检请求 |
| CONNECT | 建立网络隧道 | HTTP 代理建立隧道 |
| TRACE | 请求链路上的消息回环测试 | HTTP 诊断，实际部署中通常禁用 |


以上的方法就大概需要学习 GET 和 POST 即可

所谓天下才有一石，曹子建独占八斗，我得一斗，天下文人共分一斗；而此处 GET 独占八斗，POST 占一斗，身下方法共分一斗~

所以很明显，GET 和 POST 这个就是最常见的请求了。从语义上来说是有一定区别的，但实际上开发的时候不一定会严格按照语义来进行区分~程序猿实现的时候还是能自行灵活掌控的。

#### GET 方法
1. 获取 html，获取 css，获取 js 等操作都是 GET：

请求服务器返回指定资源，不应要求服务器修改业务数据。

```plain
GET /users/1001 HTTP/1.1
Host: example.com
```

例如获取ID为1001的用户信息。

这里拿访问 github 举个例子：

```plain
GET / HTTP/2
Host: github.com
Cookie: _octo=GH1.1.634250377.1785320880; _device_id=50c032e36842f0325e19987f28d9e0a8; saved_user_sessions=184837021%3AGEQqMkXOUc5MechiQHmDZiaN69M83mIpexqOq_KvLQekOIu2; logged_in=no; _gh_sess=d956yKYEe9ssjf1AiAfqp6uT6QPZMmTcF279seA6Q4jBDVvO4VdasRzrK4rIvq90Qr9xyCJ4ZbAFe7aQzntne2p%2BaGZDnoUs4DIuFkW4V1y8jwZfpIIrUrh37YYHiwZKcSmN4ph%2FC8yYXUXfiGDWgCe26REdtjLooohW5TXoPFzrBDd1n03N%2F7d%2BRCdth0gs7fIEGbhq%2FSvrfx53xOb82WAwc1kAVwb0yWzG8HYi9HddWMFi6JsYETWvwiO0uFbNGhb7g1JYyW6h0EBdMszqzg%3D%3D--38C09shoxuN0FWCr--25N%2FwcWr%2Bv7sAS14SiD81Q%3D%3D; cpu_bucket=xlg; preferred_color_mode=dark; tz=Asia%2FShanghai
Cache-Control: max-age=0
Sec-Ch-Ua: "Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Windows"
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
If-None-Match: W/"7fd86f47542416a8956f61e2b94ac5d9"
Priority: u=0, i


```

此处 19 行空白行是固定存在的！！！

GET 的请求特点就是上面所说的结构那样，只是 URL 的 querystring 可以为空，也可以不为空。

关于 GET 请求的 URL 长度问题：

> 网上有些资料描述：`GET 请求长度最多 1024KB`，这样的说法是错误的。
>
> HTTP 协议由 RFC 2616 标准定义，标准原文中明确说明：
>
> "Hypertext Transfer Protocol -- HTTP/1.1" does not specify any requirement for URL length.
>
> 没有对 URL 的长度有任何限制。
>
> 实际 URL 的长度取决于浏览器的实现和 HTTP 服务器端的实现。在浏览器端，不同的浏览器对最大长度的支持不同，但是现代浏览器支持的长度一般都很长；在服务器端，一般这个长度是可以配置的。
>

#### POST 方法
2. 登录，上传文件 就是典型的 POST：

向服务器提交数据，由服务器按照资源对应的业务逻辑处理。

```plain
POST /users HTTP/1.1
Host: example.com
Content-Type: application/json

{"name":"Tom","age":20}
```

例如创建一个新的用户。

这里也拿 github 登录举个例子：

```plain
POST /session HTTP/2
Host: github.com
Cookie: _octo=REDACTED; _device_id=REDACTED; saved_user_sessions=REDACTED; logged_in=no; preferred_color_mode=dark; tz=Asia%2FShanghai; _gh_sess=REDACTED
Content-Length: [LEN]
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36

commit=Sign+in&authenticity_token=REDACTED&login=YOUR_USERNAME&password=YOUR_PASSWORD&webauthn-support=supported&timestamp=1791515239865
```

为保证信息安全，这里我进行了脱敏~

登录的请求包大概就是这样子，而如果是上传文件的话 就会带有正文，正文就是保存了当前上传的数据内容。如果是上传文件，会通过特殊的方式进行转码（base64 编码把二进制转成文本）当然其实 body 也是可以直接填二进制数据的

body 部分一般不为空。body 内的数据格式通过 header 中的`Content-Type`指定。body 的长度由 header 中的`Content-Length`指定。

#### GET 与 POST 的区别
经典面试题：谈谈 GET 与 POST 的区别

1. 语义上：GET 主要用来获取资源，到哪都是也可以携带查询条件，理论上也可以带 body；POST 不仅能提交数据，也可以请求服务器**执行查询等操作**，也就是可以带有 query string；当然，语义上其实可以混着用。
2. 幂等性：HTTP标准规定GET是安全且幂等的请求方法，也就是 **重复发送相同GET请求，不应产生额外的预期资源状态变更（HTTP 标准文档建议，非强制）。** POST 不保证幂等，但可以通过业务设计实现幂等。像是访问[B站](https://www.bilibili.com/)，刷新页面就是重复发送 GET 请求，但实际桌面显示的内容会变更，也就是非幂等的~
3. 缓存上，GET通常可以被缓存，POST在满足特定HTTP缓存条件时也可以被缓存，只是实际应用中比较少见。
4. 安全性上，一些资料会说“POST 比 GET 更安全”。当然这样的话是不科学的，是否安全要取决于前端在传输密码等敏感信息时是否进行加密，和 GET POST 方法无关。
5. 数据长度和类型上，HTTP标准没有简单规定GET只能传少量数据、POST能传大量数据。具体限制取决于客户端、服务器等实现。不过 GET 确实 URL 只能放文本，它的URL参数也可以通过编码表示二进制数据，只是效率较低。

### 2.4 请求报头 header
先再来看一下 HTTP 请求报文的基本结构：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/06-http-request-headers.webp)

请求报头就是中间那部分，**它的作用就是告诉服务器如何理解和处理这次请求**

在 HTTP/1.1 的文本表示中，每个请求头字段通常遵循键值对的格式，也就是：

> 字段名称: 字段值
>

例如：

```java
Host: www.example.com
Content-Type: application/json
Accept: application/json
```

常见的 HTTP 请求报头有：

| 请求头 | 作用 |
| :---: | :---: |
| `Host` | 指定目标服务器的主机名和可选端口号 |
| `User-Agent` | 描述客户端软件的信息 |
| `Accept` | 告诉服务器客户端希望接收的数据格式 |
| `Accept-Language` | 声明客户端偏好的语言 |
| `Accept-Encoding` | 声明客户端支持的内容编码（如压缩格式） |
| `Content-Type` | 声明请求体中的数据格式 |
| `Content-Length` | 表示请求体的字节长度（使用该字段时） |
| `Authorization` | 携带身份认证凭据 |
| `Cookie` | 向服务器发送之前保存的 Cookie 信息 |
| `Referer` | 表示当前请求通常是从哪个页面发起的 |
| `Connection` | 控制当前连接的部分选项，主要用于 HTTP/1.x |
| `Cache-Control` | 指定缓存相关指令 |


下面就介绍以上的其中几个常见的~

#### Host
Host 表示服务器主机的地址和端口，如：

```java
Host: www.example.com
```

表示这次请求面向 www.example.com 这个主机

因为一台服务器其实可以部署多个网站，甚至多个网站可以共用同一个 IP 地址。所以服务器就需要根据 Host 等信息确定客户端希望访问哪个站点；

#### Content-Length
Content-Length 即表示 body 中的数据长度，注意，单位是**字节**。如：

```http
Content-Length: 5
```

这样就表示请求体的长度为 5 字节（Byte），注意不是五个字符

主要是因为网络通信实际传输的是字节数据。而对于 UTF-8 编码，一个汉字通常占 3 个字节，所以**字符数量**不一定等于**字节数量**；

另外，不是所有 HTTP 请求都必须包含 `Content-Length` 。`Content-Length`的作用是声明 HTTP 消息体（Body）的长度，而不是声明整个 HTTP 请求的长度。

#### Content-Type
表示请求的 body 中的数据格式，常见值有：

| 值 | 含义 |
| :---: | :---: |
| `text/html` | HTML 数据，浏览器解析 HTML 标签并渲染为网页 |
| `text/css` | CSS 样式数据，浏览器解析选择器和属性，并应用到对应元素 |
| `text/javascript` | JavaScript 脚本，浏览器通过 JS 引擎解析并执行代码 |
| `application/json` | JSON 数据，浏览器可以展示，JavaScript 可以解析处理 |
| `image/png` | PNG 图片数据，浏览器解码并显示图片 |
| `image/jpeg` | JPEG 图片数据，浏览器解码并显示图片 |


注意，Content-Type 也可以出现在 HTTP 响应报头中，这个时候它描述的就是响应体的数据格式。浏览器会针对各种不同类型的数据进项解析~

```http
Content-Type: application/json
```

这样，就是表示客户端发送的请求采用 JSON 格式。

我给个例子：

下面的给出的数据类型则是 html，也就是下面 body 的内容。编码格式为 utf-8

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/07-content-type-html.webp)

#### User-Agent
User-Agent 即 UA，表示浏览器/操作系统的属性，用于向服务器提供客户端软件的信息，例如浏览器类型、版本、运行平台等。  如：

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/136.0.0.0 Safari/537.36
```

 服务器可以参考这些信息进行兼容性处理或统计分析；

上面举出的例子中就有很多浏览器的名称在上面，但不代表着用户是通过这些浏览器访问的。浏览器为了兼容一些依赖浏览器标识的网站，浏览器的 User-Agent 会保留一些历史兼容字段：

+ `Mozilla/5.0`：历史兼容标识，不代表 Firefox
+ `AppleWebKit/537.36`：兼容标识，不代表一定使用 Safari 的渲染引擎
+ `Chrome/155.0.0.0`：Chromium 系浏览器常见的兼容标识
+ `Safari/537.36`：兼容标识，不代表 Safari
+ `Edg/155.0.0.0`：Edge 的特征标识

我再举一个例子：

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/136.0.0.0 Safari/537.36
User-Agent：Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0
```

浏览器会通过上面两个不同的 UA 判断出客户端具体使用什么浏览器：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/08-user-agent-chrome.webp)

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/09-user-agent-edge.webp)

现代 Edge 和 Chrome 都基于 Chromium 技术，所以 edge 里会包含 Chrome~

另外，User-Agent 可以由客户端自己去设置或者伪造，不能作为可靠的身份认证依据

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/10-user-agent-browser-stats.webp)

UA 还有一个用途，就是能用来区分用户的设备，像我博客使用的统计就是使用这种方式判断用户设备的~

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/11-user-agent-device-stats.webp)

#### Referer
Referer 是表示这个页面是从哪个页面跳转过来的；就像：

```http
Referer: https://www.google.com/
```

通常会是点击某个链接会自动跳转，那么跳转的这个请求包就会有 referer。它会高速服务器当前请求通常是由哪个页面发起的。通常用于来源统计、防盗链和辅助安全校验。我的博客网站也有相关统计。

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/12-referer-source-stats.webp)

#### Cookie
我先把解释放在前面：

**Cookie**：通常负责在浏览器中保存 SessionId；

**Session**：一个用来存储用户会话信息的对象，例如用户 ID、用户名、登录状态等；

**SessionId**：Session 对象的唯一标识，相当于这个 Session 的“身份证号”；



Cookie 是服务器通过 HTTP 响应要求浏览器保存的一小段数据。浏览器保存后会在满足条件的 HTTP 申请中，会自动把对应的 Cookie 发送给服务器

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/13-cookie-exchange.webp)

我见到的 Cookie 通常就是用来进行**会话管理（session）**、个性化设置和用户行为分析这样的。在浏览器的开发者模式里也能看到：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/14-browser-cookie-storage.webp)

浏览器保存这些 cookie 之后，就会在后续给服务器的请求的时候，把这些 cookie 键值对放到请求 cookie header 中传输给服务器

---

Cookie 与 session 是相互作用的，**session 是用于保存登录状态的（用户 ID、登录状态等），让服务器能够识别当前请求的是哪个用户**~

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/15-session-login-flow.webp)

具体流程示意就如上图。

当客户端发送请求到服务器时，服务器就会查询数据库验证你的用户密码是否有效，如果匹配成功，就会生成 SessionId，然后是生成 Session 对象；再把用户的关键信息保存到 Session 对象中；然后是将 SessionId 和 Session 对象作为键值对，保存到内存的 hash 表中，最后把 SessionId 通过 Set-Cookie 返回给服务器~

服务器接收到后续请求之后，直接通过 Cookie 中的 SessionId 就可以知道当前这个请求是哪个用户发来的了，也就不需要用户再重新登录~



<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/16-session-storage.webp)

服务器可以通过 SessionId 找到对应的 Session 对象~



Cookie 与 Seesion 的存储位置也是有差的。

| 对比项 | Cookie | Session |
| :---: | :---: | :---: |
| 存储位置 | 浏览器端 | 服务器端 |
| 保存内容 | 通常保存 Session ID | 用户 ID、登录状态等会话数据 |
| 主要作用 | 在请求中携带会话标识 | 保存和管理用户会话状态 |
| 数据关联 | `sessionId=abc123` | `abc123 → 用户会话信息` |


当然，Cookie 是可能会过期的，服务器返回 Cookie 的时候是可以设置有效时间的。

## 3.HTTPS
HTTPS 指的是 HyperText Transfer Protocol Secure 超文本传输安全协议

简单理解就是 HTTPS = HTTP + TLS/SSL；

其中的 SSL 是应用层的一个协议，住宿你们负责加密；

从前面对 HTTP 的了解就能知道，HTTP 主要就是负责：

> 定义请求格式、定义响应格式以及 GET、POST 等方法
>

而 TLS 则是负责：

> 加密数据、验证身份、保证数据完整性
>

HTTPS 主要就是在 HTTP 和 TCP 之间增加了一层安全协议，也就是对其进行了加密操作。网络传输中不再直接传输明文了，而是加密之后的“密文”，其中加密的方式又分为“**对称加密**”和“**非对称加密**”

### 3.1 HTTPS 工作流程
#### 对称加密
对称加密是指加密和解密使用同一把密钥，例如：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/17-symmetric-encryption.webp)

但对称加密的话，就需要客户端和服务端在最开始的时候，其中一方生成一份唯一密钥，在通过网络传输给另一方。加入是服务器生成：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/18-symmetric-key-exposure.webp)

如果是这样的话，那攻击者拿到密钥就轻而易举了，加密也就形同虚设了；

所以引出一种解决方案就是：使用非对称加密传递对称密钥

#### 非对称加密
非对称加密是指使用一对相互关联的密钥进行加密和解密的方式，两把密钥分别是：

公钥：可以公开分享给任何人

私钥：必须由持有者妥善保管，不能泄露

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/19-asymmetric-encryption.webp)

形象的使用案例就如像下面这样：

**提前说明一下，客户端是在访问服务器的时候就已经拿到公钥了，具体在“证书”会讲解到**

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/20-hybrid-key-exchange.webp)

这样的话，由于攻击者手里没有私钥，就算攻击者拿到了公钥，也不能对 888888 加密后的数据进行解密。这样数据到达服务器，服务器就会用自己的私钥解密了~

当然，非对称也是有一定的缺点，主要就是速度慢，非对称加密涉及复杂数学运算。就比如 RSA 这种使用大整数运算以及素数计算的，这种计算成本远高于对称加密，不适合大量数据传输~

| **对比** | **对称加密** | **非对称加密** |
| :---: | :---: | :---: |
| **密钥数量** | 一个 | 两个 |
| **密钥** | 相同 | 公钥 + 私钥 |
| **加密速度** | 快 | 慢 |
| **数据传输** | 适合大量数据 | 不适合大量数据 |
| **密钥交换** | 困难 | 简单 |
| **典型算法** | AES、DES | RSA、ECC |


另外再补充一下，**现代解决对称加密的密钥解决方案**是：

> 现代 HTTPS 使用的 TLS 1.3 采用更先进的 ECDHE 密钥交换机制；也就是客户端和服务器各自生成临时密钥材料，交换必要的公开信息，并在本地计算出相同的共享秘密。
>
> 当然，共享秘密本身不会直接通过网络传输。
>
> 之后双方再由共享秘密派生用于对称加密的会话密钥。整个密钥交换过程还需要经过身份验证，以防止中间人攻击。
>

总之，上述提到的非对称加密方法**主要就是为了方便传输对称加密密钥**~



#### 中间人攻击（MITM）
但是，使用非对称加密方法传输对称加密密钥存在着重大隐患！也就是中间人攻击

简化出来就是攻击者会在客户端和服务器之间入侵到一台网络设备，使得客户端的数据先经过攻击者。攻击者就会可能读取客户端密码、修改请求内容等~

在上面使用的非对称加密方法传输密钥就存在被攻击者窃听的风险；

我用一个模型来说明：

中间人攻击会在客户端第一次询问公钥的时候就开始劫持

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/21-mitm-key-substitution.webp)

后续客户端和服务器就会使用这个被攻击者劫持的 key 来继续进行加密传输了~

这是使用非对称加密传输对称加密密钥的部分~

为了解决这一部分问题就需要引入一个校验机制。主要就是为了**让客户端能够区分收到的公钥是否是服务器真实的公钥还是被攻击者篡改的公钥**；

#### 证书
证书的工作流程就如下边所示：

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/22-certificate-verification.webp)



首先证书是需要服务器去申请的，同时你还得需要有域名，因为证书是需要绑定域名的，同样，我的博客能够使用 https 访问就是因为签发了证书。否则浏览器会告诉你这是一个不安全连接~

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/23-https-certificate.webp)

我再来解释一下**上面的流程图**：

1. 首先服务器会先生成非对称密钥，也就是公钥 `pub1` 和私钥 `pri1`，公钥可以公开，私钥由服务器自己保管，不会泄露
2. 服务器会将它的一些材料（**服务器域名、公钥等**）提交给第三方认证机构（CA）申请证书。第三方认证机构就会颁发一个数字证书给服务器。
3. 这一步就是第三方认证机构（CA）生成数字签名的过程。上面的**数字证书就包含了有**域名、服务器公钥`pub1`、证书有效期、证书颁发机构、算法以及 CA **数字签名，数字签名也就是一个校验和 1**（数字签名是数字证书中的一个重要组成部分，用来证明证书内容没有被篡改，并证明是谁签发的）:
    1. CA 使用哈希算法对证书的待签名内容计算消息摘要。
    2. CA 使用自己的私钥 `pri2`，通过数字签名算法**对摘要进行签名**。
    3. 生成的签名会附加到数字证书中。

**以上部分只是服务器与 CA 之间的提前在网站上线前做好的准备。只有当客户端通过 HTTPS 访问服务器时，服务器才会在 TLS 握手中将自己的证书发送给客户端。**

4. 然后就是当客户端通过 HTTPS 访问服务器收到证书后，就需要**检验证书是否合法**了。客户端会通过**受信任的 CA 证书链**获取对应的 CA 公钥 `pub2`，随后，客户端对数字证书中的待签名内容（包括域名、服务器公钥 `pub1`、有效期、签发者等信息）使用对应的哈希算法进行计算，得到哈希摘要 H2（**校验和 2**）。
5. 客户端再通过公证机构的公钥 `pub2` 对证书中的数字签名进行解密，得到哈希摘要 H1 **（校验和 1，也就是服务器申请证书的时候得到的原始校验和）并与自己计算的 H2（校验和 2）进行比较。** 如果验证成功，就说明证书的待签名内容没有被篡改，并且签名由对应 CA 私钥生成。

**补充一下：** 签名验证成功只是证书验证的一部分。客户端还需要确认 CA 证书链可信、域名匹配、证书处于有效期内，并在 TLS 握手中确认服务器持有对应私钥。只有通过这些必要检查，才能建立对服务器身份的信任。

以上就是整个证书验证过程。是有点**复杂**哈，需要细品一下~



解释一下：而至于客户端是如和确保拿到的`pub2` 是公证机构的 `pub2`而不是攻击者伪造的 `pub2`。主要是因为 pub2 就不是通过网络传输的，而是**内置在操作系统中**（安装好系统的时候，系统就内置好了一系列知名公证机构的公钥）。所以只要安装的是正版系统，不是被攻击者乱搞过的系统就可以信任 pub2 是正确合法的~



而至于攻击者想要直接修改证书的公钥为自己的公钥的话，这个时候就会导致客户端计算的校验和和解密出来的校验和对不上，然后客户端就会报错，浏览器就会弹出一个红色的页面，告诉该网站不安全，是否要继续访问（经常访问没有证书的网站，也就是 http 的网站就会报出这些警告）

> 另外攻击者显然是不能自己申请一个证书去替换服务器的证书。我上面说过，首先域名是单独且唯一的。攻击者申请的证书的的域名和正经服务器的域名肯定是不一样的。浏览器这也能验证，输入的 URL 的域名和得到的证书的域名是不是匹配，不匹配的话，同样认为证书是违法的~
>

当然，证书的公钥的话攻击者也是有的，所以攻击者最多只是能查看客户端的请求内容，还做不到能篡改内容。

> 还有一个要点：使用抓包工具的时候，要想抓到 HTTPS 的包的话，是需要安装证书的。这个证书不是网站服务器的证书，而是抓包工具自己生成的 CA 证书。**抓包工具通过把自己伪装成一个“受信任的 CA”，然后动态给目标网站生成一个假的服务器证书，从而实现 HTTPS 解密。本质上也是中间人攻击，但是是经过用户授权的中间人攻击。**
>

以上内容是经典的面试考点，从对称加密到证书&数字签名。这部分核心的内容主要是基于 TLS 协议进行的。也就是 HTTPS 的一部分：HTTPS = HTTP + TLS + TCP

<!-- 这是一张图片，ocr 内容为： -->
![](/article-assets/2026/http-https/images/24-network-protocol-stack.webp)

这张图片也是给我后面引出 UDP 和 TCP 了
