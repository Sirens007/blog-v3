---
title: Java 并发实践：单例模式、阻塞队列、线程池与定时器
permalink: /posts/javaee-multithreading-cases/javaee-multithreading-cases/
description: 通过单例模式、阻塞队列、线程池和定时器等案例，掌握Java多线程编程的实际应用与核心实现.
date: 2026-09-19
published: 2026-09-19
updated: 2026-09-19
categories:
  - 开发
  - Java SE
tags:
  - Java
  - Java SE
  - 多线程
image: /article-assets/2026/javaee-multithreading-cases/images/thread.png
---

## 1. 单例模式
对于《初阶》这篇文章我们已经介绍了`synchronized`和`volatile`，初阶知识点很多是在单独解决某个线程安全。为了切实理解如何应用，我引入了单例模式这个典型例子来深度讲解一下：

**单例模式**首先是**设计模式**里的其中一个，那么什么是单例模式，什么又是**设计模式**？

我先回答**设计模式**：

> 设计模式：设计模式不是某一个 Java 语法，而是针对某类常见问题总结出来的一套代码设计思路。而单例模式就是其中非常经典的一种。
>
> 你可以这么理解，设计模式可以类比象棋中的“棋谱”，针对红方的一些走法，黑方应招的时候有一些固定的套路，那么按照套路来走局势就不会吃亏。
>
> 那么软件开发中当然也会有很多常见的“问题场景”，针对这些问题场景，大佬就总结出了一些固定的套路，按照这个套路来实现代码也不会吃亏。
>

设计模式和框架也不是一个概念，框架属于“硬性要求”，设计模式属于“软性要求”；

**单例模式**：

> 希望某一个类，在程序中只存在一份的实例。
>

单例模式，是强制要求一个类不能创建多个对象，

你可以先记成：一个类 -> 只希望存在一个对象 -> 其他地方需要使用时 -> 都按这一份对象

**单例模式**具体实现方法有很多，常见的就有“**饿汉**”和“**懒汉**”两种。

### 1.1 饿汉模式
先看最简单的一种：

```java
class Singleton {
    private static Singleton instance = new Singleton();	// 记住这个地方，在类加载阶段触发的
    private Singleton() {
        //...
    }
    public static Singleton getInstance() {
        return instance;
    }
}
```

好了，我先来解释一下饿汉模式：类加载的时候，就直接把实例创建出来；

你可以理解为太饿了，等不及别人来要，我先把饭做好放在这里。结合上面的代码就是在`Singleton`类加载的时候直接 new 出一个`instance`实例，之后谁需要直接通过`getInstance`获取；

再解释一下上面的代码，有三个点需要看懂：

1. 对于该句`private static Singleton instance = new Singleton()`，之所以用`static`，就是让`instance`这个实例直接属于类本身，而不是属于某个具体对象；
2. `private Singleton()`这里的构造方法使用`private`的原因就是为了禁止外部随便创建 `Singleton` 对象。
3. 想要获取 `instance`就只有通过静态方法`getInstance`。这是统一向外提供的对象。


![](/article-assets/2026/javaee-multithreading-cases/images/01.png)

当然，对于如果需要有多个参数去构建 instance 时，就可以再对多参数的构造方法进行私有化就可以了。

### 1.2 懒汉模式
我们已经知道了“饿汉”就是：我先给你做好。

懒汉也很好理解：你真要用的时候，我再做。

对了，再补充一下“懒”，“懒”在计算机中其实是褒义词，经常能够节省计算机资源开销，我举个例子：

假如有一个很大的文件（千万字的小说），你用编译器打开一般会有两种情况~

1. 把所有的内容，都从文件加载到内存中，在显示
2. 只把一部分内容加载并显示

第一种情况会明显卡顿，而且就算加载再多你也看不过来；第二种情况就是后续如果用户翻页，随着翻页随时加载后续的数据。

懒汉模式对应的就是第二种情况。而且我用的 Okular PDF 阅读器很明显用的就是懒汉模式，因为当你快速滑动到后面的图片时，很明显会需要加载一下下。

来看一段单线程下的懒汉模式例子：

```java
class SingletonLazy {
    private static SingletonLazy instance = null;
    private SingletonLazy() {

    }
    public static SingletonLazy getInstance() {
        if(instance == null) {
            instance = new SingletonLazy();
        }
        return instance;
    }
}
```

这段懒汉模式与饿汉模式最大的区别就是在创建实例的时候。懒汉模式下，创建实例的时机是在第一次使用的时候，而不是在程序启动的时候。



当然，上述这些内容都是引子，接下来才是正题。

上面两份代码（饿汉、懒汉）**是否存在线程安全问题**，如果不是，该怎么办？（这也是经典的面试题）


![](/article-assets/2026/javaee-multithreading-cases/images/02.png)

首先对于饿汉模式，很明显只存在读操作，没有进行任何数据写入。多个线程最多是进行`<font style="background-color:rgba(0, 0, 0, 0.06);">Singleton.getInstance()</font>`去获取`<font style="background-color:rgba(0, 0, 0, 0.06);">instance</font>`而已。所以显然不存在线程安全问题。它的特点就是：不管以后到底用不用，类加载的时候对象就已经创建了。

但是对于懒汉模式，if 条件判断的时候，多线程下假设：

> 一个线程在进入 if 判断但还没进入创建实例的时候，另一个线程也在 if 判断，此时另一个线程也会同样进入线程去创建，这样第一个线程创建的实例就会被另一个线程后创建的实例给覆盖掉。
>


![](/article-assets/2026/javaee-multithreading-cases/images/03.png)

这样第一个线程的`instance`就被覆盖了，而且随着第二个现成的覆盖操作，第一个线程 new 出来的对象也就会被 GC（grabage collection 垃圾回收） 改释放掉了。像这样的情况就属于是 BUG，所以懒汉模式这样的写法，`getInstance` 就是线程不安全的。

在生产环境下，new 一个对象所要加载的内存可能是很大了（会有上百 G），所以像这样的操作还是很危险的，可能程序启动就会花费很长时间。


![](/article-assets/2026/javaee-multithreading-cases/images/04.png)

因此引入`synchronized`，将“希望”、“条件”和“修改”打包成原子的操作。但我还是要提醒的是：不是每个不安全的地方写了`synchronized`就会变得安全的，具体问题具体分析。

修改后得到的是：

```java
class SingletonLazy {
    private static SingletonLazy instance = null;
    private static Object locker = new Object();
    private SingletonLazy() {

    }
    public static SingletonLazy getInstance() {
        synchronized(locker) {
            if(instance == null) {
                instance = new SingletonLazy();
            }
            return instance;
        }
    }
}
```

引入加锁之后，后执行的线程就会在加锁的位置阻塞，阻塞到前一个线程解锁。当后一个线程进入条件的时候，前一个线程已经修改完毕。`instance`不再为`null`，就不会进行后续的`new`操作。

但是这样又会产生一个新的问题：

**每次调用 `getInstance` 都要加锁**……多线程情况下，这里的加锁就会相互阻塞，进一步影响程序的执行效率。

> 加锁、解锁存在额外开销，而懒汉模式真正危险的其实只是第一次实例创建阶段，所以后续没必要每一次获取实例都继续竞争锁。
>

所以继续优化~

通过再一次增加 if 判断条件，进而决定是否要加锁：

```java
class SingletonLazy {
    private static SingletonLazy instance = null;
    private static Object locker = new Object();
    private SingletonLazy() {

    }
    public static SingletonLazy getInstance() {
        if(instance == null) {
            synchronized(locker) {
                if(instance == null) {
                    instance = new SingletonLazy();
                }
            }
        }
        return instance;
    }
}
```

但这个地方，说实话我第一次学习的时候也觉得奇怪，因为在单线程两个一样条件的 if 是无意义的。单线程中，执行流就只有一个，上一个 if 的判定结果和下一个 if 是一样的~

但是在多线程中，两次判定之间，可能存在其他线程，然后其中有线程把 if 中的`instance`变量给修改了。就导致这里的两次 if 结论可能不同~

所以这里的两次 if 条件相同，只是纯属巧合了...

但是呢，**增加了 if 判断是否加锁还是可能存在一些问题**，比如是否会存在“**内存可见性**”问题？

> 答案是可能存在的，编译器优化非常复杂，为了稳妥起见可以给`instance`直接加上一个`volatile`，从根本上杜绝了内存可见性问题。
>

此处内存可见性就可能存在这种情况：第一个线程读取`instance`的时候，第二个线程进行修改。第一个线程就没有能及时读取到第二个线程进行的修改。

**但这里更关键的问题其实是指令重排序**。指令重排序也是编译器优化的一种体现，编译器会在逻辑不变的前提下，调整你代码执行的先后顺序，以达到提升性能的效果。

涉及指令重排序的代码为创建实例的时候：

```java
instance = new SingletonLazy();
```

这一步从概念上可以拆成三步：

1. 分配对象内存
2. 执行构造函数，对对象初始化
3. 把对象地址赋值给 instance

正常来说这三个步骤是按照 1、2、3 这样的顺序来执行的。但是在指令重排序下，可能成为 1、3、2 这样的顺序，单线程环境下，1、2、3 还是 1、3、2 其实无所谓~

但多线程中是 1、3、2 这样的顺序执行，多线程环境下可能会出现 BUG！！！


![](/article-assets/2026/javaee-multithreading-cases/images/05.png)

这样的问题不仅仅是指令重排序引起的，也和双重 if 有关，那么到底该如何解决？

其实透露一下，`volatile`这个关键字的功能有两个方面：

1. 确保每次读取操作都是读内存
2. 关于该变量的读取和修改操作，不会触发重排序

所以最终优化版本如下：

```java
class SingletonLazy {
    private static volatile SingletonLazy instance = null;	// 第三处
    private static Object locker = new Object();
    private SingletonLazy() {

    }
    public static SingletonLazy getInstance() {
        if(instance == null) {	// 第二处
            synchronized(locker) {	// 第一处
                if(instance == null) {
                    instance = new SingletonLazy();
                }
            }
        }
        return instance;
    }
}
```

最后切记关于懒汉模式的三个关键点，然后关于面试中真的遇到了该如何应对：

1. 先写一个不带线程安全的单例模式
2. 思索片刻，线程不安全，把锁加上
3. 再次思索片刻，加上 if
4. 再次思索片刻，加上 volatile

如果是一次写出最终版本，在面试官眼里他会觉得这个问题你正好准备过，此时说明这个题目就考察不出来啥，这题不算，谈下一话题~

## 2. 阻塞队列
我们在 JavaSE 中学过普通队列，应该都知道先进先出。而所谓的**阻塞队列**`BlockingQueue`就是一种比较特殊的队列。但它首先还是**队列**，所以仍然遵守先进先出。可它又多了一个非常重要的一个特点：

1. 当队列满的时候，继续入队列就会阻塞，直到有其他线程从队列中取走元素；
2. 当队列空的时候，继续出队列也会阻塞，直到有其他线程往队列中插入元素；

阻塞队列的一个典型应用场景就是“生产者消费模型”

### 2.1 生产者消费者模型
···

生产者消费者模型其实就是：通过一个容器来解决生产者和消费者的强耦合问题。

生产者和消费者彼此之间不直接通讯，而是通过阻塞队列来进行通讯，所以伸长这生产完数据之后不用等待消费者处理，直接扔给阻塞队列，消费者不找生产者要数据，而是直接从阻塞队列里取。

生产者消费者模型这名字也很好理解，就比如过年包饺子：

> 负责擀饺子皮的这个人就是生产者
>
> 负责包饺子的人就是消费者
>

这样，擀饺子皮的不关心包饺子的人是谁，包饺子的人也不用关心擀饺子皮的人是谁，大家就各自做各自的就行。

这也就是简单的上下游关系。阻塞队列的目的就是避免生产者和消费者之间绑得很死，能够**解耦合**；

阻塞队列还相当于生产者和消费者之间的缓冲，平衡生产者和消费者的处理能力，也就是**削峰填谷**。


![](/article-assets/2026/javaee-multithreading-cases/images/06.png)

一般来说 A 这种上游的服务器，尤其是入口的服务器，干的活更简单，单个请求消耗的资源数少；像 B 这种下游的服务器，通常承担更重的任务量，复杂的计算/存储 工作，单个请求消耗的资源数更多。

引入下面 2 这样的阻塞队列后，就能够有效缓解一下 B 服务器；它会让来自 A 的请求先进入阻塞队列，随后消费者服务器慢慢取，暗号服务器能承受的速度处理；

比如：突然来了 10000 个请求，先存起来，然后每秒处理 100 个；也就是高峰先缓冲，慢慢消化。这也就是所说的“削峰”。

### 2.2 标准库中的阻塞队列
```java
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class Demo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();

        for (int i = 0; i < 100; i++) {
            queue.put("aaa");
        }
        System.out.println("队列已经满了. ");

        queue.put("aaa");
        System.out.println("再次尝试 put 元素");
    }
}
```

Java 已经给我们准备好了`BlockingQueue`，这是一个接口，真正实现的类是`LinkedBlockingQueue`。

+ 其中`put`方法用于**阻塞式的入队列**，`take`用于**阻塞式的出队列**。
+ `BlockingQueue`也有`offer`、`poll`、`peek`等方法，但是这些方法不带有阻塞特性。


![](/article-assets/2026/javaee-multithreading-cases/images/07.png)

会发现，这里有数组、链表以及优先级队列实现的阻塞队列。说到这就想到，面试中常考的 Java 中 ArrayList 和 LinkedList 有什么区别，其实最主要的是他们的时间复杂度

+ 顺序表：尾插尾删，O(1)；头插头删、中间位置插入 O(N)
+ 链表：任意位置插入删除 O(1)

这里我让 ai 给了个阻塞队列的表格：

| 对比 | `ArrayBlockingQueue` | `LinkedBlockingQueue` |
| --- | --- | --- |
| 底层结构 | 数组 | 链表 |
| 是否有界 | 必须指定容量 | 可指定；不指定时容量接近无限 |
| 内存分配 | 初始化一次数组，后续基本不分配节点 | 每加入一个元素都要创建 Node |
| GC 压力 | 较小 | 较大 |
| put/take 并发 | 共用一把锁 | `putLock`<br/> 和 `takeLock`<br/> 两把锁 |
| 高并发吞吐 | 一般 | 某些生产/消费并发场景更好 |
| 内存可控性 | 很好 | 要特别注意容量 |
| 延迟稳定性 | 通常更好 | 容易受对象分配和 GC 影响 |


先来一个例子：

生产者消费者模型使用阻塞队列

```java
public class Demo7 {
    
    public static void main(String[] args) {
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>();
        Thread producer = new Thread(() -> {
            int num = 0;
            while (true) {
                try {
                    queue.put(num);
                    System.out.println("生产元素" + num);
                    num++;
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        },"producer");

        Thread consumer = new Thread(() -> {
            try {
                Integer num = queue.take();
                System.out.println("消费元素" + num);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        });

        producer.start();
        consumer.start();
    }
}
```


![](/article-assets/2026/javaee-multithreading-cases/images/08.png)

关于此处要是不设参数的话，默认会是一个非常大的值...


![](/article-assets/2026/javaee-multithreading-cases/images/09.png)

用计算机计算就能知道是 21 亿多，


![](/article-assets/2026/javaee-multithreading-cases/images/10.png)

另外阻塞队列中，没有提供一个“阻塞的获取队首元素的操作”。

对于上述代码中，如果让其中一个 sleep 等待一下，让生产者速度比消费者速度快一下会如何？

其实只是生产者会很快填满阻塞队列，然后消费者会一个一个从中取出，就按他自己的节奏来。其实按照上述代码就算存满了，其实也占不了多大内存，我们已经知道该队列最大最多 21 亿个元素，每个元素就是一个 int 的 4 字节空间。总共就是 80 亿字节，转换为也就是 8G；

具体转换如下：

Thousand 千 => K

Million 百万  => M

Billin 十亿     => G

### 2.3 阻塞队列模拟实现
```java
class MyBlockingQueue {
    // 此处不使用泛型
    private String[] data = null;
    // 队首
    private int head  = 0;
    // 队尾
    private int tail = 0;
    // 元素个数
    private int size = 0;
    public MyBlockingQueue(int capacity) {
        data = new String[capacity];
    }

    public void put(String elem) throws InterruptedException {
        // 当队列满，需要阻塞
        synchronized (this) {
            while (size >= data.length) {
                this.wait();
            }
            data[tail] = elem;
            tail++;
            // 再判断是否需要循环
            if(tail >= data.length) {
                tail = 0;
            }
            size++;
            // 针对队列空的话，需要唤醒阻塞
            this.notify();
        }
    }

    public String take() throws InterruptedException {
        // 当队列空，需要阻塞
        synchronized (this) {
            while (size == 0) {
                this.wait();
            }
            String ret = data[head];
            head++;
            if (head >= data.length) {
                head = 0;
            }
            size--;
            // 针对队列满的话，需要唤醒阻塞
            this.notify();
            return ret;
        }
    }
}
```

上述使用的阻塞队列是循环的队列：


![](/article-assets/2026/javaee-multithreading-cases/images/11.png)

由于队列满或者队列空的时候需要阻塞队列，然后又由于**队列不空**或者**不满**的时候需要被唤醒，所以`put`和`take`方法中分别都需要到`wait`和`notify`。


![](/article-assets/2026/javaee-multithreading-cases/images/12.png)

+ 注意，上述代码中，使用`synchronizd`的目的是，解决多个线程同时修改队列导致的数据竞争，避免两个线程可能同时操作同一个位置导致队列混乱，保证 `head`、`tail`、`size`、`data` 的操作是线程安全的。另外，此处为避免混乱还需结合着`wait`和`notify`一起使用。

```java
if (size >= data.length) {
    this.wait();
}
```

+ 另外关于为什么使用的是`while`而不是`if`。问题在于被`notify`唤醒，并不代表你现在一定可以继续执行。假设：队列容量为 1，且当前队列已占满。现在有两个生产者 P1、P2 都想放元素。于是当前 P1、P2 都进入 `wait`等待。然后消费者取走占满的元素，唤醒了两个等待线程，假设是 P1 先拿到锁，现在队列就又满了。如果是`if`那么 P2 从`wait`后面继续执行，不会再次判断条件。于是就直接进行`data[tail] = elem`。但如果是`while`的话，P2 会**再重新检查一遍是否真的被唤醒**~

对于使用`wait`这个地方，其实标准库中就已经建议使用`while`来替换`if`~

[java17中关于wait的相关解释](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html#wait())


![](/article-assets/2026/javaee-multithreading-cases/images/13.png)

对了，**上述所说的** `wait`，**其实也不只是能被** `notify` **唤醒**，**还可以被**`Interrupt`**这样的方法给中断**。如果用 `if` 作为 `wait` 的判断条件，此时也还是存在被提前唤醒的风险！

## 3 线程池
之前学习 String 已经初步了解了常量池相关知识，常量池主要就是为了**复用常量数据**，减少重复存储。它与线程池的共同点就是**池化**的思想：

> 把创建成本较高或可以重复利用的资源提前保存起来，后续重复使用。
>

那么线程池的意义就是，我还是举个例子吧：

> 一家餐厅每天都会不断有客人来。如果每来一桌客人，就临时招聘一个服务员，服务完再把他辞退，成本会非常高。  
更合理的做法是提前准备固定数量的服务员，客人来了就分配给空闲服务员处理；忙不过来时，客人先排队等待。
>

所以线程池的最大好处就是提前创建并复用线程，避免频繁创建和销毁线程带来的开销。

对于频繁创建和销毁线程，目前已经有三种解决情况了：

1. 线程池，不反复创建，直接使用；
2. 协程：不再让每个任务都对应一个重量级线程；
3. 虚拟线程，Java21+之后开始的；

但目前使用最普遍还是线程池，剩下两个可以后面再了解~

关于**为什么叫**“**池**”，主要还是因为池化的这种思想。都是池子里会提前准备一些资源，需要的时候拿出用即可，用完不是销毁，而是放回池子里继续再使用。

### 3.1 标准库中的线程池
其实，线程池不需要我们每次自己实现。Java 的标准库已经提供好给我们了。

先讲 Java 供我们可以自定义的线程池：

首先先来区分一下这些名称

> Executor          → 接口
>
> ExecutorService   → 线程池常用接口
>
> Executors         → 工具类，帮我们创建线程池
>
> ThreadPoolExecutor → 线程池核心实现类
>

#### `ThreadPoolExecutor` 自定义线程池
**核心方法是** `submit(Runnable)`，不过这个方法你在`ThreadPoolExecutor`没看到很正常，因为`ThreadPoolExecutor`是继承了`submit`这个方法。

继承关系是：`Executor` <- `ExecutorService` <- `AbstractExecutorService` <- `ThreadPoolExecutor`

而 `submit`方法主要是在`ExecutorService`中定义的，在 `AbstractExecutorService` 中给出了实现，所以 `ThreadPoolExecutor` 直接继承了它。

然后通过 Runnable 描述一段要执行的任务，再通过`submit`任务放到线程池中，线程池就会执行这些任务；

但构造`ThreadPoolExecutor`线程池有些麻烦，需要了解一些相关参数：


![](/article-assets/2026/javaee-multithreading-cases/images/14.png)

有四个构造参数，一般面试会问这些参数都是什么意思（经典面试题）

面试官最想听的就是你对于第七个参数的理解~

这里我们直接了解最困难的最后一个

```java
ThreadPoolExecutor(
        int corePoolSize,
        int maximumPoolSize,
        long keepAliveTime,
        TimeUnit unit,
        BlockingQueue<Runnable> workQueue,
        ThreadFactory threadFactory,
        RejectedExecutionHandler handler
)
```

+ `int corePoolSize`：核心线程数，表示至少有多少个线程。线程池一旦创建，这些线程也要随之创建，知道整个线程池销毁，这些线程才会销毁。
+ `int maximumPoolSize`：最大线程数，表示核心线程数+非核心线程数（不繁忙就销毁，繁忙就再创建），我们知道，线程不是越多越好的。
+ `long keepAliveTime`：非核心线程允许空闲的最大时间。临时增加出来的线程，不可能永远留在那里。
+ `TimeUnit unit`：时间单位，单看`keepAliveTime = 10`你不知道单位是秒？分钟？小时？这里是枚举类型
![](/article-assets/2026/javaee-multithreading-cases/images/15.png)
+ `BlockingQueue<Runnable> workQueue`：任务队列，也就是我们前面学到的阻塞队列（线程池里的任务队列）。当然了此处的队列可以自己选择合适的根基（数组/链表、指定 capacity、指定是否要带有优先级/比较规则）。线程池本质上也是生产者消费者模型，调用`submit`就是在生产任务，线程池里的线程就是在消费任务。
+ `threadFactory`：线程工厂，用来定义线程池创建工作线程的方式。线程池需要新线程时，会调用 `ThreadFactory.newThread(Runnable)` 创建线程。通过线程工厂可以统一设置线程名称、优先级、是否为守护线程以及异常处理方式等。它只负责“怎么创建线程”，不负责决定“什么时候创建线程”。

对于**为什么使用线程工厂**，我给到下面的解释：

假设我有一个 Point，他最终都要保存平面直角坐标，单床剪一个点时，可以有两种输入方式：

方法 1，使用直角坐标(x,y)；方法 2，使用极坐标(r,a)

但问题就在构造方法这里，我们会自然的写出两个构造方法：

```java
class Point {
    public Point(double x, double y) {
        // 按照直角坐标创建
    }
    public Point(double r, double a) {
        // 按照极坐标创建
    }
}
```

但是 Java 不允许，原因就是 Java 的方法重载看的是方法名、参数个数、参数类型、参数顺序。所以对于 Java 来说这俩就完全一样。所以就用工厂方法来解决。就改为不直接让用户调用构造方法，而是提供**不同名字的方法**。就比如下面：

```java
class PointFactory {
    public static Point makePointByXY(double x, double y) {
        Point p = new Point();
        p.x = x;
        p.y = y;
        return p;
    }

    public static Point makePointByRA(double r, double a) {
        Point p = new Point();
        p.x = r * Math.cos(a);
        p.y = r * Math.sin(a);
        return p;
    }
}
```

**注意类型**是 `Point`并且还是**静态方法**。**工厂方法的核心就是通过静态方法把构造对象 new 的过程、各种属性初始化的过程封装起来，并且提供多组静态方法，实现不同情况的构造**。此时调用就可以这样：

```java
Point p1 = PointFactory.makePointByXY(3, 4);
Point p2 = PointFactory.makePointByRA(5, Math.PI / 2);
```

当然也可以直接在`Point`里面写静态工厂方法：

```java
class Point {

    private double x;
    private double y;

    private Point(double x, double y) {
        this.x = x;
        this.y = y;
    }
    public static Point fromXY(double x, double y) {
        return new Point(x, y);
    }
    public static Point fromRA(double r, double a) {
        return new Point(
                r * Math.cos(a),
                r * Math.sin(a)
        );
    }
}

// 使用
Point p1 = Point.fromXY(3, 4);
Point p2 = Point.fromRA(5, Math.PI / 2);
```

以上两种方法分别是：

> 构造方法：负责真正构造对象
>
> 静态工厂方法：负责提供不同的创建方式
>

以上就是对工厂类的解释。

+ `RejectedExecutionHandler`：拒绝策略，显然他的意思就是字面意思。`submit`会把任务添加到任务队列中，任务队列是阻塞队列，队列满了再添加，就会阻塞~对于线程池来说，发现入队列操作时，队列满了，不会真的触发“入队列操作”，不会真阻塞，而是执行拒绝策略相关代码。

为什么不使用生产者消费者模型是因为如果调用`submit`就阻塞，就会是这个线程就没法干别的事情，对于用户那里就会迟迟拿不到请求的响应，用户等了很久，直观上看到的现象就是“卡了”。所以，与其是“卡了”不如直接告诉我“失败”。

拒绝策略就是下面四个，我会再一步解释一下：

| 拒绝策略 | 含义 |
| --- | --- |
| `AbortPolicy` | 直接抛异常 |
| `CallerRunsPolicy` | 让提交任务的线程自己执行 |
| `DiscardOldestPolicy` | 丢掉队列中最老的任务 |
| `DiscardPolicy` | 直接丢掉新任务 |


拿快递站举个例子，现在所有员工都忙，任务本也写满了，临时工也招到上限。

此时来了一个快件...

`AbortPolicy`：“接受不了了！”，直接报错；

`CallerRunsPolicy`：“谁把这个任务送过来的，谁自己干。”

`DiscardOldestPolicy`：“把任务本里最老的一项扔掉，给新任务腾位置。”

`DiscardPolicy`：“新来的直接不要。”

意思就是上面这么个意思


![](/article-assets/2026/javaee-multithreading-cases/images/16.png)

#### `Executors`封装好的常用线程池
如果按照上面的自定义线程池那样，每次使用线程池就得自己填写那么多参数还是太麻烦了。而且很多时候我们的需求其实也很普通：我就是想要一个固定 10 个线程的线程池。

所以 **Java 就提供了一个封装好的 `Executors` 这样一个工具类**。它就相当于帮我们把常见的`ThreadPoolExecutor`参数提前组合好了，并且提供了几种常见线程池创建方式。

下面都是`Executors`的方法：


![](/article-assets/2026/javaee-multithreading-cases/images/17.png)

我只大概了解其中几个：

+ `newFixedThreadPool`：创建一个固定 n 个线程的线程池。

```java
ExecutorService pool =
        Executors.newFixedThreadPool(10);
pool.submit(() -> {
    System.out.println("hello");
});
```

+ `newCachedThreadPool`：创建线程数量可以动态变化的线程池。业务多的时候会增加线程；业务少的时候空闲线程逐渐回收。
+ `newScheduledThreadPool`：可以完成延迟执行、定期执行；正好等到后面要说的定时器再展开。

综上也能看出来，**其实** `Executors` **本质上就是** `ThreadPoolExecutor` **类的封装**。

### 3.2 线程池的关闭
线程池使用完后，需要主动进行关闭。`ThreadPoolExecutor`中常用的两个就是：`shutdown()`和`awaitTermination()`。

其中`shutdown()`用于**发起线程池关闭通知**，而`awaitTermination()`用于**等待线程池真正关闭完成**。

#### `shutdown()`方法
`executor.shutdown()`，调用`shutdown`之后，线程池会进入关闭状态，会有以下的过程：

1. 不再接受新任务；
2. 已经提交并正在执行的任务会继续执行；
3. 已经进入任务队列的任务也会继续执行；
4. 当所有已提交任务执行完成后，线程池中的工作线程才会逐渐退出。

注意，`shutdown`**不会阻塞调用它的线程**~毕竟，谁会断了自己的路呀~

#### `awaitTermination()`方法
如果程序需要确认线程池中的任务已经执行结束，可以配合：

```java
executor.awaitTermination(10, TimeUnit.SECONDS);
```

作用就是：让当前线程等待线程池结束，最多等待指定的时间。

通常需要先调用`executor.shutdown()`，再调用`executor.awaitTermination(10, TimeUnit.SECONDS)`

例如：

```java
executor.shutdown();

try {
    boolean finished = executor.awaitTermination(10,TimeUnit.SECONDS);

    if (finished) {
        System.out.println("线程池已经完全关闭");
    } else {
        System.out.println("等待超时，线程池仍未关闭");
    }

} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
```

此处，`awaitTermination(10,TimeUnit.SECONDS)`表示当前线程最多等待线程池 10 秒。然后这个方法还会返回一个`boolean`值：true 表示在线程等待期间，线程池已经完全终止；false 表示等待时间已经到了，但线程仍然没有结束。

### 3.3 线程池模拟实现
```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

// 实现一个固定线程个数的线程池
public class MyThreadPool {
    private BlockingQueue<Runnable> queue = null;
    public MyThreadPool(int n) {
        // 初始化线程池，创建固定个数的线程
        // 此处使用ArrayBlockingQueue作为任务队列，容量为1000
        queue = new ArrayBlockingQueue<>(1000);

        // 创建线程
        for (int i = 0; i < n; i++) {
            Thread t = new Thread(() -> {
                try {
                    while (true) {
                        Runnable task = queue.take();
                        task.run();
                    }
                } catch(InterruptedException e){
                    throw new RuntimeException(e);
                }
            });
            // 启动线程
            t.start();
        }
    }

    // 提交任务
    public void submit(Runnable task) throws InterruptedException {
        queue.put(task);
    }

    public static void main(String[] args) throws InterruptedException {
        MyThreadPool pool = new MyThreadPool(10);
        for (int i = 0; i < 100; i++) {
            int id = i;
            pool.submit(() -> {
                System.out.println(Thread.currentThread().getName() + " id = " + id);
            });
        }
    }
}
```

理解线程池最直接的方法之一，就是**自己实现一个简化版本**，并且能**不看模板自己实现一个**，这样你才能明白到这段代码中很多细节以及整个运转流程，真的...

真正的 `ThreadPoolExecutor` 内部还包含核心线程数、最大线程数、拒绝策略、线程回收、线程池状态管理等大量机制，但如果只看最核心的思想，其实可以概括为两部分：

+ 提前创建一批可以重复使用的工作线程
+ 使用一个任务队列保存暂时还没有被执行的任务

上面那部分代码虽然很简单，但已经包含了线程池最基本的运行过程。我来解释一下部分含义：

1. **使用阻塞队列保存任务**

我在线程池内部首先定义了一个`BlockingQueue<Runnable>`，创建了一个容量为 1000 的阻塞队列，队列中保存的不是线程，而是`Runnable`，也就是一个个等待执行的任务。当调用`pool.submit(task)`时，任务并不会立即由`submit`方法执行，而只是通过`queue.put(task)`被放入任务队列中。

整个过程就是

“**提交任务  ->  submit(task)  ->  queue.put(task)  -> 等待工作线程处理**”

使用阻塞队列还有一个重要的原因：它可以很好的协调“提交任务的线程”和“执行任务的线程”。

当队列暂时没有任务时，工作线程执行：`queue.take()`，会进入阻塞状态，而不是不断循环检查队列。这样的话线程在没有任务的时候就不会一直占用的 CPU。

2. **提前创建固定数量的工作线程**

在线程池的构造方法中，已经提前创建好了 n 个线程`MyThreadPool pool = new MyThreadPool(10)`，这就意味着线程池创建时会直接启动 10 个工作线程。这些线程当然不是执行一次任务以后就结束，而是在 while 里不断循环去 take 任务：

```java
while (true) {
    Runnable task = queue.take();
    task.run();
}
```

3. `take()` **负责取得任务**，`run()` **负责执行任务**

在工作线程中最核心的代码实际上只有两行：

```java
Runnable task = queue.take(); 
task.run();
```

`queue.take()`负责从任务队列中获取一个`Runnable`任务，当其他线程通过`queue.put(task)`提交新任务以后，线程池中的一个的等待中的工作线程就可以取得这个任务。

`task.run()`才是真正执行任务的地方，当然这里还有注意去分析下`t.start()`和`task.run()`。

例如：

```java
Thread t = new Thread(...);
t.start();
```

表示启动一个工作线程。之后这个工作线程从队列中取得`Runnable task`，再调用`task.run()`表示由当前这个已经启动的工作线程去执行任务。

👌以上就是我对模拟实现的讲解~

## 4. 定时器
上面我们已经学习了线程池，他所解决的主要是**任务来了以后交给谁执行**，而现在要学习了定时器要解决的是**这个任务是么时候执行**。

你可以把定时器类比一下为“闹钟”，先把任务和时间约好，等时间到了以后再去执行对应的代码。就像是计算机网络里学到的网络通信超过一定时间没有响应就重连，或者让某个缓存数据几秒以后过期。

### 4.1 标准库中的`Timer`
标准库提供了一个 Timer 类，Timer 类的**核心方法**就是`Schedule`；

`Schedule`包含**两个参数**，第一个参数指定即将要执行的任务代码，第二个参数指定多长时间之后执行（单位为毫秒）

```java
Timer timer = new Timer();

timer.schedule(new TimerTask() {
    @Override
    public void run() {
        System.out.println("hello");
    }
}, 3000);
```

**以上是匿名内部类写法，与讲线程的创建方法的时候类似。**

主要就是以下**三个要点**：

1. **创建了子类（父类 TimerTask），匿名**
2. **重写了 run**
3. **new 了子类的实例**

正常描述任务，是 `Runnable`，但在定时器这里稍微特殊一些，把 `Runnable` 封装了一下为 `TimeTask`。那么 `Timer` 和 `TimerTask` 分别又是什么呢？

你可以这样理解，就是`Timer`**负责什么时候执行，也就是调度者**；`TimerTask`**负责执行什么，也就是任务**；

和线程池类似，**线程池**负责调度并执行 `Runnable` 任务，而 `Timer` 负责定时调度 `TimerTask` 任务；**实现 `Runnable` 时需要实现 `run()` 方法，继承 `TimerTask` 时同样需要重写 `run()` 方法**，因为真正的任务逻辑都写在 `run()` 中。

```java
Thread thread = new Thread() {
    @Override
    public void run() {
        System.out.println("hello");
    }
};

thread.start();
```


![](/article-assets/2026/javaee-multithreading-cases/images/18.png)

以上就是两者的大概对比；还有就是和线程池一样，Timer 中也包含前台线程，阻止进程结束。

### 4.2 定时器的模拟实现
首先我们需要了解**定时器的构成**：

1. 一个带优先级队列（不需要使用 PriorityBlockingQueue，容易**死锁**）
2. 队列中的每个元素是一个 Task 对象
3. Task 中带有一个时间属性，队首元素就是即将要执行的任务
4. 同时有一个 worker 线程一直扫描队首元素，看对队首元素是否需要执行

而我们要**实现定时器**则需要按照下面这四部分：

1. 创建一个类`MyTimeTask`，表示一个任务
2. 定时器中，能够管理多个任务的集合类
3. 实现 schedule 方法，把任务添加到队列中即可
4. 额外创建一个线程，负责执行队列中的任务

和线程池不同，线程池是只要队列不为空，就立即取任务并执行。此处还要看队首元素的时刻是否到了，时刻到才能执行，时刻不到不能执行。

这里的话，我喜欢先讲解再展示代码哈：

+ 我先创建两个类，分别是定时器类`MyTimer`,以及存放任务的 `MyTimerTask`。这里我没有实现`Runnable`，而是直接在`MyTimerTask`持有一个`Runnable`。所以`MyTimerTask`里就存在了两个参数，`Runnable task`和`long time`；接着就是必备着带着两个参数的构造方法。**记住，既然自己实现了任务类就得自己实现一个比较器**。
+ 接着就是在`MyTimer`定时器里创建一个优先级队列`PriorityQueue<MyTimerTask> queue`，存放就是自己写的任务类`MyTimerTask`。再然后就是创建`schedule`方法，在这个方法里实例化一个**新任务**并放入队列中。
+ 随后就是在`MyTimer`中通过构造方法创建线程，循环从队列中提取任务进行执行

这三部分我都是按照上面说的，只是将第二步与第三步放在了一起。然后是注意线程安全问题，注意加锁 `synchronized` 以及`wait/notify`；

```java
package timer;

import java.util.PriorityQueue;

/**
 * Created with IntelliJ IDEA.
 * Description:
 * User: Syrena.
 * Date: 2026-09-20
 * Time: 13:24
 */
public class MyTimer {
    // 队列里的每一个元素都是MyTimerTask类型
    private PriorityQueue<MyTimerTask> queue = new PriorityQueue<>();
    private Object locker = new Object();
    // 创建schedule方法
    public void schedule(Runnable task, long delay) {
        synchronized (locker) {
            // 记录时间戳
            // 实例化时建议放在锁里，否则没拿到锁的时候就先实例化时间存在一定延迟
            MyTimerTask timerTask = new MyTimerTask(task, System.currentTimeMillis() + delay);
            queue.offer(timerTask);
            locker.notify();
        }
    }

    // 构造方法中，额外创建一个线程，负责执行队列中的任务
    public MyTimer() {
        Thread t = new Thread(() -> {
            try {
                while (true) {
                    synchronized (locker) {
                        while (queue.isEmpty()) {
                            locker.wait();
                        }
                        // 取出队首元素
                        MyTimerTask task = queue.peek();    // 先判断时间是否到再移除
                        if(System.currentTimeMillis() < task.getTime()) {
                            // 当前任务时间如果比系统时刻还大，说明还未到执行时刻
                            locker.wait(task.getTime()
                                    - System.currentTimeMillis());
                        } else {
                            task.run();
                            queue.poll();
                        }
                    }
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        t.start();
    }
}

```



```java
package timer;

/**
 * Created with IntelliJ IDEA.
 * Description: 用来描述一个任务
 * User: Syrena.
 * Date: 2026-09-20
 * Time: 13:15
 */

    /*
    两个方法：
    1. 实现一个Runnable，但需要基于抽象类定义MyTimerTask
    2. 持有一个Runnable
     */
// 由于比较的类是自己写了类型，所以比较规则需要自己写（Comparable/Comparator）
public class MyTimerTask implements Comparable<MyTimerTask>{

    private Runnable task;
    private long time;  // 记录要执行的时刻，用时间戳

    // 构造函数里传入可运行的task
    public MyTimerTask (Runnable task,long time) {
        this.task = task;
        this.time = time;
    }

    @Override
    public int compareTo(MyTimerTask o) {
        return (int) (this.time - o.time);  // < 0，则this < 0；需求是让时间小的元素在队首，实现小根堆
    }
    public long getTime() {
        return this.time;
    }
    public void run() {
        task.run();
    }

    public static void main(String[] args) {
        MyTimer myTimer = new MyTimer();
        myTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                System.out.println("Hello 1000");
            }
        },1000);
        myTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                System.out.println("Hello 2000");
            }
        },2000);
        myTimer.schedule(new TimerTask() {
            @Override
            public void run() {
                System.out.println("Hello 3000");
            }
        },3000);
    }
}
```



以上就是定时器的模拟实现，需要注意的是：

```java
public MyTimer() {
    Thread t = new Thread(() -> {
        try {
            while (true) {
                synchronized (locker) {
                    while (queue.isEmpty()) {
                        locker.wait();
                    }
                    // 取出队首元素
                    MyTimerTask task = queue.peek();    // 先判断时间是否到再移除
                    if(System.currentTimeMillis() < task.getTime()) {
                        // 当前任务时间如果比系统时刻还大，说明还未到执行时刻
                        locker.wait(task.getTime()
                                - System.currentTimeMillis());
                    } else {
                        task.run();
                        queue.poll();
                    }
                }
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    });
    t.start();
}
```

此处的构造方法本身可以写`synchronized`，但此处不能将`synchronized`直接包裹整个构造方法，因为此处的`synchronized` 保护的是线程的 `run` 里面的 `lambda`；

```java
while (queue.isEmpty()) {
    locker.wait();
}
```

此处使用 `wait` 时要使用 `while`，避免异常唤醒以及其他可能唤醒能够循环再次检查一遍；如果使用`if`检查的话，会导致忙等，一直循环检查会消耗大量 CPU 资源。

```java
if(System.currentTimeMillis() < task.getTime()) {
    // 当前任务时间如果比系统时刻还大，说明还未到执行时刻
    locker.wait(task.getTime()
            - System.currentTimeMillis());
} else {
    task.run();
    queue.poll();
}
```

此处使用 `wait` 时无需再 `while` 检查，因为外面有一层 `while`，就算这里被异常唤醒后能够再循环到这一步重新 `wait`。

标准库提供的 Timer 和自己写的 MyTimer 差不多，都是使用一个线程，负责扫描队首元素并执行。但其实可以结合线程池，创建多个线程，负责执行这里的队列中的任务（一个线程负责扫描，扫描到需要执行的任务，添加到另一个线程池的任务队列中，有多个线程负责执行）

如果任务少/任务的时间分散都无所谓，如果任务特别多，时间非常集中，一个线程就可能执行不过来~

定时器其实是一个非常重要的组件，在分布式系统中，把定时器专门提取出来，封装成一个单独的服务器~

