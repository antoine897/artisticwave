import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage("Please fill all the fields");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8800/login`, {
        username,
        password,
      });
      if (response.data.success) {
        navigate("Users");
      } else {
        setErrorMessage("Invalid credentials");
      }
    } catch (err) {
      setErrorMessage("Username or Password is incorrect");
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={3}>
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="password"
                placeholder="Password"
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
