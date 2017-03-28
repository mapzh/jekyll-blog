---
layout: post
title: ios：音频和视频（未完）
date: 2012-11-11 20:08
categories: []
tags: iOS
---
#前提条件：需要引入AVFoundation.frame-work、MediaPlayer.framework、CoreAudio.framework（录制音频时会用到）

AV 框架(Audio 和Video框架)里的 AVAudioPlayer类播放iOS支持的所有音频格式。AVAudioPlayer 实例的delegate属性允许我们通过事件获得通知,例如当音频播放被打断或者播放音频文件出错时。
新建一个类，类中包含一个播放器的属性。而且该类遵守AVAudioPlayerDelegate协议

```cpp
@interface AVTest : UIViewController<AVAudioPlayerDelegate>

@property (nonatomic,retain) AVAudioPlayer *myPlayer;

```

在.m文件中实现：



```cpp
- (void)viewDidLoad
{
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor cyanColor];
    //添加按钮，点击按钮播放音乐
    UIButton *play = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    play.frame = CGRectMake(100, 250, 120, 40);
    [play addTarget:self action:@selector(playMusic) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:play];
}
- (void)playMusic
{
    dispatch_queue_t playDispatchQueue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(playDispatchQueue, ^{
    NSString *filePath = [[NSBundle mainBundle] pathForResource:@"aaa" ofType:@"mp3"];
    //文件中的数据首先被加载到一个 NSData 实例,然后被传递到 AVAudioPlayer 类的 initWithData:error:方法。
    NSData *mp3Data = [NSData dataWithContentsOfFile:filePath];
    myPlayer = [[AVAudioPlayer alloc] initWithData:mp3Data error:nil];
    if (self.myPlayer != nil)
    {
        //设置播放器代理，并播放
        self.myPlayer.delegate = self;
        [self.myPlayer play];
    }
    });
}

```


#处理播放音频时的中断
AVAudioPlayerDelegate中有处理中断的方法：


```cpp
//当中断发生时调用这个方法
- (void)audioPlayerBeginInterruption:(AVAudioPlayer *)player
{
    //do something
    NSLog(@"%s,%d",__FUNCTION__,__LINE__);
    NSLog(@"Here is a interruption!");
}

//当中断结束时调用这个方法
- (void)audioPlayerEndInterruption:(AVAudioPlayer *)player withFlags:(NSUInteger)flags
{
    if (flags == AVAudioSessionInterruptionFlags_ShouldResume&&self.myPlayer != nil)
    {
        [self.myPlayer play];
    }
}

```


#(遵守AVAudioRecorderDelegate协议)录制音频：
增加一个AVAudioRecorder属性：


```cpp
@property (nonatomic,retain) AVAudioRecorder *audioRecorder;

```
初始化AVAudioRecorder的方法initWithURL:settings:error:的setting参数，很多值都可以保存在这个setting字典里:
- AVFormatIDKey录音的格式,可以是：kAudioFormatLinearPCM、kAudioFormatAppleLossless

- AVSampleRateKey录制音频的采样率

- AVNumberOfChannelsKey录制音频的频道编号

- AVEncoderAudioQualityKey录制音频的质量,可以是：AVAudioQualityMin、AVAudioQualityLow、AVAudioQualityMedium、AVAudioQualityHigh、AVAudioQualityMax




初始化 AVAudioRecorder时,我们使用了一个dictionary作为音频录制器的初始化方法中的setting参数。这个dictionary用audioRecordingSettings方法创建。实现如下:

```cpp
- (NSDictionary *) audioRecordingSettings{
NSDictionary *result = nil;
/* 我们在 dictionary 中初始化录制音频的选项。稍后我们会用这个 dictionary 音频录制器*/
NSMutableDictionary *settings = [[NSMutableDictionary alloc] init];
[settings
setValue:[NSNumber numberWithInteger:kAudioFormatAppleLossless] forKey:AVFormatIDKey];
[settings
setValue:[NSNumber numberWithFloat:44100.0f] forKey:AVSampleRateKey];
[settings
setValue:[NSNumber numberWithInteger:1] forKey:AVNumberOfChannelsKey];
[settings
setValue:[NSNumber numberWithInteger:AVAudioQualityLow] forKey:AVEncoderAudioQualityKey];
result = [NSDictionary dictionaryWithDictionary:settings];
return result; }
```
添加一个录音按钮：


```cpp
//添加录音按钮
    UIButton *record = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    record.frame = CGRectMake(100, 300, 120, 40);
    [record addTarget:self action:@selector(recordAudio) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:record];
```

录音存放路径：


```cpp
- (NSString *) audioRecordingPath
{
    //返回录音存放路径
    NSArray *folders = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
    NSString *documentsFolder = [folders objectAtIndex:0];
    NSString *result = [documentsFolder stringByAppendingPathComponent:@"Recording.m4a"];
    return result;
}

```

录音以及结束录音方法：


```cpp
- (void)recordAudio
{
    NSString *recordPath = [self audioRecordingPath];
    NSURL *recordURL = [NSURL fileURLWithPath:recordPath];
    audioRecorder = [[AVAudioRecorder alloc] initWithURL:recordURL settings:[self audioRecordingSettings] error:nil];
    if (self.audioRecorder != nil)
    {
        self.audioRecorder.delegate = self;
        if ([self.audioRecorder prepareToRecord] && [self.audioRecorder record])
        {
            NSLog(@"Successfully started to record!");
            /* 5 秒后,我们终止录制过程 ,具体录制时间可以再写一个接口*/
            [self performSelector:@selector(stopRecordingOnAudioRecorder:)
                       withObject:self.audioRecorder afterDelay:5.0f];
        }
    }
}
- (void)stopRecordingOnAudioRecorder :(AVAudioRecorder *)paramRecorder
{
    //停止录音
    [self.audioRecorder stop];
}

```


在AVAudioRecorderDelegate协议中也存在像AVAudioPlayerDelegate中断与结束的方法：


```cpp
- (void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully:(BOOL)flag;

- (void)audioRecorderBeginInterruption:(AVAudioRecorder *)recorder;

/* Currently the only flag is AVAudioSessionInterruptionFlags_ShouldResume. */
- (void)audioRecorderEndInterruption:(AVAudioRecorder *)recorder withFlags:(NSUInteger)flags NS_AVAILABLE_IOS(4_0);


```
