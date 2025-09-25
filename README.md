# OnlyMsg - Share Your Stories

<div align="center">
  <img src="public/assets/logo/logo.png" alt="OnlyMsg Logo" width="100" height="100">
  
  **A modern platform for sharing conversations, experiences, and stories from dating apps, AI chats, and more.**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-teal.svg)](https://tailwindcss.com/)
</div>

## 🌟 Features

### 📱 **Social Platform**
- **Pinterest-style Grid Layout** for beautiful post display
- **Real-time Post Creation** with image upload and chat screenshots
- **Like, Comment & Bookmark** functionality
- **Follow/Unfollow** system with user recommendations

### 🔐 **Authentication**
- **Google OAuth 2.0** integration for seamless login
- **Traditional login/register** with JWT token management
- **Secure session management** with IndexedDB persistence

### 💬 **Content Sharing**
- **Dating App Stories** - Share conversations from Hinge, Tinder, etc.
- **AI Chat Experiences** - Share interactions with Cluely, Poke, ChatBot, etc.
- **Specialized Feeds** - Dedicated pages for Dating and AI content
- **Smart Filtering** - Filter by app platform, relationship type, and feelings

### 🖼️ **Advanced Image Display**
- **Percentage Display Modes** - Show 50% or 100% of images initially
- **Scroll-to-View** functionality for long chat screenshots
- **Cover Image Selection** for better feed presentation
- **Image Quality Optimization** with smart compression

### 👤 **User Profiles**
- **Profile Editing** with avatar upload and bio customization
- **Post Statistics** showing top content categories
- **Sorting Options** by date or popularity
- **Personal Feed** with user's own posts

### ⚙️ **User Experience**
- **Dark/Light Theme** toggle
- **Responsive Design** for all screen sizes
- **Real-time Updates** with React Query
- **Optimistic UI Updates** for smooth interactions
- **Error Handling** with user-friendly messages

## 🚀 Tech Stack

### **Frontend**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for beautiful, accessible components
- **React Query** for server state management
- **React Router** for client-side routing

### **Data Management**
- **IndexedDB** for local data persistence
- **Mock API** with realistic data relationships
- **Smart Image Processing** with Canvas API
- **Data Migration System** for seamless updates

### **Authentication & Security**
- **Google Identity Services** for OAuth 2.0
- **JWT Token Management** with secure validation
- **Protected Routes** and authorization checks

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Conor-711/OnlyMsg.git
   cd OnlyMsg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your Google OAuth Client ID to .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Identity API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy Client ID to `.env` file

### Environment Variables
```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## 📱 Usage

### Creating Posts
1. Click "Share" in the sidebar
2. Add your story text
3. Upload chat screenshots
4. Select app platform (Dating, AI, etc.)
5. Choose relationship type and feelings
6. Set display percentage (50% or 100%)
7. Select cover image for feeds

### Exploring Content
- **Home Feed**: All public posts from followed users
- **Dating Page**: Stories from dating apps only
- **AI Page**: AI chatbot conversations only
- **Profile Page**: Personal posts and statistics

### Interacting
- **Like posts** with heart button
- **Comment** with nested reply support
- **Follow users** for personalized feed
- **Bookmark** posts for later viewing

## 🎨 Design Philosophy

OnlyMsg follows a **Pinterest-inspired design** with:
- **Visual-first approach** showcasing chat screenshots
- **Grid layout** for optimal content discovery
- **Clean, minimal interface** focusing on content
- **Consistent spacing** and typography
- **Accessible color schemes** for all users

## 🚀 Performance Features

- **Lazy Loading** for images and components
- **Virtual Scrolling** for large lists
- **Optimistic Updates** for immediate feedback
- **Smart Caching** with React Query
- **Image Compression** for faster loading
- **IndexedDB** for offline capability

## 🛠️ Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries and APIs
├── pages/          # Route components
├── types/          # TypeScript type definitions
└── data/           # Static data and configurations
```

### Key Components
- `MainFeed.tsx` - Pinterest-style post grid
- `PostDetail.tsx` - Individual post view with image scrolling
- `SharePost.tsx` - Post creation form
- `PinterestSidebar.tsx` - Navigation and branding

### Development Tools
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeScript** for type checking
- **Vite** for fast hot reload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Lucide React** for clean, consistent icons
- **Tailwind CSS** for utility-first styling
- **React Query** for excellent data fetching
- **Google Identity Services** for OAuth integration

---

<div align="center">
  <p>Built with ❤️ for sharing stories and connecting people</p>
  <p><strong>OnlyMsg</strong> - Where conversations become stories</p>
</div>