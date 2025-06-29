import httpx
import os
from pydantic_ai.providers.google_gla import GoogleGLAProvider
from pydantic_ai.models.gemini import GeminiModel
from pydantic import BaseModel
from pydantic_ai import Agent, BinaryContent

class OcrResponse(BaseModel):
    content: str
    confidence: float

class OcrAgent:
    def __init__(self):
        self.model = GeminiModel(
            "gemini-2.5-flash",
            provider=GoogleGLAProvider(
                api_key='AIzaSyBGwKu1NHBWvXSfCK_Q83i0eX3aQBc1eQM',
            ),
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def generate_text_from_image(self, image: bytes):
        agent = Agent(
            model=self.model,
            output_type=OcrResponse,
            headers=self.headers,
            system_prompt=(
                'You are an OCR (Optical Character Recognition) agent. Your task is to extract text from images. '
                'Extract the text from the image and format it into markup format. '
                'Also provide a confidence level (between 0.0 and 1.0) indicating how confident you are in the accuracy of the extracted text. '
                'A confidence of 1.0 means you are completely certain, while 0.0 means completely uncertain.'
            )
        )

        # Use run_async since we're in an async function
        result = await agent.run(
            [
                'Extract the text from the image and format it into markup format. Provide a confidence level for your extraction.',
                BinaryContent(data=image, media_type='image/png'),
            ]
        )
        return result.output

        
if __name__ == "__main__":
    import os
    import asyncio
    
    async def main():
        # Get the path to test.png in the server directory
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Try test.png first, then fall back to test1.jpg if not found
        test_image_paths = [
            os.path.join(current_dir, "test.png"),
            os.path.join(current_dir, "test1.jpg")
        ]
        
        test_image_path = None
        for path in test_image_paths:
            if os.path.exists(path):
                test_image_path = path
                print(f"Found test image at {test_image_path}")
                break
        
        if test_image_path is None:
            print("Error: No test image found. Please ensure either test.png or test1.jpg exists in the server directory.")
            return
            
        # Read the image
        with open(test_image_path, "rb") as f:
            image_data = f.read()
        
        # Create the OCR agent
        ocr_agent = OcrAgent()
        
        # Process the image
        try:
            # Get media type based on file extension
            media_type = 'image/png' if test_image_path.endswith('.png') else 'image/jpeg'
            print(f"Processing image with media type: {media_type}")
            
            result = await ocr_agent.generate_text_from_image(image_data)
            print("OCR Result:")
            print(f"Content: {result.content}")  # Access the content field from OCRResponse
            print(f"Confidence: {result.confidence}")  # Access the confidence level
        except Exception as e:
            print(f"Error processing image: {e}")
    
    # Run the async main function
    asyncio.run(main())


# image_response = httpx.get('https://iili.io/3Hs4FMg.png')  # Pydantic logo

# agent = Agent(model=GeminiModel(
#             "gemini-2.5-flash",
#             provider=GoogleGLAProvider(
#                 api_key="AIzaSyBGwKu1NHBWvXSfCK_Q83i0eX3aQBc1eQM",
#             ),
#         ))
# result = agent.run_sync(
#     [
#         'What company is this logo from?',
#         BinaryContent(data=image_response.content, media_type='image/png'),
#     ]
# )
# print(result.output)
# # > This is the logo for Pydantic, a data validation and settings management library in Python.
