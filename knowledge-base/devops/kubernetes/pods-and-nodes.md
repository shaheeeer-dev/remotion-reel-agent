---
title: "Kubernetes Pods and Worker Nodes"
category: "Kubernetes"
source_type: "general_devops"
source_url: "https://kubernetes.io/docs/concepts/workloads/pods/"
doc_version: "v1.30"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["kubernetes", "k8s", "pods", "nodes", "containers", "kubelet"]
---

# What is a Kubernetes Pod?

A **Pod** is the smallest deployable computing unit in Kubernetes:

### Key Characteristics
- **One or More Containers:** A Pod typically runs a single primary container, but can run tightly coupled "sidecar" containers (e.g., envoy proxy or log forwarder).
- **Shared Network Namespace:** All containers within the same Pod share the exact same IP address and port space. They communicate via `localhost`.
- **Shared Storage Volumes:** Containers in a Pod can mount the same volume for shared files or caches.
- **Node Execution:** Worker Nodes run the `kubelet` agent, which talks to the container runtime (CRI) to start and monitor pods assigned by the control plane scheduler.
