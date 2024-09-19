"use client"

import { useState } from "react";
import Image from "next/image";
import SubmitButton from '../components/SubmitButton';

interface ResponseObj {
  detected: Boolean,
  type: String,
  detected_objects?: Array<String>,
  image: string
}

export default function Home() {

  const [file, setFile] = useState<Blob | null>()
  const [imgSrc, setImgSrc] = useState<string>('')
  const [btnLoading, setBtnLoading] = useState<Boolean>(false)
  const [responses, setResponses] = useState<Array<ResponseObj>>([])

  async function submitFile(e: any) {
    e.preventDefault();
    setBtnLoading(true)
    try {
      setResponses([])
      setImgSrc('')
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
      setBtnLoading(false)
    }

  return (
      <div className="container m-5">
        <input type="file" onChange={(e) => setFile(e.target.files!![0])} />
        <SubmitButton title='Submit' callback_event={submitFile} btnLoading={btnLoading}/>
        {responses.map((response: ResponseObj, index) => (
          <div key={index}>
            {response.detected ? (
              <div className="text-green-400">
                {`${response.type} Detected ${response.type === 'terminal' && response.detected_objects?.length ? response.detected_objects?.join(' '): ' '}`}
              </div>
            ) : (
              <div className="text-red-600">
                {`${response.type} Failed To Detect`}
              </div>
            )}
          </div>
        ))}
        {imgSrc && <Image alt="img" width={200} height={200} src={imgSrc} />}
      </div>
    );
  }
