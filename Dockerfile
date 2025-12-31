FROM node:24-alpine

RUN apk add --no-cache bash git wget \
     && npm install -g pnpm@latest

WORKDIR /app

EXPOSE 3000

CMD ["/bin/bash", "-c", "pnpm install --frozen-lockfile && pnpm dev"]
