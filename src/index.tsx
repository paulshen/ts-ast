import { css, Global } from "@emotion/core";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <Global
      styles={css`
        :root {
          --font-size-default: 14px;
          --line-height: 16px;
          --dark: #202020;
          --gray: #808080;
          --light: #c0c0c0;
          --very-light: #e0e0e0;
          --purple: #ae6ab4;
          --teal: #21b5c2;
          --white: #ffffff;
        }
        .monaco-editor .selected-text {
          background-color: #264f78 !important;
        }
      `}
    />
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
