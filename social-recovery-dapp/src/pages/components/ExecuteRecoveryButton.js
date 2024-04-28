import React, { useState} from 'react';
import { Form, Col, Modal, Button } from "react-bootstrap";
const ExecuteRecoveryButton = (props) =>{
    const {owner} = props;
    const {account} = props;
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
        if(owner !== data.newOwner){
            setIsError(true);
            setErrorMsg("錯誤：新帳戶擁有人不能與現在的帳戶擁有人相同");
            return;
        }
        if(data.newOwner !== ""){
            setIsError(true);
            setErrorMsg("錯誤：新帳戶擁有人不能為空");
            return;
        }
        const sendData = {
            newOwner:data.newOwner
        }
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.executeRecovery(sendData.newOwner).send({from: account})
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
                            <Col sm={4}>
                                <h5><span styles={{ color: '#d78559' }}>| </span> 所有監護人地址 </h5>
                            </Col>
                            <Col>
                                <Form.Control className="form-control mb-3" placeholder={`Add guardian address...`} type="text"
                                 onChange={handleChange} name="guardian" value={data.guardian}></Form.Control>
                            </Col>
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