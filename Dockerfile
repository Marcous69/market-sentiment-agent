FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy patch script and apply it
COPY scripts/patch.js ./scripts/
RUN bun scripts/patch.js

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 8080
ENV PORT=8080

# Start the app
CMD ["bun", "run", "src/index.ts"]
