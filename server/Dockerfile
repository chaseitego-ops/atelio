# Atelio backend — zero npm deps; Node 24 has stable node:sqlite + fetch.
FROM node:24-alpine
WORKDIR /app
COPY . .
ENV PORT=8080
ENV DATA_DIR=/data
EXPOSE 8080
CMD ["node", "--no-warnings", "index.mjs"]
