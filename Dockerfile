FROM php:8.2-apache

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy everything in
COPY . .

# Create .htpasswd from the railway secret
# RUN echo "$HTPASSWD_B64" | base64 -d > /etc/apache2/.htpasswd
ARG HTPASSWD_B64
RUN echo $HTPASSWD_B64 | base64 -d > /etc/apache2/.htpasswd && cat /etc/apache2/.htpasswd

RUN chmod 640 /etc/apache2/.htpasswd
RUN chown www-data:www-data /etc/apache2/.htpasswd

# Install and build React app
RUN cd frontend && npm install && npm run build

# Copy only the API directory from backend 
RUN cp -r backend/public/api /var/www/html/

# Move built React frontend into Apache root
RUN cp -r frontend/dist/* /var/www/html/

# Expose the default web port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]