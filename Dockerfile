# Thank you BretFisher
# https://github.com/BretFisher/nodejs-rocks-in-docker

FROM node:16.14.2-slim as node
WORKDIR /app
COPY --chown=node:node package*.json yarn*.lock ./
RUN npm install
COPY --chown=node:node . .
RUN npm run \!build:tsc

FROM debian:bullseye-slim as handbrake

# https://github.com/HandBrake/HandBrake/releases
ENV HANDBRAKE_VERSION 1.5.1

RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		bzip2 \
		ca-certificates \
		gnupg dirmngr \
		wget \
		autoconf \
		automake \
		autopoint \
		binutils \
		cmake \
		g++ \
		gcc \
		gettext \
		libass-dev \
		libbz2-dev \
		libc6-dev \
		libdrm-dev \
		libgtk-3-dev \
		libjansson-dev \
		liblzma-dev \
		libmp3lame-dev \
		libnuma-dev \
		libopus-dev \
		libspeex-dev \
		libtheora-dev \
		libtool-bin \
		libturbojpeg-dev \
		libva-dev \
		libvorbis-dev \
		libvpx-dev \
		libx264-dev \
		libxml2-dev \
		make \
		meson \
		nasm \
		patch \
		pkg-config \
		python3 \
	; \
	rm -rf /var/lib/apt/lists/*; \
	\
	wget -O handbrake.tar.bz2.sig "https://github.com/HandBrake/HandBrake/releases/download/$HANDBRAKE_VERSION/HandBrake-$HANDBRAKE_VERSION-source.tar.bz2.sig"; \
	wget -O handbrake.tar.bz2 "https://github.com/HandBrake/HandBrake/releases/download/$HANDBRAKE_VERSION/HandBrake-$HANDBRAKE_VERSION-source.tar.bz2"; \
	\
# https://handbrake.fr/openpgp.php or https://github.com/HandBrake/HandBrake/wiki/OpenPGP
	GNUPGHOME="$(mktemp -d)"; export GNUPGHOME; \
	gpg --batch --keyserver keyserver.ubuntu.com --recv-keys '1629 C061 B3DD E7EB 4AE3  4B81 021D B8B4 4E4A 8645'; \
	gpg --batch --verify handbrake.tar.bz2.sig handbrake.tar.bz2; \
	rm -rf "$GNUPGHOME" handbrake.tar.bz2.sig; \
	\
	mkdir -p /tmp/handbrake; \
	tar --extract \
		--file handbrake.tar.bz2 \
		--directory /tmp/handbrake \
		--strip-components 1 \
		"HandBrake-$HANDBRAKE_VERSION" \
	; \
	rm handbrake.tar.bz2; \
	\
	cd /tmp/handbrake; \
	./configure \
# TODO --arch [MODE]         select architecture mode: x86_64
		--build build \
		--disable-gtk-update-checks \
		--enable-fdk-aac \
		--enable-numa \
		--enable-nvenc \
		--enable-qsv \
		--enable-vce \
		--enable-x265 \
	; \
	\
	nproc="$(nproc)"; \
	make -C build -j "$nproc"; \
	make -C build install; \
	\
	cd /; \
	rm -rf /tmp/handbrake; \
	\
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark > /dev/null; \
	find /usr/local \
		-type f \
		\( -executable -o -name '*.so' \) \
		-exec ldd '{}' ';' \
		| awk '/=>/ { print $(NF-1) }' \
		| sort -u \
		| xargs -r dpkg-query --search \
		| cut -d: -f1 \
		| sort -u \
		| xargs -r apt-mark manual \
	; \
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false;

FROM ubuntu:focal-20220404 as base
COPY --from=node /usr/local/include/ /usr/local/include/
COPY --from=node /usr/local/lib/ /usr/local/lib/
COPY --from=node /usr/local/bin/ /usr/local/bin/
RUN corepack disable && corepack enable

RUN npx playwright install-deps firefox

RUN apt-get update \
    && apt-get -qq install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/usr/bin/tini", "--"]

RUN groupadd --gid 1000 node \
    && useradd --uid 1000 --gid node --shell /bin/bash --create-home node \
    && mkdir /app \
    && chown -R node:node /app

COPY --from=handbrake /usr/local/bin/HandBrakeCLI /usr/local/bin/HandBrakeCLI
COPY --from=handbrake /usr/lib/x86_64-linux-gnu/*.so.* /usr/lib/x86_64-linux-gnu/

FROM base as prod
ENV NODE_ENV="production"
WORKDIR /app
COPY --from=node /app/build /app/build
RUN chown -R node:node /app/build/*
USER node
COPY --chown=node:node package*.json yarn*.lock ./
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true npm ci --only=production && npm cache clean --force
RUN npx playwright install firefox
COPY --chown=node:node . .

CMD ["node", "./build/index.js"]
