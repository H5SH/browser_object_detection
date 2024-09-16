from fastapi import FastAPI, UploadFile, File
from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI()

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
    return {"filename": file.filename}
    # return StreamingResponse(identifying_object_stream())