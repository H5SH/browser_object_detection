"use client"

import { useState } from "react";
import Image from "next/image";

interface ResponseObj {
  detected: Boolean,
  type: String,
  detected_objects?: Array<String>,
  image: string
}

export default function Home() {

  const [file, setFile] = useState<Blob | null>()
  const [responses, setResponses] = useState<Array<ResponseObj>>([])
  const [imgSrc, setImgSrc] = useState<string>()

  async function submitFile(e: any) {
    e.preventDefault();
    try {
      setResponses([])
      const formData = new FormData();
      formData.append("file", file as Blob);
      const response = await fetch('http://127.0.0.1:8000/upload/file', {
        method: 'POST',
        body: formData
      })
      const reader: any = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let chunk = '';

      while (true) {
        const { done, value } = await reader?.read();
        if (done) break;

        chunk = decoder.decode(value, { stream: true });
        try{
          const parsedData: ResponseObj = JSON.parse(chunk);
          setResponses((prevState) => [...prevState, parsedData])
        }catch(e){
          setImgSrc(`data:image/png;base64,${chunk}`)
        }

      }
      } catch (er) {
        console.log(er)
      }
    }

  return (
      <div>
        <input type="file" onChange={(e) => setFile(e.target.files!![0])} />
        <input type="button" onClick={submitFile} value={'submit'} />
        {responses.map((response: ResponseObj, index) => (
          <div key={index}>
            {response.detected ? (
              <div className="text-green-400">
                {`${response.type} Detected`}
                {imgSrc && <Image alt="img" width={200} height={200} src={imgSrc} />}
              </div>
            ) : (
              <div className="text-red-600">
                {`${response.type} Failed To Detect`}
              </div>
            )}
          </div>
        ))}
        {/* <Image alt="img" width={200} height={200} src={require('C:\\H5SH\\companies\\data_unfolding\\wiresDitection\\detecttion_web_app\\detection-next-app\\src\\app\\predicted\\terminal_8.jpg')} /> */}
      </div>
    );
  }
