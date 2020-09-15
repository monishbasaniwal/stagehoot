import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import classes from "../pages/Play.module.css";
import { fire } from '../../base';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    // let titleText = 'Stagehoot';
    // if (fire.options.projectId === 'ettkilomjol-dev') {
    //   titleText = 'Ett Kilo Mjöl DEV';
    // }

    return (
      <div id="header">
        <AppBar position="static">
          <Toolbar className="toolbar" style={{ backgroundColor: "#1368CE" }}>
            <div style={{ justifyContent: "space-between", display: "flex", width: "100%" }}>
              <div className="appbar-container--left">
                <Link className="appbar-title text-big" to="/">
                  <h2 className={classes.logoappbar}>
                    Stagehoot!
                </h2>
                </Link>
              </div>
              <div>
                <Button variant="contained" color="primary" href="#play" style={{ marginTop: "18px", backgroundColor: "#38AF92" }}>
                  Play
</Button>
                <Button variant="contained" color="#F6E048" href="#host" style={{ marginTop: "18px", backgroundColor: "rgb(56,58,72)", marginLeft: "15px" }}>
                  Host
</Button>
              </div>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}
export default Header;
