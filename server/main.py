from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def home():
    return {"message": "hello world"}

if __name__ == "__main__":
    uvicorn.run(app)