# Use Ubuntu 24.04 as the base image
FROM ubuntu:24.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set up environment variables
ENV NODE_VERSION=20.x

# Install Node.js 20 and common dependencies
RUN apt-get update && apt-get install -y \
    curl \
    zip \
    unzip \
    git \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify Node.js version
RUN node --version

# Allow custom apt dependencies to be passed as build argument
ARG CUSTOM_APT_DEPS=""

# Install custom apt dependencies if provided
RUN if [ ! -z "$CUSTOM_APT_DEPS" ]; then \
        apt-get update && apt-get install -y $CUSTOM_APT_DEPS \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*; \
    fi

# Allow custom global npm packages to be passed as build argument
ARG GLOBAL_NPM_PACKAGES=""

# Install custom global npm packages if provided
RUN if [ ! -z "$GLOBAL_NPM_PACKAGES" ]; then \
        npm install -g $GLOBAL_NPM_PACKAGES; \
    fi

# Set the working directory in the container
WORKDIR /app

# Copy the pre-built application
COPY ./.build /app

# Expose the port the app runs on
EXPOSE 2600

# Note: Environment variables (JOYSTICK_SETTINGS, PUSH_INSTANCE_TOKEN)
# will be passed at runtime via the container.env file

# Command to run the application
CMD ["node", "index.server.js"]