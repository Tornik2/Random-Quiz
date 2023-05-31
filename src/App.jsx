import { useState, useEffect } from 'react'

function App() {
    const [fetchedQuestions, setFetchedQuestions] = useState([])
    const [allAnswered, setAllAnswered] = useState(false)
    const [restart, setRestart] = useState(0)
    const [startPage, setStartPage] = useState(true)
    const [loading, setLoading] = useState(false)
    const [calculatingCorrect, setCalculatingCorrect] = useState(false)
    
    useEffect(()=>{
        setLoading(true)
        fetch('https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple')
            .then(res => res.json())
            .then(data=> {
                
                setFetchedQuestions(data.results.map(question => {
                    const correctAnswer = {answer: question.correct_answer, correct: true}
                    const incorrectAnswers = question.incorrect_answers.map(answer => (
                                {answer: answer, correct: false}
                            ))
                            
                    setLoading(false)
                    return {question: question.question,
                            answers: [correctAnswer, ...incorrectAnswers],
                            isAnswerGiven: false
                            }
                }))
                
                })
    }, [restart])
    
    

    function getAnswerInfo(idx, arr) {
        setFetchedQuestions(prev => {
            return prev.map(question => {
                const answerToAdd = arr[idx]
                if(question.answers.some(answer => answer.answer === answerToAdd.answer)) {
                    return {...question, 
                    isAnswerGiven: !arr[idx].isAnswered ? true : false, 
                    isCorrect: arr[idx].correct} 
                } else {
                    return question
                }
            })
        })
    }
    
    function checkIfAllAnswered() {
        const isAllAnswered = fetchedQuestions.every(question => question.isAnswerGiven)
        setCalculatingCorrect(true)
       setTimeout(()=>{
        setCalculatingCorrect(false)
        setAllAnswered(isAllAnswered)
        
        if(isAllAnswered) {
        } else {
            alert("Please Give All The Answers")
        }
       }, 1000)
    }
    
    function countCorrectAnswers() {
        return fetchedQuestions.filter(question => question.isCorrect).length
    }
    function restartGame() {
        setRestart(prev => prev + 1)
        setAllAnswered(false)
    }
    return (
        startPage 
        ?   <div className="startpage">
                <h1 className="title">Random Quiz</h1>
                <button onClick={()=> setStartPage(false)}>Start game</button>
            </div>
        : (
        loading 
        ?   <div className="loading">
                <h1>...Loading Questions</h1>
            </div> 
        : <div className="main-wrapper">
        <Questions 
            fetchedQuestions={fetchedQuestions}
            getAnswerInfo={getAnswerInfo}
            allAnswered={allAnswered}
            />
        { !allAnswered 
            ?  <button 
                    className="check-answers-btn" 
                    onClick={()=>{checkIfAllAnswered()}}
                    >Check Answers
                    </button> 
            :       <div className="results-div">
                        {allAnswered && <h1 className="result-text"
                        >You scored {countCorrectAnswers()}/5 correct answers</h1> }
                        
                        <button className="start-over-btn" onClick={()=>restartGame()}>Start Over</button>
                    </div>
        }
        {calculatingCorrect && <h1 className="calculating">CALCULATING</h1>}
        </div>
        )
            )
            
}

function Questions ({fetchedQuestions, getAnswerInfo, allAnswered}) {

    function decodeHTMLEntities(text) {
        let textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
}
        

    
    
    const questionEls = fetchedQuestions 
                        ? fetchedQuestions.map((question, idx) => {
                           
                        return (
                            <div className="question-wrapper" key={question.question}>
                                <h1 className="question"
                                >{idx + 1 + ". "}{decodeHTMLEntities(question.question)}</h1>
                                <ul className="answers-wrapper">
                                    <Answers 
                                    allAnswered={allAnswered}
                                    answers={question.answers}  
                                    getAnswerInfo={getAnswerInfo}
                                    />
                                </ul>
                            </div>
                        )})
                        : null
                        
                        return questionEls
}


function Answers({answers, getAnswerInfo, allAnswered}) {
    const [answersState, setAnswersState] = useState([])
    
    useEffect(()=>{setAnswersState(shuffle(answers))}, [answers])
    
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
}
    
    function chooseAnswer(idx) {
        setAnswersState(prev => {
            const clickedAnswer = prev[idx]
            return prev.map(answer => {
                if (clickedAnswer.answer === answer.answer) {
                    if (!answer.isAnswered) {
                        return {...answer, isAnswered: true}
                    } else {
                        return {...answer, isAnswered: false}
                    }
                    
                } else {
                    return {answer: answer.answer, correct: answer.correct, isAnswered: false}
                }
            })
        })
        
    }
    function decodeHTMLEntities(text) {
        let textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    
    
    
    const answerEls =  answersState.map((answer, idx) => {
                     return (
                            <li 
                            onClick={!allAnswered ? ()=> {
                                chooseAnswer(idx)
                                getAnswerInfo(idx, answersState)
                            }: ()=>{return null}} 
                            className={
                                `answer 
                                ${answer.isAnswered && 'chosen'} 
                                ${allAnswered && answer.correct ? 'correct-answer' : ''} 
                                ${allAnswered && answer.isAnswered && !answer.correct ? 'incorrect-answer' : ''}
                                ${allAnswered && !answer.isAnswered ? 'not-chosen-answer' : ''}
                                `}
                                 
                                key={answer.answer}
                            >{decodeHTMLEntities(answer.answer)}</li>
                                )})
                                
        return  (
            <>
            {answerEls}
            
            </>
            
            )
    
}

export default App
