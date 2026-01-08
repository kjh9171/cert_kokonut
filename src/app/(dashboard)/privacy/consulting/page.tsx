"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Bot } from "lucide-react"

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function ConsultingPage() {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I am your AI Privacy Consultant. Ask me anything about GDPR, PIPA, or data security.",
            timestamp: new Date()
        }
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")

        // Simulate AI Response
        setTimeout(() => {
            const botMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: "That's an important question. Under current privacy laws, you must ensure that user consent is explicit. I recommend reviewing Article 15 of the relevant statute or consulting a legal professional for specific advice.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
        }, 1000)
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div>
                <h3 className="text-lg font-medium">Privacy Consulting AI</h3>
                <p className="text-sm text-muted-foreground">
                    Get instant answers to your compliance questions.
                </p>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 p-4">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <Avatar>
                                        <AvatarFallback>{m.role === 'user' ? <User /> : <Bot />}</AvatarFallback>
                                    </Avatar>
                                    <div className={`rounded-lg p-3 text-sm max-w-[80%] ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Ask about privacy laws..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" onClick={handleSend}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
