# --------------------------------------
# 1) Build stage (Node 20)
# --------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Build the Vite production bundle
RUN npm run build


# --------------------------------------
# 2) Run stage (Nginx)
# --------------------------------------
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
