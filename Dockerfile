
# Stage 1: Build the Angular application
FROM node:20 AS build

WORKDIR /app

RUN apt-get update && apt-get install -y default-jre

COPY package*.json ./
COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY --from=build /app/dist/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
