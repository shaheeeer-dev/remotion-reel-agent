import { PrismaClient } from '@prisma/client';

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
          primaryColor: '#6F41EC',
          secondaryColor: '#C4B5FD',
          bgColor: '#0B0F17',
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

  for (const doc of knowledgeDocs) {
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
  }
  console.log(`✅ ${knowledgeDocs.length} approved knowledge documents added.`);

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

  for (const topic of topics) {
    await prisma.topic.create({
      data: {
        brandId: brand.id,
        title: topic.title,
        category: topic.category,
        brief: topic.brief,
      },
    });
  }
  console.log(`✅ ${topics.length} initial topics created.`);

  // 4. Create social account entry (unconnected by default until real credentials provided)
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

