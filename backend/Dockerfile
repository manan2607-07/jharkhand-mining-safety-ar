FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --production

COPY . .

# Ensure data directory has proper non-root permissions
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 5001

CMD ["node", "src/server.js"]
