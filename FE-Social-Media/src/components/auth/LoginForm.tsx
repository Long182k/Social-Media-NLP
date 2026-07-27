import { useMutation } from "@tanstack/react-query";
import { Button, Col, Form, Input, Row, Space, Typography, Modal } from "antd";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SCREEN_MODE } from "../../@util/constant/constant";
import {
  ErrorResponseData,
  LoginFormProp,
  LoginResponse,
} from "../../@util/interface/auth.interface";
import { LoginParams } from "../../@util/types/auth.type";
import { useAppStore } from "../../store";
import { useState } from "react";
import { forgotPassword } from "../../api/auth";

const { Title, Text } = Typography;

const LoginForm = ({ onSwitchMode }: LoginFormProp) => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const LoginFinish = async (values: LoginParams) => {
    const userData = {
      username: values.username,
      password: values.password,
    };

    loginMutation.mutate(userData);
  };

  const loginMutation = useMutation<
    LoginResponse,
    AxiosError<ErrorResponseData>,
    LoginParams
  >({
    mutationFn: login,
    onSuccess: (data: LoginResponse) => {
      toast.success("Login successfully");

      if (data.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    },
  });

  const forgotPasswordMutation = useMutation<
    void,
    AxiosError<ErrorResponseData>,
    string
  >({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("Password reset instructions sent to your email");
      setShowForgotPassword(false);
      setForgotEmail("");
    },
    onError: (error: AxiosError<ErrorResponseData>) => {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    },
  });

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    forgotPasswordMutation.mutate(forgotEmail);
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{ height: "100%", padding: "20px" }}
    >
      <Col style={{ width: "100%", maxWidth: "580px" }}>
        {/* Connected Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Title
            level={2}
            style={{
              color: "#6366F1",
              fontSize: "32px",
              fontWeight: "600",
              marginBottom: "0",
            }}
          >
            Connected
          </Title>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "40px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            border: "1px solid #F1F5F9",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={28}>
            {/* Header */}
            <div>
              <Title
                level={3}
                style={{
                  marginBottom: "8px",
                  color: "#1E293B",
                  fontSize: "24px",
                  fontWeight: "600",
                }}
              >
                Login to your account
              </Title>
              <Text style={{ color: "#64748B", fontSize: "14px" }}>
                Enter your credentials to continue
              </Text>
            </div>

            <Form layout="vertical" onFinish={LoginFinish} requiredMark={false}>
              <Form.Item
                label={
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Username <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                }
                name="username"
                rules={[
                  { required: true, message: "Please enter your username!" },
                ]}
                style={{ marginBottom: "20px" }}
              >
                <Input
                  placeholder="Enter your username"
                  size="large"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    padding: "12px 16px",
                    fontSize: "14px",
                    backgroundColor: "#F9FAFB",
                  }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Password <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                ]}
                style={{ marginBottom: "12px" }}
              >
                <Input.Password
                  placeholder="••••••••••"
                  size="large"
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    padding: "12px 16px",
                    fontSize: "14px",
                    backgroundColor: "#F9FAFB",
                  }}
                />
              </Form.Item>

              {/* Forgot Password Link */}
              <div style={{ textAlign: "right", marginBottom: "24px" }}>
                <Button
                  type="link"
                  onClick={() => setShowForgotPassword(true)}
                  style={{
                    color: "#6366F1",
                    fontSize: "14px",
                    padding: "0",
                    height: "auto",
                    fontWeight: "400",
                  }}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Login Button */}
              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={loginMutation.isPending}
                  style={{
                    backgroundColor: "#6366F1",
                    borderColor: "#6366F1",
                    borderRadius: "8px",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "none",
                  }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>

            {/* Sign Up Link */}
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#64748B", fontSize: "14px" }}>
                Don't have an account?{" "}
                <Text
                  strong
                  onClick={() => onSwitchMode(SCREEN_MODE.SIGN_UP)}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    color: "#6366F1",
                    fontWeight: "500",
                  }}
                >
                  Sign up
                </Text>
              </Text>
            </div>
          </Space>
        </div>
      </Col>

      <Modal
        title={
          <span
            style={{
              color: "#1E293B",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Forgot Password
          </span>
        }
        open={showForgotPassword}
        onCancel={() => {
          setShowForgotPassword(false);
          setForgotEmail("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotEmail("");
            }}
            style={{
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              color: "#64748B",
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={forgotPasswordMutation.isPending}
            onClick={handleForgotPassword}
            style={{
              backgroundColor: "#6366F1",
              borderColor: "#6366F1",
              borderRadius: "8px",
            }}
          >
            Send
          </Button>,
        ]}
      >
        <div style={{ paddingTop: "16px" }}>
          <p
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: "#64748B",
              lineHeight: "1.5",
            }}
          >
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
          <Input
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            size="large"
            style={{
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              backgroundColor: "#F9FAFB",
            }}
          />
        </div>
      </Modal>
    </Row>
  );
};

export default LoginForm;
