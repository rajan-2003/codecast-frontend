import Editor from "@monaco-editor/react";
import { useState, useRef, useEffect } from "react";
import { lang, AllTheme } from "../constant/lang_theme";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { initSocket } from "../../socket";

export default function CodeEditor({ socketRef, onCodeChange, onLangChange,onInputChange,onOutputChange }) {
  const { roomId, username } = useParams();
  const [theme, setTheme] = useState("vs-dark");
  const [langIdx, setlangIdx] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [input, setInput] = useState(``);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("code-change", ({ code }) => {
        // console.log(code);
        setCode(code);
      });

      socketRef.current.on("lang", ({ langInd }) => {
        setlangIdx(langInd);
      });

      socketRef.current.on("input-change", ({ inp }) => {
        setInput(inp);
      });

      socketRef.current.on("output-change", ({ out }) => {
        setOutput(out);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("code-change");
        socketRef.current.off("lang");
        socketRef.current.off("input-change");
        socketRef.current.off("output-change");
      }
    };
  }, [socketRef.current]);

  const handleCodeChange = (value) => {
    onCodeChange(value);
    // console.log(value);
    setCode(value);
    socketRef.current.emit("code-change", { roomId, code: value });
  };

  const handleLangChange = (e) => {
    onLangChange(e.target.value);
    setlangIdx(e.target.value);
    socketRef.current.emit("lang", { roomId, langInd: e.target.value });
  };

  const handleInputChange=(e)=>{
    onInputChange(e.target.value)
    setInput(e.target.value);
    socketRef.current.emit("input-change",{roomId,inp:e.target.value});
  }

  async function compile() {
    toast.success("compiling");
    setProcessing(true);
    const options = {
      method: "POST",
      url: import.meta.env.VITE_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RapidAPI_Host,
        "X-RapidAPI-Key": import.meta.env.VITE_RapidAPI_Key,
      },
      data: {
        language_id: lang[langIdx]?.id,
        source_code: btoa(code),
        stdin: btoa(input),
      },
    };
    try {
      // console.log("here");
      const response = await axios(options);
      console.log(response);
      const token = response.data.token;
      checkResponse(token);
    } catch (err) {
      let error = err.response ? err.response.data : err;
      let status = err.response.status;
      if (status === 429) {
        toast.error("You have reached your daily limit");
      } else {
        toast.error("some error while sending code to api");
      }
      console.log(err);
      setProcessing(false);
    }
  }

  async function checkResponse(token) {
    // console.log("hi from checkres");
    const options = {
      method: "GET",
      url: import.meta.env.VITE_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": import.meta.env.VITE_RapidAPI_Host,
        "X-RapidAPI-Key": import.meta.env.VITE_RapidAPI_Key,
      },
    };
    try {
      let response = await axios(options);
      console.log(response);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkResponse(token);
        }, 2000);
        return;
      } else {
        console.log("response.data", response.data);
        setProcessing(false);
        onOutputChange(response.data);
        setOutput(response.data);
        socketRef.current.emit("output-change",{roomId,out:response.data});

        return;
      }
    } catch (err) {
      console.log("err", err);
      toast.error("some error while getting code from api");
      setProcessing(false);
    }
  }

  return (
    <div className="w-7/12  h-screen">
      <Toaster></Toaster>
      <div
        style={{ width: "100%", height: "7%" }}
        className="flex flex-row justify-between items-center"
      >
        <div className="">
          <select
            className="mx-3 p-1 bg-gray-700 text-slate-50 hover:cursor-pointer rounded-lg text-sm"
            value={langIdx}
            onChange={handleLangChange}
          >
            {lang.map((lang, ind) => (
              <option key={lang.id} value={ind}>
                {lang.name}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-700 text-slate-50 mx-3 p-1 hover:cursor-pointer rounded-lg text-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {AllTheme.map((theme) => (
              <option key={theme.id}>{theme.name}</option>
            ))}
          </select>
        </div>

        <div className="mx-3 text-center">
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={compile}
          >
            Compile and Run
          </button>
        </div>
      </div>
      <div style={{ width: "100%", height: "70%" }}>
        <Editor
          theme={theme}
          onChange={handleCodeChange}
          language={lang[langIdx]?.value}
          value={code}
        ></Editor>
      </div>
      <div
        className="flex flex-row"
        style={{ height: "23%", width: "100%", borderTop: "1px solid white" }}
      >
        <div style={{ width: "50%", heigth: "100%" }}>
          <div className=" text-white ml-1">input</div>
          <textarea
            className="text-slate-100 text-xs overflow-auto ml-1 p-2 "
            style={{
              width: "100%",
              height: "80%",
              backgroundColor: "#1c1e29",
              border: "1px solid white",
            }}
            value={input}
            onChange={handleInputChange}
          ></textarea>
        </div>
        <div style={{ width: "50%", heigth: "100%" }}>
          <div className="text-white ml-2">output</div>
          <div
            className="ml-2 overflow-auto"
            style={{ width: "100%", height: "80%", border: "1px solid white" }}
          >
            {processing === true ? (
              <span className=" text-green-500 pl-1 pt-1">Compiling...</span>
            ) : (
              <ShowOutput output={output}></ShowOutput>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function ShowOutput({ output }) {
  let statusId = output?.status?.id;
  if (statusId === 6) {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className=" px-2 py-1 font-normal text-xs text-red-500"
      >
        {output?.compile_output ? atob(output?.compile_output) : ""}
      </pre>
    );
  } else if (statusId === 3) {
    return (
      <pre className=" px-2 py-1 font-normal text-xs text-green-500">
        {output?.stdout ? atob(output.stdout) : ""}
      </pre>
    );
  } else if (statusId === 5) {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className="px-2 py-1 font-normal text-xs text-red-500"
      >
        Time Limit Exceeded
      </pre>
    );
  } else {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className="px-2 py-1 font-normal text-xs text-red-500"
      >
        {output?.stderr ? atob(output?.stderr) : ""}
      </pre>
    );
  }
}
