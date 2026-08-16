import { useState } from "react";
import { SCREEN_MODE } from "../../../@util/constant/constant";
import LoginForm from "../../../components/auth/LoginForm";
import SignUpForm from "../../../components/auth/SignUpForm";
import "./login.css";

const LoginPage = () => {
  const [left, setLeft] = useState<number | string>(0);
  const [right, setRight] = useState<number | string>("unset");
  const [width, setWidth] = useState(0);
  const [currMode, setCurrMode] = useState(SCREEN_MODE.SIGN_IN);

  const onSwitchMode = (mode: SCREEN_MODE) => {
    setWidth(100);

    const timeout1 = setTimeout(() => {
      setCurrMode(mode);
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

  const headline =
    currMode === SCREEN_MODE.SIGN_IN
      ? "Say it out loud. We read the room."
      : "Join the room where it happens.";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        flexWrap: "wrap",
      }}
    >
      <div
        className="login-flank"
        style={{ flex: "1 1 420px", minWidth: 0 }}
      >
        <div className="login-flank-wordmark">
          <h1 className="login-flank-title">Connected</h1>
          <span className="hum-dot" aria-hidden="true" />
        </div>

        <div className="login-flank-center">
          <span className="login-eyebrow">
            {currMode === SCREEN_MODE.SIGN_IN ? "01 · Welcome back" : "02 · Get started"}
          </span>
          <p className="login-headline">{headline}</p>
          <p className="login-subline">
            A social feed that knows how a sentence feels. Posts, people and
            moods, together in one place.
          </p>
        </div>

        <div className="login-flank-foot">Connected · NLP inside</div>

        <div className="login-character" aria-hidden="true">
          <span className="hum-dot" style={{ width: 18, height: 18 }} />
        </div>
      </div>

      <div
        className="login-form-side"
        style={{ flex: "1 1 420px", minWidth: 0, position: "relative" }}
      >
        <div style={{ width: "100%", maxWidth: 460, marginInline: "auto" }}>
          {currMode === SCREEN_MODE.SIGN_IN ? (
            <LoginForm onSwitchMode={onSwitchMode} />
          ) : (
            <SignUpForm onSwitchMode={onSwitchMode} />
          )}
        </div>
        <div
          className="login-wipe"
          style={{
            left: left,
            right: right,
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
