# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_BASE_URL=""
ARG VITE_APP_ENV="prod"
ARG VITE_API_PREFIX="/api"
ARG VITE_DEFAULT_LOCALE="en"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_API_PREFIX=$VITE_API_PREFIX \
    VITE_DEFAULT_LOCALE=$VITE_DEFAULT_LOCALE

RUN npm run build

FROM nginx:1.27-alpine AS runtime
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80