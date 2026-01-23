# --------------------------------------------------
# 1) Build stage
# --------------------------------------------------
FROM node:20-alpine3.21 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --------------------------------------------------
# 2) Runtime stage
# --------------------------------------------------
FROM nginx:1.27-alpine3.21

# Security updates
RUN apk update && apk upgrade --no-cache

# Clean default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
