import create from "zustand";
import * as ts from "typescript";

const [useStore] = create<{
  selectedNode: ts.Node | undefined;
  selectedPath: Array<ts.Node> | undefined;
  hoverNode: ts.Node | undefined;
  setSelectedNode: (node: ts.Node | undefined) => void;
  setHoverNode: (node: ts.Node | undefined) => void;
}>((set) => ({
  selectedNode: undefined,
  selectedPath: undefined,
  hoverNode: undefined,
  setSelectedNode: (node: ts.Node | undefined) => {
    if (node) {
      let selectedPath = [];
      let iter = node;
      while (iter !== undefined) {
        selectedPath.unshift(iter);
        iter = iter.parent;
      }
      set({
        selectedNode: node,
        selectedPath,
      });
    } else {
      set({
        selectedNode: undefined,
        selectedPath: undefined,
      });
    }
  },
  setHoverNode: (node: ts.Node | undefined) => {
    set({ hoverNode: node });
  },
}));

export const useSelectionStore = useStore;
