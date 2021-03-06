import React, { Component } from 'react';
import { Card, CardTitle, CardSubtitle, Col, CardBody, CardText, Table } from 'reactstrap';
import KeyItem from '../KeyItem/KeyItem.js';
import './GroceryInstructions.css';
var axios = require('axios');


export default class GroceryInstructions extends Component {
  constructor() {
    super()
  }

  render() {
    console.log(this.props)
    if (this.props.house.houseName != null) {
      let housemates = this.props.house.housemate;
      let housemateColor = this.props.house.housemate.color;
      let houseKey = housemates.map((housemate, i) => {
        return <KeyItem className='key-user' key={i} user={this.props.house.housemate} housemate={housemate} />
      })
      return (
        <div >
          <Col></Col>
          <Card className='instructions'>
            <CardTitle className='instructions-title'>{this.props.house.houseName}</CardTitle>{' '}
            <CardBody> Add to your house grocery list. Let your housemates know which items you intend to purchase
            by clicking on the items. Watch
            them turn your user specific color!
            </CardBody>{' '}
            <CardSubtitle className="key-header">Roommates:</CardSubtitle>
          </Card>
          <Table size="sm" className='key-table'>
            <tbody>
              {houseKey}
            </tbody>
          </Table>
        </div>
      )
    } else {
      return (
        <div>
          <Col></Col>
          <Card className='instructions'>
            <CardBody> Add to your house grocery list. Let your housemates know which items you intend to purchase
          by clicking on the items. Watch
          them turn your user specific color!
          </CardBody>{' '}
            <CardSubtitle className="key-header">Roommates</CardSubtitle>
          </Card>
        </div>
      )
    }
  }
}