import { Outlet, Link } from "react-router-dom";
import Topnav from './Topnav';

const Layout = () => {
    return (
      <>
        <Topnav></Topnav>
        <div className="App">
        </div>
  
        <Outlet />
      </>
    )
  };
  
  export default Layout;