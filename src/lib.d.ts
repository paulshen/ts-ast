import * as ts from "typescript";

declare module "typescript" {
  interface Node {
    symbol?: ts.Symbol;
  }

  enum TransformFlags {}
}
