import { NextResponse } from 'next/server';
import { ai } from '../../lib/gemini';

export async function POST(req: Request) {
  try {
    const { questions, userAnswers } = await req.json();

    if (!questions || !userAnswers) {
      return NextResponse.json({ error: 'Questions and answers are required' }, { status: 400 });
    }

    let correctCount = 0;
    const evaluatedQuestions = questions.map((q: any, idx: number) => {
      const userSelected = userAnswers[idx] || 'No Answer';
      const isCorrect = userSelected === q.answer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        userSelected,
        isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    const prompt = `You are GapFinder AI, an expert educational diagnostic system. 
Analyze the following quiz results and identify specific weak topics based on the incorrect answers.

Evaluated Quiz Questions:
${JSON.stringify(evaluatedQuestions)}

Return ONLY a valid JSON object with this exact structure:
{
  "readinessScore": ${scorePercentage},
  "weakTopics": [
    {
      "topic": "Specific weak concept name here",
      "severity": "WEAK TOPIC",
      "description": "Explanation of why the user's selected answer indicates a misunderstanding."
    }
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const textResponse = response.text || '{}';
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const evaluation = JSON.parse(cleanJson);

      return NextResponse.json({
        success: true,
        evaluation: {
          score: correctCount,
          total: questions.length,
          readinessScore: evaluation.readinessScore || scorePercentage,
          weakTopics: evaluation.weakTopics || [],
          evaluatedQuestions
        }
      });
    } catch (apiError) {
      console.warn('API quota exceeded during evaluation, using fallback telemetry assessment.');
      // Safe fallback evaluation so your hackathon presentation never breaks
      const fallbackWeakTopics = evaluatedQuestions
        .filter((q: any) => !q.isCorrect)
        .map((q: any) => ({
          topic: "Core Concept & Edge Case Review",
          severity: "WEAK TOPIC",
          description: `You selected "${q.userSelected}", but the correct answer is "${q.answer}". Review this section for deeper alignment.`
        }));

      if (fallbackWeakTopics.length === 0) {
        fallbackWeakTopics.push({
          topic: "Advanced Mastery Check",
          severity: "STRONG TOPIC",
          description: "All evaluated questions were answered correctly! Excellent comprehension."
        });
      }

      return NextResponse.json({
        success: true,
        evaluation: {
          score: correctCount,
          total: questions.length,
          readinessScore: scorePercentage,
          weakTopics: fallbackWeakTopics,
          evaluatedQuestions
        }
      });
    }
  } catch (error: any) {
    console.error('Error evaluating quiz:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}