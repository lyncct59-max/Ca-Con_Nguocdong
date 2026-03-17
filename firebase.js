const firebaseConfig = {
  apiKey: "AIzaSyBCOqoxavILvWp8uyxJQDvlJ-wmeLChgv0",
  authDomain: "cacon-stock.firebaseapp.com",
  projectId: "cacon-stock",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;

function login(){
  auth.signInWithEmailAndPassword(
    email.value,
    password.value
  ).catch(e=>alert(e.message));
}

auth.onAuthStateChanged(user=>{
  if(user){
    currentUser = user;
    document.getElementById("login-modal").style.display = "none";
    startApp();
  }else{
    document.getElementById("login-modal").style.display = "block";
  }
});
