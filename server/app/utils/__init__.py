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
from pypdf import PdfReader
from app import schemas

load_dotenv()

# Configure pytesseract with explicit path for deployment environments
if os.environ.get("DYNO"):  # Check if running on Heroku
    pytesseract.pytesseract.tesseract_cmd = "/app/.apt/usr/bin/tesseract"
    os.environ["TESSDATA_PREFIX"] = "/app/.apt/usr/share/tesseract-ocr/5/tessdata"

if __name__ == "__main__":
    from schemas import MarkupResponse, OcrResponseGemini
else:
    from app.schemas import MarkupResponse, OcrResponseGemini

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash(password: str):
    return pwd_context.hash(password)


def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)



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

                    result = process_single_image_tesseract( #type: ignore
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
            "gemini-2.0-flash",
            provider=GoogleGLAProvider(
                api_key=str(os.getenv("GEMINI_API_KEY")),
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
                'You are an OCR agent that extracts text from images and formats it for react-markdown rendering. '
                'Your output MUST be 100% valid react-markdown compatible syntax. '
                
                'TEXT EXTRACTION RULES: '
                '1. Analyze the entire image carefully, including handwritten text '
                '2. For unclear handwriting, use context clues or mark as [unclear] '
                '3. Organize content logically with proper markdown structure '
                '4. Group related information under appropriate headings '
                
                'REACT-MARKDOWN FORMATTING REQUIREMENTS: '
                '- Headers: # ## ### (with space after #) '
                '- Bold: **text** (no spaces inside asterisks) '
                '- Italic: *text* (no spaces inside asterisks) '
                '- Lists: Use - or * with space after, or 1. 2. 3. for numbered '
                '- Code: `inline code` or ```language\\ncode block\\n``` '
                '- Blockquotes: > text (for handwritten notes) '
                '- Tables: | Header | Header |\\n|--------|--------|\\n| Cell | Cell | '
                '- Line breaks: Use double newlines for paragraphs '
                '- Horizontal rules: --- (on its own line) '
                
                'REACT-MARKDOWN COMPATIBILITY: '
                '- NO HTML tags (use markdown syntax only) '
                '- NO unclosed markdown syntax '
                '- NO trailing spaces in headers '
                '- NO malformed table syntax '
                '- Escape special characters: \\*, \\_, \\#, \\`, \\| when not formatting '
                '- Use proper newlines between sections '
                
                'STRUCTURE TEMPLATE: '
                '```markdown '
                '# Document Title '
                '## Section Name '
                '- **Field:** Value '
                '- **Field:** Value '
                '> *Handwritten note or annotation* '
                '## Additional Notes '
                '- Note 1 '
                '- Note 2 '
                '``` '
                
                'Return confidence score: 0.9+ for clear text, 0.7+ for mixed, 0.5+ for difficult handwriting. '
                'CRITICAL: Test your markdown output mentally - it must render perfectly in react-markdown.'
            )
        )

        binaryimages = [
            BinaryContent(data=image, media_type='image/png') for image in images
        ]
        result = await agent.run(
            [
                'Extract text from each image and format it into VALID MARKDOWN. '
                'SPECIAL ATTENTION: If the image contains handwritten text or random layout, '
                'carefully analyze the entire image, use context clues for unclear writing, '
                'and organize the content logically with proper markdown structure. '
                'Group related information together even if scattered in the image. '
                'Provide confidence level based on text clarity and layout complexity.',
                *binaryimages
            ]
        )
        return result.output