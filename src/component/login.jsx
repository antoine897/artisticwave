import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

import { useAuth } from '../auth/AuthContext';
import { auth } from "../config/firebase.config";
import { signInWithEmailAndPassword } from 'firebase/auth'

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUserDetails } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
        
    signInWithEmailAndPassword(auth, email, password)
    .then(cred => {
            setUserDetails(cred.user);
            navigate('/schedule');     
    })
    .catch(err => {
      setErrorMessage("Username or Password is incorrect");
    });

  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={3}>
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Mail Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>

          {/* Render error message if any */}
          {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
