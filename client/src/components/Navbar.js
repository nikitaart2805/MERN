import React, {useContext , Component} from 'react'
import {NavLink, useHistory} from 'react-router-dom'
import {AuthContext} from '../context/AuthContext'
import M from  'materialize-css/dist/js/materialize.min.js';

const Foo = ({ renderFoo }) => {
  const history = useHistory()
  const auth = useContext(AuthContext)

  const logoutHandler = event => {
    event.preventDefault()
    auth.logout()
    history.push('/')
  }

  return renderFoo({ logoutHandler});
};



  class Navbar extends Component {


    componentDidMount() {

      let sidenav = document.querySelector('#slide-out');
      M.Sidenav.init(sidenav, {});

    }

    render() {


      return (
          <Foo
              renderFoo={
                ({ logoutHandler}) => (

                  <div className="App">
                    <nav>
                      <div className="container">

                        <a href="#" data-target="slide-out" className="sidenav-trigger show-on-large"><i
                            className="material-icons">menu</i></a>
                        <span className="brand-logo">ArtFlex</span>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                          <li><NavLink to="/create">Flex Bot</NavLink></li>
                          <li><NavLink to="/links">AREA</NavLink></li>
                          <li><a href="/" onClick={logoutHandler}>Выйти</a></li>
                        </ul>
                      </div>
                    </nav>
                    <ul id="slide-out" className="sidenav">
                      <li><NavLink to="/create">Flex Bot</NavLink></li>
                      <li><NavLink to="/links">AREA</NavLink></li>
                      <li><a href="/" onClick={logoutHandler}>Выйти</a></li>
                    </ul>
                  </div>

                )} />
      )
    }
  }
export default Navbar
