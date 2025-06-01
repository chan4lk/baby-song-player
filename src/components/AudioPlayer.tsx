import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioPlayerProps {
  songs: string[];
}

const AudioPlayer = ({ songs }: AudioPlayerProps) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isUserInitiatedPause = useRef<boolean>(false);
  
  // Get the filename without extension for display
  const getDisplayName = (filename: string): string => {
    return filename.split('/').pop()?.replace(/\.[^/.]+$/, '') || filename;
  };
  
  // Get the appropriate MIME type based on file extension
  const getAudioType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp3':
        return 'audio/mpeg';
      case 'ogg':
        return 'audio/ogg';
      case 'wav':
        return 'audio/wav';
      case 'opus':
        return 'audio/opus';
      case 'm4a':
        return 'audio/mp4';
      default:
        return 'audio/mpeg'; // Default to MP3
    }
  };

  // Play the next song
  const playNextSong = useCallback(() => {
    if (songs.length > 0) {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    }
  }, [songs.length]);

  // Play the previous song
  const playPreviousSong = () => {
    if (songs.length > 0) {
      setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        isUserInitiatedPause.current = true;
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        isUserInitiatedPause.current = false;
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
        setIsPlaying(true);
      }
    }
  };

  // Initialize audio playback
  useEffect(() => {
    // Auto-play when component mounts (if possible)
    const initializeAudio = async () => {
      if (audioRef.current && songs.length > 0) {
        try {
          // Most browsers require user interaction before autoplay
          // This will only work if the user has interacted with the page
          await audioRef.current.play();
          setIsPlaying(true);
        } catch {
          // Expected error if user hasn't interacted yet
          console.log('Auto-play prevented. Waiting for user interaction.');
          setIsPlaying(false);
        }
      }
    };
    
    if (songs.length > 0) {
      initializeAudio();
    }
  }, [songs]);

  // Function to preload the next song
  const preloadNextSong = useCallback(() => {
    if (songs.length <= 1) return;
    
    const nextIndex = (currentSongIndex + 1) % songs.length;
    const nextSongUrl = songs[nextIndex];
    
    // Create a new audio element to preload the next song
    const preloadAudio = new Audio();
    preloadAudio.src = nextSongUrl;
    preloadAudio.preload = 'auto';
    preloadAudio.load();
    
    // Log preloading for debugging
    console.log(`Preloading next song: ${getDisplayName(nextSongUrl)}`);
  }, [currentSongIndex, songs]);

  // Handle song changes and ensure continuous playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Store a reference to the current audio element for cleanup
    const audioElement = audioRef.current;
    
    const handleEnded = () => {
      // When current song ends, automatically play the next one
      playNextSong();
    };
    
    const handleCanPlay = () => {
      // Only auto-play if it wasn't a user-initiated pause
      if (isPlaying || !isUserInitiatedPause.current) {
        audioElement.play().catch(err => {
          console.error('Error auto-playing:', err);
        });
        setIsPlaying(true);
        isUserInitiatedPause.current = false;
        
        // Preload the next song when current song starts playing
        preloadNextSong();
      }
    };
    
    // Add event listeners
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('canplay', handleCanPlay);
    
    // Load the current song
    audioElement.load();
    
    return () => {
      // Clean up event listeners using the stored reference
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentSongIndex, isPlaying, songs.length, playNextSong, preloadNextSong]);
  
  // Heartbeat to ensure continuous playback
  useEffect(() => {
    if (!isPlaying || isUserInitiatedPause.current) return;
    
    // Check every 5 seconds if audio is playing and restart if needed
    const heartbeatInterval = setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.currentTime > 0 && !audio.ended && audio.readyState > 2) {
        // Audio is playing normally, do nothing
      } else if (audio && isPlaying && !isUserInitiatedPause.current) {
        // Audio should be playing but isn't - try to restart it
        console.log('Heartbeat detected audio stopped - restarting playback');
        audio.play().catch(err => {
          console.error('Error restarting audio from heartbeat:', err);
        });
      }
    }, 5000);
    
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isPlaying]);

  return (
    <div className="audio-player">
      <h2>Now Playing</h2>
      <div className="cover-image">
        <img src="/images/cover.jpeg" alt="Album Cover" />
      </div>
      <div className="song-info">
        <h3>{getDisplayName(songs[currentSongIndex])}</h3>
      </div>
      
      <audio 
        ref={audioRef}
        controls
        preload="auto"
        crossOrigin="anonymous"
        onPlay={() => {
          setIsPlaying(true);
          isUserInitiatedPause.current = false;
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
      >
        <source 
          src={songs[currentSongIndex]} 
          type={getAudioType(songs[currentSongIndex])} 
        />
        Your browser does not support the audio element.
      </audio>
      
      <div className="controls">
        <button onClick={playPreviousSong} className="control-button">
          Previous
        </button>
        <button onClick={togglePlay} className="control-button">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={playNextSong} className="control-button">
          Next
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
