import React, { useState} from 'react';
import { Form, Col, Modal, Button } from "react-bootstrap";
const ExecuteRemovalGuardianButton = (props) =>{
    const {id} = props;
    const {owner} = props;
    const {account} = props;
    const {contractList} = props;
    const {isError} = props;
    const {setIsError} = props;
    const {errorMsg} = props;
    const {setErrorMsg} = props;
    const {setIsloading} = props;
    const {setContentVisiable} = props;
    const {data} = props;
    const {setData} = props;
    const [show, setShow] = useState(false);
    const handleClick = (e) => {
        setShow(true);
    };
    const handleClose = (e) => {
        setShow(false);
        setIsError(false);
        setErrorMsg("");
    };
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };
    const executeGuardianRemoval = async(e) => {
        e.preventDefault();
        const sendData = {
            newGuardian: data.newGuardian
        };
        if(owner !== account){
            setIsError(true);
            setErrorMsg("錯誤：此操作只有帳戶擁有人能操作");
            return;
        }
        setIsloading(true);
        setContentVisiable(false);
        contractList.methods.executeGuardianRemoval(id,sendData.newGuardian).send({from: account})
            .then(function (receipt) {
                window.location.reload();
            })
            .catch(function (err) {
                console.error(err);
                window.location.reload();
            });
    }
    return(
        <div>
            <Button variant="dark" onClick={handleClick}>加入刪除排程</Button>
            <Modal
                show={show}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
            <Modal.Header>
                <Modal.Title> 確認刪除此並更換新監護人 </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <form onSubmit={executeGuardianRemoval}>
                <div className='row d-flex w-100'>
                <Col sm={4}>
                    <h5><span styles={{ color: '#d78559' }}>| </span> 欲刪除之監護人地址 </h5>
                </Col>
                <Col>
                    <h6>{id}</h6>
                </Col>
                </div>
                <div className='row d-flex w-100'>
                    <Col sm={4}>
                    <h5><span styles={{ color: '#d78559' }}>| </span> 欲新增之監護人地址 </h5>
                    </Col>
                    <Col>
                        <Form.Control className="form-control mb-3" placeholder={`Add new guardian address...`} type="text"
                        onChange={handleChange} name="newGuardian" value={data.newGuardian}></Form.Control>
                    </Col>
                </div>
            </form>
            </Modal.Body>
            <Modal.Footer>
                {(isError)&&(<p style={{color:'red'}}>{errorMsg}</p>)}
                <Button variant='secondary' onClick={handleClose}> 取消 </Button>
            </Modal.Footer>
            </Modal>
        </div>
        
    );
}

export default ExecuteRemovalGuardianButton;