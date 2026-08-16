import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Space, Typography } from "antd";
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

const { Text } = Typography;

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
      toast.success("You're in.");

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
    <div className="login-card">
      <div className="login-brandline">
        <span className="login-brand-word">Connected</span>
        <span className="hum-dot" style={{ width: 10, height: 10 }} />
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={20}>
        <div>
          <h2 className="login-card-title">Login to your account</h2>
          <Text className="login-card-sub">
            Enter your credentials to continue
          </Text>
        </div>

        <Form layout="vertical" onFinish={LoginFinish} requiredMark={false}>
          <Form.Item
            label={<span className="login-field-label">Username</span>}
            name="username"
            rules={[
              { required: true, message: "Please enter your username!" },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input
              placeholder="Enter your username"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label={<span className="login-field-label">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
            ]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password
              placeholder="••••••••••"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <Button
              type="link"
              className="login-link"
              onClick={() => setShowForgotPassword(true)}
              style={{ padding: 0, height: "auto" }}
            >
              Forgot password?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              loading={loginMutation.isPending}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text className="login-card-sub">
            Don't have an account?{" "}
            <Text
              strong
              className="login-switch"
              onClick={() => onSwitchMode(SCREEN_MODE.SIGN_UP)}
            >
              Sign up
            </Text>
          </Text>
        </div>
      </Space>

      <Modal
        title="Forgot Password"
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
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={forgotPasswordMutation.isPending}
            onClick={handleForgotPassword}
          >
            Send
          </Button>,
        ]}
      >
        <div style={{ paddingTop: 16 }}>
          <p
            style={{
              marginBottom: 16,
              fontSize: 14,
              color: "var(--color-ink-2)",
              lineHeight: 1.5,
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
          />
        </div>
      </Modal>
    </div>
  );
};

export default LoginForm;
