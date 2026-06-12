import { useEffect, useState } from 'react';
import { API_URL } from '../config';

function ExamList({ onStartExam, onBack }) {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/exams`)
      .then((res) => res.json())
      .then((data) => setExams(data.exams || []))
      .catch(() => setError('Unable to load exams right now.'));
  }, []);

  return (
    <section className="card">
      <div className="page-topbar">
        <div>
          <p className="eyebrow">Exams</p>
          <h2>Choose a practice exam</h2>
        </div>
        <button className="secondary-btn" onClick={onBack}>Back home</button>
      </div>
      <div className="exam-grid">
        {exams.filter((exam) => exam.id !== 'kids').map((exam) => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <p className="small">50 questions • full review after submission</p>
            <button className="primary-btn" onClick={() => onStartExam(exam.id)}>Start</button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

export default ExamList;
