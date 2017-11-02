import React, { Component } from 'react';
import './App.css';
import Main from '../Main/Main';
import SignUp from "../SignUp/SignUp";
import Login from "../Login/Login";
import Navvy from "../Nav/Nav.js";
import House from "../CreateHouse/CreateHouse.js";
import JoinHouse from "../JoinHouse/JoinHouse.js";
import Timer from "../timer.js";
import {
    BrowserRouter as Router,
    Route,
} from 'react-router-dom';
var axios = require('axios');

class App extends Component {
    constructor() {
        super();
        this.submitLogin = this.submitLogin.bind(this)
        this.logOut = this.logOut.bind(this)
        this.state = {
            email: "",
            password: "",
            message: "",
            bool: false,
            currentUser: {
                firstName: "",
            }
        }
    }

    componentDidMount(){
      axios.post('/getUser').then((res)=>{
        if (res.data.firstName){
          this.setState({
            currentUser:res.data
          });
        }
      })
    }

  submitLogin(a, b) {
    return new Promise((resolve, reject)=>{
      axios.post('/login', {
            username: a,
            password: b,
    }).then((res) => {
        if(res.data.success){
            this.setState({
                currentUser: res.data
            });
        }   
        resolve(res.data);
      });
    });
  }

  logOut(){
    return new Promise((resolve, reject)=>{      
    axios.post('/logout').then((res)=>{
        this.setState({
          currentUser: res.data
        });
        resolve(res.data);      
      })
  }
)} 
  render() {
            return (
                <Router>
                <div className='bg'>
                    <Route path='/' render={()=><Navvy logOut={this.logOut} currentUser={this.state.currentUser}/>} />
                    <Route path='/Login' render={() => <Login submitLogin={this.submitLogin} />}/>
                    <Route path='/Signup' render={()=> <SignUp/>}/> 
                    <Route path='/Main' render={()=> <Main  user={this.state.currentUser} />}/>
                    <Route path='/House' render={()=> <House/>}/>
                    <Route path='/Join-House' render={()=> <JoinHouse />}/>
                </div>
                </Router>
            
            )
    }
}


export default App;

