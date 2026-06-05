import os
import json
import base64

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


@app.get("/")
def root():
    return {"message": "AgroMind API is running"}


@app.post("/diagnose")
async def diagnose(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()

        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": """
                                Analyze this crop image.

                                Return ONLY valid JSON.
                                Do not use markdown.
                                Do not include any text outside the JSON.

                                {
                                "crop": "string",
                                "disease_name": "string",
                                "growth_stage": "string",
                                "confidence": "percentage",
                                "explanation": "string",
                                "disease_type": "fungal | bacterial | viral | pest | nutrient deficiency | unknown",
                                "spread_rate": "slow | moderate | fast",
                                "severity": "mild | moderate | severe",
                                "symptoms": [
                                    "symptom 1",
                                    "symptom 2",
                                    "symptom 3"
                                ]
                                }

                                Instructions:

                                - Make your best estimate of the crop type.
                                - Make your best estimate of the growth stage.
                                - Do NOT use "unknown" unless the image contains no visible plant.
                                - If uncertain, provide your most likely guess and lower the confidence score.
                                - Confidence should reflect uncertainty.
                                - Use visual clues such as leaf shape, fruit, flowers, stem structure, and plant size.
                                """
                        },
                        {
                            "type": "input_image",
                            "image_url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    ]
                }
            ]
        )

        result = json.loads(response.output_text)

        return result

    except Exception as error:
        return {
            "crop": "unknown",
            "disease_name": "unknown",
            "confidence": "0%",
            "explanation": str(error),
            "disease_type": "unknown",
            "spread_rate": "unknown",
            "severity": "unknown",
            "symptoms": []
        }