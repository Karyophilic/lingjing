from fastapi import APIRouter, HTTPException, BackgroundTasks
from database import supabase
from schemas import (
    InspirationCreate, InspirationUpdate, InspirationOut,
    CommentCreate, CommentOut, APIResponse,
)
from services.ai_service import auto_tag_inspiration, generate_embedding, find_related_inspirations
from config import WAKEUP_DELAY_HOURS
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/inspirations", tags=["灵感"])


def _to_inspiration_out(row: dict) -> dict:
    """将数据库行转为标准输出格式"""
    return {
        "id": row.get("id"),
        "user_id": row.get("user_id"),
        "title": row.get("title"),
        "content": row.get("content", ""),
        "content_type": row.get("content_type", "text"),
        "image_url": row.get("image_url"),
        "tags": row.get("tags", []),
        "is_public": row.get("is_public", False),
        "is_pinned": row.get("is_pinned", False),
        "ai_summary": row.get("ai_summary"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
        "username": row.get("username", ""),
        "like_count": row.get("like_count", 0),
        "comment_count": row.get("comment_count", 0),
    }


async def _enrich_inspirations(inspirations: list[dict]) -> list[dict]:
    """为灵感列表补充用户信息和互动计数"""
    result = []
    for ins in inspirations:
        item = _to_inspiration_out(ins)

        # 获取用户名
        profile_r = supabase.table("profiles") \
            .select("username") \
            .eq("id", ins["user_id"]) \
            .single().execute()
        item["username"] = profile_r.data.get("username") if profile_r.data else ""

        # 点赞数
        likes_r = supabase.table("inspiration_likes") \
            .select("id", count="exact") \
            .eq("inspiration_id", ins["id"]).execute()
        item["like_count"] = likes_r.count or 0

        # 评论数
        comments_r = supabase.table("comments") \
            .select("id", count="exact") \
            .eq("inspiration_id", ins["id"]).execute()
        item["comment_count"] = comments_r.count or 0

        result.append(item)
    return result


@router.post("", response_model=APIResponse)
async def create_inspiration(data: InspirationCreate, background_tasks: BackgroundTasks):
    """创建灵感 — 自动触发 AI 打标 + 嵌入向量生成 + 遗忘唤醒计划"""
    # 1. AI 自动打标
    ai_result = await auto_tag_inspiration(data.title, data.content)
    tags = ai_result.get("tags", ["灵感"])
    ai_summary = ai_result.get("summary", data.title)

    # 2. 生成嵌入向量
    embedding = await generate_embedding(f"{data.title} {data.content}")

    # 3. 写入灵感
    r = supabase.table("inspirations").insert({
        "user_id": data.user_id if hasattr(data, "user_id") else None,
        "title": data.title,
        "content": data.content,
        "content_type": data.content_type,
        "image_url": data.image_url,
        "tags": tags,
        "is_public": data.is_public,
        "is_pinned": data.is_pinned,
        "ai_summary": ai_summary,
    }).execute()

    inspiration = r.data[0] if r.data else None
    if not inspiration:
        raise HTTPException(status_code=500, detail="创建失败")

    # 4. 存储嵌入向量 (后台)
    background_tasks.add_task(
        _store_embedding, inspiration["id"], embedding
    )

    # 5. 创建遗忘唤醒提醒 (72小时后)
    remind_at = datetime.now(timezone.utc) + timedelta(hours=WAKEUP_DELAY_HOURS)
    supabase.table("wakeup_reminders").insert({
        "user_id": inspiration["user_id"],
        "inspiration_id": inspiration["id"],
        "remind_at": remind_at.isoformat(),
    }).execute()

    # 6. AI 关联检测 (后台) - P1
    background_tasks.add_task(
        _check_related, inspiration
    )

    return APIResponse(
        message="灵感已记录",
        data={
            "inspiration": _to_inspiration_out(inspiration),
            "tags": tags,
            "ai_summary": ai_summary,
        },
    )


async def _store_embedding(inspiration_id: str, embedding: list[float]):
    """存储嵌入向量"""
    try:
        supabase.table("inspiration_embeddings").upsert({
            "inspiration_id": inspiration_id,
            "embedding": embedding,
        }).execute()
    except Exception:
        pass  # 嵌入存储失败不影响主流程


async def _check_related(inspiration: dict):
    """检查是否与历史灵感有关联"""
    try:
        old_r = supabase.table("inspirations") \
            .select("id,title,content,tags") \
            .eq("user_id", inspiration["user_id"]) \
            .neq("id", inspiration["id"]) \
            .order("created_at", desc=True) \
            .limit(5).execute()

        if old_r.data:
            related = await find_related_inspirations(inspiration, old_r.data)
            # 关联结果可通过通知推送，这里先不做落库
    except Exception:
        pass


@router.get("/my", response_model=APIResponse)
async def list_my_inspirations(user_id: str, page: int = 1, limit: int = 20):
    """获取我的灵感列表"""
    offset = (page - 1) * limit
    r = supabase.table("inspirations") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("is_pinned", desc=True) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    items = await _enrich_inspirations(r.data or [])
    return APIResponse(data={"items": items, "page": page, "limit": limit})


@router.get("/detail/{inspiration_id}", response_model=APIResponse)
async def get_inspiration(inspiration_id: str):
    """获取灵感详情"""
    r = supabase.table("inspirations").select("*").eq("id", inspiration_id).single().execute()
    if not r.data:
        raise HTTPException(status_code=404, detail="灵感不存在")

    items = await _enrich_inspirations([r.data])
    return APIResponse(data=items[0])


@router.put("/{inspiration_id}", response_model=APIResponse)
async def update_inspiration(inspiration_id: str, data: InspirationUpdate):
    """更新灵感"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        supabase.table("inspirations").update(update_data).eq("id", inspiration_id).execute()

    r = supabase.table("inspirations").select("*").eq("id", inspiration_id).single().execute()
    items = await _enrich_inspirations([r.data])
    return APIResponse(message="灵感已更新", data=items[0])


@router.delete("/{inspiration_id}", response_model=APIResponse)
async def delete_inspiration(inspiration_id: str):
    """删除灵感"""
    supabase.table("inspirations").delete().eq("id", inspiration_id).execute()
    return APIResponse(message="灵感已删除")


@router.get("/square", response_model=APIResponse)
async def inspiration_square(tag: str = None, page: int = 1, limit: int = 20):
    """灵感广场 — 浏览公开灵感"""
    offset = (page - 1) * limit
    query = supabase.table("inspirations") \
        .select("*") \
        .eq("is_public", True) \
        .order("created_at", desc=True)

    if tag:
        query = query.contains("tags", [tag])

    r = query.range(offset, offset + limit - 1).execute()
    items = await _enrich_inspirations(r.data or [])
    return APIResponse(data={"items": items, "page": page, "limit": limit})


@router.post("/search", response_model=APIResponse)
async def search_inspirations(query: str, limit: int = 20):
    """语义搜索公开灵感 (使用向量)"""
    # 生成查询向量
    query_embedding = await generate_embedding(query)

    # 调用 pgvector 函数搜索
    r = supabase.rpc("search_similar_inspirations", {
        "query_embedding": query_embedding,
        "match_count": limit,
    }).execute()

    if not r.data:
        return APIResponse(data={"items": []})

    inspiration_ids = [item["inspiration_id"] for item in r.data]

    # 获取完整灵感数据
    items_r = supabase.table("inspirations") \
        .select("*") \
        .in_("id", inspiration_ids) \
        .eq("is_public", True) \
        .execute()

    items = await _enrich_inspirations(items_r.data or [])
    return APIResponse(data={"items": items})


# ============================================
# 互动：点赞 & 评论
# ============================================
@router.post("/{inspiration_id}/like", response_model=APIResponse)
async def like_inspiration(inspiration_id: str, user_id: str):
    """点赞/取消点赞"""
    existing = supabase.table("inspiration_likes") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("inspiration_id", inspiration_id) \
        .execute()

    if existing.data:
        supabase.table("inspiration_likes") \
            .delete() \
            .eq("user_id", user_id) \
            .eq("inspiration_id", inspiration_id) \
            .execute()
        return APIResponse(message="已取消点赞")
    else:
        supabase.table("inspiration_likes").insert({
            "user_id": user_id,
            "inspiration_id": inspiration_id,
        }).execute()
        return APIResponse(message="已点赞")


@router.get("/{inspiration_id}/comments", response_model=APIResponse)
async def list_comments(inspiration_id: str):
    """获取灵感评论列表"""
    r = supabase.from_("comments") \
        .select("*, profiles!inner(username)") \
        .eq("inspiration_id", inspiration_id) \
        .order("created_at", desc=True) \
        .execute()

    comments = []
    for c in r.data or []:
        comments.append({
            "id": c.get("id"),
            "user_id": c.get("user_id"),
            "inspiration_id": c.get("inspiration_id"),
            "content": c.get("content"),
            "created_at": c.get("created_at"),
            "username": c.get("profiles", {}).get("username") if c.get("profiles") else "",
        })

    return APIResponse(data={"items": comments})


@router.post("/{inspiration_id}/comments", response_model=APIResponse)
async def create_comment(inspiration_id: str, user_id: str, data: CommentCreate):
    """发表评论"""
    r = supabase.table("comments").insert({
        "user_id": user_id,
        "inspiration_id": inspiration_id,
        "content": data.content,
    }).execute()

    return APIResponse(message="评论已发布", data=r.data[0] if r.data else {})
