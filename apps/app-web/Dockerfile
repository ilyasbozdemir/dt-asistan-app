FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package requirements
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application source code
COPY . .

# Disable telemetry during runtime/build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "start"]
