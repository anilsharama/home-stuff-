import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Toast from "./Toast";

function SiteLayout() {
  return <><Navbar /><Outlet /><Footer /><Toast /><span className="demo-ribbon">DEMO STORE · NO REAL PURCHASES OR PAYMENTS</span></>;
}

export default SiteLayout;
