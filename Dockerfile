FROM php:8.2-apache

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy everything in
COPY . .

# Install and build React app
RUN cd frontend && npm install && npm run build

# Move built frontend into Apache root
RUN cp -r frontend/dist/* /var/www/html/

# Copy backend files to Apache root
RUN cp -r backend/public/* /var/www/html/

# Expose the default web port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]