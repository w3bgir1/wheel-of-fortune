import React from 'react'
import './GameLayout.css'

export default function GameLayout(props) {
        return (
            <div className="game">
                {props.data && <h1>{props.data.question}</h1>}
                {props.data && props.data.template.split('').map(char => 
                    char !== ' ' ?
                    <span className='game__answerLetters' key={Math.random()*100}>{char}</span> :
                    <span className='game__answerLetters game__answerLetters--empty' key={Math.random()*100}>{char}</span>
                )}
                <div className='game__playerOne'>
                    <img src='https://avatarfiles.alphacoders.com/119/119303.jpg' alt='Player One'></img>
                    {props.users && <p>{props.users[1].firstName}</p>}
                </div>
                <div className='game__playerTwo'>
                    <img src='https://avatarfiles.alphacoders.com/176/176259.jpg' alt='Player Two'></img>
                    {props.users && <p>{props.users[2].firstName}</p>}
                </div>
                <div className='game__alphabet' onClick={props.selectChar}>
                    {props.alphabet.map(char => {
                        return <span className='game__char' key={char}>{char}</span>
                    })}
                </div>
            </div>
        )
    }