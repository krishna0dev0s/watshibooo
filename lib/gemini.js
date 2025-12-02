// Lightweight wrapper around @google/generative-ai using the GoogleGenerativeAI
// helper. This aligns with the other code in the repo which instantiates
// GoogleGenerativeAI and calls getGenerativeModel(...).
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateSolutionWithGemini(problemNumber, promptDescription = "", language = 'JavaScript') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Strong, explicit prompt with an example JSON so the model must return
    // structured, problem-specific output. We include the problemNumber in the
    // instructions and show a complete example to reduce generic/fallback answers.
    const example = {
      title: "Two Sum",
      difficulty: "Easy",
      topics: ["Array", "Hash Table"],
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      approach: "Use a hash map to store seen numbers and their indices. For each number, check if target - num exists in map.",
      steps: [
        "Create an empty map",
        "Iterate through array with index i",
        "If target - nums[i] exists in map, return [map[target-nums[i]], i]",
        "Otherwise set map[nums[i]] = i"
      ],
      code: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const need = target - nums[i]; if (map.has(need)) return [map.get(need), i]; map.set(nums[i], i); } }",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }]
    };

    const prompt = `You are an expert algorithm engineer. Generate a structured, specific LeetCode-style solution for problem #${problemNumber}.` +
      ` IMPORTANT: Output ONLY valid JSON (no additional text). The JSON schema MUST match the example exactly and include these keys: title (string), difficulty (string), topics (array), description (string), approach (string), steps (array of strings), code (string), timeComplexity (string), spaceComplexity (string), examples (array of {input, output}).` +
      ` Use the problem number to produce a unique solution tailored to that problem. If you don't know the exact LeetCode statement, infer a reasonable, specific problem for id ${problemNumber} and create a correct algorithmic solution for it.` +
      ` IMPORTANT: Provide the solution code in ${language}. The returned JSON must include codeLanguage set to the chosen language and the code field must be a single string containing the source (no markdown fences).` +
      ` Example output (JSON): ${JSON.stringify(example)}.` +
      (promptDescription ? ` Extra context: ${promptDescription}` : "");

  try {
    const result = await model.generateContent(prompt, { temperature: 0.1, maxOutputTokens: 1024 });
    const text = result?.response?.text ? result.response.text() : (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");

    // Try to extract JSON: either fenced or raw object
    let jsonMatch = null;
    if (text) {
      const fenceMatch = text.match(/```(?:json)?([\s\S]*?)```/i);
      if (fenceMatch) jsonMatch = fenceMatch[1].trim();
      else {
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) jsonMatch = objMatch[0];
      }
    }

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch);
        // Ensure codeLanguage is set
        if (!parsed.codeLanguage) parsed.codeLanguage = language;
        return parsed;
      } catch (e) {
        // continue to fallback
      }
    }

    return {
      title: `LeetCode problem ${problemNumber} (generated)`,
      difficulty: "Medium",
      topics: [],
      description: promptDescription || text || "No description available.",
      approach: "AI returned unstructured text; see code or description.",
      steps: [text || "No steps available."],
      code: `// AI produced response could not be parsed as JSON; inspect response (requested ${language})`,
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      examples: [],
      codeLanguage: language,
    };
  } catch (err) {
    throw new Error("Gemini generation failed: " + (err?.message || err));
  }
}

const geminiExports = { generateSolutionWithGemini };
export default geminiExports;
