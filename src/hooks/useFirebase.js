import { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken, 
  collection, 
  query, 
  onSnapshot 
} from '../firebase'; //firebase.js에서 가져오기

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-ai-critic';

export function useFirebase() {
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [dbError, setDbError] = useState(null);

  //인증 상태 감지
  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth가 초기화되지 않았습니다.");
      setAuthError("인증 서비스에 연결할 수 없습니다.");
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (e) {
          console.error("로그인 오류:", e);
          setAuthError("인증에 실패했습니다.");
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  //히스토리 구독 (userId가 확정되면 실행)
  useEffect(() => {
    if (!db || !userId) return; 

    const collectionPath = `artifacts/${appId}/users/${userId}/analyses`;
    const q = query(collection(db, collectionPath));

    const unsubscribeDB = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(doc => doc.timestamp);

        data.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        setHistory(data);
      },
      (err) => {
        console.error("Firestore 구독 오류:", err);
        setDbError("히스토리 로딩에 실패했습니다.");
      }
    );

    return () => unsubscribeDB();
  }, [userId]); //userId가 변경될 때마다 이 훅이 다시 실행됨

  //필요한 상태와 에러를 반환
  return { userId, history, error: authError || dbError };
}