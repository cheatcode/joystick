# Use Node.js 20 Slim as the base image
FROM node:20-slim

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory in the container
WORKDIR /app

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

# Copy package.json and package-lock.json (if available)
COPY ./.build/package*.json ./

# Install NPM dependencies
RUN npm ci --only=production

# Add build argument to invalidate cache
ARG CACHEBUST=1

# Copy the rest of the pre-built application
COPY ./.build .

# Expose the port the app runs on
EXPOSE 2600

# Note: Environment variables (JOYSTICK_SETTINGS, PUSH_INSTANCE_TOKEN)
# will be passed at runtime via the container.env file

# Command to run the application
CMD ["node", "index.server.js"]