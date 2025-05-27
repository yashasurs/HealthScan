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
import markdown
from weasyprint import HTML, CSS

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


class GeminiAgent():
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
            separator: str = "\n\n---\n\n"
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
        
        # Passing the input as a positional argument as the first parameter
        response = await agent.run(merged_text)
        
        return response.output


    
if __name__ == "__main__":

    async def main():
        agent = GeminiAgent()
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