---
title: "Docker Networking: Bridge vs Host Mode"
category: "Docker"
source_type: "general_devops"
source_url: "https://docs.docker.com/engine/network/drivers/bridge/"
doc_version: "v26.1"
retrieved_at: "2026-11-20"
difficulty: "intermediate"
is_verified: true
tags: ["docker", "networking", "bridge", "host", "iptables", "port-binding"]
---

# Docker Bridge vs Host Networking

Docker provides several network drivers to control container connectivity:

### 1. Bridge Network (Default)
- **Isolation:** Containers connect to a private internal virtual bridge network (`docker0`, typically subnet `172.17.0.0/16`).
- **Port Mapping (`-p host:container`):** Uses Linux `iptables` NAT (Network Address Translation) to route external incoming traffic from the host port to the internal container IP.
- **Security:** Containers on different user-defined bridges cannot talk to each other without explicit links.

### 2. Host Network (`--network host`)
- **No Network Isolation:** The container shares the host machine's exact network stack directly.
- **No Port Mapping:** If the container listens on port 80, it binds directly to the host's port 80.
- **Maximum Throughput:** Eliminates iptables NAT overhead for ultra-low-latency high-throughput networking.
