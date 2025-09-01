# Production Deployment Guide

This guide will help you deploy the Blog CMS to production using Cloudflare Workers, D1, and R2.

## Prerequisites

1. Cloudflare account with Workers, D1, and R2 enabled
2. Wrangler CLI installed and authenticated
3. Node.js 18+ installed

## Environment Setup

### 1. Create Environment Files

Copy the example environment file:
```bash
cp .env.example .env.local
```

Update the values in `.env.local` for your local development.

### 2. Create Cloudflare Resources

#### Create D1 Databases

```bash
# Development
wrangler d1 create blog-cms-dev

# Staging
wrangler d1 create blog-cms-staging

# Production
wrangler d1 create blog-cms-production
```

#### Create R2 Buckets

```bash
# Development
wrangler r2 bucket create blog-cms-media-dev

# Staging
wrangler r2 bucket create blog-cms-media-staging

# Production
wrangler r2 bucket create blog-cms-media-production
```

### 3. Update Wrangler Configurations

Update the `database_id` values in:
- `wrangler.jsonc` (development)
- `wrangler.staging.jsonc` (staging)
- `wrangler.production.jsonc` (production)

Use the database IDs returned from the `wrangler d1 create` commands.

### 4. Set Up Database Schema

Run migrations for each environment:

```bash
# Development
npm run db:migrate:dev

# Staging
npm run db:migrate:staging

# Production
npm run db:migrate:production
```

### 5. Configure Secrets

#### Staging Environment
```bash
wrangler secret put JWT_SECRET --env staging
wrangler secret put ADMIN_EMAIL --env staging
wrangler secret put ADMIN_PASSWORD --env staging
```

#### Production Environment
```bash
wrangler secret put JWT_SECRET --env production
wrangler secret put ADMIN_EMAIL --env production
wrangler secret put ADMIN_PASSWORD --env production
```

**Important**: Use strong, unique values for production:
- `JWT_SECRET`: A long, random string (at least 32 characters)
- `ADMIN_EMAIL`: Your admin email address
- `ADMIN_PASSWORD`: A strong password for the admin account

### 6. Configure R2 Public Access (Optional)

For public image access, you can either:

1. **Use R2.dev subdomain** (default):
   - Images will be accessible at `https://your-bucket-name.r2.dev/images/filename.jpg`
   - No additional setup required

2. **Use custom domain**:
   - Set up a custom domain in Cloudflare
   - Update `R2_PUBLIC_URL` in your environment variables
   - Configure CORS if needed

## Deployment

### Development Deployment
```bash
npm run deploy:dev
```

### Staging Deployment
```bash
npm run deploy:staging
```

### Production Deployment
```bash
npm run deploy:production
```

## Post-Deployment Setup

### 1. Create Admin User

After first deployment, you'll need to create an admin user in your D1 database:

```sql
INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
VALUES (
  'admin-user-id',
  'your-admin-email@domain.com',
  'Admin User',
  'admin',
  'your-hashed-password',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

### 2. Test the Application

1. Visit your deployed application
2. Navigate to `/admin/login`
3. Log in with your admin credentials
4. Test creating articles and uploading images

## Environment Variables Reference

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-32-chars-min` |
| `ADMIN_EMAIL` | Admin user email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Admin user password | `SecurePassword123!` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `Blog CMS` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://your-domain.com` |
| `R2_PUBLIC_URL` | R2 bucket public URL | `https://bucket-name.r2.dev` |
| `ENABLE_ANALYTICS` | Enable analytics | `true` |

## Monitoring and Maintenance

### 1. Monitor Application

- Use Cloudflare Workers Analytics dashboard
- Monitor D1 database usage
- Check R2 storage usage

### 2. Database Backups

Regularly backup your D1 database:
```bash
wrangler d1 export blog-cms-production --output backup-$(date +%Y%m%d).sql
```

### 3. Update Dependencies

Keep dependencies updated:
```bash
npm audit
npm update
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Verify database ID in wrangler config
2. **R2 upload failures**: Check bucket permissions and CORS settings
3. **Authentication issues**: Verify JWT_SECRET is set correctly
4. **Image loading issues**: Check R2_PUBLIC_URL configuration

### Logs

View application logs:
```bash
wrangler tail --env production
```

## Security Considerations

1. **Use strong passwords** for admin accounts
2. **Rotate JWT secrets** regularly
3. **Enable HTTPS** for custom domains
4. **Configure CORS** properly for R2 buckets
5. **Monitor access logs** regularly
6. **Keep dependencies updated**

## Scaling Considerations

1. **D1 limits**: Monitor database size and query limits
2. **R2 storage**: Monitor storage usage and costs
3. **Workers limits**: Monitor CPU time and memory usage
4. **CDN caching**: Configure appropriate cache headers

For more information, refer to the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).