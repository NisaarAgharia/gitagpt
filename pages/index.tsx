import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { languageType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import logo from './gita-gpt.svg';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [language, setLanguage] = useState<languageType>("Professional");
  const [generatedBios, setGeneratedBios] = useState<String>("");

  console.log("Streamed response: ", generatedBios);  
  
  const prompt =
     language === "Funny"
     ? `You are GitaGPT, Answer according to the 18 chapters and 700 verses of the Bhagavad Gita, which contains life lessons on morality, strength, discipline, and spirituality. ${bio}${
        bio.slice(-1) === "." ? "" : "."
      }`
    : `${language} Give a clear and accurate solution using numbered steps (e.g. "1." and "2."). Ensure each generated verse is between 14 and 20 words, based on Bhagavad Gita. ${bio}${
        bio.slice(-1) === "." ? "" : "."
      }`;

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedBios((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  return (
    
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Gita GPT</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <Header />
      <main className="innerbox flex flex-1 w-full flex-col items-center justify-center text-center px-4">
        <h2 className="sm:text-4xl text-xl max-w-2xl font-bold text-slate-900">
          Unlock the Power of AI with the Bhagavad Gita
        </h2>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <p className="text-left font-medium">
              What troubles you, my child?</p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "Ask to Krishna"
            }
          />

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Ask to GitaGPT &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="space-y-10 my-10">
              {generatedBios && (
                <>
                  <div>
                    <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto">
                      Bhagavad Gita says:
                    </h2>
                  </div>
                  <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                    {generatedBios
                      .substring(generatedBios.indexOf("1") + 3)
                      .split("3.")
                      .map((generatedBio) => {
                        return (
                          <div
                            className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedBio);
                              toast("Copy to Clipboard", {
                                icon: "✂️",
                              });
                            }}
                            key={generatedBio}
                          >
                            <p>{generatedBio}</p>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
        <div className="max-w-xl w-full whitespace-pre-line break-words rounded-xl bg-white p-8 ring-1 ring-slate-900/5">
        <blockquote className="mt-6 space-y-4 leading-7 text-slate-700">
            <p>Gita GPT is a revolutionary chatbot powered by OpenAI's GPT-3 that helps you find relevant verses from the Bhagavad Gita that are most suitable for you. With Gita GPT, you can gain insight and clarity into your life and decisions in an easy, interactive way.</p>
        </blockquote>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
