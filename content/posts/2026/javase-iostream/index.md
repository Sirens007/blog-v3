---
title: Java 文件与 I/O 流：File、字节流、字符流与文件操作
permalink: /posts/javase-iostream/javase-iostream/
description: 梳理 File 文件与目录操作、字节流和字符流的常用 API、资源关闭与字符编码，并通过目录扫描、文件复制和内容搜索案例练习文件操作。
date: 2026-10-06
published: 2026-10-06
updated: 2026-10-06
categories:
  - 开发
  - Java SE
tags:
  - Java SE
  - I/O 流
  - 文件操作
image: /article-assets/2026/javase-iostream/images/cover.webp
---

**从开发的角度，文件分为两类**

1. 文本文件
2. 二进制文件

> 文本文件是指，文件中的数据按照某种字符编码（UTF-8、GBK）存储，本质上是一系列字符。当然，字面意思就是，文件里保存的是**人可以直接阅读的文字**。
>

> 二进制文件是指，文件中的数据以二进制形式直接保存，不按照字符编码解析。
>

Java 标准库中提供了一系列的类操作文件

+ 文件系统操作（创建文件、删除文件、重命名、创建目录）
+ 文件内容操作（针对一个文件的内容进行读和写）

Java 中通过`java.io.File`类对一个文件（包括目录）进行抽象的描述。注意，有 File 对象，并不代表真实存在该文件。

## 1.File 概述
### 属性
| **修饰符及类型** | **属性** | **说明** |
| --- | --- | --- |
| `static String` | `pathSeparator` | 依赖于系统的路径列表分隔符，以 `String`类型表示 |
| `static char` | `pathSeparatorChar` | 依赖于系统的路径列表分隔符，以 `char`类型表示 |


### 构造方法
| **签名** | **说明** |
| --- | --- |
| `File(File parent, String child)` | 根据父目录的 `File`对象和子路径，创建新的 `File`实例 |
| `File(String pathname)` | 根据路径创建新的 `File`实例，路径可以是绝对路径或相对路径 |
| `File(String parent, String child)` | 根据父目录路径字符串和子路径，创建新的 `File`实例 |


String 类型的参数是文件的路径，使用绝对/相对路径均可~

### 方法
| **返回值类型** | **方法签名** | **说明** |
| --- | --- | --- |
| `String` | `getParent()` | 返回父路径；没有父路径时返回 `null` |
| `String` | `getName()` | 返回文件或目录的名称 |
| `String` | `getPath()` | 返回 `File`对象描述的路径 |
| `String` | `getAbsolutePath()` | 返回绝对路径 |
| `String` | `getCanonicalPath()` | 返回规范化的绝对路径 |
| `boolean` | `exists()` | 判断对应的文件或目录是否真实存在 |
| `boolean` | `isDirectory()` | 判断对应的对象是否为目录 |
| `boolean` | `isFile()` | 判断对应的对象是否为普通文件 |
| `boolean` | `createNewFile()` | 创建空文件；成功创建返回 `true`，目标已存在返回 `false` |
| `boolean` | `delete()` | 删除文件或空目录；成功返回 `true` |
| `void` | `deleteOnExit()` | 登记在 JVM 正常退出时尝试删除对应的文件或目录 |
| `String[]` | `list()` | 返回目录中直接子文件和子目录的名称 |
| `File[]` | `listFiles()` | 返回目录中直接子文件和子目录对应的 `File`对象 |
| `boolean` | `mkdir()` | 创建目标目录，不创建缺失的父目录 |
| `boolean` | `mkdirs()` | 创建目标目录，必要时一并创建缺失的父目录 |
| `boolean` | `renameTo(File dest)` | 重命名或移动到目标路径；成功返回 `true` |
| `boolean` | `canRead()` | 判断当前程序是否可以读取对应的文件或目录 |
| `boolean` | `canWrite()` | 判断当前程序是否可以写入对应的文件或目录 |


## 2. 文件内容的读写--数据流
Java 中提供了几十个这样的流，在此我只讲解其中 8 个就足够了~

针对上述几十个流，分成两个大类别：

1. **字节流** 读写文件，以字节为单位。是针对二进制文件使用的
    1. InputStream 输入
    2. OutputStream 输出
2. **字符流** 读写文件，以字符为单位。是针对文本文件使用的
    1. Reader 输入
    2. Writer 输出

关于判断输入输出的方法：

屁股坐在 CPU 上，迎面而来是输入，离你而去是输出。

###  InputStream 概述
**方法**

| 修饰符及返回值类型 | 方法签名 | 说明 |
| --- | --- | --- |
| int | `read()` | 读取一个字节的数据，返回 `-1`代表已经完全读完了 |
| int | `read(byte[] b)` | 最多读取 `b.length`字节的数据到 `b`中，返回实际读取的数量，`-1`代表已经读完了 |
| int | `read(byte[] b, int off, int len)` | 最多读取 `len - off`字节的数据到 `b`中，放在从 `off`开始的位置，返回实际读取的数量，`-1`代表已经读完了 |
| void | `close()` | 关闭字节流 |


注意：

`InputStream` 只是一个抽象类，要使用还需要具体的实现类。关于 `InputStream` 的实现类有很多，基本可以认为不同的输入设备都可以对应一个 InputStream 类，现在只关心从文件中读取，所以使用 `FileInputStream`（`InputStream` 的子类）

### FileInputStream 概述
**构造方法**

| 签名 | 说明 |
| --- | --- |
| `FileInputStream(File file)` | 利用 `File`构造文件输入流 |
| `FileInputStream(String name)` | 利用**文件路径**构造文件输入流 |


`InputStream inputStream = new FileInputStream("路径")`当此处创建对象操作一旦成功，就相当于“打开文件”，同样还有关闭文件的方法，`inputStream.close()`

虽然在 Java 中只需要申请内存资源即可，释放交给 GC 自动完成。但是，文件资源不等同于内存资源，虽然 GC 能够自动管理内存，但是不能自动管理文件，需要我们手动释放。若不手动释放，就会引起“文件资源泄露”，也就是俗话说的“占着茅坑不拉屎”

因为 进程 -> PCB -> 文件描述符表

每次程序打开一个文件，就会在文件描述符表（固定长度的顺序表）中申请一个表项（占个坑），然后如果光打开不关闭，就会使这里的文件描述符表的表项耗尽。后续再次打开就会失败~

至于为什么文件描述符表不能自动扩容，因为如果这么做的话，会更推进一步去加大内存操作中的不可控的因素~

**注意：**

另外，再补充一处，关于 InputStream 创建对象的时候一般使用 try-with-resource（Java1.5 引入的语法，我在 JDBC 也已经讲过） 去包裹。以保证最终走出 try 代码块的时候能够自动关闭并释放。（可以不只实现一个对象~）

**强调：能使用此方法创建的类必须实现 Closable 接口**

使用例子如下：

```java
public static void main(String[] args) throws IOException {
    try (InputStream inputStream 
         = new FileInputStream("./test.txt")) {
        while (true) {
            int data = inputStream.read();
            if(data == -1) {
                // 文件读完
                break;
            }
            System.out.printf("0x%x\n",data);
        }
    }
}
```

IntputStream 中的三个 read 方法

| 方法 | 含义 | 返回值 |
| --- | --- | --- |
| `read()` | 一次读取 1 个字节 | 字节值 `0~255`，结束返回 `-1` |
| `read(byte[] b)` | 一次读取多个字节 | 实际读取的**字节数**，结束返回 `-1` |
| `read(byte[] b, int off, int len)` | 读取数据到数组指定位置 | 实际读取的**字节数**，结束返回 `-1` |


对于无参数的 read 方法，如果没读完就会返回读到的字节值，读完了就返回-1

注意：剩下两个有参数的 read 返回的是读取到的字节数。仔细想想会比较特殊，它使用的是 参数作为方法的返回值~ 在 Java 中比较少见，这种称之为“输出型参数”。一般来说，把方法想象成工厂，返回值就是产品；

```java
public static void main(String[] args) throws IOException {
    try (InputStream inputStream 
         = new FileInputStream("./test.txt")) {
        while (true) {
            byte[] data = new byte[1024];
            int n = inputStream.read(data);
            if (n == -1) {
                // 文件读完
                break;
            }
            for (int i = 0; i < n; i++) {
                System.out.printf("0x%x\n",data[i]);
            }
        }
    }
}
```

Java 中，如果参数是引用类型，方法内部修改对象的时候，能影响到方法外部~ 即：

> 当方法参数是引用类型时，方法拿到的是“对象引用的副本”。虽然引用本身是复制的，但这个副本和方法外面的引用仍然指向同一个对象，所以通过它修改对象内部的数据，外面能看到变化。
>

对于第三个 read 方法：`read(byte[] b, int off, int len)`

其中 off 是指 offset 偏移量（数组下标），放置 len 数量个~

### OutpuStream 概述
**方法**

| 修饰符及返回值类型 | 方法签名 | 说明 |
| --- | --- | --- |
| `void` | `write(int b)` | 写入一个字节的数据 |
| `void` | `write(byte[] b)` | 将 `b`这个字节数组中的数据全部写入输出流中 |
| `void` | `write(byte[] b, int off, int len)` | 将字节数组 `b`中从 `off`位置开始的 `len`个字节写入输出流中 |
| `void` | `close()` | 关闭字节输出流，并释放与该流相关的系统资源 |
| `void` | `flush()` | 刷新输出流，将缓冲区中尚未真正写出的数据立即写入目标设备 |


说明一下：`OutputStream` 同样只是一个抽象类，要使用还需要具体的实现类。我们现在还是只关心写入文件中，**所以使用** `FileOutputStream`

此处的 writer 方法与前面的 read 方法类似，分为单个字节写入，多个字节写入以及多个字节拼接写入~

另外，对于`OutputStream` 来说，默认情况下会默认创建该文件。并且是以覆盖形式去写入。如果想要避免此情况，就需要使用追加写，**即使用该构造方法**`FileOutputStream(File file, boolean append)`

### FileOutputStream 概述
构造方法：

| 构造方法 | 说明 |
| --- | --- |
| `FileOutputStream(String name)` | 根据文件路径创建字节输出流。文件不存在会创建；文件已存在会**清空原内容** |
| `FileOutputStream(String name, boolean append)` | 根据文件路径创建字节输出流，并指定是否追加写入 |
| `FileOutputStream(File file)` | 根据 `File` 对象创建字节输出流。文件已存在时会**清空原内容** |
| `FileOutputStream(File file, boolean append)` | 根据 `File` 对象创建字节输出流，并指定是否追加写入 |
| `FileOutputStream(FileDescriptor fdObj)` | 根据已有的文件描述符创建输出流，实际开发中较少直接使用 |


```java
public static void main(String[] args) {
        try (OutputStream outputStream = new FileOutputStream("./output.txt")){
            byte[] bytes = {97,98,99};
            outputStream.write(bytes);

        } catch (IOException e) {
            // 此处是需要处理两个异常. 由于此处并没有针对这两个异常提供不同的处理, 就直接合并了.
            throw new RuntimeException(e);
        }
    }
```

### Reader 概述
构造方法：

| 修饰符 | 构造方法 | 说明 |
| --- | --- | --- |
| `protected` | `Reader()` | 创建一个新的字符输入流对象，默认以当前 Reader 对象作为同步锁 |
| `protected` | `Reader(Object lock)` | 创建字符输入流，并指定用于同步操作的锁对象 |


因为他们是`protected`，而且`Reader`是抽象类,**所以通常不直接使用这两个构造方法**。



方法：

| 返回值类型 | 方法 | 说明 |
| --- | --- | --- |
| `int` | `read()` | 一次读取**一个字符**，读取到末尾返回 `-1` |
| `int` | `read(char[] cbuf)` | 一次读取多个字符到字符数组中，返回实际读取的字符数量；末尾返回 `-1` |
| `int` | `read(char[] cbuf, int off, int len)` | 从字符数组的 `off`位置开始，最多存入 `len`个字符 |
| `long` | `skip(long n)` | 跳过 `n`个字符，返回实际跳过的字符数量 |
| `boolean` | `ready()` | 判断当前字符流是否已经可以读取 |
| `boolean` | `markSupported()` | 判断当前流是否支持 `mark()`操作 |
| `void` | `mark(int readAheadLimit)` | 标记当前读取位置 |
| `void` | `reset()` | 回到最近一次 `mark()`标记的位置 |
| `void` | `close()` | 关闭字符输入流并释放相关资源 |


以上的 read 方法与前面的还是类似。

无参数版本的 read 一次读一个字符。返回的相当于是一个 char，两个字节。

char\[\] 数组版本是读字符数组，尽可能把字符数组给填满，返回实际读到的字符个数。

第三个版本的 read 中的 CharBuffer，其实就相当于 char\[\] 进行了封装。

```java
public static void main(String[] args) {
        try (Reader reader = new FileReader("./test.txt")) {
            while (true) {
                int c = reader.read();
                if(c == -1) {
                    break;
                }
                System.out.println((char) c);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

假设./test.txt 文件中，是“你好”两个字

但如果我不是强转为 char 类型，那么得到的结果就是`20320` 和 `22909`。那么之前还说过 utf8 中汉字占 3 个字节，为什么这里得到的是两组数字？

字节流读到的是文件中的原始数据，在硬盘上保存文件的时候，就是 6 个字节，utf8 编码。

字符流在读取的时候，就会根据文件的内容编码格式进行解析。read()一次，就会读到 3 个字节（按照 utf8 解析）。返回的时候，针对 3 个字节进行转码了，拿着 3 个字节查了一下 utf8 的码表“你”。read 就又把你这个汉字在 unicode 这个码表中再次查询一次，得到 unicode 的编码值。最终把 unicode 的编码值返回到 char 变量中（两个字节了）

以上就是自动进行转码了~

### Writer 概述
构造方法

| 修饰符 | 构造方法 | 说明 |
| --- | --- | --- |
| `protected` | `Writer()` | 创建字符输出流，默认使用当前对象作为同步锁 |
| `protected` | `Writer(Object lock)` | 创建字符输出流，并指定同步锁对象 |


因为`Writer`是抽象类，所以一般不会直接创建`Writer`对象。



方法

| 返回值类型 | 方法 | 说明 |
| --- | --- | --- |
| `void` | `write(int c)` | 写入一个字符 |
| `void` | `write(char[] cbuf)` | 写入一个字符数组中的全部字符 |
| `void` | `write(char[] cbuf, int off, int len)` | 写入字符数组中从 `off`开始的 `len`个字符 |
| `void` | `write(String str)` | 写入一个字符串 |
| `void` | `write(String str, int off, int len)` | 写入字符串中从 `off`开始的 `len`个字符 |
| `Writer` | `append(char c)` | 追加一个字符 |
| `Writer` | `append(CharSequence csq)` | 追加一个字符序列 |
| `void` | `flush()` | 刷新字符输出流，将缓冲的数据写出 |
| `void` | `close()` | 关闭输出流并释放资源 |


上面看似是五个版本的 write 方法，其实也还是三个。

当前 IO 流对象，read 和 write 就属于直接读写文件了。要想提高效率：

1. 写代码的时候，手动床见缓冲区（byte\[\]），手动减少 read write 次数
2. 使用标准库提供的“缓冲区流”BufferStream 把 InputStream 之类的对象套上一层

### 示例一
扫描指定目录，并找到名称中包含指定字符的所有普通文件（不包含目录），并且后续询问用户是否要删除该文件

```java
package file;

import java.io.File;
import java.util.Scanner;

public class mySearchAndDelete {
    public void searchAndDelete () {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入要搜索的目录：");
        String rootDir = scanner.next();
        File rootfile = new File(rootDir);
        if (!rootfile.isDirectory()) {
            System.out.println("输入的不是目录！");
            return;
        }
        System.out.println("请输入要删除的关键字：");
        String keyWord = scanner.next();
        int count = scanDir(rootfile, keyWord, scanner);
        if (count == 0) {
            System.out.println("没有发现带有关键字的文件");
        } else {
            System.out.println("搜索完成，共发现 " + count + " 个匹配文件。");
        }
    }

    public int scanDir(File rootfile, String keyWord, Scanner scanner) {
        // 1. 列出当前目录中包含的内容
        File[] files = rootfile.listFiles();
        if (files == null) {
            return 0;
        }
        int count = 0;
        // 2. 遍历当前目录中的内容
        for (File file : files) {
            // 3. 判断当前文件是目录 or 文件
            if (!file.isFile()) {
                // 4. 如果是目录，继续遍历
                count += scanDir(file, keyWord, scanner);
            } else {
                // 5. 如果是文件，则查找关键字
                if (deleteFile(file, keyWord, scanner)) {
                    count++;
                }
            }
        }
        return count;
    }

    private boolean deleteFile(File file, String keyWord, Scanner scanner) {
        if (!file.getName().contains(keyWord)) {
            return false;
        }
        System.out.println(
                "发现文件: "
                        + file.getAbsolutePath()
                        + "，包含关键字！是否删除？(y/n)"
        );
        String input = scanner.next();

        if (input.equalsIgnoreCase("y")) {
            boolean success = file.delete();
            if (success)
                System.out.println("文件已删除！");
            else
                System.out.println("文件删除失败！");
        }
        return true;
    }
}

```

### 示例二
进行普通文件的复制

```java
package file;

import java.io.*;
import java.util.Scanner;

public class myCopyFile {
    public void copyFile () {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入源文件路径：");
        String srcPath = scanner.next();
        System.out.println("请输入目标文件路径：");
        String destPath = scanner.next();
        File srcFile = new File(srcPath);

        // 1. 先判断源文件是否存在
        if (!srcFile.isFile()) {
            System.out.println("源文件不存在或不是文件");
            return;
        }
        File destFile = new File(destPath);
        // 如果目标路径是一个已经存在的文件夹
        if (destFile.isDirectory()) {
            destFile = new File(destFile, srcFile.getName());
        }
        // 2. 判断目标文件是路径 or 文件（destPath不一定存在）
        File parentFile = destFile.getParentFile();
        if (parentFile != null && !parentFile.isDirectory()) {
            System.out.println("目标文件所在目录不存在");
            return;
        }
        // 3. 此处进行读写操作
        try (InputStream inputStream = new FileInputStream(srcFile);
             OutputStream outputStream = new FileOutputStream(destFile)) {
            while (true) {
                byte[] buf = new byte[1024];
                int num = inputStream.read(buf);
                if (num == -1) {
                    break;
                }
                outputStream.write(buf, 0, num);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

```

### 示例三
扫描指定目录，并找到名称或者内容中包含指定字符的所有普通文件（不包含目录）

注意：当前现在的方案性能较差，所以尽量不要在太复杂的目录下或者大文件下实验

```java
package file;

import java.io.*;
import java.util.Scanner;

public class myFileSearcher {
    public void searchFile () {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入要搜索的目录：");
        String rootDir = scanner.next();
        File rootFile = new File(rootDir);
        if (!rootFile.isDirectory()) {
            System.out.println("输入的不是目录！");
            return;
        }
        System.out.println("请输入要搜索的关键字：");
        String keyWord = scanner.next();
        scanDir(rootFile, keyWord, scanner);
    }

    public static void scanDir (File rootFile, String keyWord, Scanner scanner) {
        // 1. 列出当前目录下所有内容
        File[] files = rootFile.listFiles();
        if (files == null) {
            return;
        }
        // 2. 遍历当前目录下的所有文件
        for (File file : files) {
            // 如果是文件
            if (file.isFile()) {
                dealFile(file, keyWord, scanner);
            } else {
                // 如果是目录
                scanDir(file, keyWord, scanner);
            }
        }
    }

    public static void dealFile(File file, String keyWord, Scanner scanner) {
        // 1. 判断文件名是否包含关键字
        if (file.getName().contains(keyWord)) {
            System.out.println("文件名包含关键字:" + file.getAbsolutePath());
        }
        // 2. 判断文件内容是否包含关键字。由于keyWord是字符串，就按照字符流读取
        StringBuilder stringBuilder = new StringBuilder();
        try (Reader reader = new FileReader(file)) {
            while (true) {
                char[] chars = new char[1024];
                int n = reader.read(chars);
                if (n == -1) {
                    break;
                }
                stringBuilder.append(chars, 0, n);
            }
        } catch (IOException e) {
            System.out.println("文件读取失败：" + file.getAbsolutePath());
            return;
        }
        // 3. 判定stringBuilder 是否包含关键字
        if (stringBuilder.indexOf(keyWord) >= 0) {
            System.out.println("文件内容包含关键字: " + file.getAbsolutePath());
        }
        return;
    }
}

```

