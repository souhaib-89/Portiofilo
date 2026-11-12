/* ==========================================================================
   ALL SITE CONTENT LIVES IN THIS FILE.

   Edit the text between the quotes, save, and refresh the page.
   You never need to touch index.html, style.css or main.js to change copy.

   - Text comes from the CV. Images marked  PLACEHOLDER  still need real files.
   - In headings, wrap words in *stars* to highlight them in the accent colour.
   - Leave a link empty ("") to hide that button once `draft` is false.
   ========================================================================== */

window.PORTFOLIO = {

  /* ------------------------------------------------------------------ basics */
  meta: {
    draft: true,                         // true = links left empty ("") show as inactive placeholders. false = they are hidden.
    name: "Souhaib",                     // short name: logo, greeting, footer wordmark
    fullName: "Souhaib Abdulaal Ali",
    role: "Product Designer",            // shown in the speech bubble
    location: "Cairo, Egypt",
    email: "sahibabdelaal@gmail.com",
    resumeUrl: "assets/Souhaib-Abdulaal-CV.pdf",   // the header button opens this. Empty = the button says "Let's talk" instead.
    availableText: "Based in Cairo, working remotely",
    formEndpoint: "",                    // optional: a Formspree or Web3Forms URL. Empty = the form opens the visitor's email app instead.
    formKey: ""                          // only for Web3Forms: your access key
  },

  /* the small greeting next to the logo cycles through these, in order */
  greetings: [
    { text: "Hello", lang: "en" },        { text: "مرحبا", lang: "ar" },        { text: "Bonjour", lang: "fr" },
    { text: "Hola", lang: "es" },         { text: "Ciao", lang: "it" },         { text: "Hallo", lang: "de" },
    { text: "Olá", lang: "pt" },          { text: "Привет", lang: "ru" },       { text: "你好", lang: "zh" },
    { text: "こんにちは", lang: "ja" },    { text: "안녕하세요", lang: "ko" },    { text: "नमस्ते", lang: "hi" },
    { text: "Merhaba", lang: "tr" },      { text: "سلام", lang: "fa" },         { text: "שלום", lang: "he" },
    { text: "Γεια σου", lang: "el" },     { text: "Hej", lang: "sv" },          { text: "Hoi", lang: "nl" },
    { text: "Cześć", lang: "pl" },        { text: "Ahoj", lang: "cs" },         { text: "Szia", lang: "hu" },
    { text: "Salut", lang: "ro" },        { text: "Привіт", lang: "uk" },       { text: "Hei", lang: "fi" },
    { text: "Jambo", lang: "sw" },        { text: "Sawubona", lang: "zu" },     { text: "Sannu", lang: "ha" },
    { text: "ሰላም", lang: "am" },          { text: "สวัสดี", lang: "th" },        { text: "Xin chào", lang: "vi" },
    { text: "Halo", lang: "id" },         { text: "Kumusta", lang: "tl" },      { text: "নমস্কার", lang: "bn" },
    { text: "வணக்கம்", lang: "ta" },      { text: "آداب", lang: "ur" },         { text: "Aloha", lang: "haw" },
    { text: "Kia ora", lang: "mi" }
  ],

  nav: [
    { id: "home",       label: "Home" },
    { id: "about",      label: "About" },
    { id: "services",   label: "Services" },
    { id: "work",       label: "Work" },
    { id: "experience", label: "Experience" },
    { id: "contact",    label: "Contact" }
  ],

  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/souhaib-abdulaal-1a7416381" },
    { label: "Behance",  url: "https://www.behance.net/sahibabdel-aal" },
    { label: "WhatsApp", url: "https://wa.me/qr/VT2Q77GQFDL3O1" }
  ],

  /* -------------------------------------------------------------------- hero */
  hero: {
    hi: "Hi, I'm Souhaib",
    title: ["DESIGN THAT", "*SIMPLIFIES*", "COMPLEXITY."],     // three short lines work best. *stars* = outlined word
    ghost: "Portfolio",
    intro: "Product designer focused on SaaS and system-driven experiences. I turn complex workflows and data into products people can use with ease.",
    photos: ["assets/souhaib-hoodie.jpg", "assets/souhaib-jacket.jpg"],   // two photos of you (4:5 works best)
    cta: [
      { label: "View projects", href: "#work",    style: "accent" },
      { label: "Hire me",       href: "#contact", style: "ghost" }
    ]
  },

  /* scrolling ribbons under the hero */
  ribbons: [
    ["UX Design", "UI Design", "Wireframing", "Prototyping", "User Research", "Design Systems", "Mobile App Design", "Accessibility Design"],
    ["Figma", "Miro", "Notion", "Jira", "Webflow", "Lovable", "Midjourney", "Figma Make"]
  ],

  /* ------------------------------------------------------------------- about */
  about: {
    label: "About me",
    photo: "assets/souhaib-wide.jpg",                             // a photo of you (4:5)
    badge: "Product Designer ✦ UX ✦ UI ✦ Research ✦ ",
    statement: "I simplify complexity by improving *user flows,* structuring data-heavy systems and creating *seamless, data-driven journeys.*",
    rolesLead: "I'm a",
    roles: ["Product Designer.", "UI/UX Designer.", "Problem solver.", "Collaborator."],
    text: [
      "I'm a product designer focused on SaaS and system-driven experiences. I solve complex workflow and data challenges in a way that supports both user needs and business goals.",
      "My work is built on UX and product practice: user research, usability testing and tracking key metrics such as conversion and adoption, so friction goes down and decisions get easier."
    ],
    languages: ["Arabic (native)", "English", "German"],
    stats: [
      { value: 2, suffix: "+", label: "Years in product design" },   // freelance since Oct 2024
      { value: 5, suffix: "",  label: "Case studies" },
      { value: 3, suffix: "",  label: "UX training programs" },
      { value: 3, suffix: "",  label: "Languages" }
    ]
  },

  /* ------------------------------------------------------------------ skills */
  /* icon: "figma", "ps", "ai", "code", or leave it out to show the first letters of the name.
     level: 0 to 100, shown as the bar and the percentage. */
  skills: {
    label: "My skills",
    title: "Design skills that *bring ideas to life*",
    sub: "I use modern tools and creative thinking to design user-friendly and visually stunning digital products.",
    cta: "Explore services",
    items: [
      { name: "Figma",             area: "UI/UX Design",    level: 95, icon: "figma" },
      { name: "Adobe Photoshop",   area: "Visual Design",   level: 90, icon: "ps" },
      { name: "Adobe Illustrator", area: "Graphics",        level: 85, icon: "ai" },
      { name: "HTML & CSS",        area: "Web Development", level: 80, icon: "code" }
    ]
  },

  /* ------------------------------------------------------------------- stack */
  stack: {
    label: "Toolbox",
    title: "The elements I *design with*",
    note: "Pick a group to light it up.",
    groups: ["UX", "UI", "AI", "Tools", "Soft skills"],
    items: [                                                       // sym = 2-letter symbol on the tile
      { sym: "Ur", name: "User Research",            group: "UX" },
      { sym: "Ut", name: "Usability Testing",        group: "UX" },
      { sym: "Ix", name: "Interaction Design",       group: "UX" },
      { sym: "Dt", name: "Design Thinking",          group: "UX" },
      { sym: "Wf", name: "Wireframing",              group: "UI" },
      { sym: "Pt", name: "Prototyping",              group: "UI" },
      { sym: "Vd", name: "Visual Design",            group: "UI" },
      { sym: "Ds", name: "Design Systems",           group: "UI" },
      { sym: "Mo", name: "Motion & Interaction",     group: "UI" },
      { sym: "Ai", name: "AI-Assisted UX/UI Design", group: "AI" },
      { sym: "Pr", name: "Prompting for Ideation",   group: "AI" },
      { sym: "Gv", name: "Generative Visual Design", group: "AI" },
      { sym: "Wo", name: "AI Workflow Optimization", group: "AI" },
      { sym: "Fg", name: "Figma",                    group: "Tools" },
      { sym: "Fm", name: "Figma Make",               group: "Tools" },
      { sym: "Mi", name: "Miro",                     group: "Tools" },
      { sym: "No", name: "Notion",                   group: "Tools" },
      { sym: "Ji", name: "Jira",                     group: "Tools" },
      { sym: "Wb", name: "Webflow",                  group: "Tools" },
      { sym: "Lv", name: "Lovable",                  group: "Tools" },
      { sym: "Mj", name: "Midjourney",               group: "Tools" },
      { sym: "Cm", name: "Communication",            group: "Soft skills" },
      { sym: "Cb", name: "Collaboration",            group: "Soft skills" },
      { sym: "Ps", name: "Problem-Solving",          group: "Soft skills" },
      { sym: "Pn", name: "Presentation Skills",      group: "Soft skills" },
      { sym: "At", name: "Attention to Detail",      group: "Soft skills" },
      { sym: "Em", name: "Empathy",                  group: "Soft skills" }
    ]
  },

  /* ---------------------------------------------------------------- services */
  services: {
    label: "Services",
    title: "Here's what I can do to bring your *product to life*",
    sub: "From early research to developer handoff, I can join at any stage and keep the experience consistent.",
    cta: "Start a project",
    items: [
      { title: "Product & SaaS Design", text: "Dashboards, workflows and data-heavy systems, structured so teams can find what they need and act on it.", tags: ["SaaS", "Dashboards", "User flows"] },
      { title: "UX Research & Testing", text: "User research, competitor analysis and usability testing that show where people struggle and what to fix first.", tags: ["User research", "Usability testing", "Design thinking"] },
      { title: "UI Design & Prototyping", text: "Responsive interfaces, reusable components and high-fidelity prototypes for web, mobile apps and landing pages.", tags: ["Wireframing", "Prototyping", "Design systems"] },
      { title: "AI-Assisted Design", text: "AI built into the workflow for faster ideation and visuals, from prompting to generative design with Midjourney.", tags: ["Prompting", "Midjourney", "Figma Make"] }
    ]
  },

  process: {
    label: "How I work",
    steps: [
      { title: "Empathize", text: "User research, competitor analysis and conversations with stakeholders, to understand who the product is for and what gets in their way." },
      { title: "Define",    text: "I turn the findings into clear problems, user flows and a sitemap, so everyone agrees on what we are solving." },
      { title: "Ideate",    text: "Sketches and wireframes explore several directions quickly, before any screen gets polished." },
      { title: "Prototype", text: "High-fidelity screens, reusable components and an interactive Figma prototype that behaves like the real product." },
      { title: "Test",      text: "Usability sessions and user feedback show what to fix. Then I work with developers so the build matches the design." }
    ]
  },

  /* -------------------------------------------------------------------- work */
  work: {
    label: "Selected work",
    title: "Explore a few projects *I'm proud of*",
    sub: "Five products across SaaS, e-commerce, legal services and learning. Open a card to see the details.",
    filterBy: "year",                                          // the filter buttons are built from this project field: "year" or "category"
    moreLabel: "See more on Behance",
    moreUrl: "https://www.behance.net/sahibabdel-aal",
    /* Starter projects. Once you save anything in the dashboard (/admin), the site shows the
       dashboard's list instead and this one is only a fallback.
       body = the details view: a blank line starts a paragraph, lines starting with "- " become bullets. */
    projects: [                                                // images are PLACEHOLDERS: replace each with a real screenshot (16:10)
      {
        title: "Ghzeer SaaS Platform", category: "SaaS platform", year: "2024", role: "Product Designer",
        text: "SaaS dashboards and workflows tailored for organizational users, refined through user feedback, testing sessions and iterative design.",
        tags: ["SaaS", "Dashboards", "Usability testing"],
        body: "- Designed SaaS dashboards and workflows tailored for organizational users.\n- Improved usability through user feedback, testing sessions and iterative design.\n- Created responsive interfaces aligned with business goals and user needs.\n- Worked closely with developers to ensure seamless implementation and consistency.",
        image: "assets/projects/ghzeer.svg", gallery: [],
        links: [{ label: "View in Figma", url: "https://www.figma.com/design/LbtwSq2EzS3q9vM56EOq24/Ghzeer-UI-UX---English-Version?node-id=0-1&t=SjFVBvIhSAaxrkdl-1" }]
      },
      {
        title: "Bazar E-Commerce Platform", category: "E-commerce", year: "2025", role: "Product Designer",
        text: "Buying and selling experiences for new and used products, built on market and user research for the Syrian e-commerce market.",
        tags: ["E-commerce", "User research", "Payment flows"],
        body: "- Conducted market and user research for the Syrian e-commerce market.\n- Designed intuitive buying and selling experiences for new and used products.\n- Improved trust and usability through testing and user feedback analysis.\n- Collaborated with developers on payment, delivery and product management flows.",
        image: "assets/projects/bazar.svg", gallery: [],
        links: [{ label: "View case study", url: "https://www.behance.net/gallery/232197811/Bazar-%28-Mart-Application-%29" }]
      },
      {
        title: "Mohameek Legal Platform", category: "Legal services", year: "2025", role: "Product Designer",
        text: "Accessible legal service interfaces for consultations and appointments that turn complex legal workflows into simple steps.",
        tags: ["Legal services", "Accessibility", "Usability testing"],
        body: "- Designed accessible legal service interfaces for consultations and appointments.\n- Simplified complex legal workflows into user-friendly digital experiences.\n- Conducted usability testing and optimized interfaces based on user insights.\n- Worked with developers to maintain consistency between functionality and UI design.",
        image: "assets/projects/mohameek.svg", gallery: [],
        links: [{ label: "View case study", url: "https://www.behance.net/gallery/249311661/Mohamek-Lawyer-UI-UX-Case-Study-%28Website%29" }]
      },
      {
        title: "Umami SA", category: "Learning platform", year: "2026", role: "UI/UX Designer",
        text: "Interactive learning interfaces that simplify complex educational content into engaging, easy-to-use experiences.",
        tags: ["Learning", "Interaction design", "Accessibility"],
        body: "- Designing interactive learning interfaces that simplify complex educational content into engaging, easy-to-use experiences.\n- Improving UX based on research and usability testing to increase engagement and accessibility.",
        image: "assets/projects/umami.svg", gallery: [],
        links: [{ label: "View in Figma", url: "https://www.figma.com/design/9PY0mewnEXPJYC3IemWwdz/UMAMI-SA?node-id=0-1&t=4lEl8ZFtG0zRZoT1-1" }]
      },
      {
        title: "Riwaq Website", category: "Website", year: "2026", role: "UI/UX Designer",
        text: "Website interfaces that improve content discovery, with clearer user journeys, information architecture and visual hierarchy across devices.",
        tags: ["Website", "Information architecture", "Responsive"],
        body: "- Designing intuitive and engaging website interfaces that enhance content discovery and provide a seamless user experience across devices.\n- Improving user journeys, information architecture and visual hierarchy to make navigation easier and help users access relevant content efficiently.",
        image: "assets/projects/riwaq.svg", gallery: [],
        links: [{ label: "View case study", url: "https://www.behance.net/gallery/247832609/Riwaq-UI-UX-Case-Study-(Website)" }]
      }
    ]
  },

  /* -------------------------------------------------------------- experience */
  experience: {
    label: "Experience",
    title: "A snapshot of where *I've grown*",
    sub: "Roles and the training that shaped how I design.",
    items: [
      {
        period: "May 2026 — Now", role: "Product Designer at Broker Times", place: "UAE · Remote", type: "Full-time",
        stack: ["UI/UX design", "Design components", "Competitor analysis", "Design research"],
        text: "Designing intuitive, user-centered digital experiences and keeping them consistent across web platforms and products.",
        points: [
          "Created responsive interfaces and reusable design components to streamline the design process",
          "Worked with cross-functional teams to turn business requirements into UI/UX solutions",
          "Ran competitor analysis and design research to find usability improvements"
        ]
      },
      {
        period: "Oct 2024", role: "Freelance UI/UX Designer", place: "Cairo, Egypt", type: "Freelance",
        stack: ["Research", "Wireframing", "Prototyping", "Developer handoff"],
        text: "Working closely with clients and stakeholders to deliver user-centered digital solutions.",
        points: [
          "Managed the full design process, from research and wireframing to high-fidelity prototypes",
          "Designed responsive mobile apps, dashboards and landing pages across different industries",
          "Worked with developers to ensure smooth implementation and a consistent experience"
        ]
      }
    ],
    coursesTitle: "Courses & certificates",
    courses: [
      {
        title: "Google UX Design", by: "Coursera",
        text: "Foundations of UX, the empathize, define and ideate process, wireframes and low-fidelity prototypes, UX research and testing, and high-fidelity design in Figma.",
        link: { label: "View credential", url: "https://www.coursera.org/account/accomplishments/specialization/3GXSQ0VCMWJH" }
      },
      {
        title: "UX/UI Designer (Web Designer)", by: "Digital Egypt Pioneers Initiative (DEPI)",
        text: "Practical training in UX design principles with a focus on innovative and user-friendly solutions."
      },
      {
        title: "UI/UX Designer", by: "ITI · 1 month",
        text: "Training in user research, usability testing, wireframing, prototyping and accessibility, with hands-on projects."
      }
    ]
  },

  /* ----------------------------------------------------------------- contact */
  contact: {
    label: "Contact",
    title: "Your product, my design. *Let's connect.*",
    sub: "Tell me about your product, your users and where they get stuck.",
    interests: ["Product design", "UX research", "UI design", "Mobile app", "Website", "Something else"],
    button: "Send message"
  },

  footer: {
    line: "Design that simplifies complexity."
  },

  /* fixed interface text. The Arabic versions are in js/content.ar.js */
  ui: {
    skip: "Skip to content", talk: "Let's talk", resume: "Resume", scroll: "Scroll", all: "All", step: "Step ",
    languages: "Languages", ghostAbout: "About", ghostServices: "Services", ghostWork: "Work", ghostJourney: "Journey",
    location: "Location", type: "Type", show: "Show", hide: "Hide", focus: "Focus", details: "Details",
    readDetails: "Read details", noProjects: "New projects are on their way.", moreWork: "More work", project: "Project",
    whatIDid: "What I did", previous: "Previous", next: "Next", copy: "Copy", copied: "Copied", selected: "Selected",
    interestedIn: "I'm interested in", yourName: "Your name", yourEmail: "Email address", yourMessage: "Tell me about your project",
    formInvalid: "Add your name, a valid email and a short message, then send again.", formSending: "Sending…",
    formSent: "Thank you. Your message is on its way.", formFailed: "That did not send. Please email", formMailApp: "Your email app should open with the message ready. If it does not, write to",
    rights: "All rights reserved.", portrait: "Portrait of", accent: "Accent", language: "Language",
    toLight: "Switch to light mode", toDark: "Switch to dark mode", openMenu: "Open menu", closeMenu: "Close menu",
    closeDetails: "Close project details", backToTop: "Back to top"
  }
};
