// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

import "firebase/auth";
import "firebase/database";

// PUT YOUR OWN FIREBASE CONFIGURATION HERE
var firebaseConfig = {
    apiKey: "AIzaSyAY_09MZt1vTB9YwCJqQING_SzGz6Iv-_o",
    authDomain: "chat-sih-2020.firebaseapp.com",
    databaseURL: "https://chat-sih-2020.firebaseio.com",
    projectId: "chat-sih-2020",
    storageBucket: "chat-sih-2020.appspot.com",
    messagingSenderId: "1062813138755",
    appId: "1:1062813138755:web:251c65408ef360606c79f6",
    measurementId: "G-5PQMKZTP0E"
  };

// Initialize Firebase
let firebaseApp = firebase.initializeApp(firebaseConfig);
let firebaseAuth = firebaseApp.auth()
let firebaseDb = firebaseApp.database()

export { firebaseAuth, firebaseDb }