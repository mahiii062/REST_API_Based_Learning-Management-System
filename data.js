// necessary setup
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require("./helpers/utils");

const PERSIST_FILE = path.join(__dirname, 'persist.json');

let state = {
  users: [],        // learners + instructors; role: 'learner'|'instructor'|'admin'
  instructors: [],  // instructors metadata (id references same as user id)
  courses: [],      // course objects
  transactions: [], // transaction records
  bankAccounts: {}  // mapping userId -> {accountNumber, secret, balance}
};

// initial seeed: 3 instructors, 5 courses
// seed() => used to initialize default data
function seed() {
  if (state.courses.length) return;

  // simple users
const instructors = [
  {
    id: uuidv4(),
    name: "Inst ABC",
    email: "abc@ins.com",
    role: "instructor",
    passwordHash: hashPassword("abc123")
  },
  {
    id: uuidv4(),
    name: "Inst MNO",
    email: "mno@ins.com",
    role: "instructor",
    passwordHash: hashPassword("mno123")
  },
  {
    id: uuidv4(),
    name: "Inst PQR",
    email: "pqr@ins.com",
    role: "instructor",
    passwordHash: hashPassword("pqr123")
  }
];


  // lump sum payment rate when LMS pays instructor
  const payoutPerCourse = 100; // arbitrary

  const courses = [
    {
      id: uuidv4(),
      title: 'Intro to Programming',
      price: 200,
      instructorId: instructors[0].id,
      materials: ['video1.mp4', 'notes.pdf'],
      openTo: [],
      paidToInstructor: false
    },
    {
      id: uuidv4(),
      title: 'Web Development Basics',
      price: 150,
      instructorId: instructors[1].id,
      materials: ['slides.pdf', 'demo.zip'],
      openTo: [],
      paidToInstructor: false
    },
    {
      id: uuidv4(),
      title: 'Data Structures',
      price: 250,
      instructorId: instructors[2].id,
      materials: ['videos.tar.gz', 'assignments.zip'],
      openTo: [],
      paidToInstructor: false
    },
    {
      id: uuidv4(),
      title: 'Databases 101',
      price: 180,
      instructorId: instructors[0].id,
      materials: ['sql_notes.pdf'],
      openTo: [],
      paidToInstructor: false
    },
    {
      id: uuidv4(),
      title: 'APIs & REST_api',
      price: 220,
      instructorId: instructors[1].id,
      materials: ['api_examples.zip'],
      openTo: [],
      paidToInstructor: false
    }
  ];

  instructors.forEach(i => {
    state.users.push(i);
    state.instructors.push({ id: i.id, name: i.name, payoutRate: payoutPerCourse });
    state.bankAccounts[i.id] = { accountNumber: null, secret: null, balance: 0 };
  });

  // add a sample learner
  const learner = {
    id: uuidv4(),
    name: 'Demo Learner',
    email: 'learner@example.com',
    role: 'learner',
    passwordHash: null
  };
  state.users.push(learner);
  state.bankAccounts[learner.id] = {
    accountNumber: null,
    secret: null,
    balance: 1000
  }; // start with balance

  state.courses = courses;
}

function persistToFile() {
  try {
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Persist failed', e);
  }
}

function loadFromFile() {
  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const raw = fs.readFileSync(PERSIST_FILE, 'utf-8');
      state = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Load persist failed', e);
  }
}

loadFromFile();
seed();
persistToFile(); // ensure file created

module.exports = {
  state,
  persistToFile
};
