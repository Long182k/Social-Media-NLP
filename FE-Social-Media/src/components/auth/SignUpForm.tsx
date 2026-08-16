import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Space, Typography } from "antd";
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

const { Text } = Typography;

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
      toast.success("Account created. Welcome to Connected.");
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
    <div className="login-card">
      <div className="login-brandline">
        <span className="login-brand-word">Connected</span>
        <span className="hum-dot" style={{ width: 10, height: 10 }} />
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={20}>
        <div>
          <h2 className="login-card-title">Create an account</h2>
          <Text className="login-card-sub">
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
            label={<span className="login-field-label">Username</span>}
            name="username"
            rules={[
              { required: true, message: "Please enter your username" },
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
            label={<span className="login-field-label">E-mail</span>}
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input
              placeholder="email@email.com"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label={<span className="login-field-label">Password</span>}
            name="password"
            rules={[
              { required: true, message: "Please enter your password" },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              placeholder="••••••••••"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label={<span className="login-field-label">Repeat password</span>}
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
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              placeholder="••••••••••"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <div style={{ marginBottom: 24 }}>
            <Text
              className="login-card-sub"
              style={{ fontSize: 12, lineHeight: 1.5 }}
            >
              By clicking Continue, you agree to our Terms and Conditions,
              confirm you have read our Privacy Notice.
            </Text>
          </div>

          <Form.Item style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              block
              loading={createUserMutation.isPending}
            >
              Sign up
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text className="login-card-sub">
            Already have an account?{" "}
            <Text
              strong
              className="login-switch"
              onClick={() => onSwitchMode(SCREEN_MODE.SIGN_IN)}
            >
              Sign in
            </Text>
          </Text>
        </div>
      </Space>
    </div>
  );
};

export default SignUpForm;
