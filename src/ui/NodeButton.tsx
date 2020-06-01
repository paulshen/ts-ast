import { css } from "@emotion/core";
import * as React from "react";

const Styles = {
  button: css`
    padding: 3px 6px;
    margin: 2px 0;
    border: 1px solid var(--gray);
    border-radius: 4px;
  `,
};

export default function NodeButton({
  children,
  onClick,
  buttonStyle = false,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  buttonStyle?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      css={css(
        css`
          background-color: transparent;
          padding: 0;
          border: 0;
          cursor: pointer;
          margin: 0;
          font-family: SF Mono;
          font-size: 14px;
          outline-style: none;
          &:hover {
            text-decoration: underline;
          }
        `,
        buttonStyle ? Styles.button : undefined
      )}
      className={className}
    >
      {children}
    </button>
  );
}
