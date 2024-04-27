import React, { useState, useEffect } from 'react';
import { CONTACT_ABI, CONTACT_ADDRESS } from './abi/SocialRecoveryConfig.js';
import { Form, Col, Modal, Button } from "react-bootstrap";
import Web3 from 'web3';
const AccountManagement = () => {
    const [account, setAccount] = useState("");
    const [owner, setOwner] = useState("");
    const [contactList, setContactList] = useState();
    const [isloaded, setIsloaded] = useState(false);
    const [accountBalances, setAccountBalances] = useState(0);
    const [isloading, setIsloading] = useState(false);
    const [contentVisiable, setContentVisiable] = useState(false);
    const [data, setData] = useState({});
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    useEffect(() => {
        const load = async() =>{
            if (isloaded) {
                return;
            }
            const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            // Instantiate smart contract using ABI and address.
            const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
            setContactList(contactList);
            const ownerResult = await contactList.methods.owner().call();
            const balanceResult = await contactList.methods.totalDepositAmount().call();
            setOwner(ownerResult);
            setAccountBalances(balanceResult);
            setIsloaded(true);
            setContentVisiable(true);
        }
        load();
    }, [isloaded]);
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClick2 = (e) => {
        setShow2(true);
    };
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const handleClose = (e) => {
        setShow(false);
        setShow2(false);
        setIsError(false);
        setErrorMsg("");
        setData({});
    };
    const depositMoney = async(e) => {
        e.preventDefault();
        const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
        var balance = await web3.eth.getBalance(account);
        // web3.fromWei()就是把Wei轉成其他單位，下面範例則是轉成Ether。toFixed()是我們只取到小數點後兩位數
        if(isNaN(data.deposit)){
            setIsError(true);
            setErrorMsg("錯誤：不能輸入文字，要輸入數字！！");
            return;
        }else{
            if(balance<data.deposit){
                setIsError(true);
                setErrorMsg("錯誤：存入金額已經超過現有 EOA 錢包擁有的金額！！");
                return;
            }
            if(data.deposit==0){
                setIsError(true);
                setErrorMsg("錯誤：存入金額不能為0！！");
                return;
            }
        }
        const sendData = {
            deposit: data.deposit
        };
        setIsloading(true);
        setContentVisiable(false);
        contactList.methods.depositMoney().send({ from: account, value: sendData.deposit})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    };
    const withdrawMoney= async(e) =>{
        e.preventDefault();
        if(isNaN(data.withdraw)){
            setIsError(true);
            setErrorMsg("錯誤：不能輸入文字，要輸入數字！！");
            return;
        }else{
            if(accountBalances<data.withdraw){
                setIsError(true);
                setErrorMsg("錯誤：領出金額已經超過 Social Recovery Wallet 裡頭的總金額！！");
                return;
            }
            if(data.withdraw==0){
                setIsError(true);
                setErrorMsg("錯誤：領出金額不能為0！！");
                return;
            }
        }
        const sendData = {
            withdraw: data.withdraw
        };
        setIsloading(true);
        setContentVisiable(false);
        contactList.methods.withdrawMoney(sendData.withdraw).send({from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    };
    return(
        <div className="container" style={{ width: "650px" }}>
             <div className="row">
                {
                    isloading && (
                        <div id="loader" class="text-center">
                            <p class="text-center">Loading...</p>
                        </div>
                    )
                }
                {
                    contentVisiable && (
                        <div className="content col-lg-12">
                            <h1 className="text-center">帳戶管理 </h1>
                            <hr />
                            <br />
                            <p>帳戶擁有者地址: {owner} </p>
                            <p>帳戶總金額：{accountBalances} wei</p>
                            {owner===account&&(
                                <div>
                                <Button size="md" className="btn btn-dark" onClick={handleClick}> 存錢 </Button>
                                <Button size="md" className="btn btn-dark" onClick={handleClick2}> 領錢 </Button>
                                </div>
                                )
                            }
                        </div>
                    )
                }
             </div>
             <Modal
                show={show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title> 存錢 </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={depositMoney}>
                        <div className='row d-flex w-100'>
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 存入金額 </h5>
                            </Col>
                            <Col>
                                <Form.Control className="form-control mb-3" placeholder={`how much wei to deposit...`} type="text"
                                    onChange={handleChange} name="deposit" value={data.deposit}></Form.Control>
                            </Col>
                        </div>
                        <div className='row d-flex w-100'>
                            <button type="submit" className="btn btn-dark">存入</button>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                </Modal.Footer>
            </Modal>
            <Modal
                show={show2}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title> 領錢 </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={withdrawMoney}>
                        <div className='row d-flex w-100'>
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 領出金額 </h5>
                            </Col>
                            <Col>
                                <Form.Control className="form-control mb-3" placeholder={`how much wei to withdraw...`} type="text"
                                    onChange={handleChange} name="withdraw" value={data.withdraw}></Form.Control>
                            </Col>
                        </div>
                        <div className='row d-flex w-100'>
                            <button type="submit" className="btn btn-dark">領出</button>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default AccountManagement; 