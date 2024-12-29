import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";

// env variables in string format
import conf from "../conf/conf";


import { v4 } from "uuid";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getFirestore,
  addDoc,
  doc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  where,
  query,
  updateDoc,
} from "firebase/firestore";

// firebase storage/images folder imports
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

// authentication imports from firebase
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Initialize Firebase
const app = initializeApp(conf);
const analytics = getAnalytics(app);

// Firebase services
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();

// Creating context
const services = createContext();

// Custom hook
export const useFirebase = () => useContext(services);

export function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);

  // Get current logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Directly set the user object
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Register user
  async function createUser(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const res = userCredential.user;
      setUser(res);

      const userId = res.uid;

      // Setting user profile
      const docRef = await addDoc(collection(db, "user"), {
        avatarURL: "",
        name,
        userId,
      });
      console.log("Document written with ID: ", docRef.id);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user);
    } catch (error) {
      console.log("Sign in with Google:", error);
    }
  }

  // Login user
  async function loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const res = userCredential.user;
      setUser(res);
      return true;
    } catch (error) {
      console.log("Login User", error);
      return false;
    }
  }

  // Update user profile
  async function updateUserProfile(avatarURL = "", name = "", userDocId = "") {
    const docRef = doc(db, "user", userDocId);
    const docSnap = await getDoc(docRef);

    if (avatarURL || name) {
      if (docSnap.exists()) {
        if (docSnap.data().avatarURL) {
          await deleteFiles(docSnap.data().avatarURL);
        }
      }
      await updateDoc(docRef, {
        avatarURL,
        name,
      });
    }
  }

  // Get user by ID
  async function getUser(userId) {
    try {
      const q = query(collection(db, "user"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (error) {
      console.log("Get user: ", error);
    }
  }

  // Logout user
  async function logoutUser() {
    try {
      await signOut(auth);
      setUser(null);
      return true;
    } catch (error) {
      console.log("Logout User:", error);
      return false;
    }
  }

  // Create post
  async function createPost(title, description, content, imgURL, userId, category) {
    try {
      let date = new Date();
      const docRef = await addDoc(collection(db, "blog"), {
        content,
        description,
        imgURL,
        title,
        userId,
        date,
        category,
      });
      console.log("Document written with ID: ", docRef.id);
      return docRef;
    } catch (e) {
      console.error("Create post: ", e);
      return false;
    }
  }

  // Update post
  async function updatePost(postId, content, description, imgURL, title, category) {
    try {
      const docRef = doc(db, "blog", postId);
      let date = new Date();
      if (imgURL) {
        await updateDoc(docRef, { content, description, imgURL, title, date, category });
      } else {
        await updateDoc(docRef, { content, description, title, date, category });
      }
      return true;
    } catch (e) {
      console.error("Update post: ", e);
      return false;
    }
  }

  // Get post by ID
  async function getPost(postId) {
    const docRef = doc(db, "blog", postId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  // Get all posts
  async function getPosts(userId) {
    try {
      const q = userId
        ? query(collection(db, "blog"), where("userId", "==", userId))
        : collection(db, "blog");
      const querySnapshot = await getDocs(q);
      return querySnapshot;
    } catch (error) {
      console.log("Get All Posts: ", error);
    }
  }

  // Delete post
  async function deletePost(postId) {
    try {
      await deleteDoc(doc(db, "blog", postId));
      return true;
    } catch (error) {
      console.log("Delete post: ", error);
      return false;
    }
  }

  // Upload file
  async function uploadFiles(filePath, file) {
    try {
      const imgRef = ref(storage, `${filePath + v4()}`);
      const res = await uploadBytes(imgRef, file);
      return res;
    } catch (error) {
      console.log("Upload file", error);
      return null;
    }
  }

  // Delete file
  async function deleteFiles(file) {
    try {
      const desertRef = ref(storage, file);
      await deleteObject(desertRef);
    } catch (error) {
      console.log("Delete File: ", error);
    }
  }

  // Preview image
  async function previewImage(imgId) {
    try {
      const url = await getDownloadURL(ref(storage, imgId));
      return url;
    } catch (error) {
      console.log("Preview image: ", error);
    }
  }

  return (
    <services.Provider
      value={{
        current: user,
        createUser,
        signInWithGoogle,
        loginUser,
        updateUserProfile,
        getUser,
        logoutUser,
        createPost,
        updatePost,
        deletePost,
        getPost,
        getPosts,
        uploadFiles,
        deleteFiles,
        previewImage,
      }}
    >
      {children}
    </services.Provider>
  );
}
