from passlib.context import CryptContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.providers.google_gla import GoogleGLAProvider
import os, logging
import asyncio
from dotenv import load_dotenv

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


class GeminiAgent():
    def __init__(self):
        self.model = GeminiModel(
            "gemini-2.0-flash",
            provider=GoogleGLAProvider(
                api_key=os.getenv("GEMINI_API_KEY"),
            ),
        )
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
    
    async def generate_markup(
            self,
            text: str,
    ) -> MarkupResponse:
        """
        Uses the LLM to format the input text as markup language, without changing its content.
        """
        from pydantic_ai.agent import Agent
        agent = Agent(
            self.model,
            result_type=str,
            system_prompt=(
                "You are a formatter. Format the following text as well-structured Markdown, using headings, bullet points, and code blocks where appropriate. Organize the information for maximum readability, but do not invent or omit any content."
            ),
        )
        response = await agent.run(text)
        return response.data


if __name__ == "__main__":
    async def main():
        agent = GeminiAgent()
        text = """
            Anirudh Kashyap +91 6366201598 anirudhkashyap321@gmailcom github com /dynamite-123 linkedin EDUCATION JSS Science and Technology University, Mysore CGPA: 9.2/10 Bachelor of Engineering in Computer Science Oct 2023 present PROJECT EXPERIENCE Smart Stock - Feb 2025 PES University Built with a team of four and shortlisted in the top 10 at a hackathon Led backend development using Django REST Framework for a web app providing stock insights, recommendations, and sentiment analysis Frontend built with React: GitHub: https:L Lgithub com [dvnamite-L23 /NextGen 2 Raytracing in € - March 2025 Built a program in C to demonstrate raytracing using the SDL library: GitHub: https:L Lgithub com /dynamite-L23 [Ravtracing CRM Webapp Dec 2024 Built a customer relationship management app using Django framework GitHub: https LLgithubcomLdynamite-L23 /diango-crm API for CRUD operations Sep 2024 Built a simple RESTful API using FastAPI to handle CRUD (create, read; update, delete) operations GitHub: https:L Lgithub com /dynamite-123 [Social_Media App
        """
        print("Input text:\n", text)
        response = await agent.generate_markup(text)
        print("\nFormatted output (type={}):\n".format(type(response)))
        print(response)
        # Ensure the directory exists and write the formatted output to test.md
        output_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(output_dir, "test.md")
        with open(output_path, "w") as f:
            f.write(response)

    asyncio.run(main())