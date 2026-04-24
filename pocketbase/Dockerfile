FROM alpine:3.22

ARG PB_VERSION=0.37.3
ARG TARGETARCH

RUN apk add --no-cache ca-certificates unzip

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip /tmp/pocketbase.zip

RUN unzip /tmp/pocketbase.zip -d /pb \
  && rm /tmp/pocketbase.zip \
  && chmod +x /pb/pocketbase

COPY pb_migrations /pb/pb_migrations
COPY docker-entrypoint.sh /usr/local/bin/pocketbase-entrypoint.sh

RUN chmod +x /usr/local/bin/pocketbase-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/pocketbase-entrypoint.sh"]
