import React, { Component } from 'react';
import { Typography, Card } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import classes from "./Home.module.css";
import create from "./create.png"
import { Link, withRouter } from 'react-router-dom';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    const timestamp = localStorage.getItem('spotifytoken_timestamp');
    const spotifyType = localStorage.getItem('spotify_type');
    if (Date.now() - timestamp < 2000 && spotifyType) {
      props.history.push(`/${spotifyType}`);
    }
  }

  render() {
    return (
      <div>
        <div>
          <div className={classes.context}>
            <h1 className={classes.header}>Making Quizzes Fun!</h1>
            <p className={classes.headerpad}>With Stagehoot making quizzes and games is easy and super fun. Invite players from all around the world!</p>
            <a href="#" className={classes.arrowDown}>Down</a>

          </div>


          <div className={classes.area} >
            <ul className={classes.circles}>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div >

        </div>
        <div className={classes.grid}>
          <Grid container spacing={24} display="block">
            <Grid item xs>
              <Link to="/create" style={{ textDecoration: 'none' }}>
                <Card className={classes.cardcreate}>
                  <CardMedia
                    component="img"
                    alt="Contemplative Reptile"
                    height="auto"
                    image={require("./create.png")}
                    title="Contemplative Reptile"
                  />
                  <CardContent className={classes.cardcont}>
                    <p className={classes.cardconttext}>Set Up A New Game</p>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
            <Grid item xs>
              <Link to="/play" style={{ textDecoration: 'none' }}>
                <Card className={classes.cardcreate2}>
                  <CardMedia
                    component="img"
                    alt="Contemplative Reptile"
                    height="auto"
                    image={require("./family.png")}
                    title="Contemplative Reptile"
                  />
                  <CardContent className={classes.cardcont}>
                    <p className={classes.cardconttext}>Connect To A Game As A Player</p>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
            <Grid item xs>
              <Link to="/host" style={{ textDecoration: 'none' }}>
                <Card className={classes.cardcreate3}>
                  <CardMedia
                    component="img"
                    alt="Contemplative Reptile"
                    height="auto"
                    image={require("./host.png")}
                    title="Contemplative Reptile"
                  />
                  <CardContent className={classes.cardcont}>
                    <p className={classes.cardconttext}>Host A Created Game Using Game Pin</p>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
