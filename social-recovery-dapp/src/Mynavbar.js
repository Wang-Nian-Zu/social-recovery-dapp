import React, {useState, useEffect} from 'react';
import { Navbar, Nav, Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from 'web3';
import HomePage from './pages/HomePage.js';
import GuardianManagement from './pages/GuardianManagement.js';
import AccountRecovery from './pages/AccountRecovery.js';
import AccountManagement from './pages/AccountManagement.js';
import ScrollToTop from "./ScrollToTop.js";
import './Mynavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Mynavbar = () => {
    const [account, setAccount] = useState("");
    useEffect(()=>{
        async function load() {
            const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);       
        }  
        load();
    },[])
    
    return (
        <Router>
            <Navbar bg="dark" expand="lg" data-bs-theme="dark" className="sticky-top">
                <Container fluid>
                    <Navbar.Brand as={Link} to={"/"}>𝕊𝕠𝕔𝕚𝕒𝕝 ℝ𝕖𝕔𝕠𝕧𝕖𝕣𝕪 𝕎𝕒𝕝𝕝𝕖𝕥</Navbar.Brand>
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Nav.Link as={Link} to={"/"}> 首頁 </Nav.Link>
                            <Nav.Link as={Link} to={"/accountManagement"}> 存款/提款 </Nav.Link>
                            <Nav.Link as={Link} to={"/guardianManagement"}> 監護人列表 </Nav.Link>
                            <Nav.Link as={Link} to={"/accountRecovery"}> 帳戶復原 </Nav.Link>
                        </Nav>
                        <Nav navbarScroll>
                            <div className="d-flex w-100">
                                <div className="Userinfo d-flex">
                                    <Navbar.Text>歡迎, {account}</Navbar.Text>
                                </div>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/guardianManagement" element={<GuardianManagement />} />
                    <Route path="/accountRecovery" element={<AccountRecovery />} />
                    <Route path="/accountManagement" element={<AccountManagement  />} />
                </Routes>
            </div>
        </Router>
    )
}   
export default Mynavbar;