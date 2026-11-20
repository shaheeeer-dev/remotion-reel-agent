---
title: "The Docker Run Lifecycle"
category: "Docker"
source_type: "general_devops"
source_url: "https://docs.docker.com/reference/cli/docker/container/run/"
doc_version: "v26.1"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["docker", "docker run", "containerd", "runc", "images"]
---

# What Actually Happens When You Run `docker run`?

Executing `docker run -d -p 8080:80 nginx` triggers a coordinated multi-step system workflow:

1. **Local Image Inspection:** Docker Engine checks local storage (`/var/lib/docker`) for the requested image tag (`nginx:latest`).
2. **Registry Pull (OCI):** If not present, the client requests the manifest from Docker Hub or the configured OCI registry, downloads layers in parallel, and verifies layer checksums.
3. **Container Sandbox Creation:** Docker creates a read-write container layer (UnionFS / Overlay2) on top of the immutable image layers.
4. **Namespace & Cgroup Allocation:** The runtime (`containerd` & `runc`) requests Linux namespaces for isolated network, PID, and mounts, configuring memory and CPU limits.
5. **Bridge Network Attachment:** An isolated virtual ethernet pair (`veth`) connects the container's `eth0` to the `docker0` bridge, allocating an internal IP and binding port 8080.
6. **Entrypoint Execution:** The container's primary process (PID 1 inside the container) executes.
