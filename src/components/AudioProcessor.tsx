'use client'

import { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AudioProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null)

  useEffect(() => {
    let mic: Tone.UserMedia

    const setupAudio = async () => {
      await Tone.start()
      mic = new Tone.UserMedia()
      pitchShiftRef.current = new Tone.PitchShift().toDestination()

      await mic.open()
      mic.connect(pitchShiftRef.current)
    }

    setupAudio()

    return () => {
      if (mic) mic.close()
    }
  }, [])

  const voiceTypes = {
    male: [
      { pitch: 0, formant: 0, name: "通常" },
      { pitch: -2, formant: 0, name: "低め" },
      { pitch: -4, formant: -2, name: "さらに低い" },
      { pitch: 1, formant: -1, name: "少し高め" },
      { pitch: 0, formant: 2, name: "クリア" },
    ],
    female: [
      { pitch: 0, formant: 0, name: "通常" },
      { pitch: 2, formant: 1, name: "高め" },
      { pitch: 4, formant: 2, name: "さらに高い" },
      { pitch: 3, formant: 3, name: "かわいい" },
      { pitch: 5, formant: 4, name: "超かわいい" },
    ]
  }

  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [voiceType, setVoiceType] = useState(0)

  const changeGender = (value: string) => {
    setGender(value as 'male' | 'female')
    setVoiceType(0)
    if (pitchShiftRef.current) {
      pitchShiftRef.current.set(voiceTypes[value as 'male' | 'female'][0])
    }
  }

  const changeVoice = (value: string) => {
    const newType = parseInt(value)
    setVoiceType(newType)
    if (pitchShiftRef.current) {
      pitchShiftRef.current.set(voiceTypes[gender][newType])
    }
  }

  const toggleProcessing = () => {
    if (isProcessing) {
      Tone.getTransport().stop()
    } else {
      Tone.getTransport().start()
    }
    setIsProcessing(!isProcessing)
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">音声変換</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={toggleProcessing}
              variant={isProcessing ? "destructive" : "default"}
              className="w-full py-2 text-lg"
            >
              {isProcessing ? '停止' : '開始'}
            </Button>

            <Select onValueChange={changeGender} value={gender}>
              <SelectTrigger>
                <SelectValue placeholder="性別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={changeVoice} value={voiceType.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="声のタイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {voiceTypes[gender].map((voice, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-sm text-center text-muted-foreground">
              現在の声: {voiceTypes[gender][voiceType].name}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AudioProcessor
