import ts from "typescript";

function createRemoveNodeTransformer(
  nodeToRemove: ts.Node
): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const visit: ts.Visitor = (node) => {
      if (node === nodeToRemove) {
        return undefined;
      }
      return ts.visitEachChild(node, visit, context);
    };

    return (node) => ts.visitNode(node, visit);
  };
}

function doTextRangesOverlap(r1: ts.TextRange, r2: ts.TextRange) {
  return r1.end > r2.pos && r1.pos < r2.end;
}

function getDirectParent(node: ts.Node): ts.Node {
  let parentNode = node.parent;
  let parentChildren = parentNode.getChildren();
  let parentIndex = parentChildren.indexOf(node);
  while (parentIndex === -1) {
    parentNode = parentChildren.find((n) => doTextRangesOverlap(node, n))!;
    parentChildren = parentNode.getChildren();
    parentIndex = parentChildren.indexOf(node);
  }
  return parentNode;
}

function getRangeToRemove(node: ts.Node): ts.TextRange {
  const parentNode = getDirectParent(node);
  const parentChildren = parentNode.getChildren();
  const index = parentChildren.indexOf(node);
  let pos = node.pos;
  let end = node.end;
  const nextChild = parentChildren[index + 1];
  if (nextChild !== undefined && nextChild.kind === ts.SyntaxKind.CommaToken) {
    end = nextChild.end;
  }
  return { pos, end };
}

export function removeNode(
  sourceFile: ts.SourceFile,
  nodeToRemove: ts.Node
): string {
  const fullText = sourceFile.getFullText();
  const range = getRangeToRemove(nodeToRemove);
  return fullText.substring(0, range.pos) + fullText.substring(range.end);
}
