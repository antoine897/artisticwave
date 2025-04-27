import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from 'react-bootstrap';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from "../config/firebase.config";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const now = Date.now();
    const lastSentTime = localStorage.getItem('lastPasswordResetEmailTime');
    
    if (lastSentTime && now - lastSentTime < 5 * 60 * 1000) {
      setErrorMessage('Please wait 5 minutes before requesting another password reset email.');
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            localStorage.setItem('lastPasswordResetEmailTime', now);
            setErrorMessage('');
            setSuccessMessage('Password reset email sent successfully. Please check your email.');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
};

  return (
    <div className="container py-5">
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={3}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Forgot Password</h2>
            <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/')}>← Back</button>
        </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Enter your registered email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Send Reset Link
            </Button>
          </Form>

          {/* Render success or error message */}
          {successMessage && <p className="text-success mt-3">{successMessage}</p>}
          {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPassword;
