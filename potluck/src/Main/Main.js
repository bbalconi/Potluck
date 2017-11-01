import React, { Component } from 'react';
import { Card, CardTitle, CardSubtitle, CardBody, Col } from 'reactstrap';
import GroceryInputs from '../GroceryInputs/GroceryInputs';
import './Main.css';
import openSocket from 'socket.io-client';
import GroceryList from "../GroceryList/GroceryList";
import GroceryInstructions from "../GroceryInstructions/GroceryInstructions"
import { withRouter } from 'react-router-dom';

const axios = require('axios');

class Main extends Component {
  constructor(props) {
    super(props)
    this.getList = this.getList.bind(this);
    this.sendData = this.sendData.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.selectorToServer = this.selectorToServer.bind(this);
    this.getUser = this.getUser.bind(this);
    this.socket;

    this.state = {
      initialized: true,
      checkList: true,
      items: [],
      house: {}
    }
  }

  sendData(foodObj) {
    this.socket.emit('addedItem', { 
      item:foodObj,
      house:this.user.house._id
    });
  };

  getUser() {
      axios.post('/socketUrl').then((res)=>{
        var socketUrl = res.data;
        axios.post('/getUser').then((res)=>{
          //no idea why this is getting undefined below
          var that = this;
          if (res.data.firstName){
            that.user = res.data;
            //TODO: get this working for production
            //this.socket = openSocket('http://potluck-react.herokuapp.com/:' + res.data);
            that.socket = openSocket('https://potluck-react.herokuapp.com/');

            console.log('trying to join here: ' + res.data.house._id);
            that.socket.emit('joinHouse', res.data.house._id);
            that.socket.on('updatedMyItems', (items)=>{
              that.setState({
                items:items
            })
           })
          } else {
            that.props.history.push('/login')
         }
      });
    });
  }

  deleteItem(id) {
    this.socket.emit('deleteItem', {
      _id: id,
      house:this.user.house._id
    });
  };

  selectorToServer(id, toggleValue) {
    this.socket.emit('selectorToServer', {
      _id : id,
      selector:toggleValue,
      house:this.user.house._id,
      user:this.user
    });
  }

  getList() {
    axios.post('/houses')
      .then((data) => {
        if (this.state.initialized) {
          this.setState({
            items: data.data.items,
            checkList: false,
            house: data.data
          });

        } else {
          this.setState({
            items: data.data.items,
            initialized: true,
            checkList: false,
            house: data.data
          });
        }
        if (this.state.items) {

        }
      })
  }

  componentDidMount() {
    this.getUser();
    if (this.state.checkList) {
      this.getList();
      this.setState({
        checkList: false
      })
    }
  }

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.addItem();
    }
  }

  render() {
    if (this.state.checkList) {
      this.getList();
    }
    if (this.state.initialized === false) {
      return (
        <div className='main'>
          <Col className='main-col'></Col>
          <Card className='main-card'>
            <CardTitle>Welcome to Potluck!</CardTitle>{' '}
            <CardSubtitle>Create a shared grocery list with your housemates.</CardSubtitle>{' '}
            <CardBody> First, create a house for everyone to join. Already received an invite? Click the Join House link on the navbar. <br /> Clicking the Potluck logo in the top left corner will always bring you back to your shared grocery list.</CardBody>{' '}
          </Card>
        </div>
      )
    } else {
      return (
        <div className='main'>
          <GroceryInstructions
            getList={this.getList}
            house={this.state.house}
          />
          <GroceryInputs className='grocery-inputs'
            sendData={this.sendData}
            items={this.state.items}
            state={this.state} />
          <GroceryList
            className='grocery-inputs'
            selectorToServer={this.selectorToServer}
            deleteItem={this.deleteItem}
            items={this.state.items}
            class='main'
          />
        </div>
      )
    }
  }
}

export default withRouter(Main);