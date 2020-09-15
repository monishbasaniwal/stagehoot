import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import classes from "./Play.module.css";
import Notiflix from "notiflix-react";
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import GameIcon from '@material-ui/icons/VideogameAsset';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import GolfIcon from '@material-ui/icons/GolfCourse';
import SpotifyIcon from '@material-ui/icons/MusicNote';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { fire, fireGolf } from '../../base';
import Quiz from '../quiz/play/Quiz';
import Minigame from '../minigame/play/Minigame';


function fetchGame(gametype, gameId, callback) {
  if (gametype === 'golf') {
    fireGolf.database().ref('games').orderByChild('gameId').equalTo(gameId)
      .once('value', callback);
  } else {
    fire.database().ref('games').orderByChild('gameId').equalTo(gameId)
      .once('value', callback);
  }
}
class Play extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: {},
      gameId: '',
      gametype: 'other',
      recentGameId: localStorage.getItem('RecentGameIdPlay') || '',
      playerKey: '',
      recentGame: null,
      isRedirected: Date.now() - localStorage.getItem('spotifytoken_timestamp') < 2000,
    };
    this.createPlayer = this.createPlayer.bind(this);
    this.joinGame = this.joinGame.bind(this);
  }

  componentDidMount() {
    const { recentGameId, isRedirected } = this.state;
    if (isRedirected) {
      this.joinGame(recentGameId);
    }
    if (recentGameId) {
      // behöver spara recentgametype?
      fetchGame('default', recentGameId, (snapshot) => {
        if (snapshot.val()) {
          let game;
          snapshot.forEach((child) => {
            game = child.val();
          });
          if (game.status === 'IN_PROGRESS') {
            this.setState({ recentGame: game });
          }
        }
      });
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


  joinGame(gameId) {
    Notiflix.Loading.Init({ svgColor: "#E74479", backgroundColor: "rgba(255,255,255,0.8)", });
    Notiflix.Loading.Hourglass("Connecting To Game..");
    const { showSnackbar, toggleHeader } = this.props;
    const { gametype } = this.state;
    const that = this;
    fetchGame(gametype, gameId, (snapshot) => {
      if (snapshot.val()) {
        let game;
        snapshot.forEach((child) => {
          game = child.val();
        });
        // får skapa en ny attribut, canPlayerJoin true/false om det begövs
        if (game.phase === 'connection') {
          const storedPlayerKey = localStorage.getItem('RecentPlayerKey');
          if (storedPlayerKey && game.players && game.players[storedPlayerKey]) {
            that.setState({ playerKey: storedPlayerKey });
          }
          that.initGameListiner(game);
          Notiflix.Loading.Remove();
          const snack = {
            variant: 'success',
            message: 'Connected to game',
          };
          showSnackbar(snack);
          toggleHeader(false);
        } else if (game.phase === 'setup') {
          Notiflix.Loading.Remove();
          const snack = {
            variant: 'error',
            message: 'Game is not yet started',
          };
          showSnackbar(snack);
        } else {
          const storedPlayerKey = localStorage.getItem('RecentPlayerKey');
          if (storedPlayerKey && game.players && game.players[storedPlayerKey]) {
            that.setState({ playerKey: storedPlayerKey });
            localStorage.setItem('RecentGameIdPlay', game.gameId);
            that.initGameListiner(game);
            Notiflix.Loading.Remove();
            const snack = {
              variant: 'success',
              message: 'Connected to game',
            };
            showSnackbar(snack);
            toggleHeader(false);
          } else {
            Notiflix.Loading.Remove();
            const snack = {
              variant: 'error',
              message: 'Game is in progress',
            };
            showSnackbar(snack);
          }
        }
      } else {
        Notiflix.Loading.Remove();
        const snack = {
          variant: 'error',
          message: 'Wrong Game PIN Entered',
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
  }

  createPlayer(player) {
    const { game } = this.state;
    const { showSnackbar } = this.props;
    let playerRef;
    if (game.gametype === 'golf') {
      playerRef = fireGolf.database().ref(`/games/${game.key}/players`).push();
    } else {
      playerRef = fire.database().ref(`/games/${game.key}/players`).push();
    }
    const newPlayer = Object.assign({ key: playerRef.key }, player);
    const that = this;
    playerRef.set(newPlayer, (error) => {
      if (error) {
        const snack = {
          variant: 'error',
          message: 'Unexpected internal error',
        };
        showSnackbar(snack);
      } else {
        that.setState({
          playerKey: newPlayer.key,
        });
        localStorage.setItem('RecentPlayerKey', newPlayer.key);
      }
    });
  }

  render() {
    const {
      game, playerKey, gameId, recentGameId, recentGame, isRedirected, gametype,
    } = this.state;
    const { showSnackbar } = this.props;
    const gameAvatars = {
      golf: <GolfIcon />,
      spotify: <SpotifyIcon />,
      quiz: <GameIcon />,
      snake: <GameIcon />,
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
        <div className={classes.PlayContainer}>
          <div>
            <h2 className={classes.logomain}>Stagehoot!</h2>
            <FormControl style={{ display: "block" }}>
              <Select
                value={gametype || ''}
                style={{ width: "inherit" }}
                onChange={this.handleChangeSelect}
                style={{ backgroundColor: "white", margin: "15px", borderRadius: "3px", padding: "5px", fontSize: "20px", minWidth: "6.25rem", maxWidth: "18.75rem", width: "93.34%", fontWeight: "bold" }}
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
            <button onClick={() => this.joinGame(gameId)} className={classes.join} id="join">JOIN</button>
          </div>
          {recentGame && (
            <div>

              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      {gameAvatars[recentGame.gametype]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={recentGame.title}
                    secondary={recentGame.gameId}
                  />
                  <ListItemSecondaryAction>
                    <IconButton aria-label="reconnect" onClick={() => this.joinGame(recentGameId)}>
                      <Typography>reconnect</Typography>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

            </div>
          )}
        </div>
      );
    }
    return (
      <div className="page-container play-page">
        {game.gametype === 'quiz' && <Quiz game={game} createPlayer={this.createPlayer} playerKey={playerKey} showSnackbar={showSnackbar} />}
        {game.gametype === 'snake' && <Minigame game={game} createPlayer={this.createPlayer} playerKey={playerKey} showSnackbar={showSnackbar} />}
        {game.gametype === 'tetris' && <Minigame game={game} createPlayer={this.createPlayer} playerKey={playerKey} showSnackbar={showSnackbar} />}
        {game.gametype === 'golf' && <Minigame game={game} createPlayer={this.createPlayer} playerKey={playerKey} showSnackbar={showSnackbar} />}
        {game.gametype === 'spotify' && <Minigame game={game} createPlayer={this.createPlayer} playerKey={playerKey} showSnackbar={showSnackbar} />}

      </div>
    );
  }
}
Play.propTypes = {
  showSnackbar: PropTypes.func.isRequired,
  toggleHeader: PropTypes.func.isRequired,
};
export default Play;
