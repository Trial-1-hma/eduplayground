import { useState } from 'react';
import Home from './components/Home';
import ExamList from './components/ExamList';
import KidsMenu from './components/KidsMenu';
import Quiz from './components/Quiz';
import PronunciationGame from './components/PronunciationGame';
import FoundryRiddle from './components/FoundryRiddle';
import PhotoQuiz from './components/PhotoQuiz';
import LogoGuesser from './components/LogoGuesser';
import SleepSounds from './components/SleepSounds';
import StoryTeller from './components/StoryTeller';

function App() {
  const [view, setView] = useState('home');
  const [selectedExam, setSelectedExam] = useState(null);

  const startExam = (examId) => {
    setSelectedExam(examId);
    setView('quiz');
  };

  return (
    <div className="app-shell">
      {view === 'home' && <Home onNavigate={setView} />}
      {view === 'exams' && <ExamList onStartExam={startExam} onBack={() => setView('home')} />}
      {view === 'kids' && <KidsMenu onNavigate={setView} onBack={() => setView('home')} />}
      {view === 'quiz' && (
        <Quiz
          examId={selectedExam}
          onBackToList={() => setView('exams')}
          onHome={() => setView('home')}
        />
      )}
      {view === 'pronunciationGame' && <PronunciationGame onBack={() => setView('kids')} />}
      {view === 'foundryRiddle' && <FoundryRiddle onBack={() => setView('kids')} />}
      {view === 'photoQuiz' && <PhotoQuiz onBack={() => setView('kids')} />}
      {view === 'logoGuesser' && <LogoGuesser onBack={() => setView('kids')} />}
      {view === 'sleepSounds' && <SleepSounds onBack={() => setView('home')} />}
      {view === 'storyTeller' && <StoryTeller onBack={() => setView('kids')} />}
    </div>
  );
}

export default App;
