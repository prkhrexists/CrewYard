const fs = require('fs');

let data = fs.readFileSync('src/data/mockData.js', 'utf8');

const replacements = [
  ['Priya Nair', 'Priyanshi Upadhyay'],
  ['priya_builds', 'priyanshi_u'],
  ['priyanair', 'priyanshiupadhyay'],
  ['KIIT Bhubaneswar', 'NMIMS MPSTME Shirpur'],

  ['Rohan Gupta', 'Ayush Singh'],
  ['rohan_ml', 'ayush_ml'],
  ['rohanml', 'ayushsingh'],
  ['PES University', 'NMIMS MPSTME Shirpur'],

  ['Divya Krishnan', 'Aditya Thukral'],
  ['divya_fs', 'aditya_fs'],
  ['divyafs', 'adityathukral'],
  ['VIT Vellore', 'NMIMS MPSTME Shirpur'],

  ['Karan Mehta', 'Bhanu Bhaskar'],
  ['karan_hacks', 'bhanu_codes'],
  ['karanhacks', 'bhanubhaskar'],
  ['UPES Dehradun', 'DTU Delhi'],

  ['Sneha Reddy', 'Piyush Kumar'],
  ['sneha_404', 'piyush_404'],
  ['sneha404', 'piyushkumar'],
  ['Chandigarh University', 'IIT Roorkee'],

  ['Arjun Sharma', 'Mayuresh Jadhav'],
  ['arjun_dev', 'mayuresh_dev'],
  ['Jaypee Institute', 'VJTI Mumbai'],
];

replacements.forEach(([oldStr, newStr]) => {
  data = data.replaceAll(oldStr, newStr);
});

const newUsers = `,
  {
    id: "u8",
    username: "ansh_shriv",
    name: "Ansh Shrivastava",
    college: "IIIT Hyderabad",
    year: 3,
    major: "Computer Science",
    githubVerified: true,
    reputation: 920,
    commitsThisWeek: 45,
    commitsChangePercent: 15,
    topLanguage: "Rust",
    topLanguagePercent: 82,
    joinedDate: "2024-11-20",
    avatarUrl: "/avatars/avatar_08.jpg",
    bio: "Systems programmer. Trying to rewrite everything in Rust.",
    availability: "BUSY",
    skills: ["Rust", "C++", "Linux", "WebAssembly"],
    lookingFor: [],
    lookingForDetails: "",
    githubUsername: "anshshrivastava",
    building: null,
    projects: [],
    reputationHistory: []
  },
  {
    id: "u9",
    username: "sahil_k",
    name: "Sahil Kulkani",
    college: "COEP Pune",
    year: 4,
    major: "Information Technology",
    githubVerified: true,
    reputation: 1105,
    commitsThisWeek: 22,
    commitsChangePercent: -10,
    topLanguage: "TypeScript",
    topLanguagePercent: 75,
    joinedDate: "2024-05-12",
    avatarUrl: "/avatars/avatar_09.jpg",
    bio: "Fullstack dev. Heavy on the frontend, light on the sleep.",
    availability: "OPEN TO BUILD",
    skills: ["React", "TypeScript", "Tailwind", "Figma"],
    lookingFor: ["Backend Dev"],
    lookingForDetails: "Need a solid backend dev to build out APIs for my SaaS idea.",
    githubUsername: "sahilkul",
    building: null,
    projects: [],
    reputationHistory: []
  }
];`;

data = data.replace(/\];\s*\/\/\s*([─]+)\s*\/\/\s*mockAsks/, newUsers + '\n\n// $1\n//  mockAsks');

const newAsks = `,
  {
    id: "a13",
    type: "build_log",
    title: "Shipped a fast Rust-based markdown parser for my blog",
    details: \`Got tired of how slow my JS-based MDX parser was getting with hundreds of posts, so I spent the weekend writing a custom parser in Rust and exposing it via WebAssembly to my Next.js frontend.
    
The performance gain is insane. Build times dropped by 40%. The hardest part was getting the Wasm bindings working nicely with Webpack. I've open-sourced the core parser crate.\`,
    tags: ["rust", "webassembly", "next.js", "performance", "build-log"],
    authorId: "u8",
    createdAt: "2025-08-11T16:20:00Z",
    commitsThisMonth: 110,
    commentCount: 18,
    likeCount: 89,
    saved: true,
  },
  {
    id: "a14",
    type: "help",
    title: "Tailwind JIT compiling extremely slowly in Turborepo setup",
    details: \`Hey folks, I have a Turborepo monorepo with 3 Next.js apps and a shared UI package using Tailwind CSS. 
    
Lately, whenever I save a file in the UI package, Tailwind takes like 4-5 seconds to recompile the classes across the apps. It completely ruins the dev experience. I've tried specifying the exact content paths in tailwind.config.js but it didn't help much. Has anyone faced this in large monorepos?\`,
    tags: ["tailwind", "turborepo", "next.js", "css", "help"],
    authorId: "u9",
    createdAt: "2025-08-12T09:45:00Z",
    commitsThisMonth: 34,
    commentCount: 7,
    likeCount: 21,
    saved: false,
  },
  {
    id: "a15",
    type: "teammate",
    title: "Looking for an AI engineer for a localized legal document summarizer (Hackathon)",
    details: \`We are participating in a local legal-tech hackathon next week. The idea is to parse dense Indian legal documents (PDFs, scans) and summarize them into simple regional languages using LLMs.
    
We have:
- 1 Frontend (Me)
- 1 Backend/Cloud guy

We need someone who knows their way around OCR (Tesseract/AWS Textract) and LLM prompt engineering/chaining (LangChain or direct APIs). Hit me up!\`,
    tags: ["ai", "llm", "hackathon", "teammate", "legal-tech"],
    authorId: "u9",
    createdAt: "2025-08-13T11:10:00Z",
    commitsThisMonth: 12,
    commentCount: 4,
    likeCount: 15,
    saved: false,
  }
];`;

data = data.replace(/\];\s*\/\/\s*([─]+)\s*\/\/\s*mockStats/, newAsks + '\n\n// $1\n//  mockStats');

const newGroups = `,
  {
    id: "g6",
    name: "Rust India User Group",
    category: "languages",
    description: "For Indian developers learning and building with Rust. From embedded systems to high-performance web servers.",
    memberCount: 412,
    openAsks: 8,
    activeBuilders: 15,
    tags: ["rust", "systems", "wasm"],
    activeThisWeek: true,
    memberIds: ["u7", "u8"],
    pinnedAnnouncement: {
      title: "Rust 1.80 Release Highlights",
      body: "Let's discuss the new features in Rust 1.80. Specifically the new LazyLock API. We will have a quick 30m call this Friday.",
      postedBy: "u8",
      date: "2025-07-28T10:00:00Z",
    },
    discussions: [],
    recentBuilds: [],
    resources: [],
    askIds: ["a13"],
  }
];`;

data = data.replace(/\];\s*$/, newGroups + '\n');

fs.writeFileSync('src/data/mockData.js', data);
console.log('Successfully updated mockData.js');
