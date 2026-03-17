// ===== FAKE FIREBASE (TEST MODE) =====

let currentUser = {
  uid: "demo_user_001",
  email: "demo@cacon.vn"
};

let userRole = "admin";

// Fake DB (localStorage)
const db = {
  collection: (name) => ({
    get: async () => {
      const data = JSON.parse(localStorage.getItem(name) || "[]");
      return {
        docs: data.map(d => ({ id: d.id, data: () => d }))
      };
    },
    add: async (data) => {
      const arr = JSON.parse(localStorage.getItem(name) || "[]");
      data.id = Date.now().toString();
      arr.push(data);
      localStorage.setItem(name, JSON.stringify(arr));
    },
    where: () => ({
      orderBy: () => ({
        onSnapshot: (cb) => {
          const data = JSON.parse(localStorage.getItem(name) || "[]");
          cb({
            docs: data.map(d => ({ data: () => d }))
          });
        }
      })
    }),
    doc: () => ({
      get: async () => ({ exists: true, data: () => ({ role: "admin" }) }),
      set: async () => {}
    })
  })
};

// Fake auth
const auth = {
  onAuthStateChanged: (cb) => {
    cb(currentUser);
  }
};

// Fake storage
const storage = {};

async function checkAdminRole() {
  userRole = "admin";
}