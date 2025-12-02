"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Code, FileJson, Zap, FileCode, Coffee, Hash } from "lucide-react";

export default function LeetCodeSolver() {
	const [problem, setProblem] = useState("");
	const [language, setLanguage] = useState("JavaScript");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const submit = async (e) => {
		e?.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);
		try {
			const res = await fetch("/api/leetcode", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ problemNumber: problem, language }),
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || "Server error");
			setResult(json.data);
		} catch (err) {
			setError(String(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto">
			<div className="mb-12">
				<h1 className="text-5xl font-extrabold mb-3 tracking-tight">LeetCode Solver</h1>
				<p className="text-lg text-muted-foreground">Get AI-powered solutions for LeetCode problems with detailed explanations and code examples.</p>
			</div>

			<div className="border border-white/10 rounded-xl overflow-hidden">
				<div className="bg-gradient-to-r from-white/5 to-transparent p-8">
					<form onSubmit={submit} className="flex flex-col gap-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-semibold mb-3 tracking-wide">Problem Number</label>
								<Input
									id="problemNumber"
									type="number"
									value={problem}
									onChange={(e) => setProblem(e.target.value)}
									placeholder="e.g. 1, 2, 217..."
									className="border-white/20 h-11 rounded-lg focus:border-white/40 transition-colors w-full"
									required
								/>
								<p className="text-xs text-muted-foreground mt-2">Enter the LeetCode problem number</p>
							</div>

							<div>
								<label className="block text-sm font-semibold mb-3 tracking-wide">Programming Language</label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="w-full justify-between h-11">
											<span>{language}</span>
											<ChevronDown className="h-4 w-4 ml-2" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-[240px]">
										<DropdownMenuItem onClick={() => setLanguage("JavaScript")} className="flex items-center gap-2">
											<Code className="h-4 w-4" />
											<span>JavaScript</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setLanguage("TypeScript")} className="flex items-center gap-2">
											<FileJson className="h-4 w-4" />
											<span>TypeScript</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setLanguage("Python")} className="flex items-center gap-2">
											<Zap className="h-4 w-4" />
											<span>Python</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setLanguage("Java")} className="flex items-center gap-2">
											<Coffee className="h-4 w-4" />
											<span>Java</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setLanguage("c++")} className="flex items-center gap-2">
											<Hash className="h-4 w-4" />
											<span>C++</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setLanguage("C#")} className="flex items-center gap-2">
											<Hash className="h-4 w-4" />
											<span>C#</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<p className="text-xs text-muted-foreground mt-2">Choose your preferred language</p>
							</div>
						</div>

						<Button
							type="submit"
							variant="secondary"
							size="lg"
							className="w-full sm:w-auto h-11 rounded-lg px-8 py-3 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(82,39,255,0.18)] text-white font-semibold tracking-wide"
							disabled={loading}
						>
							{loading ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Generating...
								</>
							) : (
								"Get Solution"
							)}
						</Button>
					</form>
				</div>

				{error && (
					<div className="p-6 bg-red-500/10 border-t border-white/10">
						<p className="text-red-400 font-medium">⚠️ {error}</p>
					</div>
				)}

				{result && (
					<div className="p-8 space-y-8">
						<div className="border-b border-white/10 pb-6">
							<div className="flex items-center justify-between mb-3">
								<h2 className="text-3xl font-bold tracking-tight">{result.title}</h2>
								<span className="px-4 py-2 rounded-full bg-white/10 text-sm font-semibold">
									{result.difficulty}
								</span>
							</div>
							<p className="text-muted-foreground">Problem Solution & Explanation</p>
						</div>

						{result.description && (
							<div className="rounded-lg bg-white/5 p-6 border border-white/10">
								<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
									<span className="text-xl">📝</span> Problem Description
								</h3>
								<div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.description}</div>
							</div>
						)}

						{result.approach && (
							<div className="rounded-lg bg-white/5 p-6 border border-white/10">
								<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
									<span className="text-xl">💡</span> Approach
								</h3>
								<div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.approach}</div>
							</div>
						)}

						{result.steps && Array.isArray(result.steps) && (
							<div className="rounded-lg bg-white/5 p-6 border border-white/10">
								<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
									<span className="text-xl">🎯</span> Steps
								</h3>
								<ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
									{result.steps.map((s, i) => (
										<li key={i} className="leading-relaxed">{s}</li>
									))}
								</ol>
							</div>
						)}

						<div className="rounded-lg bg-white/5 p-6 border border-white/10">
							<h3 className="text-xl font-bold mb-4 flex items-center gap-2">
								<span className="text-xl">💻</span> Code Solution
							</h3>
							<Textarea
								readOnly
								value={result.code || JSON.stringify(result, null, 2)}
								className="font-mono min-h-[300px] text-xs bg-black/40 border-white/20 rounded-lg p-4 leading-relaxed"
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
