import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { normalizeText } from '../utils';

function Quiz({ examId, onBackToList, onHome }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const isTextQuestion = (question) => question.type === 'text' || examId === 'kids';

  const normalizeQuestions = (items) => items.map((question) => {
    if (examId === 'kids' && question.type !== 'text' && Array.isArray(question.options)) {
      return {
        ...question,
        type: 'text',
        answerText: question.options[question.answer] || '',
      };
    }
    return question;
  });

  const loadQuestions = async () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    const response = await fetch(`${API_URL}/api/exams/${examId}/questions`);
    const data = await response.json();
    setQuestions(normalizeQuestions(data.questions || []));
  };

  useEffect(() => {
    loadQuestions();
  }, [examId]);

  const selectAnswer = (value) => {
    const next = [...answers];
    next[currentQuestion] = value;
    setAnswers(next);
  };

  const submitExam = () => {
    const correct = questions.reduce((count, question, index) => {
      const selected = answers[index];
      if (isTextQuestion(question)) {
        return count + (normalizeText(selected) === normalizeText(question.answerText) ? 1 : 0);
      }
      return count + (selected === question.answer ? 1 : 0);
    }, 0);

    const percentage = Math.round((correct / questions.length) * 100);
    const review = questions.map((question, index) => {
      const selected = answers[index];
      const isCorrect = isTextQuestion(question)
        ? normalizeText(selected) === normalizeText(question.answerText)
        : selected === question.answer;
      return {
        ...question,
        selectedAnswer: selected,
        isCorrect,
      };
    });

    setResult({
      correct,
      total: questions.length,
      percentage,
      review,
    });
  };

  if (result) {
    return (
      <section className="card">
        <h2>Great work!</h2>
        <p>You scored {result.correct}/{result.total} ({result.percentage}%).</p>
        <p className="small">Review the answers below and try again anytime.</p>
        <div className="actions">
          <button className="primary-btn" onClick={loadQuestions}>Retry</button>
          <button className="secondary-btn" onClick={onHome}>Back home</button>
        </div>
        <div className="review-list">
          {result.review.map((item, index) => (
            <div key={`${item.prompt}-${index}`} className="review-item">
              <h3>{index + 1}. {item.prompt}</h3>
              <p><strong>Your answer:</strong> {isTextQuestion(item)
                ? (item.selectedAnswer === undefined || item.selectedAnswer === '' ? 'No answer entered' : item.selectedAnswer)
                : (item.selectedAnswer === undefined ? 'No answer selected' : item.options[item.selectedAnswer])}</p>
              <p><strong>Correct answer:</strong> {isTextQuestion(item) ? item.answerText : item.options[item.answer]}</p>
              <p className={item.isCorrect ? 'success' : 'warning'}>{item.isCorrect ? 'Correct' : 'Needs review'}</p>
              <p className="small">{item.explanation}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="exam-topbar">
        <div>
          <p className="eyebrow">{examId.toUpperCase()}</p>
          <h2>{questions[currentQuestion]?.prompt}</h2>
        </div>
        <p>{currentQuestion + 1}/{questions.length}</p>
      </div>
      {questions[currentQuestion] && isTextQuestion(questions[currentQuestion]) ? (
        <div className="form-group">
          <label>Your answer</label>
          <input
            type="text"
            value={answers[currentQuestion] || ''}
            onChange={(e) => selectAnswer(e.target.value)}
            placeholder="Type your answer here"
          />
        </div>
      ) : (
        <div className="options">
          {questions[currentQuestion]?.options.map((option, index) => (
            <button key={option} className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`} onClick={() => selectAnswer(index)}>
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="actions">
        <button className="secondary-btn" onClick={onBackToList}>Back</button>
        <button className="secondary-btn" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((prev) => prev - 1)}>Previous</button>
        {currentQuestion < questions.length - 1 && (
          <button className="primary-btn" onClick={() => setCurrentQuestion((prev) => prev + 1)}>Next</button>
        )}
        <button className="primary-btn" onClick={() => {
          const remaining = questions.length - currentQuestion - 1;
          if (remaining > 0 && !window.confirm(`${remaining} question${remaining === 1 ? '' : 's'} left. Are you sure you want to submit?`)) return;
          submitExam();
        }}>Submit</button>
      </div>
    </section>
  );
}

export default Quiz;
