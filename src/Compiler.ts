import * as ts from "typescript";

export function createProgram(code: string) {
  const sourceFile = ts.createSourceFile(
    "index.tsx",
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const files: Record<string, ts.SourceFile> = {
    "index.tsx": sourceFile,
  };
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (
      fileName: string,
      languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void
    ) => {
      return files[fileName];
    },
    getDefaultLibFileName: ts.getDefaultLibFileName,
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getDirectories: (path: string) => [],
    fileExists: (fileName: string) => files[fileName] != null,
    readFile: (fileName: string) =>
      files[fileName] != null ? files[fileName]!.getFullText() : undefined,
    getCanonicalFileName: (fileName: string) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => "\n",
    getEnvironmentVariable: () => "",
  };
  const program = ts.createProgram({
    rootNames: Object.keys(files),
    options: {
      strict: true,
      target: ts.ScriptTarget.Latest,
      allowJs: true,
      module: ts.ModuleKind.ES2015,
    },
    host: compilerHost,
  });
  const typeChecker = program.getTypeChecker();
  return { sourceFile, program, typeChecker };
}
