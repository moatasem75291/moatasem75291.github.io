FROM node:24-alpine AS build
WORKDIR /portfolio
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm test && npm run build

FROM node:24-alpine AS site
WORKDIR /portfolio
COPY --from=build /portfolio/out ./out
COPY scripts/preview.mjs ./scripts/
USER node
ENV PREVIEW_BIND=0.0.0.0
EXPOSE 4173
CMD ["node", "scripts/preview.mjs"]

FROM node:24-alpine AS authoring
WORKDIR /portfolio
COPY --chown=node:node content ./content
COPY --chown=node:node service ./service
RUN mkdir -p service/data && chown node:node service/data
USER node
ENV PORTFOLIO_ADMIN_BIND=0.0.0.0
EXPOSE 8787
CMD ["node", "service/server.mjs"]
