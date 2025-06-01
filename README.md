# Baby Song Player

A simple web application that plays audio files from the songs folder repeatedly until skipped to the next file. This application is built with React, TypeScript, and Vite, and can be deployed to Netlify.

## Features

- Auto-plays audio files in sequence
- Loops through all songs in the folder
- Simple and intuitive controls (play/pause, next, previous)
- Responsive design for mobile and desktop
- Built with modern web technologies

## Usage

### Local Development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your audio files to the `public/songs` directory
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

### Adding Songs

Place your audio files in the `public/songs` directory. The player supports various audio formats including:
- MP3 (.mp3)
- OGG (.ogg)
- WAV (.wav)
- OPUS (.opus)

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the compiled application.

## Deployment to Netlify

### Option 1: Deploy via Netlify UI

1. Create a Netlify account if you don't have one
2. Click on "New site from Git"
3. Connect to your Git provider and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Initialize your site:
   ```bash
   netlify init
   ```
4. Deploy your site:
   ```bash
   netlify deploy --prod
   ```

## Project Structure

```
├── public/
│   ├── songs/        # Place your audio files here
├── src/
│   ├── components/   # React components
│   │   └── AudioPlayer.tsx
│   ├── services/     # Service modules
│   │   └── songService.ts
│   ├── App.tsx       # Main application component
│   └── main.tsx      # Application entry point
├── index.html        # HTML template
└── netlify.toml      # Netlify configuration
```
