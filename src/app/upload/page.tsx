"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ValidationState = {
  status: "idle" | "validating" | "valid" | "invalid";
  errors: string[];
};

export default function UploadPage() {
  const router = useRouter();
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [patternsFile, setPatternsFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    errors: [],
  });

  const canValidate = useMemo(() => !!datasetFile && !!patternsFile, [datasetFile, patternsFile]);

  useEffect(() => {
    const validate = async () => {
      if (!canValidate) return;
      setValidation({ status: "validating", errors: [] });
      const form = new FormData();
      if (datasetFile) form.append("dataset", datasetFile);
      if (patternsFile) form.append("patterns", patternsFile);
      const res = await fetch("/api/validate", { method: "POST", body: form });
      if (res.ok) {
        setValidation({ status: "valid", errors: [] });
      } else {
        const data = await res.json().catch(() => ({ errors: ["Validation failed"] }));
        setValidation({ status: "invalid", errors: data.errors ?? ["Validation failed"] });
      }
    };
    void validate();
  }, [canValidate, datasetFile, patternsFile]);

  const onNext = async () => {
    if (!datasetFile || !patternsFile) return;
    const form = new FormData();
    form.append("dataset", datasetFile);
    form.append("patterns", patternsFile);
    const res = await fetch("/api/compute", { method: "POST", body: form });
    if (!res.ok) {
      alert("Compute failed");
      return;
    }
    const data = await res.json();
    // Store results in sessionStorage for the analytics page to read
    sessionStorage.setItem("computeResults", JSON.stringify(data));
    router.push("/analytics");
  };

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-no-repeat bg-cover bg-center opacity-15 bg-zoom"
        style={{ backgroundImage: "url('/kindpng_619182.png')" }}
      />
      <div className="relative z-10 max-w-3xl w-full mx-auto space-y-6 p-6 sm:p-10 bg-white/75 rounded-lg">
        <h1 className="text-2xl font-semibold">Geo Pattern Inspector</h1>
        <p className="text-sm text-gray-600">Provide your dataset and patterns (.csv) files.</p>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Dataset (.csv)</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setDatasetFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {datasetFile && <span className="text-xs text-gray-500">Selected: {datasetFile.name}</span>}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Patterns (.csv)</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setPatternsFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {patternsFile && <span className="text-xs text-gray-500">Selected: {patternsFile.name}</span>}
          </label>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            disabled={validation.status !== "valid"}
            onClick={onNext}
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}



