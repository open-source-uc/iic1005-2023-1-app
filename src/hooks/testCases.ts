import { useEffect, useState } from "react";
import { ITestCaseFile, ITestCaseLoaded, ITestCasesData } from "~/types/testCases";

async function loadTestCase(baseUrl: string, { zipFilesUrl, ...test }: ITestCaseFile): Promise<ITestCaseLoaded> {
  let zipFiles: ArrayBuffer | undefined = undefined;
  if (zipFilesUrl) {
    zipFiles = await (await fetch(`${baseUrl}/${zipFilesUrl}`)).arrayBuffer();
  }
  return { zipFiles, ...test };
}

export default function useTestCasesLoader(testCasesData: ITestCasesData): [ITestCaseLoaded[], boolean] {
  const [testCases, setTestCases] = useState<ITestCaseLoaded[]>([]);
  const [loading, setLoading] = useState(true);
  const { baseUrl, testCases: testCasesFiles } = testCasesData;

  useEffect(() => {
    Promise.all(testCasesFiles.map((tc) => loadTestCase(baseUrl, tc))).then((testCases) => {
      setTestCases(testCases);
      setLoading(false);
    });
  }, [testCasesFiles, baseUrl]);

  return [testCases, loading];
}
