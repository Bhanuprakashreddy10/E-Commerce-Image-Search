from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch


MODEL_NAME = "openai/clip-vit-base-patch32"


print("Loading CLIP model...")

processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model = CLIPModel.from_pretrained(MODEL_NAME)

model.eval()

print("CLIP model loaded successfully.")


def generate_image_embedding(image_path: str):
    image = Image.open(image_path).convert("RGB")

    inputs = processor(
        images=image,
        return_tensors="pt"
    )

    with torch.inference_mode():
        output = model.get_image_features(**inputs)

    # Transformers 5.x returns BaseModelOutputWithPooling.
    # The projected image embedding is stored in pooler_output.
    image_features = output.pooler_output

    # Normalize the embedding for cosine similarity.
    image_features = image_features / image_features.norm(
        p=2,
        dim=-1,
        keepdim=True
    )

    embedding = image_features.squeeze(0).tolist()

    return embedding