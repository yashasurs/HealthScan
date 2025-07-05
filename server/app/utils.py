from typing import List
from passlib.context import CryptContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai import BinaryContent
from pydantic_ai.agent import Agent
from pydantic_ai.providers.google_gla import GoogleGLAProvider
import os
import qrcode
import io
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import markdown
from weasyprint import HTML, CSS
import pytesseract
import cv2
from pypdf import PdfReader
from . import schemas

load_dotenv()

# Configure pytesseract with explicit path for deployment environments
if os.environ.get("DYNO"):  # Check if running on Heroku
    pytesseract.pytesseract.tesseract_cmd = "/app/.apt/usr/bin/tesseract"
    os.environ["TESSDATA_PREFIX"] = "/app/.apt/usr/share/tesseract-ocr/5/tessdata"

if __name__ == "__main__":
    from schemas import MarkupResponse, OcrResponseGemini
else:
    from .schemas import MarkupResponse, OcrResponseGemini

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash(password: str):
    return pwd_context.hash(password)


def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def process_single_image_tesseract(
    image_data: bytes, filename: str, file_size: int, file_type: str
) -> dict:
    """
    Process a single image with Tesseract OCR (much faster than EasyOCR)
    """
    try:
        # Convert bytes to numpy array for faster processing
        nparr = np.frombuffer(image_data, np.uint8)

        # Decode image directly with OpenCV (faster than PIL)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image")

        # Convert to grayscale for faster OCR
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Optimize image size for speed (resize if too large)
        height, width = gray.shape
        if width > 2000 or height > 2000:
            scale_factor = min(2000 / width, 2000 / height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            gray = cv2.resize(
                gray, (new_width, new_height), interpolation=cv2.INTER_AREA
            )

        # Apply threshold for better text contrast
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Convert back to PIL Image for pytesseract
        pil_image = Image.fromarray(thresh)

        # Use pytesseract with optimized configuration
        extracted_text = pytesseract.image_to_string(
            pil_image,
            config="--psm 6 --oem 3",  # Page segmentation mode 6, OCR Engine Mode 3
        )

        return {
            "success": True,
            "extracted_text": extracted_text.strip(),
            "filename": filename,
            "file_size": file_size,
            "file_type": file_type,
            "error": None,
        }

    except Exception as e:
        return {
            "success": False,
            "extracted_text": None,
            "filename": filename,
            "file_size": file_size,
            "file_type": file_type,
            "error": str(e),
        }


def make_qr(link: str):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(link)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img


def markdown_to_pdf_bytes(markdown_text: str) -> bytes:
    """
    Converts Markdown text to PDF bytes.

    :param markdown_text: The Markdown content as a string.
    :return: PDF file as bytes.
    """
    html_content = markdown.markdown(markdown_text, extensions=["extra", "smarty"])
    css = """
        body {
            font-family: Arial, sans-serif;
        }
    """
    pdf_io = io.BytesIO()
    HTML(string=html_content).write_pdf(pdf_io, stylesheets=[CSS(string=css)])
    return pdf_io.getvalue()


def merge_texts(texts: List[str], separator: str = "\n\n---\n\n") -> str:
    """
    Merges a list of texts into a single string using a separator.

    :param texts: A list of text strings to merge.
    :param separator: The string to use as a separator between texts (default: "\n\n---\n\n").
    :return: A single string containing all texts joined by the separator.
    """
    if not texts:
        return ""

    return separator.join(texts)


class MarkupAgent:
    def __init__(self):
        self.model = GeminiModel(
            "gemini-2.0-flash",
            provider=GoogleGLAProvider(
                api_key=str(os.getenv("GEMINI_API_KEY")),
            ),
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def generate_markup(
        self,
        merged_text: str = "",
    ) -> List[MarkupResponse]:
        """
        Uses the LLM to format the input text as markup language, without changing its content.
        The input text should contain multiple texts separated by the specified separator.

        :param merged_text: A single string containing multiple texts separated by the specified separator.
        :param separator: The separator used to split the text into multiple parts (default: "\n\n---\n\n").
        :return: A list of MarkupResponse objects, each containing formatted text.
        """

        agent = Agent(
            self.model,
            result_type=List[MarkupResponse],
            system_prompt=(
                "You are a formatter. You will receive input containing multiple text excerpts that were separated using a specific separator. Format each text as well-structured Markdown, using headings, bullet points, and code blocks where appropriate. Organize the information for maximum readability. IMPORTANT: Do NOT change any content, do NOT add any new content, and do NOT delete any existing content. Preserve all original information exactly as provided - only format it using Markdown syntax."
                "\n\nYou MUST return a list of objects. Each object MUST have a 'markup' field containing the formatted text."
                "\n\nCRITICAL REQUIREMENT: You MUST return EXACTLY the same number of objects as input texts, in the same order."
                "\n\nExample format for 3 input texts:"
                "\n[{'markup': 'formatted text 1'}, {'markup': 'formatted text 2'}, {'markup': 'formatted text 3'}]"
            ),
        )

        try:
            response = await agent.run(merged_text)
            return response.output

        except Exception as e:
            return f"Error: {e}"


class ResumeVerifierAgent:
    def __init__(self):
        self.model = GeminiModel(
            "gemini-2.0-flash",
            provider=GoogleGLAProvider(
                api_key=str(os.getenv("GEMINI_API_KEY")),
            ),
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def verify_resume(self, resume) -> schemas.ResumeVerifierResponse:
        try:

            # Handle the resume content
            resume_content = ""
            with io.BytesIO(resume) as pdf_file:
                try:
                    # Try to read as PDF
                    pdf_reader = PdfReader(pdf_file)

                    for i, page in enumerate(pdf_reader.pages):
                        page_text = page.extract_text()
                        resume_content += page_text or ""

                except Exception as e:
                    # If PDF reading fails, try OCR
                    pdf_file.seek(0)  # Reset file pointer

                    result = process_single_image_tesseract(
                        resume, "resume.jpg", len(resume), "application/octet-stream"
                    )
                    resume_content = result.get("extracted_text", "")
                    if result.get("error"):
                        print(f"OCR error: {result.get('error')}")

        except Exception as e:
            print(f"Global error in verify_resume: {str(e)}")
            import traceback

            traceback.print_exc()
            return schemas.ResumeVerifierResponse(
                veridication_status=False,
                confidence=0,
                message=f"Error processing resume: {str(e)}",
            )

        # If no content extracted, return error
        if not resume_content or len(resume_content.strip()) < 10:
            return schemas.ResumeVerifierResponse(
                veridication_status=False,
                confidence=0,
                message="Could not extract text from the resume",
            )

        agent = Agent(
            self.model,
            result_type=schemas.ResumeVerifierResponse,
            system_prompt=(
                "You are a resume checker who is tasked with verifying the resume of doctors. "
                "You must return True in the veridication_status field if the resume appears to be from a medical doctor, "
                "or False if it does not appear to be from a medical doctor. "
                "Look for medical degrees (MD, MBBS, DO), medical specializations, hospital experience, "
                "clinical rotations, medical licenses, and other indicators of medical training. "
                "You must also return a confidence score (0-100) indicating how confident you are in your assessment. "
                "In the message field, provide a brief explanation of your decision."
            ),
        )

        try:
            response = await agent.run(
                f"Verify if the following resume belongs to a medical doctor:\n\n{resume_content}"
            )
            return response.output

        except Exception as e:
            import traceback

            traceback.print_exc()
            return schemas.ResumeVerifierResponse(
                veridication_status=False,
                confidence=0,
                message=f"Error analyzing resume: {str(e)}",
            )

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

    async def generate_text_from_images(self, images: List[bytes]):
        agent = Agent(
            model=self.model,
            output_type=List[OcrResponseGemini],
            headers=self.headers,
            system_prompt=(
                'You are an OCR (Optical Character Recognition) agent. You may receive one or more images. '
                'For each image, extract the text and format it into markup format. '
                'Also provide a confidence level (between 0.0 and 1.0) indicating how confident you are in the accuracy of the extracted text for each image. '
                'A confidence of 1.0 means you are completely certain, while 0.0 means completely uncertain. '
                'Return a list of objects, one for each image, each with fields: content (the extracted text as markup) and confidence (the confidence score).'
            )
        )

        binaryimages = [
            BinaryContent(data=image, media_type='image/png') for image in images
        ]
        result = await agent.run(
            [
                'Extract the text from each image and format it into markup format. Provide a confidence level for each extraction. Return a list of objects, one per image.',
                *binaryimages
            ]
        )
        return result.output