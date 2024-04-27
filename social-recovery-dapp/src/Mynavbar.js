import React, {useState, useEffect} from 'react';
import { Navbar, Nav, Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Web3 from 'web3';
import HomePage from './pages/HomePage.js';
import Contacts from './pages/Contacts.js';
import TodoList from './pages/TodoList.js';
import Election from './pages/Election.js';
import ScrollToTop from "./ScrollToTop.js";
import './Mynavbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Mynavbar = () => {
    const [account, setAccount] = useState("");
    useEffect(()=>{
        async function load() {
            const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);       
        }  
        load();
    },[])
    
    return (
        <Router>
            <Navbar bg="dark" expand="lg" data-bs-theme="dark" className="sticky-top">
                <Container fluid>
                    <Navbar.Brand as={Link} to={"/"}>ℕ𝕒𝕞𝕖ℤ𝕠𝕠'𝕤 𝔻𝕒𝕡𝕡</Navbar.Brand>
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >
                            <Nav.Link as={Link} to={"/"}> 首頁 </Nav.Link>
                            <Nav.Link as={Link} to={"/contacts"}> 聯絡人列表 </Nav.Link>
                            <Nav.Link as={Link} to={"/todolist"}> 待辦事項 </Nav.Link>
                            <Nav.Link as={Link} to={"/election"}> 投票 </Nav.Link>
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
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/todolist" element={<TodoList />} />
                    <Route path="/election" element={<Election  />} />
                </Routes>
            </div>
        </Router>
    )
}   
export default Mynavbar;