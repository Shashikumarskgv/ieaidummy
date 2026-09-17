export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  technologies: string;
  github: string;
  liveDemo: string;
  role: string;
  duration: string;
  achievements: string;
}

export interface ResumeData {
  id: string;
  title: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  avatar: string;
  professionalSummary: string;
  employmentHistory: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  hobbies: string[];
  styles: {
    fontFamily: string;
    primaryColor: string;
    fontSize: string;
    alignment: "left" | "center" | "right";
    layout: "single" | "double";
  };
  // Wizard & ATS additions
  targetRole?: string;
  experienceLevel?: "Fresher" | "Junior" | "Senior";
  country?: string;
  completionPercent?: number;
  atsScore?: number;
  
  projects?: ResumeProject[];
  achievements?: string[];
  internships?: ResumeExperience[];
  certifications?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  languages?: string[];
  publications?: string[];
  volunteer?: string[];
  customSections?: { id: string; sectionTitle: string; content: string }[];
}

export const TEMPLATE_STYLES = {
  fonts: ["Inter", "Geist", "Roboto", "Outfit", "Merriweather", "Playfair Display"],
  colors: ["#1e293b", "#2563eb", "#059669", "#7c3aed", "#db2777", "#ea580c"],
  fontSizes: ["12px", "14px", "16px"]
};

export const MOCK_TEMPLATES: ResumeData[] = [
  {
    id: "temp_enzo",
    title: "Enzo Fernanda Model",
    fullName: "Enzo Fernanda",
    jobTitle: "Jr. Product Designer",
    email: "enzo.design@email.com",
    phone: "+61 412 345 678",
    website: "enzo.design",
    location: "Sydney, Australia",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Enthusiastic product designer with a keen eye for detail. Proficient in user interface design and eager to apply skills in a dynamic environment. Dedicated to creating intuitive and engaging digital experiences.",
    employmentHistory: [
      {
        id: "exp_1",
        role: "Design Assistant",
        company: "Innovate Solutions",
        location: "Sydney",
        startDate: "Feb 2023",
        endDate: "Present",
        description: "Assisted in the creation of user-centered designs for web and mobile applications. Participated in brainstorming sessions and contributed ideas to improve user experience. Supported senior designers in conducting user research and usability testing."
      },
      {
        id: "exp_2",
        role: "Volunteer Designer",
        company: "EcoAction Project",
        location: "Melbourne",
        startDate: "Sept 2022",
        endDate: "Jan 2023",
        description: "Developed visual designs for social media campaigns and website updates. Created wireframes and prototypes for new website features. Collaborated with the marketing team to ensure designs aligned with brand guidelines."
      }
    ],
    education: [
      {
        id: "edu_1",
        degree: "BA in Design",
        school: "Global Design Institute",
        location: "Sydney",
        startDate: "Sept 2019",
        endDate: "May 2023",
        description: "Specialized in Interaction Design. Graduated with Honors."
      },
      {
        id: "edu_2",
        degree: "UX Course",
        school: "Online Design Academy",
        location: "Remote",
        startDate: "Feb 2023",
        endDate: "May 2023",
        description: "Intensive 3-month course covering user research, wireframing, and user testing."
      }
    ],
    skills: ["UI Design", "Prototyping", "User Research", "Wireframing", "Visual Communication", "Team Collaboration"],
    hobbies: ["Photography", "Sketching", "Traveling", "Surfing"],
    styles: {
      fontFamily: "Geist",
      primaryColor: "#2563eb",
      fontSize: "14px",
      alignment: "left",
      layout: "single"
    }
  },
  {
    id: "temp_david",
    title: "David St. Peter Model",
    fullName: "David St. Peter",
    jobTitle: "UX Designer",
    email: "yourname@gmail.com",
    phone: "+000 123 456 789",
    website: "davidsp.design",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "For more Sales, Leads, Customer Engagement. Become an Author, Create Information Products. All done quickly and easily. No Design or Technical skills necessary.",
    employmentHistory: [
      {
        id: "exp_david_1",
        role: "Senior UX Designer",
        company: "Company Name",
        location: "New York",
        startDate: "2020",
        endDate: "Present",
        description: "Lorem ipsum is simply dummy text of the printing and typesetting industry."
      },
      {
        id: "exp_david_2",
        role: "Junior UX Designer",
        company: "Company Name",
        location: "Boston",
        startDate: "2017",
        endDate: "2019",
        description: "Lorem ipsum is simply dummy text of the printing and typesetting industry."
      }
    ],
    education: [
      {
        id: "edu_david_1",
        degree: "Degree Name",
        school: "University name here",
        location: "New York",
        startDate: "2014",
        endDate: "2016",
        description: "Coursework in cognitive science and web design."
      }
    ],
    skills: ["Wireframing", "Interaction Design", "User Research", "Figma", "Design Systems"],
    hobbies: ["Gaming", "Blogging", "Reading"],
    styles: {
      fontFamily: "Inter",
      primaryColor: "#1e293b",
      fontSize: "14px",
      alignment: "left",
      layout: "double"
    }
  },
  {
    id: "temp_amelia",
    title: "Amelia Stanford Model",
    fullName: "Amelia Stanford",
    jobTitle: "Graphic Designer",
    email: "amelia@stanford.design",
    phone: "+44 7700 900077",
    website: "amelias.design",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Creative and detailed graphic designer with 3+ years of experience. Expert in visual styling, typography layout systems, and corporate branding identity packs.",
    employmentHistory: [
      {
        id: "exp_amelia_1",
        role: "Lead Graphic Designer",
        company: "Pixel Perfect Agency",
        location: "London",
        startDate: "2022",
        endDate: "Present",
        description: "Designed marketing collateral, social assets, and brand brochures. Coordinated team pitches."
      }
    ],
    education: [
      {
        id: "edu_amelia_1",
        degree: "BFA in Graphic Design",
        school: "London College of Communication",
        location: "London",
        startDate: "2018",
        endDate: "2021",
        description: "Focus on typography and digital design."
      }
    ],
    skills: ["Adobe Illustrator", "Photoshop", "InDesign", "Branding", "Typography"],
    hobbies: ["Illustration", "Photography", "Pottery"],
    styles: {
      fontFamily: "Playfair Display",
      primaryColor: "#db2777",
      fontSize: "14px",
      alignment: "center",
      layout: "single"
    }
  },
  {
    id: "temp_sarah",
    title: "Sarah Connor Model",
    fullName: "Sarah Connor",
    jobTitle: "Senior Frontend Engineer",
    email: "sarah.c@cloud.com",
    phone: "+1 555 0199 283",
    website: "sarahconnor.io",
    location: "Los Angeles, USA",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Innovative Senior Frontend Engineer with 6+ years of expertise designing modular React applications, optimizing rendering algorithms, and coordinating cross-functional Agile engineering sprints.",
    employmentHistory: [
      {
        id: "exp_sarah_1",
        role: "Senior React Developer",
        company: "Nebula Core Tech",
        location: "California",
        startDate: "Mar 2022",
        endDate: "Present",
        description: "Engineered performant rendering modules reducing React re-render lags by 34%. Spearheaded component library migration cycles."
      }
    ],
    education: [
      {
        id: "edu_sarah_1",
        degree: "BS in Computer Science",
        school: "UCLA",
        location: "Los Angeles",
        startDate: "2015",
        endDate: "2019",
        description: "Specialized in user interfaces and web applications."
      }
    ],
    skills: ["React.js", "TypeScript", "Tailwind CSS", "Next.js", "State Management", "Performance Optimization"],
    hobbies: ["Cybersecurity", "Hiking", "Open Source Contribution"],
    styles: {
      fontFamily: "Outfit",
      primaryColor: "#7c3aed",
      fontSize: "14px",
      alignment: "left",
      layout: "single"
    }
  },
  {
    id: "temp_karan",
    title: "Karan Kapoor Model",
    fullName: "Karan Kapoor",
    jobTitle: "Full Stack Software Developer",
    email: "karan.kapoor@gmail.com",
    phone: "+91 91000 82000",
    website: "karank.dev",
    location: "Bangalore, India",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Results-driven Software Engineer with robust analytical skills in NodeJS backends, database indexing, and responsive user experiences.",
    employmentHistory: [
      {
        id: "exp_karan_1",
        role: "Full Stack Engineer",
        company: "Hindustan SaaS Corp",
        location: "Bangalore",
        startDate: "Jun 2023",
        endDate: "Present",
        description: "Developed microservices in Node.js, handled REST api queries, and optimized SQL indexes decreasing page loads by 40%."
      }
    ],
    education: [
      {
        id: "edu_karan_1",
        degree: "B.Tech in Information Technology",
        school: "PES University",
        location: "Bangalore",
        startDate: "2019",
        endDate: "2023",
        description: "Graduated with 9.2 CGPA. Active coding club lead."
      }
    ],
    skills: ["React.js", "Node.js", "PostgreSQL", "REST APIs", "AWS Cloud", "System Architecture"],
    hobbies: ["Reading Tech Blogs", "Biking", "Tinkering with IOT Devices"],
    styles: {
      fontFamily: "Inter",
      primaryColor: "#0284c7",
      fontSize: "14px",
      alignment: "left",
      layout: "double"
    }
  }
];

export const MOCK_USER_RESUMES: ResumeData[] = [
  {
    id: "user_res_1",
    title: "MERN Resume",
    fullName: "Olivia Winata",
    jobTitle: "Frontend Developer",
    email: "olivia.w@email.com",
    phone: "+62 8123 4567 89",
    website: "oliviawinata.com",
    location: "Jakarta, Indonesia",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Focused UI/UX designer with 2 years of experience building accessible SaaS structures.",
    employmentHistory: [
      {
        id: "user_exp_1",
        role: "UI Designer",
        company: "Digital Solution Studio",
        location: "Jakarta",
        startDate: "Jan 2024",
        endDate: "Present",
        description: "Designed screen flows, styled variables, and coordinated dev hands-off cycles."
      }
    ],
    education: [
      {
        id: "user_edu_1",
        degree: "Bachelor of Information Systems",
        school: "Binus University",
        location: "Jakarta",
        startDate: "2019",
        endDate: "2023",
        description: "Graduated with 3.8 GPA."
      }
    ],
    skills: ["Figma", "UI Design", "User Testing", "TailwindCSS", "React"],
    hobbies: ["Photography", "Gaming"],
    styles: {
      fontFamily: "Geist",
      primaryColor: "#2563eb",
      fontSize: "14px",
      alignment: "left",
      layout: "double"
    },
    targetRole: "Frontend Developer",
    experienceLevel: "Junior",
    country: "Indonesia",
    completionPercent: 82,
    atsScore: 91,
    projects: [
      {
        id: "proj_1",
        title: "LMS Portal System",
        description: "Built scalable learning management panel.",
        technologies: "React, MongoDB, NodeJS, Express",
        github: "github.com/olivia/lms",
        liveDemo: "lms.dataquotes.com",
        role: "Lead Engineer",
        duration: "6 Months",
        achievements: "Improved client response load speeds by 40% using query selectors caching."
      }
    ],
    achievements: [
      "Winner of Local Hackathon 2024",
      "Scored 99th percentile in DataQuotes Javascript assessment"
    ],
    certifications: [
      "AWS Certified Developer Associate",
      "DataQuotes Full Stack Specialization"
    ],
    technicalSkills: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "TailwindCSS", "Redux Toolkit"],
    softSkills: ["Communication", "Agile Methodologies", "Problem Solving"],
    languages: ["English (Fluent)", "Indonesian (Native)"]
  },
  {
    id: "user_res_2",
    title: "Frontend Resume",
    fullName: "Rudian Santoso",
    jobTitle: "UI Developer",
    email: "rudian@email.com",
    phone: "+62 8122 3344 55",
    website: "rudiansantoso.id",
    location: "Bandung, Indonesia",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Saya orang yang sangat kolaboratif dan senang merancang strategi pemasaran yang efektif untuk produk yang menjanjikan.",
    employmentHistory: [
      {
        id: "user_exp_2",
        role: "Creative Marketer",
        company: "Bandung Creative Studio",
        location: "Bandung",
        startDate: "Mar 2023",
        endDate: "Present",
        description: "Managed social campaigns, planned video shoots, and designed landing pages copy."
      }
    ],
    education: [
      {
        id: "user_edu_2",
        degree: "Sarjana Ilmu Komunikasi",
        school: "Universitas Padjadjaran",
        location: "Bandung",
        startDate: "2018",
        endDate: "2022",
        description: "Focus on digital marketing strategies."
      }
    ],
    skills: ["Digital Marketing", "Content Creation", "Copywriting", "SEO"],
    hobbies: ["Vlogging", "Cooking"],
    styles: {
      fontFamily: "Outfit",
      primaryColor: "#ea580c",
      fontSize: "14px",
      alignment: "left",
      layout: "single"
    },
    targetRole: "Frontend Developer",
    experienceLevel: "Fresher",
    country: "India",
    completionPercent: 64,
    atsScore: 74,
    projects: [],
    achievements: [],
    certifications: [],
    technicalSkills: ["HTML", "CSS", "Javascript", "SEO"],
    softSkills: ["Creativity", "Time Management"],
    languages: ["English", "Indonesian"]
  },
  {
    id: "user_res_3",
    title: "Data Analyst Resume",
    fullName: "Aniket Sharma",
    jobTitle: "Data Analyst",
    email: "aniket@email.com",
    phone: "+91 98765 43210",
    website: "aniketsharma.dev",
    location: "Tirupati, India",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    professionalSummary: "Experienced Data Analyst specialized in consumer behavioral analytics, database structures, and predictive dashboards.",
    employmentHistory: [
      {
        id: "user_exp_3",
        role: "Senior Data Analyst",
        company: "DataQuotes Analytics",
        location: "Hyderabad",
        startDate: "Jun 2022",
        endDate: "Present",
        description: "Analyzed data pipelines, designed interactive Tableau widgets, and maintained database execution indexes."
      }
    ],
    education: [
      {
        id: "user_edu_3",
        degree: "M.Tech in Data Science",
        school: "IIT Madras",
        location: "Chennai",
        startDate: "2020",
        endDate: "2022",
        description: "Specialized in statistical modeling and machine learning algorithms."
      }
    ],
    skills: ["Python", "SQL", "Pandas", "Tableau", "Machine Learning"],
    hobbies: ["Chess", "Reading"],
    styles: {
      fontFamily: "Outfit",
      primaryColor: "#059669",
      fontSize: "14px",
      alignment: "left",
      layout: "single"
    },
    targetRole: "Data Analyst",
    experienceLevel: "Senior",
    country: "India",
    completionPercent: 100,
    atsScore: 96,
    projects: [
      {
        id: "proj_2",
        title: "E-Commerce Customer Segmentation",
        description: "Analyzed consumer behavioral purchasing patterns.",
        technologies: "Python, Pandas, Scikit-learn, Tableau",
        github: "github.com/aniket/segmentation",
        liveDemo: "tableau.public/aniket",
        role: "Data Lead",
        duration: "1 Year",
        achievements: "Uncovered structural churn indicators saving 15% in marketing retention spends."
      }
    ],
    achievements: [
      "Published Research Paper on Big Data Analytics in IEEE"
    ],
    certifications: [
      "Google Data Analytics Professional Certificate",
      "Microsoft Certified Power BI Analyst"
    ],
    technicalSkills: ["Python", "SQL", "Pandas", "NumPy", "Tableau", "Power BI", "Excel", "R"],
    softSkills: ["Critical Thinking", "Stakeholder Presentation"],
    languages: ["English (Professional)", "Hindi (Native)"]
  }
];
