from fastapi import FastAPI, UploadFile, File
from .embedding import generate_image_embedding

import tempfile
import os


app = FastAPI(
    title="Image Embedding Service",
    version="1.0.0"
)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "image-embedding-service"
    }


@app.post("/embedding")
async def create_embedding(file: UploadFile = File(...)):

    suffix = os.path.splitext(file.filename)[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        contents = await file.read()
        temp_file.write(contents)
        temp_path = temp_file.name

    try:
        embedding = generate_image_embedding(temp_path)

        return {
            "dimensions": len(embedding),
            "embedding": embedding
        }

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)