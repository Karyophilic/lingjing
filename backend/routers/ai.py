from fastapi import APIRouter, HTTPException
from database import supabase
from schemas import APIResponse
from services.ai_service import generate_wakeup_message, find_related_inspirations
from services.match_service import get_suggested_matches, calculate_match_score

router = APIRouter(prefix="/ai", tags=["AI智能体"])


@router.get("/wakeup/{user_id}", response_model=APIResponse)
async def get_wakeup_reminders(user_id: str):
    """获取待唤醒的灵感提醒"""
    r = supabase.table("wakeup_reminders") \
        .select("*, inspirations!inner(id, title, content, tags, created_at)") \
        .eq("user_id", user_id) \
        .eq("is_sent", False) \
        .lte("remind_at", "now()") \
        .order("remind_at", desc=True) \
        .limit(5) \
        .execute()

    if not r.data:
        return APIResponse(data={"items": [], "message": "暂时没有需要唤醒的灵感"})

    reminders = []
    for remind in r.data:
        inspiration = remind.get("inspirations", {})
        # 生成唤醒消息
        msg = await generate_wakeup_message(inspiration)

        # 标记为已发送
        supabase.table("wakeup_reminders") \
            .update({"is_sent": True}) \
            .eq("id", remind["id"]) \
            .execute()

        reminders.append({
            "reminder_id": remind["id"],
            "inspiration_id": inspiration.get("id"),
            "title": inspiration.get("title"),
            "message": msg,
            "remind_at": remind.get("remind_at"),
        })

    return APIResponse(data={"items": reminders})


@router.get("/related/{inspiration_id}", response_model=APIResponse)
async def get_related_inspirations(inspiration_id: str):
    """获取与当前灵感相关的历史灵感"""
    # 获取当前灵感
    current_r = supabase.table("inspirations") \
        .select("*") \
        .eq("id", inspiration_id) \
        .single().execute()

    if not current_r.data:
        raise HTTPException(status_code=404, detail="灵感不存在")

    current = current_r.data
    user_id = current["user_id"]

    # 获取该用户的其他灵感
    old_r = supabase.table("inspirations") \
        .select("*") \
        .eq("user_id", user_id) \
        .neq("id", inspiration_id) \
        .order("created_at", desc=True) \
        .limit(10) \
        .execute()

    if not old_r.data:
        return APIResponse(data={"items": []})

    # AI 查找关联
    related = await find_related_inspirations(current, old_r.data)

    # 补充完整灵感信息
    items = []
    for rel in related:
        insp = next((i for i in old_r.data if str(i["id"]) == rel["inspiration_id"]), None)
        if insp:
            items.append({
                "inspiration_id": insp["id"],
                "title": insp["title"],
                "connection": rel["connection"],
                "created_at": insp["created_at"],
            })

    return APIResponse(data={"items": items})


@router.get("/matches/{user_id}", response_model=APIResponse)
async def get_user_matches(user_id: str):
    """获取同频用户推荐"""
    matches = await get_suggested_matches(user_id)

    # 补充用户信息
    items = []
    for m in matches:
        profile_r = supabase.table("profiles") \
            .select("username,avatar_url,bio") \
            .eq("id", m["user_id"]) \
            .single().execute()

        items.append({
            "user_id": m["user_id"],
            "username": profile_r.data.get("username") if profile_r.data else "",
            "avatar_url": profile_r.data.get("avatar_url") if profile_r.data else None,
            "bio": profile_r.data.get("bio") if profile_r.data else "",
            "match_score": m["score"],
            "common_tags": m["common_tags"],
        })

    return APIResponse(data={"items": items})
