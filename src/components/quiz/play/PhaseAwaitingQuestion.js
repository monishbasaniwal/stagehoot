import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import CountdownAnimation from '../../common/CountdownAnimation';

class PhaseAwaitingQuestion extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        if (this.props.game.quiz.remoteMode) {
            return (
                <div className="phase-container">
                    <div className="quiz-top-section">
                        <Typography variant="h5">Loading question</Typography>
                    </div>
                    <div className='quiz-middle-section'>
                        <CountdownAnimation speed="slow" />
                    </div>
                    <div className="quiz-bottom-section">
                    </div>
                </div>
            );
        } else {

            return (
                <div className="phase-container">
                    <div className="quiz-top-section">
                    </div>
                    <div className='quiz-middle-section'>
                        <Typography variant="h5">Look at the screen.</Typography>
                    </div>
                    <div className="quiz-bottom-section">
                    </div>
                </div>
            );
        }
    }
}

export default PhaseAwaitingQuestion;