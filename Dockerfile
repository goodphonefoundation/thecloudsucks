FROM node:24

RUN npm install -g pnpm

EXPOSE 3000

WORKDIR /app

CMD ["/bin/bash", "-c", "pnpm i && pnpm dev"]
