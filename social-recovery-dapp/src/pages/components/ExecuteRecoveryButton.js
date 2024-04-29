import React, { useState} from 'react';
import { Form, Col, Modal, Button } from "react-bootstrap";
import Web3 from 'web3';
const ExecuteRecoveryButton = (props) =>{
    const {owner} = props;
    const {account} = props;
    const {guardians} = props;
    const {contractList} = props;
    const {setIsloading} = props;
    const {setContentVisiable} = props;
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg]= useState("");
    const [data, setData]= useState([])
    const [show, setShow] = useState(false);
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClose = (e) => {
        setShow(false);
        setIsError(false);
        setErrorMsg("");
        setData({newOwner:""});
    };
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const executeRecovery = async(e) => {
        e.preventDefault();
        const web3 = new Web3(Web3.givenProvider || 'http://172.0.0.1:7545');
        if(owner === data.newOwner){
            setIsError(true);
            setErrorMsg("錯誤：新帳戶擁有人不能與現在的帳戶擁有人相同");
            return;
        }
        if(data.newOwner === ""){
            setIsError(true);
            setErrorMsg("錯誤：新帳戶擁有人不能為空");
            return;
        }
        var guardianList = [];
        for (let i = 0; i < guardians.length; i++) {
            var guardian = data[`${i}`];
            if ((guardian !== "")&&(typeof guardian !== undefined)) {
                if(web3.utils.isAddress(guardian)){
                    guardianList.push(guardian);
                }else{
                    setIsError(true);
                    setErrorMsg(`錯誤:第${i+1}個監護人地址非 web3 地址格式`);
                    return;
                }
            }
        }
        const sendData = {
            newOwner:data.newOwner,
            guardianList: guardianList
        }
        console.log(sendData.guardianList);
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.executeRecovery(sendData.newOwner, sendData.guardianList).send({from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    }
    return(
        <Col>
            <Button size="md" className="btn btn-primary" onClick={handleClick}> 總結提交 </Button>
            <Modal
                show={show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
            <Modal.Header>
                <Modal.Title> 執行恢復流程 </Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <form onSubmit={executeRecovery}>
                        <div className='row d-flex w-100'>
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 新帳戶擁有人地址 </h5>
                            </Col>
                            <Col>
                                <Form.Control className="form-control mb-3" placeholder={`Add new owner address...`} type="text"
                                 onChange={handleChange} name="newOwner" value={data.newOwner}></Form.Control>
                            </Col>
                            {
                                guardians.map((guardian, index) => {
                                    return(
                                    <div key={`${guardian}-${index}`}>
                                        <Col sm={4}>
                                           <h5><span styles={{ color: '#d78559' }}>| </span> 監護人地址{index+1} </h5>
                                        </Col>
                                        <Col>
                                            <Form.Control className="form-control mb-3" placeholder={`Add guardian address...`} type="text"
                                            onChange={handleChange} name={`${index}`} value={data[`${index}`]}></Form.Control>
                                        </Col>
                                    </div>
                                    )
                                })
                            }
                            
                        </div>
                        <div className='row d-flex w-100'>
                            <button type="submit" className="btn btn-dark">確定</button>
                        </div>   
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                    <Button variant='secondary' onClick={handleClose}> 取消 </Button>
                </Modal.Footer>
            </Modal>
        </Col>
        
    );
}

export default ExecuteRecoveryButton;