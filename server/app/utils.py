from typing import List
from passlib.context import CryptContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.agent import Agent
from pydantic_ai.providers.google_gla import GoogleGLAProvider
import os
import qrcode
import asyncio
import io
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import markdown
from weasyprint import HTML, CSS
import pytesseract
import cv2

load_dotenv()

if __name__ == "__main__":
    from schemas import MarkupResponse
else:
    from .schemas import MarkupResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash(password: str):
    return pwd_context.hash(password)


def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

    
def process_single_image_tesseract(image_data: bytes, filename: str, file_size: int, file_type: str) -> dict:
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
            scale_factor = min(2000/width, 2000/height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Apply threshold for better text contrast
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Convert back to PIL Image for pytesseract
        pil_image = Image.fromarray(thresh)
        
        # Use pytesseract with optimized configuration
        extracted_text = pytesseract.image_to_string(
            pil_image,
            config='--psm 6 --oem 3'  # Page segmentation mode 6, OCR Engine Mode 3
        )
        
        return {
            'success': True,
            'extracted_text': extracted_text.strip(),
            'filename': filename,
            'file_size': file_size,
            'file_type': file_type,
            'error': None
        }
        
    except Exception as e:
        return {
            'success': False,
            'extracted_text': None,
            'filename': filename,
            'file_size': file_size,
            'file_type': file_type,
            'error': str(e)
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


class MarkupAgent():
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

class SummaryGenerationAgent():
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

    async def generate_summary(self, raw_input: str) -> str:
        """
        Generates a concise summary of medical document text.
        
        This function is designed for PHC (Primary Health Care) applications and optimized 
        for medical terminology and context. It extracts key medical information while 
        preserving important clinical details.
        
        Args:
            raw_input (str): The raw text from a medical document
            
        Returns:
            str: A concise, structured summary of the medical document
        """
        
        agent = Agent(
            self.model,
            result_type=str,
            system_prompt=(
                "You are a medical summarization expert. Analyze the provided medical document and create a clear, "
                "concise summary that preserves all critical medical information. Your response MUST be formatted "
                "in valid Markdown following this EXACT structure:\n\n"
                
                "```markdown\n"
                "# Medical Summary\n\n"
                
                "## Patient Information\n"
                "[Age, gender, name if provided, MRN/ID if present]\n\n"
                
                "## Vital Signs\n"
                "[BP, pulse, temperature, respiratory rate, SpO2, height, weight, BMI if present]\n\n"
                
                "## Chief Complaint\n"
                "[Primary reason for visit/admission]\n\n"
                
                "## History of Present Illness\n"
                "[Brief, focused narrative of the current medical issue]\n\n"
                
                "## Past Medical History\n"
                "[Bulleted list of relevant medical conditions]\n\n"
                
                "## Medications\n"
                "[Bulleted list with dosages, frequency, and route when available]\n\n"
                
                "## Allergies\n"
                "[Bulleted list with reactions if specified]\n\n"
                
                "## Physical Examination\n"
                "[Key findings organized by body system]\n\n"
                
                "## Assessment/Diagnosis\n"
                "[Bulleted list of diagnoses with ICD codes if present]\n\n"
                
                "## Plan\n"
                "[Bulleted treatment plan, follow-up instructions, referrals]\n\n"
                
                "## Lab Results\n"
                "[Key laboratory findings in a concise format]\n\n"
                
                "## Imaging/Procedures\n"
                "[Summary of relevant imaging or procedure results]\n\n"
                "```\n\n"
                
                "IMPORTANT INSTRUCTIONS:\n"
                "1. Only include sections that have information in the original document\n"
                "2. Use exactly the section headings provided above (level 2 headings)\n"
                "3. If information for a section is not available, omit that entire section\n"
                "4. Do not add any explanatory text, notes, or disclaimers outside this format\n"
                "5. Do not add any text like 'Not provided' or 'None' - simply omit those sections\n"
                "6. Preserve exact medication names, dosages, lab values, and measurements\n"
                "7. Use proper Markdown formatting: headers with #, bullet points with *, emphasis with ** when appropriate\n"
                "8. Tables should use proper Markdown table syntax for lab results if appropriate\n"
                "9. Your response must ONLY contain this Markdown content and nothing else\n"
                "10. Be approximately 15-25% of the original text length\n\n"
                
                "Your summary must be accurate, clinically relevant, and suitable for healthcare professionals. "
                "DO NOT add any information not present in the original text. DO NOT include any personal opinions or recommendations "
                "beyond what is explicitly stated in the source document."
            )
        )

        try:
            response = await agent.run(raw_input)
            return response.output

        except Exception as e:
            return f"Error: {e}"


    
if __name__ == "__main__":

    async def main():
        agent = MarkupAgent()
        # Define sample texts
        sample_texts = [
            """
            Anirudh Kashyap +91 6366201598 anirudhkashyap321@gmailcom github com /dynamite-123 linkedin EDUCATION JSS Science and Technology University, Mysore CGPA: 9.2/10 Bachelor of Engineering in Computer Science Oct 2023 present PROJECT EXPERIENCE Smart Stock - Feb 2025 PES University Built with a team of four and shortlisted in the top 10 at a hackathon Led backend development using Django REST Framework for a web app providing stock insights, recommendations, and sentiment analysis Frontend built with React: GitHub: https:L Lgithub com [dvnamite-L23 /NextGen 2 Raytracing in € - March 2025 Built a program in C to demonstrate raytracing using the SDL library: GitHub: https:L Lgithub com /dynamite-L23 [Ravtracing CRM Webapp Dec 2024 Built a customer relationship management app using Django framework GitHub: https LLgithubcomLdynamite-L23 /diango-crm API for CRUD operations Sep 2024 Built a simple RESTful API using FastAPI to handle CRUD (create, read; update, delete) operations GitHub: https:L Lgithub com /dynamite-123 [Social_Media App
            """,

            """
            JAkash Savanur +6581732147 | akash013@e.ntu.edu.sg linkedin com/in/akash-savanur EDUCATION Nanyang Technological University, Singapore CGPA: 4.84/5.00 Bachelor of Engineering in Computer Science, Second Major in Business 2023 _ July 2027 Relevant Coursework Data Structures and Algorithms, Data Science and Artificial Intelligence, Digital Logic, Financial Management ExPERIENCE Full Stack Development Intern June 2024 _ July 2024 DoozieSoft Bangalore, India Engineered a full-fledged temple management website the PERN stack (PostgreSQL, Express_ React; Node js). Designed and deploved 15+ microservices, reducing API response times by 40%,and handled over 2000 user registrations and 500+ payments through Razorpay with a 98% success rate  Integrated WhatsApp APIs for OTP generation and notifications, enhancing user authentication and engagement; along with automated audit logs and receipt generation for secure transactions Managed the deployment process on AWS services, ensuring high scalability and reliability ofthe application, and maintained robust version control using GitHub. Registered over 2000 users within the beta phase, facilitated by efficient event booking and donation management features, contributing to high user satisfaction and engagement: Phishing Email Detection using Machine Learning 2024 May 2024 Nanyang Technological University Singapore Designed a Machine Learning solution to accurately classify and detect phishing emails, providing practical insights to prevent individuals from victim to phishing attacks in real-world scenarios_ Utilised Logistic Regression, Random Forest; GRU Neural Network and SVM machine learning models Best-F performing model had an Fl-score of 0.97. The findings of this project have practical implications in real-world scenarios, where individuals can use the developed model to identify and avoid phishing emails, thereby reducing the risk of victim to cyber attacks. Aug using Apr falling falling
            """,

            """
            To exit full screen; press and hold Esc vinyas bharadwaj 8310055407 vinyasbharadwaj101@gmail com Mysore, Karnataka Profile Im always looking to connect with others who inspire me to be my best: have a strong passion for backend and API development, and I've gained experience with FastAPI , Django, other backend technologies_ Im also skilled in using API tools like Postman to test and refine my work. Im eager to keep learning and expanding my skills in these areas  and Im excited to explore new technologies that can help me grow and contribute to my work. Skills Django Backend Developer; Python Programming; API Development with FastAPI, Web Development Fundamentals Communication skills Education JSS Science And Technology University Ist semester: 9.63 GPA Excel Public School Shortlisted among the top 50 teams across India in the Atal  Innovation Marathon (AIM): developed an innovative design for a vertical axis wind turbine to surmount the inherent limitations of  conventional wind energy harvesting technologies_ Projects Customer Relationship Management (CRM) System Developed a CRM system with Django, featuring authentication mechanisms and a user-friendly, interactive Ul. Secure user authentication, dynamic and responsive interface for seamless user interaction: RESTful API for CRUD Operations Designed and implemented a RESTful API using FastAPI , capable of handling all CRUD (Create, Read, Update, Delete) operations_ The API is optimized for performance and scalability, full CRUD functionality, fast and lightweight, with asynchronous capabilities. Well-documented endpoints_ Accomplishments JEE Mains: 98.729 percentile KCET: ranked 135th in my state and We
            """
        ]
        
        # Merge the texts into a single string with the separator
        separator = "\n\n---\n\n"
        merged_text = merge_texts(sample_texts, separator)
        
        print("Input merged text length:", len(merged_text))

        response = await agent.generate_markup(merged_text)
        print("\nFormatted output (type={}):\n".format(type(response)))
        print(f"Number of records: {len(response)}")
        for i, record in enumerate(response):
            print(f"\nRecord {i+1}:\n{record.markup}")
        
        # Write the first formatted output to test.md
        output_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(output_dir, "test.md")
        if response:
            with open(output_path, "w") as f:
                f.write(response[0].markup)

    asyncio.run(main())

