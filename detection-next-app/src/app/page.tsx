"use client"

import { useState } from "react";
import { ApiFetchReq } from "./components/ApiFetch";

export default function Home() {

  const [file, setFile] = useState<Blob | null>()
  
  async function submitFile(e: any) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file as Blob);    
    const response = await ApiFetchReq('POST', 'http://127.0.0.1:8000/upload/file', formData)
    console.log("results", response)
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files!![0])} />
      <input type="button" onClick={submitFile} value={'submit'} />
    </div>
  );
}
