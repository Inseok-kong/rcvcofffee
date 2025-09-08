import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // 이메일/비밀번호로 로그인
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firestore에서 사용자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        // 사용자 정보가 없으면 새로 생성
        return await this.createUserProfile(user);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 이메일/비밀번호로 회원가입
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 프로필 업데이트
      await updateProfile(user, { displayName });
      
      // Firestore에 사용자 정보 저장
      return await this.createUserProfile(user);
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  // 구글로 로그인
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Firestore에서 사용자 정보 확인
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      } else {
        // 사용자 정보가 없으면 새로 생성
        return await this.createUserProfile(user);
      }
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  },

  // 사용자 프로필 생성
  async createUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: new Date(),
    });

    return userData;
  },

  // 인증 상태 변경 감지
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = {
              ...userDoc.data(),
              createdAt: userDoc.data().createdAt.toDate(),
            } as User;
            callback(userData);
          } else {
            // 사용자 정보가 없으면 새로 생성
            const userData = await this.createUserProfile(firebaseUser);
            callback(userData);
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 오류:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // 현재 사용자 가져오기
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
