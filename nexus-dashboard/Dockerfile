FROM node:20-alpine
WORKDIR /app
# Mock dashboard for now
RUN echo "<h1>Nexus Dashboard Placeholder</h1>" > index.html
EXPOSE 3000
CMD ["sh", "-c", "echo 'Nexus Dashboard Running'; tail -f /dev/null"]
