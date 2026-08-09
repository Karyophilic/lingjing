from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL, EMBEDDING_MODEL
import json

client = OpenAI(api_key=OPENAI_API_KEY)

# ============================================
# AI 自动打标
# ============================================
TAGGING_PROMPT = """你是一个灵感分类专家。用户记录了一条灵感，请完成以下任务：

1. 为灵感生成 3-5 个标签，标签应简洁（2-4字），涵盖灵感的主题领域
2. 为灵感写一句中文摘要（不超过30字），概括核心想法

灵感标题：{title}
灵感内容：{content}

请返回 JSON 格式（不要包含其他内容）：
{{"tags": ["标签1", "标签2", "标签3"], "summary": "一句摘要"}}"""


async def auto_tag_inspiration(title: str, content: str) -> dict:
    """为灵感自动生成标签和摘要"""
    prompt = TAGGING_PROMPT.format(title=title, content=content or title)

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=200,
    )

    result_text = response.choices[0].message.content.strip()
    # 清理可能的 markdown 代码块
    if result_text.startswith("```"):
        result_text = result_text.split("```")[1]
        if result_text.startswith("json"):
            result_text = result_text[4:]

    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {"tags": ["灵感"], "summary": title}


# ============================================
# 灵感嵌入向量
# ============================================
async def generate_embedding(text: str) -> list[float]:
    """生成文本的嵌入向量"""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text[:8000],  # 限制长度
    )
    return response.data[0].embedding


# ============================================
# AI 遗忘唤醒
# ============================================
WAKEUP_PROMPT = """用户之前记录了一条灵感，已经过去了几天。请生成一句温馨的提醒，帮助用户回忆起这个想法。

灵感内容：
标题：{title}
内容：{content}
标签：{tags}

要求：
- 语气温暖、有趣，不官方
- 一句话即可，不超过50字
- 可以稍微激发用户继续深挖这个想法的兴趣

直接返回提醒文字，不要加引号。"""


async def generate_wakeup_message(inspiration: dict) -> str:
    """生成遗忘唤醒提醒消息"""
    prompt = WAKEUP_PROMPT.format(
        title=inspiration.get("title", ""),
        content=inspiration.get("content", ""),
        tags=", ".join(inspiration.get("tags", [])),
    )

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=100,
    )

    return response.choices[0].message.content.strip().strip('"')


# ============================================
# AI 灵感关联
# ============================================
RELATED_PROMPT = """用户有两条不同时间记录的灵感，请判断它们之间是否有关联，并生成一句关联说明。

灵感A（较新）：
标题：{title_a}
内容：{content_a}
标签：{tags_a}

灵感B（较早）：
标题：{title_b}
内容：{content_b}
标签：{tags_b}

如果有关联（主题相同、思路互补、一脉相承等），返回：
{{"related": true, "connection": "一句关联说明（不超过40字）"}}

如果无关联，返回：
{{"related": false, "connection": ""}}

直接返回 JSON："""


async def find_related_inspirations(new_inspiration: dict, old_inspirations: list[dict]) -> list[dict]:
    """为新灵感查找关联的历史灵感"""
    results = []
    for old in old_inspirations[:5]:  # 最多检查最近5条
        prompt = RELATED_PROMPT.format(
            title_a=new_inspiration.get("title", ""),
            content_a=new_inspiration.get("content", ""),
            tags_a=", ".join(new_inspiration.get("tags", [])),
            title_b=old.get("title", ""),
            content_b=old.get("content", ""),
            tags_b=", ".join(old.get("tags", [])),
        )

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=100,
        )

        result_text = response.choices[0].message.content.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]

        try:
            result = json.loads(result_text)
            if result.get("related"):
                results.append({
                    "inspiration_id": str(old.get("id")),
                    "title": old.get("title"),
                    "connection": result.get("connection"),
                })
        except json.JSONDecodeError:
            continue

    return results
