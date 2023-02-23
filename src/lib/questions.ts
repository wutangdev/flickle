import {
  addDays,
  differenceInDays,
  formatISO,
  parseISO,
  startOfDay,
} from 'date-fns'
import queryString from 'query-string'

import { ENABLE_ARCHIVED_GAMES } from '../constants/settings'
import { QUESTIONS_LIST } from '../constants/questionsList'
import { getToday } from './dateutils'

// 1 January 2022 Game Epoch
export const firstGameDate = new Date(2023, 1, 23)
export const periodInDays = 1

export const getLastGameDate = (today: Date) => {
  const t = startOfDay(today)
  let daysSinceLastGame = differenceInDays(firstGameDate, t) % periodInDays
  return addDays(t, -daysSinceLastGame)
}

export const getNextGameDate = (today: Date) => {
  return addDays(getLastGameDate(today), periodInDays)
}

export const isValidGameDate = (date: Date) => {
  if (date < firstGameDate || date > getToday()) {
    return false
  }

  return differenceInDays(firstGameDate, date) % periodInDays === 0
}

export const getIndex = (gameDate: Date) => {
  let start = firstGameDate
  let index = -1
  do {
    index++
    start = addDays(start, periodInDays)
  } while (start <= gameDate)

  return index
}

export const getQuestionsOfDay = (index: number) => {
  if (index < 0) {
    throw new Error('Invalid index')
  }

  return QUESTIONS_LIST[index % QUESTIONS_LIST.length]
}

export const getSolution = (gameDate: Date) => {
  const nextGameDate = getNextGameDate(gameDate)
  const index = getIndex(gameDate)
  const questionsOfTheDay = getQuestionsOfDay(index)
  return {
    solution: questionsOfTheDay.questions,
    solutionGameDate: gameDate,
    solutionIndex: index,
    tomorrow: nextGameDate.valueOf(),
    questionsOfTheDay: questionsOfTheDay.id,
  }
}

export const getGameDate = () => {
  if (getIsLatestGame()) {
    return getToday()
  }

  const parsed = queryString.parse(window.location.search)
  try {
    const d = startOfDay(parseISO(parsed.d!.toString()))
    if (d >= getToday() || d < firstGameDate) {
      setGameDate(getToday())
    }
    return d
  } catch (e) {
    console.log(e)
    return getToday()
  }
}

export const setGameDate = (d: Date) => {
  try {
    if (d < getToday()) {
      window.location.href = '/?d=' + formatISO(d, { representation: 'date' })
      return
    }
  } catch (e) {
    console.log(e)
  }
  window.location.href = '/'
}

export const getIsLatestGame = () => {
  if (!ENABLE_ARCHIVED_GAMES) {
    return true
  }
  const parsed = queryString.parse(window.location.search)
  return parsed === null || !('d' in parsed)
}

export const { solution, solutionGameDate, solutionIndex, tomorrow, questionsOfTheDay } =
  getSolution(getGameDate())
