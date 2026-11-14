---
title: Java 并发进阶（三）：线程安全容器与并发集合
permalink: /posts/javaee-multithreading-collections/javaee-multithreading-collections/
description: 掌握多线程环境下ArrayList、队列与哈希表的线程安全方案及常用并发集合实现.
date: 2026-09-30
published: 2026-09-30
updated: 2026-09-30
categories:
  - 开发
  - Java SE
tags:
  - Java
  - Java SE
  - 多线程
image: /article-assets/2026/javaee-multithreading-collections/images/thread.png
---

## 1.线程安全的集合类
### 1.1 多线程下使用 `ArrayList`
前面我们对 count++这样的共享变量使用 synchronized 来保护，如果面对的是这样：

```java
List<String> names = new ArrayList<>();
```

显然如果是在多线程，就不能直接调用 add()了。毕竟本身`ArrayList`也不负责同步。在多个线程同时访问下，并且至少有一个线程修改集合结构时，还需要另外的同步措施。否则就会出现结果不正确，遍历的时候也可能遇到并发修改问题。

下面是介绍三种在多线程下使用 ArrayList 方法

#### 自己使用同步机制（synchronized 或者 ReentrantLock）
所有访问都遵守同一规则

```java
List<String> names = new ArrayList<>();
Object lock = new Object();

synchronized (lock) {
    names.add("张三");
}

synchronized (lock) {
    for (String name : names) {
        System.out.println(name);
    }
}
```

之所以读的时候也要用同一把锁，是因为如果一个线程正在遍历，另一个线程却同时修改，遍历过程就可能受到干扰。

所以此处的关键就是“同一个集合、同一把锁”。如果添加时锁`lockA`，遍历时锁 `lockB`，两个线程仍然可能同时操作集合；这两把锁不会替彼此协调。

自己加锁能用，但项目里每个访问位置都要守规矩，漏掉一处，前面的保护就可能失效~

#### `Collections.synchronizedList()`包装
给原集合套一层同步包装

```java
List<String> names =
        Collections.synchronizedList(new ArrayList<>());

names.add("张三");
names.add("李四");
```

可以理解为，原来的`ArrayList`外面加了一层“门卫”。调用包装后的`name.add()`等方法时，由包装对象去负责同步。

创建时就包装的原因，是因为后续代码应该统一返回的`names`访问集合。如果有人绕过包装对象，直接去操作原始`ArrayList`，这层同步就管不到他了。

注意：遍历仍需要自己在包装对象上加锁

```java
synchronized (names) {
    for (String name : names) {
        System.out.println(name);
    }
}
```

但问题是，都说是**线程安全的包装**了，为什么遍历还要加锁？在学到这里的时候我也很困惑

主要是因为，遍历不是一次调用，耳熟“取得迭代器、检查有没有下一个，读取下一个......”的一连串动作。包装类能同步单次方法调用，却不能自动保证整个遍历期间没有其他线程插入修改。所以在官方文档中明确要求了并发遍历时，在返回的集合对象上手动同步~

这部分我就不再详细解释了，可以复制这部分问 AI 给出详细答案~

#### `CopyOnWriteArrayList`写入时复制
这个方法叫写时复制

```java
List<String> names = new CopyOnWriteArrayList<>();

names.add("张三");
names.add("李四");
```

**举个例子：**

假设大家都在阅读一份名单，此时有人要修改名单：

+ `synchronized`的思路更像，修改和阅读要协调使用同一份名单。
+ `CopyOnWriteArrayList`的思路则是，写入时制作一份**新的底层数组**，**在新数组上完成修改**，**再让后续读取使用新版本**；已经开始的遍历继续看它原来的版本。

这样的目的是为了让读者遍历时不必因写入而打断当前遍历。代价则是每次写入都要复制底层数组，集合大、写入频繁时成本会高，官方文档也把它定位在遍历远多于修改的场景。

```java
// 用代码观察“旧遍历看到的旧版本”：
CopyOnWriteArrayList<String> names = new CopyOnWriteArrayList<>();
names.add("张三");

Iterator<String> iterator = names.iterator();
names.add("李四");
while (iterator.hasNext()) {
    System.out.println(iterator.next());
}
System.out.println(names);
```

这段代码里，`iterator`是添加“李四”之前创建的，所以它遍历的是当时的快照，只打印“张三”；最后直接打印当前`names`，则能看到“张三”和“李四”。

注意“新写的数据不能第一时间读取到”，**是已经创建的旧的迭代器不会看到后续修改**；并不是说以后重新读取集合，也一直看不到新数据。



**再补充一个例子：**

假设当前底层数组是，`[1, 2, 3, 4]`

此时一个线程正在读取这个数组，而另一个线程准备修改数据，例如把 `1` 修改成 `100`。

`CopyOnWriteArrayList` 并不会直接在原来的数组上修改，而是先复制出一份新的数组，再在新数组上完成修改


![](/article-assets/2026/javaee-multithreading-collections/images/11.png)

也就是，复制和修改新数组的这段时间里，旧数组并不会发生变化。因此此时其他正在读取的线程仍然可以继续读取旧版本的数据，并不会因为写线程正在复制、修改而被阻塞。

等新的数组复制、修改完成之后，`CopyOnWriteArrayList`才会把自己内部保存的**数组引用切换到新数组**。

实际实现中，`CopyOnWriteArrayList`保存底层数组的引用具有相应的**内存可见性保证**，因此新数组准备完成以后再发布出去。这样读线程看到的要么是完整的旧版本，要么是完整的新版本，而不是一个“修改了一半”的中间状态。

不过，这里要区分一下两种“读取”：

+ **普通读取在新数组发布以后，后续就可以读取到新数据**
+ **但是已经创建好的迭代器比较特殊，他会一直持有创建那一刻的数组快照~**

很明显，上面的方案也有**缺点**：

1. 数组特别大时，非常低效
2. 如果多个线程同时修改，也容易出问题

只能适用于特定场景，比如服务器进行重新加载配置的时候......

我导出了一份对比：

| **方式** | **核心做法** | **注意** |
| --- | --- | --- |
| 自己加锁 | 所有相关访问使用同一把锁 | 不能漏掉访问位置 |
| `synchronizedList` | 包装常用集合方法 | 并发遍历仍需手动同步 |
| `CopyOnWriteArrayList` | 修改时复制底层数组 | 适合读多写少；旧迭代器只看旧快照 |


综上，集合的“线程安全”，看`add()`会不会冲突，还要看遍历、复合操作，以及读写同时发生时应当看到哪个版本。

### 1.2 多线程下使用队列
**（该小节利用 AI 进行整理）**

现在把共享资源换成队列

**举个例子：**

假设一家奶茶店，前台负责接单，后厨负责制作。前台接到订单以后，会先把订单放到等待区，后厨再从等待区取出订单进行处理。

这里的等待区，就可以理解为一个队列：

+ **生产者**：负责往队列里放入任务，比如前台提交订单。
+ **消费者**：负责从队列里取出任务，比如后厨取走订单。

但问题是，如果没有订单，后厨怎么办？如果等待区已经满了，前台还能继续放吗？

这就需要用到**阻塞队列**，Java 中对应的接口是：

```java
BlockingQueue<E>
```

不仅负责线程安全地存取元素，还提供了条件不满足时等待的操作：

```java
queue.put(task);    // 放入元素，没有空位时等待
Task task = queue.take(); // 取出元素，没有元素时等待
```

注意，**阻塞的是调用方法的那个线程**。比如消费者在等订单，生产者仍然可以提交订单；有了订单以后，消费者才有机会继续执行。

不过，阻塞队列也不是所有方法都会等待，这里可以先做一个区分：

| 操作 | 方法 | 暂时无法完成时 |
| --- | --- | --- |
| 放入元素 | `put(e)` | 等待空位 |
| 取出元素 | `take()` | 等待元素 |
| 放入元素 | `offer(e)` | 没有空位就返回 `false` |
| 取出元素 | `poll()` | 没有元素就返回 `null` |


所以具体是等待还是直接返回，要看调用的方法，而不能只看它是不是“阻塞队列”~

下面介绍三种队列。

#### `ArrayBlockingQueue`
这个名字可以拆开理解：

`Array`：底层使用数组。

`BlockingQueue`：支持阻塞操作的队列。

```java
BlockingQueue<String> orders =
        new ArrayBlockingQueue<>(2);
```

这里的 `2` 表示，**队列里最多存放两个元素**。

它属于**有界队列**，创建时必须指定容量，而且创建以后容量就固定了，不会像 `ArrayList` 一样自动扩容。元素按照**先进先出**的顺序取出。

**举个例子：**

假设奶茶店的等待区只能放两张订单：

```java
orders.put("订单1");
orders.put("订单2");

boolean success = orders.offer("订单3");
System.out.println(success); // false
```

前两次 `put()` 可以成功，因为队列还有空位。

但第三张订单放不进去，所以这里的 `offer()` 返回 `false`。之所以使用 `offer()`，是为了观察“队列满了”的结果，同时让当前线程还能继续往下执行。

如果改成：

```java
orders.put("订单3");
```

当前线程就会等待，直到其他线程取走一个元素，腾出空位。

**再补充一个例子：**

接着前面的队列，先取走一张订单，再放入第三张：

```java
String firstOrder = orders.take();
System.out.println(firstOrder); // 订单1

orders.put("订单3");

System.out.println(orders.take()); // 订单2
System.out.println(orders.take()); // 订单3
```

之所以先取出“订单1”，是因为它最早进入队列。取出以后，队列空出一个位置，“订单3”才能放进去。

不过，这里要区分一下：

**队列容量限制的是队列中等待的元素数量，不是线程数量，也不是所有未完成任务的数量。**

比如后厨取走“订单1”以后，虽然还没制作完成，但这张订单已经离开队列了，因此队列可以接收新的订单。

另外，上面的 `put()`、`take()` 需要处理或者声明 `InterruptedException`。练习时可以把代码放在声明了该异常的 `main()` 中：

```java
public static void main(String[] args)
        throws InterruptedException {
    // 示例代码
}
```

因为等待期间可能被中断，所以这两个方法要求我们考虑这种情况。

#### `LinkedBlockingQueue`
和前面的数组队列相比，`LinkedBlockingQueue` 底层使用的是**链表节点**，同样按照**先进先出**的顺序取出元素。

它也可以指定容量：

```java
BlockingQueue<String> orders =
        new LinkedBlockingQueue<>(100);
```

这里表示，队列最多存放一百张订单。达到容量以后，再调用 `put()`，生产者就需要等待。

不过，它还可以这样创建：

```java
BlockingQueue<String> orders =
        new LinkedBlockingQueue<>();
```

没有传入容量，那是不是就能无限存放元素了？

显然不是。不指定容量时，默认容量是 `Integer.MAX_VALUE`，也就是 `2147483647`。

所以不能简单理解为“链表可以不断增加节点，队列就永远不会满”。

**举个例子：**

假设前台每秒接一百张订单，但后厨每秒只能完成十张。如果一直按照这个速度运行，等待区中的订单就会越积越多。

没有设置合适的容量上限时，程序可能持续接收任务，直到积压的数据占用大量内存。

因此，创建时指定容量的意义，不只是决定能放多少元素，也是为了让生产者在积压达到上限时先等待，给消费者处理任务的时间。

它的基本使用方式和前面一样：

```java
BlockingQueue<String> orders =
        new LinkedBlockingQueue<>(2);

orders.put("订单1");
orders.put("订单2");

System.out.println(orders.take()); // 订单1
System.out.println(orders.take()); // 订单2
```

可以发现，换成链表实现以后，生产者和消费者仍然通过 `put()`、`take()` 配合，不需要重新写一套等待与通知逻辑~

#### `PriorityBlockingQueue`
**按优先级取出的阻塞队列**

前面两种队列都是先进先出，但有些场景并不适合只按进入顺序处理。

**举个例子：**

医院接诊时，普通患者虽然来得早，但后来送来的急救患者，可能需要优先处理。

这时就需要：

```java
PriorityBlockingQueue
```

它会根据**元素的自然顺序**或者我们提供的**比较器**，决定下一次取出哪个元素。

先用整数观察：

```java
BlockingQueue<Integer> queue =
        new PriorityBlockingQueue<>();

queue.put(30);
queue.put(10);
queue.put(20);

System.out.println(queue.take()); // 10
System.out.println(queue.take()); // 20
System.out.println(queue.take()); // 30
```

明明 `30` 先放进去，为什么却先取出 `10`？

因为对于 `Integer`，默认的自然顺序是从小到大。因此这里先取出最小的元素，而不是最早进入队列的元素。

所以，“优先级高”并不一定表示数字大，具体含义要由排序规则决定。

如果希望数字越大越先取出，可以提供一个比较器：

```java
BlockingQueue<Integer> queue =
        new PriorityBlockingQueue<>(
                10,
                new Comparator<Integer>() {
                    @Override
                    public int compare(Integer a, Integer b) {
                        return Integer.compare(b, a);
                    }
                }
        );
```

这里把比较顺序反过来，因此放入 `30、10、20` 后，取出顺序就是 `30、20、10`。

不过，构造方法中的 `10` 要特别注意：

**它表示初始容量，不是最多只能存放十个元素。**

`PriorityBlockingQueue` 是逻辑上的**无界队列**，可以扩容。放入元素时，不会因为达到某个固定容量上限而等待，但仍然受到实际内存的限制；队列为空时，调用 `take()` 则会等待。

**再补充一个容易混淆的地方：**

假设消费者已经取走一个普通任务，正在执行。此时又放入了一个紧急任务，队列并不会把正在执行的任务强行中断。

优先级影响的是**下一次从队列中取出哪个任务**，并不代表可以抢占已经开始执行的任务。

另外，观察优先顺序时，应该看连续调用 `take()` 或 `poll()` 的结果。直接使用 `for-each` 遍历，**不保证按照优先级顺序输出**；相同优先级的元素，也不保证按照进入顺序取出。

我整理了一份对比：

| 队列 | 底层结构 | 容量特点 | 取出顺序 |
| --- | --- | --- | --- |
| `ArrayBlockingQueue` | 数组 | 必须指定容量，创建后固定 | 先进先出 |
| `LinkedBlockingQueue` | 链表 | 可以指定容量，默认是 `Integer.MAX_VALUE` | 先进先出 |
| `PriorityBlockingQueue` | 堆 | 逻辑上无界，构造参数是初始容量 | 按自然顺序或比较器决定 |


### 1.3 多线程下使用哈希表
首先需要知道 HashMap 本身不是线程安全的

而在多线程环境下使用哈希表可以使用：

+ Hashtable
+ ConcurrentHashMap

我们已经讨论过多线程下使用数组、队列，那么现在就轮到哈希表了。

首先，我给一个使用环境，比如我们想统计每篇博客的访问次数：

```java
map.put("Java多线程", 100);
map.put("MySQL事务", 200);
```

如果是只有一个线程操作，问题不大。但如果是在服务器里，多个用户同时访问，就有可能多个线程同时操作这张哈希表。

这部分我打算主要介绍这两个类：`Hashtable`和`ConcurrentHashMap`

#### HashMap 不负责线程同步
先来回忆一下哈希表，往 `HashMap` 里放一个键值对，不只是简单地给变量赋值，就像这样`map.put("张三", 90)`

内部还需要有这几步：

1. 根据 key 的哈希值，确定放在哪个桶
2. 查看桶里有没有已有的元素
3. 判断是新增键值对，还是替换已有值
4. 必要时调整结构、更新数量，甚至扩容

如果是两个线程同时修改这些内部数据，而且还没有同步措施，就可能相互干扰~

**所以必须先强调：`HashMap` 本身不是线程安全的。**

多个线程共享它，并且存在并发修改时，需要额外的同步措施，Java 文档也明确了这一点。

最直接的办法是，像前面提到的`ArrayList`一样

```java
Map<String, Integer> scores = new HashMap<>();
Object locker = new Object();

synchronized (locker) {
    scores.put("张三", 90);
}

synchronized (locker) {
    Integer score = scores.get("张三");
}
```

注意，**需要协调的访问，都遵循同一把锁的规则**。由于每次操作都需要自己写同步代码，所以 Java 就提供了接下来要说到的**现成的同步实现**。

#### `Hashtable`把关键方法加锁
使用的方式还是比较熟悉的

```java
Map<String, Integer> scores = new Hashtable<>();
scores.put("张三", 90);
scores.put("李四", 85);
System.out.println(scores.get("张三"));
```

其基本思路可以理解为，给`get()`、`put()`、`remove()`等关键方法加上`synchronized`.

这些实例方法加锁，**锁的是当前 Hashtable 对象**。

所以多线程调用同一个对象的这些方法，竞争的是同一把锁。`Hashtable` 是一个提供同步的 Map 实现。


![](/article-assets/2026/javaee-multithreading-collections/images/12.png)

当你点入标准库中的 Hashtable 你会发现，它的大部分方法就是在前面加上了`synchronized`，没错就是硬上锁。所以它的结构就如同下面这样：


![](/article-assets/2026/javaee-multithreading-collections/images/13.png)

一个`Hashtable`只有一把锁，两个线程访问`Hashtable`中的任意数据都会出现锁竞争。

另外，一旦触发扩容，该线程就会完成整个扩容过程，这个过程涉及到大量的元素拷贝，效率会非常低。

所以就引出了`ConcurrentHashMap`

#### `ConcurrentHashMap`缩小需要互斥的范围
使用方法还是类似：

```java
ConcurrentHashMap<String, Integer> scores =
        new ConcurrentHashMap<>();

scores.put("张三", 90);
scores.put("李四", 85);
System.out.println(scores.get("张三"));
```

它在设计时就考虑了多线程并发访问。

由于上面的`Hashtable`采用的是整体置锁，因此`ConcurrentHashMap`采用**另外的方式**进行置锁以保证减少锁竞争问题，达到效率的提高。

我们知道，在哈希表中，底层那个数组中，每一个位置都可以视为桶，也就是说一个哈希表有许多桶组成（如果忘记这点 可以看看 JavaSE 篇中的内容）

`ConcurrentHashMap`**要解决的就是，在我们操作哈希表时，减少其中的锁竞争。**

我们知道，针对不一样的 key 可能会落入不同的哈希桶中，当然也有可能落入同一个桶中。

假设现在：

+ A 修改桶 0 中的数据。
+ B 修改桶 1 中的数据。

**既然它们修改的主要结构互不相同，就可以尽量允许它们并发执行。**

+ C 修改桶 2 中的王五。
+ D 修改桶 2 中的赵六。

**虽然 key 不同，但它们操作的是同一个桶，就可能需要互斥。**

于是乎，在 Java5~Java7 阶段`ConcurrentHashMap`使用了分段锁的思想，缩小了锁保护的范围，降低了不同操作争抢同一把锁的概率。

> 它主要协调的是不同的桶之间的关系，你不能记成 key 不同，就一定不会产生锁竞争；更准确的是，**落在不同的桶里的修改，通常更有机会并发执行。**
>

再说明一下分段锁：

> 也就是说在 Java5~Java7 阶段，一开始是多个桶放一把锁。用官方的描述是“多个桶被划分到一个 `Segment` 中，一个 `Segment` 对应一把锁。”
>

这还是比较好理解的，就比如**锁 1 被分配在桶 1,2,3,4,5,6** ，然后**锁 2 被分配在桶 7,8,9,10,11**......以此类推

OpenJDK 7 的源码注释直接写明，哈希表被划分为多个 `Segment`，每个 `Segment` 自己又是一个哈希表。（具体参考论述可以追踪到[OpenJDK7](https://github.com/openjdk-mirror/jdk7u-jdk/blob/master/src/share/classes/java/util/concurrent/ConcurrentHashMap.java)）

但上述问题是，锁粒度还是有些大，就比如桶 1 与桶 2 之间还会有可能存在锁竞争。

于是在 Java8`ConcurrentHashMap` 做了一次非常大的重构，直接取消了 `Segment` 作为主要并发结构。而变成`Node<K,V>[] table`，结构更像普通的`HashMap`。也就是将锁粒度缩小到桶级别，并将桶的头节点作为`synchronized`的锁对象。


![](/article-assets/2026/javaee-multithreading-collections/images/14.png)

在 Java8 中是能不用锁尽量不用锁。

源码中还专门提及过“向空桶插入第一个节点时直接通过 CAS 完成。”

对了，读操作`get()`没有加锁，配合`volatile`保证了可见性。



另外再强调一个地方，就是**关于扩容**部分的优化：

> 对于 `ConcurrentHashMap`，可以这样理解，**把迁移工作拆成若干段，允许多个线程领取不同的部分，协作完成迁移。**
>

扩容过程中，新旧数组会暂时同时存在。

但并不是每次查询都把两张表完整查一遍。

> 关键在于，**某个旧桶迁移完成以后，会留下一个转发节点，告诉后续操作去新表找。**
>

**关于迁移要注意这几个点**

+ **并不是每个访问线程都会参与搬迁。** 例如，`get()` 可以根据转发节点去新表查找，不负责帮助迁移。
+ **并不是每个线程只搬固定几个元素就结束。** 迁移按桶区间分配，参与线程可能完成多批工作。
+ **扩容期间，插入也不是一律只操作新表。** 尚未迁移的桶仍可能在旧表处理；遇到已迁移的桶，才转向新表。

全部迁移完成以后，当前表切换为新表。旧数组在不再被引用后，由垃圾回收处理。



（重点）`ConcurrentHashMap`对`HashMap`的核心优化点：

1. 把锁整个表 -> 锁桶，以及读操作不加锁
2. 充分利用 CAS 特性，针对 size 属性通过 CAS 更新，避免出现重量级锁
3. 优化**扩容方式**以及**化整为零**（把 锁整个表 → 锁桶 就是锁粒度的化整为零）



