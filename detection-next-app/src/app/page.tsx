"use client"

import { useState } from "react";
import { ApiFetchReq } from "./components/ApiFetch";

export default function Home() {

  const [file, setFile] = useState<Blob | null>()
  const [responses, setResponses] = useState<Array<any>>([])

  async function submitFile(e: any) {
    e.preventDefault();
    try{
      const formData = new FormData();
      formData.append("file", file as Blob);
      const response = await fetch('http://127.0.0.1:8000/upload/file', {
        method: 'POST',
        body: formData
      })
      const reader: any = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let chunk = '';
  
      while(true){
        const {done, value} = await reader?.read();
        if(done) break;
  
        chunk = decoder.decode(value, {stream: true});
  
        const parsedData = JSON.parse(chunk)

        setResponses([...responses, parsedData])
  
      }
    }catch(er){
      console.log(er)
    }
    // setResponse(response)
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files!![0])} />
      <input type="button" onClick={submitFile} value={'submit'} />
      {/* {response && <div>{response}</div>} */}
    </div>
  );
}
