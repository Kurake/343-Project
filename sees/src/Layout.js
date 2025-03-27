import { Outlet, Link } from "react-router-dom";
import Topnav from './Topnav';

const Layout = () => {
    return (
      <>
        <Topnav />
        <div className="App" />
        <Outlet />
      </>
    )
  };
  
  export default Layout;