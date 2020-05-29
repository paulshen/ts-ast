import * as ts from "typescript";

export function getNodeName(node: ts.Node): string | undefined {
  const nodeName = (node as any).name;
  if (nodeName !== undefined) {
    return nodeName.text;
  }
  const tagName = (node as any).tagName;
  if (tagName !== undefined) {
    return `<${tagName.text}>`;
  }
  const tag = (node as any).tag;
  if (tag !== undefined) {
    return tag.text;
  }
  return undefined;
}
