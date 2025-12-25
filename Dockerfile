FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/eventPlanner-frontend/browser /usr/share/nginx/html

RUN echo 'client_body_temp_path /tmp/nginx/client_temp; \
proxy_temp_path /tmp/nginx/proxy_temp; \
fastcgi_temp_path /tmp/nginx/fastcgi_temp; \
uwsgi_temp_path /tmp/nginx/uwsgi_temp; \
scgi_temp_path /tmp/nginx/scgi_temp; \
pid /tmp/nginx.pid; \
events {} \
http { \
  include /etc/nginx/mime.types; \
  server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
      try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
      proxy_pass http://backend:3003/api/; \
      proxy_set_header Host $host; \
      proxy_set_header X-Real-IP $remote_addr; \
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    } \
  } \
}' > /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]