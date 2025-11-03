import { useState } from 'react';
import './App.css';
import { model } from './gemini';
import {
  db,
  storage,
  addDoc,
  collection,
  serverTimestamp,
  ref,
  uploadString,
  getDownloadURL,
} from './firebase';
import { useFirebase } from './hooks/useFirebase';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-ai-critic';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { userId, history, error: firebaseError } = useFirebase();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPreview(null);
      setImage(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 용량이 너무 큽니다 (10MB 이하).');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result);
      const base64Data = reader.result.split(',')[1];
      setImage({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
  };

  //Firestore 저장 함수
  const saveAnalysisToFirestore = async (imageUrl, analysisText) => {
    if (!db || !userId || !storage) {
      console.error('DB, 사용자 ID, 또는 Storage가 없어 저장할 수 없습니다.');
      setError('분석 결과를 히스토리에 저장하는 데 실패했습니다.');
      return;
    }

    try {
      const collectionPath = `artifacts/${appId}/users/${userId}/analyses`;
      const storageRef = ref(storage, `images/${userId}/${Date.now()}.jpg`);
      await uploadString(storageRef, imageUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, collectionPath), {
        imageUrl: downloadURL,
        analysisText: analysisText,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('Firestore 저장 오류:', e);
      setError('분석 결과를 히스토리에 저장하는 데 실패했습니다.');
    }
  };

  //AI 분석 실행 함수
  const analyzeImage = async () => {
    if (!image) {
      setError('먼저 이미지를 업로드해주세요.');
      return;
    }

    setLoading(true);
    setAnalysis('');
    setError('');

    try {
      const prompt = `
        이 이미지를 세밀하게 관찰하고, AI로 생성되었을 가능성이 있는지 분석해주세요.
        당신의 시스템 지시에 설정된 [분석 근거]와 [답변 형식]을 반드시 따라주세요.
      `;

      const result = await model.generateContent([prompt, image]);
      const response = await result.response;
      const text = response.text();

      setAnalysis(text);
      await saveAnalysisToFirestore(preview, text);
    } catch (error) {
      console.error('AI 분석 중 오류 발생:', error);
      setError(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  //히스토리 불러오기 함수
  const loadFromHistory = (item) => {
    setPreview(item.imageUrl);
    setAnalysis(item.analysisText);
    setImage(null);
    setError('');
  };

  return (
    <div className="App">
      <aside className="App-sidebar">
        <h2>분석 히스토리</h2>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="history-empty">아직 분석 내역이 없습니다.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => loadFromHistory(item)}
              >
                <img src={item.imageUrl} alt="분석 히스토리" />
                <p>{item.analysisText.split('\n')[0]}</p>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="App-main">
        <header className="App-header">
          <h1>⚠️ AI로 만들어진 이미지일까?</h1>
          <p>AI 생성 이미지 가능성을 알려드려요! </p>
          <div className="user-id">User ID: {userId || '연결 중...'}</div>
        </header>

        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-label">
            분석할 이미지 업로드 (10MB 이하)
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button
          onClick={analyzeImage}
          disabled={loading || !image}
          className="analyze-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              분석 중입니다...
            </>
          ) : (
            'AI로 분석하기'
          )}
        </button>

        {(error || firebaseError) && (
          <div className="error-message">{error || firebaseError}</div>
        )}

        <div className="results-grid">
          <div className="result-box">
            <h3>분석할 이미지</h3>
            <div className="preview-container">
              {preview ? (
                <img src={preview} alt="업로드된 이미지" />
              ) : (
                <div className="placeholder-box">
                  이미지를 업로드해주세요.
                </div>
              )}
            </div>
          </div>

          <div className="result-box">
            <h3>✍️ AI 분석 결과</h3>
            {analysis ? (
              <pre className="analysis-content">{analysis}</pre>
            ) : (
              <div className="placeholder-box">
                {loading ? '분석 중...' : '분석 결과가 여기에 표시됩니다.'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
