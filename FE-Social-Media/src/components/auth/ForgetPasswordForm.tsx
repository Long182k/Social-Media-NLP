import { Button, Col, Input, Row, Space, Typography } from "antd";
import { SCREEN_MODE } from "../../@util/constant/constant";

const { Title, Text } = Typography;

const ForgetPasswordForm = ({ onSwitchMode }) => {
  return (
    <Row
      justify="center"
      align="middle"
      style={{ height: "100%", color: "#424242" }} // Equivalent to colors.grey[800]
    >
      <Col style={{ width: "100%", maxWidth: "500px" }}>
        <Space direction="vertical" size={40} style={{ width: "100%" }}>
          <Space direction="vertical" size={8}>
            <Title level={3} style={{ marginBottom: 0, color: "#424242" }}>
              Create an account
            </Title>
            <Text type="secondary">
              Forgot your password? No worries, let's get you a new one.
            </Text>
          </Space>

          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <div>
                <Text>Name</Text>
                <Input placeholder="Enter your name" />
              </div>
              <div>
                <Text>Email</Text>
                <Input placeholder="Enter your email" />
              </div>
              <div>
                <Text>Password</Text>
                <Input.Password placeholder="Enter your password" />
              </div>
            </Space>

            <Button
              type="primary"
              size="large"
              style={{ backgroundColor: "#424242", borderColor: "#424242" }}
              block
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#757575")
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#424242")
              }
            >
              Sign up
            </Button>
          </Space>

          <Space size={8}>
            <Text>Already have an account?</Text>
            <Text
              strong
              onClick={() => onSwitchMode(SCREEN_MODE.SIGN_IN)}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Sign in
            </Text>
          </Space>
        </Space>
      </Col>
    </Row>
  );
};

export default ForgetPasswordForm;
