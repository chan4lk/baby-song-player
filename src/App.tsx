import { useState, useEffect } from 'react';
import './App.css';
import AudioPlayer from './components/AudioPlayer';
import { getSongs } from './services/songService';

// Define types for PWA-related events
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

function App() {
  const [songs, setSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  // Load songs
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        let songList = await getSongs();
        
        // Fallback: If no songs were found, use a direct approach with the known songs
        if (songList.length === 0) {
          songList = [
            '/songs/amma1.mp3',
            '/songs/thaththa1.m4a'
          ];
        }
        
        setSongs(songList);
      } catch (err) {
        console.error('Failed to load songs:', err);
        setError('Failed to load songs. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    loadSongs();
  }, []);
  
  // Function to handle PWA installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    // Reset the install prompt variable
    setInstallPrompt(null);
    
    console.log('User installation choice:', choiceResult.outcome);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Baby Song Player</h1>
        {!isOnline && (
          <div className="offline-badge">
            Offline Mode
          </div>
        )}
      </header>
      
      <main>
        {loading ? (
          <p>Loading songs...</p>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="no-songs-message">
            <p>No songs found in the songs folder.</p>
            <p>Please add some audio files to the public/songs directory.</p>
          </div>
        ) : (
          <>
            <AudioPlayer songs={songs} />
            
            {installPrompt && (
              <div className="install-prompt">
                <p>Install this app on your device for offline use</p>
                <button onClick={handleInstallClick} className="install-button">
                  Install App
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} Baby Song Player</p>
        <p className="pwa-note">This app works offline</p>
      </footer>
    </div>
  );
}

export default App
