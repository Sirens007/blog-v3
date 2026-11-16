---
title: Java 并发进阶（二）：CAS、原子类与 JUC 工具
permalink: /posts/javaee-multithreading-juc/javaee-multithreading-juc/
description: 理解CAS、原子类与ABA问题，掌握Callable、ReentrantLock、Semaphore和CountDownLatch等JUC并发工具.
date: 2026-09-29
published: 2026-09-29
updated: 2026-09-29
categories:
  - 开发
  - Java SE
tags:
  - Java
  - Java SE
  - 多线程
image: /article-assets/2026/javaee-multithreading-juc/images/cover.webp
---

## 1.CAS
CAS 前面其实在说`synchronized`就已经就接触到这个词了。

但那会只是简单的解释了一下：

> 线程可以通过 CAS 去尝试修改锁状态，如果成功就说明拿到锁；失败就说明有人竞争，再继续自旋；
>

这里我再具体说明一下：CAS 全称 Compare and swap，字面意思“比较并交换”。

CAS 操作可以拆成三个值，有如下：

> V：内存中的原始值
>
> A：线程认为它是旧值，也叫预期值
>
> B：线程想写入的新值
>

而 CAS 要做的事情就是，只有 V 任然等于 A，才把 V 改成 B；否则不修改，并告诉线程这次失败了。

> 这段写的代码不是原子的，真实的 CAS 是一个原子的硬件指令完成的，这个伪代码只是辅助理解 CAS 的工作流程
>

```java
boolean CAS(address, expectValue, swapValue) {
    if (&address == expectValue) {
        &address = swapValue;
        return true;
    }
    return false;
}
```

比如共享变量最初是 `10`。线程想执行 `CAS(原始值 10, 预期值 10, 新值 11)`：

+ 如果执行 CAS 时变量仍是 `10`，修改成功，变量变成 `11`。
+ 如果另一个线程已经把预期值改成 `11`，预期值对不上，修改失败，变量保持原值。

还可以这么理解，你正在修改在线文档，你开始编辑时看到的是第 10 版，提交时系统先确认他是否仍为第 10 版；如果别人已经提交了第 11 版，就不能直接用你的旧内容覆盖它。

实际代码中的 if 不具备原子性，上面的已经说过只是伪代码辅助理解 CAS，实际的 if 会可能存在之前说的内存可见性问题，这里我就不再展开解释了~

**CAS** 其实和前面的**乐观策略**是有一定联系：

> CAS 会先按照刚才读到的值长尝试修改，如果期间没人改它，那么就会成功；如果有人先改了，它再重新取，重新计算。
>

也就是失败的 CAS 不会接着完成，而是会在失败后再重试；

### 1.1 CAS 实现原子类

![](/article-assets/2026/javaee-multithreading-juc/images/08.png)

前面的典型操作，count++线程不安全，就需要加锁来解决问题。但是又认为，加锁效率比较低，于是就可以通过 CAS 来实现 count++，这样能确保性能，又同时保证线程安全~

标准库中提供了`java.util.concurrent.atomic`包，里面的类都是基于这种方式来实现的。典型的就是`AtomicInteger`类，其中的`getAndIncrement`相当于 i++操作；


![](/article-assets/2026/javaee-multithreading-juc/images/09.png)

实际只想给计数器加 1 时，直接使用原子类即可：

```java
AtomicInteger count = new AtomicInteger(0);
// 相当于 i++
int oldValue = count.getAndIncrement();
```

伪代码实现：

```java
// 原理伪代码，不是可直接运行的 AtomicInteger 源码
class AtomicInteger {
    private int value;

    public int getAndIncrement() {
        int oldValue = value;

        while (CAS(value, oldValue, oldValue + 1) != true) {
            oldValue = value;
        }

        return oldValue;
    }
}
```

假设 value 一开始是 0，我们按顺序看：

1. `oldValue = value`：先记下当前值 0。因为稍后要根据它计算新值，还要把这个旧值返回给调用者。
2. `CAS(value, oldValue, oldValue + 1)`：尝试确认共享值是否仍为 `oldValue`。如果仍是 0，就原子地改成 1，本次操作成功。
3. 如果 CAS 失败，就执行 `oldValue = value`，重新读取共享值。因为其他线程可能已经把它改了，原来的 oldValue + 1 也就不再是这次应该写入的结果。
4. 循环直到 CAS 成功，最后 `return oldValue`。返回的是这次成功加一之前的值，不是加一后的值。  
比如 A、B 都读到 0，A 先通过 CAS 把值改成 1。B 再拿“预期是 0”去尝试，就会失败。B 重新读到 1，下一轮尝试把 1 改成 2。如果成功，B 返回 1；最终共享值是 2。

> **注意**：代码里的 `CAS(value, …)` 是为了说明原理。普通 Java 方法接收一个 `int` 参数，不能仅靠这个参数原子地修改外部字段；这段也不能当作 JDK `AtomicInteger` 的实际源码来运行。写程序时直接使用标准库的 `AtomicInteger.getAndIncrement()` 即可。
>

### 1.2 用 CAS 实现自旋锁
前面学习过的自旋锁是指，线程暂时拿不到锁，就先不进入等待状态，而是在原地反复尝试。

**但问题是：两个线程都看见“锁没人持有”，又怎能保证只有一个线程拿到**

假设用 owner 记录锁的持有者：

+ `owner == null`：目前没人持有
+ `owner == 当前线程`：当前线程拿到了锁

线程 A 和 B 同时来时，都想把`owner`从`null`改成自己。这里不然能用普通的“先判断，再赋值”，因为两人可能都判断为`null`。于是用 CAS：

```java
owner.compareAndSet(null, 当前线程)
```

意思是，只有`owner`此刻仍然是`null`，才原子地把它改成当前线程。

假设 A 先成功，`owner` 就变成 A；B 再尝试时，发现它已经不是 `null`，因此失败。B 可以继续循环，等待 A 释放后再试。这就是 CAS 实现自旋锁的核心。Java 的 `AtomicReference.compareAndSet()` 正好提供对对象引用的这种操作。

下面是一段伪代码：

```java
public class SpinLock {
    private Thread owner = null;

    public void lock(){
        // 通过 CAS 看当前锁是否被某个线程持有。
        // 如果这个锁已经被别的线程持有，那么就自旋等待。
        // 如果这个锁没有被别的线程持有，那么就把 owner 设置为当前尝试加锁的线程。
        while(!CAS(this.owner, null, Thread.currentThread())){

        }
    }

    public void unlock (){
        this.owner = null;
    }
}
```

加锁操作中，就需要判定，锁是否被人占用；如果未被人占用，就把当前线程的引用设置到 owner 中；如果已经被人占用，就自旋等待。

由于循环体是空着的，整个循环速度非常快（忙等），但是一旦其他线程释放了锁，此时此刻线程就能第一时间拿到这里的锁。

### 1.3 CAS 的 ABA 问题
刚刚一直在判断，**“当前值和我先前读到的值，是否相等”**

但是“相等”**并不能证明**“中间从未被别人修改过”

这就像是你去买手机买电脑可能买到“翻新机、二手机”一样，经过翻新之后，机器外观看起来就和新机完全一样，实际上里面早就是不一样了~

CAS 中的 ABA 问题其实大部分情况下，即使出现了 ABA，最终的程序其实一般问题也不大。只有一些极端场景，ABA 问题才会产生一些严重 BUG

就比如取银行取钱：

假设账户里原本有 100 元，线程 1 和线程 2 都读取到了这个值，并且都准备把余额从 100 修改成 50。正常情况下，线程 1 先执行成功，把余额改成 50；等线程 2 再执行时，发现当前值已经不是自己之前读取的 100 了，所以 CAS 失败，这是我们期望的结果。

**但是如果在线程 2 执行之前，又有其他操作把账户余额从 50 重新改回了 100**，那么线程 2 再进行 CAS 时，会发现：

> 之前读取的值：100
>
> 当前的值：100
>

从数值上看没有发生变化，于是 CAS 会认为这个数据没有被修改过，并继续执行扣款。  

但实际上余额已经经历了：

> 100 → 50 → 100
>

#### ABA 问题解决
ABA 问题产生的原因，是 CAS 只会比较“当前值”和“之前读取到的值”是否相同，却无法判断这个值在中间有没有被修改过。

所以要解决 ABA 问题的常见思路，就是在原来的数据之外，再额外增加一个**版本号**。每次读取数据时，不仅要读取当前值，还要记录他对应的版本号；真正执行 CAS 时，也要同时比较数据和版本号。

> 比如账户余额一开始是 100 元，版本号是 1。线程 1 和线程 2 都读取到了“余额 100，版本号 1”。
>
> 随后线程 1 先执行扣款，把余额从 100 修改成 50，同时版本号从 1 增加到 2。之后又有人向这个账户转入 50 元，余额重新变回 100，但版本号会继续增加到 3。
>
> 这时候线程 2 再执行 CAS。虽然它之前读取到的余额是 100，而现在的余额也正好是 100，看起来数据没有发生变化，但线程 2 保存的版本号还是 1，而当前版本号已经变成了 3
>
> 因此版本号比较失败，这次 CAS 也就不会成功。
>

这样的话，即使数据经历了“100 → 50 → 100”，最终又回到了原来的值，我们仍然可以通过版本号发现，**这个数据中间其实已经被修改过了**。

所以，解决 ABA 问题的核心可以简单理解为：

> **普通 CAS 只比较值，而解决 ABA 问题后，需要同时比较“值 + 版本号”。**
>

Java 中提供了`AtomicStampedReference<E>`来实现这种思路，其中保存的数据可以理解为实际值，而`stamp`就相当于这个值对应的版本号。每次成功修改数据时，同时更新版本号，这样就可以判断数据在这期间是否发生过变化~

对应出现的相关面试题可能就会这样出：

1. 讲解一下你自己理解的 CAS 机制

> 全称 Compare and Swap，即“比较并交换”。相当于通过一个原子的操作，同时完成“读取内存，比较是否相等，修改内存”这三个步骤，本质上需要 CPU 指令的支撑
>

2. ABA 问题如何解决

> 给要修改的数据引入版本号。在 CAS 比较数据当前值和旧值的同时，也要比较版本号是否符合预期。如果发现当前版本号和之前读到的版本号一致，就真正执行修改操作，并让版本号自增；如果发现当前版本号比之前读到的版本号大，就认为操作失败
>

## 2.JUC 的常见类
JUC 是指`java.util.concurrent`及其相关包。其实前面用过的`AtomiciInteger`就属于 JUC；我就从里面两个主要的类讲一讲~

### 2.1 Callable 接口
在前面创建线程的时候，经常是将 Runnable 实例出一个 task 交给线程去执行。

```java
Runnable task = new Runnable() {
    @Override
    public void run() {
        // 执行任务
    }
};

Thread t = new Thread(task);
t.start();
```

 如果任务只是打印一句话，`Runnable`就很合适。但问题是，**如果子线程负责计算 1 到 1000 的和，主线程只能通过创建成员变量最后赋值才能拿到。**

```java
public class Demo {
    public static int total = 0;
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            int sum = 0;
            for (int i = 0; i <= 1000; i++) {
                sum += i;
            }
            total = sum;
        };
        Thread t = new Thread(task);
        t.start();
        t.join();
        System.out.println("total = " + total);
    }
}
```

但如果子线程有很多的话，还得自己管理**结果存放、等待条件和线程通知**，代码会很繁琐。

所以 **JUC 就提供了 `Callable<V>` 这样一个更贴合这类任务的接口**；

Callable 是一个 interface。`Callable<V>`描述“执行完后会产生一个 `V`类型结果”的任务，相当于把线程封装了一个“返回值”。方便给程序猿借助多线程的方式计算结果。

用`Callable`去完成上面一个计数代码是实现如下：

```java
public class Demo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        Callable<Integer> callable = new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
                int result = 0;
                for (int i = 0; i <= 1000; i++) {
                    result += i;
                }
                return result;
            }
        };
        FutureTask<Integer> futureTask = new FutureTask<>(callable);
        Thread t = new Thread(futureTask);
        t.start();
        System.out.println(futureTask.get());
    }
}
```

`Callable` 接口和 `Runnable` 接口是并列关系；`Callable<V>` 是要重写一个 `V call()`方法，而`Runnable`是要重写一个`void run()`方法。

使用`Callable`要注意，上面的代码有三个重要角色，

`Callable<Integer>`描述要做的计算，以及返回什么结果、

`FutureTask<Integer>`包装任务，记录它是否完成，并保存结果、

`Thread`真正安排新线程执行任务。

`Thread` **本身不提供获取结果的方法，所以就需要凭 `FutureTask` 对象来拿到结果。至于为什么 Thread 不能直接接收 `Callable` 对象，则是因为需要解耦合。**

`Thread` 就是线程，要和任务这个概念能剥离开。线程不需要关心任务是啥样的任务（是否有返回值）。

再补充一下上述关于`futureTask.get()`部分：

> 拿买麻辣烫举例。
>
> + `Callable`：交给后厨的制作任务。
> + 工作线程：做餐的厨师。
> + `FutureTask`：你拿到的取餐票。
> + `get()`：拿着票取餐。
>
> 你拿到取餐票时，麻辣烫**可能还没做好**。因此调用 `get()` 时：
>
> + **任务已经完成**：直接取到结果。
> + **任务还没完成**：当前调用 `get()` 的线程等待，直到有结果。
>
> 这里等待的是**调用 `get()` 的主线程**；负责计算的子线程仍在工作。`get()` 也只是等待并取结果，**不会替你启动任务**。所以如果忘了 `thread.start()`，却直接调用 `get()`，主线程就可能一直等下去。
>
> 还有一种情况：子线程在 `call()` 中计算失败、抛出异常。主线程调用 `get()` 时不会得到正常结果，而会收到 `ExecutionException`；如果主线程在等待期间被中断，则会收到 `InterruptedException`。
>

同时，上面也补充了一个之前没学习到的线程创建方法，通过传入`Callable`对象。这里再总结一下：

1. 继承 Thread（定义单独的类/匿名内部类）
2. 实现 Runnable（定义单独的类/匿名内部类）
3. lambda
4. 实现 Callable（定义单独的类/匿名内部类）
5. 线程池，ThreadFactory

### 2.2 ReentrantLock
ReentrantLock 即可重入互斥锁，是更经典风格的锁，与 synchronized 是并列关系。都是用来实现互斥效果，保证线程安全。

ReentrantLock 提供了三个方法：

+ lock()：加锁，如果获取不到锁就死等。
+ unlock()：解锁。
+ unlock(超时时间)：加锁，如果获取不到锁，等待一定的时间之后就放弃加锁。

它的基本加锁和解锁使用方式就像这样

```java
import java.util.concurrent.locks.ReentrantLock;

class Counter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();
        }
    }
}
```

+ `lock.lock()`：尝试取得锁。如果被其他线程持有，就等待取得它。只有 `lock()` 成功返回，才应进入负责释放这把锁的代码。
+ `try`：执行需要保护的 `count++`。
+ `finally`：无论代码正常结束还是抛出异常，都调用 `unlock()`。

`trylock()`**这个方法的话，就是抢不到就先不等。**

他不会阻塞，加锁成功返回 true，加锁失败返回 false。调用者判定返回值，决定接下来需要做什么~

它还可以设置超时时间，等待时间达到超时时间再返回 true/false

```java
import java.util.concurrent.TimeUnit;

if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try {
        count++;
    } finally {
        lock.unlock();
    }
} else {
    System.out.println("等了最多一秒，仍没拿到锁");
}
```

你可以想下面这样理解：

使用一间会议室

+ `lock()`：会议室有人，就等到空出来。
+ `tryLock()`：看一眼，有人就马上离开。
+ 限时 `tryLock()`：等一会儿，过了约定时间就改变安排。

但现在 synchronized 优化做的越来越好，优先还是使用 synchronized

这里的重点是 synchronized 和 ReentrantLock 之间区别：

1. synchronized 是关键字（内部是 JVM 通过 C++实现的），ReentrantLock 则是标准库的类（完全由 Java 编写的）
2. synchronized 通过代码块控制加锁解锁，ReentrantLock 需要 lock/unlock 方法，需要注意 unlock 不被调用的问题
3. ReentrantLock 除了提供 lock，unlock 之外还提供了一个方法 tryLock()
4. ReentrantLock 提供了公平锁的实现（默认是非公平的）
5. ReentrantLock 搭配的等待通知机制，是 Condition 类，相比 wait notify 来说功能更强大一些

### 2.3 信号量 Semaphore
前面了解到`synchronized`和`ReentrantLock`通常是在描述：同一时刻只允许一个线程进入。

而**信号量**就是为了**同一时刻，管理多份资源的工具**。

信号量，用来表示“可用资源的个数”，本质上就是一个计数器，你可以这样理解；

```java
Semaphore parking = new Semaphore(4);
```

这里的 4 表示的是一开始有 4 个表示可用许可，也可以理解为停车位：

| **发生的事** | **可用许可** |
| --- | --- |
| 停车场刚开放 | 4 |
| 第一辆车进入 | 3 |
| 第二辆车进入 | 2 |
| 又有两辆车进入 | 0 |
| 第五辆车尝试进入 | 等待 |
| 一辆车驶出 | 释放 1 个许可，等待的车有机会进入 |


我称其为“许可”，是因为`Semaphore`只管理可用数量，并不真的创建停车位对象。Java 文档也是按“取得一个许可，归还一个许可”来描述它的。

可以参考一下[Oracle官方文档](https://docs.oracle.com/en/java/javase/23/docs/api/java.base/java/util/concurrent/Semaphore.html)

#### 2.3.1 `acquire()`申请资源

`Semaphore`提供的其中一个方法，`acquire()`就是会先申请许可，再使用资源。在车进入停车场前，会先调用

```java
parking.acquire();
```

> 其含义就是，我要申请一个许可，拿到了，才能往下执行。
>
> 如果还有许可，可用数量减一，线程继续执行。如果许可已经用完，线程就等待，直到有其他线程归还许可；等待期间也可能因中断而抛出 `InterruptedException`。
>


![](/article-assets/2026/javaee-multithreading-juc/images/10.png)

所以说也可以称其为 P 操作。

信号量的一个特殊情况：初始值为 1 的信号量，取值要么是 1 要么是 0（二元信号量）。这就等价于“锁”

```java
public class Demo {
    public static void main(String[] args) throws InterruptedException {
        // 指定可用资源的个数是 "4"
        Semaphore semaphore = new Semaphore(3);
        semaphore.acquire();
        System.out.println("进行一次 P 操作");
        semaphore.acquire();
        System.out.println("进行一次 P 操作");
        semaphore.acquire();
        System.out.println("进行一次 P 操作");
        semaphore.acquire();
        System.out.println("进行一次 P 操作");
    }
}
```

#### 2.3.2 `release()`释放资源

在车离开停车场的时候就调用：

```java
parking.release();
```

可用许可增加一个，正在等待的线程便有机会取得它。这一步也就是所谓的**V 操作：归还一个许可，可用数量加一**。

注意：`Semaphore` 不会像 `ReentrantLock` 那样检查“是不是持有锁的那个线程”，对它来说，调用一次 `release()`，就只是把当前许可数量加 1。多调用一次 `release()`，许可数量就可能增加。就比如，原本只打算容纳 4 辆车，但没有申请资源的前提下使用了`release()`就会变为容纳 5 辆车。

所以代码里必须保证，**成功 `acquire()` 之后才 `release()`，并且用完一定归还。**

示例代码：

```java
public class Demo {
    public static void main(String[] args) {
        Semaphore parking = new Semaphore(4);

        Runnable car = new Runnable() {
            @Override
            public void run() {
                boolean acquired = false;

                try {
                    // 1. 先申请车位
                    parking.acquire();
                    acquired = true;

                    // 2. 拿到车位后，才能进入停车场
                    System.out.println(Thread.currentThread().getName() 
                            + " 进入停车场");

                    Thread.sleep(1000); // 模拟停车 1 秒
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();

                } finally {
                    // 3. 只有确实拿到车位，才归还车位
                    if (acquired) {
                        parking.release();
                        System.out.println(Thread.currentThread().getName() 
                                + " 离开停车场");
                    }
                }
            }
        };
        for (int i = 1; i <= 20; i++) {
            new Thread(car, "车辆" + i).start();
        }
    }
}
```

### 2.4 CountDownLatch
在上一节的`Semaphore`有一个计数器，用来表示，**现在还允许多少个线程进入**；

`CountDownLatch`也有计数器，但问题完全不同，它是**还有多少件事没完成？等它们全部完成，我才能继续**。

就拿跑步举例，还有多少件事没完成？等它们全部完成，我才能继续。

```java
CountDownLatch latch = new CountDownLatch(10);
```

这里的 10 表示的是还需要收到 10 次完成通知。

每次有一名选手结束比赛就调用`latch.countDown()`，计数器减 1，然后负责统计的线程调用`latch.await()`。

如果计数器还不是 0，那么这个线程就的等待；计数器到 0 之后，它才会继续执行。`countDown()`的调用者不用等其他选手，通知完就可以结束自己的工作。

过程能记为：

| 事件 | 剩余计数 |
| --- | --- |
| 比赛开始，等待 10 名选手 | 10 |
| 第一名完成任务 | 9 |
| 又有 8 名完成任务 | 1 |
| 最后一名完成任务 | 0 |
| 等待中的统计线程 | 可以继续 |


此处的计数器表示**剩余任务数**，不是“还有多少个名额可供使用”。这就是它和`Semaphore`最根本的区别。

虽然说这 10 个线程也可以分别 `join()`，但`CountDownLatch`更直接的地表达需求，“**我不关心逐个等待哪条线程；我要等待 10 项任务都发出完成通知**”

和信号量哪里可以相反的理解，`Semaphore` 问的是“现在还能进几个”；`CountDownLatch` 问的是“还差几个没完成”。

```java
public class Demo{
    public static void main(String[] args) throws InterruptedException {
        // 现在把整个任务拆成 10 个部分. 每个部分视为是一个 "子任务".
        // 可以把这 10 个子任务丢到线程池中, 让线程池执行.
        // 当然也可以安排 10 个独立的线程执行.

        CountDownLatch latch = new CountDownLatch(10);
        ExecutorService executor = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 10; i++) {  // 此处创建任务数要与latch个数相同
            int id = i;
            executor.submit(() -> {
                System.out.println("子任务开始执行: " + id);
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                System.out.println("子任务结束执行: " + id);
                latch.countDown();
            });
        }
        // 这个方法阻塞等待所有的任务结束
        // 此处的 a => all
        latch.await();
        System.out.println("所有任务执行完毕");
        executor.shutdown();
}
```

---

对于这一部分可能会出的面试题：

1. 线程同步的方式有哪些？

> `synchronized`、`ReentrantLock`、`Semaphore`、原子类等都可以用于线程同步。
>

2. 为什么有了`synchronized`还需要 JUC 下的 Lock？

> 以 JUC 的 `ReentrantLock` 为例：
>
> + `synchronized` 使用时不需要手动释放锁；`ReentrantLock` 使用时需要手动释放锁，使用起来更加灵活。
> + `synchronized` 在申请锁失败时，会一直等待；`ReentrantLock` 可以通过 `tryLock()` 的方式尝试获取锁，也可以等待一段时间后放弃。
> + `synchronized` 不提供公平锁机制；`ReentrantLock` 默认是非公平锁，也可以通过构造方法传入 `true` 开启公平锁模式。
> + `synchronized` 可以通过 `Object` 的 `wait()` / `notify()` 实现等待与唤醒；`ReentrantLock` 可以搭配 `Condition` 实现等待与唤醒，并且能够更加精确地控制不同等待队列中的线程。
>

3. `AtomicInteger` 的实现原理是什么？

> 基于 CAS 机制，伪代码如下：
>

```java
class AtomicInteger {
    private int value;

    public int getAndIncrement() {
        int oldValue = value;

        while (!CAS(value, oldValue, oldValue + 1)) {
            oldValue = value;
        }

        return oldValue;
    }
}
```

4. 信号量是什么？一般应用在哪些场景？

> 信号量，用来表示“可用资源的个数”。本质上就是一个计数器
>
> 使用信号量可以实现“共享锁”。比如某个资源允许 3 个线程同时使用，那么就可以使用 P 操作作为加锁，V 操作作为解锁，前三个线程的 P 操作都能顺利返回，后续线程再进行 P 操作就会阻塞等待，直到前面的线程执行了 V 操作。
>

5. 解释一下 ThreadPoolExecutor 构造方法的参数的含义

> 参考另一篇“多线程：应用案例”
>

