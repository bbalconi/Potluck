import React, { Component } from 'react';
import { Button } from 'reactstrap';
import './KeyItem.css';


export default class KeyItem extends Component {
  constructor() {
    super()

  }

  render() {
    var userColor = this.props.housemate.color;
    var userFirstName = this.props.housemate.firstName
    return (
      <tr className='key-row'>
        <td className='key-btn'><Button className='try' style={{ backgroundColor: userColor }}>{userFirstName}</Button>
        </td>
      </tr>
    )
  }
}
