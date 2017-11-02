import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Collapse, Button, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import './Nav.css'

class Navvy extends Component {
  constructor(props) {
    super(props)
    this.toggle = this.toggle.bind(this);
    this.navLogOut = this.navLogOut.bind(this);
    this.state = {
      isOpen: false
    };
  }
  
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  navLogOut() {
    this.props.logOut()
      .then(() => {
        this.props.history.push("/login");
      })
  }

  render() {
    if (this.props.currentUser.firstName) {
      return (
        <div id="navvy">
          <Navbar light expand="md">
            <Link to="/main"><img src='./images/1.png' /></Link>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" left navbar>
                <NavItem>
                  <Link to="/profile" style={{ color: 'black' }}>Hello, {this.props.currentUser.firstName}!</Link>
                </NavItem>
                <NavItem>
                  <Link to="/house" style={{ color: 'black' }} >Create List</Link>
                </NavItem>
                <NavItem>
                  <Link to="/join-house" style={{ color: 'black' }}>Join List</Link>
                </NavItem>
                <NavItem>
                  <Button action onClick={this.navLogOut} >Logout</Button>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      )
    } else {
      return (
        <div id="navvy">
          <Navbar light expand="md">
            <NavbarBrand className='nav-brand' href="/main"><img src='./images/1.png' /></NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" left navbar>
                <NavItem>
                  <Link to="/signUp" style={{ color: 'black' }}>SignUp</Link>
                </NavItem>
                <NavItem>
                  <Link to="/login" style={{ color: 'black' }}>Login</Link>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      )
    }
  }
}

export default withRouter(Navvy);

