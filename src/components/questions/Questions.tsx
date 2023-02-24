import React, { useState } from 'react';
import {
  CheckCircleIcon, XCircleIcon
} from '@heroicons/react/outline'
// import {
//   solution } from '../../lib/words'

interface Props {
  currentQuestion: number;
  updateCurrentQuestion: (newQuestion: number) => void;
  attempts: number;
  updateAttempts: (newAttempts: number) => void;
  answers: string[];
  updateAnswers: (newAnswers: string[]) => void;  
  onEnter: (event:any) => void;
  questions: any;
  isGameWon: boolean;
  isGameLost: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  points: number;
}

export const Questions = (props:Props) => {
  const { currentQuestion, updateCurrentQuestion } = props;
  const { attempts, updateAttempts} = props;
  const { answers, updateAnswers} = props;
  const {onEnter} = props;
  const questions = props.questions;
  const isGameWon = props.isGameWon;
  const isGameLost = props.isGameLost;
  const { inputValue, onInputChange } = props;
  const points = props.points;
  const attemptsIcons = Array.from({ length: attempts }, (_, index) => (
    <XCircleIcon key={index} className="h-6 w-6 fail-icon" />
  ));
  const minAnswerLength = 3;
  const isSubmitDisabled = inputValue.length < minAnswerLength;

  const renderQuestion = (index:any) => {
    const current = questions[index]
    return (
      <div className='question-container  shadow-2xl rounded py-8 px-6 mb-4 inline-block grid grid-cols-1 gap-4 w-full'>
        <h2 className='question-text text-xl font-bold' dangerouslySetInnerHTML={{ __html:current.question}}></h2>
        <form onSubmit= {onEnter}>
          <input className='shadow appearance-none border rounded py-2 px-3 mr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' type="text" name="answer" placeholder='Your Answer'          
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}/>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' type="submit"  disabled={isSubmitDisabled}>Submit</button>
        </form>
        <p className='m-auto inline-flex'>{attemptsIcons}</p>
      </div>
    );
  };

  const renderSuccess = (index:any) => {
    const current = questions[index];
    return (
      <div className='question-container  shadow-2xl rounded py-8 px-6 mb-4 inline-block grid grid-cols-1 gap-4 w-full'>
        <h2 className='question-text text-xl font-bold' dangerouslySetInnerHTML={{ __html:current.question}}></h2>
        <form>
          <input className='shadow appearance-none border rounded py-2 px-3 mr-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' disabled type="text" name="answer" placeholder={current.answer}/>
        </form>
        <p><CheckCircleIcon className="h-6 w-6 m-auto success-icon"/></p>
      </div>
    );
  };

  const renderResults = () => {
    return (
      <div className='question-container  shadow-2xl rounded py-8 px-6 mb-4 inline-block w-full'>
        <h2 className='question-text text-2xl film-text'>RESULTS</h2>
        <p>You got {answers.length} out of {questions.length} correct.</p>
        
        <div>
        {questions.map((question:any, index:any) => (
          <div key={index}>
            <div className='m-2'>
                <h2 className='font-bold' dangerouslySetInnerHTML={{ __html:question.question}}></h2>
                    <form>
                        <input disabled type="text" name="answer" placeholder={question.answer}/>
                    </form>
              { question.answer === answers[index] &&                
                <p><CheckCircleIcon className="h-6 w-6 m-auto success-icon"/></p>
              }
              { question.answer !== answers[index] &&                
                <p><XCircleIcon className="h-6 w-6 m-auto fail-icon"/></p>
              }
            </div>
          </div>
        ))}  
        </div>  
      </div>
    );
  };

  return (
    <div>
      {!isGameLost && !isGameWon &&
        <div>
          {attempts < 3 && currentQuestion < questions.length
            ? (
            <div className='flex flex-wrap'>               
                {currentQuestion > 1 && renderSuccess(currentQuestion - 2)}         
                {currentQuestion > 0 && renderSuccess(currentQuestion - 1)}
                {renderQuestion(currentQuestion)}
            </div> )
            : 
            <div className='flex flex-wrap'>    
                {renderResults()}
            </div>
          }  
        </div>
      }
      {(isGameLost || isGameWon) &&
        <div className='flex flex-wrap'>
          {renderResults()}
        </div>
      }


    </div>
  );
}

