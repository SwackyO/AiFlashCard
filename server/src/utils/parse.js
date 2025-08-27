export function safeParseJson(text){
    if(!text) return null
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const raw = fence ? fence[1].trim() : text.trim()
    try {
        return JSON.parse(raw)
    } catch{
        return null
    }
}