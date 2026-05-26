FROM node:20-bookworm-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

COPY apps/api/package*.json ./apps/api/
COPY apps/model/requirements.txt ./apps/model/

RUN cd apps/api \
  && npm install --include=dev \
  && pip3 install --no-cache-dir -r /app/apps/model/requirements.txt

COPY apps/api ./apps/api
COPY apps/model ./apps/model

WORKDIR /app/apps/api

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
