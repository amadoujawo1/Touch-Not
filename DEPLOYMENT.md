# Deployment Guide

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- Redis Server (optional, for caching)
- Web Server (e.g., Nginx or Apache)
- SSL/TLS Certificate for HTTPS

## Production Setup Steps

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Touch-Not
pip install -r requirements.txt
```

### 2. Environment Configuration

1. Copy the production environment template:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edit `.env.production` with your production values:
   - Set secure database credentials
   - Configure a strong SECRET_KEY
   - Set up Redis if using caching
   - Configure SSL paths

### 3. Database Setup

1. Create production database:
   ```sql
   CREATE DATABASE cash_collection;
   ```

2. Run database migrations:
   ```bash
   flask db upgrade
   ```

### 4. Web Server Configuration

#### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5. Application Server

We recommend using Gunicorn as the WSGI server:

```bash
gunicorn -w 4 -b 127.0.0.1:8000 app:app
```

### 6. Security Checklist

- [ ] SSL/TLS certificate installed
- [ ] Strong SECRET_KEY set
- [ ] Secure database credentials
- [ ] Debug mode disabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Regular security updates

### 7. Monitoring

Consider setting up:
- Application monitoring (e.g., Sentry)
- Server monitoring (e.g., Prometheus)
- Log aggregation (e.g., ELK Stack)

### 8. Backup Strategy

1. Database backups:
   ```bash
   mysqldump -u user -p cash_collection > backup.sql
   ```

2. Implement automated backup schedule

### 9. Maintenance

- Regular security updates
- Database optimization
- Log rotation
- Performance monitoring

## Troubleshooting

### Common Issues

1. Database Connection
   - Verify DATABASE_URL in .env.production
   - Check database user permissions

2. Server Issues
   - Check log files
   - Verify port availability
   - Check file permissions

### Support

For additional support:
- Check documentation
- Contact system administrator
- Review error logs