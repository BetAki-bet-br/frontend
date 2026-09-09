# syntax=docker/dockerfile:1
#
# The site's image: a brand's build served by nginx.
#
# Two ways to the same place, and the target picks which:
#
#   docker build --build-arg HOUSE_BRAND_API_KEY=... -t girosbet-web .
#       The default. Copies a `dist/` already built on the host, and is what the home server's
#       deploy uses: that box has 4 CPUs, and `npm ci` + the API client generator + `ng build`
#       there run far past the ten minutes it would be worth waiting. Build it first with:
#           npm run build:girosbet-house
#
#   docker build --target source --build-arg HOUSE_BRAND_API_KEY=... -t girosbet-web .
#       Builds everything inside the image, depending on nothing from the host. It needs a JRE,
#       because `postinstall` generates the TypeScript API client from `swagger.json` and the
#       openapi-generator is Java.
#
# `HOUSE_BRAND_API_KEY` is the brand's key on the house backend (see
# `brands/girosbet/brand.config.ts`). In a browser app it is not a secret, since it travels on
# every request, but each install has its own, and this is where the install's key enters the
# bundle.

# --------------------------------------------------------------------------------- source
# The full build, from scratch. Not the default target; see the header.
FROM node:22 AS build
WORKDIR /app

# `postinstall` runs `npm run generate-api`, which is the openapi-generator, which is Java.
RUN apt-get update \
 && apt-get install --no-install-recommends -y default-jre-headless \
 && rm -rf /var/lib/apt/lists/*

# While the lock file does not change, this layer comes from the cache. The three extra paths are
# what `postinstall` needs: `scripts/` copies the shared templates, `ngx-atl-pp-templates-shared/`
# is where they come from, and `swagger.json` is the generator's input.
COPY package.json package-lock.json openapitools.json swagger.json ./
COPY scripts/ scripts/
COPY ngx-atl-pp-templates-shared/ ngx-atl-pp-templates-shared/
# `husky install` only means something in a clone with a `.git`, and the `prettier` step of
# `postinstall` wants `src/`, which is not here yet: both are for whoever edits, not for whoever
# publishes.
RUN npm ci --ignore-scripts \
 && node scripts/copy-shared-templates.js \
 && npm run generate-api

COPY . .

ARG HOUSE_BRAND_API_KEY=
RUN if [ -n "$HOUSE_BRAND_API_KEY" ]; then \
      sed -i "s|^const HOUSE_BRAND_API_KEY = '.*';|const HOUSE_BRAND_API_KEY = '${HOUSE_BRAND_API_KEY}';|" \
        brands/girosbet/brand.config.ts; \
    fi \
 && npm run build:girosbet-house

FROM nginx:alpine AS source
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/girosbet-house/browser /usr/share/nginx/html

# ----------------------------------------------------------------------------------- dist
# The default target: the `dist/` arrives ready from the host.
FROM nginx:alpine AS dist
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/girosbet-house/browser /usr/share/nginx/html

# The brand key goes into the already-built bundle here, rather than into the source as the
# `source` target does: `ng build` happened on the host, before this image existed, and the
# server's value is only known now. What gets replaced is the development key, which is the
# default in `brand.config.ts` and its only spelling in the bundle; with no build arg nothing is
# touched and the build still talks to a development gateway.
#
# `find` rather than `grep --include`: this image's grep is busybox's, which does not know
# `--include` and exits with a usage error in the middle of a pipe, which is to say silently.
ARG HOUSE_BRAND_API_KEY=
RUN if [ -n "$HOUSE_BRAND_API_KEY" ]; then \
      find /usr/share/nginx/html -name '*.js' \
        -exec sed -i "s/dev-girosbet-key/${HOUSE_BRAND_API_KEY}/g" {} + ; \
      grep -rq "$HOUSE_BRAND_API_KEY" /usr/share/nginx/html \
        || { echo "the brand key did not make it into the bundle" >&2; exit 1; }; \
    fi
