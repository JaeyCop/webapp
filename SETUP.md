# Enhanced CMS Setup Guide

This guide will help you set up and deploy the enhanced blog CMS with all its new features.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)
- Basic knowledge of Next.js and React

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all the new packages including:
- Enhanced TipTap editor extensions
- Syntax highlighting support
- Theme management utilities
- Additional UI components

### 2. Database Setup

The enhanced CMS uses a more sophisticated database schema. You have two options:

#### Option A: Use Enhanced Schema (Recommended)
```bash
# Use the new enhanced schema
cp schema_enhanced.sql schema.sql
```

#### Option B: Migrate Existing Data
If you have existing data, you'll need to run migration scripts:
```bash
# Backup your existing data first
# Then apply the enhanced schema additions
```

### 3. Environment Configuration

Create or update your `.env.local` file:

```env
# Database
DATABASE_URL=your_d1_database_url

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Media Storage
R2_BUCKET_NAME=your_r2_bucket_name
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key

# Analytics (optional)
ANALYTICS_ENABLED=true

# Theme
DEFAULT_THEME=light

# Site Configuration
SITE_URL=https://yourdomain.com
SITE_NAME=Your Enhanced Blog
```

### 4. Database Migration

Run the enhanced database schema:

```bash
# If using Cloudflare D1
wrangler d1 execute your-database --file=schema_enhanced.sql

# Or import via your database management tool
```

### 5. Development Server

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see your enhanced CMS.

## 🎨 Customization Options

### Theme Configuration

The enhanced CMS supports multiple themes. You can customize them in:

- `components/ThemeProvider.tsx` - Theme logic
- `app/globals.css` - CSS custom properties
- Tailwind configuration for dark mode

### Editor Customization

Customize the enhanced editor in `components/EnhancedEditor.tsx`:

```typescript
// Add custom extensions
const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    Link,
    CodeBlockLowlight,
    Table,
    // Add your custom extensions here
  ],
  // ... other config
});
```

### Dashboard Layout

Modify the dashboard in `app/admin/dashboard/enhanced/page.tsx`:

```typescript
// Add new tabs or sections
const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'media', label: 'Media', icon: ImageIcon },
  // Add your custom tabs here
];
```

## 🔧 Feature Configuration

### Analytics Setup

Enable analytics tracking:

1. Set `ANALYTICS_ENABLED=true` in your environment
2. The system will automatically track page views and user interactions
3. View analytics in the admin dashboard under the "Analytics" tab

### Media Management

Configure media upload limits:

```typescript
// In components/MediaLibrary.tsx
const maxFileSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = ['image/*', 'video/*']; // Customize allowed types
```

### SEO Configuration

Set up default SEO settings:

```typescript
// In your article creation logic
const defaultSEO = {
  metaTitle: article.title,
  metaDescription: article.excerpt,
  ogTitle: article.title,
  ogDescription: article.excerpt,
  ogImage: article.featured_image
};
```

## 📱 Mobile Optimization

The enhanced CMS is fully responsive. Test on different devices:

```bash
# Test mobile view
npm run dev
# Open browser dev tools and toggle device simulation
```

## 🚀 Deployment

### Cloudflare Workers Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Deploy to Cloudflare:**
```bash
npm run deploy
```

3. **Set up environment variables in Cloudflare:**
   - Go to your Cloudflare Workers dashboard
   - Add all environment variables from your `.env.local`

### Database Setup on Cloudflare

1. **Create D1 Database:**
```bash
wrangler d1 create your-blog-db
```

2. **Run migrations:**
```bash
wrangler d1 execute your-blog-db --file=schema_enhanced.sql
```

3. **Update wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "your-blog-db"
database_id = "your-database-id"
```

### R2 Storage Setup

1. **Create R2 Bucket:**
```bash
wrangler r2 bucket create your-media-bucket
```

2. **Update wrangler.toml:**
```toml
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "your-media-bucket"
```

## 🔐 Security Configuration

### Admin User Setup

Create your first admin user:

```sql
INSERT INTO users (id, email, name, password_hash, role) 
VALUES (
  'admin-1', 
  'your-email@example.com', 
  'Your Name', 
  '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 
  'admin'
);
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Important: Change these credentials immediately after setup!**

### JWT Security

Generate a secure JWT secret:

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📊 Monitoring & Maintenance

### Health Checks

The enhanced CMS includes built-in health monitoring:

- Database connectivity
- R2 storage access
- API response times
- Error rates

### Backup Strategy

Set up automated backups:

1. **Database backups:**
```bash
# Schedule regular D1 exports
wrangler d1 export your-blog-db --output backup-$(date +%Y%m%d).sql
```

2. **Media backups:**
   - R2 automatically provides durability
   - Consider cross-region replication for critical media

### Performance Monitoring

Monitor your CMS performance:

- Use Cloudflare Analytics for traffic insights
- Monitor Core Web Vitals
- Track API response times
- Set up alerts for errors

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors:**
   - Ensure all dependencies are installed
   - Check TypeScript errors
   - Verify environment variables

2. **Database Connection:**
   - Verify D1 database binding
   - Check database permissions
   - Ensure schema is up to date

3. **Media Upload Issues:**
   - Check R2 bucket permissions
   - Verify file size limits
   - Ensure proper CORS configuration

4. **Theme Not Working:**
   - Check if ThemeProvider is properly wrapped
   - Verify Tailwind dark mode configuration
   - Clear browser cache

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=true
```

### Getting Help

- Check the GitHub issues for common problems
- Review the enhanced documentation
- Test with the provided example data

## 🎯 Next Steps

After setup, explore these enhanced features:

1. **Create your first enhanced article** with the new editor
2. **Set up categories and tags** for better organization
3. **Configure SEO settings** for better search visibility
4. **Upload media files** to test the media library
5. **Check analytics** to understand your content performance
6. **Customize the theme** to match your brand

The enhanced CMS is now ready for production use with enterprise-level features!