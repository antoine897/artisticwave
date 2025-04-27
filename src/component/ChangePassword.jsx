import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from 'react-bootstrap';
import { getAuth, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { SignOut } from '../methods/SignOut';

const ChangePassword = () => {
  const navigate = useNavigate();

  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [user, setUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      } else {
        setIsAuthorized(true);
        setIsLoading(false);
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    updatePassword(user, newPassword)
      .then(() => {
        setSuccessMessage('Password changed successfully');
        setTimeout(() => {
          SignOut();
          navigate('/');
        }, 2000); 
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage('Something went wrong, please try again later.');
      });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="container py-5">
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={3}>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Change Password</h2>
            <button className="btn btn-outline-primary fw-bold fs-5" onClick={() => navigate('/schedule')}>← Back</button>
        </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNewPassword">
              <Form.Control
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Control
                type="password"
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Change Password
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

export default ChangePassword;
