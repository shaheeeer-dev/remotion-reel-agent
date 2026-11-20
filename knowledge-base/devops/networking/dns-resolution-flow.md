---
title: "How DNS Resolution Works in Linux"
category: "Networking"
source_type: "general_devops"
source_url: "https://man7.org/linux/man-pages/man5/resolv.conf.5.html"
doc_version: "POSIX.1-2017"
retrieved_at: "2026-11-20"
difficulty: "beginner"
is_verified: true
tags: ["networking", "dns", "resolv.conf", "hosts", "systemd-resolved"]
---

# What Happens When You Type a Domain Name in Linux?

Resolving `api.learnops.dev` to an IP address (`104.21.56.2`) follows an exact hierarchical resolution order:

1. **Local `/etc/hosts` File:** The Linux resolver (`nsswitch.conf`) checks if the hostname is explicitly mapped statically in `/etc/hosts`.
2. **Local Resolver Cache (`systemd-resolved`):** Modern Linux distributions check the local DNS stub listener at `127.0.0.53:53` to serve cached responses.
3. **Upstream Nameservers (`/etc/resolv.conf`):** If not cached, the query is forwarded to the upstream recursive resolver (e.g., `8.8.8.8` or cloud DNS).
4. **Root & TLD Servers:** The recursive resolver queries the Root DNS servers (`.`), then the Top-Level Domain servers (`.dev`), and finally the Authoritative Nameserver for `learnops.dev` to get the A record.

### Key Inspection Tools
```bash
dig api.learnops.dev +trace
cat /etc/resolv.conf
```
