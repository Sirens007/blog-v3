---
title: Java Socket 编程：TCP、UDP 与回显服务器实践
permalink: /posts/javase-socket/javase-socket/
description: 从客户端与服务端模型出发，梳理 TCP、UDP 的特点与 Socket 常用 API，通过回显服务器和客户端示例理解网络通信、I/O 流与消息边界，并初步认识 I/O 多路复用。
date: 2026-10-06
published: 2026-10-06
updated: 2026-10-06
categories:
  - 开发
  - Java SE
tags:
  - Java SE
  - Socket
  - TCP
  - UDP
  - 网络编程
image: /article-assets/2026/javase-socket/images/cover.png
---

## 1.网络编程
网络编程，指通过编写程序，利用计算机网络实现不用设备或进程之间的数据通信。

可以理解为，网络编程就是让两台或多台计算机上的程序能够通过网络交换数据~

就比如像是：

+ 微信聊天：用户发送消息，服务器将消息转发给接收方。
+ 浏览网页：浏览器向服务器发送 HTTP 请求，服务器返回网页内容。

### 1.1 基本模型
网络编程中最常见的就是客户端/服务端模型，也就是 Client/Server 简称 C/S

但首先需要先了解**发送端**和**接收端**：

发送端：数据的发送方进程，称为发送端。发送端主机即网络通信中的源主机

接收端：数据的接收方进程，称为接收端。接收端主机即网络通信中的目的主机

收发端：发送端和接收端两端，也称为收发端

注意：发送端和接收端只是相对的，只是一次网络数据传输产生数据流向的概念


![](/article-assets/2026/javase-socket/images/01.png)

接下来就到了**服务端**和**客户端**~

服务端：在常见的网络数据传输场景下，提供服务的一方进程，称为服务端，可以提供对外服务。

客户端：获取服务的一方进程，称为客户端。

模型就像下图中：


![](/article-assets/2026/javase-socket/images/02.png)

以浏览器访问网站为例：

1. 客户端发送请求：浏览器向服务器发送 HTTP 请求。
2. 服务器接收请求：服务器接收请求并执行相应的业务逻辑。
3. 服务器返回响应：服务器将处理结果通过网络发送给客户端。
4. 客户端接收响应：浏览器接收数据，并将网页内容显示给用户。

## 2.Socket
接下来才是正题~

浅浅了解计算机网络相关知识就可以知道，程序完成的事情就是**把请求发过去，再把响应包收回来**。

但关键是 Java 程序或者说代码自身不能自己从头控制网卡、组织所有协议头、处理整个网络通信过程。但操作系统已经提供了这些网络能力~

程序通过一组接口，就能够调用刚刚所说的部分功能。而 **Socket 套接字就是操作系统提供的网络通信机制中的通信端点**~

可以这样理解：**创建和使用 Socket，就是让程序获得了一个用于收发网络数据的端点**。

Socket api 这就是传输层给应用层提供的。

而 Java 又把这些能力封装成了类，所以在 Java 中就可以通过创建对象、调用方法来完成通信。



**而传输层本身就有两个很重要的协议**~

分别是 TCP 和 UDP。这两个协议规定了传输层的通信方式。而 Socket 让程序能够使用这些通行能力。

另外 TCP 和 UDP 差别也非常大，编写代码的时候风格也是不同的~

+ TCP 是有连接，可靠传输，面向字节流，全双工的
+ UDP 是无连接，不可靠传输，面向数据报，全双工的

下面分别介绍一下这两个特点，当然 也是再温习一遍计算机网络啦

### 2.1 TCP 协议特点
1. 首先是**有连接**，TCP 在正式传输数据之前，需要现在通信双方之间建立逻辑连接。通过三次握手来建立连接；然后是在建立好的连接基础上交换数据；再然后就是断开连接，通常是通过四次握手完成也可能通过 RST 等方式终止连接
![](/article-assets/2026/javase-socket/images/03.png)这里的连接不是物理线路，而是双方维护的通信状态，就比如序列号、缓冲区和窗口大小等~



2. 可靠传输。TCP 能够保证，**只要连接正常工作并且数据成功交付，接收方就能按照正确顺序获得完整、不重复的字节数据**。TCP 主要就是通过这些机制来实现可靠传输：序列号、确认应答（ACK）、超时重传、校验和、接收端去重和重排序、流量控制、拥塞控制。就比如：发送方一次发送 A、B、C 三段数据，其中 B 在网络中丢失。
![](/article-assets/2026/javase-socket/images/04.png)TCP 会检测到数据缺失，并通过重传等机制尝试恢复数据。另外需要注意的是：**可靠传输不代表数据绝对不会丢失，也不代表一定传输成功**。如果网络持续中断，TCP 最终可能超时或连接失败。它的可靠性主要体现在不会把缺失、乱序的数据当作完整、有序的数据流正常交付。
3. 首先知道 TCP 是**面向字节流**的，**TCP 将应用程序发送的数据看作一串连续的字节，而不是一条条独立的消息**。**假设**我向对方先后发送两段内容，分别是`hello`、`world`。发送方执行了两次 `write()`，但接收方不一定恰好执行两次 `read()` 才能读完，意思就是他的一次读取不一定刚好对应发送方的一次发送。但最后接收方看到的还会是按顺序排列的字节`helloworld`。
![](/article-assets/2026/javase-socket/images/05.png)这也就是为什么 TCP 通信中可能出现应用层所说的**粘包**、**半包问题**。本质原因就是 TCP 不保留应用程序每次写入时的消息边界。
4. 最后就是全双工通信。通信双方可以在同一时间发送和接收数据。
![](/article-assets/2026/javase-socket/images/06.png)例如在聊天程序中，客户端可以向服务器发送消息，同时服务器也可以向客户端发送消息，不必等待对方发送完毕。

### 2.2 UDP 协议
UDP 同样具有四个特点，无连接、不可靠传输、面向数据报、全双工通信。

1. **无连接**，UDP 在发送数据之前，不需要像 TCP 一样通过三次握手建立连接。发送方只需要知道接收方的 IP 地址和端口号，就可以尝试发送数据报。

```java
DatagramSocket socket = new DatagramSocket();

byte[] data = "Hello".getBytes();

DatagramPacket packet = new DatagramPacket(
        data,
        data.length,
        InetAddress.getByName("127.0.0.1"),
        8080
);

socket.send(packet);
```

这里创建 UDP 套接字后，直接调用 `send()` 发送数据报，无须先建立 TCP 那样的连接。**注意**了，**不需要建立连接，并不意味着接收方一定能收到数据。**



2. 不可靠传输。UDP 不提供 TCP 那样的可靠传输保证。在传输过程中可能会出现丢失、乱序、重复、损坏或被丢弃。UDP 本身不提供确认应答、超时重传、按序交付等机制
![](/article-assets/2026/javase-socket/images/07.png)UDP 并不是一定会丢包，而是协议本身不保证数据一定到达。



3. 面向数据报。UDP 将应用程序每次发送的数据视为一个独立的数据报，保留各个数据报之间的边界。就比如，发送方连续发送：第一个数据报 Hello、第二个数据报 World。接收方不会像 TCP 一样把两个数据报当成一个连续的字节流交付。
![](/article-assets/2026/javase-socket/images/08.png)



至于全双工就可 TCP 一样了。

### 2.3 UDP 数据包套接字编程
#### 2.3.1 API 介绍
我们都知道，计算机中的“文件”通常都会是一个“广义的概念”。文件还能代指一些硬件设备（操作系统管理硬件设备，也是抽象成文件进行统一管理的）

那么网卡 —> socket 文件

在操作网卡的时候，流程就和操作普通文件差不多，也需要打开 -> 读写 -> 关闭

打开的时候也会在文件描述符表中分配一个表项

##### DatagramSocket
首先是 `DatagramSocket`类，它是 UDP Socket，用于发送和接收 UDP 数据报。

其**构造方法**如下：

| 构造方法 | 作用 |
| --- | --- |
| `DatagramSocket()` | 创建 UDP 套接字，由系统分配一个可用的本地端口（一般用于客户端） |
| `DatagramSocket(int port)` | 创建 UDP 套接字，绑定指定的本地端口（一般用于服务端） |


主要注意他的参数。

另外要补充，**客户端通常不用手动指定的原因是**，服务器通常需要一个实现约定的端口，客户端通常使用系统分配的端口。

我这样举个例子更好理解些：

> 假如我在学校一食堂 18 号窗口开了一家餐饮。那么我向同学们发传单告诉了他们我的餐饮地址，于是同学就知道我的餐饮位置在哪就会来到我的餐饮店前。这就像是客户端需要知道服务端的 IP 地址以及端口号一样。
>

> 但是同学来到我窗口点了餐回到座位上时，通常座位会是随机性的，因为你不能保证你去的时候不一定没有人坐吧~所以就像是客户端一样，你也不能保证你指定的端口号是不是被其他的进程给占用了
>

**`DatagramSocket`的常用方法：**

| 方法 | 作用 |
| --- | --- |
| `void send(DatagramPacket p)` | 发送数据报，不会阻塞等待，直接发送 |
| `void receive(DatagramPacket p)` | 接收数据报，默认会阻塞等待 |
| `int getLocalPort()` | 获取这个套接字使用的本地端口 |
| `void close()` | 关闭套接字，释放相关资源 |


此处所说的阻塞等待是，假设服务器执行到了`socket.receive(packet);`但还没有收到数据。于是执行这个方法的线程就会等待，后面的代码暂时就不会执行。

---

##### DatagramPacket
第二个类就是`DatagramPacket`了。`DatagramPacket` 用于封装 UDP 通信中发送或接收的数据报包。

它共有 6 个构造方法，可以分为接收数据和发送数据两类。

**`DatagramPacket`用于接收的构造方法：**

| 构造方法 | 说明 |
| --- | --- |
| `DatagramPacket(byte[] buf, int length)` | 创建接收数据报包，指定缓冲区和最大接收长度 |
| `DatagramPacket(byte[] buf, int offset, int length)` | 创建接收数据报包，指定缓冲区、起始偏移量和最大接收长度 |


使用范例：

```java
byte[] buffer = new byte[4096];

DatagramPacket packet =
        new DatagramPacket(buffer, buffer.length);
```

此处就相当于准备好一个容器，“收到数据后，请把数据放进这个数组，本次最多接收这么多字节”

真正接收要调用：

```java
socket.receive(packet);
```

接收完成后，`packet` 中不仅有数据，还有发送方的 IP 和端口。

`receive` 与之前的 read 方法一样，这也是一个把参数作为“输出结果”的一个输出型参数



**`DatagramPacket`用于发送的构造方法：**

| 构造方法 | 说明 |
| --- | --- |
| `DatagramPacket(byte[] buf, int length, InetAddress address, int port)` | 指定数据、长度、目标 IP 地址和端口 |
| `DatagramPacket(byte[] buf, int offset, int length, InetAddress address, int port)` | 指定数据、起始偏移量、长度、目标 IP 地址和端口 |
| `DatagramPacket(byte[] buf, int length, SocketAddress address)` | 指定数据和长度，使用 `SocketAddress`<br/> 指定目标地址（包含 IP 地址和端口） |
| `DatagramPacket(byte[] buf, int offset, int length, SocketAddress address)` | 指定数据、起始偏移量和长度，使用 `SocketAddress`<br/> 指定目标地址（包含 IP 地址和端口） |




涉及到的一些参数说明：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `buf` | `byte[]` | 存放发送或接收数据的字节数组 |
| `offset` | `int` | 数据在数组中的起始下标 |
| `length` | `int` | 发送数据的长度，或允许接收的最大长度，单位为字节 |
| `address` | `InetAddress` | 目标 IP 地址 |
| `port` | `int` | 目标端口号 |
| `address` | `SocketAddress` | 封装目标 IP 地址和端口号 |


`DatagramPacket`常用方法：

| 方法 | 作用 |
| --- | --- |
| `byte[] getData()` | 获取存放数据的数组 |
| `int getOffset()` | 获取有效数据的起始下标 |
| `int getLength()` | 获取待发送或实际收到的数据长度 |
| `InetAddress getAddress()` | 获取对方的 IP 地址 |
| `int getPort()` | 获取对方的端口号 |
| `SocketAddress getSocketAddress()` | 一次获取对方的地址信息 |


#### 2.3.2 回显服务器示例
##### UDP Echo Server
 将服务器分为两部分，

+ `start()`：负责接收请求、处理请求、返回响应
+ `process()`：负责具体业务

```java
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;

public class UdpEchoServer {
    public DatagramSocket socket = null;

    public UdpEchoServer(int port) throws SocketException {
        socket = new DatagramSocket(port);
    }

    public void start() throws IOException {
        System.out.println("服务器启动...");

        while (true) {
            // 1. 读取请求并解析
            // DatagramPacket 表示一个UDP数据包，此处传入的字节数组，就保存UDP的载荷部分
            DatagramPacket requestPacket = new DatagramPacket(new byte[4096], 4096);
            socket.receive(requestPacket);
            // 把读取到的二进制数据，转成字符串，只是构造有效的部分
            String request = new String(requestPacket.getData(),
                    0,
                    requestPacket.getLength());

            // 2.根据请求，计算响应（服务器中关键的逻辑）
            // 但此处目前只打算写回显服务器，该环节相当于省略
            String response = process(request);

            // 3.把响应返回给客户端
            // 根据response构造DatagramPacket，发送给客户端
            // 注意：此处不能使用response.length()
            DatagramPacket responsePacket = new DatagramPacket(response.getBytes(),
                    response.getBytes().length,
                    requestPacket.getSocketAddress());
            // 此处还不能直接发送，UDP协议滋生没有保存对方的信息（不知道发给谁）
            // 需要指定目的IP 和 目的端口
            socket.send(responsePacket);

            // 4. 打印一个日志
            System.out.printf("[%s:%d] req: %s, resp: %s\n", responsePacket.getAddress().toString(),
                    requestPacket.getPort(), request, response);
        }
    }

    private String process(String request) {
        return request;
    }

    public static void main(String[] args) throws IOException {
        UdpEchoServer server = new UdpEchoServer(9090);
        server.start();
    }
}

```

##### UDP Echo Client
UDP 回显客户端，需要完成的如下：

+ 从键盘读取文字；
+ 把文字发送给服务器；
+ 接收服务器返回的文字；
+ 显示结果；

```java
import java.io.IOException;
import java.net.*;
import java.util.Scanner;

public class UdpEchoClient {
    private DatagramSocket socket = null;
    private String serverIp;
    private int serverPort;

    public UdpEchoClient (String serverIp, int serverPort) throws SocketException {
        this.serverIp = serverIp;
        this.serverPort = serverPort;
        socket = new DatagramSocket();
    }

    public void start () throws IOException {
        Scanner scanner = new Scanner(System.in);
        try {
            while (true) {
                // 1. 从控制台读取用户输入的内容
                System.out.println("请输入要发送的内容：");
                if (!scanner.hasNext()) {
                    break;
                }
                String request = scanner.next();
                // 2. 把请求发送给服务器，需要构造 DatagramPacket 对象
                // 构造过程中，不光要构造载荷，还要设置服务器的IP和端口号
                DatagramPacket requestPacket = new DatagramPacket(request.getBytes(),
                        request.getBytes().length,
                        InetAddress.getByName(serverIp),
                        serverPort);
                // 3. 发送数据报
                socket.send(requestPacket);
                // 4. 接收服务器的响应
                DatagramPacket responsePacket = new DatagramPacket(new byte[4096], 4096);
                socket.receive(responsePacket);
                // 5. 从服务器读取的数据进行解析，并打印
                String response = new String(responsePacket.getData(), 0, responsePacket.getLength());
                System.out.println(response);
            }
        } finally {
            socket.close();
        }
    }

    public static void main(String[] args) throws IOException {
        UdpEchoClient client = new UdpEchoClient("127.0.0.1", 9090);
        client.start();
    }
}
```

就可以得到这样一个运行效果~




![](/article-assets/2026/javase-socket/images/09.png)

当然，如果有云服务器的话，可以自己打一个 jar 包放到云服务器上，并启动该程序：

```bash
java -jar jar包名
```

此时该程序就在服务器上运行起来了，只要能访问该服务器的都可以直接进行回显打印~

### 2.4 TCP 流套接字编程
#### 2.4.1 API 介绍
##### ServerSocket
`ServerSocket`是 TCP **服务端**用的核心类，作用是**在服务器端监听某个端口，并等待客户端建立 TCP 连接。也就是说是专门给服务器用的**

**常用构造方法：**

| 构造方法 | 作用 |
| --- | --- |
| `ServerSocket()` | 创建一个尚未绑定端口的 `ServerSocket` |
| `ServerSocket(int port)` | 创建服务器 Socket，并绑定指定端口 |
| `ServerSocket(int port, int backlog)` | 绑定端口，并指定连接等待队列长度 |
| `ServerSocket(int port, int backlog, InetAddress bindAddr)` | 绑定指定端口、等待队列长度和本机 IP 地址 |


通常都会直接先指定好端口：

```java
ServerSocket serverSocket = new ServerSocket(9090);
```

**常用方法：**

| 方法 | 作用 |
| --- | --- |
| `accept()` | 等待客户端连接，并返回一个 `Socket` |
| `bind(SocketAddress endpoint)` | 绑定 IP 和端口 |
| `close()` | 关闭服务器 Socket |
| `isClosed()` | 判断是否已经关闭 |
| `isBound()` | 判断是否已经绑定地址 |
| `getLocalPort()` | 获取当前监听端口 |
| `getInetAddress()` | 获取绑定的本机 IP |
| `getLocalSocketAddress()` | 获取完整本地 Socket 地址 |
| `setSoTimeout(int timeout)` | 设置 `accept()` 最大阻塞时间 |
| `getSoTimeout()` | 获取当前超时时间 |




其中，注意`accept()`方法是一个阻塞方法，它会开始监听指定端口，有客户端连接后，返回一个服务端 Socket 对象，并基于该 Socket 建立与客户端的连接，否则阻塞等待~

就比如：

```java
System.out.println("等待客户端连接...");
Socket clientSocket = serverSocket.accept();
System.out.println("客户端已连接");
```

当执行到`accept()`的时候，如果暂时没有客户端连接，当前线程就会停在这里~

**注意，TCP 这里就没有 send/receive 这样的操作...**

##### Socket
这个类是客户端和服务端都能用。`Socket`是客户端或服务端中接收到服务端建立连接（accept）的请求后，**返回的服务端 Socket**。不管是客户端还是服务端，都是双方建立连接后，用来保存对端信息以及与对方收发数据的~

**常用构造方法：**

| 方法 | 说明 |
| --- | --- |
| `Socket()` | 创建一个尚未连接服务器的 Socket 对象，之后需要调用`connect()`建立连接 |
| `Socket(String host, int port)` | 根据服务器主机地址和端口号创建 Socket，并立即尝试建立 TCP 连接 |
| `Socket(InetAddress address, int port)` | 根据服务器的 `InetAddress`和端口号创建 Socket，并立即尝试建立 TCP 连接 |
| `Socket(String host, int port, InetAddress localAddr, int localPort)` | 指定服务器地址、服务器端口、本地 IP 和本地端口建立连接 |
| `Socket(InetAddress address, int port, InetAddress localAddr, int localPort)` | 使用 `InetAddress` 指定服务器地址，同时指定本地 IP 和本地端口建立连接 |




**常用方法：**

| 方法 | 作用 |
| --- | --- |
| `getInputStream()` | 获取输入流，**接收数据** |
| `getOutputStream()` | 获取输出流，**发送数据** |
| `getInetAddress()` | 获取对方 IP |
| `getPort()` | 获取对方端口 |
| `getLocalPort()` | 获取本地端口 |
| `isConnected()` | 判断是否成功连接过 |
| `isClosed()` | 判断 Socket 是否关闭 |
| `close()` | 关闭 Socket |




到这里我再讲上面一起解释了：

在 TCP 中，常会这样去接收客户端发来的连接，你可以理解为这样去接电话~

```java
private ServerSocket serverSocket = null;
Socket clientSocket = serverSocket.accept();
```

> 其实就是`ServerSocket`负责等客户端来连接，`Socket`负责连接成功之后真正和某个客户端通信
>

我给个比喻：

`private ServerSocket serverSocket = null`：理解为小哥在马路牙子上揽客 \[ 外场 \]~

`Socket clientSocket = serverSocket.accept()`：理解为小姐姐给客人提供点单服务 \[ 内场 \]~



#### 2.4.2 回显服务器示例
##### TCP Echo Server
```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TcpEchoServer {
    private ServerSocket serverSocket = null;

    // 此处和UDP服务器类似，也是在构造对象的时候，绑定端口号
    public TcpEchoServer (int port) throws IOException {
        serverSocket = new ServerSocket(port);
    }

    public void start () throws IOException {
        System.out.println("服務器启动");
        // 此处为提供多个客户端服务，需要使用多线程来解决
        // 否则只能服务于一个客户端
        // 此处用线程池来解决，通常不会使用fixThreadPool
        ExecutorService executorService = Executors.newCachedThreadPool();
        while (true) {
            // 对TCP来说，需要先处理客户端发来的连接
            // 通过读写clientSocket，和客户端进行通信
            // 若无客户端发起连接，此时accept就会阻塞
            // 此处主线程负责进行accpet，每次accept到一个客户端，就创建一个线程
            Socket clientSocket = serverSocket.accept();

            executorService.submit(() -> {
                processConnection(clientSocket);
            });
        }
    }

    // 该方法处理一个客户端的连接，但被线程池调用
    private void processConnection(Socket clientSocket) {
        System.out.printf("[%s,%d]客户端上线!\n",
                          clientSocket.getInetAddress(),
                          clientSocket.getPort());
        try (InputStream inputStream = clientSocket.getInputStream();
             OutputStream outputStream = clientSocket.getOutputStream()) {
            // 针对 InputStream 套了一层
            Scanner scanner = new Scanner(inputStream);
            // 针对 OutputStream 套了一层
            PrintWriter writer = new PrintWriter(outputStream);
            // 分成三个步骤
            while (true) {
                // 1. 读取请求并解析，可以直接read，也可以借助Scanner来辅助完成
                if (!scanner.hasNext()) {
                    // 连接断开
                    System.out.printf("[%s,%d] 客户端下线!\n",clientSocket.getInetAddress(),
                                      clientSocket.getPort());
                    break;
                }
                String request = scanner.next();
                // 2. 根据请求计算响应
                String response = process(request);
                // 3. 返回响应到客户端
                writer.println(response);
                writer.flush();
                // 打印日志
                System.out.printf("[%s:%d] req: %s, resp: %s\n",
                                clientSocket.getInetAddress(),
                                clientSocket.getPort(),
                                request,
                                response);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                clientSocket.close();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private String process(String request) {
        return request;
    }

    public static void main(String[] args) throws IOException {
        TcpEchoServer server = new TcpEchoServer(1234);
        server.start();
    }
}

```

##### TCP Echo Client 
```java
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Scanner;

public class TcpEchoClient {
    private Socket socket = null;

    public TcpEchoClient(String serverIp, int serverPort) throws IOException {
        // 直接把字符串的IP地址设置进来
        socket = new Socket(serverIp, serverPort);
    }

    public void start() {
        Scanner scanner = new Scanner(System.in);
        try (InputStream inputStream = socket.getInputStream();
             OutputStream outputStream = socket.getOutputStream()) {
            Scanner scannerNet = new Scanner(inputStream);
            PrintWriter writer = new PrintWriter(outputStream);

            // 从控制台读取请求，发送给服务器
            while (true) {
                // 1. 从控制台读取用户输入
                String request = scanner.next();
                // 2. 发送给服务器
                writer.println(request);
                // 加上刷新缓冲区操作，才是真正发送数据
                writer.flush();
                // 3. 读取服务器返回的响应
                String response = scannerNet.next();
                // 4. 打印到控制台
                System.out.println(response);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws IOException {
        TcpEchoClient client = new TcpEchoClient("127.0.0.1", 1234);
        client.start();
    }
}
```

##### 具体解释~
1. **Socket 问题**

两部分代码整体的运行逻辑主要就是：


![](/article-assets/2026/javase-socket/images/10.png)

以上是客户端和服务端接收和发送的核心部分，主要就是需要处理清楚请求包和响应包之间的处理关系即可~


![](/article-assets/2026/javase-socket/images/11.png)

另外，客户端里的 `socket` 和 服务端接收客户端请求的 `socket` 不一样~

这俩 socket 对象不是同一个对象（分别是在不同进程中，甚至在不同主机上）

从更严谨的话来说就是：

> 这两个 `Socket` 是两个不同的 Java 对象，分别位于客户端和服务端程序中，但它们代表同一条 TCP 连接的两个端点。
>


![](/article-assets/2026/javase-socket/images/12.png)

结构就像是上面图中一样~

当然，用电话比喻也是没问题的。就像是 A 和 B 在进行一次通信，但 A 和 B 绝对不是同一个对象！！！



2. **运行问题**

如果是 UDP 和 TCP 一起运行同一个端口，实际上并不会受影响，主要是因为协议不同才不会冲突~

然后，客户端注意，需要进行配置修改才能多客户端运行：


![](/article-assets/2026/javase-socket/images/13.png)


![](/article-assets/2026/javase-socket/images/14.png)

这样就能成功运行多个实例了~



3. **IO 流问题**

```java
try (InputStream inputStream = socket.getInputStream();
    OutputStream outputStream = socket.getOutputStream()) {
        Scanner scannerNet = new Scanner(inputStream);
        PrintWriter writer = new PrintWriter(outputStream);
    ...
}
```

此处不是“又拿了一次 IO 流”，而是在原始字节流外面套了一层更方便使用的高级工具。

首先我们知道，`InputStream`是字节输入流，也就是从网络接收到的数据本质上就是：01001000...类似这种~也就是一个个字节。

如果是直接使用`InputStream`，通常还需要自己写：

```java
byte[] buffer = new byte[1024];
int n = inputStream.read(buffer);
String str = new String(buffer, 0, n);
```

所以才在这里套一层`Scanner`，它会将字节流处理为字符串，因此也就不需要自己处理 `byte[]`。

`OutputStream`也是一样的道理。如果直接用它的话，就还需要：

```java
String request = "hello";
outputStream.write(request.getBytes());
```

但是我们现在发送的是文本，所以套一个`PrintWriter`之后就可以很自然的用 println 写入缓冲区，最后再 `flush` 即可。


![](/article-assets/2026/javase-socket/images/15.png)

总结上面就是，`Socket` 提供底层网络 IO 通道，`InputStream/OutputStream` 负责字节传输，而 `Scanner/PrintWriter` 是为了更方便地以文本形式使用这些字节流。



4. `flush()`必须出现

代码中的部分：

```java
writer.println(request);
writer.flush();
```

需要特别理解一下，`PrintWriter`为了提高 IO 效率，会涉及缓冲。

当执行`writer.println(request)`这部分操作的时候，可以先理解为“把准备发送的数据交给`PrintWriter`”。而`flush`则是表示：“把还没有真正向下输出的数据立即刷到 `OutputStream`”

所以此处的两行代码基本就是属于固定搭配~



5. `println()`和 `hasNext` 的玄机

注意客户端和服务端里的两部分代码：

```java
// 客户端
writer.println(request);
writer.flush();

// 服务端
if (!scanner.hasNext()) {
    ......
}
String request = scanner.next();
```

这之间形成了一套基于空白字符分隔消息的简单应用层协议~

首先要知道**不能直接把 `println(request)` 改成 `print(request)`**。如果只是改成 `print(request)` 再 `flush()`，很可能服务器会一直阻塞在 `hasNext()`，因为它不知道这一条请求到底什么时候结束。

因为当我们使用`println`的时候，`println`会在后面追加换行符，类似相当于追加一个`\n`；更准确地说，`println()` 添加的是当前平台的行结束符。

```bash
Linux:
hello\n

Windows:
hello\r\n
```



而服务端的玄机又在：

服务端的`Scanner`是`Scanner scanner = new Scanner(inputStream)`。而`Scanner`默认采用的分隔符是空白字符（空格、\t、\n、\r 等）


![](/article-assets/2026/javase-socket/images/16.png)

我让 GPT 给出了服务器大概解析的样子~

也就是说 scanner 的 `hasNext` 和 `next` 方法都是以分隔符作为判断隔断标准，以解析一段token/数据项

## 3.IO 多路复用（了解一下~）
如果客户端进一步增加，此时多线程/线程池，就会产生大量的线程~

IO 多路复用，**就是让操作系统统一等待多个连接的 IO 事件，告诉程序哪些连接已经就绪，线程再去处理这些链接。**

在我们前面写的 TCP 回显服务器一开始是没有使用线程池来完成的，于是就导致了第二个第三个线程...一直在等待第一个线程完成直至断开连接，这样也才到第二个线程（当然也还是要竞争~）

于是乎就想出了使用线程池来让多个客户端一同完成服务~但是！这样就变成了每一个连接安排一个线程，各自等待自己的客户端。但如果连接很多，且大部分时间都没有消息，就会有很多线程在等待~

那么 IO 多路复用就是为了**让一个线程照看多个连接，谁有数据，就先处理谁**。

**拿一个餐厅比例：**

原来的方式就像是：

> 每桌安排一个服务员，顾客还没决定吃什么，服务员一直站在这桌等
>

多路复用的方式就像是：

> 多个餐桌共用一个服务员，餐厅的呼叫系统告诉他哪桌需要服务，他再过去处理
>

如果 B 桌和 C 桌都按了铃，这个服务员可以先处理 B，再处理 C。



