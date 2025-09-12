'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// 强制显示调试信息
console.log('🚀 VideoPlayer.tsx 文件已加载！');

interface VideoPlayerProps {
  videoUrl: string;
  videoId: string;
  courseId?: string; // 添加课程ID
  lessonId?: number; // 添加课程ID
  title: string;
  autoPlay?: boolean; // 添加自动播放属性
  subtitles?: Array<{
    src: string;
    label: string;
    srclang: string;
  }>;
  onProgressUpdate?: (currentTime: number) => void;
  onVideoEnd?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoId,
  courseId,
  lessonId,
  title,
  autoPlay = false,
  subtitles = [],
  onProgressUpdate,
  onVideoEnd
}) => {

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // 只在组件挂载时打印一次初始化日志
  useEffect(() => {
    console.log('🎬 VideoPlayer 初始化:', { videoId, title, videoUrl });
  }, [videoId]); // 只在videoId变化时打印
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // UI状态
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('zh');
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 定时器和引用
  const isMountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 智能选择视频URL：优先使用直接URL，必要时使用代理
  const getVideoUrl = (originalUrl: string) => {
    // 如果是相对路径或同域URL，直接使用
    if (!originalUrl.startsWith('http') || originalUrl.includes(window.location.hostname)) {
      return originalUrl;
    }
    
    // 对于外部URL，先尝试直接使用，如果失败再考虑代理
    return originalUrl;
  };

  // 播放/暂停控制
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.log('播放失败:', error);
        setHasError(true);
      });
    }
  }, [isPlaying]);

  // 音量控制
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
  }, []);

  // 静音切换
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // 播放速度控制
  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  }, []);

  // 进度控制
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // 全屏控制
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
            } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);


  // 字幕切换
  const handleSubtitleChange = useCallback((lang: string) => {
    setActiveSubtitle(lang);
    setShowSubtitleMenu(false);
    
    // 更新视频字幕轨道
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].language === lang ? 'showing' : 'hidden';
      }
    }
  }, []);

  // 进度保存状态
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef(0); // 使用ref来跟踪上次保存时间，避免闭包问题
  const lastTimeUpdateRef = useRef(0); // 跟踪上次时间更新事件的时间
  const timeUpdateThrottleRef = useRef<NodeJS.Timeout | null>(null); // 节流定时器

  // 智能进度保存 - 5秒采集一次
  const saveProgress = useCallback(async (time: number) => {
    const currentLastSaveTime = lastSaveTimeRef.current;
    const timeDiff = Math.abs(time - currentLastSaveTime);
    
    console.log('🎬 saveProgress 被调用:', { 
      time, 
      videoId, 
      courseId, 
      lessonId, 
      lastSavedTime: currentLastSaveTime,
      timeDiff
    });
    
    // 本地保存（实时）
    localStorage.setItem(`video-progress-${videoId}`, time.toString());
    console.log('💾 本地进度已保存:', { videoId, time });
    
    // 服务器保存（5秒采集一次）
    console.log('⏱️ 时间差检查:', { timeDiff, threshold: 5, courseId, lessonId, currentLastSaveTime });
    
    // 如果时间差大于等于5秒，或者是第一次保存（currentLastSaveTime为0且时间大于5秒）
    if ((timeDiff >= 5 || (currentLastSaveTime === 0 && time >= 5)) && courseId && lessonId) {
      console.log('🚀 开始保存到服务器...');
      try {
        const requestData = { 
          lessonId: lessonId,
          currentTime: time,
          totalWatched: time, // 累计观看时间
          completed: false // 始终标记为未完成，让用户手动标记完成
        };
        
        console.log('📤 发送请求数据:', requestData);
        console.log('🌐 API URL:', `/api/courses/${courseId}/progress`);
        
        const response = await fetch(`/api/courses/${courseId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        
        console.log('📥 服务器响应状态:', response.status, response.statusText);
        
        if (response.ok) {
          lastSaveTimeRef.current = time; // 更新ref中的保存时间
          setLastSavedTime(time); // 更新state（用于显示）
          console.log('✅ 进度已保存到服务器:', { time, courseId, lessonId });
        } else {
          const errorData = await response.json();
          console.error('❌ 服务器返回错误:', errorData);
        }
      } catch (error) {
        console.error('❌ 服务器进度保存失败:', error);
      }
    } else {
      console.log('⏸️ 跳过服务器保存:', { 
        reason: !courseId ? '缺少courseId' : !lessonId ? '缺少lessonId' : '时间差不足5秒且不是首次保存',
        courseId, 
        lessonId, 
        timeDiff,
        currentLastSaveTime,
        currentTime: time
      });
    }
  }, [videoId, courseId, lessonId, lastSavedTime]);
  
  // 页面离开时保存进度
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        // 同步保存当前进度
        const currentTime = videoRef.current.currentTime;
        saveProgress(currentTime);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveProgress]);

  // 保存视频完成状态
  const saveProgressComplete = useCallback(async (time: number) => {
    if (!courseId || !lessonId) {
      console.log('❌ 缺少courseId或lessonId，无法保存完成状态');
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lessonId: lessonId,
          currentTime: time,
          totalWatched: time,
          completed: true // 标记为已完成
        })
      });
      
      if (response.ok) {
        console.log('✅ 视频完成状态已保存:', { time, courseId, lessonId });
        // 清除本地保存的进度
        localStorage.removeItem(`video-progress-${videoId}`);
      } else {
        const errorData = await response.json();
        console.error('❌ 服务器返回错误:', errorData);
      }
    } catch (error) {
      console.log('❌ 完成状态保存失败:', error);
    }
  }, [videoId, courseId, lessonId]);

  // 格式化时间
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // 控制栏显示/隐藏
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // 初始化HTML5视频播放器
  useEffect(() => {
    if (!videoRef.current) {
      console.log('videoRef.current 为空');
            return;
          }

    const video = videoRef.current;
    console.log('开始初始化视频播放器:', video);

        // 加载保存的播放进度
        const savedProgress = localStorage.getItem(`video-progress-${videoId}`);
    if (savedProgress) {
          const savedTime = parseFloat(savedProgress);
            if (!isNaN(savedTime)) {
        video.currentTime = savedTime;
      }
        }

          // 事件监听
    const handleLoadStart = () => {
            setIsLoading(true);
            setHasError(false);
            
            // 设置加载超时
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            loadingTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) {
                setIsLoading(false);
                setIsReady(true);
              }
            }, 10000);
    };

    const handleLoadedData = () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            console.log('🎬 视频数据加载完成:', { videoId, title });
            setIsLoading(false);
            setIsReady(true);
    };

    const handleCanPlay = () => {
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
            setIsLoading(false);
            setIsReady(true);
    };

    const handleTimeUpdate = () => {
      // 简化条件检查，只检查video是否存在
      if (video) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        
        // 始终更新UI状态（不限制频率）
        setCurrentTime(currentTime || 0);
        setDuration(duration || 0);
            
        // 调用进度更新回调
        if (onProgressUpdate) {
          onProgressUpdate(currentTime);
        }
        
        // 强制重新渲染
        setForceUpdate(prev => prev + 1);
        
        // 使用节流机制，每5秒最多执行一次进度保存
        if (timeUpdateThrottleRef.current) {
          return; // 如果已经有定时器在运行，直接返回
        }
        
        timeUpdateThrottleRef.current = setTimeout(() => {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastTimeUpdateRef.current;
          
          console.log('⏰ 时间更新事件处理 (5秒间隔):', { 
            currentTime, 
            duration,
            readyState: video.readyState,
            paused: video.paused,
            videoId,
            courseId,
            lessonId,
            timeSinceLastUpdate
          });
          
          lastTimeUpdateRef.current = now;
          
          // 智能进度保存（5秒采集一次）
          console.log('🔄 准备调用saveProgress:', { currentTime, courseId, lessonId });
          saveProgress(currentTime);
          
          // 清除定时器
          timeUpdateThrottleRef.current = null;
        }, 5000); // 5秒后执行
      } else {
        console.log('❌ 时间更新事件被跳过 - 视频元素不存在:', { 
          videoId,
          courseId,
          lessonId
        });
      }
    };

    const handleLoadedMetadata = () => {
      if (isMountedRef.current && video) {
        const duration = video.duration;
        console.log('视频元数据加载完成:', { 
          duration,
          readyState: video.readyState,
          networkState: video.networkState
        });
        
        // 强制设置时长
        setDuration(duration || 0);
        setForceUpdate(prev => prev + 1);
      }
    };

    const handlePlay = () => {
      console.log('🎬 视频播放事件触发');
      console.log('📋 当前状态:', { 
        videoId, 
        courseId, 
        lessonId, 
        title,
        videoUrl: videoUrl.substring(0, 50) + '...'
      });
      
      setIsPlaying(true);
      
      // 强制检查视频时间
      if (video) {
        console.log('🎬 视频开始播放，强制检查时间:', {
          currentTime: video.currentTime,
          duration: video.duration,
          readyState: video.readyState
        });
        
        setCurrentTime(video.currentTime || 0);
        setDuration(video.duration || 0);
        setForceUpdate(prev => prev + 1);
        
        // 立即尝试保存进度
        if (video.currentTime > 0) {
          console.log('🚀 视频播放时立即尝试保存进度:', { currentTime: video.currentTime });
          saveProgress(video.currentTime);
        }
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('🏁 视频播放结束');
      console.log('📋 结束时的状态:', { 
        videoId, 
        courseId, 
        lessonId, 
        title,
        hasVideoRef: !!videoRef.current,
        duration: videoRef.current?.duration
      });
      
      setIsPlaying(false);
      
      // 视频结束时保存最终进度（不标记为完成）
      if (videoRef.current) {
        const finalTime = videoRef.current.duration || 0;
        console.log('💾 保存视频最终进度:', { finalTime, courseId, lessonId });
        // 使用普通的进度保存，不标记为完成
        saveProgress(finalTime);
      }
      
      if (onVideoEnd && isMountedRef.current) {
        onVideoEnd();
      }
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleError = (error: any) => {
          console.error('视频播放错误:', error);
          setHasError(true);
          setIsLoading(false);
    };

    // 全屏状态监听
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };


    // 添加事件监听器
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    console.log('事件监听器已绑定，视频状态:', {
      currentTime: video.currentTime,
      duration: video.duration,
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
      src: video.src,
      courseId,
      lessonId
    });
    
    // 测试时间更新事件是否正常工作
    console.log('🧪 测试时间更新事件绑定...');
    let testCount = 0;
    const testTimeUpdate = () => {
      testCount++;
      if (testCount === 1) {
        console.log('✅ 时间更新事件测试成功，事件监听器正常工作');
        video.removeEventListener('timeupdate', testTimeUpdate);
      }
    };
    video.addEventListener('timeupdate', testTimeUpdate);

    // 立即检查一次视频状态
    setTimeout(() => {
      if (video && isMountedRef.current) {
        console.log('延迟检查视频状态:', {
          currentTime: video.currentTime,
          duration: video.duration,
          readyState: video.readyState,
          paused: video.paused
        });
        setCurrentTime(video.currentTime || 0);
        setDuration(video.duration || 0);
        
        setForceUpdate(prev => prev + 1);
      }
    }, 1000);

    // 不再使用自动播放，用户需要手动点击播放

    // 强制更新时间的定时器（主要机制）
    const timeUpdateInterval = setInterval(() => {
      if (video && isMountedRef.current) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        
        console.log('定时器更新:', { 
          currentTime, 
          duration, 
          isPlaying,
          readyState: video.readyState,
          networkState: video.networkState,
          paused: video.paused,
          src: video.src
        });
        
        // 强制更新状态
        setCurrentTime(currentTime || 0);
        setDuration(duration || 0);
        
        // 强制重新渲染
        setForceUpdate(prev => prev + 1);
        
        // 如果视频在播放但时间没有更新，尝试手动触发事件
        if (isPlaying && currentTime === 0 && duration === 0) {
          console.log('⚠️ 检测到视频播放但时间未更新，尝试手动触发事件');
          // 手动触发timeupdate事件
          const event = new Event('timeupdate');
          video.dispatchEvent(event);
        }
      }
    }, 50); // 每50ms更新一次，更频繁

    // 清理函数
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // 清理时间更新定时器
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
      }
    };
  }, [videoId, videoUrl]); // 包含videoUrl依赖

  // 课程切换时重置视频状态
  useEffect(() => {
    console.log('🎬 课程切换，重置视频状态:', { videoId, videoUrl });
    
    // 重置所有状态
    setIsPlaying(false);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoading(true);
    setShowControls(true);
    setForceUpdate(prev => prev + 1);
    
    // 重置视频元素
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      
      // 强制重新加载视频
      videoRef.current.load();
      
      console.log('🎬 视频元素已重置，准备加载新视频');
    }
  }, [videoId, videoUrl]);


  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      // 避免在输入框中触发快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'Digit0':
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault();
          const percentage = parseInt(e.code.replace('Digit', '')) / 10;
          videoRef.current.currentTime = duration * percentage;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, toggleFullscreen, toggleMute, handleVolumeChange, volume, duration]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // 清理所有定时器
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (timeUpdateThrottleRef.current) {
        clearTimeout(timeUpdateThrottleRef.current);
        timeUpdateThrottleRef.current = null;
      }
    };
  }, []);

  // 重试加载
  const retryLoad = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setIsReady(false);
    
    // 重新加载视频
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="video-player-container w-full group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      <div
        className="relative bg-black rounded-lg overflow-hidden shadow-lg"
        style={{ aspectRatio: '16/9' }}
      >
        {/* 视频元素 */}
        <video
          ref={videoRef}
          className="w-full h-full"
          preload="metadata"
          playsInline
          autoPlay={autoPlay}
          poster=""
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            setCurrentTime(video.currentTime || 0);
            setDuration(video.duration || 0);
            setForceUpdate(prev => prev + 1);
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            setDuration(video.duration || 0);
            setForceUpdate(prev => prev + 1);
          }}
        >
          <source src={getVideoUrl(videoUrl)} type="video/mp4" />
          {subtitles.map((subtitle, index) => (
            <track
              key={index}
              kind="captions"
              src={subtitle.src}
              srcLang={subtitle.srclang}
              label={subtitle.label}
              default={subtitle.srclang === activeSubtitle}
            />
          ))}
          <p className="text-white p-4">
            要查看此视频，请启用JavaScript，并考虑升级到支持HTML5视频的Web浏览器。
          </p>
        </video>

        {/* 中央播放按钮 */}
        {!isPlaying && isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-[#ed8936] hover:bg-[#ed8936]/90 text-white rounded-full p-4 transition-all duration-300 transform hover:scale-110 shadow-lg"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        )}

        {/* 控制栏 */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* 进度条 */}
          <div className="px-4 py-2">
            <div
              ref={progressRef}
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer hover:h-2 transition-all duration-200"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-[#ed8936] rounded-full transition-all duration-200"
                style={{ 
                  width: `${duration && duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%`,
                  minWidth: '0%',
                  maxWidth: '100%'
                }}
                key={`progress-${forceUpdate}`}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              {/* 播放/暂停按钮 */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#ed8936] transition-colors duration-200"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* 时间显示 */}
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
                {/* 调试信息 */}
                <div className="text-xs text-gray-400">
                  {isPlaying ? '播放中' : '暂停'} | {isReady ? '就绪' : '加载中'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 音量控制 */}
              <div className="relative">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#ed8936] transition-colors duration-200"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
                
                {/* 音量滑块 */}
                {showVolumeSlider && (
                  <div
                    ref={volumeRef}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 rounded-lg p-2"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #ed8936 0%, #ed8936 ${volume * 100}%, #4a5568 ${volume * 100}%, #4a5568 100%)`
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 播放速度 */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="text-white hover:text-[#ed8936] transition-colors duration-200 text-sm font-medium"
                >
                  {playbackRate}x
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg py-1 min-w-[80px]">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`block w-full text-left px-3 py-1 text-sm hover:bg-[#ed8936]/20 transition-colors duration-200 ${
                          playbackRate === speed ? 'text-[#ed8936]' : 'text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 字幕 */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                    className="text-white hover:text-[#ed8936] transition-colors duration-200"
                    title="字幕设置"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2"/>
                      <text x="8" y="15" fill="currentColor" fontSize="8" fontWeight="bold">CC</text>
                    </svg>
                  </button>
                  
                  {showSubtitleMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg py-1 min-w-[120px]">
                      <button
                        onClick={() => handleSubtitleChange('off')}
                        className={`block w-full text-left px-3 py-1 text-sm hover:bg-[#ed8936]/20 transition-colors duration-200 ${
                          activeSubtitle === 'off' ? 'text-[#ed8936]' : 'text-white'
                        }`}
                      >
                        关闭字幕
                      </button>
                      {subtitles.map((subtitle) => (
                        <button
                          key={subtitle.srclang}
                          onClick={() => handleSubtitleChange(subtitle.srclang)}
                          className={`block w-full text-left px-3 py-1 text-sm hover:bg-[#ed8936]/20 transition-colors duration-200 ${
                            activeSubtitle === subtitle.srclang ? 'text-[#ed8936]' : 'text-white'
                          }`}
                        >
                          {subtitle.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}


              {/* 全屏 */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-[#ed8936] transition-colors duration-200"
                title={isFullscreen ? "退出全屏" : "全屏"}
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-[#ed8936] mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#ed8936]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium mb-2">加载视频中...</p>
              <p className="text-sm text-gray-300">请稍候</p>
            </div>
          </div>
        )}
        
        {/* 错误状态 */}
        {hasError && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">视频加载失败</p>
              <p className="text-sm text-gray-300 mb-4">请检查网络连接或稍后重试</p>
              <button 
                onClick={retryLoad}
                className="px-6 py-3 bg-[#ed8936] text-white rounded-lg hover:bg-[#ed8936]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重试
              </button>
            </div>
          </div>
        )}


        {/* 视频标题（移动端显示） */}
        <div className="absolute top-4 left-4 right-4 md:hidden">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      </div>

        {/* 键盘快捷键提示 */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">空格</kbd>
                <span>播放/暂停</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">F</kbd>
                <span>全屏</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">M</kbd>
                <span>静音</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端优化样式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ed8936;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ed8936;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .video-player-container .group:hover .opacity-0 {
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;