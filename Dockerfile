
# Stage 1: Build the Angular application
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm rebuild
RUN npm uninstall @tailwindcss/postcss lightningcss && npm install @tailwindcss/postcss lightningcss
RUN apt-get update && apt-get install -y build-essential

COPY . .

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/website-angular/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
