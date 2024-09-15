"use client"

import { useState } from "react";
import { ApiFetchReq } from "./components/ApiFetch";

export default function Home() {

  const [file, setFile] = useState<FileList | null>()

  async function submitFile() {
    const response = await ApiFetchReq('POST', 'http://127.0.0.1:8000/upload/file', {file: file })
    console.log("results", response)
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files)} />
      <input type="button" onClick={submitFile} value={'submit'} />
    </div>
  );
}
