from fastapi import FastAPI, UploadFile, File
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ultralytics import YOLO

app = FastAPI()

capacitor_detector = YOLO('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\models\capacitors\yolo_capacitor.pt')
terminal_detector = YOLO('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\models\\terminals\yolo_terminal.pt')


origins = [
    "http://localhost.tiangolo.com",
    "http://localhost:3000",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def identifying_object_stream():
    for i in range(10):
        yield b"some photo"

@app.post("/upload/file")
async def read_root(file: UploadFile):
    capacitor_detected = capacitor_detector(file)
    return {"filename": file.filename}
    # return StreamingResponse(identifying_object_stream())