from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from schemas import (
    UserRegister, UserLogin, UserProfile, ProfileUpdate, APIResponse,
)
from config import JWT_SECRET

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=APIResponse)
async def register(data: UserRegister):
    """用户注册"""
    # 使用 Supabase Auth 注册
    try:
        auth_response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"注册失败: {str(e)}")

    user_id = auth_response.user.id

    # 创建 profile
    supabase.table("profiles").insert({
        "id": user_id,
        "username": data.username,
    }).execute()

    return APIResponse(message="注册成功", data={"user_id": user_id})


@router.post("/login", response_model=APIResponse)
async def login(data: UserLogin):
    """用户登录"""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")

    return APIResponse(
        message="登录成功",
        data={
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "user_id": auth_response.user.id,
        },
    )


@router.get("/profile/{user_id}", response_model=APIResponse)
async def get_profile(user_id: str):
    """获取用户资料"""
    r = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="用户不存在")

    return APIResponse(data=r.data)


@router.put("/profile/{user_id}", response_model=APIResponse)
async def update_profile(user_id: str, data: ProfileUpdate):
    """更新用户资料"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        r = supabase.table("profiles").update(update_data).eq("id", user_id).execute()

    # 获取更新后的 profile
    r = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return APIResponse(message="资料已更新", data=r.data)
