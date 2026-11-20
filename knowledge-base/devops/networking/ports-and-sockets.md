---
title: "Understanding Ports, Sockets, and IP Binding"
category: "Networking"
source_type: "general_devops"
source_url: "https://man7.org/linux/man-pages/man7/ip.7.html"
doc_version: "POSIX.1-2017"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["networking", "ports", "sockets", "localhost", "0.0.0.0", "ss"]
---

# Ports, Sockets, and 127.0.0.1 vs 0.0.0.0

A **network socket** is an operating system abstraction representing the endpoint of a two-way network communication flow. It is defined by an IP address and a Port Number (e.g., `127.0.0.1:8080`).

### The Critical IP Binding Distinction
- **`127.0.0.1` (Localhost Loopback):** Only processes running inside the exact same host machine can connect to this port. External requests from the local network or internet are rejected by the kernel.
- **`0.0.0.0` (All Interfaces):** Tells the kernel to listen on every available network interface (loopback, local Wi-Fi/Ethernet, and public IP). This allows remote traffic to reach the server.

### Essential Terminal Inspection
```bash
# Check listening TCP sockets and the processes owning them
ss -tulpn
```
