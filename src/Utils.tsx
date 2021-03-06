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

export function isLandmarkNode(node: ts.Node): boolean {
  return (
    ts.isVariableDeclaration(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isMethodDeclaration(node)
  );
}

export function getNodeForPosition(
  node: ts.Node,
  position: number
): ts.Node | undefined {
  if (position < node.pos || position > node.end) {
    return;
  }
  const children: Array<ts.Node> = [];
  node.forEachChild((child) => {
    children.push(child);
  });
  for (const child of children) {
    if (child.pos <= position && child.end >= position) {
      return getNodeForPosition(child, position);
    }
  }
  return node;
}

export function getTsFlags<F>(flagEnum: F, flags: number): Array<F> {
  const rv: Array<F> = [];
  Object.values(flagEnum)
    .filter((flag) => typeof flag === "number")
    .forEach((flag: any) => {
      if (flag !== 0 && (flags & flag) === flag && !rv.includes(flag)) {
        rv.push(flag);
      }
    });
  return rv;
}

export function throttle<F extends Function>(f: F, ms: number) {
  let timeout: NodeJS.Timeout | undefined;
  return () => {
    if (timeout === undefined) {
      timeout = setTimeout(() => {
        timeout = undefined;
        f();
      }, ms);
    }
  };
}

export function getPathForNode(node: ts.Node): Array<number> {
  const path: Array<number> = [];
  let iter = node;
  while (!ts.isSourceFile(iter)) {
    const parentNode = iter.parent;
    let i = 0;
    const iterNode = iter;
    parentNode.forEachChild((child: ts.Node) => {
      if (child === iterNode) {
        path.unshift(i);
      }
      i++;
    });
    iter = parentNode;
  }
  path.unshift(0);
  return path;
}

export function isParentNode(node: ts.Node, parentNode: ts.Node): boolean {
  let iter = node.parent;
  while (iter !== undefined) {
    if (iter === parentNode) {
      return true;
    }
    iter = iter.parent;
  }
  return false;
}
