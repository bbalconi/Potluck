import React, { Component } from 'react';
import { Card, CardTitle, CardSubtitle, Col, CardBody } from 'reactstrap';
import './GroceryInstructions.css';
var axios = require('axios');


export default class GroceryInstructions extends Component {
  constructor() {
  super()
  }


 render() {
  console.log(this);
  console.log(this.props);
  return(
    <div >
        <Col></Col>
        <Card className='instructions'>
          <CardTitle className='instructions-title'>{this.props.getHouseName}</CardTitle>{' '}
          <CardBody> Add to your house grocery list. Let your housemates know which items you intend to purchase
            by clicking on the items. Watch 
            them turn your user specific color!
            </CardBody>{' '}
        </Card>
        </div>
  )
 }

}