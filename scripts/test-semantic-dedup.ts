import { topicDiscoveryService } from '../apps/api/src/services/topic-discovery.service.js';

async function main() {
  console.log('🧪 Testing Semantic Duplicate Detection Engine...\n');

  const service = topicDiscoveryService as any;

  const testPairs = [
    {
      candidate: "Docker explained in 15 seconds",
      candidateBrief: "A quick breakdown of how Docker runs applications in lightweight isolated environments.",
      existingTitle: "What is Docker?",
      existingBrief: "Explaining Docker containers and how they package applications with dependencies.",
      shouldReject: true,
    },
    {
      candidate: "Understanding Docker containers",
      candidateBrief: "How Docker containers isolate software dependencies without running a guest operating system.",
      existingTitle: "Docker Containers vs Virtual Machines",
      existingBrief: "Contrast containers with virtual machines. Highlight shared host kernel, namespaces, and cgroups.",
      shouldReject: true,
    },
    {
      candidate: "Linux: Hard Links vs Symbolic Links",
      candidateBrief: "Compare file pointers that reference underlying inodes directly versus paths pointing to names.",
      existingTitle: "Linux: chmod vs chown",
      existingBrief: "Clear visual demonstration of permissions (rwx) vs file ownership.",
      shouldReject: false,
    },
    {
      candidate: "What are Pods in Kubernetes?",
      candidateBrief: "Explore how Kubernetes Pods group containers together to share networking and storage.",
      existingTitle: "Kubernetes: Pod vs Container Architecture",
      existingBrief: "Understand how Pods wrap multiple containers to share storage volumes and network namespaces.",
      shouldReject: true,
    },
    {
      candidate: "Networking: What is Localhost and 127.0.0.1?",
      candidateBrief: "Learn how the loopback network adapter works and why loopback requests never leave the host machine.",
      existingTitle: "Networking: 127.0.0.1 vs 0.0.0.0 IP Binding",
      existingBrief: "Learn the critical difference between binding an app to localhost loopback versus all network interfaces.",
      shouldReject: true,
    },
  ];

  let passedTests = 0;

  for (let i = 0; i < testPairs.length; i++) {
    const pair = testPairs[i];
    const fullCandidate = `${pair.candidate} ${pair.candidateBrief}`;
    const fullExisting = `${pair.existingTitle} ${pair.existingBrief}`;

    const similarity = service.computeSimilarity(fullCandidate, fullExisting);
    const isRejected = similarity > 0.35; // Semantic threshold

    console.log(`Test ${i + 1}:`);
    console.log(`  Candidate: "${pair.candidate}"`);
    console.log(`  Existing : "${pair.existingTitle}"`);
    console.log(`  Similarity: ${(similarity * 100).toFixed(1)}%`);
    console.log(`  Decision  : ${isRejected ? 'REJECTED (DUPLICATE)' : 'ACCEPTED (UNIQUE)'}`);
    console.log(`  Expected  : ${pair.shouldReject ? 'REJECT (DUPLICATE)' : 'ACCEPT (UNIQUE)'}`);

    if (isRejected === pair.shouldReject) {
      console.log('  Status    : ✅ PASS\n');
      passedTests++;
    } else {
      console.log('  Status    : ❌ FAIL\n');
    }
  }

  console.log(`Results: ${passedTests} / ${testPairs.length} tests passed.`);
  if (passedTests !== testPairs.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
