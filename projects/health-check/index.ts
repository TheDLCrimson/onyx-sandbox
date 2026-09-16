import http from "node:http";

const hostname = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const startedAt = process.uptime();
const version = "1.0.0";

// Tracks the total number of incoming requests during this server process.
let totalRequests = 0;
const requestHistory: string[] = [];

const server = http.createServer((request, response) => {
  totalRequests += 1;
  requestHistory.push(new Date().toISOString());
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const pathname = new URL(request.url ?? "/", `http://${hostname}:${port}`).pathname;

  if (pathname === "/metrics") {
    response.statusCode = 200;
    response.end(JSON.stringify({ requests: totalRequests, requestHistory }));
    return;
  }

  if (pathname === "/version") {
    response.statusCode = 200;
    response.end(JSON.stringify({ version }));
    return;
  }

  if (pathname !== "/health") {
    response.statusCode = 404;
    response.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  response.statusCode = 200;
  response.end(
    JSON.stringify({
      status: "ok",
      uptime: Math.floor(process.uptime() - startedAt),
    }),
  );
});

server.listen(port, hostname, () => {
  console.log(`Health check server listening at http://${hostname}:${port}/health; requests recorded: ${totalRequests}`);
});
