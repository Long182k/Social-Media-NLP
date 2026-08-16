import { LogoProps } from "./logo.interface";
import "./logo.css";

function Logo(props: LogoProps): JSX.Element {
  void props;
  return (
    <div className="logo">
      <span className="logo-word">Connected</span>
      <span className="hum-dot" aria-hidden="true" />
    </div>
  );
}

export default Logo;
