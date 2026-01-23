# --------------------------------------------------
# 1) Build stage (Node)
# --------------------------------------------------
FROM node:20-alpine3.20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --------------------------------------------------
# 2) Runtime stage (Nginx)
# --------------------------------------------------
FROM nginx:1.27-alpine3.21

# Upgrade OS packages to get security patches
RUN apk update && apk upgrade --no-cache

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
