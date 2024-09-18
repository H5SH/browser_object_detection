from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
from PIL import Image
import io
import json

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

async def identifying_object_stream(image):
    capacitor_detected = capacitor_detector(image)
    
    if len(capacitor_detected[0].boxes) > 0:
        yield json.dumps({"detected": True, "type": "capacitor"}).encode('utf-8')
        for i, result in enumerate(capacitor_detected[0].boxes):
            box = result.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = map(int, box)

            cropped_img = image.crop((x1 - 30, y1 - 30, x2 + 30, y2 + 30))

            terminal_detected = terminal_detector(cropped_img)

            if len(terminal_detected[0].boxes) > 0:
                class_ids = terminal_detected[0].boxes.cls

                detected_objects = [terminal_detector.names[int(cls_id)] for cls_id in class_ids]
                yield json.dumps({"detected": True, "type": "terminal", "detected_objects": detected_objects}).encode('utf-8')
            else:
                yield json.dumps({"detected": False, "type": "terminal"}).encode('utf-8')

    else:
        yield json.dumps({"detected": False, "type": "capacitor"}).encode('utf-8')

@app.post("/upload/file")
async def read_root(file: UploadFile = File()):
    content = await file.read()
    image = Image.open(io.BytesIO(content))

    return StreamingResponse(identifying_object_stream(image),  media_type="application/octet-stream")