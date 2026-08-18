FROM node:20-alpine
RUN apk add --no-cache openssl curl

# Download Cloud SQL Auth Proxy
RUN curl -o /cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.linux.amd64
RUN chmod +x /cloud-sql-proxy

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Use production (PostgreSQL) datasource in place of the local sqlite one.
# prisma/schema/models.prisma is untouched, so both environments share
# the same models.
RUN cp prisma/schema.prod.prisma prisma/schema/schema.prisma

# Delete sqlite migrations (incompatible with PostgreSQL) — prod uses
# `prisma db push` instead, see setup:prod in package.json
RUN rm -rf prisma/migrations

RUN npm run build

RUN chmod +x start.sh

CMD ["sh", "start.sh"]
