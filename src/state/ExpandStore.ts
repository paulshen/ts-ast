import create from "zustand";

export const pathToString = (path: Array<number>) => path.join(",");
const stringToPath = (str: string) => str.split(",").map(parseInt);

const [useStore] = create<{
  expanded: Set<string>;
  setExpanded: (path: Array<number>, isExpanded: boolean) => void;
  collapseAll: () => void;
}>((set) => ({
  expanded: new Set<string>(["0"]),
  setExpanded: (path, isExpanded) => {
    set(({ expanded }) => {
      const newExpanded = new Set(expanded);
      if (isExpanded) {
        for (let i = 1; i <= path.length; i++) {
          newExpanded.add(pathToString(path.slice(0, i)));
        }
      } else {
        newExpanded.delete(pathToString(path));
      }
      return {
        expanded: newExpanded,
      };
    });
  },
  collapseAll: () => {
    set({ expanded: new Set(["0"]) });
  },
}));

export const useExpandStore = useStore;
