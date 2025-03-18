# Flowers&Saints Dashboard

A modern, responsive financial dashboard application built with Next.js, featuring authentication, protected routes, and a responsive UI.

![Dashboard Screenshot](https://via.placeholder.com/800x450.png?text=Flowers%26Saints+Dashboard)

## Features

- 🔐 Authentication system with protected routes
- 🌓 Light/dark mode toggle
- 📱 Responsive design with collapsible sidebar
- 📊 Financial dashboard with analytics
- 👤 User profile and settings management
- 🔔 Notifications system
- 🔄 Transaction management

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/flowers-and-saints-dashboard.git
   cd flowers-and-saints-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8081/api
   
   # Authentication (optional)
   NEXT_PUBLIC_AUTH_COOKIE_NAME=user
   ```

### Running the Application

1. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/
│   ├── (protected)/        # Routes that require authentication
│   │   ├── page.tsx        # Dashboard home
│   │   ├── analytics/      # Analytics pages
│   │   ├── settings/       # Settings pages
│   │   └── ...            # Other protected pages
│   ├── (public)/           # Routes that don't require authentication
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   └── layout.tsx          # Root layout
├── components/             # UI components
│   ├── ui/                 # Shared UI components
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── top-nav.tsx         # Top navigation bar
│   └── ...                # Other components
├── contexts/               # React context providers
│   ├── auth-context.tsx    # Authentication context
│   └── settings-context.tsx # User settings context
├── lib/                    # Utility functions and services
│   └── utilApiService.ts   # API service with Axios
└── middleware.ts           # Authentication middleware
```

## Authentication

The application uses a token-based authentication system:

1. Users can register and login through the provided forms
2. Authentication state is managed through the AuthContext
3. Protected routes are guarded by the middleware and layout components
4. The sidebar and top navigation are only shown to authenticated users

### Mock Authentication

During development, the application can use mock authentication:

```typescript
// To use mock authentication in the auth-context.tsx:
if (process.env.NODE_ENV === 'development') {
  // Mock user login logic
}
```

## Backend Connection

The application is designed to connect to a Spring backend API:

- The default API URL is: `http://localhost:8081/api`
- The API connection is managed through `utilApiService.ts` using Axios
- Ensure your backend has proper CORS configuration:

```java
// Sample Spring CORS configuration
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Building for Production

```bash
npm run build
# or
yarn build
```

After building, you can start the production server:

```bash
npm start
# or
yarn start
```

## Deployment

The application can be deployed to any platform that supports Next.js, such as:

- Vercel
- Netlify
- AWS Amplify
- Self-hosted servers

## Troubleshooting

### Network Error (ERR_NETWORK)

If you encounter a network error when trying to connect to the backend:

1. Check if your backend server is running at the configured URL
2. Verify the `NEXT_PUBLIC_API_URL` in your `.env.local` file
3. Ensure your backend has CORS properly configured
4. Check browser console for specific error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details. 