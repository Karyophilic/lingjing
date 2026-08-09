from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============================================
# 用户相关
# ============================================
class UserRegister(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    username: str = Field(..., min_length=2, max_length=50)


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: UUID
    username: str
    avatar_url: Optional[str] = None
    bio: str = ""
    created_at: datetime


class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=2, max_length=50)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


# ============================================
# 灵感相关
# ============================================
class InspirationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(default="")
    content_type: str = Field(default="text")
    image_url: Optional[str] = None
    is_public: bool = False
    is_pinned: bool = False


class InspirationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    is_public: Optional[bool] = None
    is_pinned: Optional[bool] = None


class InspirationOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    content: str
    content_type: str
    image_url: Optional[str] = None
    tags: List[str] = []
    is_public: bool
    is_pinned: bool
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    username: Optional[str] = None  # 联表查询
    like_count: int = 0
    comment_count: int = 0


class InspirationSearch(BaseModel):
    query: str
    limit: int = Field(default=20, ge=1, le=50)


# ============================================
# 评论相关
# ============================================
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentOut(BaseModel):
    id: UUID
    user_id: UUID
    inspiration_id: UUID
    content: str
    created_at: datetime
    username: Optional[str] = None


# ============================================
# 通用响应
# ============================================
class APIResponse(BaseModel):
    success: bool = True
    message: str = ""
    data: Optional[dict] = None
