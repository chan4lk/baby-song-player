/**
 * Service for handling song-related operations
 */

// Function to get all songs from the public/songs directory
export const getSongs = async (): Promise<string[]> => {
  try {
    // For a real production app, we would fetch this list from an API
    // For this demo, we'll use a hardcoded approach since we know the files
    
    // Get the song files from the public directory
    // In Vite, assets in the public directory are served at the root path
    const songPaths = [
      '/songs/amma1.mp3',
      '/songs/thaththa1.m4a'
    ];
    
    // Check if there are any additional songs in the directory
    // This would typically be done server-side in a real application
    
    return songPaths;
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};
