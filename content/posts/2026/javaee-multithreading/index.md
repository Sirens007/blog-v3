---
title: Java 多线程基础：Thread、线程安全与同步机制
description: 理解Java线程的创建、生命周期、线程安全、同步机制、锁、线程池以及并发工具的基本使用.
date: 2026-09-10
published: 2026-09-10
updated: 2026-09-10
categories:
  - 开发
  - Java SE
tags:
  - Java
  - Java SE
  - 多线程
image: /article-assets/2026/javaee-multithreading/images/thread.png
---

## 1.初识线程 `Thread`
### 1.1 什么是多线程
上一篇我们已经提到，一个程序运行起来就是一个**进程**。而一个进程里，又存在多个**线程**。

简单来说：

> 进程提供运行环境和资源，而线程是真正在这个环境中执行代码的执行流；
>

我们之前是这么比喻的：

> 进程 = 一套房子
>
> 线程 = 房子里干活的人
>

同一个房子里，可以住好几个人，就比如：

> 张三在厨房做饭  
李四在客厅扫地  
王五在阳台晾衣服
>

他们虽然在干不同的事情，但他们都在共享着一套房子里的资源。当然，在程序里也差不多。

在一个 Java 进程中可以存在多个线程，每个线程都有自己的执行流程，但是同一个进程里的线程又可以共享这个进程里的资源和数据。这就是所说的**多线程**。

### 1.2 为什么需要线程
还是拿上一篇“吃鸡”的例子

现在桌子上有 100 只鸡：

如果只有我一个人吃：

> 我必须得一只、两只、三只......
>

![](/article-assets/2026/javaee-multithreading/images/thread0.png)

但如果我叫来一位老铁：

> 如果条件合适，两个人就可以分别处理一部分工作
>

![](/article-assets/2026/javaee-multithreading/images/thread1.png)

对应到程序里就是一个任务可以被拆成很多个相对独立的任务，交给多个线程执行。

但，千万不要理解成：**线程越多，程序就一定越快**。这个结论当然是不成立的。

依旧是吃鸡这个例子，一张桌子本来坐四个人正好，你非得找 100 个人围着这张桌子：

> “兄弟们！我们今天靠人数优势干爆这 100 只鸡！”
>

最后可能会出现这种情况：

> 鸡没吃几只，100 个人先因为 “你挡我了。”、“筷子给我。”、 “让我过去。”等各种原因先打起来。
>

线程也是一样。线程创建、切换和调度本省都有开销，而且 CPU 核心数量也是有限的。所以合理的多线程可以提高效率，而不是无限增加线程数量。

这里我给出了一段代码，可以尝试运行一下，比较线程串行和并行的时间效率：

```java
/**
 * Created with IntelliJ IDEA.
 * Description:
 * User: Sirens007
 * Date: 2026-09-02
 * Time: 10:27
 */
public class TheadAdvantage {
    private static final long count = 10_0000_0000;

    private static void concurrency() throws InterruptedException {
        long begin = System.nanoTime();

        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                int a = 0;
                for (long i = 0; i < count; i++) {
                    a--;
                }
            }
        });
        // 主线程内计算b的值
        int b = 0;
        for (long j = 0; j < count; j++) {
            b--;
        }
        // 等待thread进程结束
        thread.join();

        long end = System.nanoTime();
        double ms = (end - begin) * 1.0 /1000 /1000;
        System.out.printf("并发：%f 毫秒 %n",ms);
    }

    private static void serial() {
        // 都在主线程计算a , b值
        long begin = System.nanoTime();
        int a = 0;
        for (long i = 0; i < count; i++) {
            a--;
        }
        int b = 0;
        for (long j = 0; j < count; j++) {
            b--;
        }
        long end = System.nanoTime();
        double ms = (end - begin) * 1.0 /1000 /1000;
        System.out.printf("串行：%f 毫秒 %n",ms);
    }

    public static void main(String[] args) {
        try {
            concurrency();
            serial();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

    }
}
```

![](/article-assets/2026/javaee-multithreading/images/thread2.png)

## 2.Java 中创建线程
我了解到的是有三个方法：

### 2.1 继承 `Thread`
首先需要自己写一个类，主要是为了重写 `Thread` 中的 `run()`方法：

```java
class MyThread extends Thread {

    @Override
    public void run() {
        System.out.println("我开始干活了");
    }
}
```

其中的 `run()`方法描述的是这个线程启动后，到底要做什么，然后就会创建线程对象 `thread`。

但是此时还没有真正开始执行，你可以类比这个例子：

> 我把李四叫到了公司
>
> 李四就说：“老板，我来了。”
>
> 我：“嗯”
>

然后谁也不说话，李四当然不会知道自己需要去做什么了。

所以这个时候还需要我们去启动线程：`thread.start();`

这就相当于：我跟李四说：“李四，开始干活！ ”

这个时候就算是真正的启动了一个线程。**注意：**`run()` 和 `start()`千万不要弄混淆；直接写 `thread.run()`的话只是相当于直接调用方法，而启动执行流才是使用：`thread.start()`

### 2.2 实现 `Runnable` 接口
除了直接继承`Thread`，Java 还可以把“线程”和“任务”拆开。

同样我们还是需要重写 run()方法，因为实现 Runnable 接口就得重写它的所有方法：

不过 Runnable 只有一个 run 方法~

![](/article-assets/2026/javaee-multithreading/images/thread3.png)

```java
class MyRunnable implements Runnable {

    @Override
    public void run() {
        System.out.println("开始搬砖");
    }
}
```

然后还要记得启用线程：

```java
MyRunnable task = new MyRunnable();
Thread thread = new Thread(task);
thread.start();
```

不知道会不会有人觉得这样写法比继承 Thread 多绕了一层...

不过我推荐这样理解：

> Thread 是员工，Runnable 是工作任务；
>
> 假如当前有个任务是搬 100 块砖，因此我需要去定义这个任务
>

`MyRunnable task = new MyRunnable()`，然后再把任务交给员工，`Thread thread = new Thread(task)`，最后老板说开始干，也就是`thread.start()`这样就会好理解多了；

### 2.3 其他变形
#### 2.3.1 使用匿名内部类创建 `Thread`
如果你打算这个线程就使用一次的话，单独写 MyThread 就似乎有点麻烦了。

所以我们可以直接使用匿名内部类：

```java
Thread thread = new Thread() {

    @Override
    public void run() {
        System.out.println("我开始干活了");
    }
};

thread.start();
```

本质上还是要重写 run 方法，只是这次这个类我没有单独取名字，直接现场创建。

#### 2.3.2 使用匿名内部类创建 `Runnable`
既然上面 Thread 可以使用匿名内部类，Runnable 当然也是可以啦

```java
Thread thread = new Thread(new Runnable() {

    @Override
    public void run() {
        System.out.println("我开始干活了");
    }
});

thread.start();
```

本质上还是：任务 + 执行任务的线程

#### 2.3.3 使用 `Lambda` 创建线程
首先我们需要知道什么是 Lambda，Lambda 你可以理解为：**对“只有一个抽象方法的接口”的简化写法。**

Lambda 是从 Java8 开始引入的，主要就是为了“把一段代码装起来”，举个例子：

```java
public static void hello() {
    System.out.println("Hello");
}
```

这个方法就描述了一件事情，但我现在想把这段“要执行的代码”交给另外一个东西，让它以后帮我们执行，我们一般就只能通过 **接口 -> 实现类 -> 重写方法 -> 创建对象** 这样的步骤完成；

```java
// 创建接口
interface Task {
    void run();
}

// 创建类实现接口
class MyTask implements Task {

    @Override
    public void run() {
        System.out.println("Hello");
    }
}

// 最后创建对象
Task task = new MyTask();
```

引入 lambda 就是为了让这种代码变的简洁,于是这部分就变成了：

```java
Task task = () -> {
    System.out.println("Hello");
};
```

能够省去了“创建类实现接口”这个部分；

## 3.`Thread` 常用属性和方法
至于线程我们已经知道如何创建出来了，那么我们就还得了解它现在在干嘛、怎么让它停下来、等待它结束，或者通知它停止？

### 3.1 `Thread` 常见属性
在我们创建线程的时候，thread 不只是一个普通的对象，它描述的就是后面那个线程执行流。

先来一段代码：

```java
public class ThreadDemo {

    public static void main(String[] args) {

        Thread thread = new Thread(() -> {
            System.out.println("线程开始工作");
        });

        System.out.println("线程 ID：" + thread.getId());
        System.out.println("线程名称：" + thread.getName());
        System.out.println("线程状态：" + thread.getState());
        System.out.println("线程优先级：" + thread.getPriority());
        System.out.println("是否后台线程：" + thread.isDaemon());
        System.out.println("是否存活：" + thread.isAlive());
        System.out.println("是否被中断：" + thread.isInterrupted());
    }
}
```

这里面用到的方法就是 Thread 提供的线程 ID、名称、状态、优先级、是否存活以及终端标志等信息。

+ getId()：获取线程的编号，就类似员工的工号；
+ getName()：获取线程名字，我们当然可以自定义名字，方法如下；
+ getState()：用于获取线程当前的状态，后面会再介绍进程的四个状态；
+ getPriority()：用于查看线程优先级，但这里的线程优先级高也不代表一定会先执行；
+ isDaemon()：用于查看是不是后台线程，也可以叫守护线程，你可以理解为做后勤的；然后一般前台线程、后台线程都是有多个的；如果有多个**前台线程**，必须得等所有**前台线程**都结束了，**进程**才能结束；
+ isAlive()：用来判断该线程是否还活着；
+ isInterrupted()：给线程发一个中断通知，但不是强制杀死线程；

```java
// 自定义名字
Thread thread = new Thread(() -> {
    System.out.println("开始搬砖");
}, "李四");
```

### 3.2 `Thread` 常见构造方法
| **方法** | **说明** |
| --- | --- |
| `Thread()` | 创建线程对象 |
| `Thread(Runnable target)` | 使用 `Runnable`<br/> 对象创建线程对象 |
| `Thread(String name)` | 创建线程对象，并命名 |
| `Thread(Runnable target, String name)` | 使用 `Runnable`<br/> 对象创建线程对象，并命名 |
| 【了解】`Thread(ThreadGroup group, Runnable target)` | 线程可以被用来分组管理，分好的组即为线程组，这个目前我们了解即可 |


具体的使用例子如下：

```java
Thread t1 = new Thread();
Thread t2 = new Thread(new MyRunnable());
Thread t3 = new Thread("这是我的名字");
Thread t4 = new Thread(new MyRunnable(), "这是我的名字");
```

如果我们想实时了解线程的状态，我们还可以通过 jdk 里的 jconsole 这个可执行文件查看，路径就在 jdk 下面的 bin 目录里，如下：

![](/article-assets/2026/javaee-multithreading/images/thread4.png)

### 3.3 启动一个线程-`start()`
我们之前说过`run()` 描述线程要做的事情，而真正让线程独立运行的是 `start()`；只有调用 `start()`，底层才会真正创建新的线程。

所以我们要了解 start()我们就得了解这个方法：

![](/article-assets/2026/javaee-multithreading/images/thread5.png)

![](/article-assets/2026/javaee-multithreading/images/thread6.png)

会发现真正底层启动线程的工作是由 start0 这个方法完成的。从 native 可以看出这是一个本地方法或者说是Java 标准库/JVM 提供的方法，由 C++ 语言编写的方法。本质上是调用系统的 API，不过这对于我们学习 Java 目前应该不是那么必要。

### 3.4 中断一个线程
假设我们面对一个情境：

前面已经把员工成功招进公司，也知道怎么查看他的名字、状态这些信息了，但现实中老板安排下去的任务也不一定非得执行到底。

比如现在李四正在疯狂转账：

> 李四：老板放心，钱马上就转过去了。
>

结果老板突然接到电话：

> “别转了！对面是骗子！”
>

那现在就有一个问题：

**李四这个线程都已经开始执行了，我该怎么通知他赶紧停下来？**

当然，Java 不是粗暴将它 thread.kill()掉，而是采用通知的方式告诉他你该停了。此时线程就会收到通知，但是否停止、什么时候停止就由线程的代码自己决定。

我学习到的常见就是以下两种方法：

1. 通过共享的标记来进行沟通；
2. 调用 interrupt()方法通知；

**示例一：共享变量作为标志位（标志位要加上 volatile）**

```java
class MyRunnable implements Runnable {

    public volatile boolean isQuit = false;

    @Override
    public void run() {
        while (!isQuit) {
            System.out.println(
                    Thread.currentThread().getName()
                    + "：别管我，我忙着转账呢！"
            );
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println(
                Thread.currentThread().getName()
                + "：啊！险些误了大事"
        );
    }
}
public static void main(String[] args)
        throws InterruptedException {
    MyRunnable target = new MyRunnable();
    Thread thread = new Thread(target, "李四");
    System.out.println("让李四开始转账");

    thread.start();
    Thread.sleep(10 * 1000);
    System.out.println("老板来电话了，对方是骗子！");
    target.isQuit = true;
}
```

此处的 volatile 关键字我们后面再继续专门讲解，这里先不用钻太深~

现在可以先简记为：`volatile isQuit`就是为了让一个线程修改以后，另外一个线程能够及时看到。

上面的代码流程如下：

![](/article-assets/2026/javaee-multithreading/images/thread7.png)



共享变量此处再补充一个点：

如该例子：（我也不知道为什么截 IDEA 里就是这么糊）

![](/article-assets/2026/javaee-multithreading/images/thread8.png)

Java 要求 Lambda 捕获的局部变量必须是：

> final 或者 effectively final（实际没有被修改）
>

这里是触发“变量捕获”这样的语法，Lambda 是回调函数，执行时机是很久之后（操作系统真正创建出线程知乎偶，才会执行的）

所以很有可能，后续线程创建好了，当前 `main` 这里的方法**都执行完了**对应的 isFinished 就销毁了。所以为了解决上述的问题：

> Java 将被捕获的变量给拷贝一份，拷贝给 Lambda 里面。外面的变量是否销毁，就不影响 Lambda 里面的执行了。
>

但是拷贝，就意味着这样的变量不适合进行修改。因为修改一方，另一方不会随之变化的（本质上是两个变量），所以 Java 语言的大佬就不允许在这里进行修改~



上面图片中可以利用**成员变量**（也就是定义在类里面、方法外面的变量，它属于对象或类）

```java
public class Demo5 {
    private static boolean isFinished = false;
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            while (!isFinished) {
                System.out.println("Hello Thread");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    //somefunc...
                }
            }
            System.out.println("t 结束");
        });

        t.start();
        Thread.sleep(3000);
        System.out.println("main 线程尝试终止 t 线程");
        isFinished = true;
    }
}
```

但这里有一个隐患，就是线程之间可能看不到最新值，也就是存在可见性问题，涉及到 `volatile`，我们先保留该问题；但主要还是应为 CPU 缓存机制



**示例二：使用**`interrupt`**通知线程**

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            System.out.println(
                    Thread.currentThread().getName()
                    + "：别管我，我忙着转账呢！"
            );
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                System.out.println(
                        Thread.currentThread().getName()
                        + "：收到老板的中断通知！"
                );

                // sleep 被 interrupt 后，中断标志会被清除
                // 因此这里直接 break 结束循环
                break;
            }
        }
        System.out.println(
                Thread.currentThread().getName()
                + "：啊！险些误了大事"
        );
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        MyRunnable target = new MyRunnable();
        Thread thread = new Thread(target, "李四");
        System.out.println("让李四开始转账");
        thread.start();
        
        // 老板 10 秒后发现被骗
        Thread.sleep(10 * 1000);
        System.out.println("老板来电话了，对方是骗子！");

        // 通知李四线程停止
        thread.interrupt();
    }
}
```

`Interrupt`你可以先理解为老板让你先停一下，而不是让你人间蒸发。当然啦，老板的话听不听也可以取决于你~

`interrupt()` 的核心是通知线程发生了中断，而不是直接强制终止线程。

既然说到了 `interrupt()`那其实就还有一种方法，**就是**`Thread.interrupted()`**也能判断**

```java
while (!Thread.interrupted()) {

}
```

它也可以用来检查**当前线程**的中断状态。注意是当前线程，因为`Thread.interrupted()`是静态方法。不过我们还要了解一个方法，就是 `thread.isInterrupted()`，它们存在一定区别。

| 方法 | 是否静态 | 检查谁 | 会不会清除中断标志 |
| --- | --- | --- | --- |
| `Thread.interrupted()` | 是 | 当前线程 | **会清除** |
| `thread.isInterrupted()` | 否 | 指定的 `thread`<br/> 对象 | **不会清除** |


 如果在线程自己的代码中判断中断状态，经常会写成 `Thread.currentThread().isInterrupted()`。其中 `Thread.currentThread()` 获取的是当前正在执行这段代码的线程，然后再通过 `isInterrupted()` 查看它的中断状态。它们有个区别需要记一下：

`thread.isInterrupted()`读取中断标志后不会清除这个标志；

`Thread.interrupted()`读取中断标志后会清除这个标志；

就拿下面代码举个例子：

```java
public class Demo4 {
    public static void main(String[] args) {
        Thread.currentThread().interrupt();
        System.out.println(Thread.currentThread().getName() + "+" + Thread.interrupted());
        System.out.println(Thread.currentThread().getName() + "+" + Thread.interrupted());
    }
}
// 得到结果
// main+true
// main+false
```

![](/article-assets/2026/javaee-multithreading/images/thread9.png)

`Thread.interrupted()` 在获取当前线程中断状态的同时，还会将中断状态清除。因此第一次调用得到 `true` 后，如果中途没有再次调用 `interrupt()`，第二次调用就会得到 `false`。

```java
public class Demo4 {
    public static void main(String[] args) {
        Thread.currentThread().interrupt();
        System.out.println(Thread.currentThread().getName() + "+" + Thread.currentThread().isInterrupted());
        System.out.println(Thread.currentThread().getName() + "+" + Thread.currentThread().isInterrupted());
    }
}
// 得到结果
// main+true
// main+true
```

![](/article-assets/2026/javaee-multithreading/images/thread10.png)

而这里的 `interrupted` 是读取线程的状态而不是去修改（刚好也出现了后面要说的 `volatile`）

**如果线程正好在** `sleep()`：

| 方法 | 说明 |
| --- | --- |
| `public void interrupt()` | `thread.interrupt()`：向指定线程发出中断请求 |
| `public static boolean interrupted()` | `Thread.interrupted()`：检查**当前线程**的中断状态，并**清除**中断状态 |
| `public boolean isInterrupted()` | `thread.isInterrupted()`：检查**指定线程对象**的中断状态，**不会清除** |


到这的话就有点意思了，假设李四正在干活：

```java
while (!Thread.currentThread().isInterrupted()) {
    System.out.println("工作");
    Thread.sleep(1000);
}
```

此时老板打来个电话，`thread.interrupt()`

刚好李四又在睡觉`sleep()`，`Thread.sleep()` 本身声明了可能抛出 `InterruptedException`。如果线程正在 `sleep()` 的过程中，其他线程对它调用了 `interrupt()`,李四这线程就会被唤醒并抛出`InterruptedException`；此时被 catch 到了，那么接下来需要干什么就取决于 catch 里的内容了，可以跳出也可以继续执行；

```java
public class Demo2 {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(()->{
            while(!Thread.currentThread().isInterrupted()) {
                System.out.println("Hello Thread");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    /*throw new RuntimeException(e);*/
                    /*Thread.currentThread().interrupt();*/
                }
            }
            System.out.println("t 结束");
        });
        t.start();

        Thread.sleep(3000);
        System.out.println("main 线程尝试终止 t 线程");
        t.interrupt();
    }
}
```

因为**收到 **`InterruptedException`** 并不代表 Java 自动决定这个线程必须结束。**

对于这部分解释，正常来说，调用 `Interrupt` 方法就会修改 `isInterrupted` 方法内部的标志位（设置为 `true`），由于上述代码中，是把 `sleep` 给唤醒了，这种提前唤醒的情况下，`sleep` 就会在唤醒之后，把 `isInterrupted` 标志位给设置回 `false`。

所以在这样的情况下，如果继续执行到循环的条件判定，就会发在能够继续执行~

### 3.5 等待一个线程 - `join()`
我们前面知道了如何让线程暂停，但现实中还有另一种情况：

> 就是我的工作必须等你的工作做完以后才能继续
>

假设李四负责：

> 整理今天公司的转账记录；
>

而我负责：

> 根据李四整理出来的数据统计今天到底赚了多少钱；
>

那我肯定不能李四刚开始整理，我这边就直接开始统计。为了解决这种情况，Java 中就引入了`join()`，来看个例子：

```java
public class Demo {
    public static void main(String[] args)
            throws InterruptedException {
        Thread t1 = new Thread(() -> {
            System.out.println("李四开始整理数据");
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("李四整理完成");
        }, "李四");

        t1.start();
        t1.join();
        System.out.println("main：开始统计数据");
    }
}
```

注意哈这地方容易弄反，在主线程中调用 `join` 得用到 `t1` 对象；也就是说调用`join()`的那个线程才是真正等待的。

> main 等待 t 线程  <----->  t.join()
>

说实话，这里主要是按正常语言逻辑不太符合主谓宾习惯，但我们可以反过来理解

> t 线程合并入 main（合并前提，必然是 main 存在）
>

两个执行流合并为一个，一个执行流结束，另一个继续执行；

| **方法** | **说明** |
| --- | --- |
| `public void join()` | 等待线程结束 |
| `public void join(long millis)` | 等待线程结束，最多等 `millis` 毫秒 |
| `public void join(long millis, int nanos)` | 同理，但可以更高精度 |


join 提供了带参数的版本，就是指定“超时时间”即等待的最大时间~

就像是你约了女神上午 8 点出来，最后女神 12 点才到；你继续在这里傻等就是“感动自己”~

### 3.6 获取、休眠当前线程
| **方法** | **说明** |
| --- | --- |
| `public static Thread currentThread();` | 返回当前线程对象的引用 |


很明显这是个静态方法，也就是说哪个线程调用这个方法，返回哪个线程的引用，类似 `this`；



| **方法** | **说明** |
| --- | --- |
| `public static void sleep(long millis) throws InterruptedException` | 休眠当前线程 millis 毫秒 |
| `public static void sleep(long millis, int nanos) throws InterruptedException` | 可以更高精度的休眠 |


Thread.sleep()是让调用它的当前线程休眠；

从上面多个例子你会发现，实例中往往都有

```java
throws InterruptedException

// 或者以下

try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
}
```

原因还是之前说的，线程睡眠期间，可能被其他线程通过 `interrupt` 方法打断提前醒来，它和 sleep、join、wait 这三个方法也一样密切；

注意:

sleep(0)不是不休眠，而是意味着让当前的线程立即放弃 CPU 资源，等待操作系统重新调度~

## 4.线程状态
Java 中一共有 6 种状态：

| **状态** | **含义** | **比喻** |
| --- | --- | --- |
| **NEW** | 新建状态 | 安排了工作，还未开始 |
| **RUNNABLE** | 可运行状态 | 可工作的，又可以分成正在工作中和即将开始工作 |
| **BLOCKED** | 阻塞状态 |  会议室有人使用，只能排队等   |
| **WAITING** | 无限等待状态 |  等待老板通知，没有时间限制   |
| **TIMED_WAITING** | 有时间限制的等待状态 |  午休30分钟，到时间自动回来   |
| **TERMINATED** | 终止状态 | 工作完成了 |


不过要注意：RUNNABLE **不完全说是线程一定正在运行**；Java 中把正在运行和等待 CPU 调度都归到 RUNNABLE 状态；提到这我们可以联系到之前关于操作系统的**进程**的两个状态：**就绪状态**和**阻塞状态**；

### 4.1 线程状态的转换
`NEW` 状态其实就是 new 了 Thread 对象，还没有 start()

`TERMINATED` 状态是线程已经做完了他该做的了，内核中的线程已经结束，但 Thread 对象还在；

`RUNNABLE` 状态就是刚刚提到的，可工作，有可分成正在工作中和即将开始工作；

`TIMED_WAITTING` 状态描述的是指定时间的阻塞，当等待时间结束后，线程会自动恢复到可运行状态，重新参与 CPU 调度；也就是：

+ 有明确的等待时间
+ 等待时间到了以后，线程不会一直停留
+ 线程是否立即执行取决于 CPU 调度

`WAITING` 状态表示无限等待状态，例子有`thread.join()`，会一直等待，等到天荒地老；

`BLOCKED` 状态表示阻塞状态，在我们后面继续了解锁的时候会重点遇到；



![](/article-assets/2026/javaee-multithreading/images/thread11.png)

NEW --> RUNNABLE --> TIMED_WAITING --> TERMINATED 转换如下：

```java
public class Demo6 {

    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        System.out.println(thread.getState());
        thread.start();
        System.out.println(thread.getState());
        Thread.sleep(1000);
        System.out.println(thread.getState());
        thread.join();
        System.out.println(thread.getState());
    }
}

// 输出结构：
// NEW
// RUNNABLE
// TIMED_WAITING
// TERMINATED
```

对于上面的结果，解释 `RUNNABLE`、`TIMED_WAITING`：

在第二个输出状态时，主线程由于本身就在运行，在创建新的线程时会需要进过调度，所以通常运行上述代码都是 `main` 先跑到第二个状态打印，虽然此时 `thread` 线程已经启动，但还没进入 `sleep`(3000)，这也是为什么后面还需要 `main` 线程先 `sleep`(1000)的原因；

而 WAITING 状态就如下演示：

```java
public class Demo6 {

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            try {
                Thread.sleep(100000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        },"t1");
        Thread t2 = new Thread(() -> {
            try {
                Thread.sleep(1000);
                t1.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        },"t2");

        t2.start();
        t1.start();
    }
}
```

 如果让 t2 自己打印自己的状态，就会受到执行时机影响，所以通常用外部工具观察线程状态，如下：

![](/article-assets/2026/javaee-multithreading/images/thread12.png)

### 4.2 多线程带来的问题
直接先抛出一例子：

```java
public class Demo7 {
    public static int count;
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 50000; i++) {
                count++;
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 50000; i++) {
                count++;
            }
        });


            t1.start();
            t2.start();
            t1.join();
            t2.join();
        System.out.println(count);
    }
}
```

> 写 join 的原因是避免 main 线程先执行完，所以应该先等到两个线程并入 main 线程后再执行打印
>

执行后会发现，count 结果是一个随机数，而且还是随机小于 100000 的数字；像这样导致结果和预期不符合的就属于 BUG，需要修复，这也是多线程并发执行容易引起的安全问题；

深入一下底层会发现：`count++`看似是一行代码，实际上对应到的是 3 个 CPU 指令

1. load：将内存中 count 的值加载到 CPU 寄存器
2. add：把寄存器中的内容 +1
3. save：把寄存器中的内容保存回内存上

并且现代计算机操作系统都是**抢占式调度**，意思就是：

>  即使一个进程（或线程）还没有执行完，操作系统也可以强制暂停它，把 CPU 分配给其他进程。  
>

也就说明，上面的代码中执行这三个步骤会是随机的、不可预期的

![](/article-assets/2026/javaee-multithreading/images/thread13.png)

左侧是我们所预期的，但实际会是右边这种，当然这样的情况有很多种；

右侧的操作过程描述：

> 假设当前内存上的值为 0；
>
> t1 线程会先去读取内存的 0 并加载到当前寄存器上，也就是拷贝一份
>
> 随后 t2 也进行了同样的操作，但它先完成了 add 并最终存入内存中，此时内存的值为 1
>
> 但此时 t1 线程还是在之前加载的 0 上面进行操作运算，最后得到值为 1 并覆盖掉 t2 线程得到的 1 放在内存上
>

所以在上面的代码 5w 次循环过程中，中间会发生很多类似的操作，最终的值一定是 <=10w；

对于发生线程安全问题通常有以下：

1. **操作系统对于线程的调度是随机的，也就是操作系统抢占式【根本原因】；**
2. **多个线程同时修改同一个变量；**
3. **修改操作，不是原子；**
4. **内存可见性问题；**
5. **指令重排序；**

前两个问题我们已经讨论出，我们具体讨论 2 和 3 ，4 和 5 留到后面

**问题 2：**

对于多个线程修改同一变量，我们只能通过调整代码结构去规避一些线程不安全的代码，但这方案不够通用；Java 中有个东西，String 就是采取了“不可变”特性，确保线程安全；

> String 实现“不可变”的效果是将内部的 char 数组设为 private（与 final 无关），导致无法访问，因此无法修改；
>

**问题 3：**

> 此处所说的原子性，就是指是数据库里事务提到的 ACID 中的原子性；
>
> 如果修改操作只是对应到一个 CPU 指令就可以认为是原子的，CPU 不会出现“一条指令执行一半”，但是如果对应到多个 CPU 指令就不是原子的，比如：++、--、+=、-=......；
>

原子性：

![](/article-assets/2026/javaee-multithreading/images/thread14.png)

上面图片中被两个客户端并发拆开了，但【检查+扣减】应该作为一个整体，不可拆开；

所以在 Java 中解决线程安全问题最主要的方案就是**加锁**。

通过加锁操作，让不是原子的操作，打包成一个原子的操作；

> 计算机中的锁与生活中的锁，是同样的概念。互斥/拍他
>

这也就是下一节我们要讲的~

对了，对于上面的线程安全问题，我们这样解决：

```java
public class Demo7 {
    public static int count;
    public static void main(String[] args) throws InterruptedException {
        Object locker = new Object();
        Thread t1 = new Thread(() -> {
            synchronized (locker) {
                for (int i = 0; i < 50000; i++) {
                    count++;
                }
            }
        });
        Thread t2 = new Thread(() -> {
            synchronized (locker) {
                for (int i = 0; i < 50000; i++) {
                    count++;
                }
            }
        });

            t1.start();
            t2.start();
            t1.join();
            t2.join();
        System.out.println(count);
    }
}
```

## 5.`synchronized` 关键字
Java 中的 `synchronized`本质就是加锁；但要注意，有时候也不是写了 `synchronized` 就 100%线程安全，这个需要具体代码具体分析~

拿一段代码举个例子：

```java
public class Demo6 {
	public static void main(String[] args) {
		Object o1 = new Object();
		Object o2 = new Object();
		Thread t1 = new Thread(() -> {
			synchronized(o1) {
				try {
					Thread.sleep(100000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			synchronized(o2) {
				System.out.println("t1线程两个锁都获取到");
			}
		});
		Thread t2 = new Thread(() -> {
			synchronized(o1) {
				try {
					Thread.sleep(100000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			synchronized(o2) {
				System.out.println("t2线程两个锁都获取到");
			}
		});

		t1.start();
		t2.start();
	}
}
```

当这段代码开始运行后，可以调用 `jconsole` 去查看一下线程状态；

![](/article-assets/2026/javaee-multithreading/images/thread15.png)

此时可以看到 t2 线程处于 `BLOCKED` 状态，也就是我们之前所说的阻塞状态；这里阻塞的原因就是 t1 线程上锁 o1 之后一直 `sleep`。此时线程 t2 想同步运行，但是锁在 t1 手上，所以 t2 第一段代码就执行不了，必须等到 t1 线程释放锁之后 t2 才能继续运行。这就是前面提到的 `BLOCKED` 阻塞状态；

### 5.1 `synchronized` 的特性
#### 5.1.1 互斥性
我们首先需要知道锁是什么，在生活中好很理解：

![](/article-assets/2026/javaee-multithreading/images/thread16.png)

对，这就是锁，因为厕所只能容纳一人，当他进去时就得上锁，出来时就得解锁；在代码中就这样理解，一个线程先上了锁，其他线程只能等待这个线程释放，这也就是**互斥**的含义；

`synchronized`中文名叫：同步锁；在 JVM 层面对应的是：`Monitor Lock` 监视器锁

也就是说每一个 Java 对象都可以关联一个监视器；

它在代码中的流程：

```java
Thread t1 = new Thread(() -> {
    synchronized (locker) {
        for (int i = 0; i < 50000; i++) {
            count++;
        }
    }
});
```

尝试获取对象对应的锁 -> 获取成功 -> 执行代码 -> 释放锁

如果锁已经被其他线程占用，那么线程就会等待，直到其他线程释放锁，这中间还会存在锁竞争；

至于为什么需要互斥，就拿之前的火车票问题来说，只剩一张票了，两个客户端申请访问时必须只能一个一个访问，而不能并发访问；

以上就是互斥的必要性；

#### 5.1.2 可重入性
`synchronized` 第二个特点就是：可重入性

**引入可重入的概念目的其实就是为了解决死锁问题，那么什么是死锁问题？**

> 假如下方的代码是不可重入的，那么当已经进入锁住状态的方法一调用方法二时，由于锁已被用且还未释放，因此方法二无法加锁且无法进入。最后就导致阻塞等待，两个方法都无法继续往下执行；
>

可重入性概念刚理解可能不太好明白，意思是：

> 一个线程已经拥有某把锁之后，可以再次进入有同一把锁保护的代码；
>

比如：

```java
public class Demo {
    synchronized public void method1(){
        method2();
    }

    synchronized public void method2(){
        System.out.println("执行method2");
    }
}
```

当前线程调用`method1()`方法，线程 A 进入`method1()` -> 获得对象锁 -> 调用`method2()` -> `method2()`也是 `synchronized`；

又或者像是这样：

```java
synchronized (counter) {		// 1.此处开始锁住
    synchronized (counter) {		// 2.直接放行
        synchronized (counter) {		// 3.直接放行
            counter.add();
        }	// 3->2 退出第三层
    }	// 2->1 退出第二层
}	// 1->0 退出第一层
```

至于 JVM 如何知道哪个“}”是真正要解锁的那个呢？

>  JVM 执行的是 `.class` 字节码，不是 Java 源代码里的 `{}`。  
`synchronized` 代码块之所以能正确加锁、解锁，是因为编译器会把它编译成专门的字节码指令，而不是 JVM 运行时去判断“这个 `}` 属于谁”。  
>

如果`synchronized`不可重入，这里就会发生线程 A 访问`method2()`时一直等待释放锁，因此会永远等待，也就是发生**死锁**；但由于可重入性的原因，因此此处不会发生阻塞；

#### 5.1.3 死锁问题（重）
关于死锁问题，已经在上面初步解释过了，就再具体说一遍：

死锁就是

> 家钥匙锁车里了，车钥匙锁家里了
>

很好理解吧~



**构成死锁主要有这四个必要条件（重点）**

> 1.锁是互斥的。一个线程拿到锁之后，另一个线程再尝试获取锁，必须要阻塞等待；（锁的基本性质）
>
> 2.锁是不可抢占的。线程 1 拿到锁，线程 2 也尝试获取这个锁，线程 2 必须阻塞等待，而不是线程 2 直接把锁抢过来；（锁的基本特性）
>
> 3.请求和保持。一个线程拿到锁 1 之后，不释放锁 1 的前提下，获取锁 2
>
> 4.循环等待。多个线程、多把锁之间的等待过程构成“循环”
>

以上 1、2 点至少 Java 的 synchronized 是遵守这两点，

破坏掉上述的 3 或 4 任何一个条件都能够打破死锁；

（打破 3：把嵌套的锁改为并列的锁）

（打破 4：加锁的顺序做出约定）



在代码中构成死锁问题通常有下面三种情况：

**情况一：两个线程、两把锁交叉等待**

```java
Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        synchronized (lockB) {
        }
    }
});

Thread t2 = new Thread(() -> {
    synchronized (lockB) {
        synchronized (lockA) {
        }
    }
});
```

这是 Java 中典型的死锁，**如果**执行成这样

> t1：拿到 A
>
> t2：拿到 B
>
> 
>
> t1：等待 B
>
> t2：等待 A
>

这就死锁了，这也可以叫所顺序不一致导致的死锁；**注意我说的是如果**，因为线程 t1 与 t2 是并发的，有可能 t1 和 t2 一样快，有可能 t1 比 t2 快...这样的结果是不确定的。

> 针对情况一就是同一加锁顺序，也就是说如果：必须同时获取多把锁，所有代码必须按照固定顺序获取。
>

**情况二：哲学家就餐问题（多线程、多资源形成环形等待）**

假设有 5 个哲学家，每个人面前都有一根筷子，总共 5 根，每个哲学家必须`左筷子`+`右筷子`才能吃饭。
![](/article-assets/2026/javaee-multithreading/images/thread17.png)

换成代码就是这样理解：5 个人就相当于 5 个线程、5 根筷子就相当于 5 把锁，每个线程只需要拿到其中两根筷子即可~

> 大部分情况下上述模型可以很好的运转，只是在一些极端情况下会造成死锁，譬如：
>
> 同一时刻，大家都想吃面条，同时拿起左手的筷子
>

虽然上述情况的概率很小，但是只要基数足够大，任何小概率事件都是大事件；

> 针对情况二给出两种解决方法：
>
> 方法一：规定筷子获取顺序，让所有哲学家统一遵守“先拿编号小的，再拿编号大的”。
>
> 方法二：最多允许 4 个哲学家同时拿筷子，此时至少有一个哲学家有机会凑齐两根筷子，也就是限制同时参与资源竞争的线程数量。
>



### 5.2 `synchronized`使用示例
`synchronized` 本质上要修改指定对象的“对象头”。从使用角度看，`synchronized` 也是必要搭配一个具体的对象来使用；

#### 5.2.1 `synchronized` 修饰代码块
这里要明确指定锁哪个对象。

格式：

```java
synchronized(锁对象){
    // 需要保证线程安全的代码
}
```

```java
synchronized(lock){
    count++;
}
```

前面已经解释过，线程进入代码块 -> 尝试获取 lock 对象的锁 -> 获取成功 -> 执行 count++ -> 释放 lock 锁

如果此时另外一个线程也执行`synchronized(lock)`，那么因为他们使用的是同一个 lock 所以只能排队。

至于为什么一定要是同一个对象，是因为两个线程，针对同一个对象加锁，才会产生互斥效果；如果是不同的锁对象，此时不会有互斥效果，线程安全问题就没有得到改变...

这里提到的锁对象，关于这个对象的类型是什么并不重要（在 Java 中任何一个对象都可以用作'锁'），重要的是是否有多个线程尝试针对这同一个对象加锁（是否在竞争同一个锁）

再拿前面的多线程 50000 次循环并发举例：

```java
Thread t1 = new Thread(() -> {
    for (int i = 0; i < 50000; i++) {
        synchronized (locker) {    
            count++;
        }
    }
});
```

```java
Thread t1 = new Thread(() -> {
    synchronized (locker) {
        for (int i = 0; i < 50000; i++) {
            count++;
        }
    }
});
```

以上两段代码看似运行结果相同，但实际运行过程差别很大，特别是在效率上；

这是代码一的运行过程：

![](/article-assets/2026/javaee-multithreading/images/thread18.png)

这是代码二的运行过程：

![](/article-assets/2026/javaee-multithreading/images/thread19.png)

至于为什么 Java 中不使用 `lock` + `unlock` 函数的方式的话，这个就有点意思了：

当然其实 Java 中也是有 `lock/unlock` 风格的锁，但一般很少用，因为...

```java
Lock locker  = new Locker();
public void func() {
locker.lock();
// something code
locker.unlock();
```

这样的写法其实会容易忘记把 unlock 补上，就会导致其他线程死锁；

> 你要是说“只要我写了 lock，就会立即加上 unlock~”，那你纯纯就是大猪蹄子行为；
>
> 就像是你给女朋友保证，这辈子我只爱你一个，永远不会变心~
>

再来个例子：

```java
void func() {
    lock();

    if (cond) {
        unlock();
        return;
    }

    if (cond2) {
        unlock();
        return;
    }
    func2();
    
    unlock();
}
```

其中 func2()又是调用：

```java
void func2() {
    func3();
}

void func3() {
    func4();
}

void func4() {
    throw new Exception();
}
```

此时，代码中抛出异常，那么也有可能使 unlock 执行不到~

所以 Java 中采取 synchronized 就能保证，只要出了“}”一定能释放锁，无论因为 return 还是因为异常里，也无论里面调用了哪些代码，都是可以确保 unlock 操作执行到的；

#### 5.2.2 `synchronized` 修饰普通方法
synchronized 还可以直接修饰方法：

```java
public class Counter {
    private int count;
    public synchronized void increment(){
        count++;
    }
}
```

其实像是 StringBuffer、Vector 这些对象，方法上就是带有 synchronized：

![](/article-assets/2026/javaee-multithreading/images/thread20.png)

所以会说这些对象会线程安全；

不过如果 synchronized 修饰的是静态方法的话，就**相当于针对类对象加锁**（从反射可以了解）；

+ `synchronized` 修饰**普通实例方法**：锁的是 `this`
+ `synchronized` 修饰**静态方法**：锁的是当前类对应的 `Class` 对象，也就是 `类名.class`

例如：

```java
public class Counter {
    private int count;
    public synchronized void increment(){
        count++;
    }
}
```

此处：

```java
public synchronized void increment()
```

等价于：

```java
public void increment(){
    synchronized(this){
        count++;
    }
}
```

也就是说：

> 普通 `synchronized` 方法锁住的是当前对象。
>

在实际中通常会是这样：

```java
Counter counter = new Counter();
```

然后会这样去调用`counter.increment()`，实际上锁的是 counter 对象，也就是 this==counter

然后多个线程：

```java
Thread t1 = new Thread(() -> {
    counter.increment();
});

Thread t2 = new Thread(() -> {
    counter.increment();
});
```

此时线程 A：

> 获取 counter 对象锁
>
> 执行 increment
>

线程 B：

> 等待 counter 对象锁
>



而如果是：

```java
Counter counter1 = new Counter();
Counter counter2 = new Counter();
```

这样的话两个线程分别尝试获取两把不同的锁，就不会产生竞争；

| **写法** | **锁对象** |
| --- | --- |
| `synchronized(lock){}` | lock对象 |
| `public synchronized void method(){}` | 当前对象 this |
| `public synchronized static void method(){}` | 当前类 Class 对象 |


当然啦你也可以这样去理解：

代码块：

`synchronized(lock)`就像指定某个房间上锁；锁是指 `lock` 房间

普通方法：

`synchronized method`就像是给当前员工办公室上锁；锁是指当前员工对象

静态方法：

`static synchronized method`就是给整个公司总部上锁；这里的锁就是指整个 Class



锁虽好，但不可贪~

```java
synchronized(lock){
    // 很多代码
}
```

可能会多人会犯这样一个错误，虽然线程安全，但是效率可能就不太好。因为真正需要保护的可能就只有`count++`，就像我前面举过的例子：`synchronized (locker)`放在 for 循环内与 for 循环外的对比。当你锁住的代码越多，线程等待的时间就越长，并发能力就越低。所以在实际开发中：

>  `synchronized` 的范围应该尽量控制，只保护真正需要同步的数据~
>

## 6.`volatile` 关键字
在前面讲线程安全问题的时候，提到过几个容易引发问题的原因：

原子性、内存可见性以及指令重排序

其中原子性的问题就在上面的`synchronized`已经大概了解如何处理了，但还有一个一直被搁置的问题：

> 一个线程修改了变量之后，为什么另一个线程有时候看不到？
>

当然前面其实遇到过一次，在中断线程的时候写过：`public volatile boolean isQuit = false;`

当时只是说“加上 `volatile` 后，一个线程修改 `isQuit`，另外一个线程能够及时看到。”

那现在就来正式解释一下~

### 6.1 内存可见性
先来举个例子：

> 假设老师布置作业后，让课代表把作业内容卸载教室后面的黑板上：“今日作业：完成练习册第 10 页”
>
> 这个黑板相当于全班同学都能看到的公共信息区域。
>
> 但是张三觉得每次回头看黑板太麻烦，于是第一次看到作业后，就把内容记在自己的草稿纸上：“今日作业：完成练习册第 10 页”
>
> 李四也记了一份自己的。后来老师临时修改了作业，于是让课代表把后黑板改成：“今日作业：完成练习册第 10～12 页”
>
> 此时，黑板上的内容已经更新了。
>

但问题来了：

> 如果张三之后一直只看自己之前记下来的草稿纸，而没有重新去看后黑板，他看到的仍然只会是“今日作业：完成练习册第 10 页”
>

张三并不知道公共信息已经发生了变化。这就很像多线程中的内存可见性问题：

**一个线程已经修改了共享变量，但是另一个线程没有及时看到这个变量的最新值。**

对于上述这样的情况，你可以抽象理解为“主内存”和“线程工作内存”模型

代码示例：

```java
public static int flag = 0;
public static void main(String[] args) {

    Thread t1 = new Thread(() -> {
        while (flag == 0) {
            
        }
        System.out.println("t1 线程结束");
    });

    Thread t2 = new Thread(() -> {
        // 针对 flag 进行修改
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入 flag 的值：");
        flag = scanner.nextInt();
    });
    t1.start();
    t2.start();
}
```

这段代码当运行起来后，输入任何数字后**按单线程的思想**应该不进入循环而停下来，但事实并非

![](/article-assets/2026/javaee-multithreading/images/thread21.png)

![](/article-assets/2026/javaee-multithreading/images/thread22.png)

显然这是一个 BUG（线程安全问题）

一个进程读取，一个进程修改，修改线程的值，并没有被读线程读到。这也就是要说的“内存可见性问题”

其实上面的问题是，每个线程在读取主内存的时候都会先拷贝一份放到自己的工作内存中，如果要修改就会先在自己的工作内存中完成修改，随后就将修改好的值放入主内存中。但是由于 t1 只是进行读操作，它只会去读相对较近的内存（也就是 t1 的工作内存）

![](/article-assets/2026/javaee-multithreading/images/thread23.png)

线程在运行过程中，并不一定每一次使用变量都重新读取共享区域中的最新结果，而可能使用自己工作内存中的值。我所说的“工作内存”可以先抽象理解为 CPU 寄存器、缓存有关的区域，因为访问这些位置速度更快，但也可能产生数据不一致。

产生这样的原因：

> 研究 JDK 的大佬们就希望通过让编译器 & JVM 对程序员写的代码，自动的进行优化
>
> 本来写的代码是进行 xxxxx，编译器 / JVM 会在你原有逻辑不变的前提下，对你的代码进行调整，是程序效率更高
>

 JVM 和 CPU 为了提高执行效率，可能会对变量读取、缓存以及指令执行进行优化。在单线程环境中，这些优化不能改变程序原有语义；但在多线程环境下，如果程序没有通过 `volatile`、`synchronized` 等机制建立正确的线程间同步关系，就可能出现一个线程无法及时观察到另一个线程修改结果的情况~

上面的过程细化理解就是：

```java
while (flag == 0) {

}
```

> load 为读内存操作，cmp 是 CPU 寄存器操作；load 的时间开销可能是 cmp 的几千倍
>

其中的`flag == 0`为 cmp 运算操作，而比较操作又细化为 `load`、`cmp`（加载、运算）短时间内这个循环会进行很多次，执行过程中 JVM 感知到 `load` 反复执行的结果好像都是一样的。JVM 就会想：执行这么多次读 flag 操作发现值都为 0，既然结果一样，为什么还要反复执行这么多次呢~

于是就把读内存的操作优化成读寄存器（把内存的值读到寄存器了，后续再 load 就不再重新读内存）

此后，等到用户开始输入新的值真正修改 `flag` 时，t1 线程就感知不到了；当然如果引入 `sleep` 去等用户输入的话，那样效率又太低了；



于是就引入了 `volatile` 关键字，通过这个关键字来修饰某个变量，此时编译器这对这个变量的读取操作就不会被优化成寄存器了

```java
public volatile static int flag = 0;
```

![](/article-assets/2026/javaee-multithreading/images/thread24.png)

`volatile`解决了内存可见性问题·，但不是解决原子性问题；

### 6.2 JMM Java 内存模型
前面我们提到的“主内存”和“线程工作内存”模型其实就是 JMM，其含义你可以理解为：

> Java 用来规定“多个线程之间如和读写共享变量，以及这些读写什么时候对线程可见”的一套规则。
>

在 Java 官方文档的描述中：

> 每个线程，有一个自己的“工作内存”，同时这些线程共享同一个“主内存”，当一个线程循环进行上述读取变量操作的时候，就会把主内存中的数据拷贝到该线程的工作内存中。后续另一个线程修改，也是先修改自己的工作内存，拷贝到主内存里。由于第一个线程仍然在读自己的工作内存，因此刚知不道主内存的变化。
>

这与我们前面讲到的把读内存的操作，优化成读寄存器操作是一样的意思。

以及上面所说的“工作内存”（work memory）就是指与 CPU 寄存器、缓存等相关的区域；

然后明确`synchronized` 能够保证原子性，而 `volatile` 保证的是内存可见性。

好了，以上就是关于 `volatile` 的内容...

## 7.`wait` 和 `notify`
前面学习多线程的时候，一直在强调一件事：

> 多个线程之间的执行顺序通常是不好控制的
>

谁先拿到 CPU、谁先执行，本身就带有一定随机性，但实际开发里肯定是不能“各干各的”。线程里一定也是存在“ 你先做完，我再继续”的协作关系。

所以 Java 就因此提供了：`wait()`、`notify()`、`notifyAll()`来实现线程之间的等待和唤醒；注意`wait()`、`notify()`、`notifyAll()`都是 Object 类的方法，所以 Java 中的任意对象都提供了 `wait()`和 `notify()`。

`wait()/wait(long timeout)`：让当前线程进入等待状态；

`notify()/notifyAll()`：唤醒在当前对象上等待的线程；

### 7.1 `wait()` 方法
从上面我们知道了 `wait()`方法的作用是：让当线程先别干了，进入等待；

比如：

```java
Object lock = new Object();

Thread t1 = new Thread(() -> {
	synchronized (lock) {
		System.out.println("开始等待");
		lock.wait();
		System.out.println("等待结束");
	}
}
```

当执行到`lock.wait()`时候线程就会停下来，至于后面要打印的内容就不会立即执行了；

此时当前线程主要会经历这样三个过程：

**当前线程进入等待状态 -> 释放当前持有的 lock 锁 -> 以后被唤醒时，再重新尝试获取 lock 锁**

其中的**释放锁**这一步很关键；

那至于**为什么要释放锁**呢，继续举个例子：

（财务室在`synchronized (lock) {}`中）

> 假设李四进入财务室，此时李四手里拿着钥匙，然后李四发现：“我现在还缺一份材料，得等王五送过来。”
>

> 于是此时就调用` lock.wait()`，然后王五想进财务室送材料：“钥匙还在李四手里，我进不去”
>
> 那么李四：“材料不来我就不继续 ”，接着王五：“你不放钥匙我就送不进去”
>
> 这个时候两个人就直接卡住了，所以所以 `wait()`必须要释放锁让王五进来。
>

当然啦，如果你`wait()`不写在 synchronized 中就会抛异常~

而`wait()`要**等到什么时候**呢？

`wait()`默认是一直等，等到被唤醒，所以它对应的状态通常就是 `WAITTING` 状态，但`wait()`是提供带参数的，时间参数单位是毫秒。然后关于`wait(0)`，类似于`sleep(0)`，不是等待 0 毫秒，而是无限期等待，直到被 `notify()`、`notifyAll()` 唤醒，或者线程被中断。 

ok 我们上面也说了“`notify()`、`notifyAll()` 唤醒，或者线程被中断”通常就是这三种方式能把`wait()`唤醒。其中关于线程被中断这点，是指另外一个线程直接 `thread.interrupt()`，那么等待的线程会通过`InterruptedException`收到通知，与前面的 `sleep()`、`join()`是同一类思路；

但是`wait()`会释放所，而 `sleep()`不会释放锁~



注意被 notify 唤醒，不代表线程马上执行。因为线程醒来以后，会先从 ：

**`WAITING` 状态出来 -> 重新去竞争那把 lock -> 拿到所以后 -> 才能继续执行 `wait()` 后面的代码**

被唤醒以后，线程并不能马上继续执行，而是需要重新参与这把锁的竞争。什么时候真正拿到锁，仍然由线程调度决定。

![](/article-assets/2026/javaee-multithreading/images/thread25.png)

记得要求 `synchronized`的锁对象必须和`wait`的对象是同一个；



### 7.2 `notify()`方法
然后接着刚才说的，李四进入到财务室然后睡着了，王五已经把材料放在桌子上，这个时候问题随之而来：

> 李四都已经睡着了，谁来告诉他“别睡了，可以继续干活了”？
>

这个时候就需要 `notify()`，而`notify()`的作用确实就是**唤醒一个正在当前对象上**`**wait()**`**的线程**；

当然了，既然`wait()`要配上`synchronized`，那`notify()`也是必须得配上`synchronized`使用了。因为他们都是围绕着同一个对象对应的`monitor`锁进行协调。所以这边必须对应一把锁。

对了，务必还要确保先`wait()`，后 `notify()`。相反如果先`notify()`那么`wait()`也就无法唤醒。

比如：

```java
public class Demo {
    public static void main(String[] args)
            throws InterruptedException {

        Object lock = new Object();
        Thread t1 = new Thread(() -> {=
            synchronized (lock) {
                System.out.println("李四：材料没来，我先等等");
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("李四：材料到了，继续工作");
            }
        }, "李四");

        Thread t2 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("王五：材料送到了");
                lock.notify();
                System.out.println("王五：我已经通知李四了");
            }
        }, "王五");

        t1.start();
        Thread.sleep(1000);
        t2.start();
    }
}
```

以上代码的执行过程就如下方：

![](/article-assets/2026/javaee-multithreading/images/thread26.png)

注意上面所描述到的“李四重新竞争 lock”，李四的线程并不是接着马上就向后运行，而是重新与其他线程相互竞争；当然，也不是 `notify` 唤醒后 `wait` 马上就进入工作的...

**那有个问题，假如有多个线程都在 wait 呢？**

`notify` 还是规定只能唤醒一个，但是具体叫醒谁，并没有固定保证。但是如果想唤醒全部 wait 就可以用到 `notifyAll`；可以这样理解：`notify` 就是“老师面对三个趴桌子睡觉的人喊：起来一个帮我搬书！”，那么起来的是谁不一定；而 `notifyAll` 就是老师对这三个人都点名，让他们都起来去搬书。

然后在这里就可以区分 `WAITING` 和 `BLOCKED`了，假设李四调用了 `lock.wait()`，那么李四就是 `WAITING`（因为他主动释放锁，并通知被人等待），此时王五拿着 `lock`，赵六也想拿到锁但进不去，那赵六就是 `BLOCKED`。

### 7.3 `notifyAll()` 方法
（本来不想写 7.3，但是想了想还是需要补充一下哈）

前面举的这个例子，“老师面对三个趴桌子睡觉的人”如果想都叫醒就是用 notifyAll，但是调用了`lock.notifyAll()`也并不是三个线程马上一起执行后续代码，只是三个线程被唤醒，但还是**需要重新竞争原来的那把锁**。

### 7.4 `wait()` 和 `sleep()`的区别
到这里，我们已经很清晰的知道了 wait 和 sleep 完全没有可比性，毕竟一个是用于线程之间的通信，一个是让线程阻塞一段时间；唯一相同的就是都可以让线程放弃执行一段时间.

但还是需要总结下：

1. wait 需要搭配 synchronized 使用，而 sleep 不需要；
2. wait 是 Object 的方法，而 sleep 是 Thread 的静态方法；

我让 GPT 综合给出了一个表格，内容如下：

| 对比 | `wait()` | `sleep()` |
| --- | --- | --- |
| 所属类 | `Object` | `Thread` |
| 主要作用 | 线程之间等待、协作 | 让当前线程休眠 |
| 是否释放锁 | **释放锁** | **不释放锁** |
| 是否必须在 `synchronized` 中 | 是 | 否 |
| 无参时典型状态 | `WAITING` | `sleep` 必须指定时间 |
| 指定时间时 | `TIMED_WAITING` | `TIMED_WAITING` |
| 如何恢复 | `notify/notifyAll`、超时、中断等 | 时间到或被中断 |

