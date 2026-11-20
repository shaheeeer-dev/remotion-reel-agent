---
title: "Understanding CrashLoopBackOff in Kubernetes"
category: "Kubernetes"
source_type: "general_devops"
source_url: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy"
doc_version: "v1.30"
retrieved_at: "2026-11-20"
difficulty: "intermediate"
is_verified: true
tags: ["kubernetes", "k8s", "crashloopbackoff", "debugging", "pod-lifecycle"]
---

# Why Do Kubernetes Pods Get Stuck in CrashLoopBackOff?

`CrashLoopBackOff` is not an error code; it is a **Kubernetes Pod state** indicating that a container starts, fails, crashes, and Kubernetes is waiting with exponential backoff before trying to restart it again.

### The Lifecycle Loop
1. Container starts up on a node.
2. The application process exits with a non-zero code or gets killed (OOMKilled, missing environment variables, failing health probe, database connection error).
3. The Kubelet attempts to restart the container in accordance with the pod's `restartPolicy: Always`.
4. To avoid overloading the host node with infinite instant restarts, Kubernetes introduces a delay: 10s -> 20s -> 40s -> up to 5 minutes (`BackOff`).

### Diagnostic Commands
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
```
