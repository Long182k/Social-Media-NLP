import { useMutation } from "@tanstack/react-query";
import { Button, Col, Form, Input, Row, Space, Typography } from "antd";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { SCREEN_MODE } from "../../@util/constant/constant";
import {
  ErrorResponseData,
  RegisterFormProp,
  RegisterResponse,
} from "../../@util/interface/auth.interface";
import { RegisterNewUserParams } from "../../@util/types/auth.type";
import { useAppStore } from "../../store";

const { Title, Text } = Typography;

const SignUpForm = ({ onSwitchMode }: RegisterFormProp) => {
  const { signup, addUserInfo } = useAppStore();

  const SignUpFinish = async (values: RegisterNewUserParams) => {
    const userData = {
      email: values.email,
      username: values.username,
      password: values.password,
    };

    createUserMutation.mutateAsync(userData);
  };

  const createUserMutation = useMutation<
    RegisterResponse,
    AxiosError<ErrorResponseData>,
    RegisterNewUserParams
  >({
    mutationFn: signup,
    onSuccess: (res) => {
      addUserInfo(res.accessToken);
      toast.success("Register a new account successfully");
      onSwitchMode(SCREEN_MODE.SIGN_IN);
    },
    onError: (error: AxiosError<ErrorResponseData>) => {
      if (error.response?.status === 401) {
        const message = error.response?.data?.message;
        toast.error(message);
      } else {
        toast.error("Try Again");
      }
    },
  });

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

        {/* Signup Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
            border: "1px solid #F1F5F9",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={24}>
            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <Title
                level={3}
                style={{
                  marginBottom: "8px",
                  color: "#1E293B",
                  fontSize: "24px",
                  fontWeight: "600",
                }}
              >
                Create an account
              </Title>
              <Text style={{ color: "#64748B", fontSize: "14px" }}>
                To continue, fill out your personal info
              </Text>
            </div>

            <Form
              layout="vertical"
              onFinish={SignUpFinish}
              requiredMark={false}
              style={{ width: "100%" }}
            >
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
                  { required: true, message: "Please enter your username" },
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
                    E-mail <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
                style={{ marginBottom: "20px" }}
              >
                <Input
                  placeholder="email@email.com"
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
                  { required: true, message: "Please enter your password" },
                ]}
                style={{ marginBottom: "20px" }}
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

              <Form.Item
                label={
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Repeat password <span style={{ color: "#EF4444" }}>*</span>
                  </span>
                }
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue("password") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("The passwords do not match!")
                      );
                    },
                  }),
                ]}
                style={{ marginBottom: "20px" }}
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

              {/* Terms and Conditions */}
              <div style={{ marginBottom: "24px" }}>
                <Text
                  style={{
                    color: "#64748B",
                    fontSize: "12px",
                    lineHeight: "1.5",
                  }}
                >
                  By clicking Continue, you agree to our Terms and Conditions,
                  confirm you have read our Privacy Notice.
                </Text>
              </div>

              {/* Sign Up Button */}
              <Form.Item style={{ marginBottom: "24px" }}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  block
                  loading={createUserMutation.isPending}
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
                  Sign up
                </Button>
              </Form.Item>
            </Form>

            {/* Sign In Link */}
            <div style={{ textAlign: "center" }}>
              <Text style={{ color: "#64748B", fontSize: "14px" }}>
                Already have an account?{" "}
                <Text
                  strong
                  onClick={() => onSwitchMode(SCREEN_MODE.SIGN_IN)}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    color: "#6366F1",
                    fontWeight: "500",
                  }}
                >
                  Sign in
                </Text>
              </Text>
            </div>
          </Space>
        </div>
      </Col>
    </Row>
  );
};

export default SignUpForm;
