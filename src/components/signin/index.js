import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Icon from "../icon";
import { Button, Flex } from "../styles/signin";
import { SET_USER, SET_THEME } from "../../redux/actions";
import { logo } from "./paths";
// import { Row, Col } from "../styles/common";
import { Row, Col } from "antd";
import { ethers } from "ethers";

const URL = process.env.REACT_APP_SERVER_URL;

const SignIn = (props) => {

  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  const [credentialError, setCredentialError] = useState({
    user: null,
    password: null,
  });
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const history = useHistory();
  const profile = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  const handleSubmit = async (data) => {
    try {
      setLoginDisabled(true);
      const login = await axios.post(`${URL}/user/login-user`, data);
      setCredentialError({ user: null, password: null });
      setLoginDisabled(false);
      dispatch({ type: SET_USER, payload: login.data.user });
      dispatch({ type: SET_THEME, payload: "default" });
      history.push("/home");
    } catch (err) {
      setCredentialError(err.response.data);
      setLoginDisabled(false);
    }
  };

  const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
      dispatch({ type: SET_USER, payload: {account: accounts[0], signer: signer} });
      dispatch({ type: SET_THEME, payload: "default" });
      history.push("/home");
      // Move to profile or feed page.
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <React.Fragment>
      <Row>
        <Col md={12} xs={24} style={{ padding: "15px" }}>
          <Flex>
            <div>
              <Icon
                d={logo}
                width="41.25px"
                height="41.25px"
                fill="rgb(29,161,242)"
              />
              <h1>Not your rules, not your profile</h1>
              <p>Join the revolution.</p>
              <Button
                bg="rgb(29,160,240)"
                color="rgb(255,255,255)"
                hovbg="rgb(26, 146, 220)"
                onClick={onClickConnect}
              >
                Connect
              </Button>
            </div>
          </Flex>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default SignIn;
