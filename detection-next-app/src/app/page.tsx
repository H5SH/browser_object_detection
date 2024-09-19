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
        try {
          const parsedData: ResponseObj = JSON.parse(chunk);
          setResponses((prevState) => [...prevState, parsedData])
        } catch (e) {
          setImgSrc(`data:image/png;base64,${chunk}`)
        }
      }
    } catch (er) {
      console.log(er)
    }
    setBtnLoading(false)
  }

  return (
    <div className="container m-5 flex flex-col justify-evenly items-center h-screen w-screen">
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide uppercase border ${file ? 'text-red border-red-500 hover:bg-red-500': 'text-blue border-blue-500 hover:bg-blue-500'}  cursor-pointer  hover:text-white`} >
          <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 7.64a.89.89 0 0 0-.88-.88H4a.89.89 0 0 0-.88.88v7.72c0 .49.39.88.88.88h12a.89.89 0 0 0 .88-.88V7.64zM10 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" /></svg>
          <span className="mt-2 text-base leading-normal">{file ? 'Remove File':'Select a file'}</span>
          {file ?(
            <input type="button" className="button" onClick={(e)=> setFile(null)} />
          ):(
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files!![0])} />
          )}
        </label>
      </div>

      {file && <img width={200} height={200} alt="img" src={URL.createObjectURL(file as Blob)} />}
      {responses.map((response: ResponseObj, index) => (
        <div key={index}>
          {response.detected ? (
            <div className="text-green-400">
              {`${response.type} Detected ${response.type === 'terminal' && response.detected_objects?.length ? response.detected_objects?.join(' ') : ' '}`}
            </div>
          ) : (
            <div className="text-red-600">
              {`${response.type} Failed To Detect`}
            </div>
          )}
        </div>
      ))}
      {imgSrc && <Image alt="img" width={200} height={200} src={imgSrc} />}
      <SubmitButton title='Submit' callback_event={submitFile} btnLoading={btnLoading} />
    </div>
  );
}
