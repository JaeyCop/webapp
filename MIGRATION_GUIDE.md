# Migration Guide: Upgrading to Enhanced CMS

## 🚀 Step-by-Step Migration Process

### 1. Run the Migration Script

```bash
wrangler d1 execute blog-cms --file=migration_to_enhanced.sql --remote
```

### 2. Verify Migration Success

```bash
wrangler d1 execute blog-cms --file=test_migration.sql --remote
```

You should see:
- All new tables created (categories, media_files, comments, etc.)
- New columns added to existing tables
- Default data inserted
- Indexes created

### 3. Update Dependencies

```bash
npm install
```

This will install the new packages:
- Enhanced TipTap editor extensions
- Syntax highlighting (lowlight)
- Theme utilities (clsx, tailwind-merge)
- Table extensions

### 4. Test the Enhanced Features

1. **Login to Admin**: Visit `/admin/login`
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Try Enhanced Dashboard**: Visit `/admin/dashboard/enhanced`
   - Check the new tabbed interface
   - Test dark mode toggle
   - View analytics dashboard

3. **Create Enhanced Article**: Visit `/admin/articles/enhanced`
   - Test the rich text editor
   - Try adding categories and tags
   - Upload featured images
   - Set SEO metadata

### 5. Backup Your Data (Recommended)

Before going live, backup your database:

```bash
wrangler d1 export blog-cms --output backup-$(date +%Y%m%d).sql
```

## 🔧 Troubleshooting

### Common Issues:

**1. Migration Fails on Specific Column**
```sql
-- If a column already exists, you might see errors like:
-- "duplicate column name: column_name"
-- This is usually safe to ignore
```

**2. Foreign Key Constraints**
```sql
-- SQLite doesn't support adding foreign keys to existing tables
-- The app handles relationships in the application logic
```

**3. Missing Dependencies**
```bash
# If you get import errors, ensure all packages are installed
npm install --force
```

### Rollback Plan:

If something goes wrong, you can restore from backup:

```bash
# Restore from backup
wrangler d1 execute blog-cms --file=backup-YYYYMMDD.sql --remote
```

## 📊 What's New After Migration

### Enhanced Tables:
- **users**: Added avatar, bio, 2FA support
- **articles**: Added SEO fields, categories, view tracking
- **tags**: Added colors, descriptions, usage tracking

### New Tables:
- **categories**: Hierarchical content organization
- **media_files**: Advanced file management
- **comments**: User engagement system
- **analytics_events**: Performance tracking
- **settings**: Site configuration
- **newsletter_subscribers**: Email marketing

### New Features Available:
- ✅ Rich text editor with syntax highlighting
- ✅ Dark mode support
- ✅ SEO optimization tools
- ✅ Media library with folders
- ✅ Analytics dashboard
- ✅ Category management
- ✅ Article scheduling
- ✅ Comment system

## 🎯 Next Steps

1. **Customize Settings**: Update site title, description, etc.
2. **Create Categories**: Organize your content
3. **Upload Media**: Test the media library
4. **Write Enhanced Articles**: Use the new editor
5. **Monitor Analytics**: Track your content performance

## 🔐 Security Notes

- Change default admin password immediately
- Update JWT_SECRET in production
- Configure proper CORS for media uploads
- Enable 2FA for admin accounts (optional)

Your CMS is now upgraded with enterprise-level features! 🎉