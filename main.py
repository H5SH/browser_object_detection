from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ultralytics import YOLO
from PIL import Image, ImageDraw
import io
import json
import os
import time
import base64

app = FastAPI()

capacitor_detector = YOLO('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\models\capacitors\yolo_all.pt')
terminal_detector = YOLO('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\models\\terminals\yolo_all.pt')


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

def draw_boxes(image, detections):
    draw = ImageDraw.Draw(image)

    for result in detections[0].boxes:
        box = result.xyxy[0].cpu().numpy()
        x1, y1, x2, y2 = map(int, box)
        draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
    return image


def identifying_object_stream(image, name):
    capacitor_detected = capacitor_detector(image)

    if len(capacitor_detected[0].boxes) > 0:

        output_path = os.path.join('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\predicted', name)
        # img = draw_boxes(image, capacitor_detected) 
        # img.save(output_path) 

        yield json.dumps({"detected": True, "type": "capacitor"}).encode('utf-8')
    
        for i, result in enumerate(capacitor_detected[0].boxes):

            box = result.xyxy[0].cpu().numpy()
            x1, y1, x2, y2 = map(int, box)

            cropped_img = image.crop((x1 - 30, y1 - 30, x2 + 30, y2 + 30))

            terminal_detected = terminal_detector(cropped_img)

            if len(terminal_detected[0].boxes) > 0:
                class_ids = terminal_detected[0].boxes.cls

                detected_objects = [terminal_detector.names[int(cls_id)] for cls_id in class_ids]

                output_path = os.path.join('C:\H5SH\companies\data_unfolding\wiresDitection\detecttion_web_app\detection-next-app\src\\app\predicted', f"terminal_{name}")
                img = draw_boxes(cropped_img, terminal_detected)
                # img.save(output_path)

                img_byte_arr = io.BytesIO()

                img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)
                img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')

                yield json.dumps({"detected": True, "type": "terminal", "detected_objects": detected_objects}).encode('utf-8')
                yield  img_base64
            else:
                
                img_byte_arr = io.BytesIO()

                cropped_img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)
                img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')

                yield json.dumps({"detected": False, "type": "terminal"}).encode('utf-8')
                yield img_base64

    else:
        
        img_byte_arr = io.BytesIO()

        image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        img_base64 = base64.b64encode(img_byte_arr.read()).decode('utf-8')

        yield json.dumps({"detected": False, "type": "capacitor"}).encode('utf-8')
        yield img_base64


@app.post("/upload/file")
async def read_root(file: UploadFile = File()):
    content = await file.read()
    image = Image.open(io.BytesIO(content))

    return StreamingResponse(identifying_object_stream(image, file.filename),  media_type="application/octet-stream")