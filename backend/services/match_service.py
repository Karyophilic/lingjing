from database import supabase
import math


async def calculate_match_score(user_id_1: str, user_id_2: str) -> dict:
    """计算两个用户的兴趣匹配度"""
    # 获取两个用户的公开灵感标签
    r1 = supabase.table("inspirations") \
        .select("tags") \
        .eq("user_id", user_id_1) \
        .eq("is_public", True) \
        .execute()

    r2 = supabase.table("inspirations") \
        .select("tags") \
        .eq("user_id", user_id_2) \
        .eq("is_public", True) \
        .execute()

    tags1 = set()
    for item in r1.data or []:
        tags1.update(item.get("tags", []))

    tags2 = set()
    for item in r2.data or []:
        tags2.update(item.get("tags", []))

    if not tags1 or not tags2:
        return {"score": 0, "common_tags": []}

    common = list(tags1 & tags2)
    # Jaccard 相似度 + 公共标签
    jaccard = len(common) / len(tags1 | tags2) if (tags1 | tags2) else 0
    score = round(jaccard * 100, 1)

    return {"score": score, "common_tags": common}


async def get_suggested_matches(user_id: str, limit: int = 10) -> list[dict]:
    """为用户推荐同频用户"""
    # 获取所有其他用户
    r = supabase.table("profiles").select("id").neq("id", user_id).limit(100).execute()

    matches = []
    for profile in r.data or []:
        other_id = profile["id"]
        # 检查是否已匹配过
        existing = supabase.table("user_matches") \
            .select("id") \
            .or_(f"user_id_1.eq.{user_id},user_id_2.eq.{user_id}") \
            .or_(f"user_id_1.eq.{other_id},user_id_2.eq.{other_id}") \
            .execute()

        if existing.data:
            continue

        # 计算匹配分数
        result = await calculate_match_score(user_id, other_id)
        if result["score"] > 0:
            matches.append({
                "user_id": other_id,
                "score": result["score"],
                "common_tags": result["common_tags"],
            })

    # 按分数排序
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:limit]
