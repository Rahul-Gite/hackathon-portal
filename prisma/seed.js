const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed with Democratic Committee models...");

  await prisma.judgeScore.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.hackathon.deleteMany({});
  await prisma.committeeMember.deleteMany({});
  await prisma.committee.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Internal PREC Student
  const internalStudent = await prisma.user.create({
    data: {
      name: "Rohit Shinde",
      email: "rohit.shinde@pravara.edu",
      passwordHash,
      role: "STUDENT",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
      collegeRollNo: "72154890B",
      department: "Computer Engineering",
      graduationYear: 2026,
      collegeCity: "Loni",
      collegeState: "Maharashtra",
      bio: "PREC 3rd Year Computer Engineering student & CESA Co-Manager. Specialized in Next.js and Cloud IoT.",
      githubUrl: "https://github.com/rohitshinde",
    },
  });

  // 2. Outside University Student (COEP Pune)
  const externalStudent = await prisma.user.create({
    data: {
      name: "Aditi Sharma",
      email: "aditi.sharma@coep.ac.in",
      passwordHash,
      role: "STUDENT",
      studentType: "EXTERNAL",
      collegeName: "COEP Technological University, Pune",
      collegeRollNo: "112203042",
      department: "Computer Science & Engineering",
      graduationYear: 2026,
      collegeCity: "Pune",
      collegeState: "Maharashtra",
      bio: "Outside student visiting PREC Loni for State Hackathon. Edge AI and Computer Vision developer.",
      githubUrl: "https://github.com/aditisharma",
    },
  });

  // 3. Faculty Lead (Owner of CESA)
  const facultyLead = await prisma.user.create({
    data: {
      name: "Prof. S. M. Rokade",
      email: "prof.rokade@pravaraengg.org.in",
      passwordHash,
      role: "FACULTY",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
      department: "Computer Engineering",
    },
  });

  // 4. Student Coordinator
  const studentCoordinator = await prisma.user.create({
    data: {
      name: "Sourabh Kulkarni",
      email: "sourabh.k@pravara.edu",
      passwordHash,
      role: "STUDENT",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
      collegeRollNo: "72154895D",
      department: "Computer Engineering",
    },
  });

  // 5. Senior Evaluator / Judge (Dr. V. R. Patil)
  const judgeUser = await prisma.user.create({
    data: {
      name: "Dr. V. R. Patil",
      email: "dr.patil@pravaraengg.org.in",
      passwordHash,
      role: "FACULTY",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
      department: "Computer Engineering",
      bio: "HOD Computer Engineering. Evaluator in Distributed Systems & Rural Computing.",
    },
  });

  // 6. Principal Office / College Admin
  const adminUser = await prisma.user.create({
    data: {
      name: "Principal Office, PREC Loni",
      email: "principal@pravaraengg.org.in",
      passwordHash,
      role: "ADMIN",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
    },
  });

  // 7. Create Democratic Committee (CESA)
  const cesaCommittee = await prisma.committee.create({
    data: {
      name: "CESA (Computer Engineering Students Association)",
      slug: "cesa-computer",
      department: "Computer Engineering",
      description:
        "Official technical association under the Department of Computer Engineering at Pravara Rural Engineering College, Loni. Organizing state and national level hackathons.",
      contactEmail: "cesa.computer@pravaraengg.org.in",
      isVerified: true,
      logoUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80",
    },
  });

  // 8. Assign Democratic Committee Members with 3 Permission Levels:
  // Level 1: OWNER (Prof. Rokade)
  await prisma.committeeMember.create({
    data: {
      committeeId: cesaCommittee.id,
      userId: facultyLead.id,
      role: "OWNER",
    },
  });

  // Level 2: CO_MANAGER (Rohit Shinde - student co-manager who can customize hackathons)
  await prisma.committeeMember.create({
    data: {
      committeeId: cesaCommittee.id,
      userId: internalStudent.id,
      role: "CO_MANAGER",
    },
  });

  // Level 3: COORDINATOR (Sourabh Kulkarni - operational desk verification & coordination)
  await prisma.committeeMember.create({
    data: {
      committeeId: cesaCommittee.id,
      userId: studentCoordinator.id,
      role: "COORDINATOR",
    },
  });

  const now = new Date();

  // 9. Flagship State Hackathon (Pravara InnovateX 2026)
  const stateHack = await prisma.hackathon.create({
    data: {
      committeeId: cesaCommittee.id,
      title: "Pravara InnovateX 2026",
      slug: "pravara-innovatex-2026",
      tagline: "State-Level Collegiate Hackathon for Sustainable Engineering & Rural AI",
      description:
        "Pravara InnovateX 2026 is the flagship inter-collegiate engineering sprint hosted at Pravara Rural Engineering College (PREC), Loni. Bringing together bright student engineering minds from across Maharashtra and India.\n\n36 Hours of continuous technical innovation, cutting-edge hardware & software problem statements, complimentary on-campus hostel stay for outside participants, and rigorous technical mentorship from PRES alumni and faculty.",
      bannerUrl:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      department: "Computer Engineering & AI-DS",
      audience: "ALL_COLLEGES",
      themeColor: "sapphire",
      locationType: "IN_PERSON",
      venue: "Central Auditorium & Computer Center, PREC Campus, Loni",
      allowSolo: true,
      allowInterCollegeTeams: true,
      requireCollegeId: true,
      requireGithub: true,
      discordUrl: "https://discord.gg/pravarahack",
      wifiDetails: "SSID: PREC-HACK-GUEST / Pass: pravara2026 (1 Gbps Fiber)",
      registrationStart: new Date(now.getTime() - 5 * 86400000),
      registrationEnd: new Date(now.getTime() + 12 * 86400000),
      hackingStart: new Date(now.getTime() + 15 * 86400000),
      hackingEnd: new Date(now.getTime() + 17 * 86400000),
      minTeamSize: 2,
      maxTeamSize: 4,
      status: "REGISTRATION_OPEN",
      tracks: [
        {
          id: "track-1",
          name: "Smart Agriculture & Rural AI",
          description: "IoT soil sensing, drone surveillance, crop disease identification, and automated irrigation.",
          sponsor: "Pravara Sugar & Agricultural Research Board",
          prize: "₹25,000 + Incubation Seed Grant",
          mentor: "Dr. V. R. Patil",
        },
        {
          id: "track-2",
          name: "Intelligent Healthcare & Assistive Tech",
          description: "Rural telemedicine, diagnostic assistive models, and emergency alert systems.",
          sponsor: "Pravara Medical Trust",
          prize: "₹20,000 + Hardware Kits",
          mentor: "Prof. S. M. Rokade",
        },
        {
          id: "track-3",
          name: "Clean Energy, Water & Sustainability",
          description: "Solar microgrid management, water distribution analytics, and eco-friendly campus IoT.",
          sponsor: "PRES Renewable Energy Cell",
          prize: "₹15,000 + Mentorship",
          mentor: "Prof. D. A. Shah",
        },
        {
          id: "track-4",
          name: "Open Student Innovation & Web3",
          description: "Decentralized identity, transparent budgeting, academic verifications, and general high-impact solutions.",
          sponsor: "Tech Alumni Network",
          prize: "₹15,000",
          mentor: "Er. Rahul Vikhe",
        },
      ],
      prizes: [
        { title: "Grand Champion (PREC Trophy)", amount: "₹35,000", perks: "Winner Trophy + PRES Incubation Cell Seed Grant", rank: 1 },
        { title: "1st Runner-Up", amount: "₹20,000", perks: "Trophy + Direct Technical Interview Referrals", rank: 2 },
        { title: "Best Rural Impact Hack", amount: "₹15,000", perks: "Pravara Trust Special Innovation Citation", rank: 3 },
        { title: "Best Freshers Team", amount: "₹5,000", perks: "Special Encouragement Award", rank: 4 },
      ],
      scheduleMilestones: [
        { day: "Day 1", time: "08:30 AM", title: "Reporting & Desk Verification", description: "Identity card verification and participant pass scanning at PREC Central Lobby.", phase: "Registration" },
        { day: "Day 1", time: "10:00 AM", title: "Inaugural Ceremony", description: "Official inauguration by dignitaries and release of Problem Statements.", phase: "Kickoff" },
        { day: "Day 1", time: "11:00 AM", title: "Hacking Sprint Begins", description: "36-hour sprint commences. High-speed network and labs open 24/7.", phase: "Hacking" },
        { day: "Day 1", time: "06:00 PM", title: "Mentorship Round 1", description: "Industry jury & faculty mentors review project architecture in Labs 301-304.", phase: "Review" },
        { day: "Day 2", time: "08:00 AM", title: "Code Freeze Countdown", description: "Final testing, GitHub commits, and slide deck upload rush.", phase: "Submission" },
        { day: "Day 2", time: "11:00 AM", title: "Submissions Close & Final Jury Round", description: "Live 5-minute presentation & demonstration before judges.", phase: "Judging" },
        { day: "Day 2", time: "03:00 PM", title: "Valedictory & Prize Distribution", description: "Awarding trophies, cash prizes, and certificates by Principal.", phase: "Awards" },
      ],
      customQuestions: [
        { id: "q1", label: "GitHub Profile URL", type: "text", required: true },
        { id: "q2", label: "Project Idea Synopsis / Problem Chosen", type: "textarea", required: true },
        { id: "q3", label: "Prior Hackathon Experience (Novice / Intermediate / Advanced)", type: "select", options: ["Novice", "Intermediate", "Advanced"], required: false },
      ],
      rules:
        "1. Open to undergraduate and postgraduate students of PREC Loni and all recognized outside institutes.\n2. Valid college ID cards required at check-in.\n3. Squad size: 2 to 4 members. Inter-college squads are welcome.\n4. Free lodging/hostel arrangements provided inside PREC campus for outside students upon request.\n5. Original code written during hackathon window.",
      faqs: [
        {
          q: "Are outside students from other universities welcome?",
          a: "Yes! Pravara InnovateX welcomes engineering and polytechnic students from all institutes across India.",
        },
        {
          q: "Is lodging provided for outside participants?",
          a: "Yes, free hostel accommodation is provided on campus by Pravara Rural Education Society.",
        },
        {
          q: "Can teams have a mix of Pravara students and outside students?",
          a: "Yes, inter-college collaborative squads are encouraged.",
        },
      ],
    },
  });

  // 10. Internal Departmental Hackathon (PREC AI-Sprint 2026)
  const internalHack = await prisma.hackathon.create({
    data: {
      committeeId: cesaCommittee.id,
      title: "PREC AI-Sprint 2026",
      slug: "prec-ai-sprint-2026",
      tagline: "Internal Departmental AI Prototype Sprint for Pravara Engineering Students",
      description:
        "An exclusive 24-hour sprint for students across all engineering branches of Pravara Rural Engineering College. Build AI solutions that benefit the campus and surrounding rural community.",
      bannerUrl:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      department: "Computer & IT Engineering",
      audience: "INTERNAL_ONLY",
      themeColor: "amber",
      locationType: "IN_PERSON",
      venue: "Lab 301 & 302, Computer Dept, PREC Loni",
      allowSolo: true,
      allowInterCollegeTeams: false,
      requireCollegeId: true,
      registrationStart: new Date(now.getTime() - 7 * 86400000),
      registrationEnd: new Date(now.getTime() - 86400000),
      hackingStart: new Date(now.getTime() - 6 * 3600000),
      hackingEnd: new Date(now.getTime() + 18 * 3600000),
      minTeamSize: 1,
      maxTeamSize: 3,
      status: "HACKING_LIVE",
      tracks: [
        { id: "t1", name: "Campus Automation", description: "Automated attendance, library book finder, digital noticeboard AI.", prize: "₹10,000" },
        { id: "t2", name: "Student Learning Assist", description: "Curriculum RAG assistant and interactive lab simulators.", prize: "₹10,000" },
      ],
      prizes: [
        { title: "Best Departmental Prototype", amount: "₹15,000", perks: "PREC Department Trophy + Incubation", rank: 1 },
      ],
    },
  });

  // 11. Announcements (Zero emojis, pure text with categories)
  await prisma.announcement.create({
    data: {
      hackathonId: internalHack.id,
      title: "Network Switch 2 Maintenance Completed",
      content: "High-speed Wi-Fi network 'PREC-GUEST-HACK' is now active in Labs 301-304. Bandwidth has been increased to 1Gbps.",
      category: "URGENT",
      isPinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      hackathonId: internalHack.id,
      title: "Mentorship Desks Open in Faculty Cabin 104",
      content: "Faculty mentors Dr. V. R. Patil and Prof. Rokade are available for architecture reviews.",
      category: "MENTORSHIP",
      isPinned: false,
    },
  });

  // 12. Create Registered Squad in State Hackathon
  const team1 = await prisma.team.create({
    data: {
      hackathonId: stateHack.id,
      name: "PravaraTechies",
      joinCode: "PREC26",
      leaderId: internalStudent.id,
      trackPreference: "Smart Agriculture & Rural AI",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: team1.id,
      userId: internalStudent.id,
      role: "LEADER",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: team1.id,
      userId: externalStudent.id,
      role: "MEMBER",
    },
  });

  await prisma.registration.create({
    data: {
      hackathonId: stateHack.id,
      userId: internalStudent.id,
      teamId: team1.id,
      status: "ACCEPTED",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
      needsAccommodation: false,
      customAnswers: { q1: "https://github.com/rohitshinde", q2: "Sugarcane health monitoring with IoT" },
    },
  });

  await prisma.registration.create({
    data: {
      hackathonId: stateHack.id,
      userId: externalStudent.id,
      teamId: team1.id,
      status: "ACCEPTED",
      studentType: "EXTERNAL",
      collegeName: "COEP Technological University, Pune",
      needsAccommodation: true,
      customAnswers: { q1: "https://github.com/aditisharma", q2: "Vision pipeline for localized crop pathology" },
    },
  });

  // 13. Team in Live Hackathon with Submission
  const liveTeam = await prisma.team.create({
    data: {
      hackathonId: internalHack.id,
      name: "AgriVision AI",
      joinCode: "AGRI26",
      leaderId: internalStudent.id,
      trackPreference: "Campus Automation",
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: liveTeam.id,
      userId: internalStudent.id,
      role: "LEADER",
    },
  });

  await prisma.registration.create({
    data: {
      hackathonId: internalHack.id,
      userId: internalStudent.id,
      teamId: liveTeam.id,
      status: "CHECKED_IN",
      studentType: "INTERNAL",
      collegeName: "Pravara Rural Engineering College, Loni",
    },
  });

  const sub = await prisma.submission.create({
    data: {
      hackathonId: internalHack.id,
      teamId: liveTeam.id,
      title: "KisanDrishti AI & Soil Bot",
      tagline: "Computer vision and localized sensor bot for sugarcane disease detection in Ahmednagar/Loni belt",
      description:
        "Built specifically for the agricultural context of Pravara basin. Analyzes sugarcane and onion leaf health with offline edge-AI running on Raspberry Pi, sending SMS advisory to farmers.",
      demoUrl: "https://kisandrishti.pravaraengg.org.in",
      repoUrl: "https://github.com/rohitshinde/kisan-drishti",
      videoUrl: "https://youtube.com/watch?v=sample-pravara",
      track: "Smart Agriculture & Rural AI",
    },
  });

  await prisma.judgeScore.create({
    data: {
      submissionId: sub.id,
      judgeId: judgeUser.id,
      criteriaScores: { innovation: 9, technicalDepth: 9, design: 8, pitch: 9 },
      totalScore: 8.8,
      feedback: "Outstanding application addressing local sugarcane crop diseases. Strong edge implementation.",
    },
  });

  console.log("✅ Seed completed with Democratic Committee & Customizations!");
  console.log("Demo Accounts:");
  console.log(" - Rohit Shinde (Student & CESA Co-Manager): rohit.shinde@pravara.edu (pwd: password123)");
  console.log(" - Prof. S. M. Rokade (CESA Primary Owner/Manager): prof.rokade@pravaraengg.org.in (pwd: password123)");
  console.log(" - Sourabh Kulkarni (CESA Level-3 Coordinator): sourabh.k@pravara.edu (pwd: password123)");
  console.log(" - Aditi Sharma (Outside COEP Student): aditi.sharma@coep.ac.in (pwd: password123)");
  console.log(" - Dr. V. R. Patil (Faculty Judge): dr.patil@pravaraengg.org.in (pwd: password123)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
