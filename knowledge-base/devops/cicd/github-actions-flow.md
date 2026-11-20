---
title: "CI/CD Automation with GitHub Actions"
category: "CI/CD"
source_type: "general_devops"
source_url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions"
doc_version: "2026.1"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["cicd", "github-actions", "devops", "automation", "pipeline"]
---

# Continuous Integration & Delivery with GitHub Actions

**CI/CD** automates testing, packaging, and zero-downtime deployment whenever developers push code:

### Core Pipeline Stages
1. **Trigger (Event):** An event occurs in the Git repository (e.g., `git push origin main` or opening a Pull Request).
2. **Runner Provisioning:** GitHub spins up an isolated ephemeral runner (Ubuntu VM or Docker container).
3. **Build & Test (CI):** The workflow checks out source code, installs dependencies, runs linters, and executes unit tests.
4. **Container Packaging:** The app is bundled into a production Docker image and pushed to a container registry.
5. **Deployment (CD):** The new container image is rolled out to Kubernetes or cloud servers with canary/blue-green verification.
