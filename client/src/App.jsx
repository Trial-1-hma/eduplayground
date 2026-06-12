import { useState } from 'react';
import WorldMap from './components/WorldMap';
import ExamList from './components/ExamList';
import KidsMenu from './components/KidsMenu';
import Quiz from './components/Quiz';
import PronunciationGame from './components/PronunciationGame';
import FoundryRiddle from './components/FoundryRiddle';
import PhotoQuiz from './components/PhotoQuiz';
import LogoGuesser from './components/LogoGuesser';
import SleepSounds from './components/SleepSounds';
import StoryTeller from './components/StoryTeller';
import WordBattle from './components/WordBattle';
import MovieRecap from './components/MovieRecap';
import BlindKaraoke from './components/BlindKaraoke';

function App() {
  const [view, setView] = useState('home');
  const [selectedExam, setSelectedExam] = useState(null);

  const startExam = (examId) => {
    setSelectedExam(examId);
    setView('quiz');
  };

  return (
    <div className="app-shell">
      {view === 'home' && <WorldMap onNavigate={setView} />}
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
      {view === 'wordBattle' && <WordBattle onBack={() => setView('kids')} />}
      {view === 'movieRecap' && <MovieRecap onBack={() => setView('home')} />}
      {view === 'blindKaraoke' && <BlindKaraoke onBack={() => setView('home')} />}
    </div>
  );
}

export default App;
