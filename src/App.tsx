import './App.css'

import { ClockIcon } from '@heroicons/react/outline'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import Div100vh from 'react-div-100vh'

import { AlertContainer } from './components/alerts/AlertContainer'
import { DatePickerModal } from './components/modals/DatePickerModal'
import { InfoModal } from './components/modals/InfoModal'
import { MigrateStatsModal } from './components/modals/MigrateStatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatsModal } from './components/modals/StatsModal'
import { Navbar } from './components/navbar/Navbar'
import { Questions } from './components/questions/Questions'
import {
  DATE_LOCALE,
  DISCOURAGE_INAPP_BROWSERS,
  LONG_ALERT_TIME_MS,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  DISCOURAGE_INAPP_BROWSER_TEXT,
  GAME_COPIED_MESSAGE,
  SHARE_FAILURE_TEXT,
  WIN_MESSAGES,
} from './constants/strings'
import { useAlert } from './context/AlertContext'
import { isInAppBrowser } from './lib/browser'
import {
  getStoredIsHighContrastMode,
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
} from './lib/localStorage'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  getGameDate,
  getIsLatestGame,
  setGameDate,
  solution,
  solutionGameDate,
  questionsOfTheDay,
} from './lib/questions'

function App() {
  const isLatestGame = getIsLatestGame()
  const gameDate = getGameDate()
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()

  const [isGameWon, setIsGameWon] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false)
  const [isMigrateStatsModalOpen, setIsMigrateStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : prefersDarkMode
      ? true
      : false
  )
  const [isHighContrastMode, setIsHighContrastMode] = useState(
    getStoredIsHighContrastMode()
  )

  const [stats, setStats] = useState(() => loadStats())  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [points, setPoints] = useState(0); 
  const [ questions, setQuestions ] = useState(solution);
  const [inputValue, setInputValue] = useState('');
  const solutionAnswers = solution.map(obj => obj.answer);  
  
  const [ gameWasWon, setGameWasWon ] = useState<boolean>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame)
    if (loaded?.gameWasWon) {
      return loaded.gameWasWon;
    } else {
      return false;
    }
  });

  const [ attemptsTrigger, setAttemptsTrigger ] = useState<boolean>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame)
    if (loaded?.attemptsTrigger) {
      return loaded.attemptsTrigger;
    } else {
      return false;
    }
  });

  const [count, setCount] = useState<number>(() => {
    const loaded = loadGameStateFromLocalStorage(isLatestGame)
    if (loaded?.count) {
      return loaded.count;
    } else {
      return 0;
    }
  });

  const [answers, setAnswers] = useState<string[]>(() => {
      const loaded = loadGameStateFromLocalStorage(isLatestGame)
      if (loaded?.questionsOfTheDay !== questionsOfTheDay) {
        setAttemptsTrigger(false)  
        setGameWasWon(false)      
        return []        
      }
      if (loaded.answers == solutionAnswers) {
        setIsGameWon(true)
      }
      if (loaded.attemptsTrigger && !gameWasWon) {
        setIsGameLost(true)
      }      
      return loaded.answers
    });

  const updateCurrentQuestion = (nextQuestion: number) => {
    setCurrentQuestion(nextQuestion);
  };
  const updateAttempts = (newAttempts: number) => {
    setAttempts(newAttempts);
  };
  const updateAnswers = (newAnswers: string[]) => {
    setAnswers(newAnswers);
  };

  useEffect(() => {
    if (!loadGameStateFromLocalStorage(true)) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
      saveGameStateToLocalStorage(getIsLatestGame(), { 
        answers, 
        points,
        questionsOfTheDay,
        attemptsTrigger,
        count,
        gameWasWon,
       })
    }
  })

  useEffect(() => {
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      })
  }, [showErrorAlert])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (isHighContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [isDarkMode, isHighContrastMode])

  const handleDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  const handleHighContrastMode = (isHighContrast: boolean) => {
    setIsHighContrastMode(isHighContrast)
    setStoredIsHighContrastMode(isHighContrast)
  }

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      showSuccessAlert(winMessage, {
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }
      )
    }
  }, [isGameWon, isGameLost, showSuccessAlert])

  useEffect(() => {
    if (attempts < 3 && answers.length == 3 && !attemptsTrigger) {
      setIsGameWon(true)
      if (isLatestGame && !gameWasWon) {
        setStats(addStatsForCompletedGame(stats, points))
        saveGameStateToLocalStorage(getIsLatestGame(), { 
          answers, 
          points,
          questionsOfTheDay,
          attemptsTrigger,
          count,
          gameWasWon:true,
           })          
      }
    }

    if (attempts >= 3) {
      setIsGameLost(true)
      if (isLatestGame && !attemptsTrigger) {
        setStats(addStatsForCompletedGame(stats, points))
        saveGameStateToLocalStorage(getIsLatestGame(), { 
          answers, 
          points,
          questionsOfTheDay,
          attemptsTrigger:true,
          count,
          gameWasWon,
          })
          
      }      
    }
  }, [answers, attempts])


  const onEnter = (event:any) => {
    event.preventDefault();
    const answer = event.target.answer.value;
    setCount(count +1);
    setInputValue('');
    if (solution[currentQuestion].answer.toLowerCase().includes(answer.toLowerCase())) {      
      updateAttempts(0);
      setPoints( points + 1 );
      updateAnswers([...answers, solution[currentQuestion].answer.toString()]);
      updateCurrentQuestion(currentQuestion + 1);
    }
    if (!solution[currentQuestion].answer.toLowerCase().includes(answer.toLowerCase())) {      
      updateAttempts(attempts + 1);
    }
  }

  return (
    <Div100vh>
      <div className="flex h-full flex-col">
        <Navbar
          setIsInfoModalOpen={setIsInfoModalOpen}
          setIsStatsModalOpen={setIsStatsModalOpen}
          setIsDatePickerModalOpen={setIsDatePickerModalOpen}
          setIsSettingsModalOpen={setIsSettingsModalOpen}
        />

        {!isLatestGame && (
          <div className="flex items-center justify-center">
            <ClockIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300" />
            <p className="text-base text-gray-600 dark:text-gray-300">
              {format(gameDate, 'd MMMM yyyy', { locale: DATE_LOCALE })}
            </p>
          </div>
        )}

        <div className="mx-auto flex w-full grow flex-col px-1 pt-2 pb-8 sm:px-6 md:max-w-7xl lg:px-8 short:pb-2 short:pt-2 m-auto text-center">
          <div className="flex grow flex-col justify-center pb-6 short:pb-2 max-w-4xl text-center m-auto px-3">
            <Questions
              currentQuestion={currentQuestion}
              updateCurrentQuestion={updateCurrentQuestion}
              attempts={attempts}
              updateAttempts={updateAttempts}
              answers={answers}
              updateAnswers={updateAnswers}
              onEnter={onEnter}
              questions={questions}
              isGameWon={isGameWon}
              isGameLost={isGameLost}
              inputValue={inputValue} 
              onInputChange={setInputValue}
              points={points}
            />
          </div>
          <InfoModal
            isOpen={isInfoModalOpen}
            handleClose={() => setIsInfoModalOpen(false)}
          />
          <StatsModal
            isOpen={isStatsModalOpen}
            handleClose={() => setIsStatsModalOpen(false)}
            // solution={solution}
            // guesses={guesses}
            gameStats={stats}
            isLatestGame={isLatestGame}
            isGameLost={isGameLost}
            isGameWon={isGameWon}
            handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
            handleShareFailure={() =>
              showErrorAlert(SHARE_FAILURE_TEXT, {
                durationMs: LONG_ALERT_TIME_MS,
              })
            }
            handleMigrateStatsButton={() => {
              setIsStatsModalOpen(false)
              setIsMigrateStatsModalOpen(true)
            }}
            isDarkMode={isDarkMode}
            isHighContrastMode={isHighContrastMode}
            // numberOfGuessesMade={guesses.length}
            points={points}
          />
          <DatePickerModal
            isOpen={isDatePickerModalOpen}
            initialDate={solutionGameDate}
            handleSelectDate={(d) => {
              setIsDatePickerModalOpen(false)
              setGameDate(d)
            }}
            handleClose={() => setIsDatePickerModalOpen(false)}
          />
          <MigrateStatsModal
            isOpen={isMigrateStatsModalOpen}
            handleClose={() => setIsMigrateStatsModalOpen(false)}
          />
          <SettingsModal
            isOpen={isSettingsModalOpen}
            handleClose={() => setIsSettingsModalOpen(false)}
            // isHardMode={isHardMode}
            // handleHardMode={handleHardMode}
            isDarkMode={isDarkMode}
            handleDarkMode={handleDarkMode}
            isHighContrastMode={isHighContrastMode}
            handleHighContrastMode={handleHighContrastMode}
          />
          <AlertContainer />
        </div>
      </div>
    </Div100vh>
  )
}

export default App
