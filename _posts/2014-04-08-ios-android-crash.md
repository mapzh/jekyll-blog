---
layout: post
title: android和iOS平台的崩溃捕获和收集
date: 2014-04-08 16:24
categories: []
tags: iOS
---
        通过崩溃捕获和收集，可以收集到已发布应用（游戏）的异常，以便开发人员发现和修改bug，对于提高软件质量有着极大的帮助。本文介绍了iOS和android平台下崩溃捕获和收集的原理及步骤，不过如果是个人开发应用或者没有特殊限制的话，就不用往下看了，直接把友盟sdk（一个统计分析sdk）加入到工程中就万事大吉了，其中的错误日志功能完全能够满足需求，而且不需要额外准备接收服务器。
  但是如果你对其原理更感兴趣，或者像我一样必须要兼容公司现有的bug收集系统，那么下面的东西就值得一看了。       要实现崩溃捕获和收集的困难主要有这么几个：
       1、如何捕获崩溃（比如c++常见的野指针错误或是内存读写越界，当发生这些情况时程序不是异常退出了吗，我们如何捕获它呢）
       2、如何获取堆栈信息（告诉我们崩溃是哪个函数，甚至是第几行发生的，这样我们才可能重现并修改问题）
       3、将错误日志上传到指定服务器（这个最好办）

        我们先进行一个简单的综述。会引发崩溃的代码本质上就两类，一个是c++语言层面的错误，比如野指针，除零，内存访问异常等等；另一类是未捕获异常（Uncaught Exception），iOS下面最常见的就是objective-c的NSException（通过@throw抛出，比如，NSArray访问元素越界），android下面就是java抛出的异常了。这些异常如果没有在最上层try住，那么程序就崩溃了。  无论是iOS还是android系统，其底层都是unix或者是类unix系统，对于第一类语言层面的错误，可以通过信号机制来捕获（signal或者是sigaction，不要跟qt的信号插槽弄混了），即任何系统错误都会抛出一个错误信号，我们可以通过设定一个回调函数，然后在回调函数里面打印并发送错误日志。
      一、iOS平台的崩溃捕获和收集
1、设置开启崩溃捕获

**[cpp]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. static int s_fatal_signals[] = {  
2.     SIGABRT,  
3.     SIGBUS,  
4.     SIGFPE,  
5.     SIGILL,  
6.     SIGSEGV,  
7.     SIGTRAP,  
8.     SIGTERM,  
9.     SIGKILL,  
10. };  
11.   
12. static const char* s_fatal_signal_names[] = {  
13.     "SIGABRT",  
14.     "SIGBUS",  
15.     "SIGFPE",  
16.     "SIGILL",  
17.     "SIGSEGV",  
18.     "SIGTRAP",  
19.     "SIGTERM",  
20.     "SIGKILL",  
21. };  
22.   
23. static int s_fatal_signal_num = sizeof(s_fatal_signals) / sizeof(s_fatal_signals[0]);  
24.   
25. void InitCrashReport()  
26. {  
27.         // 1     linux错误信号捕获  
28.     for (int i = 0; i < s_fatal_signal_num; ++i) {  
29.         signal(s_fatal_signals[i], SignalHandler);  
30.     }  
31.       
32.         // 2      objective-c未捕获异常的捕获  
33.     NSSetUncaughtExceptionHandler(&HandleException);  
34. }  

在游戏的最开始调用InitCrashReport()函数来开启崩溃捕获。  注释1处对应上文所说的第一类崩溃，注释2处对应objective-c（或者说是UIKit Framework）抛出但是没有被处理的异常。
2、打印堆栈信息

**[cpp]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. + (NSArray *)backtrace  
2. {  
3.     void* callstack[128];  
4.     int frames = backtrace(callstack, 128);  
5.     char **strs = backtrace_symbols(callstack, frames);  
6.       
7.     int i;  
8.     NSMutableArray *backtrace = [NSMutableArray arrayWithCapacity:frames];  
9.     for (i = kSkipAddressCount;  
10.          i < __min(kSkipAddressCount + kReportAddressCount, frames);  
11.          ++i) {  
12.         [backtrace addObject:[NSString stringWithUTF8String:strs[i]]];  
13.     }  
14.     free(strs);  
15.       
16.     return backtrace;  
17. }  


幸好，苹果的iOS系统支持backtrace，通过这个函数可以直接打印出程序崩溃的调用堆栈。优点是，什么符号函数表都不需要，也不需要保存发布出去的对应版本，直接查看崩溃堆栈。缺点是，不能打印出具体哪一行崩溃，很多问题知道了是哪个函数崩的，但是还是查不出是因为什么崩的![大哭](http://static.blog.csdn.net/xheditor/xheditor_emot/default/wail.gif)
3、日志上传，这个需要看实际需求，比如我们公司就是把崩溃信息http post到一个php服务器。这里就不多做声明了。
4、技巧---崩溃后程序保持运行状态而不退出

**[cpp]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. CFRunLoopRef runLoop = CFRunLoopGetCurrent();  
2.     CFArrayRef allModes = CFRunLoopCopyAllModes(runLoop);  
3.       
4.     while (!dismissed)  
5.     {  
6.         for (NSString *mode in (__bridge NSArray *)allModes)  
7.         {  
8.             CFRunLoopRunInMode((__bridge CFStringRef)mode, 0.001, false);  
9.         }  
10.     }  
11.       
12.     CFRelease(allModes);  


在崩溃处理函数上传完日志信息后，调用上述代码，可以重新构建程序主循环。这样，程序即便崩溃了，依然可以正常运行（当然，这个时候是处于不稳定状态，但是由于手持游戏和应用大多是短期操作，不会有挂机这种说法，所以稳定与否就无关紧要了）。玩家甚至感受不到崩溃。
这里要在说明一个感念，那就是“可重入（reentrant）”。简单来说，当我们的崩溃回调函数是可重入的时候，那么再次发生崩溃的时候，依然可以正常运行这个新的函数；但是如果是不可重入的，则无法运行（这个时候就彻底死了）。要实现上面描述的效果，并且还要保证回调函数是可重入的几乎不可能。所以，我测试的结果是，objective-c的异常触发多少次都可以正常运行。但是如果多次触发错误信号，那么程序就会卡死。
  所以要慎重决定是否要应用这个技巧。

二、android崩溃捕获和收集
1、android开启崩溃捕获
      首先是java代码的崩溃捕获，这个可以仿照最下面的完整代码写一个UncaughtExceptionHandler，然后在所有的Activity的onCreate函数最开始调用

Thread.setDefaultUncaughtExceptionHandler(new UncaughtExceptionHandler(this));
      这样，当发生崩溃的时候，就会自动调用UncaughtExceptionHandler的public void uncaughtException(Thread thread, Throwable exception)函数，其中的exception包含堆栈信息，我们可以在这个函数里面打印我们需要的信息，并且上传错误日志
    然后是重中之重，jni的c++代码如何进行崩溃捕获。

**[cpp]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. void InitCrashReport()  
2. {  
3.     CCLOG("InitCrashReport");  
4.   
5.     // Try to catch crashes...  
6.     struct sigaction handler;  
7.     memset(&handler, 0, sizeof(struct sigaction));  
8.   
9.     handler.sa_sigaction = android_sigaction;  
10.     handler.sa_flags = SA_RESETHAND;  
11.   
12. #define CATCHSIG(X) sigaction(X, &handler, &old_sa[X])  
13.     CATCHSIG(SIGILL);  
14.     CATCHSIG(SIGABRT);  
15.     CATCHSIG(SIGBUS);  
16.     CATCHSIG(SIGFPE);  
17.     CATCHSIG(SIGSEGV);  
18.     CATCHSIG(SIGSTKFLT);  
19.     CATCHSIG(SIGPIPE);  
20. }  

通过singal的设置，当崩溃发生的时候就会调用android_sigaction函数。这同样是linux的信号机制。 此处设置信号回调函数的代码跟iOS有点不同，这个只是同一个功能的两种不同写法，没有本质区别。有兴趣的可以google下两者的区别。
2、打印堆栈
      java语法可以直接通过exception获取到堆栈信息，但是jni代码不支持backtrace，那么我们如何获取堆栈信息呢？    这里有个我想尝试的新方法，就是使用google breakpad，貌似它现在完整的跨平台了（支持windows, mac, linux, iOS和android等），它自己实现了一套minidump，在android上面限制会小很多。  但是这个库有些大，估计要加到我们的工程中不是一件非常容易的事，所以我们还是使用了简洁的“传统”方案。 思路是，当发生崩溃的时候，在回调函数里面调用一个我们在Activity写好的静态函数。在这个函数里面通过执行命令获取logcat的输出信息（输出信息里面包含了jni的崩溃地址），然后上传这个崩溃信息。
  当我们获取到崩溃信息后，可以通过arm-linux-androideabi-addr2line（具体可能不是这个名字，在android ndk里面搜索*addr2line，找到实际的程序）解析崩溃信息。
      jni的崩溃回调函数如下：

**[cpp]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. void android_sigaction(int signal, siginfo_t *info, void *reserved)  
2. {  
3.     if (!g_env) {  
4.         return;  
5.     }  
6.   
7.     jclass classID = g_env->FindClass(CLASS_NAME);  
8.     if (!classID) {  
9.         return;  
10.     }  
11.   
12.     jmethodID methodID = g_env->GetStaticMethodID(classID, "onNativeCrashed", "()V");  
13.     if (!methodID) {  
14.         return;  
15.     }  
16.   
17.     g_env->CallStaticVoidMethod(classID, methodID);  
18.   
19.     old_sa[signal].sa_handler(signal);  
20. }  


可以看到，我们仅仅是通过jni调用了java的一个函数，然后所有的处理都是在java层面完成。
java对应的函数实现如下：

**[java]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. public static void onNativeCrashed() {  
2.         // http://stackoverflow.com/questions/1083154/how-can-i-catch-sigsegv-segmentation-fault-and-get-a-stack-trace-under-jni-on-a  
3.         Log.e("handller", "handle");  
4.         new RuntimeException("crashed here (native trace should follow after the Java trace)").printStackTrace();  
5.         s_instance.startActivity(new Intent(s_instance, CrashHandler.class));  
6.     }  


我们开启了一个新的activity，因为当jni发生崩溃的时候，原始的activity可能已经结束掉了。  这个新的activity实现如下：

**[java]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. public class CrashHandler extends Activity  
2. {  
3.     public static final String TAG = "CrashHandler";  
4.     protected void onCreate(Bundle state)  
5.     {  
6.         super.onCreate(state);  
7.         setTitle(R.string.crash_title);  
8.         setContentView(R.layout.crashhandler);  
9.         TextView v = (TextView)findViewById(R.id.crashText);  
10.         v.setText(MessageFormat.format(getString(R.string.crashed), getString(R.string.app_name)));  
11.         final Button b = (Button)findViewById(R.id.report),  
12.               c = (Button)findViewById(R.id.close);  
13.         b.setOnClickListener(new View.OnClickListener(){  
14.             public void onClick(View v){  
15.                 final ProgressDialog progress = new ProgressDialog(CrashHandler.this);  
16.                 progress.setMessage(getString(R.string.getting_log));  
17.                 progress.setIndeterminate(true);  
18.                 progress.setCancelable(false);  
19.                 progress.show();  
20.                 final AsyncTask task = new LogTask(CrashHandler.this, progress).execute();  
21.                 b.postDelayed(new Runnable(){  
22.                     public void run(){  
23.                         if (task.getStatus() == AsyncTask.Status.FINISHED)  
24.                             return;  
25.                         // It's probably one of these devices where some fool broke logcat.  
26.                         progress.dismiss();  
27.                         task.cancel(true);  
28.                         new AlertDialog.Builder(CrashHandler.this)  
29.                             .setMessage(MessageFormat.format(getString(R.string.get_log_failed), getString(R.string.author_email)))  
30.                             .setCancelable(true)  
31.                             .setIcon(android.R.drawable.ic_dialog_alert)  
32.                             .show();  
33.                     }}, 3000);  
34.             }});  
35.         c.setOnClickListener(new View.OnClickListener(){  
36.             public void onClick(View v){  
37.                 finish();  
38.             }});  
39.     }  
40.   
41.     static String getVersion(Context c)  
42.     {  
43.         try {  
44.             return c.getPackageManager().getPackageInfo(c.getPackageName(),0).versionName;  
45.         } catch(Exception e) {  
46.             return c.getString(R.string.unknown_version);  
47.         }  
48.     }  
49. }  
50.   
51. class LogTask extends AsyncTask<Void, Void, Void>  
52. {  
53.     Activity activity;  
54.     String logText;  
55.     Process process;  
56.     ProgressDialog progress;   
57.   
58.     LogTask(Activity a, ProgressDialog p) {  
59.         activity = a;  
60.         progress = p;  
61.     }  
62.   
63.     @Override  
64.     protected Void doInBackground(Void... v) {  
65.         try {  
66.             Log.e("crash", "doInBackground begin");  
67.             process = Runtime.getRuntime().exec(new String[]{"logcat","-d","-t","500","-v","threadtime"});  
68.             logText = UncaughtExceptionHandler.readFromLogcat(process.getInputStream());  
69.             Log.e("crash", "doInBackground end");  
70.         } catch (IOException e) {  
71.             e.printStackTrace();  
72.             Toast.makeText(activity, e.toString(), Toast.LENGTH_LONG).show();  
73.         }  
74.         return null;  
75.     }  
76.   
77.     @Override  
78.     protected void onCancelled() {  
79.         Log.e("crash", "onCancelled");  
80.         process.destroy();  
81.     }  
82.   
83.     @Override  
84.     protected void onPostExecute(Void v) {  
85.         Log.e("crash", "onPostExecute");  
86.         progress.setMessage(activity.getString(R.string.starting_email));  
87.         UncaughtExceptionHandler.sendLog(logText, activity);  
88.         progress.dismiss();  
89.         activity.finish();  
90.         Log.e("crash", "onPostExecute over");  
91.     }  


最主要的地方是doInBackground函数，这个函数通过logcat获取了崩溃信息。 不要忘记在AndroidManifest.xml添加读取LOG的权限

**[html]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. <uses-permission android:name="android.permission.READ_LOGS" />  


3、获取到错误日志后，就可以写到sd卡（同样不要忘记添加权限），或者是上传。  代码很容易google到，不多说了。  最后再说下如何解析这个错误日志。
我们在获取到的错误日志中，可以截取到如下信息：

**[plain]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. 12-12 20:41:31.807 24206 24206 I DEBUG   :   
2. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #00  pc 004931f8  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  
3. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #01  pc 005b3a5e  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  
4. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #02  pc 005aab68  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  
5. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #03  pc 005ad8aa  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  
6. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #04  pc 005924a4  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  
7. 12-12 20:41:31.847 24206 24206 I DEBUG   :          #05  pc 005929b6  /data/data/org.cocos2dx.wing/lib/libhelloworld.so  


**[plain]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. 004931f8  

这个就是我们崩溃函数的地址，  libhelloworld.so就是崩溃的动态库。我们要使用addr2line对这个动态库进行解析（注意要是obj/local目录下的那个比较大的，含有符号文件的动态库，不是Libs目录下比较小的，同时发布版本时，这个动态库也要保存好，之后查log都要有对应的动态库）。命令如下：
arm-linux-androideabi-addr2line.exe -e 动态库名称  崩溃地址
例如：

**[plain]** [view
 plain](http://blog.csdn.net/langresser_king/article/details/8288195# "view plain")[copy](http://blog.csdn.net/langresser_king/article/details/8288195# "copy")1. $ /cygdrive/d/devandroid/android-ndk-r8c-windows/android-ndk-r8c/toolchains/arm-linux-androideabi-4.6/prebuilt/windows/bin/arm-linux-androideabi-addr2line.exe -e obj/local/armeabi-v7a/libhelloworld.so 004931f8  

得到的结果就是哪个cpp文件第几行崩溃。  如果动态库信息不对，返回的就是 ?:0
