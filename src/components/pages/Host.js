import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import PropTypes from 'prop-types';
import classes from "./Play.module.css";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Quiz from '../quiz/host/Quiz';
import { fire, fireGolf } from '../../base';
import Minigame from '../minigame/host/Minigame';
import Notiflix from 'notiflix-react';

function fetchGame(gametype, gameId, callback) {
  if (gametype === 'golf') {
    fireGolf.database().ref('games').orderByChild('gameId').equalTo(gameId)
      .once('value', callback);
  } else {
    fire.database().ref('games').orderByChild('gameId').equalTo(gameId)
      .once('value', callback);
  }
}

class Host extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: {},
      gametype: 'other',
      gameId: localStorage.getItem('RecentGameId') || '',
      password: '',
      isRedirected: Date.now() - localStorage.getItem('spotifytoken_timestamp') < 2000,
    };
    this.updateGame = this.updateGame.bind(this);
    this.initGameListiner = this.initGameListiner.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.quitGame = this.quitGame.bind(this);
    this.endGame = this.endGame.bind(this);
  }


  componentDidMount() {
    const { gameId, isRedirected } = this.state;
    if (isRedirected) {
      this.joinGame(gameId);
    }
  }

  handleChangeSelect = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChange = name => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  updateGame(gameupdate) {
    const { showSnackbar } = this.props;
    const { game } = this.state;
    // se till att inte updatera game.players...
    // game som kommer in här ska bara innehålla det som ska uppdateras.
    // updateras med gamesettings, phasechanges, currenquestionId etc
    if (game.gametype === 'golf') {
      fireGolf.database().ref(`games/${game.key}`).update(gameupdate, (error) => {
        if (error) {
          const snack = {
            variant: 'error',
            message: 'Unexpected internal error',
          };
          showSnackbar(snack);
        }
      });
    } else {
      fire.database().ref(`games/${game.key}`).update(gameupdate, (error) => {
        if (error) {
          const snack = {
            variant: 'error',
            message: 'Unexpected internal error',
          };
          showSnackbar(snack);
        }
      });
    }
  }

  restartGame() {
    const game = {};
    game.players = [];
    game.phase = 'setup';
    this.updateGame(game);
  }

  quitGame() {
    const { toggleHeader } = this.props;
    this.updateGame({ phase: null });
    toggleHeader(true);
  }

  endGame() {
    this.updateGame({ phase: 'final_result' });
  }


  joinGame(gameId) {
    Notiflix.Loading.Init({ svgColor: "#E74479", backgroundColor: "rgba(255,255,255,0.8)", });
    Notiflix.Loading.Hourglass("Connecting To Game..");
    const { password, gametype } = this.state;
    const { showSnackbar, toggleHeader } = this.props;
    const that = this;
    fetchGame(gametype, gameId, (snapshot) => {
      if (snapshot.val()) {
        let game;
        snapshot.forEach((child) => {
          game = child.val();
        });
        if (game.password === password) {
          Notiflix.Loading.Remove();
          that.initGameListiner(game);
          toggleHeader();
        } else {
          Notiflix.Loading.Remove();
          const snack = {
            variant: 'error',
            message: 'Wrong Game Password',
          };
          showSnackbar(snack);
        }
      } else {
        Notiflix.Loading.Remove();
        const snack = {
          variant: 'error',
          message: 'No game found',
        };
        showSnackbar(snack);
      }
    });
  }

  initGameListiner(_game) {
    let gameRef;
    if (_game.gametype === 'golf') {
      gameRef = fireGolf.database().ref(`games/${_game.key}`);
    } else {
      gameRef = fire.database().ref(`games/${_game.key}`);
    }
    const that = this;
    gameRef.on('value', (snapshot) => {
      const game = snapshot.val();
      if (!game.phase) {
        game.phase = 'setup';
      }
      if (game) {
        // kan blir problem med asynch setstate?
        that.setState({
          game,
        });
      } else {
        that.setState({
          game: '',
        });
      }
    });
    // koppla game till gameKey
    // lägg till en likadan listener i Play.
    // hosts gamelistiner ska lyssna på alla ändringar. Play ska inte lyssna på andra players ändringar om det går. något att optimera i framtiden.
    // ett alt är att lyfta ut Players till en egen root? kan lägga phase och currentq i en game.state och sen är det allt som Player lyssnar på?
    // men play behöver också behöva synca sin egna player.
  }

  render() {
    // behöver bara updatera phase till firebase när det är phases som play bryr sig om. t.ex. inte setup då play bara kan connecta till games som är i phase==connection
    // lägg till två rutor här för att söka fram ett game med hjälp av gameid och pass.

    // strukturera filerna för host och play. kommentera i varje fil vad syftet med den är. vad den ska updatera i game etc.
    // HostSetup updates settings and sets phase to connection on action
    // connection shows players and sets phase to starting on action
    // starting shows a countdown sets phase to awating_question and currentQuestion to 0(or some id) after countdown
    // awaiting_question shows countdown and sets phase to show question after countdown
    // show_question shows question and sets phase to answer after countdown
    // answer shows q&a, countdown, nrPlayersAnswered, sets phase to result_question after countdown
    // result_question shows stats about the answers, correct answer, hightscorelist etc, sets phase to awaiting_question and currentQuestion++ on action.
    // result_question sets phase to final_result if questions are all done.
    // final_result shows result of all players. top 3 and/or all. sets phase to end on action
    // end shows options for replay, export result, etc.
    const {
      gameId, password, game, isRedirected, gametype,
    } = this.state;
    const { showSnackbar, toggleHeader } = this.props;
    const gameFunctions = {
      update: this.updateGame,
      restart: this.restartGame,
      end: this.endGame,
      quit: this.quitGame,
    };

    if (!game.phase && isRedirected) {
      return (
        <div>
          <span>Loading...</span>
        </div>
      );
    }

    if (!game.phase) {
      return (
        <div className={classes.HostContainer}>
          <h2 className={classes.logomain}>Stagehoot!</h2>
          <FormControl style={{ display: "block" }}>
            <Select
              value={gametype || ''}
              style={{ backgroundColor: "white", margin: "15px", padding: "5px", fontSize: "20px", borderRadius: "3px", minWidth: "6.25rem", maxWidth: "18.75rem", width: "93.34%", fontWeight: "bold" }}
              onChange={this.handleChangeSelect}
              name="gametype"
              inputProps={{
                id: 'gametype-required',
              }}
            >
              <MenuItem value="golf">Golf</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl style={{ display: "block" }}>
            <input type="text"
              placeholder="Game PIN"
              name="Game ID"
              value={gameId}
              margin="normal"
              className={classes.joinbtn}
              onChange={this.handleChange('gameId')}
            />
          </FormControl>
          <FormControl style={{ display: "block" }}>
            <input
              placeholder="Password"
              type="password"
              name="password"
              margin="normal"
              style={{ margin: "15px" }}
              className={classes.joinbtn}
              value={password}
              onChange={this.handleChange('password')}
            />
          </FormControl>
          <button onClick={() => this.joinGame(gameId)} className={classes.join}>Host</button>
        </div>
      );
    }
    return (
      <div className="page-container host-page">
        {game.gametype === 'quiz' && <Quiz game={game} gameFunc={gameFunctions} />}
        {game.gametype === 'snake' && <Minigame game={game} gameFunc={gameFunctions} />}
        {game.gametype === 'tetris' && <Minigame game={game} gameFunc={gameFunctions} />}
        {game.gametype === 'golf' && <Minigame game={game} gameFunc={gameFunctions} />}
        {game.gametype === 'spotify' && <Minigame game={game} gameFunc={gameFunctions} />}

      </div>
    );
  }
}
Host.propTypes = {
  showSnackbar: PropTypes.func.isRequired,
  toggleHeader: PropTypes.func.isRequired,
};
export default Host;
