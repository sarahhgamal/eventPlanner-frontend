FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/eventPlanner-frontend/browser /usr/share/nginx/html

# custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# writable directories for nginx temporary files
RUN mkdir -p /tmp/nginx_client_temp /tmp/nginx_proxy_temp /tmp/nginx_fastcgi_temp \
    /tmp/nginx_uwsgi_temp /tmp/nginx_scgi_temp && \
    # set permissions for OpenShift
    chmod -R 777 /tmp && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    touch /tmp/nginx.pid && \
    chmod 666 /tmp/nginx.pid

# switch to non-root user
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]