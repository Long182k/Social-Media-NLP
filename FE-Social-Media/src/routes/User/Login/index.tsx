import { Col, Row } from "antd";
import { useState } from "react";
import LoginForm from "../../../components/auth/LoginForm";
import SignUpForm from "../../../components/auth/SignUpForm";
import assets from "../../../assets";
import { SCREEN_MODE } from "../../../@util/constant/constant";

const LoginPage = () => {
  const [left, setLeft] = useState<number | string>(0);
  const [right, setRight] = useState<number | string>("unset");
  const [width, setWidth] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(
    assets.images.loginBackground
  );
  const [currMode, setCurrMode] = useState(SCREEN_MODE.SIGN_IN);

  const onSwitchMode = (mode: SCREEN_MODE) => {
    setWidth(100);

    const timeout1 = setTimeout(() => {
      setCurrMode(mode);
      setBackgroundImage(
        mode === SCREEN_MODE.SIGN_IN
          ? assets.images.loginBackground
          : assets.images.signupBackground
      );
    }, 1100);

    const timeout2 = setTimeout(() => {
      setLeft("unset");
      setRight(0);
      setWidth(0);
    }, 1200);

    const timeout3 = setTimeout(() => {
      setRight("unset");
      setLeft(0);
    }, 2500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  };

  return (
    <Row
      style={{
        height: "100vh",
        overflow: "hidden",
        margin: 0,
      }}
    >
      <Col
        xs={24}
        md={8}
        span={12}
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          position: "relative",
          height: "100vh",
        }}
      >
        {currMode === SCREEN_MODE.SIGN_IN ? (
          <LoginForm onSwitchMode={onSwitchMode} />
        ) : (
          <SignUpForm onSwitchMode={onSwitchMode} />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: left,
            right: right,
            width: `${width}%`,
            height: "100%",
            backgroundColor: "#424242",
            transition: "all 1s ease-in-out",
          }}
        />
      </Col>

      <Col
        xs={24}
        md={16}
        span={12}
        style={{
          position: "relative",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            width: "112%",
            height: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: left,
            right: right,
            width: `${width}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            transition: "all 1s ease-in-out",
          }}
        />
      </Col>
    </Row>
  );
};

export default LoginPage;
