---
title: "Nginx Reverse Proxy & Load Balancing"
category: "Nginx"
source_type: "general_devops"
source_url: "https://nginx.org/en/docs/http/ngx_http_proxy_module.html"
doc_version: "v1.26"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["nginx", "reverse-proxy", "load-balancer", "http", "proxy_pass"]
---

# What is an Nginx Reverse Proxy?

A **forward proxy** acts on behalf of clients (e.g., hiding internal corporate devices). A **reverse proxy** acts on behalf of backend servers:

### Core Benefits
- **Single Public Entrypoint:** Clients connect to Nginx on port 80/443; Nginx forwards requests to private internal app services (e.g. Node.js on `localhost:3000`, Python API on `localhost:5000`).
- **SSL Termination:** Nginx handles TLS/HTTPS encryption and decryption, freeing backend microservices from cryptographic overhead.
- **Load Balancing:** Automatically distributes requests across multiple backend servers using algorithms like round-robin, least-connected, or ip-hash.

### Minimal Configuration Example
```nginx
server {
    listen 80;
    server_name api.learnops.dev;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
