from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=4)
    name: str = Field(min_length=1)
    role: str = "PM"


class LoginRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str
