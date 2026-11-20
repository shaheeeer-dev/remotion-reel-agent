---
title: "Docker Containers vs Virtual Machines"
category: "Docker"
source_type: "general_devops"
source_url: "https://docs.docker.com/get-started/overview/#what-is-a-container"
doc_version: "v26.1"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["docker", "containers", "virtualization", "cgroups", "namespaces"]
---

# Docker Containers vs Virtual Machines

A **Docker container** is a standard unit of software that packages code and all its dependencies so the application runs quickly and reliably across different computing environments.

### Core Architecture
- **Shared Host Kernel:** Unlike virtual machines, containers run directly on the host operating system's Linux kernel.
- **Process Isolation (Namespaces):** Linux namespaces provide isolated workspaces (PID for process IDs, NET for network interfaces, MNT for mount points, IPC, and UTS).
- **Resource Limiting (Cgroups):** Control groups allocate and limit CPU, memory, and disk I/O per container.
- **Speed & Efficiency:** A container starts in milliseconds and consumes megabytes of memory, whereas a virtual machine bundles a full guest OS, hypervisor, and virtual hardware (gigabytes of RAM and minutes of boot time).

### Key Command
```bash
docker run -d --name web -p 80:80 nginx:alpine
```
