import { PrismaClient } from '@prisma/client';
import '../config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LearnOps Social Media Manager database...');

  // 1. Create LearnOps Brand & Profile
  const brand = await prisma.brand.upsert({
    where: { slug: 'learnops' },
    update: {},
    create: {
      slug: 'learnops',
      displayName: 'LearnOps',
      isActive: true,
      timezone: 'UTC',
      defaultDuration: 16,
      autoPublish: false,
      profile: {
        create: {
          audience: 'Beginner to intermediate Linux & DevOps engineers, sysadmins, and software developers',
          voiceTone: 'Practical, concise, technically rigorous, visually clear, encouraging',
          contentPillars: ['Linux Essentials', 'Docker Architecture', 'CI/CD Automation', 'Kubernetes'],
          primaryColor: '#783CEB',
          secondaryColor: '#B28BFF',
          bgColor: '#110F17',
          fontFamily: 'Inter',
        },
      },
    },
  });

  console.log(`✅ Brand created: ${brand.displayName} (${brand.id})`);

  // 2. Add approved Knowledge Documents
  const knowledgeDocs = [
    {
      title: 'Linux /etc Directory Specification',
      category: 'Linux',
      source: 'FHS (Filesystem Hierarchy Standard)',
      content:
        'The /etc directory hierarchy contains configuration files. A "configuration file" is a local file used to control the operation of a program; it must be static and cannot be an executable binary. Examples include /etc/hosts, /etc/passwd, /etc/resolv.conf, and service configs such as /etc/nginx/nginx.conf.',
      isApproved: true,
    },
    {
      title: 'Docker Container Runtime Isolation',
      category: 'Docker',
      source: 'OCI & Linux Kernel Documentation',
      content:
        'Containers are not virtual machines. They share the host OS kernel and use Linux cgroups (control groups for CPU, memory, I/O limits) and namespaces (pid, net, mnt, ipc, uts for process isolation). A container starts in milliseconds and has virtually zero hypervisor overhead.',
      isApproved: true,
    },
    {
      title: 'Continuous Integration & Continuous Delivery Principles',
      category: 'DevOps',
      source: 'DevOps Handbook & DORA Metrics',
      content:
        'CI/CD automates code integration, testing, packaging (Docker images), and deployment to staging and production. Key stages: Source checkout -> Build & Lint -> Automated Tests -> Artifact Packaging -> Progressive/Canary Deployment.',
      isApproved: true,
    },
  ];

  let documentsAdded = 0;
  for (const doc of knowledgeDocs) {
    const existing = await prisma.knowledgeDocument.findFirst({
      where: { brandId: brand.id, title: doc.title },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.knowledgeDocument.create({
      data: {
        brandId: brand.id,
        title: doc.title,
        category: doc.category,
        source: doc.source,
        content: doc.content,
        isApproved: doc.isApproved,
        approvedAt: new Date(),
      },
    });
    documentsAdded++;
  }
  console.log(`✅ ${documentsAdded} approved knowledge documents added.`);

  // 3. Add initial Topics
  const topics = [
    {
      title: 'Linux: What is the /etc Directory?',
      category: 'Linux',
      brief: 'Explain the role of /etc in Linux, showing the filesystem hierarchy and typical configuration files.',
    },
    {
      title: 'Docker: What is a Container Really?',
      category: 'Docker',
      brief: 'Contrast containers with virtual machines. Highlight shared host kernel, namespaces, and cgroups.',
    },
    {
      title: 'DevOps: What is CI/CD?',
      category: 'DevOps',
      brief: 'Walk through an automated pipeline from code commit to zero-downtime deployment.',
    },
    {
      title: 'Linux: chmod vs chown',
      category: 'Linux',
      brief: 'Clear visual demonstration of permissions (rwx) vs file ownership.',
    },
  ];

  let topicsAdded = 0;
  for (const topic of topics) {
    const existing = await prisma.topic.findFirst({
      where: { brandId: brand.id, title: topic.title },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.topic.create({
      data: {
        brandId: brand.id,
        title: topic.title,
        category: topic.category,
        brief: topic.brief,
      },
    });
    topicsAdded++;
  }
  console.log(`✅ ${topicsAdded} initial topics created.`);

  // 4. Seed initial Reels from Test 2 fixtures so the dashboard and renderer have real DB records
  const fixtures = [
    {
      title: 'Linux: What is the /etc Directory?',
      hook: 'Where does Linux keep all its configuration?',
      durationSeconds: 16,
      caption: 'Ever wondered where all Linux config files live? Dive into /etc and master your system hierarchy! #linux #sysadmin #devops',
      hashtags: ['linux', 'sysadmin', 'devops', 'cloud'],
      scenes: [
        {
          kind: 'hook',
          durationSeconds: 3,
          badge: 'Linux Fundamentals',
          headline: 'Where does Linux keep all its configuration?',
          subtext: 'Every service, network setting, and user rule lives in one place.',
        },
        {
          kind: 'folder_tree',
          durationSeconds: 5,
          title: 'The /etc Hierarchy',
          rootPath: '/',
          highlightPath: '/etc',
          tree: [
            { name: '/bin', isDirectory: true, description: 'User binaries' },
            {
              name: '/etc',
              isDirectory: true,
              highlight: true,
              description: 'System config files (Editable Text)',
              children: [
                { name: 'nginx/', isDirectory: true, description: 'Web server rules' },
                { name: 'hosts', isDirectory: false, description: 'IP domain mappings' },
                { name: 'passwd', isDirectory: false, description: 'User accounts' },
              ],
            },
            { name: '/var', isDirectory: true, description: 'Variable data & logs' },
          ],
          explanation: '/etc holds host-specific, editable configuration files for system daemons and services.',
        },
        {
          kind: 'terminal',
          durationSeconds: 5,
          title: 'bash — inspection',
          command: 'ls -la /etc/nginx',
          outputLines: [
            'total 32',
            'drwxr-xr-x 8 root root 4096 Oct 10 12:00 .',
            '-rw-r--r-- 1 root root 1482 Sep 20 08:30 nginx.conf',
            'drwxr-xr-x 2 root root 4096 Oct 10 12:00 conf.d',
            'drwxr-xr-x 2 root root 4096 Oct 10 12:00 sites-available',
          ],
          explanation: 'Standard permissions: owned by root, world-readable, only root-writable.',
        },
        {
          kind: 'outro',
          durationSeconds: 3,
          brandName: 'LearnOps',
          tagline: 'Short, visual Linux engineering guides',
          callToAction: 'Follow @learnops for daily DevOps insights',
        },
      ],
    },
    {
      title: 'Docker: What is a Container Really?',
      hook: 'Is a Docker container just a lightweight VM?',
      durationSeconds: 16,
      caption: 'Containers are NOT virtual machines. Here is the visual breakdown of Linux namespaces and cgroups! #docker #containers #devops',
      hashtags: ['docker', 'containers', 'devops', 'cloud'],
      scenes: [
        {
          kind: 'hook',
          durationSeconds: 3,
          badge: 'Docker Architecture',
          headline: 'Is a Docker container just a lightweight VM?',
          subtext: 'No hypervisor. No guest OS. Here is what actually happens inside.',
        },
        {
          kind: 'container_diagram',
          durationSeconds: 6,
          title: 'Containers vs Virtual Machines',
          hostOs: 'Host OS & Shared Linux Kernel',
          containerEngine: 'containerd / runc (cgroups + namespaces)',
          containers: [
            { name: 'API Server', app: 'Node.js 20', binsLibs: 'Alpine Libs (6 MB)', color: '#6F41EC' },
            { name: 'Frontend', app: 'Nginx 1.25', binsLibs: 'Debian Slim (12 MB)', color: '#38BDF8' },
            { name: 'Cache', app: 'Redis 7.2', binsLibs: 'Distroless (4 MB)', color: '#F97316' },
          ],
          comparisonNote: 'Shares host kernel; isolates PID, NET, IPC, and Mount namespaces.',
        },
        {
          kind: 'terminal',
          durationSeconds: 4,
          title: 'host terminal — process view',
          command: 'ps -eo pid,comm,args | grep node',
          outputLines: [
            'PID   COMMAND         ARGS',
            '48192 node            node dist/server.js',
          ],
          explanation: 'On the host, the container is simply a normal isolated Linux process.',
        },
        {
          kind: 'outro',
          durationSeconds: 3,
          brandName: 'LearnOps',
          tagline: 'Visual DevOps & container architecture',
          callToAction: 'Follow @learnops for daily insights',
        },
      ],
    },
    {
      title: 'DevOps: What is CI/CD?',
      hook: 'What actually happens when you git push?',
      durationSeconds: 17,
      caption: 'From git commit to production deployment: visualize the automated CI/CD pipeline! #devops #cicd #automation',
      hashtags: ['devops', 'cicd', 'githubactions', 'cloud'],
      scenes: [
        {
          kind: 'hook',
          durationSeconds: 3,
          badge: 'DevOps Workflow',
          headline: 'What actually happens after git push?',
          subtext: 'The automated journey from commit to production.',
        },
        {
          kind: 'pipeline',
          durationSeconds: 6,
          title: 'Automated CI/CD Pipeline Flow',
          trigger: 'git push origin main',
          stages: [
            { name: 'Source', status: 'success', icon: 'git-commit', details: 'SHA 7a4e8f' },
            { name: 'Build & Test', status: 'success', icon: 'cpu', details: '142 tests passed' },
            { name: 'Containerize', status: 'success', icon: 'box', details: 'Docker image tagged' },
            { name: 'Deploy Prod', status: 'running', icon: 'rocket', details: 'Rolling update' },
          ],
          takeaway: 'Code moves through verification gates automatically without manual handoffs.',
        },
        {
          kind: 'terminal',
          durationSeconds: 5,
          title: 'deployment healthcheck',
          command: 'curl -s https://api.learnops.io/health',
          outputLines: [
            'HTTP/1.1 200 OK',
            '{ "status": "healthy", "version": "v1.4.0", "traffic": "100%" }',
          ],
          explanation: 'Production health verifies zero user-facing downtime upon release.',
        },
        {
          kind: 'outro',
          durationSeconds: 3,
          brandName: 'LearnOps',
          tagline: 'Automating developer workflows',
          callToAction: 'Follow @learnops for DevOps guides',
        },
      ],
    },
  ];

  for (const item of fixtures) {
    const existing = await prisma.reel.findFirst({
      where: { brandId: brand.id, title: item.title },
    });
    if (!existing) {
      const topic = await prisma.topic.findFirst({
        where: { brandId: brand.id, title: item.title },
      });

      const reel = await prisma.reel.create({
        data: {
          brandId: brand.id,
          topicId: topic?.id,
          title: item.title,
          hook: item.hook,
          caption: item.caption,
          hashtags: item.hashtags,
          durationSeconds: item.durationSeconds,
          status: 'SCRIPT_READY',
          modelName: 'gemini-3.5-flash',
          scriptJson: {
            schemaVersion: 1,
            topic: item.title,
            hook: item.hook,
            durationSeconds: item.durationSeconds,
            caption: item.caption,
            hashtags: item.hashtags,
            scenes: item.scenes,
          },
        },
      });

      for (let i = 0; i < item.scenes.length; i++) {
        const sc = item.scenes[i];
        await prisma.scene.create({
          data: {
            reelId: reel.id,
            sequence: i,
            kind: sc.kind,
            durationSeconds: sc.durationSeconds,
            propsJson: sc as any,
          },
        });
      }
      console.log(`✅ Seeded Reel: "${reel.title}" (${reel.id})`);
    }
  }

  // 5. Create social account entry (unconnected by default until real credentials provided)
  await prisma.socialAccount.upsert({
    where: {
      brandId_platform_providerUserId: {
        brandId: brand.id,
        platform: 'INSTAGRAM',
        providerUserId: 'pending_setup',
      },
    },
    update: {},
    create: {
      brandId: brand.id,
      platform: 'INSTAGRAM',
      providerUserId: 'pending_setup',
      accountUsername: 'learnops',
      isConnected: false,
    },
  });
  console.log('✅ Social account initialized as unconnected.');

  console.log('🎉 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

