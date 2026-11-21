import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'studentexchange.db');
export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      is_free INTEGER NOT NULL DEFAULT 1,
      price_label TEXT NOT NULL DEFAULT 'Free',
      provider TEXT NOT NULL DEFAULT 'StudentExchange Curated',
      duration TEXT NOT NULL DEFAULT 'Self-paced',
      resource_url TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      author_name TEXT NOT NULL,
      university TEXT NOT NULL DEFAULT '',
      github_url TEXT NOT NULL DEFAULT '',
      demo_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'approved',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hardware_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      listing_type TEXT NOT NULL,
      condition TEXT NOT NULL,
      price_label TEXT NOT NULL,
      exchange_for TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      seller_contact_note TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      specs TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      is_available INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS competitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      organizer TEXT NOT NULL,
      description TEXT NOT NULL,
      deadline TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      prize_or_benefit TEXT NOT NULL DEFAULT '',
      registration_url TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Online',
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      community_group TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_status TEXT NOT NULL DEFAULT 'upcoming',
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      highlight_note TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      registration_url TEXT NOT NULL DEFAULT '',
      is_aws_initiative INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS aws_learning_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      service_focus TEXT NOT NULL,
      level TEXT NOT NULL,
      format TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL,
      resource_url TEXT NOT NULL,
      is_student_led INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_type TEXT NOT NULL DEFAULT 'general',
      reference_id INTEGER,
      reference_title TEXT NOT NULL DEFAULT '',
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      institution TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  migrateCommunityEvents();
  seedInitialDemoData();
}

function migrateCommunityEvents(): void {
  const cols = db.prepare('PRAGMA table_info(community_events)').all() as Array<{ name: string }>;
  const colNames = new Set(cols.map((c) => c.name));
  if (!colNames.has('event_status')) {
    db.exec("ALTER TABLE community_events ADD COLUMN event_status TEXT NOT NULL DEFAULT 'upcoming'");
  }
  if (!colNames.has('highlight_note')) {
    db.exec("ALTER TABLE community_events ADD COLUMN highlight_note TEXT NOT NULL DEFAULT ''");
  }
  if (!colNames.has('image_url')) {
    db.exec("ALTER TABLE community_events ADD COLUMN image_url TEXT NOT NULL DEFAULT ''");
  }
}

function seedInitialDemoData(): void {
  const statsCount = db.prepare('SELECT COUNT(*) as c FROM platform_stats').get() as { c: number };
  if (statsCount.c === 0) {
    const insertStat = db.prepare(
      'INSERT INTO platform_stats (stat_key, label, value, note) VALUES (?, ?, ?, ?)'
    );
    insertStat.run('learning_resources', 'Learning Resources', '9', 'Free courses & open tracks');
    insertStat.run('student_projects', 'Student Projects', '5', 'Open-source student builds');
    insertStat.run('hardware_listings', 'Hardware Listings', '6', 'Boards & kits ready to swap');
    insertStat.run('community_events', 'Community Events', '7', 'Workshops & live sessions');
  } else {
    db.exec(`
      UPDATE platform_stats SET note = 'Free courses & open tracks'
        WHERE stat_key = 'learning_resources' AND (note LIKE '%Demo%' OR note LIKE '%Editable%');
      UPDATE platform_stats SET note = 'Open-source student builds'
        WHERE stat_key = 'student_projects' AND (note LIKE '%Demo%' OR note LIKE '%Editable%');
      UPDATE platform_stats SET note = 'Boards & kits ready to swap'
        WHERE stat_key = 'hardware_listings' AND (note LIKE '%Demo%' OR note LIKE '%Editable%');
      UPDATE platform_stats SET note = 'Workshops & live sessions'
        WHERE stat_key = 'community_events' AND (note LIKE '%Demo%' OR note LIKE '%Editable%');
    `);
  }

  const learningCount = db.prepare('SELECT COUNT(*) as c FROM learning_resources').get() as { c: number };
  if (learningCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO learning_resources
      (title, category, difficulty, description, is_free, price_label, provider, duration, resource_url, image_url, is_featured, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    ins.run(
      'Python for Scientific Computing & Automation',
      'Python',
      'Beginner',
      'Hands-on foundations in Python data structures, scripting, file pipelines, and NumPy fundamentals built for first-year engineering students.',
      1,
      'Free',
      'CS50 & OpenCourseWare Curated',
      '6 Weeks',
      'https://docs.python.org/3/tutorial/',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      1
    );
    ins.run(
      'Full-Stack Web Engineering with React & TypeScript',
      'Web Development',
      'Intermediate',
      'Build accessible multi-page web applications, REST APIs, and responsive interfaces using modern TypeScript and component architecture.',
      1,
      'Free',
      'MDN & React Open Curriculum',
      '8 Weeks',
      'https://react.dev/learn',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      1
    );
    ins.run(
      'Cloud Foundations & Serverless Architecture on AWS',
      'AWS',
      'Beginner',
      'Understand IAM, S3 static hosting, Lambda functions, and DynamoDB patterns through student-led walkthroughs and sandbox labs.',
      1,
      'Free',
      'AWS Skill Builder Open Track',
      '4 Weeks',
      'https://explore.skillbuilder.aws/',
      '/src/assets/images/aws_cloud_builders_1795281329492.jpg',
      1
    );
    ins.run(
      'Applied Machine Learning & Neural Networks',
      'Machine Learning',
      'Intermediate',
      'Supervised learning, model evaluation, feature engineering, and scikit-learn workflows with reproducible campus datasets.',
      1,
      'Free',
      'Fast.ai & Open ML Labs',
      '10 Weeks',
      'https://course.fast.ai/',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      1
    );
    ins.run(
      'Embedded Systems & MQTT Telemetry with ESP32',
      'IoT',
      'Beginner',
      'Program Wi-Fi microcontrollers, read DHT22 and ultrasonic sensors, and stream environmental readings to lightweight cloud brokers.',
      1,
      'Free',
      'StudentExchange Maker Lab',
      '5 Weeks',
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      1
    );
    ins.run(
      'Object-Oriented Systems & Spring Boot in Java',
      'Java',
      'Intermediate',
      'Design clean backend services, concurrency primitives, and REST endpoints in modern Java for university capstone backends.',
      1,
      'Free',
      'Dev.java Open Guides',
      '7 Weeks',
      'https://dev.java/learn/',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      0
    );
    ins.run(
      'Practical Web Application Security & CTF Lab',
      'Cybersecurity',
      'Intermediate',
      'Learn threat modeling, OWASP Top 10 defenses, secure session handling, and defensive auditing in hands-on student CTF challenges.',
      1,
      'Free',
      'OWASP Open Education',
      '6 Weeks',
      'https://owasp.org/www-project-top-ten/',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      0
    );
    ins.run(
      'Generative AI & Retrieval Pipelines Workshop',
      'Artificial Intelligence',
      'Advanced',
      'Build grounded document Q&A workflows, structured extraction, and evaluation harnesses using open benchmarks.',
      0,
      'Scholarship / $19 Audit',
      'DeepLearning Open Track',
      '4 Weeks',
      'https://www.deeplearning.ai/',
      '/src/assets/images/hero_student_makers_1795281326782.jpg',
      1
    );
    ins.run(
      'Distributed Containers, Docker & Cloud Networking',
      'Cloud Computing',
      'Advanced',
      'Containerize multi-service student apps, configure VPC subnets, and deploy resilient services with automated health checks.',
      1,
      'Free',
      'CNCF Cloud Native Student Guide',
      '5 Weeks',
      'https://kubernetes.io/docs/tutorials/',
      '/src/assets/images/aws_cloud_builders_1795281329492.jpg',
      0
    );
  }

  const projectCount = db.prepare('SELECT COUNT(*) as c FROM student_projects').get() as { c: number };
  if (projectCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO student_projects
      (title, category, description, tech_stack, author_name, university, github_url, demo_url, image_url, status, is_featured, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, 1)
    `);
    ins.run(
      'AgroSense Autonomous Rover & Soil Node',
      'IoT',
      'Solar-assisted campus testbed rover combining LiDAR obstacle avoidance with ESP32 moisture telemetry nodes and real-time dashboard alerts.',
      'ESP32, ROS2, MQTT, Python, React',
      'Ananya Verma & Robotics Club',
      'NIT Surathkal (Demo)',
      'https://github.com/studentexchange-demo/agrosense-rover',
      'https://studentexchange-demo.example.org/agrosense',
      '/src/assets/images/project_iot_robotics_1795281329280.jpg',
      1
    );
    ins.run(
      'CloudPulse Serverless Lab Grader',
      'Cloud',
      'Event-driven student lab evaluator built on AWS Lambda, API Gateway, and S3 that checks infrastructure exercises and returns instant feedback.',
      'AWS Lambda, DynamoDB, TypeScript, CDK',
      'Marcus Chen',
      'University of Waterloo (Demo)',
      'https://github.com/studentexchange-demo/cloudpulse-grader',
      'https://studentexchange-demo.example.org/cloudpulse',
      '/src/assets/images/aws_cloud_builders_1795281329492.jpg',
      1
    );
    ins.run(
      'SignBridge Real-Time Gesture Translator',
      'AI/ML',
      'Lightweight browser landmark classifier converting ASL fingerspelling into live captions with sub-40ms on-device inference.',
      'PyTorch, MediaPipe, ONNX Runtime, React',
      'Priya Nair & AI Guild',
      'IIIT Hyderabad (Demo)',
      'https://github.com/studentexchange-demo/signbridge-ai',
      'https://studentexchange-demo.example.org/signbridge',
      '/src/assets/images/hero_student_makers_1795281326782.jpg',
      1
    );
    ins.run(
      'CampusSwap Book & Lab Kit Scheduler',
      'Web Development',
      'Peer-to-peer semester textbook and lab equipment lending board with QR pickup verification for engineering departments.',
      'React, TypeScript, Express, SQLite',
      'Daniel Okafor',
      'Georgia Tech (Demo)',
      'https://github.com/studentexchange-demo/campusswap-web',
      'https://studentexchange-demo.example.org/campusswap',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      1
    );
    ins.run(
      'TransitMate Accessible Campus Shuttle App',
      'Mobile Apps',
      'Cross-platform shuttle arrival predictor featuring high-contrast voice-over schedules and crowd-sourced occupancy notes.',
      'React Native, TypeScript, GeoJSON, Node.js',
      'Sofia Alvarez',
      'UT Austin (Demo)',
      'https://github.com/studentexchange-demo/transitmate-mobile',
      'https://studentexchange-demo.example.org/transitmate',
      '/src/assets/images/hero_student_makers_1795281326782.jpg',
      0
    );
  }

  const hardwareCount = db.prepare('SELECT COUNT(*) as c FROM hardware_listings').get() as { c: number };
  if (hardwareCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO hardware_listings
      (title, category, listing_type, condition, price_label, exchange_for, location, seller_name, seller_contact_note, description, specs, image_url, is_available, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    ins.run(
      'Arduino Uno R3 + Sensor Prototyping Bundle',
      'Arduino boards',
      'Exchange',
      'Like New',
      'Swap / Open to Offers',
      'ESP32-S3 DevKit or Logic Analyzer',
      'Bengaluru · South Campus Lab',
      'Rohan Kulkarni (Demo)',
      'Available weekdays after 4 PM near ECE Block',
      'Genuine Arduino Uno R3 used for one semester embedded lab, bundled with 830-point breadboard, HC-SR04 ultrasonic sensor, and 40 jumper wires.',
      'ATmega328P, 14 Digital I/O, 6 Analog Inputs, USB-B Cable included',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      1
    );
    ins.run(
      'Raspberry Pi 4 Model B (4GB RAM) + Aluminum Case',
      'Raspberry Pi',
      'Sell',
      'Lightly Used',
      '$38 (Student Price)',
      '',
      'Austin · Engineering Quad',
      'Hannah Park (Demo)',
      'Includes 32GB microSD flashed with Raspberry Pi OS',
      'Well-maintained Raspberry Pi 4B used as a local Docker & MQTT home lab node. Tested HDMI, dual USB 3.0, and Gigabit Ethernet.',
      'Quad-core Cortex-A72, 4GB LPDDR4, Dual-band Wi-Fi, USB-C Power Supply',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      1
    );
    ins.run(
      'ESP32-WROOM-32 Dual-Core Wi-Fi Dev Pack (2 Units)',
      'ESP32 and ESP8266',
      'Buy',
      'New / Sealed',
      '$12 for Pair',
      '',
      'Toronto · St. George Campus',
      'Liam Patel (Demo)',
      'Ordered extra units for IoT hackathon team',
      'Two 38-pin ESP32-WROOM-32 development boards with CP2102 USB-to-UART bridge, ideal for Wi-Fi telemetry and BLE wearable prototypes.',
      '240MHz Dual Core, 520KB SRAM, Wi-Fi 802.11 b/g/n, Bluetooth 4.2',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      1
    );
    ins.run(
      'Ultrasonic, DHT22 & IMU Sensor Kit (6 Modules)',
      'Sensors',
      'Donate',
      'Tested Working',
      'Free for First-Year Builders',
      '',
      'Pune · Hardware Makerspace',
      'Meera Joshi (Demo)',
      'Priority for students building their first hardware hackathon project',
      'Graduating senior donating leftover calibrated sensor modules: 2x HC-SR04, 2x DHT22 temp/humidity, 1x MPU6050 6-axis gyro, 1x OLED I2C screen.',
      '3.3V/5V compatible, header pins soldered cleanly',
      '/src/assets/images/project_iot_robotics_1795281329280.jpg',
      1
    );
    ins.run(
      '4WD Aluminum Robotics Chassis + L298N Motor Driver',
      'Robotics components',
      'Exchange',
      'Good Condition',
      'Swap for LiPo Balance Charger',
      '2S/3S LiPo Charger or Servo Pack',
      'Seattle · Robotics Annex',
      'Devon Brooks (Demo)',
      'Motors tested at 6V and 9V',
      'Sturdy 4-wheel robotics chassis with DC geared motors, rubber tread wheels, and dual H-bridge L298N driver board ready for autonomous rover builds.',
      '4x 200RPM DC Geared Motors, Aluminum frame, L298N Dual H-Bridge',
      '/src/assets/images/project_iot_robotics_1795281329280.jpg',
      1
    );
    ins.run(
      'STM32 Nucleo-F446RE & Logic Analyzer Starter Set',
      'Development boards',
      'Sell',
      'Like New',
      '$22',
      '',
      'Hyderabad · Innovation Hub',
      'Karthik Reddy (Demo)',
      'Comes with original packaging and pinout card',
      'ARM Cortex-M4 Nucleo development board paired with an 8-channel 24MHz USB logic analyzer for SPI, I2C, and UART debugging.',
      'STM32F446RE 180MHz, ST-LINK/V2-1 integrated, Arduino Uno V3 headers',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      1
    );
  }

  const compCount = db.prepare('SELECT COUNT(*) as c FROM competitions').get() as { c: number };
  if (compCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO competitions
      (title, type, organizer, description, deadline, eligibility, prize_or_benefit, registration_url, location, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    ins.run(
      'BuildForCampus Hardware & Cloud Hackathon',
      'Hackathons',
      'StudentExchange & Partner Engineering Clubs',
      '48-hour interdisciplinary build sprint challenging student teams to pair affordable microcontrollers with resilient cloud backends.',
      '2026-12-15',
      'Undergraduate & Postgraduate Students (Teams of 2-4)',
      '$3,500 Hardware Grants + Mentorship',
      'https://mlh.io/seasons/2026/events',
      'Hybrid · Campus Hubs & Online'
    );
    ins.run(
      'Student-Led Serverless Architecture Challenge',
      'AWS challenges',
      'AWS Student Builder Group (Student-Led Initiative)',
      'Design and deploy a cost-efficient serverless web or IoT pipeline using core cloud primitives and present your architecture diagram.',
      '2026-12-08',
      'All University Builders · Beginner Track Open',
      'Cloud Credits + Showcase Spotlight',
      'https://aws.amazon.com/education/awseducate/',
      'Online'
    );
    ins.run(
      'Winter Algorithmic & Systems Coding Contest',
      'Coding contests',
      'Inter-Collegiate Computing Society',
      'Three-hour competitive programming and systems optimization round covering graphs, dynamic programming, and concurrency.',
      '2026-11-30',
      'Individual University Students',
      'Internship Fast-Track + Certificates',
      'https://codeforces.com/',
      'Online'
    );
    ins.run(
      'Open Hardware & Sustainability Innovation Program',
      'Student innovation programs',
      'Campus Circular Hardware Collective',
      'Eight-week cohort supporting student teams turning salvaged sensors and single-board computers into campus sustainability tools.',
      '2027-01-10',
      'Open to All Engineering & Design Majors',
      'Bench Space + Component Stipend',
      'https://www.oshwa.org/',
      'Regional Partner Campuses'
    );
    ins.run(
      'Summer Embedded & Cloud Engineering Internship Track',
      'Internships',
      'Open Tech Partner Network',
      'Curated directory of student-friendly embedded firmware, DevOps, and full-stack summer internship openings with open portfolios.',
      '2027-01-25',
      '2nd & 3rd Year CS / ECE / IT Students',
      'Paid 12-Week Engineering Placement',
      'https://github.com/SimplifyJobs/Summer2026-Internships',
      'Remote & Hybrid'
    );
    ins.run(
      'Weekend KiCad PCB & ESP32 Telemetry Workshop',
      'Workshops',
      'StudentExchange Maker Guild',
      'Hands-on Saturday workshop taking students from schematic capture in KiCad to soldering and flashing a working Wi-Fi sensor node.',
      '2026-12-03',
      'Open to Beginners · No Prior PCB Experience',
      'Take-Home Lab Files + Community Badge',
      'https://www.kicad.org/discover/',
      'Hybrid Workshop'
    );
  }

  const eventCount = db.prepare('SELECT COUNT(*) as c FROM community_events').get() as { c: number };
  if (eventCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO community_events
      (title, community_group, event_type, event_status, event_date, location, description, highlight_note, image_url, registration_url, is_aws_initiative, is_demo)
      VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    ins.run(
      'AWS Student Builder Study Jam: Serverless APIs & DynamoDB',
      'AWS Student Builder Group',
      'Student-Led Technical Session',
      '2026-11-28 · 17:30 UTC',
      'Online + Partner Campus Chapters',
      'Student-led practical session walking through building a zero-cost student project API with Lambda, API Gateway, and DynamoDB.',
      'Free tier sandbox · Live Q&A + starter repo',
      '/src/assets/images/aws_cloud_builders_1795281329492.jpg',
      'https://builder.aws.com/',
      1
    );
    ins.run(
      'Hardware Swap Meet & Soldering Clinic',
      'StudentExchange Maker Collective',
      'In-Person Workshop & Clinic',
      '2026-12-05 · 14:00 Local',
      'Engineering Atrium · Partner Campuses',
      'Bring unused Arduinos, breadboards, and sensors to test, trade, or donate to first-year students preparing for winter hackathons.',
      'Hands-on bench testing · Open to beginners',
      '/src/assets/images/hardware_kits_workbench_1795281328401.jpg',
      'https://studentexchange-demo.example.org/swap-meet',
      0
    );
    ins.run(
      'Deploy Your First Static & Edge App on Cloud Storage',
      'AWS Student Builder Group',
      'Beginner Workshop',
      '2026-12-12 · 16:00 UTC',
      'Online Livestream',
      'Step-by-step beginner workshop hosted by student organizers covering S3 hosting, CloudFront caching, and custom domain DNS.',
      '90-min guided build · Certificate of participation',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      'https://explore.skillbuilder.aws/',
      1
    );
    ins.run(
      'Open Source Project Demo Day & Peer Review',
      'StudentExchange Open Builders',
      'Bootcamp Demo Day',
      '2026-12-19 · 18:00 UTC',
      'Virtual Demo Stage',
      'Five-minute live student demos featuring IoT rovers, AI accessibility apps, and cloud tools with constructive engineering feedback.',
      '18 student teams presenting · Open audience',
      '/src/assets/images/hero_student_makers_1795281326782.jpg',
      'https://github.com/',
      0
    );
  }

  // Ensure existing upcoming rows have fallback images and seed Past Events if absent
  db.exec(`
    UPDATE community_events
    SET image_url = '/src/assets/images/aws_cloud_builders_1795281329492.jpg'
    WHERE (image_url IS NULL OR image_url = '') AND is_aws_initiative = 1;
    UPDATE community_events
    SET image_url = '/src/assets/images/hero_student_makers_1795281326782.jpg'
    WHERE (image_url IS NULL OR image_url = '') AND is_aws_initiative = 0;
  `);

  const pastCount = db
    .prepare("SELECT COUNT(*) as c FROM community_events WHERE event_status = 'past'")
    .get() as { c: number };
  if (pastCount.c === 0) {
    const insPast = db.prepare(`
      INSERT INTO community_events
      (title, community_group, event_type, event_status, event_date, location, description, highlight_note, image_url, registration_url, is_aws_initiative, is_demo)
      VALUES (?, ?, ?, 'past', ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insPast.run(
      'Autumn Cloud & Containers Bootcamp Cohort',
      'AWS Student Builder Group',
      'Bootcamp Recap',
      '2026-10-18 · Completed',
      'Online + 6 Campus Hubs',
      'Four-week student-led cohort covering Docker containerization, CI/CD pipelines, and deploying production APIs on cloud infrastructure.',
      '130+ student attendees · Slides & lab repo archived',
      '/src/assets/images/aws_cloud_builders_1795281329492.jpg',
      'https://explore.skillbuilder.aws/',
      1
    );
    insPast.run(
      'ESP32 Telemetry & Autonomous Rover Workshop',
      'StudentExchange Maker Collective',
      'Workshop Recap',
      '2026-09-27 · Completed',
      'Robotics Lab · Engineering Block',
      'Full-day hardware build clinic where student pairs wired ultrasonic sensors to ESP32 boards and streamed live telemetry over MQTT.',
      '28 working prototypes · Schematics & firmware open',
      '/src/assets/images/project_iot_robotics_1795281329280.jpg',
      'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/',
      0
    );
    insPast.run(
      'Full-Stack React & TypeScript Weekend Sprint',
      'StudentExchange Open Builders',
      'Sprint Recap',
      '2026-09-06 · Completed',
      'Virtual Engineering Stage',
      'Two-day collaborative workshop taking first-year and second-year builders from component architecture to deployed RESTful applications.',
      '42 open-source demos · Recording & notes published',
      '/src/assets/images/learning_cloud_code_1795281329282.jpg',
      'https://react.dev/learn',
      0
    );
  }

  const awsCount = db.prepare('SELECT COUNT(*) as c FROM aws_learning_resources').get() as { c: number };
  if (awsCount.c === 0) {
    const ins = db.prepare(`
      INSERT INTO aws_learning_resources
      (title, service_focus, level, format, description, duration, resource_url, is_student_led, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
    `);
    ins.run(
      'Cloud Foundations Learning Path for First-Time Builders',
      'IAM, EC2, S3, VPC',
      'Foundational',
      'Guided Learning Path',
      'Student-curated sequence introducing cloud compute, storage buckets, least-privilege IAM roles, and billing alarms before launching labs.',
      '4 Hours',
      'https://explore.skillbuilder.aws/',
    );
    ins.run(
      'Serverless Student Project Starter with Lambda & API Gateway',
      'Lambda, API Gateway, DynamoDB',
      'Builder Lab',
      'Hands-On Cloud Project',
      'Build a real backend API for a campus club or IoT sensor collector using serverless functions and NoSQL tables within free-tier limits.',
      '3 Hours',
      'https://aws.amazon.com/getting-started/hands-on/',
    );
    ins.run(
      'IoT Core Telemetry Pipeline for ESP32 Boards',
      'AWS IoT Core, Timestream',
      'Associate',
      'Architecture Workshop',
      'Connect an ESP32 microcontroller over MQTT with X.509 certificates and visualize live environmental metrics in a web dashboard.',
      '2.5 Hours',
      'https://docs.aws.amazon.com/iot/',
    );
    ins.run(
      'Containerizing Student Web Apps on ECS & CloudFront',
      'ECS, Fargate, CloudFront',
      'Associate',
      'Student-Led Technical Session',
      'Package a full-stack React + Node or Django app with Docker, push to ECR, and serve static assets through edge caching.',
      '3.5 Hours',
      'https://aws.amazon.com/containers/',
    );
  }
}
